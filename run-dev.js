#!/usr/bin/env node

/**
 * Development server runner for Replit
 * This script starts the development server with proper error handling
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Whole Wellness Coaching Platform Development Server...');
console.log('📍 Environment: development');
console.log('🌐 Port: 5000');

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔴 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  server.kill('SIGTERM');
});