import type { Express } from "express";
import express from "express";
import { createServer } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertCoachApplicationSchema, insertApplicationDocumentSchema, insertOnboardingStepSchema } from "@shared/schema";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Application routes
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const result = insertCoachApplicationSchema.parse(req.body);
      const application = await storage.createApplication(result);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const application = await storage.updateApplication(id, updates);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Document routes
  app.get("/api/applications/:id/documents", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByApplication(applicationId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/applications/:id/documents", upload.single("file"), async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const file = req.file;
      const { documentType } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const documentData = {
        applicationId,
        documentType,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
      };

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Onboarding step routes
  app.get("/api/applications/:id/steps", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const steps = await storage.getStepsByApplication(applicationId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching steps:", error);
      res.status(500).json({ error: "Failed to fetch steps" });
    }
  });

  app.post("/api/applications/:id/steps", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const stepData = { ...req.body, applicationId };
      const result = insertOnboardingStepSchema.parse(stepData);
      const step = await storage.createStep(result);
      res.status(201).json(step);
    } catch (error) {
      console.error("Error creating step:", error);
      res.status(400).json({ error: "Invalid step data" });
    }
  });

  app.patch("/api/steps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const step = await storage.updateStep(id, updates);
      if (!step) {
        return res.status(404).json({ error: "Step not found" });
      }
      res.json(step);
    } catch (error) {
      console.error("Error updating step:", error);
      res.status(500).json({ error: "Failed to update step" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getApplicationAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // File serving
  app.use("/uploads", express.static("uploads"));

  return server;
}