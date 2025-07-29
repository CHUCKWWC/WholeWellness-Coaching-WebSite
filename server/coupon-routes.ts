import type { Express } from "express";
import { storage } from "./supabase-client-storage";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { z } from "zod";
import Stripe from 'stripe';

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

// Validation schemas
const validateCouponSchema = z.object({
  code: z.string().min(1),
  courseId: z.string().optional(),
});

const redeemCouponSchema = z.object({
  code: z.string().min(1),
  courseId: z.string(),
  paymentIntentId: z.string().optional(),
});

const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_access']),
  discountValue: z.number().min(0).optional(),
  maxUses: z.number().int().min(1).optional(),
  applicableCourses: z.array(z.string()).optional(),
  minimumOrderAmount: z.number().min(0).default(0),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    name: string;
    description: string;
    discount_type: string;
    discount_value: number;
    minimum_order_amount: number;
  };
}

interface CourseEnrollmentPayment {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'coupon' | 'admin_grant';
  paymentIntentId?: string;
  couponRedemptionId?: string;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export function setupCouponRoutes(app: Express) {

  // ===========================================
  // COUPON VALIDATION ENDPOINTS
  // ===========================================

  // Validate a coupon code
  app.post('/api/coupons/validate', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { code, courseId } = validateCouponSchema.parse(req.body);
      const userId = req.user.id;

      // Call database function to validate coupon
      const result = await storage.query(`
        SELECT validate_coupon($1, $2, $3) as validation_result
      `, [code, courseId || null, userId]);

      const validationResult: CouponValidationResult = result.rows[0]?.validation_result;

      if (!validationResult.valid) {
        return res.status(400).json({
          valid: false,
          error: validationResult.error
        });
      }

      res.json({
        valid: true,
        coupon: validationResult.coupon
      });
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      res.status(500).json({ 
        valid: false,
        error: 'Failed to validate coupon' 
      });
    }
  });

  // Calculate discount amount for a course
  app.post('/api/coupons/calculate-discount', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { code, courseId, originalAmount } = req.body;

      if (!code || !courseId || !originalAmount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate coupon first
      const validationResult = await storage.query(`
        SELECT validate_coupon($1, $2, $3) as validation_result
      `, [code, courseId, req.user.id]);

      const validation: CouponValidationResult = validationResult.rows[0]?.validation_result;

      if (!validation.valid || !validation.coupon) {
        return res.status(400).json({ error: validation.error });
      }

      const coupon = validation.coupon;
      let discountAmount = 0;
      let finalAmount = originalAmount;

      // Calculate discount based on type
      switch (coupon.discount_type) {
        case 'percentage':
          discountAmount = (originalAmount * coupon.discount_value) / 100;
          finalAmount = originalAmount - discountAmount;
          break;
        case 'fixed_amount':
          discountAmount = Math.min(coupon.discount_value, originalAmount);
          finalAmount = originalAmount - discountAmount;
          break;
        case 'free_access':
          discountAmount = originalAmount;
          finalAmount = 0;
          break;
      }

      // Check minimum order amount
      if (originalAmount < coupon.minimum_order_amount) {
        return res.status(400).json({ 
          error: `Minimum order amount of $${coupon.minimum_order_amount} required for this coupon` 
        });
      }

      res.json({
        originalAmount,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        finalAmount: Math.round(finalAmount * 100) / 100,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description
        }
      });
    } catch (error: any) {
      console.error('Error calculating discount:', error);
      res.status(500).json({ error: 'Failed to calculate discount' });
    }
  });

  // ===========================================
  // COURSE ENROLLMENT WITH PAYMENT/COUPON
  // ===========================================

  // Enroll in course with payment verification or coupon
  app.post('/api/courses/enroll-with-payment', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { courseId, couponCode, paymentIntentId } = req.body;
      const userId = req.user.id;

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      // Get course details (mock data for now)
      const courses = [
        {
          id: "course-1",
          title: "Advanced Wellness Coaching Certification",
          price: 799.00
        },
        {
          id: "course-2", 
          title: "Nutrition Coaching Fundamentals",
          price: 599.00
        },
        {
          id: "course-3",
          title: "Relationship Counseling Techniques",
          price: 1299.00
        },
        {
          id: "course-4",
          title: "Behavior Modification Strategies",
          price: 699.00
        }
      ];

      const course = courses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      let finalAmount = course.price;
      let paymentMethod: 'stripe' | 'coupon' | 'admin_grant' = 'stripe';
      let couponRedemptionId: string | null = null;
      let discountAmount = 0;

      // Handle coupon redemption
      if (couponCode) {
        // Validate and calculate discount
        const validationResult = await storage.query(`
          SELECT validate_coupon($1, $2, $3) as validation_result
        `, [couponCode, courseId, userId]);

        const validation: CouponValidationResult = validationResult.rows[0]?.validation_result;

        if (!validation.valid || !validation.coupon) {
          return res.status(400).json({ error: validation.error });
        }

        const coupon = validation.coupon;

        // Calculate discount
        switch (coupon.discount_type) {
          case 'percentage':
            discountAmount = (course.price * coupon.discount_value) / 100;
            finalAmount = course.price - discountAmount;
            break;
          case 'fixed_amount':
            discountAmount = Math.min(coupon.discount_value, course.price);
            finalAmount = course.price - discountAmount;
            break;
          case 'free_access':
            discountAmount = course.price;
            finalAmount = 0;
            paymentMethod = 'coupon';
            break;
        }

        // Create coupon redemption record
        const redemptionResult = await storage.query(`
          INSERT INTO coupon_redemptions (
            coupon_id, user_id, course_id, original_amount, 
            discount_amount, final_amount, payment_intent_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          coupon.id, userId, courseId, course.price, 
          discountAmount, finalAmount, paymentIntentId || null
        ]);

        couponRedemptionId = redemptionResult.rows[0].id;

        // Update coupon usage count
        await storage.query(`SELECT update_coupon_usage($1)`, [coupon.id]);
      }

      // Verify payment if required
      if (finalAmount > 0 && paymentMethod === 'stripe') {
        if (!paymentIntentId || !stripe) {
          return res.status(400).json({ error: 'Payment verification required' });
        }

        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          
          if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed' });
          }

          if (paymentIntent.amount !== Math.round(finalAmount * 100)) {
            return res.status(400).json({ error: 'Payment amount mismatch' });
          }
        } catch (stripeError) {
          console.error('Stripe verification error:', stripeError);
          return res.status(400).json({ error: 'Payment verification failed' });
        }
      }

      // Create enrollment
      const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record
      const paymentRecord: Partial<CourseEnrollmentPayment> = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        enrollmentId,
        userId,
        courseId,
        amount: course.price,
        currency: 'usd',
        paymentMethod,
        paymentIntentId: paymentIntentId || null,
        couponRedemptionId,
        paymentStatus: finalAmount === 0 ? 'succeeded' : 'succeeded', // Assume success for verified payments
        metadata: {
          originalAmount: course.price,
          discountAmount,
          finalAmount,
          couponCode: couponCode || null
        }
      };

      // In production, save to database
      // For now, return mock enrollment
      const enrollment = {
        id: enrollmentId,
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        status: 'enrolled',
        progress: 0,
        currentModule: 1,
        completedModules: [],
        paymentStatus: 'paid',
        paymentRecord
      };

      res.json({ 
        success: true, 
        enrollment,
        paymentSummary: {
          originalAmount: course.price,
          discountAmount,
          finalAmount,
          paymentMethod,
          couponCode: couponCode || null
        }
      });
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ error: 'Failed to enroll in course' });
    }
  });

  // ===========================================
  // ENROLLMENT VERIFICATION
  // ===========================================

  // Verify enrollment and payment status for module access
  app.get('/api/courses/verify-enrollment/:courseId/:enrollmentId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { courseId, enrollmentId } = req.params;
      const userId = req.user.id;

      // Check if user has valid payment record for this enrollment
      const paymentRecord = await storage.query(`
        SELECT * FROM course_enrollment_payments 
        WHERE enrollment_id = $1 AND user_id = $2 AND course_id = $3 AND payment_status = 'succeeded'
      `, [enrollmentId, userId, courseId]);

      if (paymentRecord.rows.length === 0) {
        return res.json({
          hasAccess: false,
          message: "No valid payment found for this enrollment. Please complete payment or apply a coupon."
        });
      }

      const payment = paymentRecord.rows[0];
      
      res.json({
        hasAccess: true,
        paymentMethod: payment.payment_method,
        enrollmentId: payment.enrollment_id,
        message: "Access granted"
      });
    } catch (error: any) {
      console.error('Error verifying enrollment:', error);
      
      // For development/demo purposes, allow access if no database connection
      res.json({
        hasAccess: true,
        paymentMethod: 'demo',
        message: "Demo access granted"
      });
    }
  });

  // ===========================================
  // ADMIN COUPON MANAGEMENT
  // ===========================================

  // Get all coupons (admin only)
  app.get('/api/admin/coupons', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Mock coupon data for now
      const coupons = [
        {
          id: 'coupon-1',
          code: 'WELCOME25',
          name: '25% Off Welcome Discount',
          description: 'New user welcome discount - 25% off any certification course',
          discountType: 'percentage',
          discountValue: 25.00,
          maxUses: 100,
          currentUses: 15,
          applicableCourses: null,
          minimumOrderAmount: 0,
          startsAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'coupon-2',
          code: 'FREEACCESS',
          name: 'Free Course Access',
          description: 'Admin-granted free access to certification courses',
          discountType: 'free_access',
          discountValue: null,
          maxUses: null,
          currentUses: 5,
          applicableCourses: null,
          minimumOrderAmount: 0,
          startsAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      res.json(coupons);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  });

  // Create new coupon (admin only)
  app.post('/api/admin/coupons', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const couponData = createCouponSchema.parse(req.body);
      
      // Mock coupon creation
      const newCoupon = {
        id: `coupon-${Date.now()}`,
        ...couponData,
        currentUses: 0,
        isActive: true,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json({ success: true, coupon: newCoupon });
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid coupon data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create coupon' });
    }
  });

  // Update coupon (admin only)
  app.put('/api/admin/coupons/:couponId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { couponId } = req.params;
      const updates = req.body;

      // Mock coupon update
      const updatedCoupon = {
        id: couponId,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      res.json({ success: true, coupon: updatedCoupon });
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      res.status(500).json({ error: 'Failed to update coupon' });
    }
  });

  // Delete/deactivate coupon (admin only)
  app.delete('/api/admin/coupons/:couponId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { couponId } = req.params;

      // Mock coupon deactivation
      res.json({ success: true, message: 'Coupon deactivated successfully' });
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ error: 'Failed to delete coupon' });
    }
  });

  // Get coupon usage statistics (admin only)
  app.get('/api/admin/coupons/:couponId/stats', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { couponId } = req.params;

      // Mock coupon statistics
      const stats = {
        couponId,
        totalRedemptions: 15,
        totalDiscountGiven: 2985.00,
        averageDiscountPerRedemption: 199.00,
        topCourses: [
          { courseId: 'course-1', title: 'Advanced Wellness Coaching', redemptions: 8 },
          { courseId: 'course-2', title: 'Nutrition Coaching', redemptions: 7 }
        ],
        recentRedemptions: [
          {
            id: 'redemption-1',
            userId: 'user-123',
            courseId: 'course-1',
            discountAmount: 199.75,
            redeemedAt: new Date().toISOString()
          }
        ]
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching coupon stats:', error);
      res.status(500).json({ error: 'Failed to fetch coupon statistics' });
    }
  });

  // Grant free access to specific user (admin only)
  app.post('/api/admin/grant-free-access', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, courseId, reason } = req.body;

      if (!userId || !courseId) {
        return res.status(400).json({ error: 'User ID and Course ID are required' });
      }

      // Create admin grant enrollment
      const enrollmentId = `admin-grant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const enrollment = {
        id: enrollmentId,
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        status: 'enrolled',
        progress: 0,
        currentModule: 1,
        completedModules: [],
        paymentStatus: 'admin_granted',
        grantedBy: req.user.id,
        grantReason: reason || 'Admin granted free access'
      };

      res.json({ 
        success: true, 
        enrollment,
        message: 'Free access granted successfully'
      });
    } catch (error: any) {
      console.error('Error granting free access:', error);
      res.status(500).json({ error: 'Failed to grant free access' });
    }
  });
}