#!/usr/bin/env node

// Test the complete certification flow to identify the real problem
const testCertificationFlow = async () => {
  console.log('🏥 Testing Complete Certification Flow\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('Step 1: Testing certification progress (should now work without auth)...');
    const progressResponse = await fetch(`${baseUrl}/api/coach/certification-progress`);
    const progressText = await progressResponse.text();
    console.log(`Status: ${progressResponse.status}`);
    if (progressResponse.status === 200) {
      console.log('✅ Certification progress accessible');
      const progressData = JSON.parse(progressText);
      console.log(`Found ${progressData.length} modules`);
    } else {
      console.log('❌ Still failing:', progressText.substring(0, 100));
    }
    
    console.log('\nStep 2: Testing course materials endpoints...');
    for (let i = 1; i <= 3; i++) {
      const materialsResponse = await fetch(`${baseUrl}/api/public/course-materials/${i}`);
      const materialsData = await materialsResponse.json();
      console.log(`Course ${i}: ${materialsResponse.status === 200 ? '✅' : '❌'} - ${materialsData.courseTitle}`);
      if (materialsData.folderUrl) {
        console.log(`  Google Drive: ${materialsData.folderUrl}`);
      }
    }
    
    console.log('\nStep 3: Testing certification courses endpoint...');
    const coursesResponse = await fetch(`${baseUrl}/api/coach/certification-courses`);
    console.log(`Courses endpoint: ${coursesResponse.status === 200 ? '✅' : '❌'}`);
    
    console.log('\n🎯 SOLUTION SUMMARY:');
    console.log('1. Visit the certification dashboard page in your browser');
    console.log('2. The page should now load without authentication errors');
    console.log('3. Click "Access Course Materials" buttons to open Google Drive');
    console.log('4. Your Google Drive folder contains the real course content');
    console.log('\n📂 Your course materials are at:');
    console.log('https://drive.google.com/drive/folders/1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testCertificationFlow();