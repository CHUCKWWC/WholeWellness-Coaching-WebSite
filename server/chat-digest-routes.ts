import { Router, type Request, Response } from 'express';
import { db } from './db';
import { 
  chatSummaries, 
  digestPreferences, 
  sentDigests,
  crisisAlerts,
  insertChatSummarySchema,
  insertDigestPreferenceSchema,
  type ChatSummary,
  type DigestPreference
} from '@shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { 
  summarizeConversation, 
  generateDigestSummary,
  extractActionItemsFromSummaries,
  getCoachDisplayName,
  formatDateForDigest,
  calculateNextDigestDate,
  assessCrisisSeverity,
  type ConversationMessage
} from './chat-summarization-service';
import { sendDigestEmail, sendCrisisAlertEmail, type DigestEmailData } from './sendgrid-service';

const router = Router();

// POST /api/chat/summarize - Create a conversation summary
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { messages, coachType } = req.body as { 
      messages: ConversationMessage[], 
      coachType: string 
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages required' });
    }

    // Generate AI summary
    const result = await summarizeConversation(messages, coachType);

    // Save summary to database
    const [summary] = await db.insert(chatSummaries).values({
      userId,
      coachType,
      conversationDate: new Date(),
      messageCount: messages.length,
      summary: result.summary,
      keyTopics: result.keyTopics,
      emotionalTone: result.emotionalTone,
      actionItems: result.actionItems as any,
      insights: result.insights,
      fullTranscript: messages.map(m => `${m.role}: ${m.content}`).join('\n')
    }).returning();

    // If crisis detected, create alert
    if (result.crisisDetected && result.crisisKeywords) {
      const severity = assessCrisisSeverity(result.crisisKeywords, result.crisisAssessment || '');
      
      await db.insert(crisisAlerts).values({
        userId,
        coachType,
        triggerMessage: messages[messages.length - 1].content,
        severityLevel: severity,
        detectedKeywords: result.crisisKeywords,
        aiAssessment: result.crisisAssessment || 'Crisis keywords detected',
        status: 'new'
      });

      // Send alert email to admin (using first admin email as fallback)
      const adminEmail = process.env.ADMIN_EMAIL || 'support@wholewellnesscoaching.org';
      const user = (req as any).user;
      await sendCrisisAlertEmail(
        adminEmail,
        user?.firstName || user?.email || 'User',
        severity,
        result.crisisAssessment || 'Crisis keywords detected in conversation'
      );
    }

    res.json({
      success: true,
      summary,
      crisisDetected: result.crisisDetected
    });
  } catch (error) {
    console.error('Error creating summary:', error);
    res.status(500).json({ error: 'Failed to create summary' });
  }
});

// GET /api/chat/summaries - Get user's conversation summaries
router.get('/summaries', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { startDate, endDate, coachType } = req.query;

    let query = db.select().from(chatSummaries).where(eq(chatSummaries.userId, userId));

    const summaries = await query.orderBy(desc(chatSummaries.conversationDate));

    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// GET /api/digest/preferences - Get user's digest preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [preferences] = await db.select()
      .from(digestPreferences)
      .where(eq(digestPreferences.userId, userId));

    if (!preferences) {
      // Create default preferences
      const [newPrefs] = await db.insert(digestPreferences).values({
        userId,
        frequency: 'weekly',
        preferredDay: 'monday',
        preferredHour: 9,
        timezone: 'America/New_York',
        emailEnabled: true
      }).returning();
      
      return res.json(newPrefs);
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching digest preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/digest/preferences - Update digest preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validatedData = insertDigestPreferenceSchema.parse({
      ...req.body,
      userId
    });

    const [updated] = await db.insert(digestPreferences)
      .values(validatedData)
      .onConflictDoUpdate({
        target: digestPreferences.userId,
        set: {
          ...validatedData,
          updatedAt: new Date()
        }
      })
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error updating digest preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// POST /api/digest/send-now - Manually trigger digest email
router.post('/send-now', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = (req as any).user;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get preferences
    const [prefs] = await db.select()
      .from(digestPreferences)
      .where(eq(digestPreferences.userId, userId));

    if (!prefs?.emailEnabled) {
      return res.status(400).json({ error: 'Email digests are disabled' });
    }

    // Calculate period based on frequency
    const endDate = new Date();
    const startDate = new Date();
    
    if (prefs.frequency === 'daily') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (prefs.frequency === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (prefs.frequency === 'biweekly') {
      startDate.setDate(startDate.getDate() - 14);
    } else if (prefs.frequency === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get summaries for period
    const summaries = await db.select()
      .from(chatSummaries)
      .where(
        and(
          eq(chatSummaries.userId, userId),
          gte(chatSummaries.conversationDate, startDate),
          lte(chatSummaries.conversationDate, endDate)
        )
      )
      .orderBy(desc(chatSummaries.conversationDate));

    if (summaries.length === 0) {
      return res.status(400).json({ error: 'No conversations to summarize in this period' });
    }

    // Extract action items
    const actionItems = extractActionItemsFromSummaries(summaries);

    // Generate overview insights
    const overviewInsight = await generateDigestSummary(
      summaries, 
      user.firstName || user.email
    );

    // Prepare email data
    const emailData: DigestEmailData = {
      userName: user.firstName || user.email.split('@')[0],
      periodStart: formatDateForDigest(startDate),
      periodEnd: formatDateForDigest(endDate),
      conversationCount: summaries.length,
      summaries: summaries.map(s => ({
        coachName: getCoachDisplayName(s.coachType),
        date: formatDateForDigest(new Date(s.conversationDate)),
        summary: s.summary,
        keyTopics: s.keyTopics || [],
        emotionalTone: s.emotionalTone || 'neutral',
        actionItems: s.actionItems as any,
        insights: s.insights || undefined
      })),
      actionItems: actionItems.map(item => ({
        item: item.item,
        priority: item.priority,
        coach: getCoachDisplayName(item.coach)
      })),
      insights: [overviewInsight]
    };

    // Send email
    const success = await sendDigestEmail(user.email, emailData, prefs.frequency as any);

    if (success) {
      // Record sent digest
      await db.insert(sentDigests).values({
        userId,
        digestType: prefs.frequency,
        periodStart: startDate,
        periodEnd: endDate,
        summaryCount: summaries.length,
        content: emailData as any
      });

      // Update last sent timestamp
      await db.update(digestPreferences)
        .set({ lastSentAt: new Date() })
        .where(eq(digestPreferences.userId, userId));

      res.json({ 
        success: true, 
        message: 'Digest sent successfully',
        summaryCount: summaries.length
      });
    } else {
      res.status(500).json({ error: 'Failed to send digest email' });
    }
  } catch (error) {
    console.error('Error sending digest:', error);
    res.status(500).json({ error: 'Failed to send digest' });
  }
});

// GET /api/digest/history - Get sent digest history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const history = await db.select()
      .from(sentDigests)
      .where(eq(sentDigests.userId, userId))
      .orderBy(desc(sentDigests.sentAt))
      .limit(20);

    res.json(history);
  } catch (error) {
    console.error('Error fetching digest history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/crisis-alerts - Get crisis alerts (admin only)
router.get('/crisis-alerts', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const alerts = await db.select()
      .from(crisisAlerts)
      .orderBy(desc(crisisAlerts.createdAt))
      .limit(50);

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching crisis alerts:', error);
    res.status(500).json({ error: 'Failed to fetch crisis alerts' });
  }
});

export default router;
