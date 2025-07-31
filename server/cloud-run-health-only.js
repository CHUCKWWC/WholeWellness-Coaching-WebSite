#!/usr/bin/env node

// Ultra-minimal Cloud Run health check server
// This server responds ONLY to health checks with zero dependencies
// Ensures immediate startup and instant health check responses

import http from 'http';

// Create the most minimal possible server
const server = http.createServer((req, res) => {
  // Handle health check requests immediately
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({ 
      status: 'healthy',
      timestamp: Date.now(),
      service: 'Whole Wellness Coaching Platform'
    }));
  } else {
    // Return 404 for any other requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Use Cloud Run PORT environment variable
const port = process.env.PORT || 5000;

// Start listening immediately
server.listen(port, '0.0.0.0', () => {
  console.log(`Health check server listening on port ${port}`);
  
  // Signal ready to parent process if running under process manager
  if (process.send) {
    process.send('ready');
  }
});

// Handle errors gracefully
server.on('error', (error) => {
  console.error('Health check server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});