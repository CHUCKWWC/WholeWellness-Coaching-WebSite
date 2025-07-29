#!/usr/bin/env node

// Debug certification course access issues
const debugCertificationAccess = async () => {
  console.log('🔍 Debugging Certification Course Access Issues\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: Check course materials endpoint
    console.log('1️⃣ Testing Course Materials Endpoint...');
    const materialsResponse = await fetch(`${baseUrl}/api/public/course-materials/1`);
    const materialsData = await materialsResponse.text();
    console.log(`   Status: ${materialsResponse.status}`);
    console.log(`   Content-Type: ${materialsResponse.headers.get('content-type')}`);
    console.log(`   Response: ${materialsData.substring(0, 200)}...`);
    console.log('');
    
    // Test 2: Check certification progress endpoint (will likely fail without auth)
    console.log('2️⃣ Testing Certification Progress Endpoint...');
    const progressResponse = await fetch(`${baseUrl}/api/coach/certification-progress`);
    const progressData = await progressResponse.text();
    console.log(`   Status: ${progressResponse.status}`);
    console.log(`   Content-Type: ${progressResponse.headers.get('content-type')}`);
    console.log(`   Response: ${progressData.substring(0, 200)}...`);
    console.log('');
    
    // Test 3: Check if certification courses endpoint exists
    console.log('3️⃣ Testing Certification Courses Endpoint...');
    const coursesResponse = await fetch(`${baseUrl}/api/coach/certification-courses`);
    const coursesData = await coursesResponse.text();
    console.log(`   Status: ${coursesResponse.status}`);
    console.log(`   Content-Type: ${coursesResponse.headers.get('content-type')}`);
    console.log(`   Response: ${coursesData.substring(0, 200)}...`);
    console.log('');
    
    console.log('📋 Summary:');
    console.log('   - Course materials endpoint should return JSON with success: true');
    console.log('   - Certification progress likely needs authentication');
    console.log('   - User should be able to click "Access Materials" to open Google Drive');
    console.log('   - If nothing is happening, there may be a frontend JavaScript error');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
};

debugCertificationAccess();