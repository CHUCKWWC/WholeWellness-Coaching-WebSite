#!/usr/bin/env node

// Debug assessment routing issues
const debugAssessmentRouting = async () => {
  console.log('🔍 Debugging Assessment Routing Issues\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('Step 1: Testing assessment/user endpoint...');
    const userAssessmentsResponse = await fetch(`${baseUrl}/api/assessments/user`);
    console.log(`Status: ${userAssessmentsResponse.status}`);
    console.log(`Content-Type: ${userAssessmentsResponse.headers.get('content-type')}`);
    
    const responseText = await userAssessmentsResponse.text();
    if (responseText.includes('<!DOCTYPE html>')) {
      console.log('❌ ISSUE: Returning HTML instead of JSON (routing problem)');
      console.log('   This means the assessment routes are not properly mounted');
    } else {
      console.log('✅ Returning proper API response');
      console.log('Response preview:', responseText.substring(0, 100));
    }
    
    console.log('\nStep 2: Testing assessment-types endpoint...');
    const typesResponse = await fetch(`${baseUrl}/api/assessments/assessment-types`);
    console.log(`Assessment types: ${typesResponse.status === 200 ? '✅' : '❌'}`);
    
    console.log('\nStep 3: Testing other endpoints...');
    const mentalWellnessResponse = await fetch(`${baseUrl}/api/mental-wellness/resources`);
    console.log(`Mental wellness: ${mentalWellnessResponse.status === 200 ? '✅' : '❌'}`);
    
    console.log('\n🎯 DIAGNOSIS:');
    if (responseText.includes('<!DOCTYPE html>')) {
      console.log('The assessment routes are not properly mounted in the Express app.');
      console.log('Frontend calls to /api/assessments/* are being handled by Vite instead of Express.');
      console.log('Need to check routes.ts for proper assessment route mounting.');
    } else {
      console.log('Assessment routing appears to be working correctly.');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

debugAssessmentRouting();