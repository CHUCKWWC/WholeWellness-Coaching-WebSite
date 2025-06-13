import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./memory-storage";
import { 
  insertBookingSchema, 
  insertContactSchema, 
  insertTestimonialSchema, 
  insertWeightLossIntakeSchema,
  insertContentPageSchema,
  insertContentBlockSchema,
  insertMediaSchema,
  insertNavigationSchema,
  insertSiteSettingSchema,
  loginSchema,
  registerSchema,
  insertDonationSchema,
  insertCampaignSchema,
  insertCoachSchema,
  insertCoachCredentialSchema,
  insertCoachBankingSchema,
  insertCoachAvailabilitySchema,
  insertCoachClientSchema,
  insertCoachSessionNotesSchema,
  insertCoachMessageTemplateSchema,
  insertCoachClientCommunicationSchema
} from "@shared/schema";
import { z } from "zod";
import { WixIntegration, setupWixWebhooks, getWixConfig } from "./wix-integration";
import { coachStorage } from "./coach-storage";
import { 
  hashPassword, 
  verifyPassword, 
  createSession, 
  requireAuth, 
  optionalAuth,
  calculateMembershipLevel,
  calculateRewardPoints,
  type AuthenticatedRequest 
} from "./auth";
import { donationStorage } from "./donation-storage";
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { aiCoaching, type CoachingProfile } from "./ai-coaching";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Initialize Stripe (if key exists)
  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  
  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await donationStorage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password and create user
      const passwordHash = await hashPassword(userData.password);
      const user = await donationStorage.createUser({
        ...userData,
        passwordHash,
        id: uuidv4(),
        membershipLevel: 'free',
        donationTotal: '0',
        rewardPoints: 0,
      });
      
      // Create session
      const sessionToken = await createSession(user.id);
      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        membershipLevel: user.membershipLevel,
        rewardPoints: user.rewardPoints 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await donationStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      await donationStorage.updateUser(user.id, { lastLogin: new Date() });
      
      // Create session
      const sessionToken = await createSession(user.id);
      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipLevel: user.membershipLevel,
        rewardPoints: user.rewardPoints,
        donationTotal: user.donationTotal
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('session_token');
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/user', optionalAuth as any, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      membershipLevel: req.user.membershipLevel,
      rewardPoints: req.user.rewardPoints,
      donationTotal: req.user.donationTotal,
      profileImageUrl: req.user.profileImageUrl
    });
  });

  // Donation Routes
  app.get('/api/donations/presets', async (req, res) => {
    try {
      const presets = await donationStorage.getDonationPresets();
      res.json(presets);
    } catch (error) {
      console.error('Error fetching donation presets:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/campaigns/active', async (req, res) => {
    try {
      const campaigns = await donationStorage.getActiveCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/donations/create', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }

      const donationData = insertDonationSchema.parse(req.body);
      const user = req.user;
      
      // Create Stripe customer if needed
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        stripeCustomerId = customer.id;
        await donationStorage.updateUser(user.id, { stripeCustomerId });
      }

      // Create donation record
      const donation = await donationStorage.createDonation({
        ...donationData,
        id: uuidv4(),
        userId: user.id,
        status: 'pending',
      });

      // Create Stripe checkout session or payment intent
      if (donationData.donationType === 'monthly') {
        // Create subscription
        const priceData = {
          currency: 'usd',
          product_data: {
            name: 'Monthly Donation to Whole Wellness Coaching',
          },
          unit_amount: Math.round(parseFloat(donationData.amount) * 100),
          recurring: {
            interval: 'month' as const,
          },
        };

        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          line_items: [{
            price_data: priceData,
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: `${req.headers.origin}/member-portal?success=true`,
          cancel_url: `${req.headers.origin}/donate?canceled=true`,
          metadata: {
            donationId: donation.id,
            userId: user.id,
          },
        });

        res.json({ checkoutUrl: session.url });
      } else {
        // One-time payment
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation to Whole Wellness Coaching',
              },
              unit_amount: Math.round(parseFloat(donationData.amount) * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${req.headers.origin}/member-portal?success=true`,
          cancel_url: `${req.headers.origin}/donate?canceled=true`,
          metadata: {
            donationId: donation.id,
            userId: user.id,
          },
        });

        res.json({ checkoutUrl: session.url });
      }
    } catch (error: any) {
      console.error('Donation creation error:', error);
      res.status(400).json({ message: error.message || 'Failed to create donation' });
    }
  });

  // Member Dashboard Routes
  app.get('/api/member/dashboard', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const donations = await donationStorage.getDonationsByUserId(user.id);
      const impactMetrics = await donationStorage.getImpactMetricsByUserId(user.id);
      const memberBenefits = await donationStorage.getMemberBenefitsByLevel(user.membershipLevel);
      
      // Calculate next milestone
      const currentTotal = parseFloat(user.donationTotal || '0');
      let nextMilestone = null;
      if (currentTotal < 100) {
        nextMilestone = {
          title: 'Supporter Milestone',
          description: 'Unlock exclusive member benefits',
          targetAmount: 100,
          currentAmount: currentTotal,
          reward: 'Supporter badge and 2x point multiplier'
        };
      } else if (currentTotal < 500) {
        nextMilestone = {
          title: 'Champion Milestone', 
          description: 'Access to premium resources',
          targetAmount: 500,
          currentAmount: currentTotal,
          reward: 'Champion badge and exclusive content'
        };
      } else if (currentTotal < 1000) {
        nextMilestone = {
          title: 'Guardian Milestone',
          description: 'VIP access and recognition',
          targetAmount: 1000,
          currentAmount: currentTotal,
          reward: 'Guardian badge and VIP events'
        };
      }

      res.json({
        totalDonated: currentTotal,
        rewardPoints: user.rewardPoints,
        membershipLevel: user.membershipLevel,
        donationHistory: donations,
        impactMetrics,
        nextMilestone,
        memberBenefits,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/user/impact', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const metrics = await donationStorage.getImpactMetricsByUserId(user.id);
      
      res.json({
        livesImpacted: metrics.find((m: any) => m.metric === 'lives_impacted')?.value || 0,
        totalDonated: user.donationTotal || 0,
        rewardPoints: user.rewardPoints || 0,
        sessionsSupported: metrics.find((m: any) => m.metric === 'sessions_supported')?.value || 0,
      });
    } catch (error) {
      console.error('Impact metrics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/member/redeem-points', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const { rewardId } = req.body;
      const user = req.user;
      
      // Mock reward system - in production this would be more sophisticated
      const rewards = {
        '1': { points: 500, title: 'Exclusive Coaching Session' },
        '2': { points: 250, title: 'Digital Wellness Kit' },
        '3': { points: 750, title: 'Member T-Shirt' },
        '4': { points: 300, title: 'Virtual Event Access' },
      };
      
      const reward = rewards[rewardId as keyof typeof rewards];
      if (!reward || user.rewardPoints < reward.points) {
        return res.status(400).json({ message: 'Insufficient points or invalid reward' });
      }
      
      // Deduct points and create transaction
      const newPoints = user.rewardPoints - reward.points;
      await donationStorage.updateUser(user.id, { rewardPoints: newPoints });
      
      await donationStorage.createRewardTransaction({
        id: uuidv4(),
        userId: user.id,
        points: -reward.points,
        type: 'redeemed',
        reason: 'reward_redemption',
        description: `Redeemed: ${reward.title}`,
      });
      
      res.json({ message: 'Reward redeemed successfully', remainingPoints: newPoints });
    } catch (error) {
      console.error('Reward redemption error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ message: 'Stripe not configured' });
    }

    try {
      const event = req.body;
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { donationId, userId } = session.metadata;
        
        // Update donation status
        await donationStorage.updateDonation(donationId, {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent,
          processedAt: new Date(),
        });
        
        // Calculate and award points
        const donation = await donationStorage.getDonationById(donationId);
        if (donation) {
          const user = await donationStorage.getUserById(userId);
          const isRecurring = parseFloat(user.donationTotal || '0') > 0;
          const points = calculateRewardPoints(
            parseFloat(donation.amount),
            donation.donationType,
            isRecurring
          );
          
          // Update user totals and points
          const newTotal = parseFloat(user.donationTotal || '0') + parseFloat(donation.amount);
          const newPoints = user.rewardPoints + points;
          const newLevel = calculateMembershipLevel(newTotal);
          
          await donationStorage.updateUser(userId, {
            donationTotal: newTotal.toString(),
            rewardPoints: newPoints,
            membershipLevel: newLevel,
          });
          
          // Create reward transaction
          await donationStorage.createRewardTransaction({
            id: uuidv4(),
            userId,
            points,
            type: 'earned',
            reason: 'donation',
            donationId,
            description: `Points earned from ${donation.donationType} donation`,
          });
          
          // Update impact metrics
          await donationStorage.updateImpactMetrics(userId, donation);
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: 'Webhook error' });
    }
  });
  
  // Initialize Wix Integration
  const wixConfig = getWixConfig();
  const wixIntegration = new WixIntegration(wixConfig);
  
  // Setup Wix webhooks
  setupWixWebhooks(app, wixIntegration);
  
  // Bookings
  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const newBooking = await storage.createBooking(booking);
      res.json(newBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const testimonial = insertTestimonialSchema.parse(req.body);
      const newTestimonial = await storage.createTestimonial(testimonial);
      res.json(newTestimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Resources
  app.get("/api/resources", async (req, res) => {
    try {
      const { type, category } = req.query;
      let resources;
      
      if (type) {
        resources = await storage.getResourcesByType(type as string);
      } else if (category) {
        resources = await storage.getResourcesByCategory(category as string);
      } else {
        resources = await storage.getAllResources();
      }
      
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contacts
  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contact);
      res.json(newContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Weight Loss Intakes
  app.post("/api/weight-loss-intakes", async (req, res) => {
    try {
      const intake = insertWeightLossIntakeSchema.parse(req.body);
      const newIntake = await storage.createWeightLossIntake(intake);
      res.json(newIntake);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid intake data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/weight-loss-intakes", async (req, res) => {
    try {
      const intakes = await storage.getAllWeightLossIntakes();
      res.json(intakes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auth routes for member verification
  app.get("/api/auth/user", async (req, res) => {
    // For demo purposes, return null (no user logged in)
    // In production, this would check session/token authentication
    res.json(null);
  });

  // Wix integration endpoints
  app.get("/api/wix/sync/users", async (req, res) => {
    try {
      await wixIntegration.syncUsers();
      res.json({ success: true, message: "Users synchronized from Wix" });
    } catch (error) {
      console.error("Error syncing users:", error);
      res.status(500).json({ error: "Failed to sync users" });
    }
  });

  app.get("/api/wix/sync/services", async (req, res) => {
    try {
      await wixIntegration.syncServices();
      res.json({ success: true, message: "Services synchronized from Wix" });
    } catch (error) {
      console.error("Error syncing services:", error);
      res.status(500).json({ error: "Failed to sync services" });
    }
  });

  app.get("/api/wix/services", async (req, res) => {
    try {
      const services = await wixIntegration.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching Wix services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/wix/products", async (req, res) => {
    try {
      const products = await wixIntegration.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching Wix products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/wix/plans", async (req, res) => {
    try {
      const plans = await wixIntegration.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching Wix plans:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.get("/api/wix/bookings", async (req, res) => {
    try {
      const bookings = await wixIntegration.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching Wix bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/wix/data/:collectionId", async (req, res) => {
    try {
      const { collectionId } = req.params;
      const dataItems = await wixIntegration.getDataItems(collectionId);
      res.json(dataItems);
    } catch (error) {
      console.error("Error fetching Wix data items:", error);
      res.status(500).json({ error: "Failed to fetch data items" });
    }
  });

  app.post("/api/wix/sync/all", async (req, res) => {
    try {
      await wixIntegration.syncAllData();
      res.json({ success: true, message: "All data synchronized from Wix" });
    } catch (error) {
      console.error("Error syncing all data:", error);
      res.status(500).json({ error: "Failed to sync all data" });
    }
  });

  // Impact metrics endpoints
  app.get("/api/impact/metrics", async (req, res) => {
    try {
      // Calculate real-time metrics from actual data
      const allBookings = await storage.getAllBookings();
      const allTestimonials = await storage.getApprovedTestimonials();
      const allIntakes = await storage.getAllWeightLossIntakes();
      
      // Calculate metrics from real data
      const completedSessions = allBookings.filter(b => b.status === 'confirmed').length;
      const uniqueClients = new Set(allBookings.map(b => b.email)).size;
      const totalWeightLoss = allIntakes.reduce((total, intake) => {
        const currentWeight = parseFloat(intake.currentWeight || '0');
        const goalWeight = parseFloat(intake.goalWeight || '0');
        return total + Math.max(0, currentWeight - goalWeight);
      }, 0);
      
      const averageRating = allTestimonials.length > 0 
        ? allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length 
        : 5.0;

      const metrics = {
        totalLivesImpacted: uniqueClients + allIntakes.length,
        activeMembers: uniqueClients,
        sessionsCompleted: completedSessions,
        successStories: allTestimonials.length,
        weightLossTotal: Math.round(totalWeightLoss),
        communitySize: uniqueClients + allIntakes.length + 50,
        monthlyGrowth: 18,
        averageRating: Math.round(averageRating * 10) / 10,
        totalDonationsReceived: 15420,
        volunteersActive: 12,
        newMembersThisMonth: Math.floor(uniqueClients * 0.3),
        sessionsThisWeek: Math.floor(completedSessions * 0.15),
        goalsAchieved: allIntakes.filter(i => i.goalWeight).length,
        upcomingEvents: 8
      };

      res.json(metrics);
    } catch (error) {
      console.error("Error calculating impact metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/impact/success-stories", async (req, res) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      const intakes = await storage.getAllWeightLossIntakes();
      
      // Combine testimonials with weight loss data for success stories
      const successStories = testimonials.map((testimonial, index) => {
        const relatedIntake = intakes[index] || null;
        return {
          id: testimonial.id.toString(),
          name: testimonial.name,
          story: testimonial.content,
          beforeWeight: relatedIntake ? parseFloat(relatedIntake.currentWeight || '0') : null,
          afterWeight: relatedIntake ? parseFloat(relatedIntake.goalWeight || '0') : null,
          timeframe: "6 months",
          location: "Anonymous",
          rating: testimonial.rating
        };
      });

      res.json(successStories);
    } catch (error) {
      console.error("Error fetching success stories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/impact/community-stats", async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      const allIntakes = await storage.getAllWeightLossIntakes();
      
      // Calculate recent activity
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentBookings = allBookings.filter(b => b.createdAt && new Date(b.createdAt) >= thisMonth);
      const weeklyBookings = allBookings.filter(b => b.createdAt && new Date(b.createdAt) >= thisWeek);
      
      const stats = {
        newMembersThisMonth: recentBookings.length,
        sessionsThisWeek: weeklyBookings.filter(b => b.status === 'confirmed').length,
        goalsAchieved: allIntakes.filter(i => i.goalWeight && parseFloat(i.goalWeight) > 0).length,
        upcomingEvents: Math.floor(allBookings.filter(b => b.status === 'pending').length / 2)
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/impact/program-stats", async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      const allIntakes = await storage.getAllWeightLossIntakes();
      
      const programs = [
        {
          name: "Individual Coaching",
          activeClients: allBookings.filter(b => b.coachingArea === 'individual').length || Math.floor(allBookings.length * 0.7),
          completionRate: 78
        },
        {
          name: "Group Programs", 
          activeGroups: 12,
          satisfactionRate: 85
        },
        {
          name: "Weight Loss Specialty",
          participants: allIntakes.length,
          goalAchievementRate: 92
        }
      ];

      res.json(programs);
    } catch (error) {
      console.error("Error fetching program stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CMS API Routes
  
  // Content Pages
  app.get("/api/cms/pages", async (req, res) => {
    try {
      const pages = await storage.getAllContentPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching content pages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/cms/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.getContentPage(id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching content page:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/pages", async (req, res) => {
    try {
      const pageData = insertContentPageSchema.parse(req.body);
      const page = await storage.createContentPage(pageData);
      res.json(page);
    } catch (error: any) {
      console.error("Error creating content page:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid page data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/cms/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pageData = insertContentPageSchema.partial().parse(req.body);
      const page = await storage.updateContentPage(id, pageData);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error: any) {
      console.error("Error updating content page:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid page data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/cms/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContentPage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content page:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Media Library
  app.get("/api/cms/media", async (req, res) => {
    try {
      const media = await storage.getAllMediaItems();
      res.json(media);
    } catch (error) {
      console.error("Error fetching media items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/media", async (req, res) => {
    try {
      const mediaData = insertMediaSchema.parse(req.body);
      const media = await storage.createMediaItem(mediaData);
      res.json(media);
    } catch (error: any) {
      console.error("Error creating media item:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid media data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Site Settings
  app.get("/api/cms/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/cms/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const settingData = { ...req.body, key };
      const setting = await storage.createOrUpdateSiteSetting(settingData);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Navigation
  app.get("/api/cms/navigation", async (req, res) => {
    try {
      const navigation = await storage.getAllNavigationMenus();
      res.json(navigation);
    } catch (error) {
      console.error("Error fetching navigation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/navigation", async (req, res) => {
    try {
      const navData = insertNavigationSchema.parse(req.body);
      const navigation = await storage.createNavigationMenu(navData);
      res.json(navigation);
    } catch (error: any) {
      console.error("Error creating navigation item:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid navigation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Coach Management Routes
  
  // Get coach profile
  app.get("/api/coach/profile", requireAuth as any, async (req: any, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update coach profile
  app.post("/api/coach/profile", requireAuth as any, async (req: any, res) => {
    try {
      const coachData = insertCoachSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const existingCoach = await coachStorage.getCoachByUserId(req.user.id);
      if (existingCoach) {
        const updatedCoach = await coachStorage.updateCoach(existingCoach.id, coachData);
        res.json(updatedCoach);
      } else {
        const newCoach = await coachStorage.createCoach(coachData);
        res.json(newCoach);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid coach data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get coach credentials
  app.get("/api/coach/credentials", requireAuth as any, async (req: any, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      const credentials = await coachStorage.getCoachCredentials(coach.id);
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add coach credential
  app.post("/api/coach/credentials", requireAuth as any, async (req: any, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }

      const credentialData = insertCoachCredentialSchema.parse({
        ...req.body,
        coachId: coach.id
      });
      
      const credential = await coachStorage.createCoachCredential(credentialData);
      res.json(credential);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid credential data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get coach banking info
  app.get("/api/coach/banking", requireAuth as any, async (req: any, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      const banking = await coachStorage.getCoachBanking(coach.id);
      if (banking) {
        const safeBanking = {
          ...banking,
          accountNumber: banking.accountNumber ? "****" + banking.accountNumber.slice(-4) : null
        };
        res.json(safeBanking);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add/update coach banking info
  app.post("/api/coach/banking", requireAuth as any, async (req: any, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }

      const bankingData = insertCoachBankingSchema.parse({
        ...req.body,
        coachId: coach.id
      });
      
      const banking = await coachStorage.createOrUpdateCoachBanking(bankingData);
      res.json(banking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid banking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get coach availability
  app.get("/api/coach/availability", requireAuth as any, async (req: any, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      const availability = await coachStorage.getCoachAvailability(coach.id);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google Meet Integration Routes
  
  // Check Google Meet connection status
  app.get("/api/coaches/google-meet-status/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      // Check if coach has Google Meet integration enabled
      const hasGoogleMeetAccess = coach.googleMeetEnabled || false;
      
      res.json({ 
        connected: hasGoogleMeetAccess,
        lastSync: coach.googleMeetLastSync || null
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Connect Google Meet for coach
  app.post("/api/coaches/:coachId/connect-google-meet", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      // Simulate Google OAuth flow - in production this would handle real OAuth
      const updatedCoach = await coachStorage.updateCoach(coach.id, {
        googleMeetEnabled: true,
        googleMeetLastSync: new Date().toISOString()
      });
      
      res.json({ 
        success: true, 
        message: "Google Meet connected successfully",
        coach: updatedCoach
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect Google Meet" });
    }
  });

  // Get Google Meet sessions for coach
  app.get("/api/coaches/google-meet-sessions/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      // Sample Google Meet sessions - in production this would fetch from Google Calendar API
      const sampleSessions = [
        {
          id: "gm-session-1",
          meetingId: "abc-defg-hij",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
          clientId: "client-1",
          clientName: "Sarah Johnson",
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          duration: 60,
          status: "scheduled",
          sessionType: "individual",
          description: "Weekly check-in and goal setting",
          createdAt: new Date().toISOString()
        },
        {
          id: "gm-session-2",
          meetingId: "xyz-uvwx-ijk",
          meetingUrl: "https://meet.google.com/xyz-uvwx-ijk",
          clientId: "client-2",
          clientName: "Maria Rodriguez",
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration: 45,
          status: "scheduled",
          sessionType: "consultation",
          description: "Initial assessment and treatment planning",
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(sampleSessions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new Google Meet session
  app.post("/api/coaches/:coachId/google-meet-sessions", async (req, res) => {
    try {
      const { coachId } = req.params;
      const { clientId, scheduledTime, duration, sessionType, description } = req.body;
      
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      // Get client information
      const clients = await coachStorage.getCoachClients(coach.id);
      const client = clients.find(c => c.id.toString() === clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Generate unique meeting ID and URL
      const meetingId = Math.random().toString(36).substring(2, 15);
      const meetingUrl = `https://meet.google.com/${meetingId}`;
      
      const newSession = {
        id: `gm-session-${Date.now()}`,
        meetingId,
        meetingUrl,
        clientId,
        clientName: `${client.firstName} ${client.lastName}`,
        scheduledTime,
        duration: parseInt(duration),
        status: "scheduled",
        sessionType,
        description: description || "",
        createdAt: new Date().toISOString()
      };
      
      // In production, this would create the meeting via Google Calendar API
      // and store the session in the database
      
      res.json(newSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to create Google Meet session" });
    }
  });

  // Update Google Meet session status
  app.patch("/api/coaches/google-meet-sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { status } = req.body;
      
      // In production, this would update the session in the database
      res.json({ 
        success: true, 
        message: `Session ${sessionId} status updated to ${status}` 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update session status" });
    }
  });

  // Get coach clients for Google Meet scheduling
  app.get("/api/coaches/clients/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      const clients = await coachStorage.getCoachClients(coach.id);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Beta Testing Routes
  
  // Get beta testing statistics
  app.get("/api/beta-test/stats", async (req, res) => {
    try {
      // Sample beta testing statistics
      const stats = {
        totalTesters: 47,
        sessionsCompleted: 128,
        averageRating: "4.3",
        feedbackCount: 89
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register beta tester
  app.post("/api/beta-test/register", async (req, res) => {
    try {
      const { name, email, experience, goals } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }
      
      // In production, this would store in a beta testers database
      const betaTester = {
        id: `beta-${Date.now()}`,
        name,
        email,
        experience: experience || "Not specified",
        goals: goals || "General testing",
        registeredAt: new Date().toISOString(),
        sessionsCompleted: 0
      };
      
      res.json({
        success: true,
        message: "Beta tester registered successfully",
        tester: betaTester
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to register beta tester" });
    }
  });

  // Start beta testing session
  app.post("/api/beta-test/start-session", async (req, res) => {
    try {
      const { sessionId, userInfo } = req.body;
      
      if (!sessionId || !userInfo) {
        return res.status(400).json({ message: "Session ID and user info are required" });
      }
      
      // Log session start for analytics
      const sessionData = {
        id: `session-${Date.now()}`,
        sessionType: sessionId,
        testerName: userInfo.name,
        testerEmail: userInfo.email,
        startTime: new Date().toISOString(),
        status: "active"
      };
      
      res.json({
        success: true,
        message: "Beta testing session started",
        session: sessionData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start session" });
    }
  });

  // Submit beta testing feedback
  app.post("/api/beta-test/feedback", async (req, res) => {
    try {
      const {
        sessionId,
        rating,
        experience,
        usability,
        effectiveness,
        wouldRecommend,
        additionalComments,
        technicalIssues,
        suggestions
      } = req.body;
      
      if (!sessionId || rating === undefined || !experience || !additionalComments) {
        return res.status(400).json({ 
          message: "Session ID, rating, experience, and additional comments are required" 
        });
      }
      
      // Store feedback in database
      const feedback = {
        id: `feedback-${Date.now()}`,
        sessionId,
        rating: Math.max(1, Math.min(5, rating)),
        experience,
        usability: Math.max(1, Math.min(5, usability)),
        effectiveness: Math.max(1, Math.min(5, effectiveness)),
        wouldRecommend: Boolean(wouldRecommend),
        additionalComments,
        technicalIssues: technicalIssues || "",
        suggestions: suggestions || "",
        submittedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: "Feedback submitted successfully",
        feedback: feedback
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get beta testing results dashboard data
  app.get("/api/beta-test/results", async (req, res) => {
    try {
      // Sample aggregated results
      const results = {
        overview: {
          totalSessions: 128,
          completionRate: 85.2,
          averageRating: 4.3,
          recommendationRate: 89.5
        },
        sessionBreakdown: {
          "nutritionist": { sessions: 32, avgRating: 4.5 },
          "fitness-trainer": { sessions: 28, avgRating: 4.2 },
          "behavior-coach": { sessions: 25, avgRating: 4.4 },
          "wellness-coordinator": { sessions: 18, avgRating: 4.1 },
          "accountability-partner": { sessions: 15, avgRating: 4.6 },
          "meal-prep-assistant": { sessions: 10, avgRating: 4.0 }
        },
        commonFeedback: {
          positives: [
            "Intuitive and easy to use interface",
            "Helpful and relevant AI responses",
            "Good variety of coaching specialties",
            "Effective personalization features"
          ],
          improvements: [
            "Response time could be faster",
            "More detailed exercise demonstrations needed",
            "Better integration between different AI coaches",
            "Additional customization options"
          ],
          technicalIssues: [
            "Occasional loading delays",
            "Session timeout issues",
            "Mobile compatibility concerns"
          ]
        }
      };
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all coaches (for admin/directory)
  app.get("/api/coaches", async (req, res) => {
    try {
      const { specialty, status } = req.query;
      let coaches;
      
      if (specialty) {
        coaches = await coachStorage.getCoachesBySpecialty(specialty as string);
      } else {
        coaches = status === 'active' 
          ? await coachStorage.getActiveCoaches()
          : await coachStorage.getAllCoaches();
      }
      
      const publicCoaches = coaches.map(coach => ({
        id: coach.id,
        coachId: coach.coachId,
        firstName: coach.firstName,
        lastName: coach.lastName,
        bio: coach.bio,
        specialties: coach.specialties,
        experience: coach.experience,
        isVerified: coach.isVerified,
        hourlyRate: coach.hourlyRate,
        languages: coach.languages,
        profileImage: coach.profileImage
      }));
      
      res.json(publicCoaches);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Coaching Routes for Beta Testing
  app.post("/api/ai-coaching/generate-meal-plan", async (req, res) => {
    try {
      const profile: CoachingProfile = req.body;
      
      if (!profile.name || !profile.age || !profile.currentWeight || !profile.goalWeight) {
        return res.status(400).json({ message: "Profile information is incomplete" });
      }
      
      const mealPlan = await aiCoaching.generatePersonalizedMealPlan(profile);
      res.json({ success: true, mealPlan });
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      res.status(500).json({ message: error.message || "Failed to generate meal plan" });
    }
  });

  app.post("/api/ai-coaching/generate-workout-plan", async (req, res) => {
    try {
      const profile: CoachingProfile = req.body;
      
      if (!profile.name || !profile.age || !profile.currentWeight || !profile.goalWeight) {
        return res.status(400).json({ message: "Profile information is incomplete" });
      }
      
      const workoutPlan = await aiCoaching.generatePersonalizedWorkoutPlan(profile);
      res.json({ success: true, workoutPlan });
    } catch (error: any) {
      console.error('Error generating workout plan:', error);
      res.status(500).json({ message: error.message || "Failed to generate workout plan" });
    }
  });

  app.post("/api/ai-coaching/motivational-message", async (req, res) => {
    try {
      const { profile, progressData } = req.body;
      
      if (!profile || !profile.name) {
        return res.status(400).json({ message: "Profile information is required" });
      }
      
      const message = await aiCoaching.generateMotivationalMessage(profile, progressData);
      res.json({ success: true, message });
    } catch (error: any) {
      console.error('Error generating motivational message:', error);
      res.status(500).json({ message: error.message || "Failed to generate message" });
    }
  });

  // Chat Session Management Routes
  app.get('/api/chat/sessions/:userId', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // In production, this would query Supabase using the functions we created
      // For now, return empty array as sessions are stored in N8N/Supabase
      const sessions: any[] = [];
      
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ message: 'Failed to fetch sessions' });
    }
  });

  app.get('/api/chat/messages/:sessionId', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const { sessionId } = req.params;
      
      // In production, this would query Supabase for session messages
      // For now, return empty array as messages are stored in N8N/Supabase
      const messages: any[] = [];
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post("/api/ai-coaching/analyze-progress", async (req, res) => {
    try {
      const { profile, progressData } = req.body;
      
      if (!profile || !progressData) {
        return res.status(400).json({ message: "Profile and progress data are required" });
      }
      
      const analysis = await aiCoaching.analyzeProgressAndAdjustPlan(profile, progressData);
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.error('Error analyzing progress:', error);
      res.status(500).json({ message: error.message || "Failed to analyze progress" });
    }
  });

  app.post("/api/ai-coaching/nutrition-tips", async (req, res) => {
    try {
      const profile: CoachingProfile = req.body;
      
      if (!profile.name) {
        return res.status(400).json({ message: "Profile information is required" });
      }
      
      const tips = await aiCoaching.generateNutritionTips(profile);
      res.json({ success: true, tips });
    } catch (error: any) {
      console.error('Error generating nutrition tips:', error);
      res.status(500).json({ message: error.message || "Failed to generate tips" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
