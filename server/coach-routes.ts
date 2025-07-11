import { Router } from "express";
import { storage } from "./supabase-client-storage";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { z } from "zod";

const router = Router();

// Coach profile management
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getCoachProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Failed to fetch coach profile' });
  }
});

router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const profileData = req.body;
    
    const profile = await storage.updateCoachProfile(userId, profileData);
    res.json(profile);
  } catch (error) {
    console.error('Error updating coach profile:', error);
    res.status(500).json({ error: 'Failed to update coach profile' });
  }
});

// Client management
router.get('/clients', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const clients = await storage.getCoachClients(userId);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching coach clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.get('/clients/:clientId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { clientId } = req.params;
    
    const client = await storage.getCoachClient(userId, clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.patch('/clients/:clientId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { clientId } = req.params;
    const updateData = req.body;
    
    const client = await storage.updateCoachClient(userId, clientId, updateData);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Session notes management
router.get('/session-notes', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const clientId = req.query.clientId as string;
    
    const sessionNotes = await storage.getCoachSessionNotes(userId, { limit, offset, clientId });
    res.json(sessionNotes);
  } catch (error) {
    console.error('Error fetching session notes:', error);
    res.status(500).json({ error: 'Failed to fetch session notes' });
  }
});

router.post('/session-notes', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const sessionNoteData = {
      ...req.body,
      coachId: userId
    };
    
    const sessionNote = await storage.createSessionNote(sessionNoteData);
    res.json(sessionNote);
  } catch (error) {
    console.error('Error creating session note:', error);
    res.status(500).json({ error: 'Failed to create session note' });
  }
});

router.get('/session-notes/:noteId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { noteId } = req.params;
    
    const sessionNote = await storage.getSessionNote(userId, parseInt(noteId));
    
    if (!sessionNote) {
      return res.status(404).json({ error: 'Session note not found' });
    }
    
    res.json(sessionNote);
  } catch (error) {
    console.error('Error fetching session note:', error);
    res.status(500).json({ error: 'Failed to fetch session note' });
  }
});

router.put('/session-notes/:noteId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { noteId } = req.params;
    const updateData = req.body;
    
    const sessionNote = await storage.updateSessionNote(userId, parseInt(noteId), updateData);
    res.json(sessionNote);
  } catch (error) {
    console.error('Error updating session note:', error);
    res.status(500).json({ error: 'Failed to update session note' });
  }
});

// Availability management
router.get('/availability', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const availability = await storage.getCoachAvailability(userId);
    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

router.put('/availability', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const availabilityData = req.body;
    
    const availability = await storage.updateCoachAvailability(userId, availabilityData);
    res.json(availability);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Message templates
router.get('/message-templates', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const templates = await storage.getCoachMessageTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching message templates:', error);
    res.status(500).json({ error: 'Failed to fetch message templates' });
  }
});

router.post('/message-templates', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const templateData = {
      ...req.body,
      coachId: userId
    };
    
    const template = await storage.createMessageTemplate(templateData);
    res.json(template);
  } catch (error) {
    console.error('Error creating message template:', error);
    res.status(500).json({ error: 'Failed to create message template' });
  }
});

router.put('/message-templates/:templateId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { templateId } = req.params;
    const updateData = req.body;
    
    const template = await storage.updateMessageTemplate(userId, parseInt(templateId), updateData);
    res.json(template);
  } catch (error) {
    console.error('Error updating message template:', error);
    res.status(500).json({ error: 'Failed to update message template' });
  }
});

router.delete('/message-templates/:templateId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { templateId } = req.params;
    
    await storage.deleteMessageTemplate(userId, parseInt(templateId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message template:', error);
    res.status(500).json({ error: 'Failed to delete message template' });
  }
});

// Client communications
router.get('/communications', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const clientId = req.query.clientId as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const communications = await storage.getCoachClientCommunications(userId, { clientId, limit, offset });
    res.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

router.post('/communications', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const communicationData = {
      ...req.body,
      coachId: userId
    };
    
    const communication = await storage.createClientCommunication(communicationData);
    res.json(communication);
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({ error: 'Failed to create communication' });
  }
});

// Coach metrics and analytics
router.get('/metrics', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const period = req.query.period as string || 'current_month';
    
    const metrics = await storage.getCoachMetrics(userId, period);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching coach metrics:', error);
    res.status(500).json({ error: 'Failed to fetch coach metrics' });
  }
});

router.get('/analytics/dashboard', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const [
      totalClients,
      activeSessions,
      completedSessions,
      averageRating,
      monthlyRevenue,
      upcomingSessions,
      recentActivity
    ] = await Promise.all([
      storage.getCoachTotalClients(userId),
      storage.getCoachActiveSessions(userId),
      storage.getCoachCompletedSessions(userId),
      storage.getCoachAverageRating(userId),
      storage.getCoachMonthlyRevenue(userId),
      storage.getCoachUpcomingSessions(userId),
      storage.getCoachRecentActivity(userId)
    ]);
    
    res.json({
      totalClients,
      activeSessions,
      completedSessions,
      averageRating,
      monthlyRevenue,
      upcomingSessions,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching coach dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch coach dashboard analytics' });
  }
});

// Credentials and banking
router.get('/credentials', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const credentials = await storage.getCoachCredentials(userId);
    res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

router.post('/credentials', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const credentialData = {
      ...req.body,
      coachId: userId
    };
    
    const credential = await storage.createCoachCredential(credentialData);
    res.json(credential);
  } catch (error) {
    console.error('Error creating credential:', error);
    res.status(500).json({ error: 'Failed to create credential' });
  }
});

router.get('/banking', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const banking = await storage.getCoachBanking(userId);
    res.json(banking);
  } catch (error) {
    console.error('Error fetching banking info:', error);
    res.status(500).json({ error: 'Failed to fetch banking information' });
  }
});

router.put('/banking', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const bankingData = req.body;
    
    const banking = await storage.updateCoachBanking(userId, bankingData);
    res.json(banking);
  } catch (error) {
    console.error('Error updating banking info:', error);
    res.status(500).json({ error: 'Failed to update banking information' });
  }
});

// Schedule management
router.get('/schedule', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const schedule = await storage.getCoachSchedule(userId, startDate, endDate);
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

router.post('/schedule/block-time', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startTime, endTime, reason } = req.body;
    
    const blockedTime = await storage.blockCoachTime(userId, startTime, endTime, reason);
    res.json(blockedTime);
  } catch (error) {
    console.error('Error blocking time:', error);
    res.status(500).json({ error: 'Failed to block time' });
  }
});

// Export coach data
router.get('/export/clients', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const format = req.query.format as string || 'csv';
    
    const clientData = await storage.exportCoachClientData(userId, format);
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=coach-clients.${format}`);
    res.send(clientData);
  } catch (error) {
    console.error('Error exporting client data:', error);
    res.status(500).json({ error: 'Failed to export client data' });
  }
});

router.get('/export/sessions', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const format = req.query.format as string || 'csv';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const sessionData = await storage.exportCoachSessionData(userId, format, startDate, endDate);
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=coach-sessions.${format}`);
    res.send(sessionData);
  } catch (error) {
    console.error('Error exporting session data:', error);
    res.status(500).json({ error: 'Failed to export session data' });
  }
});

export { router as coachRoutes };