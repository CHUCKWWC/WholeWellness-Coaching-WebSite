import cron from 'node-cron';
import { db } from './db';
import { digestPreferences, chatSummaries, sentDigests } from '../shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { sendDigestEmail } from './sendgrid-service';
import { generateConversationSummary } from './chat-summarization-service';

/**
 * Automated Digest Scheduler
 * Sends personalized conversation digests based on user preferences
 * Runs every hour and checks if any users need digests sent
 */

interface DigestSchedule {
  userId: string;
  email: string;
  frequency: string;
  preferredDay?: string;
  preferredHour: number;
  timezone: string;
  includeActionItems: boolean;
  includeInsights: boolean;
  includeProgress: boolean;
}

// Get date range for digest based on frequency
function getDateRange(frequency: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (frequency) {
    case 'daily':
      start.setDate(start.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      break;
    case 'biweekly':
      start.setDate(start.getDate() - 14);
      break;
    case 'monthly':
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}

// Check if it's time to send digest based on user preferences
function shouldSendDigest(pref: DigestSchedule, now: Date): boolean {
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: pref.timezone }));
  const currentHour = userTime.getHours();
  const currentDay = userTime.toLocaleDateString('en-US', { weekday: 'lowercase', timeZone: pref.timezone });

  // Check hour match
  if (currentHour !== pref.preferredHour) {
    return false;
  }

  // For daily digests, send every day at preferred hour
  if (pref.frequency === 'daily') {
    return true;
  }

  // For weekly/biweekly/monthly, check day match
  if (pref.preferredDay && currentDay !== pref.preferredDay.toLowerCase()) {
    return false;
  }

  return true;
}

// Send digest to a user
async function sendUserDigest(pref: DigestSchedule) {
  try {
    const { start, end } = getDateRange(pref.frequency);

    // Get user's conversation summaries for the period
    const summaries = await db
      .select()
      .from(chatSummaries)
      .where(
        and(
          eq(chatSummaries.userId, pref.userId),
          gte(chatSummaries.conversationDate, start),
          lte(chatSummaries.conversationDate, end)
        )
      )
      .orderBy(chatSummaries.conversationDate);

    // Skip if no conversations in period
    if (summaries.length === 0) {
      console.log(`No conversations for user ${pref.userId} in ${pref.frequency} period`);
      return;
    }

    // Aggregate insights and action items
    const allActionItems = summaries
      .map(s => s.actionItems as any[])
      .flat()
      .filter(Boolean);

    const insights = summaries
      .map(s => s.insights)
      .filter(Boolean)
      .join('\n\n');

    const conversationSummaries = summaries.map(s => ({
      coach: s.coachType,
      date: s.conversationDate,
      summary: s.summary,
      emotionalTone: s.emotionalTone,
      topics: s.keyTopics || [],
    }));

    // Send email digest
    await sendDigestEmail({
      to: pref.email,
      subject: `Your ${pref.frequency.charAt(0).toUpperCase() + pref.frequency.slice(1)} Wellness Digest`,
      actionItems: pref.includeActionItems ? allActionItems : [],
      insights: pref.includeInsights ? insights : undefined,
      conversationSummaries,
      periodStart: start,
      periodEnd: end,
    });

    // Record sent digest
    await db.insert(sentDigests).values({
      userId: pref.userId,
      digestType: pref.frequency,
      periodStart: start,
      periodEnd: end,
      summaryCount: summaries.length,
      content: {
        actionItems: allActionItems,
        insights,
        conversations: conversationSummaries.length,
      },
    });

    console.log(`✅ Sent ${pref.frequency} digest to user ${pref.userId} (${pref.email})`);
  } catch (error) {
    console.error(`❌ Failed to send digest to user ${pref.userId}:`, error);
  }
}

// Main scheduler function
async function checkAndSendDigests() {
  try {
    const now = new Date();
    console.log(`🔄 Checking digests at ${now.toISOString()}`);

    // Get all active digest preferences
    const preferences = await db
      .select({
        userId: digestPreferences.userId,
        email: sql<string>`users.email`,
        frequency: digestPreferences.frequency,
        preferredDay: digestPreferences.preferredDay,
        preferredHour: digestPreferences.preferredHour,
        timezone: digestPreferences.timezone,
        includeActionItems: digestPreferences.includeActionItems,
        includeInsights: digestPreferences.includeInsights,
        includeProgress: digestPreferences.includeProgress,
      })
      .from(digestPreferences)
      .innerJoin(sql`users`, sql`users.id = digest_preferences.user_id`)
      .where(
        and(
          eq(digestPreferences.isActive, true),
          eq(digestPreferences.emailEnabled, true)
        )
      );

    // Check each user's schedule
    for (const pref of preferences) {
      if (shouldSendDigest(pref, now)) {
        await sendUserDigest(pref);
      }
    }

    console.log(`✅ Digest check completed`);
  } catch (error) {
    console.error('❌ Error in digest scheduler:', error);
  }
}

// Initialize scheduler
export function initializeDigestScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', checkAndSendDigests);
  console.log('📅 Digest scheduler initialized (runs every hour)');
}

// Manual trigger for testing
export async function sendDigestNow(userId: string) {
  try {
    const pref = await db
      .select({
        userId: digestPreferences.userId,
        email: sql<string>`users.email`,
        frequency: digestPreferences.frequency,
        preferredDay: digestPreferences.preferredDay,
        preferredHour: digestPreferences.preferredHour,
        timezone: digestPreferences.timezone,
        includeActionItems: digestPreferences.includeActionItems,
        includeInsights: digestPreferences.includeInsights,
        includeProgress: digestPreferences.includeProgress,
      })
      .from(digestPreferences)
      .innerJoin(sql`users`, sql`users.id = digest_preferences.user_id`)
      .where(eq(digestPreferences.userId, userId))
      .limit(1);

    if (pref.length === 0) {
      throw new Error('User digest preferences not found');
    }

    await sendUserDigest(pref[0]);
    return { success: true, message: 'Digest sent successfully' };
  } catch (error: any) {
    throw new Error(`Failed to send digest: ${error.message}`);
  }
}
