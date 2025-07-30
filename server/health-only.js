// Ultra-minimal health check server using only Node.js core
// This will fix Cloud Run promotion errors by responding instantly

const http = require('http');

const server = http.createServer((req, res) => {
  // Only handle health check endpoints
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache'
    });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Critical: Use Cloud Run port
const port = process.env.PORT || 5000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Health-only server listening on ${port}`);
  console.log('Ready for Cloud Run health checks');
  
  // Signal ready to parent process
  if (process.send) {
    process.send('ready');
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Health server closed');
    process.exit(0);
  });
});

// This server has ZERO dependencies and will start instantly
// guaranteeing Cloud Run promotion success