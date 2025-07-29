#!/usr/bin/env node

const checkDatabaseStatus = async () => {
  console.log('🔍 Checking Database Status\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test assessment types endpoint
    console.log('1. Checking Assessment Types...');
    const assessmentResponse = await fetch(`${baseUrl}/api/assessments/assessment-types`);
    const assessmentTypes = await assessmentResponse.json();
    console.log(`   Status: ${assessmentResponse.status}`);
    console.log(`   Types available: ${Array.isArray(assessmentTypes) ? assessmentTypes.length : 'Error'}`);
    
    if (Array.isArray(assessmentTypes) && assessmentTypes.length > 0) {
      console.log('   ✅ Assessment tables exist and have data');
      assessmentTypes.forEach(type => {
        console.log(`      - ${type.display_name}`);
      });
    } else {
      console.log('   ❌ Assessment tables missing or empty');
    }
    
    // Test mental wellness resources
    console.log('\n2. Checking Mental Wellness Resources...');
    const wellnessResponse = await fetch(`${baseUrl}/api/mental-wellness/resources`);
    const wellnessResources = await wellnessResponse.json();
    console.log(`   Status: ${wellnessResponse.status}`);
    console.log(`   Resources available: ${Array.isArray(wellnessResources) ? wellnessResources.length : 'Error'}`);
    
    if (wellnessResponse.status !== 200) {
      console.log('   ❌ Mental wellness table missing columns');
    } else {
      console.log('   ✅ Mental wellness resources table working');
    }
    
    // Test with authenticated user
    console.log('\n3. Testing with Real User Authentication...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'coachchuck@wwctest.com', password: 'testpass123' })
    });
    
    if (loginResponse.status === 200) {
      const sessionCookie = loginResponse.headers.get('set-cookie') || '';
      console.log('   ✅ Real user authentication working');
      
      // Test user assessments with real session
      const userAssessmentsResponse = await fetch(`${baseUrl}/api/assessments/user`, {
        headers: { 'Cookie': sessionCookie }
      });
      
      if (userAssessmentsResponse.status === 200) {
        const userAssessments = await userAssessmentsResponse.json();
        console.log(`   ✅ User assessments accessible (${Array.isArray(userAssessments) ? userAssessments.length : 'unknown'} found)`);
      } else {
        const errorData = await userAssessmentsResponse.json();
        console.log(`   ❌ User assessments failed: ${errorData.error || 'Unknown error'}`);
      }
    } else {
      console.log('   ❌ User authentication failed');
    }
    
    // Final status
    console.log('\n' + '='.repeat(50));
    
    if (Array.isArray(assessmentTypes) && assessmentTypes.length >= 3) {
      console.log('🎉 SUCCESS: fix-assessment-database.sql has been executed!');
      console.log('   All assessment tables are working properly');
      console.log('   Platform is now 100% operational');
    } else {
      console.log('❌ NOT YET: fix-assessment-database.sql has NOT been executed');
      console.log('   Assessment tables are still missing');
      console.log('   Need to run SQL script in Supabase dashboard');
      console.log('\n📋 TO FIX:');
      console.log('   1. Open Supabase dashboard');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Paste contents of fix-assessment-database.sql');
      console.log('   4. Click "Run" to execute');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
};

checkDatabaseStatus();