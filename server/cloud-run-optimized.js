// Cloud Run optimized server following exact deployment guide pattern
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1) MUST be the very first route - trivial root route for health checks
// No DB calls, no session middleware, no file I/O - responds in <10ms
app.get('/', (req, res) => res.status(200).send('OK'));

// 2) Optional dedicated health route 
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 3) Listen on the port Cloud Run expects - CRITICAL: Always read process.env.PORT
const port = process.env.PORT || 5000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on ${port}`);
  console.log('Health checks available at / and /health');
  
  // Signal to parent process that server is ready for health checks
  if (process.send) {
    process.send('ready');
  }
});

// 4) Basic middleware setup (after server starts listening)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 5) Static files serving
app.use(express.static(path.join(__dirname, '../dist/public')));

// 6) GOOD - defer heavy initialization (runs outside request handlers)
(async () => {
  try {
    console.log('Initializing database and session store...');
    
    // Initialize session store and database connections asynchronously
    // This won't block health check responses
    await registerRoutes(app);
    console.log('✓ PostgreSQL session store initialized');
    console.log('✓ Routes registered successfully');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't exit - health checks should still work
  }
})();

// Handle graceful shutdown for Cloud Run
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;