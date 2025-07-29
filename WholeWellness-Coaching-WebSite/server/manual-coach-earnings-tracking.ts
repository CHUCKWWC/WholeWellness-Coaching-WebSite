import { CoachEarningsSystem } from "./coach-earnings-system";

/**
 * Manual tracking endpoint for testing coach earnings
 * This can be called directly to test the coach role upgrade system
 */
export async function manualTrackCoachEarnings(userId: string, amount: number, source: string = 'manual_test') {
  try {
    console.log(`🔧 Manual coach earnings tracking initiated...`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Amount: $${amount}`);
    console.log(`   Source: ${source}`);
    
    await CoachEarningsSystem.trackEarnings(userId, amount, source);
    
    const summary = await CoachEarningsSystem.getEarningsSummary(userId);
    
    return {
      success: true,
      message: `Earnings tracked successfully for user ${userId}`,
      summary
    };
    
  } catch (error) {
    console.error('❌ Manual earnings tracking failed:', error);
    return {
      success: false,
      message: `Failed to track earnings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      summary: null
    };
  }
}

/**
 * Helper function to check coach eligibility
 */
export async function checkCoachStatus(userId: string) {
  try {
    const isEligible = await CoachEarningsSystem.checkCoachEligibility(userId);
    const summary = await CoachEarningsSystem.getEarningsSummary(userId);
    
    return {
      success: true,
      eligible: isEligible,
      summary
    };
    
  } catch (error) {
    console.error('❌ Coach status check failed:', error);
    return {
      success: false,
      eligible: false,
      summary: null
    };
  }
}