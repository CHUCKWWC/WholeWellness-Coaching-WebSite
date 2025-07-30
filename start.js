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

console.log('🚀 Starting Whole Wellness Coaching Platform...');
console.log(`📋 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${port}`);
console.log(`🏠 Host: ${process.env.HOST}`);
console.log(`⏰ Startup timeout: 120 seconds`);
console.log(`📅 Started at: ${new Date().toISOString()}`);

// Health check endpoint timeout for Cloud Run - increased to 120 seconds for better reliability
const startupTimeout = setTimeout(() => {
  console.error('Application startup timeout - Cloud Run health check failed after 120 seconds');
  console.log('This may indicate server initialization issues or slow dependency loading');
  process.exit(1);
}, 120000); // 120 seconds to allow for Cloud Run health checks and slow startups

// Start the application using the Cloud Run optimized server
console.log('🔧 Starting Cloud Run optimized server...');
const child = spawn('npx', ['tsx', 'server/cloud-run-optimized.js'], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  shell: true,
  env: {
    ...process.env,
    // Optimize for faster startup and stability
    NODE_OPTIONS: '--max-old-space-size=512',
    // Cloud Run deployment guide optimizations
    DEPLOYMENT_HEALTH_CHECK: 'enabled'
  }
});

console.log(`📋 Child process PID: ${child.pid}`);

child.on('error', (error) => {
  clearTimeout(startupTimeout);
  console.error('❌ Failed to start application:', error);
  console.error('This could indicate tsx not found or server file issues');
  process.exit(1);
});

child.on('exit', (code, signal) => {
  clearTimeout(startupTimeout);
  if (signal) {
    console.log(`📤 Application terminated by signal ${signal}`);
  } else {
    console.log(`📤 Application exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Listen for ready signal from server
child.on('message', (message) => {
  if (message === 'ready') {
    readySignalReceived = true;
    clearTimeout(startupTimeout);
    console.log('✅ Server is ready for health checks - startup timeout cleared');
    console.log('✅ Application successfully initialized and ready to handle requests');
    console.log('🌐 Cloud Run health checks should now pass');
  }
});

// Add timeout for ready signal
let readySignalReceived = false;
setTimeout(() => {
  if (!readySignalReceived) {
    console.warn('⚠️  No ready signal received within 90 seconds - server may be slow to initialize');
  }
}, 90000);

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