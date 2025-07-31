// Test script to verify health check endpoints work correctly
const http = require('http');

// Test the health-only server
console.log('🔍 Testing health-only server...');

const testServer = (port, serverName) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(`http://localhost:${port}/`, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✓ ${serverName} - Root endpoint: ${res.statusCode} - ${data.trim()} (${responseTime}ms)`);
        
        // Test health endpoint
        const healthStart = Date.now();
        const healthReq = http.get(`http://localhost:${port}/health`, (healthRes) => {
          const healthResponseTime = Date.now() - healthStart;
          let healthData = '';
          
          healthRes.on('data', (chunk) => {
            healthData += chunk;
          });
          
          healthRes.on('end', () => {
            console.log(`✓ ${serverName} - Health endpoint: ${healthRes.statusCode} - ${healthData.trim()} (${healthResponseTime}ms)`);
            resolve(true);
          });
        });
        
        healthReq.on('error', () => {
          console.log(`❌ ${serverName} - Health endpoint failed`);
          resolve(false);
        });
      });
    });
    
    req.on('error', () => {
      console.log(`❌ ${serverName} - Root endpoint failed`);
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      console.log(`⏰ ${serverName} - Request timeout`);
      resolve(false);
    }, 5000);
  });
};

// Test the health-only server
const testHealthOnly = async () => {
  console.log('Starting health-only server...');
  
  const { spawn } = require('child_process');
  const healthServer = spawn('node', ['start-health-only.cjs']);
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    await testServer(5000, 'Health-Only Server');
  } catch (error) {
    console.error('Error testing health-only server:', error);
  }
  
  healthServer.kill();
  console.log('Health-only server stopped\n');
};

// Run tests
testHealthOnly().then(() => {
  console.log('✅ Health endpoint testing completed');
});