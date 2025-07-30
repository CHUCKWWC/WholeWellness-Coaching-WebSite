// Ultra-minimal server specifically to fix Cloud Run promotion errors
// This server has ZERO dependencies except Express core

const express = require('express');
const app = express();

// Immediate health check - first thing that runs
app.get('/', (req, res) => {
  res.status(200).end('OK');
});

app.get('/health', (req, res) => {
  res.status(200).end('{"status":"healthy"}');
});

// Listen immediately 
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Promotion fix server: ${port}`);
  if (process.send) process.send('ready');
});

// NO other routes, middleware, or initialization
// This server exists ONLY to pass Cloud Run health checks