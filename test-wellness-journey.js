// Test script to verify wellness journey endpoints
const fetch = require('node-fetch');

async function testWellnessJourneyEndpoints() {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('Testing wellness journey endpoints...\n');
  
  // Test 1: Get current wellness journey (should return 401 without auth)
  console.log('Test 1: GET /wellness-journey/current');
  try {
    const response = await fetch(`${baseUrl}/wellness-journey/current`);
    console.log('  Status:', response.status);
    const data = await response.json();
    console.log('  Response:', data);
    console.log('  ✓ Endpoint is responding\n');
  } catch (error) {
    console.error('  ✗ Error:', error.message, '\n');
  }
  
  // Test 2: Check if the generate endpoint exists
  console.log('Test 2: POST /wellness-journey/generate');
  try {
    const response = await fetch(`${baseUrl}/wellness-journey/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('  Status:', response.status);
    const data = await response.json();
    console.log('  Response:', data);
    console.log('  ✓ Endpoint is responding\n');
  } catch (error) {
    console.error('  ✗ Error:', error.message, '\n');
  }
  
  console.log('Test complete!');
}

// Run the tests
testWellnessJourneyEndpoints();