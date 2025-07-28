import { Router } from "express";
import { storage } from "./supabase-client-storage";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { z } from "zod";
import { insertUserAssessmentSchema, insertAssessmentTypeSchema } from "@shared/schema";

const router = Router();

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

// Submit completed assessment (requires authentication)
router.post("/submit", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const assessmentData = insertUserAssessmentSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    
    const assessment = await storage.createUserAssessment(assessmentData);
    
    // Generate AI summary of responses (optional enhancement)
    // This could call an AI service to create a summary
    
    res.json({ 
      success: true, 
      assessmentId: assessment.id,
      message: "Assessment completed successfully" 
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid assessment data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to submit assessment" });
  }
});

// Get current user's completed assessments (no userId param needed)
router.get("/user", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const assessments = await storage.getUserAssessments(req.user.id);
    res.json(assessments);
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
    if (req.user.id !== userId && req.user.role !== 'admin') {
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
    if (req.user.id !== userId && !['admin', 'coach'].includes(req.user.role)) {
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
    if (!['admin', 'coach'].includes(req.user.role)) {
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
    if (req.user.role !== 'admin') {
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
      userId: req.user.id,
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