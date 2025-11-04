import { Router } from "express";
import { storage } from "./app-storage";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { z } from "zod";
import { insertUserAssessmentSchema, insertAssessmentTypeSchema } from "@shared/schema";
import { getAssessmentQuestions } from "./assessment-questions";

const router = Router();

// Handle payment success for assessments
router.get("/payment-success", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { session_id, assessmentId } = req.query;
    
    if (!session_id || !assessmentId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // The Stripe webhook already created the program record with paid=true
    // This endpoint is just for frontend confirmation
    res.json({ 
      success: true, 
      message: "Payment processed successfully",
      assessmentId: assessmentId as string
    });
  } catch (error) {
    console.error("Error handling payment success:", error);
    res.status(500).json({ error: "Failed to process payment success" });
  }
});

// Get all assessment types available to users
router.get("/assessment-types", async (req, res) => {
  try {
    const assessmentTypes = await storage.getActiveAssessmentTypes();
    res.json(assessmentTypes);
  } catch (error) {
    console.error("Error fetching assessment types:", error);
    res.status(500).json({ error: "Failed to fetch assessment types" });
  }
});

// Get specific assessment type with form structure
router.get("/assessment-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get from hardcoded questions first
    const hardcodedQuestions = getAssessmentQuestions(id);
    if (hardcodedQuestions) {
      return res.json(hardcodedQuestions);
    }
    
    // Fall back to database
    const assessmentType = await storage.getAssessmentTypeById(id);
    
    if (!assessmentType) {
      return res.status(404).json({ error: "Assessment type not found" });
    }
    
    res.json(assessmentType);
  } catch (error) {
    console.error("Error fetching assessment type:", error);
    res.status(500).json({ error: "Failed to fetch assessment type" });
  }
});

// Submit completed assessment (allows anonymous users with email)
router.post("/submit", async (req, res) => {
  try {
    const { assessmentTypeId, responses, email } = req.body;
    const isAuthenticated = !!(req as AuthenticatedRequest).user;
    const userId = isAuthenticated ? (req as AuthenticatedRequest).user!.id : null;
    
    // For anonymous users, email is required
    if (!isAuthenticated && !email) {
      return res.status(400).json({ 
        error: "Email is required for anonymous assessment submission" 
      });
    }
    
    // Validate email format for anonymous users
    if (!isAuthenticated && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: "Invalid email format" 
        });
      }
    }
    
    if (isAuthenticated && userId) {
      // Authenticated user flow
      const existingPrograms = await storage.getUserPrograms(userId);
      const existingProgram = existingPrograms.find(p => p.assessmentType === assessmentTypeId);
      
      if (existingProgram) {
        // Update existing program with responses
        await storage.updateProgram(existingProgram.id, {
          results: responses,
        });
        
        res.json({ 
          success: true, 
          assessmentId: existingProgram.id,
          message: "Assessment results updated successfully" 
        });
      } else {
        // Count free assessments used
        const freeAssessmentsUsed = existingPrograms.filter(p => !p.paid).length;
        const isFreeTier = freeAssessmentsUsed < 3;
        
        // Create new program record with appropriate paid status
        const program = await storage.createProgram({
          userId,
          assessmentType: assessmentTypeId,
          results: responses,
          paid: !isFreeTier,
        });
        
        res.json({ 
          success: true, 
          assessmentId: program.id,
          message: "Assessment completed successfully" 
        });
      }
    } else {
      // Anonymous user flow - always create new program with email
      const program = await storage.createProgram({
        email,
        assessmentType: assessmentTypeId,
        results: responses,
        paid: false,
      });
      
      res.json({ 
        success: true, 
        assessmentId: program.id,
        message: "Assessment completed successfully! Check your email for results." 
      });
    }
  } catch (error) {
    console.error("Error submitting assessment:", error);
    // Only log sensitive data in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Request body:", req.body);
    } else {
      console.error("Assessment type ID:", req.body?.assessmentTypeId);
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid assessment data", 
        details: error.errors 
      });
    }
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : "Failed to submit assessment";
    res.status(500).json({ 
      error: "Failed to submit assessment",
      message: errorMessage
    });
  }
});

// Get current user's completed assessments (returns programs data for paid tracking)
router.get("/user", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Return programs instead of userAssessments for paid tracking
    const programs = await storage.getUserPrograms(req.user!.id);
    res.json(programs);
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get specific user's completed assessments (for admin access)
router.get("/user/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to access their own assessments or admins to access any
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const assessments = await storage.getUserAssessments(userId);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get assessments relevant to a specific coach type (for AI coaches)
router.get("/coach/:coachType/user/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { coachType, userId } = req.params;
    
    // Only allow users to access their own data or coaches/admins to access client data
    if (req.user!.id !== userId && !['admin', 'coach'].includes(req.user!.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const relevantAssessments = await storage.getAssessmentsForCoach(userId, coachType);
    
    // Log the coach interaction
    await storage.createCoachInteraction({
      userId,
      coachType,
      accessedAssessments: relevantAssessments.map(a => a.id),
      interactionSummary: `Accessed ${relevantAssessments.length} relevant assessments`,
      sessionId: req.sessionID,
    });
    
    res.json(relevantAssessments);
  } catch (error) {
    console.error("Error fetching coach-relevant assessments:", error);
    res.status(500).json({ error: "Failed to fetch relevant assessments" });
  }
});

// Get assessment summary for human coaches
router.get("/summary/user/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow coaches and admins to access summaries
    if (!['admin', 'coach'].includes(req.user!.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const assessmentSummary = await storage.getUserAssessmentSummary(userId);
    res.json(assessmentSummary);
  } catch (error) {
    console.error("Error fetching assessment summary:", error);
    res.status(500).json({ error: "Failed to fetch assessment summary" });
  }
});

// Create new assessment type (admin only)
router.post("/assessment-types", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const assessmentTypeData = insertAssessmentTypeSchema.parse(req.body);
    const assessmentType = await storage.createAssessmentType(assessmentTypeData);
    
    res.json({ 
      success: true, 
      assessmentType,
      message: "Assessment type created successfully" 
    });
  } catch (error) {
    console.error("Error creating assessment type:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid assessment type data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create assessment type" });
  }
});

// Weight Loss Intake Form endpoint (backwards compatibility)
router.post("/weight-loss-intake", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Convert legacy weight loss intake to new assessment format
    const weightLossAssessment = {
      userId: req.user!.id,
      assessmentTypeId: "weight-loss-intake", // This should exist in assessment_types
      responses: req.body,
    };
    
    const assessment = await storage.createUserAssessment(weightLossAssessment);
    
    res.json({ 
      success: true, 
      assessmentId: assessment.id,
      message: "Weight loss intake completed successfully" 
    });
  } catch (error) {
    console.error("Error submitting weight loss intake:", error);
    res.status(500).json({ error: "Failed to submit weight loss intake" });
  }
});

export { router as assessmentRoutes };