#!/usr/bin/env node

// Comprehensive fix for assessment failures
const fixAssessmentFailures = async () => {
  console.log('🔧 Fixing Assessment System Failures\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('Step 1: Testing authentication with test coach...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chuck', password: 'chucknice1' })
    });
    
    const loginData = await loginResponse.json();
    console.log(`Login: ${loginResponse.status === 200 ? '✅' : '❌'}`);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Cannot test assessments without authentication');
      return;
    }
    
    const sessionCookie = loginResponse.headers.get('set-cookie');
    console.log('Session cookie:', sessionCookie ? '✅' : '❌');
    
    console.log('\nStep 2: Testing authenticated assessment endpoints...');
    
    // Test with proper session cookie
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie || ''
    };
    
    const userAssessmentsResponse = await fetch(`${baseUrl}/api/assessments/user`, { headers });
    const userAssessmentsData = await userAssessmentsResponse.json();
    console.log(`User assessments: ${userAssessmentsResponse.status === 200 ? '✅' : '❌'}`);
    console.log('Data:', userAssessmentsData);
    
    const assessmentTypesResponse = await fetch(`${baseUrl}/api/assessments/assessment-types`, { headers });
    const assessmentTypesData = await assessmentTypesResponse.json();
    console.log(`Assessment types: ${assessmentTypesResponse.status === 200 ? '✅' : '❌'}`);
    console.log('Available types:', assessmentTypesData.length || 0);
    
    console.log('\nStep 3: Testing database table existence...');
    
    // Test if required tables exist by trying to create assessment data
    const testAssessment = {
      assessmentTypeId: 'weight-loss-intake',
      responses: { 
        age: '30',
        weight: '150',
        goal: 'Lose weight'
      }
    };
    
    const submitResponse = await fetch(`${baseUrl}/api/assessments/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testAssessment)
    });
    
    const submitData = await submitResponse.json();
    console.log(`Assessment submission: ${submitResponse.status === 200 ? '✅' : '❌'}`);
    console.log('Submit result:', submitData);
    
    console.log('\n🎯 DIAGNOSIS:');
    
    if (userAssessmentsResponse.status === 200) {
      console.log('✅ Authentication and routing working properly');
      console.log('✅ User assessments endpoint operational');
      
      if (assessmentTypesData && assessmentTypesData.length > 0) {
        console.log('✅ Assessment types configured');
      } else {
        console.log('⚠️  No assessment types found - need to seed database');
      }
      
      if (submitResponse.status === 200) {
        console.log('✅ Assessment submission working');
        console.log('🎉 ASSESSMENT SYSTEM FULLY OPERATIONAL');
      } else {
        console.log('❌ Assessment submission failing');
        console.log('   Likely missing database tables or schema issues');
      }
    } else {
      console.log('❌ Authentication or database connection issues');
    }
    
  } catch (error) {
    console.error('❌ Fix attempt failed:', error.message);
  }
};

fixAssessmentFailures();