import type { Express } from "express";
import { storage } from "./storage";

export function registerDiscoveryQuizRoutes(app: Express) {
  // Save discovery quiz results
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
      if (req.isAuthenticated && req.user) {
        userId = (req.user as any).claims?.sub;
      }

      // Save quiz results
      const quizResult = await storage.saveDiscoveryQuizResult({
        userId,
        sessionId,
        currentNeeds,
        situationDetails,
        supportPreference,
        readinessLevel,
        recommendedPath,
        completed,
        quizVersion: 'v1'
      });

      res.json({
        success: true,
        quizId: quizResult.id,
        message: 'Quiz results saved successfully'
      });
    } catch (error) {
      console.error('Error saving discovery quiz results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save quiz results'
      });
    }
  });

  // Get user's quiz history
  app.get('/api/discovery-quiz/history', async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = (req.user as any).claims?.sub;
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

  // Get quiz results by session ID (for anonymous users)
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

  // Update existing quiz results
  app.patch('/api/discovery-quiz/:quizId', async (req, res) => {
    try {
      const { quizId } = req.params;
      const updateData = req.body;

      const updatedQuiz = await storage.updateQuizResult(quizId, updateData);

      if (!updatedQuiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      res.json({
        success: true,
        quizResult: updatedQuiz
      });
    } catch (error) {
      console.error('Error updating quiz result:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quiz result'
      });
    }
  });
}