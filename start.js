#!/usr/bin/env node

// Production startup script for Replit deployment
const { spawn } = require('child_process');
const path = require('path');

// Change to the project directory
process.chdir(path.join(__dirname, 'WholeWellness-Coaching-WebSite'));

// Set production environment
process.env.NODE_ENV = 'production';

// Use PORT from environment or default to 5000
const port = process.env.PORT || 5000;
process.env.PORT = port;

console.log('Starting Whole Wellness Coaching Platform...');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${port}`);

// Start the application using tsx directly since esbuild has issues in Replit
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});