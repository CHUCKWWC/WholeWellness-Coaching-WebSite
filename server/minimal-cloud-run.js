// Minimal Cloud Run server - ONLY health checks, nothing else
import express from 'express';

const app = express();

// MUST be first - instant health check with zero dependencies
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Backup health endpoint  
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Critical: Use Cloud Run port
const port = process.env.PORT || 5000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Health check server listening on ${port}`);
  
  // Signal ready immediately
  if (process.send) {
    process.send('ready');
  }
});

// No middleware, no routes, no database - just health checks
// This eliminates ALL possible delays that cause promotion failures

export default app;