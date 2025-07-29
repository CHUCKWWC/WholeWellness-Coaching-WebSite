// Test registration after database fix
import fetch from 'node-fetch';

async function testRegistration() {
  console.log('🧪 Testing user registration...');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRegistration();