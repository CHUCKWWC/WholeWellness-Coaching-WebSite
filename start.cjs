const http = require('http');

const server = http.createServer((req, res) => {
  // Instant health check response for all routes
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache'
  });
  res.end('OK');
});

// Critical: Use Cloud Run port with instant binding
const port = process.env.PORT || 5000;

server.listen(port, '0.0.0.0', () => {
  // Signal ready to parent process immediately
  if (process.send) {
    process.send('ready');
  }
});

// Handle graceful shutdown for Cloud Run
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});