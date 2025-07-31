#!/usr/bin/env node

// Ultra-minimal Cloud Run health check server
// This server responds ONLY to health checks with zero dependencies
// Ensures immediate startup and instant health check responses for Cloud Run promotion

import http from 'http';

// Create the most minimal possible server for instant responses
const server = http.createServer((req, res) => {
  const url = req.url;
  const timestamp = new Date().toISOString();
  
  // Handle health check requests immediately with no dependencies
  if (url === '/' || url === '/health') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      status: 'healthy',
      timestamp,
      service: 'Whole Wellness Coaching Platform',
      version: '1.0.0',
      uptime: process.uptime()
    }));
  } else if (url === '/ready') {
    // Readiness probe for Kubernetes/Cloud Run
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({ 
      status: 'ready',
      timestamp,
      memory: process.memoryUsage(),
      pid: process.pid
    }));
  } else {
    // Return minimal 404 for any other requests
    res.writeHead(404, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({ error: 'Not Found', path: url }));
  }
});

// Use Cloud Run PORT environment variable
const port = parseInt(process.env.PORT) || 5000;
const host = '0.0.0.0';

// Start listening immediately with no startup delays
server.listen(port, host, () => {
  console.log(`🚀 Health check server ready on ${host}:${port}`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`⚡ Startup time: ${process.uptime()}s`);
  
  // Signal ready to parent process if running under process manager
  if (process.send) {
    process.send('ready');
  }
});

// Handle errors gracefully without crashing
server.on('error', (error) => {
  console.error('❌ Health check server error:', error);
  // Exit with error code for Cloud Run to detect failure
  process.exit(1);
});

// Handle connection errors
server.on('clientError', (err, socket) => {
  console.warn('Client connection error:', err.message);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// Graceful shutdown for Cloud Run SIGTERM (10 second timeout)
process.on('SIGTERM', () => {
  console.log('📡 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Health check server closed successfully');
    process.exit(0);
  });
  
  // Force exit after 8 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('⏰ Forced shutdown after timeout');
    process.exit(1);
  }, 8000);
});

process.on('SIGINT', () => {
  console.log('📡 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Health check server closed successfully');
    process.exit(0);
  });
});