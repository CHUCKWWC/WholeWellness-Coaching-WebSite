// Cloud Run optimized server following exact guidance pattern
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1) Immediate, zero-cost health check (MUST be first)
app.get('/', (req, res) => res.status(200).send('OK'));

// 2) Dedicated health endpoint (optional)
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 3) Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 4) Static files serving
app.use(express.static(path.join(__dirname, '../dist/public')));

async function initializeServer() {
  try {
    // Register all application routes (async operations happen here)
    await registerRoutes(app);
    console.log('✓ Routes registered successfully');
  } catch (error) {
    console.error('Failed to register routes:', error);
    // Don't exit - health checks should still work
  }
}

// Initialize routes asynchronously (non-blocking for health checks)
initializeServer();

// 5) Listen on the port Cloud Run expects
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on ${port}`);
  console.log('Health checks available at / and /health');
});

export default app;