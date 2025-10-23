const fetch = require('node-fetch');

async function testAssessmentSubmission() {
  console.log('Testing assessment submission with DrizzleStorage...\n');

  // Test data for submitting an assessment
  const assessmentData = {
    assessmentTypeId: 'weight-loss-intake',
    responses: {
      currentWeight: '180',
      goalWeight: '160',
      height: '5\'10"',
      dietaryPreferences: ['vegetarian', 'low-carb'],
      exerciseLevel: 'moderate',
      healthConditions: ['none'],
      motivation: 'health and wellness'
    }
  };

  try {
    // First, we need to login to get auth cookie
    console.log('1. Logging in to get authentication...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@wholewellness.org',
        password: 'Admin123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('Login failed, trying to create test user...');
      // Try to create a test user first
      const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'TestUser123!',
          firstName: 'Test',
          lastName: 'User'
        })
      });
      
      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.log('Registration response:', error);
      }
      
      // Try login again with test user
      const testLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'TestUser123!'
        })
      });
      
      if (!testLoginResponse.ok) {
        throw new Error('Failed to authenticate');
      }
      
      const cookies = testLoginResponse.headers.get('set-cookie');
      console.log('✓ Logged in successfully with test user\n');
      
      // Test the assessment submission
      console.log('2. Submitting assessment...');
      const submitResponse = await fetch('http://localhost:5000/api/assessments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify(assessmentData)
      });

      const result = await submitResponse.json();
      
      if (submitResponse.ok) {
        console.log('✓ Assessment submitted successfully!');
        console.log('Assessment ID:', result.assessmentId);
        console.log('Response:', JSON.stringify(result, null, 2));
        console.log('\n✅ SUCCESS: DrizzleStorage assessment methods are working correctly!');
      } else {
        console.log('✗ Assessment submission failed');
        console.log('Error:', result);
        console.log('\n❌ FAILED: Assessment submission error');
      }
      
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✓ Logged in successfully\n');
    
    // Test the assessment submission
    console.log('2. Submitting assessment...');
    const submitResponse = await fetch('http://localhost:5000/api/assessments/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(assessmentData)
    });

    const result = await submitResponse.json();
    
    if (submitResponse.ok) {
      console.log('✓ Assessment submitted successfully!');
      console.log('Assessment ID:', result.assessmentId);
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('\n✅ SUCCESS: DrizzleStorage assessment methods are working correctly!');
    } else {
      console.log('✗ Assessment submission failed');
      console.log('Error:', result);
      console.log('\n❌ FAILED: Assessment submission error');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    console.log('\n❌ FAILED: Could not complete assessment submission test');
  }
}

// Run the test
testAssessmentSubmission();