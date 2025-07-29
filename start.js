#!/usr/bin/env node

// Production startup script optimized for Cloud Run deployment
import { spawn } from 'child_process';

// Set production environment for deployment
process.env.NODE_ENV = 'production';

// Use PORT from environment or default to 5000
const port = process.env.PORT || 5000;
process.env.PORT = port;

// Cloud Run specific optimizations
process.env.HOST = '0.0.0.0';

console.log('Starting Whole Wellness Coaching Platform...');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${port}`);
console.log(`Host: ${process.env.HOST}`);

// Health check endpoint timeout for Cloud Run - increased to 60 seconds
const startupTimeout = setTimeout(() => {
  console.error('Application startup timeout - Cloud Run health check failed');
  process.exit(1);
}, 60000); // 60 seconds to allow for Cloud Run health checks

// Start the application using tsx with optimized settings
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Optimize for faster startup
    NODE_OPTIONS: '--max-old-space-size=512'
  }
});

child.on('error', (error) => {
  clearTimeout(startupTimeout);
  console.error('Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  clearTimeout(startupTimeout);
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});

// Listen for ready signal from server
child.on('message', (message) => {
  if (message === 'ready') {
    clearTimeout(startupTimeout);
    console.log('✓ Server is ready for health checks - startup timeout cleared');
  }
});

// Handle process termination gracefully for Cloud Run
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  clearTimeout(startupTimeout);
  
  if (child && !child.killed) {
    child.kill(signal);
    
    // Force kill after timeout
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }, 8000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));