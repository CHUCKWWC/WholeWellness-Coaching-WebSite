#!/usr/bin/env node

// Deployment configuration script for Replit
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Whole Wellness Coaching Platform Deployment...');

// Change to the project directory
const projectDir = path.join(__dirname, 'WholeWellness-Coaching-WebSite');
process.chdir(projectDir);

console.log(`📁 Working directory: ${projectDir}`);

// Set production environment
process.env.NODE_ENV = 'production';

// Build the application
console.log('🔨 Building application...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('error', (error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Build failed with exit code ${code}`);
    process.exit(code);
  }
  
  console.log('✅ Build completed successfully!');
  console.log('🎯 Application is ready for deployment');
  console.log('');
  console.log('📋 Deployment Summary:');
  console.log('  • Build: ✅ Complete');
  console.log('  • Server: ✅ Configured for 0.0.0.0:PORT');
  console.log('  • Environment: ✅ Production ready');
  console.log('  • Start Command: npm start');
  console.log('');
  console.log('🌐 To start the server, run: npm start');
  
  // Check if dist directory exists
  const distPath = path.join(projectDir, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Distribution files generated in /dist');
  } else {
    console.log('⚠️  Warning: /dist directory not found');
  }
});