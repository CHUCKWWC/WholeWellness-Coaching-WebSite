import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./app-storage";
import { db } from "./db";
import { emailService } from "./email-service";
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
  insertClientGoalSchema,
  insertCoachMessageTemplateSchema,
  insertCoachClientCommunicationSchema,
  insertEventSchema,
  insertEventRegistrationSchema,
  insertBookingCategorySchema,
  insertBookingServiceSchema,
  insertCoachScheduleSchema,
  insertCoachBlockedTimesSchema,
  insertAppointmentSchema,
  profileUpdateSchema
} from "@shared/schema";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { WixIntegration, setupWixWebhooks, getWixConfig } from "./wix-integration";
import { coachStorage } from "./coach-storage";
import { 
  requireAuth as auth1, 
  requireCoachRole as coach1,
  optionalAuth as opt1,
  type AuthenticatedRequest as AuthReq1 
} from "./auth";
import { donationStorage } from "./donation-storage";
import aiChatRoutes from "./ai-chat-routes";
import chatDigestRoutes from "./chat-digest-routes";
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { aiCoaching, type CoachingProfile } from "./ai-coaching";
import { adminRoutes } from "./admin-routes";
import { CoachEarningsSystem } from "./coach-earnings-system";
import { coachRoutes } from "./coach-routes";
import { donationRoutes } from "./donation-routes";
import registerOnboardingRoutes from "./onboarding-routes";
import { setupCouponRoutes } from "./coupon-routes";
import { onboardingNewRoutes } from "./onboarding-new-routes";
import { authLimiter } from "./security";
import { assessmentRoutes } from "./assessment-routes";
import { requireAuth, requireCoachRole, optionalAuth, type AuthenticatedRequest, AuthService } from "./auth";
import { coachSessionNotes, chatSummaries } from "@shared/schema";
// Admin auth now uses OAuth only - no password login exports

// Sample resources seeding function
async function seedSampleResources(storage: any) {
  const sampleResources = [
    {
      title: "Building Resilience After Trauma",
      type: "article",
      category: "Mental Health", 
      content: "Learn evidence-based strategies for rebuilding emotional strength after trauma. Includes grounding techniques, self-care practices, and professional help guidance.",
      url: null,
      isFree: true
    },
    {
      title: "5 Steps to Setting Healthy Boundaries",
      type: "article",
      category: "Relationships",
      content: "Establish and maintain healthy boundaries in relationships. Includes conversation scripts and consistency strategies.",
      url: null,
      isFree: true
    },
    {
      title: "Guided Meditation for Anxiety Relief",
      type: "video",
      category: "Mental Health",
      content: "15-minute guided meditation for calming anxiety and creating inner peace. Perfect for daily practice.",
      url: "https://example.com/meditation-anxiety",
      isFree: true
    },
    {
      title: "Daily Self-Care Checklist",
      type: "worksheet", 
      category: "Personal Development",
      content: "Printable daily checklist covering physical, emotional, mental, and spiritual wellness activities.",
      url: "/downloads/self-care-checklist.pdf",
      isFree: true
    },
    {
      title: "Goal Setting Workbook",
      type: "worksheet",
      category: "Personal Development", 
      content: "Comprehensive workbook with vision board templates, action plans, and progress tracking tools.",
      url: "/downloads/goal-setting-workbook.pdf",
      isFree: true
    },
    {
      title: "Healing from Domestic Violence - Episode 1",
      type: "podcast",
      category: "Mental Health",
      content: "Survivor stories and expert guidance on recovery journey. Includes immediate support resources.",
      url: "https://example.com/podcast/healing-dv-ep1", 
      isFree: true
    }
  ];

  for (const resource of sampleResources) {
    try {
      await storage.createResource(resource);
    } catch (error) {
      console.error('Error creating sample resource:', error);
    }
  }
}
import { onboardingService } from "./onboarding-service";
import { registerAdminCertificationRoutes } from "./admin-certification-routes";
// Google Drive service initialized below
import { supabase } from "./supabase";
import bcrypt from 'bcrypt';
import { recommendationEngine, type UserProfile, type RecommendationContext } from './recommendation-engine';
import { createTestCoach } from './create-coach-endpoint';
import passport from "passport";
import session from "express-session";
import { setupGoogleAuth, generateGoogleAuthToken } from "./google-auth";
import { GoogleDriveService, type DriveFile, type CourseMaterial } from "./google-drive-service";
import { googleDriveDemoService } from "./google-drive-demo";
import { registerWellnessJourneyRoutes } from "./wellness-journey-routes";
import videoRoutes from "./video-routes";
import eventsRoutes from "./events-routes";
import { migrateVideoSchema } from "./migrate-video-schema";
// import { migrateChatSchema } from "./migrate-chat-schema"; // TEMPORARILY DISABLED - file missing

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Video schema migration temporarily disabled due to SASL authentication errors
  // The video schema is defined in shared/schema.ts but deployment is blocked by Supabase pooler compatibility issues
  // Tables will be automatically created once database authentication is resolved or HMS credentials are configured
  // migrateVideoSchema().catch(err => {
  //   console.error('Failed to migrate video schema:', err);
  // });

  // Chat schema migration - creates tables for conversation intelligence features
  // TEMPORARILY DISABLED - migrate-chat-schema file missing
  // migrateChatSchema().catch(err => {
  //   console.error('Failed to migrate chat schema:', err);
  // });
  
  // Google Drive course materials endpoint - PRIORITY ROUTE (must be first)
  app.get("/api/public/course-materials/:courseId", async (req: any, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      
      if (isNaN(courseIdNum) || courseIdNum < 1 || courseIdNum > 3) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid course ID" 
        });
      }

      // Use the shared Google Drive folder provided by user
      const sharedFolderId = '1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya';
      
      const courseTitles = {
        1: "Introduction to Wellness Coaching",
        2: "Advanced Nutrition Fundamentals", 
        3: "Relationship Counseling Fundamentals"
      };

      return res.json({
        success: true,
        courseId: courseIdNum,
        courseTitle: courseTitles[courseIdNum as keyof typeof courseTitles],
        folderId: sharedFolderId,
        folderUrl: `https://drive.google.com/drive/folders/${sharedFolderId}`,
        message: "Access shared course materials directly through Google Drive",
        materials: []
      });
    } catch (error) {
      console.error("Error fetching course materials:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to fetch course materials" 
      });
    }
  });

  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Session configuration for OAuth
  app.use(session({
    secret: process.env.SESSION_SECRET || 'wholewellness-oauth-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Initialize Passport and session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup Google OAuth
  setupGoogleAuth();
  
  // Initialize Google Drive service
  const googleDriveService = new GoogleDriveService();
  
  // Initialize Stripe (if key exists)
  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  } else {
    console.warn('Stripe secret key not found. Payment features will be disabled.');
  }

  // Session management functions
  async function createSession(userId: string): Promise<string> {
    const user = await storage.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user',
      membershipLevel: user.membershipLevel || 'free',
      isActive: user.isActive !== false
    });
    
    return token;
  }

  async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return AuthService.comparePassword(password, hashedPassword);
  }

  async function hashPassword(password: string): Promise<string> {
    return AuthService.hashPassword(password);
  }
  
  // Authentication Routes
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password and create user
      const passwordHash = await hashPassword(userData.password);
      const { phone, onboardingData, ...createUserData } = req.body;
      const user = await storage.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        id: uuidv4(),
        membershipLevel: 'free',
        donationTotal: '0',
        rewardPoints: 0,
        phone: phone || null,
      });

      // Save onboarding data if provided
      if (onboardingData) {
        // TODO: Implement onboarding data saving
        // await onboardingService.saveOnboardingData(user.id, onboardingData);
      }
      
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
        rewardPoints: user.rewardPoints,
        hasCompletedOnboarding: user.hasCompletedOnboarding || false
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Special handling for test coach account
      if (email === 'chuck@wholewellness-coaching.org' && password === 'chucknice1') {
        const testCoachId = 'coach_chuck_test';
        const sessionToken = AuthService.generateToken({
          id: testCoachId,
          email: 'chuck@wholewellness-coaching.org',
          firstName: 'Chuck',
          lastName: 'TestCoach',
          role: 'coach',
        });
        
        res.cookie('session_token', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        return res.json({
          id: testCoachId,
          email: 'chuck@wholewellness-coaching.org',
          firstName: 'Chuck',
          lastName: 'TestCoach',
          membershipLevel: 'coach',
          rewardPoints: 0,
          donationTotal: '0',
          role: 'coach'
        });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
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
        donationTotal: user.donationTotal,
        hasCompletedOnboarding: user.hasCompletedOnboarding || false,
        token: sessionToken // Include token in response for API testing
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

  // Create test coach account endpoint
  app.post('/api/create-test-coach', createTestCoach);

  // Coach earnings tracking and management endpoints
  app.post('/api/coach/track-earnings', requireAuth, async (req: any, res) => {
    try {
      const { amount, source = 'manual' } = req.body;
      const userId = req.user.id;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      
      await CoachEarningsSystem.trackEarnings(userId, amount, source);
      const summary = await CoachEarningsSystem.getEarningsSummary(userId);
      
      res.json({
        message: 'Earnings tracked successfully',
        summary
      });
    } catch (error: any) {
      console.error('Earnings tracking error:', error);
      res.status(500).json({ message: error.message || 'Failed to track earnings' });
    }
  });

  app.get('/api/coach/earnings-summary', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const summary = await CoachEarningsSystem.getEarningsSummary(userId);
      
      if (!summary) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(summary);
    } catch (error: any) {
      console.error('Earnings summary error:', error);
      res.status(500).json({ message: error.message || 'Failed to get earnings summary' });
    }
  });

  app.get('/api/coach/eligibility', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const isEligible = await CoachEarningsSystem.checkCoachEligibility(userId);
      
      res.json({ eligible: isEligible });
    } catch (error: any) {
      console.error('Eligibility check error:', error);
      res.status(500).json({ message: error.message || 'Failed to check eligibility' });
    }
  });

  // Update user role (for testing purposes)
  app.post('/api/coach/update-role', requireAuth, async (req: any, res) => {
    try {
      const { userId, role } = req.body;
      const currentUserId = req.user.id;
      
      // Only allow users to update their own role or admin/super_admin
      if (userId !== currentUserId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'Role updated successfully', user });
    } catch (error: any) {
      console.error('Update role error:', error);
      res.status(500).json({ message: error.message || 'Failed to update role' });
    }
  });

  // Coach application payment endpoint
  app.post('/api/coach/application-payment', requireAuth, async (req: any, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;
      
      if (!stripe) {
        return res.status(400).json({ message: 'Payment processing not configured' });
      }

      if (amount !== 99.00) {
        return res.status(400).json({ message: 'Invalid application fee amount' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 9900, // $99.00 in cents
        currency: 'usd',
        metadata: {
          type: 'coach_application_fee',
          userId: userId,
          timestamp: new Date().toISOString()
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Coach application payment error:', error);
      res.status(500).json({ 
        message: 'Error creating payment intent: ' + error.message 
      });
    }
  });

  // Google Drive course materials endpoint
  app.get("/api/course-materials/:courseId", requireAuth as any, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      
      if (isNaN(courseIdNum) || courseIdNum < 1 || courseIdNum > 3) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const folderId = await googleDriveService.getCourseFolder(courseIdNum);
      
      if (!folderId) {
        return res.json({
          success: false,
          message: "No Google Drive folder configured for this course",
          materials: []
        });
      }

      const materials = await googleDriveService.listCourseFiles(folderId);
      
      res.json({
        success: true,
        courseId: courseIdNum,
        folderId,
        materials
      });
    } catch (error) {
      console.error("Error fetching course materials:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch course materials",
        materials: []
      });
    }
  });

  // Coach certification progress endpoint (available to all users for demo)
  app.get("/api/coach/certification-progress", async (req: any, res) => {
    try {
      // Comprehensive certification course materials with videos, lessons, and interactive content
      const certificationProgress = [
        {
          module_id: 1,
          status: 'not_started',
          score: null,
          answers: {},
          modules: {
            id: 1,
            title: 'Introduction to Wellness Coaching',
            content: `
              <div class="course-module">
                <h2>Module 1: Introduction to Wellness Coaching</h2>
                
                <div class="video-section">
                  <h3>📹 Video Lesson (45 minutes)</h3>
                  <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                    <p><strong>🎥 Foundations of Wellness Coaching</strong></p>
                    <p>Interactive video content covering core coaching principles, client engagement strategies, and ethical considerations</p>
                    <button style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">▶ Play Video</button>
                  </div>
                </div>

                <div class="learning-objectives">
                  <h3>🎯 Learning Objectives</h3>
                  <ul>
                    <li>Understand the core principles of wellness coaching</li>
                    <li>Master effective client communication techniques</li>
                    <li>Learn goal-setting and progress tracking methodologies</li>
                    <li>Identify signs of emotional distress and appropriate referral protocols</li>
                    <li>Apply ethical coaching standards in practice</li>
                  </ul>
                </div>

                <div class="course-content">
                  <h3>📚 Course Content</h3>
                  
                  <h4>1. What is Wellness Coaching?</h4>
                  <p>Wellness coaching is a collaborative partnership that empowers individuals to make sustainable lifestyle changes. Unlike therapy, which often focuses on healing past wounds, coaching is future-focused and action-oriented.</p>
                  
                  <div class="key-concepts">
                    <h4>🔑 Key Concepts:</h4>
                    <ul>
                      <li><strong>Client-Centered Approach:</strong> The client is the expert on their own life</li>
                      <li><strong>Strength-Based:</strong> Focus on existing strengths and resources</li>
                      <li><strong>Solution-Focused:</strong> Emphasis on solutions rather than problems</li>
                      <li><strong>Holistic Perspective:</strong> Address physical, mental, emotional, and spiritual wellness</li>
                    </ul>
                  </div>

                  <h4>2. Building Rapport and Trust</h4>
                  <p>Establishing a strong coaching relationship is fundamental to success. This section covers:</p>
                  <ul>
                    <li>Active listening techniques</li>
                    <li>Empathetic communication</li>
                    <li>Creating a safe, non-judgmental space</li>
                    <li>Setting clear boundaries and expectations</li>
                  </ul>

                  <h4>3. The SMART Goal Framework</h4>
                  <p>Learn to help clients set <strong>Specific, Measurable, Achievable, Relevant, Time-bound</strong> goals:</p>
                  <div class="example-box" style="background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 10px 0;">
                    <h5>Example Transformation:</h5>
                    <p><strong>Vague Goal:</strong> "I want to be healthier"</p>
                    <p><strong>SMART Goal:</strong> "I will walk 30 minutes daily, 5 days per week, for the next 6 weeks to improve my cardiovascular health"</p>
                  </div>

                  <h4>4. Tracking Progress Effectively</h4>
                  <ul>
                    <li>Weekly check-ins and accountability</li>
                    <li>Celebrating small wins</li>
                    <li>Adjusting goals when needed</li>
                    <li>Using progress metrics and journaling</li>
                  </ul>
                </div>

                <div class="interactive-exercises">
                  <h3>🔧 Interactive Exercises</h3>
                  <div class="exercise" style="background: #fff3cd; padding: 15px; border: 1px solid #ffc107; border-radius: 5px; margin: 10px 0;">
                    <h4>Exercise 1: Practice Active Listening</h4>
                    <p>Role-play scenario: Your client says "I've tried everything and nothing works." Practice reflective listening responses.</p>
                    <p><strong>Try this:</strong> Instead of giving advice, reflect back what you hear and ask open-ended questions.</p>
                  </div>
                  
                  <div class="exercise" style="background: #d4edda; padding: 15px; border: 1px solid #28a745; border-radius: 5px; margin: 10px 0;">
                    <h4>Exercise 2: SMART Goal Creation</h4>
                    <p>Transform these vague goals into SMART goals:</p>
                    <ol>
                      <li>"I want to lose weight"</li>
                      <li>"I need to exercise more"</li>
                      <li>"I should eat better"</li>
                    </ol>
                  </div>
                </div>

                <div class="resources">
                  <h3>📖 Additional Resources</h3>
                  <ul>
                    <li>📄 <strong>ICF Core Competencies Guide</strong> - Professional coaching standards</li>
                    <li>🎧 <strong>Podcast:</strong> "The Coaching Habit" episodes 1-3</li>
                    <li>📱 <strong>App Recommendation:</strong> MyFitnessPal for tracking client progress</li>
                    <li>📚 <strong>Recommended Reading:</strong> "The Coaching Habit" by Michael Bungay Stanier</li>
                  </ul>
                </div>

                <div class="quiz-intro">
                  <h3>✅ Knowledge Check</h3>
                  <p>Complete the quiz below to test your understanding of wellness coaching fundamentals. You need 80% or higher to pass this module.</p>
                  <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>💡 Tip:</strong> Review the video content and key concepts above before taking the quiz.</p>
                  </div>
                </div>
              </div>
            `,
            module_order: 1
          }
        },
        {
          module_id: 2,
          status: 'not_started',
          score: null,
          answers: {},
          modules: {
            id: 2,
            title: 'Advanced Nutrition Fundamentals',
            content: `
              <div class="course-module">
                <h2>Module 2: Advanced Nutrition Fundamentals</h2>
                
                <div class="video-section">
                  <h3>📹 Video Lesson (60 minutes)</h3>
                  <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                    <p><strong>🎥 Nutritional Science for Coaches</strong></p>
                    <p>Comprehensive overview of macronutrients, micronutrients, and evidence-based nutrition principles</p>
                    <button style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">▶ Play Video</button>
                  </div>
                </div>

                <div class="learning-objectives">
                  <h3>🎯 Learning Objectives</h3>
                  <ul>
                    <li>Understand macronutrient roles and optimal ratios</li>
                    <li>Identify key micronutrients and their functions</li>
                    <li>Learn sustainable meal planning strategies</li>
                    <li>Recognize nutritional myths vs. evidence-based facts</li>
                    <li>Apply nutrition coaching within scope of practice</li>
                  </ul>
                </div>

                <div class="course-content">
                  <h3>📚 Course Content</h3>
                  
                  <h4>1. Macronutrients Deep Dive</h4>
                  
                  <div class="macronutrient-section">
                    <h5>🍖 Proteins (4 calories/gram)</h5>
                    <p><strong>Functions:</strong> Muscle building, repair, immune function, hormone production</p>
                    <p><strong>Recommended Intake:</strong> 0.8-1.2g per kg body weight (higher for active individuals)</p>
                    <p><strong>Quality Sources:</strong> Complete proteins (eggs, fish, poultry) vs. incomplete proteins (plants)</p>
                    
                    <h5>🍞 Carbohydrates (4 calories/gram)</h5>
                    <p><strong>Functions:</strong> Primary energy source, brain fuel, muscle glycogen</p>
                    <p><strong>Types:</strong> Simple vs. Complex carbs, Glycemic Index considerations</p>
                    <p><strong>Timing:</strong> Pre/post workout nutrition strategies</p>
                    
                    <h5>🥑 Fats (9 calories/gram)</h5>
                    <p><strong>Functions:</strong> Hormone production, vitamin absorption, cell membrane health</p>
                    <p><strong>Types:</strong> Saturated, monounsaturated, polyunsaturated, trans fats</p>
                    <p><strong>Omega-3/Omega-6 Balance:</strong> Anti-inflammatory considerations</p>
                  </div>

                  <h4>2. Essential Micronutrients</h4>
                  <div class="micronutrients-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>Vitamin D</h6>
                      <p>Bone health, immune function, mood regulation</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>B-Complex Vitamins</h6>
                      <p>Energy metabolism, nervous system function</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>Iron</h6>
                      <p>Oxygen transport, energy levels</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>Magnesium</h6>
                      <p>Muscle function, sleep quality, stress management</p>
                    </div>
                  </div>

                  <h4>3. Meal Planning Strategies</h4>
                  <ul>
                    <li><strong>Plate Method:</strong> 1/2 vegetables, 1/4 protein, 1/4 complex carbs</li>
                    <li><strong>Batch Cooking:</strong> Time-saving preparation techniques</li>
                    <li><strong>Flexible Dieting:</strong> 80/20 rule for sustainable habits</li>
                    <li><strong>Special Considerations:</strong> Food allergies, cultural preferences, budget constraints</li>
                  </ul>

                  <h4>4. Debunking Common Myths</h4>
                  <div class="myth-fact-box" style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
                    <p><strong>❌ Myth:</strong> "Carbs are bad for weight loss"</p>
                    <p><strong>✅ Fact:</strong> Complex carbs provide sustained energy and are part of a balanced diet</p>
                  </div>
                  <div class="myth-fact-box" style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
                    <p><strong>❌ Myth:</strong> "Supplements can replace a healthy diet"</p>
                    <p><strong>✅ Fact:</strong> Whole foods provide nutrients in bioavailable forms with synergistic compounds</p>
                  </div>
                </div>

                <div class="interactive-case-study">
                  <h3>📋 Case Study Analysis</h3>
                  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h4>Client Profile: Sarah, 35, Working Mother</h4>
                    <p><strong>Goals:</strong> Increase energy, lose 15 lbs, improve family nutrition</p>
                    <p><strong>Challenges:</strong> Limited cooking time, picky children, stress eating</p>
                    <p><strong>Current Diet:</strong> Skip breakfast, fast food lunches, late dinner</p>
                    
                    <h5>Your Task:</h5>
                    <p>Create a realistic 3-day meal plan addressing Sarah's goals and constraints. Consider prep time, family-friendly options, and sustainable changes.</p>
                  </div>
                </div>

                <div class="resources">
                  <h3>📖 Additional Resources</h3>
                  <ul>
                    <li>📊 <strong>Nutrition Calculator:</strong> MyPlate.gov for personalized recommendations</li>
                    <li>🔬 <strong>Research Database:</strong> PubMed nutrition studies</li>
                    <li>📱 <strong>App:</strong> Cronometer for detailed nutrient tracking</li>
                    <li>📚 <strong>Book:</strong> "Precision Nutrition" certification materials</li>
                    <li>🎓 <strong>Continuing Education:</strong> Academy of Nutrition and Dietetics courses</li>
                  </ul>
                </div>
              </div>
            `,
            module_order: 2
          }
        },
        {
          module_id: 3,
          status: 'not_started',
          score: null,
          answers: {},
          modules: {
            id: 3,
            title: 'Relationship Counseling Fundamentals',
            content: `
              <div class="course-module">
                <h2>Module 3: Relationship Counseling Fundamentals</h2>
                
                <div class="video-section">
                  <h3>📹 Video Lessons (90 minutes total)</h3>
                  <div class="video-playlist">
                    <div class="video-placeholder" style="background: #f0f0f0; padding: 15px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                      <p><strong>🎥 Part 1: Communication Foundations (30 min)</strong></p>
                      <p>Active listening, emotional validation, and creating safe spaces</p>
                      <button style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">▶ Play</button>
                    </div>
                    <div class="video-placeholder" style="background: #f0f0f0; padding: 15px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                      <p><strong>🎥 Part 2: Conflict Resolution Techniques (30 min)</strong></p>
                      <p>De-escalation strategies and finding common ground</p>
                      <button style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">▶ Play</button>
                    </div>
                    <div class="video-placeholder" style="background: #f0f0f0; padding: 15px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                      <p><strong>🎥 Part 3: Building Intimacy & Trust (30 min)</strong></p>
                      <p>Emotional intimacy, rebuilding after betrayal, maintaining connection</p>
                      <button style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">▶ Play</button>
                    </div>
                  </div>
                </div>

                <div class="learning-objectives">
                  <h3>🎯 Learning Objectives</h3>
                  <ul>
                    <li>Master effective communication techniques for couples</li>
                    <li>Learn evidence-based conflict resolution strategies</li>
                    <li>Understand attachment styles and their impact on relationships</li>
                    <li>Identify when to refer to specialized therapy</li>
                    <li>Practice boundary-setting and expectation management</li>
                  </ul>
                </div>

                <div class="course-content">
                  <h3>📚 Course Content</h3>
                  
                  <h4>1. Communication Foundations</h4>
                  
                  <div class="communication-skills">
                    <h5>🎯 The 4 Pillars of Effective Communication</h5>
                    <ol>
                      <li><strong>Active Listening:</strong> Full attention, minimal interruptions, reflective responses</li>
                      <li><strong>Emotional Validation:</strong> Acknowledging feelings without judgment</li>
                      <li><strong>Clear Expression:</strong> "I" statements, specific examples, solution-focused</li>
                      <li><strong>Timing & Environment:</strong> Choosing appropriate moments and settings</li>
                    </ol>
                  </div>

                  <div class="example-box" style="background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0;">
                    <h5>Communication Transformation Example:</h5>
                    <p><strong>❌ Ineffective:</strong> "You never help with housework! You're so lazy!"</p>
                    <p><strong>✅ Effective:</strong> "I feel overwhelmed when I handle most household tasks alone. Could we discuss how to share responsibilities more evenly?"</p>
                  </div>

                  <h4>2. Understanding Attachment Styles</h4>
                  <div class="attachment-styles" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                      <h6>🔒 Secure Attachment (60%)</h6>
                      <p><strong>Traits:</strong> Comfortable with intimacy, effective communication, trusting</p>
                      <p><strong>In Relationships:</strong> Supportive, able to resolve conflicts constructively</p>
                    </div>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px;">
                      <h6>😰 Anxious Attachment (20%)</h6>
                      <p><strong>Traits:</strong> Fear of abandonment, seeks reassurance, emotional intensity</p>
                      <p><strong>In Relationships:</strong> Clingy behavior, jealousy, overthinking</p>
                    </div>
                    <div style="background: #d4edda; padding: 15px; border-radius: 8px;">
                      <h6>🚪 Avoidant Attachment (15%)</h6>
                      <p><strong>Traits:</strong> Values independence, uncomfortable with closeness</p>
                      <p><strong>In Relationships:</strong> Emotional distance, difficulty expressing feelings</p>
                    </div>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px;">
                      <h6>🌪️ Disorganized Attachment (5%)</h6>
                      <p><strong>Traits:</strong> Inconsistent behavior, fear of intimacy and abandonment</p>
                      <p><strong>In Relationships:</strong> Push-pull dynamics, emotional volatility</p>
                    </div>
                  </div>

                  <h4>3. The Gottman Method Principles</h4>
                  <div class="gottman-principles">
                    <h5>🏠 The Four Pillars of Strong Relationships:</h5>
                    <ul>
                      <li><strong>Build Love Maps:</strong> Deep knowledge of partner's inner world</li>
                      <li><strong>Nurture Fondness & Admiration:</strong> Focus on positive qualities</li>
                      <li><strong>Turn Towards, Not Away:</strong> Respond to bids for connection</li>
                      <li><strong>Accept Influence:</strong> Be open to partner's input and perspectives</li>
                    </ul>
                    
                    <h5>⚠️ The Four Horsemen to Avoid:</strong>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;">
                      <ol>
                        <li><strong>Criticism:</strong> Attacking character vs. addressing specific behavior</li>
                        <li><strong>Contempt:</strong> Sarcasm, eye-rolling, name-calling (most toxic)</li>
                        <li><strong>Defensiveness:</strong> Playing victim, counter-attacking</li>
                        <li><strong>Stonewalling:</strong> Shutting down, silent treatment</li>
                      </ol>
                    </div>
                  </div>

                  <h4>4. Conflict Resolution Framework</h4>
                  <div class="conflict-resolution">
                    <h5>📋 The PREP Method:</h5>
                    <ul>
                      <li><strong>P - Pause:</strong> Take time to cool down if emotions are high</li>
                      <li><strong>R - Reflect:</strong> Consider your partner's perspective</li>
                      <li><strong>E - Express:</strong> Share your feelings using "I" statements</li>
                      <li><strong>P - Problem-solve:</strong> Work together toward solutions</li>
                    </ul>
                  </div>
                </div>

                <div class="interactive-exercises">
                  <h3>🔧 Interactive Exercises</h3>
                  
                  <div class="exercise" style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h4>Scenario Practice: The Overloaded Partner</h4>
                    <p><strong>Situation:</strong> Jamie works full-time and handles most childcare/household duties. Partner Alex works but doesn't contribute equally to home responsibilities.</p>
                    
                    <h5>Practice Questions:</h5>
                    <ol>
                      <li>How would you help Jamie express their needs without blame?</li>
                      <li>What communication techniques would help Alex understand the impact?</li>
                      <li>How could they negotiate a fair division of responsibilities?</li>
                    </ol>
                  </div>

                  <div class="exercise" style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h4>Attachment Style Assessment</h4>
                    <p>Practice identifying attachment styles from client descriptions and learning appropriate coaching strategies for each type.</p>
                  </div>
                </div>

                <div class="red-flags">
                  <h3>🚨 When to Refer to Therapy</h3>
                  <div style="background: #f8d7da; padding: 20px; border: 1px solid #dc3545; border-radius: 8px; margin: 15px 0;">
                    <h4>Immediate Referral Situations:</h4>
                    <ul>
                      <li>Any form of domestic violence or abuse</li>
                      <li>Substance abuse issues</li>
                      <li>Mental health crises (suicidal ideation, severe depression)</li>
                      <li>Infidelity requiring specialized therapy</li>
                      <li>Trauma processing needs</li>
                      <li>Personality disorders</li>
                    </ul>
                    <p><strong>Remember:</strong> As a relationship coach, your role is to support healthy relationships. Complex clinical issues require licensed therapists.</p>
                  </div>
                </div>

                <div class="resources">
                  <h3>📖 Additional Resources</h3>
                  <ul>
                    <li>📚 <strong>Books:</strong> "The Seven Principles for Making Marriage Work" by John Gottman</li>
                    <li>🎓 <strong>Certification:</strong> Gottman Institute Couples Therapy Training</li>
                    <li>📱 <strong>Apps:</strong> Gottman Card Decks, Love Nudge (5 Love Languages)</li>
                    <li>🎧 <strong>Podcast:</strong> "Where Should We Begin?" by Esther Perel</li>
                    <li>🔗 <strong>Assessment Tools:</strong> Relationship Assessment Scale, Attachment Style Quiz</li>
                    <li>📞 <strong>Crisis Resources:</strong> National Domestic Violence Hotline: 1-800-799-7233</li>
                  </ul>
                </div>

                <div class="quiz-intro">
                  <h3>✅ Comprehensive Assessment</h3>
                  <p>This module includes both theoretical questions and practical scenario-based assessments. You'll need to demonstrate understanding of communication techniques and appropriate intervention strategies.</p>
                </div>
              </div>
            `,
            module_order: 3
          }
        }
      ];

      res.json(certificationProgress);
    } catch (error) {
      console.error("Error fetching certification progress:", error);
      res.status(500).json({ message: "Failed to fetch certification progress" });
    }
  });

  // Removed duplicate start-module and submit-quiz endpoints - using newer implementations below

  // Google Drive Admin Routes
  
  // Test Google Drive connection
  app.get("/api/admin/google-drive/test", requireAuth as any, async (req: any, res) => {
    try {
      const isConnected = await googleDriveService.testConnection();
      
      res.json({
        success: true,
        connected: isConnected,
        message: isConnected 
          ? "Google Drive service is connected and working"
          : "Google Drive service is not configured or connection failed"
      });
    } catch (error) {
      console.error("Error testing Google Drive connection:", error);
      res.status(500).json({ 
        success: false,
        connected: false,
        message: "Failed to test Google Drive connection" 
      });
    }
  });

  // Create course folders
  app.post("/api/admin/google-drive/create-folders", requireAuth as any, async (req: any, res) => {
    try {
      const courseNames = [
        "Introduction to Wellness Coaching",
        "Advanced Nutrition Fundamentals", 
        "Relationship Counseling Fundamentals"
      ];

      const results = [];
      
      for (let i = 0; i < courseNames.length; i++) {
        const folderId = await googleDriveService.createCourseFolder(courseNames[i]);
        
        if (folderId) {
          // Share folder for public access
          await googleDriveService.shareFolder(folderId);
          
          results.push({
            courseId: i + 1,
            courseName: courseNames[i],
            folderId,
            status: 'created'
          });
        } else {
          results.push({
            courseId: i + 1,
            courseName: courseNames[i],
            folderId: null,
            status: 'failed'
          });
        }
      }

      const successCount = results.filter(r => r.status === 'created').length;
      
      res.json({
        success: successCount > 0,
        message: `Created ${successCount} out of ${courseNames.length} course folders`,
        folders: results
      });
    } catch (error) {
      console.error("Error creating course folders:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to create course folders" 
      });
    }
  });

  // Upload file to course folder
  app.post("/api/admin/google-drive/upload/:courseId", requireAuth as any, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      
      if (isNaN(courseIdNum) || courseIdNum < 1 || courseIdNum > 3) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const folderId = await googleDriveService.getCourseFolder(courseIdNum);
      
      if (!folderId) {
        return res.status(404).json({ 
          message: "No Google Drive folder configured for this course" 
        });
      }

      // This would be enhanced with file upload middleware in production
      res.json({
        success: true,
        message: `Ready to upload files to course ${courseId}`,
        folderId,
        uploadUrl: `https://drive.google.com/drive/folders/${folderId}`
      });
    } catch (error) {
      console.error("Error preparing file upload:", error);
      res.status(500).json({ message: "Failed to prepare file upload" });
    }
  });

  // Old duplicate endpoint removed - now handled at top of routes

  // Admin endpoint to upload sample course materials
  app.post('/api/admin/upload-sample-materials', async (req, res) => {
    try {
      if (!googleDriveService) {
        return res.status(500).json({ 
          success: false,
          message: "Google Drive service not configured" 
        });
      }

      // Sample materials data
      const sampleMaterials = [
        {
          courseId: 1,
          courseName: "Introduction to Wellness Coaching",
          materials: [
            {
              name: "Welcome to Wellness Coaching.pdf",
              content: `# Welcome to Wellness Coaching

## Course Overview
This comprehensive introduction to wellness coaching covers the fundamental principles, ethics, and core competencies needed to become an effective wellness coach.

## Learning Objectives
- Understand the role and scope of wellness coaching
- Learn ICF core competencies and ethical guidelines
- Develop foundational coaching skills and techniques
- Practice creating a safe, supportive coaching environment

## Module Content
This module provides essential knowledge for beginning wellness coaches, including theoretical foundations and practical applications.`,
              mimeType: "text/plain"
            },
            {
              name: "Coaching Ethics and Boundaries.pdf", 
              content: `# Coaching Ethics and Professional Boundaries

## Ethical Guidelines
Professional wellness coaches must maintain clear ethical standards and appropriate boundaries with clients.

## Key Principles
- Confidentiality and privacy protection
- Informed consent and clear agreements
- Professional competence and continuing education
- Respect for client autonomy and self-determination

## Boundary Management
Establishing and maintaining appropriate professional boundaries is essential for effective coaching relationships.`,
              mimeType: "text/plain"
            },
            {
              name: "ICF Core Competencies Overview.pdf",
              content: `# ICF Core Competencies for Wellness Coaches

## Foundation
1. Demonstrates Ethical Practice
2. Embodies a Coaching Mindset

## Co-creating the Relationship
3. Establishes and Maintains Agreements
4. Cultivates Trust and Safety
5. Maintains Presence

## Communicating Effectively
6. Listens Actively
7. Evokes Awareness

## Facilitating Learning and Results
8. Facilitates Client Growth

These competencies form the foundation of professional coaching practice.`,
              mimeType: "text/plain"
            }
          ]
        },
        {
          courseId: 2,
          courseName: "Advanced Nutrition Fundamentals",
          materials: [
            {
              name: "Macronutrient Guidelines.pdf",
              content: `# Advanced Macronutrient Guidelines

## Protein Requirements
- Calculate individual protein needs based on activity level
- Quality protein sources and amino acid profiles
- Timing protein intake for optimal results

## Carbohydrate Management
- Understanding glycemic index and load
- Carb cycling for different goals
- Pre and post-workout nutrition

## Healthy Fats
- Essential fatty acids and their functions
- Omega-3 to omega-6 ratios
- Fat-soluble vitamin absorption`,
              mimeType: "text/plain"
            },
            {
              name: "Meal Planning Templates.pdf",
              content: `# Professional Meal Planning Templates

## Client Assessment
Use these templates to create personalized meal plans based on:
- Individual caloric needs
- Dietary preferences and restrictions
- Lifestyle and schedule considerations
- Health goals and medical conditions

## Weekly Planning Templates
- Breakfast options and variations
- Lunch combinations for busy schedules
- Dinner planning for families
- Healthy snack alternatives

## Shopping Lists and Prep Guides
Organized templates to streamline meal preparation and grocery shopping.`,
              mimeType: "text/plain"
            },
            {
              name: "Client Nutrition Assessment Tools.pdf",
              content: `# Comprehensive Nutrition Assessment Tools

## Initial Client Intake
- Current eating patterns and habits
- Medical history and medications
- Food allergies and intolerances
- Previous diet attempts and outcomes

## Ongoing Progress Tracking
- Weekly check-in questionnaires
- Body composition monitoring
- Energy level and mood assessments
- Goal achievement metrics

## Professional Documentation
Templates for maintaining client records and tracking progress over time.`,
              mimeType: "text/plain"
            }
          ]
        },
        {
          courseId: 3,
          courseName: "Relationship Counseling Fundamentals", 
          materials: [
            {
              name: "Attachment Theory in Practice.pdf",
              content: `# Attachment Theory in Relationship Coaching

## Four Attachment Styles
1. Secure Attachment - healthy relationship patterns
2. Anxious Attachment - fear of abandonment
3. Avoidant Attachment - discomfort with intimacy
4. Disorganized Attachment - inconsistent patterns

## Practical Applications
- Identifying attachment patterns in clients
- Helping clients understand their relationship behaviors
- Developing secure attachment strategies
- Working with couples with different attachment styles

## Therapeutic Interventions
Evidence-based approaches for addressing attachment issues in coaching relationships.`,
              mimeType: "text/plain"
            },
            {
              name: "Communication Techniques Workbook.pdf",
              content: `# Advanced Communication Techniques

## Active Listening Skills
- Reflective listening techniques
- Nonverbal communication awareness
- Asking powerful questions
- Creating safe spaces for sharing

## Conflict Resolution
- De-escalation strategies
- Finding common ground
- Negotiation and compromise
- Repair and reconciliation processes

## Gottman Method Applications
- The Four Horsemen warning signs
- Building love maps
- Nurturing fondness and admiration
- Turning toward instead of away`,
              mimeType: "text/plain"
            },
            {
              name: "Conflict Resolution Strategies.pdf",
              content: `# Professional Conflict Resolution Strategies

## Assessment Phase
- Understanding the conflict dynamics
- Identifying underlying needs and interests
- Recognizing emotional patterns
- Mapping relationship history

## Intervention Techniques
- Structured communication exercises
- Emotional regulation strategies
- Compromise and solution-building
- Long-term relationship maintenance

## Crisis Intervention
When to refer to licensed therapists and emergency resources for relationship crises.`,
              mimeType: "text/plain"
            }
          ]
        }
      ];

      let uploadedFiles = 0;
      let errors = [];

      for (const course of sampleMaterials) {
        try {
          // Create course folder if it doesn't exist
          const folder = await googleDriveService.createCourseFolder(course.courseId, course.courseName);
          
          // Upload materials to the folder
          for (const material of course.materials) {
            try {
              const fileBuffer = Buffer.from(material.content, 'utf8');
              await googleDriveService.uploadFile(
                material.name,
                fileBuffer,
                material.mimeType,
                folder.folderId
              );
              uploadedFiles++;
            } catch (error) {
              errors.push(`Failed to upload ${material.name}: ${error.message}`);
            }
          }
        } catch (error) {
          errors.push(`Failed to process course ${course.courseName}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        message: `Successfully uploaded ${uploadedFiles} course materials`,
        uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error("Error uploading sample materials:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to upload course materials" 
      });
    }
  });

  // Admin route to update user role (temporary for testing)
  app.post('/api/auth/update-coach-role', async (req, res) => {
    try {
      const { email, role } = req.body;
      
      // Update user role in database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.updateUser(user.id, { role });
      
      // Get updated user to confirm
      const updatedUser = await storage.getUserByEmail(email);
      res.json({ 
        success: true, 
        message: `User ${email} role updated to ${role}`,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Check user endpoint (temporary for testing)
  app.get('/api/auth/check-user', async (req, res) => {
    try {
      const { email } = req.query;
      const user = await storage.getUserByEmail(email as string);
      res.json({ user });
    } catch (error) {
      console.error('Error checking user:', error);
      res.status(500).json({ error: 'Failed to check user' });
    }
  });

  // Helper function for sending emails via SendGrid
  async function sendEmail(options: { to: string; subject: string; html: string; text: string }) {
    try {
      const { client, fromEmail } = await getUncachableSendGridClient();
      const msg = {
        to: options.to,
        from: fromEmail,
        subject: options.subject,
        html: options.html,
        text: options.text
      };
      await client.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Password reset routes
  app.post('/api/auth/request-reset', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
      }

      // Generate reset token
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      try {
        await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

        // Send password reset email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

        try {
          await sendEmail({
            to: email,
            subject: 'WholeWellness Coaching - Password Reset Request',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c7a7b;">Password Reset Request</h2>
                <p>Hello ${user.firstName || 'there'},</p>
                <p>We received a request to reset your password for your WholeWellness Coaching account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #2c7a7b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              </div>
            `,
            text: `Password Reset Request\n\nHello ${user.firstName || 'there'},\n\nWe received a request to reset your password. Click the link below:\n${resetUrl}\n\nThis link expires in 1 hour.`
          });
          console.log(`Password reset email sent to ${email}`);
        } catch (emailError) {
          console.error('Error sending password reset email:', emailError);
          // Continue anyway to avoid revealing if email service failed
        }

        res.json({
          message: 'If an account exists with this email, you will receive a password reset link.'
        });
      } catch (tokenError) {
        console.error('Error creating password reset token:', tokenError);
        res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      try {
        const resetToken = await storage.getPasswordResetToken(token);
        if (!resetToken) {
          return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Check if token is expired
        if (new Date() > new Date(resetToken.expiresAt)) {
          await storage.deletePasswordResetToken(token);
          return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Hash new password and update user
        const hashedPassword = await hashPassword(newPassword);
        await storage.updateUserPassword(resetToken.userId, hashedPassword);

        // Delete used token
        await storage.deletePasswordResetToken(token);

        res.json({ message: 'Password has been reset successfully' });
      } catch (tokenError) {
        console.error('Error processing password reset:', tokenError);
        res.status(400).json({ message: 'Invalid or expired reset token' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/user', optionalAuth as any, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Special handling for test coach account
    if (req.user.id === 'coach_chuck_test') {
      return res.json({
        id: 'coach_chuck_test',
        email: 'chuck',
        firstName: 'Chuck',
        lastName: 'TestCoach',
        membershipLevel: 'coach',
        rewardPoints: 0,
        donationTotal: '0',
        profileImageUrl: null,
        role: 'coach',
        permissions: ['view_clients', 'manage_sessions', 'view_assessments']
      });
    }
    
    // Fetch complete user data from database to ensure role is included
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return complete user profile with all fields (excluding sensitive data)
      const { passwordHash, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Error fetching complete user data:', error);
      // Fallback to token data if database fetch fails
      res.json({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        membershipLevel: req.user.membershipLevel,
        rewardPoints: req.user.rewardPoints,
        donationTotal: req.user.donationTotal,
        profileImageUrl: req.user.profileImageUrl,
        coverPhotoUrl: req.user.coverPhotoUrl,
        introVideoUrl: req.user.introVideoUrl,
        role: req.user.role || 'user',
        permissions: req.user.permissions || []
      });
    }
  });

  // Payment Processing Routes
  app.post('/api/create-payment-intent', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }

      const { amount, currency = 'usd', description = 'Coaching Services', assessmentId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      const user = req.user;
      
      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        stripeCustomerId = customer.id;
        await donationStorage.updateUser(user.id, { stripeCustomerId });
      }

      // For assessment payments, create checkout session instead of payment intent
      if (assessmentId) {
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: description || 'Wellness Assessment',
                description: 'Unlock your personalized assessment results',
              },
              unit_amount: amount || 999, // Default to $9.99 in cents
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${req.headers.origin}/assessments/payment-success?session_id={CHECKOUT_SESSION_ID}&assessmentId=${assessmentId}`,
          cancel_url: `${req.headers.origin}/assessments`,
          metadata: {
            userId: user.id,
            type: 'assessment',
            assessmentId: assessmentId || '',
          }
        });

        return res.json({
          sessionId: session.id,
          url: session.url
        });
      }

      // Regular payment intent for other services
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount should already be in cents
        currency,
        customer: stripeCustomerId,
        description,
        metadata: {
          userId: user.id,
          userEmail: user.email,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: error.message || 'Failed to create payment intent' });
    }
  });

  // Create purchase intent for coaching programs
  app.post('/api/get-or-create-purchase', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }

      const user = req.user;
      const { planId, planName, planPrice } = req.body;

      // Check if user already has a purchase for this plan
      if (user.stripePurchaseId) {
        // For purchases, we'll create a new intent each time since these are one-time purchases
        // This allows users to purchase multiple coaching programs
      }
      
      if (!user.email) {
        throw new Error('No user email on file');
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        stripeCustomerId = customer.id;
        await donationStorage.updateUser(user.id, { stripeCustomerId });
      }

      // Plan pricing mapping for one-time purchases
      const planPrices = {
        ai_coaching: 29900, // $299 one-time
        live_coaching: 59900, // $599 one-time
        combined: 79900, // $799 one-time
      };

      // Parse price from planPrice string (e.g., "$299") to cents
      const priceInCents = planPrices[planId as keyof typeof planPrices] || 
        (parseInt(planPrice.replace('$', '')) * 100);

      // Create payment intent for one-time purchase
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceInCents,
        currency: 'usd',
        customer: stripeCustomerId,
        description: `${planName} - Whole Wellness Coaching Program (One-time Purchase)`,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          planId: planId,
          planName: planName,
          purchaseType: 'coaching_program'
        },
      });

      // Update user with purchase info (we'll update this to store purchase history later)
      await donationStorage.updateUser(user.id, {
        stripePurchaseId: paymentIntent.id
      });
  
      res.json({
        purchaseId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Purchase creation error:', error);
      return res.status(400).json({ error: { message: error.message } });
    }
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

  // Membership subscription checkout
  app.post('/api/subscriptions/create-checkout', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Payment processing not configured' });
      }

      const { tier } = req.body;
      const user = req.user;

      // Define membership tiers
      const membershipTiers = {
        basic: { name: 'Basic Member', amount: 0, interval: null },
        premium: { name: 'Premium Member', amount: 1999, interval: 'month' as const }, // $19.99/month
        supporter: { name: 'Supporter', amount: 5000, interval: 'month' as const } // $50/month
      };

      if (!tier || !['basic', 'premium', 'supporter'].includes(tier)) {
        return res.status(400).json({ message: 'Invalid membership tier' });
      }

      const selectedTier = membershipTiers[tier as keyof typeof membershipTiers];

      // Basic is free - just update user membership level
      if (tier === 'basic') {
        await storage.updateUser(user.id, { membershipLevel: 'basic' });
        return res.json({ message: 'Basic membership activated', success: true });
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId: user.id }
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId });
      }

      // Create Stripe checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedTier.name,
              description: `${selectedTier.name} subscription - Access to all features`
            },
            unit_amount: selectedTier.amount,
            recurring: {
              interval: selectedTier.interval as 'month'
            }
          },
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5000'}/members?subscription=success&tier=${tier}`,
        cancel_url: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5000'}/members?subscription=canceled`,
        metadata: {
          userId: user.id,
          membershipTier: tier
        }
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error('Subscription checkout error:', error);
      res.status(500).json({ message: error.message || 'Failed to create checkout session' });
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

  // Create subscription payment intent
  app.post('/api/create-subscription', async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ message: 'Stripe not configured' });
    }

    try {
      const { userId, priceAmount, planId } = req.body;

      if (!userId || !priceAmount || !planId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Create or retrieve Stripe customer
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
          },
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId });
      }

      // Create payment intent for subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceAmount,
        currency: 'usd',
        customer: stripeCustomerId,
        setup_future_usage: 'off_session',
        metadata: {
          userId: user.id,
          planId: planId,
          type: 'subscription',
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        userId: user.id,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: error.message || 'Failed to create subscription' });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ message: 'Stripe not configured' });
    }

    try {
      const event = req.body;
      
      // Handle coach application payment success
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        if (paymentIntent.metadata?.type === 'coach_application_fee') {
          const userId = paymentIntent.metadata.userId;
          const amount = paymentIntent.amount / 100; // Convert from cents
          
          if (userId && amount === 99.00) {
            console.log(`💳 Coach application payment received: $${amount} for user ${userId}`);
            
            // Track earnings and automatically upgrade to coach role
            await CoachEarningsSystem.trackEarnings(userId, amount, 'coach_application_fee');
            
            console.log(`🎉 Coach application fee processed - user ${userId} should now have coach role`);
          }
        }
      }
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { donationId, userId, type, assessmentId } = session.metadata;
        
        // Handle assessment payments
        if (type === 'assessment' && assessmentId) {
          try {
            // Create the assessment record with paid=true
            await storage.createProgram({
              userId,
              assessmentType: assessmentId,
              results: null,
              paid: true, // Mark as paid assessment
            });
            console.log(`✅ Created paid assessment record for user ${userId}, assessment ${assessmentId}`);
          } catch (error) {
            console.error('Error creating paid assessment:', error);
          }
        }
        
        // Handle donation payments
        if (donationId) {
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
  app.post("/api/bookings", requireAuth as any, async (req: AuthenticatedRequest, res) => {
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

  app.get("/api/bookings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      // AUTHORIZATION: Coaches see their bookings, admins see all, clients see their own
      let bookings;
      if (role === 'admin') {
        bookings = await storage.getAllBookings();
      } else if (role === 'coach') {
        bookings = await storage.getCoachBookings(userId);
      } else {
        // For clients, filter by their email or user ID
        const allBookings = await storage.getAllBookings();
        bookings = allBookings.filter(b => b.userId === userId || b.email === req.user!.email);
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Booking availability endpoint
  app.get("/api/booking/availability", optionalAuth as any, async (req, res) => {
    try {
      const { date, coachId } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      // TODO: Implement real availability checking with coach schedules and existing bookings
      // For now, return a set of default available time slots
      const selectedDate = new Date(date as string);
      const dayOfWeek = selectedDate.getDay();
      
      // Don't show slots for past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return res.json({ availableSlots: [] });
      }

      // Example: Generate standard business hour slots for weekdays
      const availableSlots = [];
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        const slots = [
          "09:00 AM", "10:00 AM", "11:00 AM", 
          "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
        ];
        availableSlots.push(...slots);
      } else if (dayOfWeek === 6) { // Saturday
        const slots = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM"];
        availableSlots.push(...slots);
      }
      // Sunday: no slots

      res.json({ 
        availableSlots,
        date: date as string,
        timezone: "America/New_York"
      });
    } catch (error) {
      console.error("Error fetching booking availability:", error);
      res.status(500).json({ message: "Internal server error", availableSlots: [] });
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

  app.post("/api/testimonials", requireAuth as any, async (req: AuthenticatedRequest, res) => {
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
        
        // If no resources exist, seed with sample data
        if (resources.length === 0) {
          await seedSampleResources(storage);
          resources = await storage.getAllResources();
        }
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
  app.post("/api/weight-loss-intakes", requireAuth as any, async (req: AuthenticatedRequest, res) => {
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

  app.get("/api/weight-loss-intakes", requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      // AUTHORIZATION: Only admins can view all intakes (sensitive data)
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      
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

  app.get("/api/wix/bookings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // AUTHORIZATION: Only admins and coaches can view Wix bookings
      if (!['admin', 'coach'].includes(req.user!.role)) {
        return res.status(403).json({ error: "Unauthorized: Admin or coach access required" });
      }
      
      const bookings = await wixIntegration.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching Wix bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Create a new booking
  app.post("/api/wix/bookings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const bookingData = req.body;
      const booking = await wixIntegration.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating Wix booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Get available time slots for a service
  app.get("/api/wix/services/:serviceId/slots", async (req, res) => {
    try {
      const { serviceId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      
      const slots = await wixIntegration.getAvailableSlots(serviceId, date as string);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  });

  // Cancel a booking
  app.delete("/api/wix/bookings/:bookingId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { bookingId } = req.params;
      
      // AUTHORIZATION: Users can only cancel their own bookings, coaches/admins can cancel any
      // Note: This needs booking data to verify ownership - for now allow coaches and admins
      if (!['admin', 'coach'].includes(req.user!.role)) {
        // TODO: Add ownership check for clients canceling their own bookings
        return res.status(403).json({ error: "Unauthorized: Only coaches and admins can cancel bookings" });
      }
      
      const result = await wixIntegration.cancelBooking(bookingId);
      res.json({ success: result });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });

  // Reschedule a booking
  app.put("/api/wix/bookings/:bookingId/reschedule", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { bookingId } = req.params;
      const { newSlot } = req.body;
      
      // AUTHORIZATION: Users can only reschedule their own bookings, coaches/admins can reschedule any
      // Note: This needs booking data to verify ownership - for now allow coaches and admins
      if (!['admin', 'coach'].includes(req.user!.role)) {
        // TODO: Add ownership check for clients rescheduling their own bookings
        return res.status(403).json({ error: "Unauthorized: Only coaches and admins can reschedule bookings" });
      }
      
      const result = await wixIntegration.rescheduleBooking(bookingId, newSlot);
      res.json({ success: result });
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      res.status(500).json({ error: "Failed to reschedule booking" });
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
  app.get("/api/coach/profile", requireCoachRole as any, async (req: any, res) => {
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
  app.post("/api/coach/profile", requireCoachRole as any, async (req: any, res) => {
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
  app.get("/api/coach/credentials", requireCoachRole as any, async (req: any, res) => {
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
  app.post("/api/coach/credentials", requireCoachRole as any, async (req: any, res) => {
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
  app.get("/api/coach/banking", requireCoachRole as any, async (req: any, res) => {
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
  app.post("/api/coach/banking", requireCoachRole as any, async (req: any, res) => {
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
  app.get("/api/coach/availability", requireCoachRole as any, async (req: any, res) => {
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

  // Get coach bookings - returns bookings assigned to this coach
  app.get("/api/coach/bookings", requireCoachRole as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Get bookings where this user is the assigned coach
      const bookings = await storage.getCoachBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching coach bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get coach clients - returns clients assigned to this coach
  app.get("/api/coach/clients", requireCoachRole as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Try to get the professional coach profile first
      const coach = await coachStorage.getCoachByUserId(userId);
      
      if (coach) {
        // If coach profile exists, get clients from coach_clients table
        const clients = await coachStorage.getCoachClients(coach.id);
        
        // Enrich with user data
        const enrichedClients = await Promise.all(
          clients.map(async (client) => {
            try {
              const user = await storage.getUserById(client.clientId);
              return {
                id: client.id,
                userId: client.clientId,
                name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
                fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
                email: user?.email || '',
                lastSession: client.lastContactDate ? new Date(client.lastContactDate).toISOString() : undefined,
                status: client.status || 'active',
                specialtyArea: client.specialtyArea,
                totalSessions: client.totalSessions || 0,
              };
            } catch (err) {
              console.error(`Error enriching client ${client.clientId}:`, err);
              return {
                id: client.id,
                userId: client.clientId,
                name: 'Unknown',
                fullName: 'Unknown',
                email: '',
                status: client.status || 'active',
                specialtyArea: client.specialtyArea,
                totalSessions: client.totalSessions || 0,
              };
            }
          })
        );
        
        return res.json(enrichedClients);
      }
      
      // Fallback: get clients from bookings if no coach profile exists
      const allBookings = await storage.getAllBookings();
      const coachBookings = allBookings.filter(b => b.coachId === userId);
      
      // Create unique client list from bookings
      const clientMap = new Map();
      coachBookings.forEach(booking => {
        const key = booking.email;
        if (!clientMap.has(key)) {
          clientMap.set(key, {
            id: booking.id,
            userId: booking.userId,
            name: booking.fullName,
            fullName: booking.fullName,
            email: booking.email,
            lastSession: booking.scheduledDate ? new Date(booking.scheduledDate).toISOString() : undefined,
            status: booking.status || 'pending',
          });
        }
      });
      
      res.json(Array.from(clientMap.values()));
    } catch (error) {
      console.error("Error fetching coach clients:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Client Goals Management - Get all goals for a specific client
  app.get("/api/coach/clients/:clientId/goals", requireCoachRole as any, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const userId = req.user.id;
      
      // Get coach profile to ensure authorization
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Note: When database is synced, this will query the clientGoals table
      // For now, return empty array as placeholder
      res.json([]);
    } catch (error) {
      console.error("Error fetching client goals:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new goal for a client
  app.post("/api/coach/clients/:clientId/goals", requireCoachRole as any, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const userId = req.user.id;
      
      // Get coach profile
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Validate goal data
      const goalData = insertClientGoalSchema.parse({
        ...req.body,
        coachId: coach.id,
        clientId: clientId,
      });
      
      // Note: When database is synced, this will create the goal
      // For now, return the goal data with a temporary ID
      const newGoal = {
        id: Date.now(),
        ...goalData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      res.json(newGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        console.error("Error creating client goal:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Update a goal
  app.put("/api/coach/goals/:id", requireCoachRole as any, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Get coach profile
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Validate goal data
      const goalData = insertClientGoalSchema.partial().parse(req.body);
      
      // Note: When database is synced, this will update the goal
      const updatedGoal = {
        id: parseInt(id),
        ...goalData,
        updatedAt: new Date(),
      };
      
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        console.error("Error updating client goal:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Update goal progress
  app.patch("/api/coach/goals/:id/progress", requireCoachRole as any, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      const userId = req.user.id;
      
      // Get coach profile
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Validate progress (0-100)
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be between 0 and 100" });
      }
      
      // Note: When database is synced, this will update the goal progress
      const updatedGoal = {
        id: parseInt(id),
        progress,
        status: progress === 100 ? 'completed' : 'active',
        completedAt: progress === 100 ? new Date() : null,
        updatedAt: new Date(),
      };
      
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a goal
  app.delete("/api/coach/goals/:id", requireCoachRole as any, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Get coach profile
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Note: When database is synced, this will delete the goal
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting client goal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get session notes for a specific client
  app.get("/api/coach/session-notes/:clientId", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const { clientId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get coach profile
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Get session notes from coachSessionNotes table
      const sessionNotes = await db.query.coachSessionNotes.findMany({
        where: and(
          eq(coachSessionNotes.coachId, coach.id),
          eq(coachSessionNotes.clientId, clientId)
        ),
        orderBy: desc(coachSessionNotes.sessionDate),
      });
      
      res.json(sessionNotes);
    } catch (error) {
      console.error("Error fetching session notes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get AI insights (chat summaries) for a specific client
  app.get("/api/coach/client-ai-insights/:clientId", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const { clientId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get coach profile
      const coach = await coachStorage.getCoachByUserId(userId);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      
      // Get chat summaries for this client
      const aiInsights = await db.query.chatSummaries.findMany({
        where: eq(chatSummaries.userId, clientId),
        orderBy: desc(chatSummaries.conversationDate),
        limit: 20, // Get most recent 20 conversations
      });
      
      res.json(aiInsights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
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

  // User Profile Routes
  
  // Get current user profile
  app.get("/api/user/profile", requireAuth as any, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      // Exclude sensitive data
      const { passwordHash, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get public user profile by ID
  app.get("/api/user/profile/:userId", optionalAuth as any, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return public profile data only
      const publicProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        coverPhotoUrl: user.coverPhotoUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        educationHistory: user.educationHistory,
        achievements: user.achievements,
        interests: user.interests,
        membershipLevel: user.membershipLevel,
        joinDate: user.joinDate
      };
      
      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching public user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Consolidated profile update endpoint with schema validation
  app.put("/api/profile", requireAuth as any, async (req: any, res) => {
    try {
      // Validate request body using profile update schema
      const validatedData = profileUpdateSchema.parse(req.body);
      console.log('[Profile Update] Validated data:', validatedData);
      
      // Map frontend field names to database column names
      const dbUpdates: any = {};
      
      // Basic fields (direct mapping)
      if (validatedData.firstName) dbUpdates.firstName = validatedData.firstName;
      if (validatedData.lastName) dbUpdates.lastName = validatedData.lastName;
      if (validatedData.bio !== undefined) dbUpdates.bio = validatedData.bio || null;
      if (validatedData.phone !== undefined) dbUpdates.phone = validatedData.phone || null;
      if (validatedData.location !== undefined) dbUpdates.location = validatedData.location || null;
      
      // Website field (websiteUrl -> website)
      if (validatedData.websiteUrl !== undefined) {
        dbUpdates.website = validatedData.websiteUrl || null;
      }
      
      // Social links (flatten into socialLinks JSON object)
      const socialUpdates: any = {};
      if (validatedData.facebookUrl !== undefined) socialUpdates.facebook = validatedData.facebookUrl || undefined;
      if (validatedData.twitterUrl !== undefined) socialUpdates.twitter = validatedData.twitterUrl || undefined;
      if (validatedData.instagramUrl !== undefined) socialUpdates.instagram = validatedData.instagramUrl || undefined;
      if (validatedData.linkedinUrl !== undefined) socialUpdates.linkedin = validatedData.linkedinUrl || undefined;
      
      // Only update socialLinks if any social URL was provided
      if (Object.keys(socialUpdates).length > 0) {
        // Get current social links and merge with updates
        const currentUser = await storage.getUser(req.user.id);
        const currentSocialLinks = (currentUser?.socialLinks as any) || {};
        dbUpdates.socialLinks = { ...currentSocialLinks, ...socialUpdates };
      }
      
      console.log('[Profile Update] DB updates to apply:', dbUpdates);
      
      // Persist updates to database
      const updatedUser = await storage.updateUser(req.user.id, dbUpdates);
      
      console.log('[Profile Update] Updated user bio:', updatedUser?.bio);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Exclude sensitive data
      const { passwordHash, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get coach schedule/availability (MUST be before :coachId route)
  app.get("/api/coach/profile/schedule", optionalAuth as any, async (req: any, res) => {
    try {
      // TODO: Implement coach scheduling/availability system
      // For now, return empty schedule to prevent 404 errors
      res.json({
        availableSlots: [],
        timezone: "America/New_York",
        bookingEnabled: false
      });
    } catch (error) {
      console.error("Error fetching coach schedule:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get public coach profile by coach ID (MUST be after specific routes like /schedule)
  app.get("/api/coach/profile/:coachId", optionalAuth as any, async (req: any, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      
      // Get coach credentials for display
      const credentials = await coachStorage.getCoachCredentials(coach.id);
      
      // Return public coach profile
      const publicProfile = {
        id: coach.id,
        coachId: coach.coachId,
        firstName: coach.firstName,
        lastName: coach.lastName,
        profileImage: coach.profileImage,
        coverPhotoUrl: coach.coverPhotoUrl,
        bio: coach.bio,
        specialties: coach.specialties,
        experience: coach.experience,
        isVerified: coach.isVerified,
        hourlyRate: coach.hourlyRate,
        timezone: coach.timezone,
        languages: coach.languages,
        location: coach.location,
        website: coach.website,
        socialLinks: coach.socialLinks,
        clientCount: coach.clientCount,
        credentials: credentials.map(c => ({
          title: c.title,
          issuingOrganization: c.issuingOrganization,
          issueDate: c.issueDate,
          credentialType: c.credentialType,
          verificationStatus: c.verificationStatus
        }))
      };
      
      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching public coach profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get coach clients (stub endpoint to prevent 404 errors)
  app.get("/api/coach/profile/:coachId/clients", optionalAuth as any, async (req: any, res) => {
    try {
      // TODO: Implement coach-client relationship system
      // For now, return empty clients array to prevent 404 errors
      res.json({
        clients: [],
        totalClients: 0
      });
    } catch (error) {
      console.error("Error fetching coach clients:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google OAuth Routes - Updated for secure browser compliance
  app.get('/auth/google', (req, res, next) => {
    // Use the correct Replit domain for OAuth
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
      access_type: 'offline'
    })(req, res, next);
  });
  
  app.get('/auth/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/?error=auth_failed',
      session: false  // Disable session to prevent issues
    }), 
    async (req, res) => {
      try {
        if (!req.user) {
          console.error('No user data received from Google OAuth');
          return res.redirect('/?error=no_user_data');
        }

        // Generate JWT token for the authenticated user
        const token = generateGoogleAuthToken(req.user);
        
        // Set the token as a secure HTTP-only cookie
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Redirect to the homepage with success indicator
        res.redirect('/?auth=success');
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/?error=auth_failed');
      }
    }
  );

  // Discovery Quiz Routes
  app.post('/api/discovery-quiz', async (req, res) => {
    try {
      const {
        sessionId,
        currentNeeds,
        situationDetails,
        supportPreference,
        readinessLevel,
        recommendedPath,
        completed
      } = req.body;

      let userId = null;
      if (req.cookies?.auth_token) {
        try {
          const authService = AuthService.getInstance();
          const decoded = authService.verifyToken(req.cookies.auth_token);
          userId = decoded.id;
        } catch (err) {
          // Continue with anonymous save
        }
      }

      // For demo purposes, always return success since the quiz table may not exist
      console.log('Discovery Quiz Results Received:', {
        sessionId,
        currentNeeds,
        supportPreference,
        readinessLevel,
        userId: userId || 'anonymous'
      });

      const demoQuizResult = {
        id: `demo_quiz_${Date.now()}`,
        user_id: userId,
        session_id: sessionId,
        current_needs: currentNeeds,
        situation_details: situationDetails,
        support_preference: supportPreference,
        readiness_level: readinessLevel,
        recommended_path: recommendedPath,
        quiz_version: 'v1',
        completed: completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        quizId: demoQuizResult.id,
        message: 'Quiz results processed successfully',
        data: demoQuizResult
      });
    } catch (error) {
      console.error('Error processing discovery quiz results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process quiz results'
      });
    }
  });

  app.get('/api/discovery-quiz/history', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const quizHistory = await storage.getUserQuizHistory(userId);

      res.json({
        success: true,
        quizHistory
      });
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quiz history'
      });
    }
  });

  app.get('/api/discovery-quiz/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const quizResult = await storage.getQuizResultBySession(sessionId);

      if (!quizResult) {
        return res.status(404).json({
          success: false,
          message: 'Quiz results not found'
        });
      }

      res.json({
        success: true,
        quizResult
      });
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quiz result'
      });
    }
  });

  // File upload configuration
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      const subDir = file.fieldname === 'video' ? 'videos' : 
                     file.fieldname === 'photo' ? 'photos' : 'documents';
      const fullPath = path.join(uploadDir, subDir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB for videos
    },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'video') {
        if (file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only video files are allowed'));
        }
      } else if (file.fieldname === 'photo') {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      } else {
        cb(null, true);
      }
    }
  });

  // Video upload endpoint
  app.post('/api/upload/video', upload.single('video'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const videoUrl = `/uploads/videos/${req.file.filename}`;
      res.json({
        success: true,
        videoUrl: videoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  });

  // Photo upload endpoint
  app.post('/api/upload/photo', upload.single('photo'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No photo file uploaded' });
      }

      const photoUrl = `/uploads/photos/${req.file.filename}`;
      res.json({
        success: true,
        photoUrl: photoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Document upload endpoint
  app.post('/api/upload/document', upload.single('document'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No document file uploaded' });
      }

      const documentUrl = `/uploads/documents/${req.file.filename}`;
      res.json({
        success: true,
        documentUrl: documentUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // AI Coaching Chat Endpoint with Persona Support
  // NOTE: This route is commented out because it's handled by registerAIChatRoutes with OpenAI assistants
  /* app.post("/api/ai-coaching/chat", async (req, res) => {
    try {
      const { message, coachType, persona = "supportive" } = req.body;
      
      if (!message || !coachType) {
        return res.status(400).json({ message: "Message and coach type are required" });
      }
      
      // Persona-based response styles
      const personaStyles = {
        supportive: {
          prefix: "I'm here to support you. ",
          tone: "warm and understanding",
          suffix: " What would feel most helpful for you right now?"
        },
        motivational: {
          prefix: "You've got this! ",
          tone: "energetic and inspiring", 
          suffix: " Ready to make some positive changes happen?"
        },
        analytical: {
          prefix: "Let me break this down for you. ",
          tone: "logical and strategic",
          suffix: " What specific outcome are you hoping to achieve?"
        },
        gentle: {
          prefix: "Take your time with this. ",
          tone: "calm and patient",
          suffix: " Remember, every small step counts."
        }
      };

      // Coach-specific knowledge bases
      const coachKnowledge = {
        "weight-loss": {
          focus: "sustainable weight loss and healthy habits",
          expertise: ["nutrition", "meal planning", "exercise", "motivation", "habit formation"]
        },
        "relationship": {
          focus: "building stronger, healthier relationships", 
          expertise: ["communication", "conflict resolution", "trust building", "emotional intimacy", "boundaries"]
        },
        "wellness": {
          focus: "overall wellness and life balance",
          expertise: ["stress management", "work-life balance", "mental health", "self-care", "mindfulness"]
        },
        "behavior": {
          focus: "positive behavior change and personal development",
          expertise: ["habit formation", "goal setting", "overcoming barriers", "self-discipline", "pattern recognition"]
        }
      };

      const currentPersona = personaStyles[persona as keyof typeof personaStyles] || personaStyles.supportive;
      const coachInfo = coachKnowledge[coachType as keyof typeof coachKnowledge] || coachKnowledge.wellness;
      
      // Generate contextual response
      let response = currentPersona.prefix;
      response += `As your ${coachType.replace('-', ' ')} specialist focusing on ${coachInfo.focus}, I can help you with ${message.toLowerCase()}. `;
      
      // Add persona-specific guidance
      if (persona === "analytical") {
        response += "Let's create a structured approach to address this systematically.";
      } else if (persona === "motivational") {
        response += "I believe in your ability to overcome this challenge!";
      } else if (persona === "gentle") {
        response += "We'll work through this at a pace that feels comfortable for you.";
      } else {
        response += "I'm here to guide you through this with understanding and care.";
      }
      
      response += currentPersona.suffix;
      
      res.json({ success: true, response });
    } catch (error: any) {
      console.error('Error processing AI chat:', error);
      res.status(500).json({ message: error.message || "Failed to process chat message" });
    }
  }); */



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

  // Authentication routes (already defined above)
  
  // Admin authentication routes
  // Legacy admin password login removed - OAuth only authentication
  // Admin OAuth routes are now handled by admin-dashboard-routes

  // Database setup route (temporary) - create tables directly without RPC
  app.post('/api/setup-onboarding-db', async (req, res) => {
    try {
      console.log('Setting up onboarding database tables...');
      
      // Try to create the missing tables one by one
      const createResults = [];
      
      // Create password_reset_tokens table
      try {
        const { data, error } = await supabase
          .from('password_reset_tokens')
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          console.log('password_reset_tokens table does not exist, creating...');
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              "userId" TEXT NOT NULL,
              token TEXT NOT NULL UNIQUE,
              "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              used BOOLEAN DEFAULT FALSE
            );`
          });
          
          if (createError) {
            console.error('Error creating password_reset_tokens table:', createError);
            createResults.push({ table: 'password_reset_tokens', error: createError });
          } else {
            console.log('✓ password_reset_tokens table created successfully');
            createResults.push({ table: 'password_reset_tokens', success: true });
          }
        } else {
          console.log('✓ password_reset_tokens table already exists');
          createResults.push({ table: 'password_reset_tokens', success: true, existing: true });
        }
      } catch (err) {
        console.error('Error checking password_reset_tokens table:', err);
        createResults.push({ table: 'password_reset_tokens', error: err });
      }
      
      // Create email_verification_tokens table
      try {
        const { data, error } = await supabase
          .from('email_verification_tokens')
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          console.log('email_verification_tokens table does not exist, creating...');
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `CREATE TABLE IF NOT EXISTS email_verification_tokens (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              "userId" TEXT NOT NULL,
              token TEXT NOT NULL UNIQUE,
              "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              used BOOLEAN DEFAULT FALSE
            );`
          });
          
          if (createError) {
            console.error('Error creating email_verification_tokens table:', createError);
            createResults.push({ table: 'email_verification_tokens', error: createError });
          } else {
            console.log('✓ email_verification_tokens table created successfully');
            createResults.push({ table: 'email_verification_tokens', success: true });
          }
        } else {
          console.log('✓ email_verification_tokens table already exists');
          createResults.push({ table: 'email_verification_tokens', success: true, existing: true });
        }
      } catch (err) {
        console.error('Error checking email_verification_tokens table:', err);
        createResults.push({ table: 'email_verification_tokens', error: err });
      }
      
      // Create user_onboarding_steps table
      try {
        const { data, error } = await supabase
          .from('user_onboarding_steps')
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('does not exist')) {
          console.log('user_onboarding_steps table does not exist, creating...');
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `CREATE TABLE IF NOT EXISTS user_onboarding_steps (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              "userId" TEXT NOT NULL,
              step_id TEXT NOT NULL,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              completed BOOLEAN DEFAULT FALSE,
              "order" INTEGER NOT NULL,
              completed_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE("userId", step_id)
            );`
          });
          
          if (createError) {
            console.error('Error creating user_onboarding_steps table:', createError);
            createResults.push({ table: 'user_onboarding_steps', error: createError });
          } else {
            console.log('✓ user_onboarding_steps table created successfully');
            createResults.push({ table: 'user_onboarding_steps', success: true });
          }
        } else {
          console.log('✓ user_onboarding_steps table already exists');
          createResults.push({ table: 'user_onboarding_steps', success: true, existing: true });
        }
      } catch (err) {
        console.error('Error checking user_onboarding_steps table:', err);
        createResults.push({ table: 'user_onboarding_steps', error: err });
      }

      console.log('✓ Onboarding database setup completed successfully');
      res.json({ success: true, message: 'Onboarding database setup completed', results: createResults });
    } catch (error) {
      console.error('Error setting up onboarding database:', error);
      res.status(500).json({ error: 'Failed to setup database', details: error });
    }
  });

  // Mount comprehensive route modules
  app.use('/api/admin', adminRoutes);
  
  // Register admin certification routes
  registerAdminCertificationRoutes(app);
  app.use('/api/coach', coachRoutes);
  app.use('/api/donations', donationRoutes);
  // Onboarding routes handled by registerOnboardingRoutes() at end of file
  app.use('/api/assessments', assessmentRoutes);
  app.use(onboardingNewRoutes);
  app.use('/api/video', videoRoutes);
  app.use('/api/events', eventsRoutes);
  
  // Chat summarization and digest routes
  // TEMPORARILY DISABLED - chat-digest-routes file missing
  // Chat and digest routes for conversation intelligence
  app.use('/api/ai-coaching', aiChatRoutes);
  app.use('/api/chat', aiChatRoutes);
  app.use('/api/digest', chatDigestRoutes);
  
  // Setup coupon routes
  setupCouponRoutes(app);

  // Register wellness journey routes
  registerWellnessJourneyRoutes(app);

  // ============================================================================
  // BOOKING SYSTEM API ROUTES
  // ============================================================================

  // Booking Categories
  app.get("/api/booking/categories", async (req, res) => {
    try {
      const categories = await storage.getBookingCategories();
      const activeCategories = categories.filter(c => c.isActive);
      res.json(activeCategories);
    } catch (error) {
      console.error("Error fetching booking categories:", error);
      res.status(500).json({ message: "Failed to fetch booking categories" });
    }
  });

  // Booking Services - Get all active services (optionally filter by coachId)
  app.get("/api/booking/services", async (req, res) => {
    try {
      const { coachId } = req.query;
      
      let services;
      if (coachId) {
        services = await storage.getBookingServicesByCoach(coachId as string);
      } else {
        services = await storage.getActiveBookingServices();
      }
      
      res.json(services);
    } catch (error) {
      console.error("Error fetching booking services:", error);
      res.status(500).json({ message: "Failed to fetch booking services" });
    }
  });

  // Get single booking service
  app.get("/api/booking/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getBookingService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error fetching booking service:", error);
      res.status(500).json({ message: "Failed to fetch booking service" });
    }
  });

  // Create booking service (coach only)
  app.post("/api/booking/services", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const coachId = req.user!.id;
      const serviceData = insertBookingServiceSchema.parse({
        ...req.body,
        coachId
      });
      
      const service = await storage.createBookingService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      console.error("Error creating booking service:", error);
      res.status(500).json({ message: "Failed to create booking service" });
    }
  });

  // Update booking service (coach only)
  app.patch("/api/booking/services/:id", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const coachId = req.user!.id;
      
      // Verify ownership
      const existingService = await storage.getBookingService(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }
      if (existingService.coachId !== coachId) {
        return res.status(403).json({ message: "Unauthorized to update this service" });
      }
      
      const updates = insertBookingServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateBookingService(id, updates);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      console.error("Error updating booking service:", error);
      res.status(500).json({ message: "Failed to update booking service" });
    }
  });

  // Coach Schedule - Get weekly schedule for a coach
  app.get("/api/booking/schedule/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const schedule = await storage.getCoachSchedule(coachId);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching coach schedule:", error);
      res.status(500).json({ message: "Failed to fetch coach schedule" });
    }
  });

  // Create/update coach schedule entries (coach only)
  app.post("/api/booking/schedule", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const coachId = req.user!.id;
      const scheduleData = insertCoachScheduleSchema.parse({
        ...req.body,
        coachId
      });
      
      const schedule = await storage.createCoachSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      console.error("Error creating coach schedule:", error);
      res.status(500).json({ message: "Failed to create coach schedule" });
    }
  });

  // Delete coach schedule entry (coach only)
  app.delete("/api/booking/schedule/:id", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCoachSchedule(id);
      
      if (!success) {
        return res.status(404).json({ message: "Schedule entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting coach schedule:", error);
      res.status(500).json({ message: "Failed to delete coach schedule" });
    }
  });

  // Coach Blocked Times - Get blocked times for a coach
  app.get("/api/booking/blocked-times/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const blockedTimes = await storage.getCoachBlockedTimes(coachId);
      res.json(blockedTimes);
    } catch (error) {
      console.error("Error fetching coach blocked times:", error);
      res.status(500).json({ message: "Failed to fetch coach blocked times" });
    }
  });

  // Create blocked time (coach only)
  app.post("/api/booking/blocked-times", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const coachId = req.user!.id;
      const blockedTimeData = insertCoachBlockedTimesSchema.parse({
        ...req.body,
        coachId
      });
      
      const blockedTime = await storage.createCoachBlockedTime(blockedTimeData);
      res.status(201).json(blockedTime);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blocked time data", errors: error.errors });
      }
      console.error("Error creating coach blocked time:", error);
      res.status(500).json({ message: "Failed to create coach blocked time" });
    }
  });

  // Delete blocked time (coach only)
  app.delete("/api/booking/blocked-times/:id", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCoachBlockedTime(id);
      
      if (!success) {
        return res.status(404).json({ message: "Blocked time not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting coach blocked time:", error);
      res.status(500).json({ message: "Failed to delete coach blocked time" });
    }
  });

  // Appointments - Get appointments (filtered by role)
  app.get("/api/booking/appointments", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      
      let appointments;
      if (role === 'coach') {
        appointments = await storage.getAppointmentsByCoach(userId);
      } else {
        // For clients, get their appointments
        appointments = await storage.getAppointmentsByClient(userId);
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get single appointment
  app.get("/api/booking/appointments/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Verify access: coach or client
      if (role !== 'coach' && appointment.clientId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view this appointment" });
      }
      if (role === 'coach' && appointment.coachId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view this appointment" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  // Create appointment (client or guest)
  app.post("/api/booking/appointments", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("[BOOKING] Received appointment request");
      console.log("[BOOKING] User authenticated:", !!req.user);
      console.log("[BOOKING] User ID:", req.user?.id || 'GUEST');
      console.log("[BOOKING] Request body:", JSON.stringify(req.body, null, 2));
      
      const clientId = req.user?.id || null;
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        clientId
      });
      
      console.log("[BOOKING] Creating appointment for:", clientId || 'GUEST');
      const appointment = await storage.createAppointment(appointmentData);
      console.log("[BOOKING] Appointment created successfully:", appointment.id);
      
      // Send booking confirmation email (non-blocking)
      try {
        const service = await storage.getBookingService(appointment.serviceId);
        if (service) {
          await emailService.sendBookingConfirmationEmail({
            clientEmail: appointment.clientEmail,
            clientFirstName: appointment.clientFirstName,
            clientLastName: appointment.clientLastName,
            serviceName: service.name,
            startDateTime: appointment.startDateTime,
            endDateTime: appointment.endDateTime,
            confirmationId: appointment.id,
            price: appointment.price
          });
          console.log("[BOOKING] Confirmation email sent to:", appointment.clientEmail);
        }
      } catch (emailError) {
        // Log but don't fail the booking if email fails
        console.error("[BOOKING] Failed to send confirmation email:", emailError);
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[BOOKING] Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("[BOOKING] Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Update appointment (coach can update status/notes)
  app.patch("/api/booking/appointments/:id", requireCoachRole, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const coachId = req.user!.id;
      
      // Verify ownership
      const existingAppointment = await storage.getAppointment(id);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      if (existingAppointment.coachId !== coachId) {
        return res.status(403).json({ message: "Unauthorized to update this appointment" });
      }
      
      const updates = insertAppointmentSchema.partial().parse(req.body);
      const updatedAppointment = await storage.updateAppointment(id, updates);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Cancel appointment
  app.post("/api/booking/appointments/:id/cancel", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      const { reason } = req.body;
      
      // Verify access
      const existingAppointment = await storage.getAppointment(id);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Allow coach or client to cancel
      const isAuthorized = 
        (role === 'coach' && existingAppointment.coachId === userId) ||
        (existingAppointment.clientId === userId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized to cancel this appointment" });
      }
      
      const cancelledAppointment = await storage.cancelAppointment(id, userId, reason);
      
      if (!cancelledAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(cancelledAppointment);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  const httpServer = createServer(app);
  // Mental Wellness Resource Hub Routes
  app.get("/api/mental-wellness/resources", async (req, res) => {
    try {
      const { category, audience, type, emergency } = req.query;
      const resources = await storage.getMentalWellnessResources({
        category: category as string,
        targetAudience: audience as string,
        resourceType: type as string,
        isEmergency: emergency === 'true'
      });
      res.json(resources);
    } catch (error) {
      console.error("Error fetching mental wellness resources:", error);
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  app.get("/api/mental-wellness/emergency-contacts", async (req, res) => {
    try {
      const { specialty, location } = req.query;
      const contacts = await storage.getEmergencyContacts({
        specialty: specialty as string,
        location: location as string
      });
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ error: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/mental-wellness/assessment", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      const assessmentData = req.body;
      
      const assessment = await storage.createWellnessAssessment({
        userId,
        sessionId,
        assessmentType: assessmentData.type,
        responses: assessmentData.responses,
        score: assessmentData.score,
        riskLevel: assessmentData.riskLevel,
        recommendedResources: assessmentData.recommendedResources,
        followUpRequired: assessmentData.followUpRequired
      });
      
      res.json(assessment);
    } catch (error) {
      console.error("Error creating wellness assessment:", error);
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  app.get("/api/mental-wellness/recommendations", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      const { category, assessment } = req.query;
      
      const recommendations = await storage.getPersonalizedRecommendations({
        userId,
        sessionId,
        category: category as string,
        assessmentType: assessment as string
      });
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/mental-wellness/track-usage", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      const { resourceId, duration, wasHelpful, feedback, followUpAction } = req.body;
      
      const analytics = await storage.trackResourceUsage({
        resourceId,
        userId,
        sessionId,
        accessDuration: duration,
        wasHelpful,
        feedback,
        followUpAction,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer,
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      });
      
      res.json(analytics);
    } catch (error) {
      console.error("Error tracking resource usage:", error);
      res.status(500).json({ error: "Failed to track usage" });
    }
  });

  app.get("/api/mental-wellness/quick-access", async (req, res) => {
    try {
      const quickAccess = await storage.getQuickAccessResources();
      res.json(quickAccess);
    } catch (error) {
      console.error("Error fetching quick access resources:", error);
      res.status(500).json({ error: "Failed to fetch quick access resources" });
    }
  });

  // Personalized Wellness Recommendation Engine Routes
  app.post('/api/recommendations/generate', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { userProfile, context } = req.body;
      
      // Build user profile from authenticated user data
      const fullUserProfile: UserProfile = {
        userId: user.id,
        demographics: userProfile?.demographics || {},
        preferences: userProfile?.preferences || {},
        mentalHealthProfile: userProfile?.mentalHealthProfile || {},
        behaviorPatterns: userProfile?.behaviorPatterns || {}
      };
      
      // Generate personalized recommendations
      const recommendations = await recommendationEngine.generateRecommendations(
        fullUserProfile,
        context as RecommendationContext
      );
      
      res.json({ recommendations });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  app.post('/api/recommendations/track', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { recommendationId, action } = req.body;
      
      await recommendationEngine.trackRecommendationUsage(
        user.id,
        recommendationId,
        action
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking recommendation usage:', error);
      res.status(500).json({ error: 'Failed to track recommendation usage' });
    }
  });

  app.get('/api/recommendations/history', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { limit = 20, offset = 0 } = req.query;
      
      const { data: recommendations, error } = await supabase
        .from('personalized_recommendations')
        .select(`
          *,
          mental_wellness_resources (
            id,
            title,
            description,
            category,
            resource_type
          )
        `)
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
      
      if (error) {
        console.error('Error fetching recommendation history:', error);
        return res.status(500).json({ error: 'Failed to fetch recommendation history' });
      }
      
      res.json({ recommendations: recommendations || [] });
    } catch (error) {
      console.error('Error fetching recommendation history:', error);
      res.status(500).json({ error: 'Failed to fetch recommendation history' });
    }
  });

  app.post('/api/recommendations/feedback', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { recommendationId, feedback, wasHelpful } = req.body;
      
      const { error } = await supabase
        .from('personalized_recommendations')
        .update({
          feedback,
          was_helpful: wasHelpful,
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating recommendation feedback:', error);
        return res.status(500).json({ error: 'Failed to update feedback' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  });

  app.get('/api/recommendations/analytics', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      
      // Get user's recommendation analytics
      const { data: analytics, error } = await supabase
        .from('personalized_recommendations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching recommendation analytics:', error);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
      }
      
      const totalRecommendations = analytics?.length || 0;
      const accessedRecommendations = analytics?.filter(r => r.was_accessed).length || 0;
      const helpfulRecommendations = analytics?.filter(r => r.was_helpful === true).length || 0;
      const notHelpfulRecommendations = analytics?.filter(r => r.was_helpful === false).length || 0;
      
      const stats = {
        totalRecommendations,
        accessedRecommendations,
        helpfulRecommendations,
        notHelpfulRecommendations,
        accessRate: totalRecommendations > 0 ? (accessedRecommendations / totalRecommendations) * 100 : 0,
        helpfulnessRate: (helpfulRecommendations + notHelpfulRecommendations) > 0 
          ? (helpfulRecommendations / (helpfulRecommendations + notHelpfulRecommendations)) * 100 
          : 0
      };
      
      res.json({ analytics: stats });
    } catch (error) {
      console.error('Error fetching recommendation analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Volunteer Application Routes
  app.post('/api/volunteer/application', async (req, res) => {
    try {
      const applicationData = req.body;
      
      // Create email content
      const emailContent = `
        <h2>New Volunteer Application Submitted</h2>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
        <p><strong>Email:</strong> ${applicationData.email}</p>
        <p><strong>Phone:</strong> ${applicationData.phone}</p>
        <p><strong>Address:</strong> ${applicationData.address}, ${applicationData.city}, ${applicationData.state} ${applicationData.zipCode}</p>
        <p><strong>Date of Birth:</strong> ${applicationData.dateOfBirth}</p>
        
        <h3>Emergency Contact</h3>
        <p><strong>Name:</strong> ${applicationData.emergencyContactName}</p>
        <p><strong>Phone:</strong> ${applicationData.emergencyContactPhone}</p>
        
        <h3>Availability</h3>
        <ul>
          ${applicationData.availability.map((time: string) => `<li>${time}</li>`).join('')}
        </ul>
        
        <h3>Volunteer Areas of Interest</h3>
        <ul>
          ${applicationData.volunteerAreas.map((area: string) => `<li>${area}</li>`).join('')}
        </ul>
        
        <h3>Experience & Motivation</h3>
        <p><strong>Relevant Experience:</strong><br>${applicationData.experience.replace(/\n/g, '<br>')}</p>
        <p><strong>Motivation:</strong><br>${applicationData.motivation.replace(/\n/g, '<br>')}</p>
        <p><strong>Skills:</strong><br>${applicationData.skills.replace(/\n/g, '<br>')}</p>
        
        ${applicationData.references ? `<h3>References</h3><p>${applicationData.references.replace(/\n/g, '<br>')}</p>` : ''}
        
        <h3>Agreements</h3>
        <p><strong>Background Check:</strong> ${applicationData.backgroundCheck ? 'Agreed' : 'Not Agreed'}</p>
        <p><strong>Commitment Agreement:</strong> ${applicationData.commitmentAgreement ? 'Agreed' : 'Not Agreed'}</p>
        <p><strong>Privacy Policy:</strong> ${applicationData.privacyPolicy ? 'Agreed' : 'Not Agreed'}</p>
        
        <p><em>This application was submitted through the Whole Wellness Coaching volunteer portal.</em></p>
      `;
      
      // Send email using email service
      const { EmailService } = require('./email-service');
      const emailService = new EmailService();
      await emailService.sendEmail({
        to: 'dasha.lazaryuk@gmail.com',
        from: 'volunteer@wholewellnesscoaching.org',
        subject: `New Volunteer Application - ${applicationData.firstName} ${applicationData.lastName}`,
        html: emailContent,
        text: `New Volunteer Application from ${applicationData.firstName} ${applicationData.lastName}. Please check your email for the full application details.`
      });
      
      console.log('Volunteer application email sent successfully');
      res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Assessment system routes
  app.get("/api/programs", requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const programs = await storage.getUserPrograms(user.id);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  app.post("/api/programs", requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { assessmentType, paid } = req.body;
      
      const program = await storage.createProgram({
        userId: user.id,
        assessmentType,
        paid: paid || false,
        results: null
      });
      
      res.json(program);
    } catch (error) {
      console.error("Error creating program:", error);
      res.status(500).json({ error: "Failed to create program" });
    }
  });

  // Assessment payment checkout session
  app.post("/api/create-assessment-payment", requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { assessmentId, amount } = req.body;
      
      if (!stripe) {
        return res.status(400).json({ error: "Stripe not configured" });
      }
      
      // Get base URL for redirect
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : `http://localhost:${process.env.PORT || 5000}`;
      
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Wellness Assessment',
                description: `${assessmentId} assessment results`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: {
          assessmentId,
          userId: user.id,
          type: 'assessment'
        },
        success_url: `${baseUrl}/assessments?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/assessments?canceled=true`,
      });
      
      res.json({ 
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Chat session management
  app.get("/api/chat/sessions", requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const sessions = await storage.getUserChatSessions(user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { module } = req.body;
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = await storage.createChatSession({
        userId: user.id,
        threadId,
        module
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { sessionId, role, content, summary } = req.body;
      
      const message = await storage.createChatMessage({
        sessionId,
        role,
        content,
        summary
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  // Coach Certification Course Management Routes
  
  // Get all available certification courses (available to all users for demo)  
  app.get("/api/coach/certification-courses", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Mock certification courses for demo
      const courses = [
        {
          id: "course-1",
          title: "Advanced Wellness Coaching Certification",
          description: "Comprehensive training in holistic wellness coaching techniques, covering nutrition, fitness, mental health, and lifestyle optimization strategies.",
          category: "wellness",
          level: "intermediate",
          duration: 40,
          creditHours: "35.0",
          price: "799.00",
          instructorName: "Dr. Sarah Mitchell",
          instructorBio: "Licensed therapist with 15+ years in wellness coaching",
          courseImageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400",
          previewVideoUrl: null,
          requirements: ["Basic coaching certification", "1+ year experience"],
          learningObjectives: [
            "Master advanced coaching techniques",
            "Understand wellness psychology",
            "Develop personalized wellness plans"
          ],
          accreditation: "International Coach Federation (ICF)",
          tags: ["wellness", "holistic", "lifestyle"],
          isActive: true,
          enrollmentLimit: 50,
          startDate: "2025-08-01T00:00:00Z",
          endDate: "2025-12-15T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Advanced Coaching Techniques", duration: 8 },
              { title: "Behavior Change Psychology", duration: 10 },
              { title: "Wellness Assessment Methods", duration: 12 },
              { title: "Client Relationship Management", duration: 10 }
            ]
          }
        },
        {
          id: "course-2", 
          title: "Nutrition Coaching Fundamentals",
          description: "Evidence-based nutrition coaching principles, meal planning strategies, and behavior change techniques for sustainable dietary improvements.",
          category: "nutrition",
          level: "beginner",
          duration: 25,
          creditHours: "20.0",
          price: "599.00",
          instructorName: "Rachel Davis, RD",
          instructorBio: "Registered Dietitian and certified nutrition coach",
          courseImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
          requirements: [],
          learningObjectives: [
            "Understand nutritional science basics",
            "Learn meal planning techniques", 
            "Master behavior change strategies"
          ],
          accreditation: "Academy of Nutrition and Dietetics",
          tags: ["nutrition", "meal-planning", "behavior-change"],
          isActive: true,
          enrollmentLimit: null,
          startDate: "2025-07-15T00:00:00Z",
          endDate: "2025-11-30T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Nutrition Science Fundamentals", duration: 6 },
              { title: "Meal Planning Strategies", duration: 8 },
              { title: "Dietary Assessment Methods", duration: 6 },
              { title: "Behavior Change for Nutrition", duration: 5 }
            ]
          }
        },
        {
          id: "course-3",
          title: "Relationship Counseling Techniques",
          description: "Professional training in couples counseling, communication strategies, conflict resolution, and building healthy relationship dynamics.",
          category: "relationship", 
          level: "advanced",
          duration: 60,
          creditHours: "45.0",
          price: "1299.00",
          instructorName: "Dr. Michael Thompson",
          instructorBio: "Licensed Marriage and Family Therapist with 20+ years experience",
          courseImageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400",
          requirements: ["Master's degree in counseling", "Licensed therapist"],
          learningObjectives: [
            "Advanced couples therapy techniques",
            "Conflict resolution strategies",
            "Family systems theory application"
          ],
          accreditation: "American Association for Marriage and Family Therapy",
          tags: ["relationship", "counseling", "therapy"],
          isActive: true,
          enrollmentLimit: 25,
          startDate: "2025-09-01T00:00:00Z", 
          endDate: "2026-02-28T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Couples Therapy Fundamentals", duration: 15 },
              { title: "Communication Strategies", duration: 15 },
              { title: "Conflict Resolution Techniques", duration: 15 },
              { title: "Family Systems Approach", duration: 15 }
            ]
          }
        },
        {
          id: "course-4",
          title: "Behavior Modification Strategies",
          description: "Scientific approaches to behavior change, habit formation, goal setting, and overcoming psychological barriers to personal development.",
          category: "behavior",
          level: "intermediate",
          duration: 30,
          creditHours: "25.0", 
          price: "699.00",
          instructorName: "Dr. Lisa Chen",
          instructorBio: "Behavioral psychologist specializing in habit formation",
          courseImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
          requirements: ["Basic psychology knowledge"],
          learningObjectives: [
            "Understanding behavior change science",
            "Habit formation techniques",
            "Goal setting and achievement strategies"
          ],
          accreditation: "Association for Applied and Therapeutic Humor",
          tags: ["behavior", "habits", "psychology"],
          isActive: true,
          enrollmentLimit: 40,
          startDate: "2025-08-15T00:00:00Z",
          endDate: "2025-12-01T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Behavior Change Science", duration: 8 },
              { title: "Habit Formation Strategies", duration: 7 },
              { title: "Goal Setting Techniques", duration: 8 },
              { title: "Overcoming Psychological Barriers", duration: 7 }
            ]
          }
        }
      ];
      
      res.json(courses);
    } catch (error) {
      console.error("Error fetching certification courses:", error);
      res.status(500).json({ message: "Failed to fetch certification courses" });
    }
  });

  // Get user's current enrollments (available to all authenticated users)
  app.get("/api/coach/my-enrollments", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Mock enrollments for demo
      const enrollments = [
        {
          id: "enrollment-1",
          coachId: "chuck", // matches test coach
          courseId: "course-1",
          enrollmentDate: "2025-07-01T00:00:00Z",
          status: "in_progress",
          progress: "65.5",
          currentModule: 3,
          completedModules: [1, 2],
          startedAt: "2025-07-01T00:00:00Z",
          paymentStatus: "paid",
          totalTimeSpent: 1260 // 21 hours in minutes
        }
      ];
      
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Get user's earned certificates (available to all authenticated users)
  app.get("/api/coach/my-certificates", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Mock certificates for demo
      const certificates = [
        {
          id: "cert-1",
          coachId: "chuck",
          courseId: "course-2",
          courseTitle: "Nutrition Coaching Fundamentals",
          certificateNumber: "WWC-2024-NC-001",
          issuedDate: "2024-12-15T00:00:00Z",
          expirationDate: "2027-12-15T00:00:00Z",
          creditHours: "20.0",
          status: "active",
          credentialUrl: "https://credentials.wholewellnesscoaching.org/verify/WWC-2024-NC-001",
          certificatePdfUrl: "/certificates/WWC-2024-NC-001.pdf"
        }
      ];
      
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Legacy enrollment endpoint - redirects to new payment-verified enrollment
  app.post("/api/coach/enroll-course", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
      
      // Check if user already has valid enrollment
      const existingEnrollments = await storage.query(`
        SELECT * FROM course_enrollment_payments 
        WHERE user_id = $1 AND course_id = $2 AND payment_status = 'succeeded'
      `, [req.user.id, courseId]);
      
      if (existingEnrollments.rows.length > 0) {
        return res.status(409).json({ 
          error: "Already enrolled in this course",
          enrollmentId: existingEnrollments.rows[0].enrollment_id
        });
      }
      
      // Return payment required response
      res.status(402).json({ 
        error: "Payment required",
        message: "Please complete payment or apply a coupon to enroll in this course",
        redirectTo: "/checkout",
        courseId
      });
    } catch (error) {
      console.error("Error checking enrollment:", error);
      res.status(500).json({ message: "Failed to process enrollment request" });
    }
  });

  // Get course modules for learning (available to all authenticated users)
  app.get("/api/coach/courses/:courseId/modules", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { courseId } = req.params;
      
      // Mock course modules for demo
      const modules = [
        {
          id: "module-1",
          courseId,
          moduleNumber: 1,
          title: "Introduction to Wellness Coaching",
          description: "Foundational principles and core concepts of holistic wellness coaching",
          duration: 45,
          contentType: "video",
          contentUrl: "https://player.vimeo.com/video/example1",
          content: "<p>Welcome to the comprehensive wellness coaching certification program. This module introduces you to the foundational principles of holistic wellness coaching, including understanding client needs, setting realistic goals, and building sustainable coaching relationships.</p><h3>Learning Objectives:</h3><ul><li>Understand the core principles of wellness coaching</li><li>Learn to identify client motivations and barriers</li><li>Develop active listening and empathy skills</li></ul>",
          isRequired: true,
          orderIndex: 1,
          resources: [
            {
              title: "Wellness Coaching Framework PDF",
              type: "pdf",
              url: "#",
              description: "Comprehensive guide to wellness coaching methodologies"
            },
            {
              title: "Client Assessment Templates",
              type: "tool",
              url: "#",
              description: "Downloadable templates for client intake and assessment"
            }
          ]
        },
        {
          id: "module-2",
          courseId,
          moduleNumber: 2,
          title: "Goal Setting and Action Planning",
          description: "SMART goal methodology and creating actionable wellness plans",
          duration: 60,
          contentType: "quiz",
          content: "<p>This module focuses on the critical skill of helping clients set achievable, measurable goals and create actionable plans for sustainable wellness improvements.</p>",
          quiz: {
            questions: [
              {
                id: "q1",
                question: "What does SMART stand for in goal setting?",
                type: "multiple_choice",
                options: [
                  "Specific, Measurable, Achievable, Relevant, Time-bound",
                  "Simple, Modern, Accurate, Realistic, Targeted",
                  "Strategic, Meaningful, Ambitious, Reliable, Trackable",
                  "Structured, Motivational, Actionable, Results-focused, Timely"
                ],
                correctAnswer: 0,
                explanation: "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.",
                points: 10
              },
              {
                id: "q2", 
                question: "A client wants to 'be healthier' - this is an example of a well-defined goal.",
                type: "true_false",
                correctAnswer: "false",
                explanation: "This goal is too vague. A SMART goal would be more specific, like 'exercise 30 minutes, 3 times per week for the next 3 months'.",
                points: 10
              },
              {
                id: "q3",
                question: "Describe how you would help a client break down a large wellness goal into smaller, manageable steps. Provide a specific example.",
                type: "essay",
                points: 20
              }
            ],
            passingScore: 80,
            timeLimit: 30
          },
          isRequired: true,
          orderIndex: 2
        },
        {
          id: "module-3",
          courseId,
          moduleNumber: 3,
          title: "Motivational Interviewing Techniques",
          description: "Advanced communication strategies for behavior change",
          duration: 75,
          contentType: "text",
          content: "<p>Motivational interviewing is a collaborative conversation style that strengthens a person's motivation and commitment to change. This evidence-based approach is essential for wellness coaches.</p><h3>Core Principles:</h3><ol><li><strong>Express Empathy:</strong> Understand the client's perspective</li><li><strong>Develop Discrepancy:</strong> Help clients see gaps between current behavior and goals</li><li><strong>Roll with Resistance:</strong> Avoid arguing or confronting</li><li><strong>Support Self-Efficacy:</strong> Build confidence in the client's ability to change</li></ol><h3>Key Techniques:</h3><ul><li>Open-ended questions</li><li>Affirmations</li><li>Reflective listening</li><li>Summarizing</li></ul><p>Practice these techniques in every client interaction to build rapport and facilitate sustainable behavior change.</p>",
          isRequired: true,
          orderIndex: 3,
          resources: [
            {
              title: "Motivational Interviewing Question Bank",
              type: "pdf",
              url: "#",
              description: "100+ open-ended questions for coaching sessions"
            }
          ]
        },
        {
          id: "module-4",
          courseId,
          moduleNumber: 4,
          title: "Case Study Analysis",
          description: "Apply your learning to real-world coaching scenarios",
          duration: 90,
          contentType: "assignment",
          content: "<p>This capstone assignment allows you to demonstrate your mastery of wellness coaching principles through detailed case study analysis.</p>",
          assignment: {
            instructions: "<p>You will be presented with a detailed client case study. Your task is to:</p><ol><li>Analyze the client's current situation, challenges, and goals</li><li>Develop a comprehensive coaching plan using SMART goals</li><li>Identify potential barriers and strategies to overcome them</li><li>Create sample motivational interviewing questions</li><li>Design a 3-month action plan with measurable milestones</li></ol><p><strong>Case Study:</strong> Sarah is a 35-year-old working mother who wants to improve her overall wellness. She struggles with stress management, irregular eating patterns, and finds little time for physical activity. She has tried various diets and exercise programs but hasn't maintained long-term success. Sarah's goal is to 'feel more energetic and confident' while managing her busy lifestyle.</p>",
            submissionFormat: "Written analysis (1500-2000 words) addressing all required components",
            maxScore: 100
          },
          isRequired: true,
          orderIndex: 4
        }
      ];
      
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  // Get module progress for enrollment (available to all authenticated users)
  app.get("/api/coach/module-progress/:enrollmentId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { enrollmentId } = req.params;
      
      // Mock module progress for demo
      const progress = [
        {
          id: "progress-1",
          enrollmentId,
          moduleId: "module-1",
          status: "completed",
          startedAt: "2025-07-01T10:00:00Z",
          completedAt: "2025-07-01T11:30:00Z",
          timeSpent: 90,
          attempts: 1,
          score: 95
        },
        {
          id: "progress-2", 
          enrollmentId,
          moduleId: "module-2",
          status: "in_progress",
          startedAt: "2025-07-02T09:00:00Z",
          timeSpent: 25,
          attempts: 1,
          score: null
        }
      ];
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ message: "Failed to fetch module progress" });
    }
  });

  // Start a module (available to all authenticated users)
  app.post("/api/coach/start-module", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { enrollmentId, moduleId } = req.body;
      
      if (!enrollmentId || !moduleId) {
        return res.status(400).json({ message: "Enrollment ID and Module ID are required" });
      }
      
      // Mock module start
      const progress = {
        id: `progress-${Date.now()}`,
        enrollmentId,
        moduleId,
        status: "in_progress",
        startedAt: new Date().toISOString(),
        timeSpent: 0,
        attempts: 1
      };
      
      res.json({ success: true, progress });
    } catch (error) {
      console.error("Error starting module:", error);
      res.status(500).json({ message: "Failed to start module" });
    }
  });

  // Submit quiz answers (available to all authenticated users)
  app.post("/api/coach/submit-quiz", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { enrollmentId, moduleId, answers, timeSpent } = req.body;
      
      if (!enrollmentId || !moduleId || !answers) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Mock quiz scoring - in production, this would be more sophisticated
      const totalQuestions = Object.keys(answers).length;
      let correctAnswers = 0;
      
      // Simple scoring logic for demo
      Object.values(answers).forEach((answer: any) => {
        if (typeof answer === 'string' && (answer.includes('Specific') || answer === 'false' || answer.length > 50)) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= 80;
      
      const result = {
        score,
        passed,
        answers,
        completedAt: new Date().toISOString(),
        timeSpent: timeSpent || 0,
        feedback: passed ? "Excellent work! You've demonstrated mastery of the concepts." : "Please review the material and try again. Focus on the areas you missed."
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Submit assignment (available to all authenticated users)
  app.post("/api/coach/submit-assignment", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { enrollmentId, moduleId, submission, timeSpent } = req.body;
      
      if (!enrollmentId || !moduleId || !submission) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Mock assignment submission
      const result = {
        submissionId: `submission-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        timeSpent: timeSpent || 0,
        feedback: "Your assignment has been submitted and will be reviewed by an instructor within 3-5 business days."
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // Admin Security Management Endpoints
  
  // Get all users for admin dashboard
  app.get('/api/admin/security/users', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/security/users', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const { email, firstName, lastName, password, role, isActive, permissions } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'Required fields: email, password, firstName, lastName' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const newUser = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: role || 'user',
        isActive: isActive !== undefined ? isActive : true,
        permissions: permissions || null
      });

      // Remove password hash from response
      const { passwordHash, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Update user (admin only)
  app.put('/api/admin/security/users/:userId', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const { userId } = req.params;
      const updates = req.body;
      
      // Remove sensitive fields that shouldn't be updated directly
      delete updates.passwordHash;
      delete updates.id;
      delete updates.createdAt;

      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password hash from response
      const { passwordHash, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/security/users/:userId', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const { userId } = req.params;
      
      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Create admin accounts
  app.post('/api/admin/security/create-admin-accounts', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const adminAccounts = [
        {
          email: 'charles.watson@wholewellnesscoaching.org',
          firstName: 'Charles',
          lastName: 'Watson',
          role: 'admin'
        },
        {
          email: 'charles.watson@gmail.com',
          firstName: 'Charles',
          lastName: 'Watson',
          role: 'admin'
        }
      ];

      const createdAccounts = [];
      const defaultPassword = 'AdminWWC2024!';

      for (const account of adminAccounts) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(account.email);
          if (existingUser) {
            // Update existing user to admin role
            const updatedUser = await storage.updateUserRole(existingUser.id, 'admin');
            createdAccounts.push({ email: account.email, status: 'updated', role: 'admin' });
          } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash(defaultPassword, 12);
            const newUser = await storage.createUser({
              email: account.email,
              passwordHash: hashedPassword,
              firstName: account.firstName,
              lastName: account.lastName,
              role: account.role,
              isActive: true
            });
            createdAccounts.push({ email: account.email, status: 'created', role: 'admin' });
          }
        } catch (error) {
          console.error(`Error processing admin account ${account.email}:`, error);
          createdAccounts.push({ email: account.email, status: 'error', error: error.message });
        }
      }

      res.json({ 
        message: 'Admin account processing completed',
        accounts: createdAccounts,
        defaultPassword: defaultPassword
      });
    } catch (error) {
      console.error('Error creating admin accounts:', error);
      res.status(500).json({ message: 'Failed to create admin accounts' });
    }
  });

  // Get security analytics
  app.get('/api/admin/security/analytics', requireAuth as any, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const users = await storage.getAllUsers();
      
      const analytics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        roleDistribution: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentLogins: users.filter(u => u.lastLogin && 
          new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching security analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Google Drive Integration for Coach Certification Files
  
  // Test Google Drive connection endpoint
  app.get("/api/test-google-drive", requireAuth as any, async (req, res) => {
    try {
      console.log("Testing Google Drive connection...");
      const isAuthenticated = await googleDriveService.initialize();
      
      if (isAuthenticated) {
        // Test access to your specific folder
        const files = await googleDriveService.getCourseFiles("1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya");
        res.json({ 
          status: "success", 
          message: "Google Drive connected successfully",
          folderAccess: true,
          fileCount: files.length,
          sampleFiles: files.slice(0, 3).map(f => ({ name: f.name, type: f.mimeType }))
        });
      } else {
        res.json({ 
          status: "demo", 
          message: "Using demo mode - Google Drive credentials not configured or invalid" 
        });
      }
    } catch (error: any) {
      console.error("Google Drive test error:", error);
      res.json({ 
        status: "error", 
        message: error.message,
        usingDemo: true 
      });
    }
  });
  
  // Get course files from Google Drive
  app.get("/api/coach/course-files/:courseId", requireAuth as any, async (req, res) => {
    try {
      const { courseId } = req.params;
      
      // Get course info to find Drive folder ID
      const courses = await storage.getCertificationCourses();
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if course has Google Drive folder configured
      const driveFolder = course.syllabus?.driveFolder || course.syllabus?.googleDriveId;
      
      if (!driveFolder) {
        return res.json({ files: [], message: "No Google Drive folder configured for this course" });
      }

      // Try Google Drive service first, fallback to demo
      let files;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          files = await googleDriveService.getCourseFiles(driveFolder);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive files (credentials not configured)");
        files = await googleDriveDemoService.getCourseFiles(driveFolder);
      }
      
      res.json({ 
        files: files.map(file => ({
          id: file.id,
          name: file.name,
          type: file.mimeType,
          viewLink: file.webViewLink,
          downloadLink: file.webContentLink,
          thumbnail: file.thumbnailLink,
          size: file.size,
          modified: file.modifiedTime
        }))
      });
    } catch (error) {
      console.error("Error fetching course files:", error);
      res.status(500).json({ message: "Failed to fetch course files from Google Drive" });
    }
  });

  // Get course folder structure from Google Drive
  app.get("/api/coach/course-folder/:courseId", requireAuth as any, async (req, res) => {
    try {
      const { courseId } = req.params;
      
      const courses = await storage.getCertificationCourses();
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const driveFolder = course.syllabus?.driveFolder || course.syllabus?.googleDriveId;
      
      if (!driveFolder) {
        return res.json({ folder: null, message: "No Google Drive folder configured" });
      }

      let folderStructure;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          folderStructure = await googleDriveService.getCourseFolderStructure(driveFolder);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive folder structure");
        folderStructure = await googleDriveDemoService.getCourseFolderStructure(driveFolder);
      }
      res.json({ folder: folderStructure });
    } catch (error) {
      console.error("Error fetching folder structure:", error);
      res.status(500).json({ message: "Failed to fetch folder structure from Google Drive" });
    }
  });

  // Get file download URL from Google Drive
  app.get("/api/coach/drive-file/:fileId/download", requireAuth as any, async (req, res) => {
    try {
      const { fileId } = req.params;
      
      let downloadUrl;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          downloadUrl = await googleDriveService.getDownloadUrl(fileId);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive download URL");
        downloadUrl = await googleDriveDemoService.getDownloadUrl(fileId);
      }
      res.json({ downloadUrl });
    } catch (error) {
      console.error("Error getting download URL:", error);
      res.status(500).json({ message: "Failed to get download URL from Google Drive" });
    }
  });

  // Search course files in Google Drive
  app.get("/api/coach/search-course-files/:courseId", requireAuth as any, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { q: searchQuery } = req.query;
      
      if (!searchQuery) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const courses = await storage.getCertificationCourses();
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const driveFolder = course.syllabus?.driveFolder || course.syllabus?.googleDriveId;
      
      if (!driveFolder) {
        return res.json({ files: [], message: "No Google Drive folder configured" });
      }

      let files;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          files = await googleDriveService.searchFiles(searchQuery as string, driveFolder);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive search");
        files = await googleDriveDemoService.searchFiles(searchQuery as string, driveFolder);
      }
      
      res.json({ 
        files: files.map(file => ({
          id: file.id,
          name: file.name,
          type: file.mimeType,
          viewLink: file.webViewLink,
          downloadLink: file.webContentLink,
          thumbnail: file.thumbnailLink,
          size: file.size,
          modified: file.modifiedTime
        }))
      });
    } catch (error) {
      console.error("Error searching course files:", error);
      res.status(500).json({ message: "Failed to search course files in Google Drive" });
    }
  });

  // ============================================
  // EVENTS & WEBINARS API ROUTES
  // ============================================
  
  // Get all upcoming events
  app.get("/api/events", optionalAuth as any, async (req: any, res) => {
    try {
      const events = await storage.getAllEvents();
      // Only show public events to non-authenticated users
      const filteredEvents = req.user 
        ? events 
        : events.filter(e => e.isPublic);
      res.json(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get single event
  app.get("/api/events/:id", optionalAuth as any, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      // Check if user can access this event
      if (!event.isPublic && !req.user) {
        return res.status(403).json({ message: "This event is for members only" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create event (coaches and admins only)
  app.post("/api/events", requireAuth as any, async (req: any, res) => {
    try {
      const user = req.user;
      if (user.role !== 'coach' && user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Only coaches and admins can create events" });
      }

      // Validate request body
      const validatedData = insertEventSchema.parse({
        ...req.body,
        coachId: user.id,
        coachName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      });

      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Register for event
  app.post("/api/events/:id/register", requireAuth as any, async (req: any, res) => {
    try {
      const user = req.user;
      const eventId = req.params.id;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if already registered
      const existingRegistration = await storage.getEventRegistrationByUserAndEvent(user.id, eventId);
      if (existingRegistration) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }

      // Check if event is full
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        return res.status(400).json({ message: "This event is full" });
      }

      // Validate registration data
      const validatedRegistration = insertEventRegistrationSchema.parse({
        eventId,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        userEmail: user.email,
        paymentStatus: event.isPaid ? 'pending' : 'completed',
        amountPaid: event.isPaid ? event.price : '0'
      });

      const registration = await storage.createEventRegistration(validatedRegistration);

      // Update participant count
      await storage.updateEventParticipantCount(eventId, event.currentParticipants + 1);

      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Get user's event registrations
  app.get("/api/events/user/registrations", requireAuth as any, async (req: any, res) => {
    try {
      const registrations = await storage.getUserEventRegistrations(req.user.id);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // ===== OBJECT STORAGE ROUTES (Referenced from javascript_object_storage integration) =====
  const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
  const { ObjectPermission } = await import("./objectAcl");

  // Serve uploaded objects (with ACL check for protected file uploading)
  app.get("/objects/:objectPath(*)", requireAuth as any, async (req: any, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for an object entity
  app.post("/api/objects/upload", requireAuth as any, async (req: any, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Update profile image
  app.put("/api/profile/image", requireAuth as any, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user?.id;

    try {
      const objectStorageService = new ObjectStorageService();
      
      // SECURITY: Validate and set ACL - will throw if path is invalid
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId, // SECURITY: Ensures only user can set their own image
          visibility: "public", // Profile images are public
        },
      );

      // Update user's profile image in database
      await storage.updateUserProfile(userId, { profileImageUrl: objectPath });

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting profile image:", error);
      res.status(400).json({ error: "Invalid image URL or unauthorized access" });
    }
  });

  // Update cover photo
  app.put("/api/profile/cover", requireAuth as any, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user?.id;

    try {
      const objectStorageService = new ObjectStorageService();
      
      // SECURITY: Validate and set ACL - will throw if path is invalid
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId, // SECURITY: Ensures only user can set their own cover
          visibility: "public", // Cover photos are public
        },
      );

      // Update user's cover photo in database
      await storage.updateUserProfile(userId, { coverPhotoUrl: objectPath });

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting cover photo:", error);
      res.status(400).json({ error: "Invalid image URL or unauthorized access" });
    }
  });

  // Update intro video
  app.put("/api/profile/video", requireAuth as any, async (req: any, res) => {
    if (!req.body.videoURL) {
      return res.status(400).json({ error: "videoURL is required" });
    }

    const userId = req.user?.id;

    try {
      const objectStorageService = new ObjectStorageService();
      
      // SECURITY: Validate and set ACL - will throw if path is invalid
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.videoURL,
        {
          owner: userId, // SECURITY: Ensures only user can set their own video
          visibility: "public", // Intro videos are public
        },
      );

      // Update user's intro video in database
      await storage.updateUserProfile(userId, { introVideoUrl: objectPath });

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting intro video:", error);
      res.status(400).json({ error: "Invalid video URL or unauthorized access" });
    }
  });

  // Get user's media files
  app.get("/api/user/media", requireAuth as any, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const media = await storage.getUserMedia(userId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching user media:", error);
      res.status(500).json({ message: "Failed to fetch media files" });
    }
  });

  // Add media file
  app.post("/api/user/media", requireAuth as any, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const objectStorageService = new ObjectStorageService();
      
      // SECURITY: Ensure only authenticated user's files can be uploaded
      if (!req.body.filePath) {
        return res.status(400).json({ message: "filePath is required" });
      }

      // SECURITY: Validate the path is under the user's private directory
      let objectPath: string;
      try {
        objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
          req.body.filePath,
          {
            owner: userId,
            visibility: req.body.isPublic ? "public" : "private",
          },
        );
      } catch (error) {
        console.error("Invalid file path:", error);
        return res.status(400).json({ message: "Invalid file path" });
      }

      const mediaData = {
        userId, // SECURITY: Always use authenticated user's ID
        mediaType: req.body.mediaType,
        fileName: req.body.fileName,
        filePath: objectPath,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
        title: req.body.title,
        description: req.body.description,
        isPublic: req.body.isPublic ?? true,
        displayOrder: req.body.displayOrder ?? 0,
      };

      const media = await storage.createUserMedia(mediaData);
      res.status(201).json(media);
    } catch (error) {
      console.error("Error adding media file:", error);
      res.status(500).json({ message: "Failed to add media file" });
    }
  });

  // Delete media file
  app.delete("/api/user/media/:id", requireAuth as any, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const mediaId = req.params.id;
      
      // Verify ownership
      const media = await storage.getUserMediaById(mediaId);
      if (!media || media.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteUserMedia(mediaId);
      res.json({ message: "Media file deleted successfully" });
    } catch (error) {
      console.error("Error deleting media file:", error);
      res.status(500).json({ message: "Failed to delete media file" });
    }
  });

  // AI Chat Routes with Memory - Direct Implementation
  // TEMPORARILY DISABLED - ai-chat-routes file missing
  // registerAIChatRoutes(app);

  // Onboarding Routes
  registerOnboardingRoutes(app);

  return httpServer;
}
