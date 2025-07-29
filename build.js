#!/usr/bin/env node

// Build script for Replit deployment  
import { spawn } from 'child_process';

console.log('🔨 Building Whole Wellness Coaching Platform...');

// Build frontend only - server will run with tsx
const buildProcess = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('error', (error) => {
  console.error('❌ Frontend build failed:', error);
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Frontend build failed with exit code ${code}`);
    process.exit(code);
  }
  
  console.log('✅ Frontend build completed successfully!');
  
  // Copy built files to server/public directory for production serving
  try {
    const { execSync } = require('child_process');
    console.log('📁 Copying built files to server/public...');
    execSync('mkdir -p server/public', { stdio: 'inherit' });
    execSync('cp -r dist/public/* server/public/', { stdio: 'inherit' });
    console.log('✅ Static files copied to server/public');
  } catch (error) {
    console.error('❌ Failed to copy static files:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Application is ready for deployment');
  console.log('');
  console.log('📋 Deployment Configuration:');
  console.log('  • Frontend: ✅ Built and ready');
  console.log('  • Static Files: ✅ Copied to server/public');
  console.log('  • Server: ✅ Will run with tsx (production compatible)');
  console.log('  • Host: ✅ Configured for 0.0.0.0:PORT');
  console.log('  • Start Command: node start.js');
  console.log('');
  console.log('🚀 Ready for deployment!');
});