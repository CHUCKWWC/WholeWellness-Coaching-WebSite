#!/usr/bin/env node

// Build script for Replit deployment  
const { spawn, execSync } = require('child_process');

// Build frontend only - server will run with tsx
const buildProcess = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('error', (error) => {
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
  
  // Copy built files to server/public directory for production serving
  try {
    execSync('mkdir -p server/public', { stdio: 'inherit' });
    execSync('cp -r dist/public/* server/public/', { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
});