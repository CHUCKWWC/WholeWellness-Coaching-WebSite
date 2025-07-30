#!/usr/bin/env node

// Development startup script for Replit
import { spawn } from 'child_process';

// Set development environment
process.env.NODE_ENV = 'development';
const port = process.env.PORT || 5000;
process.env.PORT = port;
process.env.HOST = '0.0.0.0';

console.log('🚀 Starting Whole Wellness Coaching Platform (Development)...');
console.log(`📋 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${port}`);
console.log(`🏠 Host: ${process.env.HOST}`);
console.log(`📅 Started at: ${new Date().toISOString()}`);

// Start the application using tsx for development with hot reload
console.log('🔧 Starting development server with tsx...');
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=512'
  }
});

console.log(`📋 Child process PID: ${child.pid}`);

child.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`📤 Development server terminated by signal ${signal}`);
  } else {
    console.log(`📤 Development server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down development server...');
  child.kill('SIGTERM');
});