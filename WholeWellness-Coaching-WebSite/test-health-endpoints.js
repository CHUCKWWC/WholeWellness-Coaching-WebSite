// Test script to verify health check endpoints work correctly
import express from 'express';
import { createServer } from 'http';

const app = express();

// Add immediate health check endpoint for Cloud Run (exactly as implemented)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create HTTP server first
const server = createServer(app);

// Use PORT environment variable for Cloud Run deployment, fallback to 3000 for testing
const port = process.env.PORT || 3000;

// Start server immediately for health checks
server.listen(port, "0.0.0.0", () => {
  console.log(`Test server running on port ${port}`);
  
  // Test the endpoints after a brief delay
  setTimeout(() => {
    Promise.all([
      fetch(`http://localhost:${port}/`).then(r => r.json()),
      fetch(`http://localhost:${port}/health`).then(r => r.json())
    ]).then(([rootResponse, healthResponse]) => {
      console.log('Root endpoint response:', rootResponse);
      console.log('Health endpoint response:', healthResponse);
      console.log('✅ Health check endpoints working correctly!');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Health check test failed:', error);
      process.exit(1);
    });
  }, 1000);
});