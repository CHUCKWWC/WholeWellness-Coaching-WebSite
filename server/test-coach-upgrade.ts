import { CoachEarningsSystem } from "./coach-earnings-system";
import { storage } from "./supabase-client-storage";

/**
 * Test script to verify coach role upgrade system
 */
async function testCoachUpgrade() {
  try {
    console.log('🧪 Testing Coach Role Upgrade System...\n');
    
    // Test with existing test coach account
    const testUserId = '76703324-b93e-45f6-a893-44f0e0ee41d9'; // coachchuck@wwctest.com
    
    // Get current user status
    const userBefore = await storage.getUser(testUserId);
    if (!userBefore) {
      console.error('❌ Test user not found');
      return;
    }
    
    console.log('📊 BEFORE upgrade:');
    console.log(`   User: ${userBefore.email}`);
    console.log(`   Role: ${userBefore.role}`);
    console.log(`   Earnings: $${userBefore.donationTotal || 0}`);
    console.log('');
    
    // Simulate coach earnings tracking
    console.log('💰 Simulating $99 coach application fee payment...');
    await CoachEarningsSystem.trackEarnings(testUserId, 99.00, 'test_application_fee');
    
    // Get updated user status
    const userAfter = await storage.getUser(testUserId);
    if (!userAfter) {
      console.error('❌ User not found after upgrade');
      return;
    }
    
    console.log('📊 AFTER upgrade:');
    console.log(`   User: ${userAfter.email}`);
    console.log(`   Role: ${userAfter.role}`);
    console.log(`   Earnings: $${userAfter.donationTotal || 0}`);
    console.log('');
    
    // Verify upgrade worked
    const wasUpgraded = userAfter.role === 'coach' && userAfter.donationTotal >= 99;
    
    if (wasUpgraded) {
      console.log('✅ SUCCESS: User successfully upgraded to coach role!');
      console.log('🎉 Coach earnings system is working correctly.');
    } else {
      console.log('❌ FAILED: User was not upgraded to coach role.');
      console.log('   Expected: role="coach", earnings >= $99');
      console.log(`   Actual: role="${userAfter.role}", earnings=$${userAfter.donationTotal}`);
    }
    
    // Test eligibility check
    const isEligible = await CoachEarningsSystem.checkCoachEligibility(testUserId);
    console.log(`\n🎯 Coach eligibility check: ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    
    // Get earnings summary
    const summary = await CoachEarningsSystem.getEarningsSummary(testUserId);
    if (summary) {
      console.log('\n📈 Earnings Summary:');
      console.log(`   Total Earnings: $${summary.totalEarnings}`);
      console.log(`   Role Upgraded: ${summary.roleUpgraded ? 'YES' : 'NO'}`);
      console.log(`   Last Updated: ${summary.lastUpdated}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCoachUpgrade();
}

export { testCoachUpgrade };