// Test script to demonstrate chatbot functionality and database sharing

import http from 'http';

// Test the chatbot API endpoints
async function testChatbotAPI() {
  console.log('🧪 Testing WholeWellness Chatbot API...\n');
  
  // Test 1: Health Check
  console.log('1. Testing health endpoint...');
  try {
    const healthData = await makeRequest('GET', 'http://localhost:3001/health');
    console.log('✓ Health check:', healthData.status);
    console.log('  Service:', healthData.service);
    console.log('  Database:', healthData.database);
  } catch (error) {
    console.log('✗ Health check failed:', error.message);
  }
  
  // Test 2: Database Info
  console.log('\n2. Testing database integration...');
  try {
    const dbInfo = await makeRequest('GET', 'http://localhost:3001/api/database/info');
    console.log('✓ Database info retrieved');
    console.log('  Database:', dbInfo.database);
    console.log('  Shared with:', dbInfo.sharedWith);
    console.log('  Tables:', dbInfo.tables.join(', '));
  } catch (error) {
    console.log('✗ Database info failed:', error.message);
  }
  
  // Test 3: Start Chat Session
  console.log('\n3. Testing chat session creation...');
  let sessionId;
  try {
    const sessionData = await makeRequest('POST', 'http://localhost:3001/api/chat/start', {
      userId: 'test_user_123',
      userEmail: 'test@example.com'
    });
    sessionId = sessionData.sessionId;
    console.log('✓ Chat session created');
    console.log('  Session ID:', sessionId);
    console.log('  Welcome:', sessionData.welcomeMessage);
  } catch (error) {
    console.log('✗ Chat session creation failed:', error.message);
  }
  
  // Test 4: Send Messages
  if (sessionId) {
    console.log('\n4. Testing chat messaging...');
    
    const testMessages = [
      'I want to improve my nutrition',
      'What exercises should I do?',
      'I feel stressed lately',
      'How do I set wellness goals?'
    ];
    
    for (const message of testMessages) {
      try {
        const response = await makeRequest('POST', 'http://localhost:3001/api/chat/message', {
          sessionId,
          message,
          userId: 'test_user_123'
        });
        console.log(`✓ Message: "${message}"`);
        console.log(`  Response: "${response.response.substring(0, 100)}..."`);
      } catch (error) {
        console.log(`✗ Message failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Chatbot testing completed!');
}

// Helper function to make HTTP requests
function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Start the chatbot server and run tests
import { spawn } from 'child_process';

console.log('Starting chatbot server...');
const chatbotProcess = spawn('node', ['simple-chatbot.js'], {
  cwd: './chatbot-project',
  stdio: 'pipe'
});

// Wait for server to start
setTimeout(async () => {
  await testChatbotAPI();
  
  // Stop the chatbot server
  chatbotProcess.kill();
  process.exit(0);
}, 2000);