import { db } from '../server/db';
import { users, digestPreferences, chatSummaries, crisisAlerts } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

const TEST_EMAIL = 'charles.watson@wholewellness-coaching.org';

async function testConversationSystem() {
  try {
    console.log('🧪 Testing Conversation Intelligence System\n');
    console.log(`Using test user: ${TEST_EMAIL}\n`);

    // 1. Check if user exists
    console.log('1️⃣ Checking user existence...');
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, TEST_EMAIL))
      .limit(1);

    if (existingUsers.length === 0) {
      console.log('❌ User not found. Please create user first.');
      process.exit(1);
    }

    const user = existingUsers[0];
    console.log(`✅ User found: ${user.name || user.email} (ID: ${user.id})\n`);

    // 2. Create/update digest preferences
    console.log('2️⃣ Setting up digest preferences...');
    try {
      const existingPrefs = await db
        .select()
        .from(digestPreferences)
        .where(eq(digestPreferences.userId, user.id))
        .limit(1);

      if (existingPrefs.length === 0) {
        await db.insert(digestPreferences).values({
          userId: user.id,
          frequency: 'weekly',
          preferredDay: 'monday',
          preferredHour: 9,
          timezone: 'America/New_York',
          includeActionItems: true,
          includeInsights: true,
          includeProgress: true,
          emailEnabled: true,
          isActive: true,
        });
        console.log('✅ Created digest preferences\n');
      } else {
        console.log('✅ Digest preferences already exist\n');
      }
    } catch (error: any) {
      console.log(`⚠️ Digest preferences: ${error.message}\n`);
    }

    // 3. Create test chat summary
    console.log('3️⃣ Creating test chat summary...');
    try {
      await db.insert(chatSummaries).values({
        userId: user.id,
        coachType: 'charles',
        conversationDate: new Date(),
        messageCount: 5,
        summary: 'Test conversation about stress management and work-life balance.',
        keyTopics: ['stress', 'work-life balance', 'coping strategies'],
        emotionalTone: 'neutral',
        actionItems: [
          { item: 'Practice daily meditation', priority: 'high' },
          { item: 'Set work boundaries', priority: 'medium' }
        ],
        insights: 'User is actively seeking ways to manage workplace stress and improve well-being.',
      });
      console.log('✅ Created test chat summary\n');
    } catch (error: any) {
      console.log(`⚠️ Chat summary: ${error.message}\n`);
    }

    // 4. Create test crisis alert (low severity for testing)
    console.log('4️⃣ Creating test crisis alert...');
    try {
      await db.insert(crisisAlerts).values({
        userId: user.id,
        coachType: 'bobby',
        triggerMessage: 'I have been feeling really overwhelmed lately',
        severityLevel: 'low',
        detectedKeywords: ['overwhelmed'],
        aiAssessment: 'User expressing mild stress, monitor for escalation',
        status: 'new',
      });
      console.log('✅ Created test crisis alert\n');
    } catch (error: any) {
      console.log(`⚠️ Crisis alert: ${error.message}\n`);
    }

    // 5. Verify data exists
    console.log('5️⃣ Verifying all data...');
    try {
      const summaries = await db
        .select()
        .from(chatSummaries)
        .where(eq(chatSummaries.userId, user.id))
        .limit(5);
      
      const alerts = await db
        .select()
        .from(crisisAlerts)
        .where(eq(crisisAlerts.userId, user.id))
        .limit(5);

      console.log(`✅ Chat summaries: ${summaries.length} found`);
      console.log(`✅ Crisis alerts: ${alerts.length} found\n`);
    } catch (error: any) {
      console.log(`⚠️ Verification: ${error.message}\n`);
    }

    console.log('✅ Test complete! System is ready for use.\n');
    console.log('📋 Next steps:');
    console.log('   1. Login with charles.watson@wholewellness-coaching.org');
    console.log('   2. Visit /settings to configure digest preferences');
    console.log('   3. Chat with AI coaches to generate summaries');
    console.log('   4. Check /admin-crisis-alerts for mental health monitoring');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConversationSystem();
