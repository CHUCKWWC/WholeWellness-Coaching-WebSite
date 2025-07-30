#!/usr/bin/env node

// Ultra-minimal Cloud Run health check server - instant startup
const http = require('http');

// Minimal server responding instantly to all requests
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

// Use Cloud Run port
const port = process.env.PORT || 5000;

// Start immediately with minimal logging
server.listen(port, '0.0.0.0', () => {
  console.log(`Ready on ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});