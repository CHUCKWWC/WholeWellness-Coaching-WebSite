#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import { chdir } from 'process';

console.log('🚀 Starting deployment build process...');

// Change to the WholeWellness-Coaching-WebSite directory
try {
  chdir('WholeWellness-Coaching-WebSite');
  console.log('📁 Changed to WholeWellness-Coaching-WebSite directory');
} catch (error) {
  console.error('❌ Failed to change directory:', error.message);
  process.exit(1);
}

// Build the application using the existing build script
console.log('🔨 Building frontend and backend...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed with exit code:', code);
    process.exit(code);
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📦 Application ready for deployment');
});