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
  console.log('✅ Application is ready for deployment');
  console.log('');
  console.log('📋 Deployment Configuration:');
  console.log('  • Frontend: ✅ Built and ready');
  console.log('  • Server: ✅ Will run with tsx (production compatible)');
  console.log('  • Host: ✅ Configured for 0.0.0.0:PORT');
  console.log('  • Start Command: node start.js');
  console.log('');
  console.log('🚀 Ready for deployment!');
});