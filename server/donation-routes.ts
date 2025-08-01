import { Router } from "express";
import { storage } from "./supabase-client-storage";
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "./auth";
import Stripe from 'stripe';
import { z } from "zod";
import { paymentLimiter, strictApiLimiter } from "./security";
import { logPaymentEvent, logSecurityEvent } from "./logger";
import { 
  successResponse, 
  errorResponse, 
  PaymentError, 
  ValidationError,
  asyncHandler 
} from "./error-handler";
import crypto from 'crypto';

const router = Router();

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

// Get donation presets
router.get('/donation-presets', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const presets = await storage.getDonationPresets();
  
  // Add admin test item if user is authenticated and is admin
  let finalPresets = [...presets];
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    finalPresets.unshift({
      id: 'admin-test-1',
      amount: 1,
      label: 'Admin Test',
      description: 'Test payment for $1.00 - Admin Only',
      icon: 'test',
      isPopular: false,
      isAdminOnly: true
    });
  }
  
  res.json(successResponse(finalPresets));
}));

// Get active campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await storage.getActiveCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get membership benefits
router.get('/membership-benefits', async (req, res) => {
  try {
    const benefits = await storage.getMembershipBenefits();
    res.json(benefits);
  } catch (error) {
    console.error('Error fetching membership benefits:', error);
    res.status(500).json({ error: 'Failed to fetch membership benefits' });
  }
});

// Get impact metrics
router.get('/impact-metrics', async (req, res) => {
  try {
    const metrics = await storage.getImpactMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching impact metrics:', error);
    res.status(500).json({ error: 'Failed to fetch impact metrics' });
  }
});

// Get user donations (authenticated route)
router.get('/user/donations', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const donations = await storage.getUserDonations(userId);
    res.json(donations);
  } catch (error) {
    console.error('Error fetching user donations:', error);
    res.status(500).json({ error: 'Failed to fetch user donations' });
  }
});

// Create donation
const createDonationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  donationType: z.enum(["one-time", "monthly", "yearly"]),
  paymentMethod: z.enum(["stripe", "paypal", "bank"]),
  campaignId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  dedicatedTo: z.string().optional(),
  message: z.string().optional()
});

router.post('/donations', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const donationData = createDonationSchema.parse(req.body);
    
    if (!stripe && donationData.paymentMethod === 'stripe') {
      return res.status(400).json({ error: 'Stripe payment processing is not configured' });
    }
    
    // Create donation record
    const donation = await storage.createDonation({
      ...donationData,
      userId,
      status: 'pending'
    });
    
    let paymentUrl: string | null = null;
    
    // Process payment based on method
    if (donationData.paymentMethod === 'stripe' && stripe) {
      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: donationData.currency.toLowerCase(),
              product_data: {
                name: `Donation to WholeWellness Coaching`,
                description: donationData.message || 'Supporting life coaching for those in need',
              },
              unit_amount: Math.round(donationData.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: donationData.donationType === 'one-time' ? 'payment' : 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/donate`,
        metadata: {
          donationId: donation.id,
          userId: userId,
        },
      });
      
      paymentUrl = session.url;
      
      // Update donation with Stripe session ID
      await storage.updateDonation(donation.id, {
        stripePaymentIntentId: session.id
      });
    }
    
    res.json({
      donation,
      paymentUrl
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Stripe webhook handler
router.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.donationId) {
          // Update donation status
          await storage.updateDonation(session.metadata.donationId, {
            status: 'completed',
            processedAt: new Date()
          });
          
          // Calculate and add reward points
          const amount = session.amount_total ? session.amount_total / 100 : 0;
          const rewardPoints = Math.floor(amount * 10); // 10 points per dollar
          
          if (session.metadata.userId && rewardPoints > 0) {
            await storage.addRewardPoints(
              session.metadata.userId,
              rewardPoints,
              `Donation reward: $${amount}`
            );
          }
          
          // Update user membership level
          if (session.metadata.userId) {
            await storage.updateUserMembershipLevel(session.metadata.userId);
          }
        }
        break;
        
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.donationId) {
          await storage.updateDonation(paymentIntent.metadata.donationId, {
            status: 'failed'
          });
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get donation success details
router.get('/donation-success', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const sessionId = req.query.session_id as string;
    
    if (!sessionId || !stripe) {
      return res.status(400).json({ error: 'Invalid session' });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const donation = await storage.getDonationByStripeSession(sessionId);
    
    res.json({
      session,
      donation,
      success: true
    });
  } catch (error) {
    console.error('Error fetching donation success:', error);
    res.status(500).json({ error: 'Failed to fetch donation details' });
  }
});

// Campaign management (admin routes)
router.post('/campaigns', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const campaignData = {
      ...req.body,
      createdBy: userId
    };
    
    const campaign = await storage.createCampaign(campaignData);
    res.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.put('/campaigns/:campaignId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { campaignId } = req.params;
    const updateData = req.body;
    
    const campaign = await storage.updateCampaign(campaignId, updateData);
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Donation analytics
router.get('/analytics/overview', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const [
      totalRaised,
      totalDonors,
      averageDonation,
      monthlyTrend,
      topCampaigns,
      membershipDistribution
    ] = await Promise.all([
      storage.getTotalDonationsRaised(),
      storage.getTotalDonors(),
      storage.getAverageDonationAmount(),
      storage.getMonthlyDonationTrend(),
      storage.getTopCampaigns(),
      storage.getMembershipDistribution()
    ]);
    
    res.json({
      totalRaised,
      totalDonors,
      averageDonation,
      monthlyTrend,
      topCampaigns,
      membershipDistribution
    });
  } catch (error) {
    console.error('Error fetching donation analytics:', error);
    res.status(500).json({ error: 'Failed to fetch donation analytics' });
  }
});

// User's impact dashboard
router.get('/user/impact', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const [
      totalContributed,
      rewardPoints,
      membershipLevel,
      impactMetrics,
      donationHistory,
      availableRewards
    ] = await Promise.all([
      storage.getUserTotalContributed(userId),
      storage.getUserRewardPoints(userId),
      storage.getUserMembershipLevel(userId),
      storage.getUserImpactMetrics(userId),
      storage.getUserDonationHistory(userId),
      storage.getAvailableRewards(userId)
    ]);
    
    res.json({
      totalContributed,
      rewardPoints,
      membershipLevel,
      impactMetrics,
      donationHistory,
      availableRewards
    });
  } catch (error) {
    console.error('Error fetching user impact:', error);
    res.status(500).json({ error: 'Failed to fetch user impact data' });
  }
});

// Redeem reward points
router.post('/rewards/redeem', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { rewardId, pointsCost } = req.body;
    
    const userPoints = await storage.getUserRewardPoints(userId);
    
    if (userPoints < pointsCost) {
      return res.status(400).json({ error: 'Insufficient reward points' });
    }
    
    const redemption = await storage.redeemRewardPoints(userId, rewardId, pointsCost);
    res.json(redemption);
  } catch (error) {
    console.error('Error redeeming reward points:', error);
    res.status(500).json({ error: 'Failed to redeem reward points' });
  }
});

// Monthly giving management
router.post('/subscriptions/pause', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { subscriptionId } = req.body;
    
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'mark_uncollectible',
      },
    });
    
    await storage.updateDonationSubscription(userId, subscriptionId, { status: 'paused' });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ error: 'Failed to pause subscription' });
  }
});

router.post('/subscriptions/resume', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { subscriptionId } = req.body;
    
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    });
    
    await storage.updateDonationSubscription(userId, subscriptionId, { status: 'active' });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

router.delete('/subscriptions/:subscriptionId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { subscriptionId } = req.params;
    
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    await stripe.subscriptions.del(subscriptionId);
    await storage.updateDonationSubscription(userId, subscriptionId, { status: 'cancelled' });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Payment validation schema
const paymentIntentSchema = z.object({
  amount: z.number().min(1).max(100000), // $1 to $1000
  currency: z.enum(['usd']).default('usd'),
  description: z.string().max(500).optional()
});

// Admin test payment endpoint with enhanced security
router.post('/admin-test-payment', paymentLimiter, requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  
  // Check if user is admin
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    logSecurityEvent('unauthorized_admin_payment_attempt', { userId: user.id }, req);
    throw new ValidationError('Admin access required');
  }
  
  if (!stripe) {
    throw new PaymentError('Payment system not configured');
  }

  // Generate idempotency key to prevent duplicate payments
  const idempotencyKey = crypto.randomUUID();

  // Create a $1.00 test payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100, // $1.00 in cents
    currency: 'usd',
    description: 'Admin Test Payment - $1.00',
    metadata: {
      isTestPayment: 'true',
      adminId: user.id,
      adminEmail: user.email,
      testTimestamp: new Date().toISOString()
    },
  }, {
    idempotencyKey
  });

  // Log the payment creation
  logPaymentEvent('admin_test_payment_created', {
    paymentIntentId: paymentIntent.id,
    amount: 1.00,
    adminId: user.id
  }, user.id);

  res.json(successResponse({ 
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: 1.00,
    description: 'Admin Test Payment - $1.00'
  }));
}));

// Stripe webhook endpoint with signature verification
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    logSecurityEvent('stripe_webhook_no_secret', {}, req);
    return res.status(400).json(errorResponse('Webhook secret not configured'));
  }

  let event;

  try {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
  } catch (err: any) {
    logSecurityEvent('stripe_webhook_verification_failed', { error: err.message }, req);
    return res.status(400).json(errorResponse(`Webhook signature verification failed: ${err.message}`));
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logPaymentEvent('payment_succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        });
        
        // Handle successful payment
        if (paymentIntent.metadata?.isTestPayment === 'true') {
          logPaymentEvent('admin_test_payment_succeeded', {
            paymentIntentId: paymentIntent.id,
            adminId: paymentIntent.metadata.adminId
          });
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        logPaymentEvent('payment_failed', {
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error,
          metadata: failedPayment.metadata
        });
        break;
        
      default:
        logPaymentEvent('unhandled_webhook_event', { type: event.type });
    }

    res.json(successResponse({ received: true }));
  } catch (error: any) {
    logPaymentEvent('webhook_processing_error', { 
      eventType: event.type, 
      error: error.message 
    });
    res.status(500).json(errorResponse('Webhook processing failed'));
  }
});

export { router as donationRoutes };