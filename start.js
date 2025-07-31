#!/usr/bin/env node

import { spawn } from 'child_process';
import { chdir } from 'process';

console.log('🚀 Starting WholeWellness Coaching Platform...');

// Change to the WholeWellness-Coaching-WebSite directory
try {
  chdir('WholeWellness-Coaching-WebSite');
  console.log('📁 Changed to WholeWellness-Coaching-WebSite directory');
} catch (error) {
  console.error('❌ Failed to change directory:', error.message);
  process.exit(1);
}

// For Cloud Run deployments, use minimal health check server first
// This ensures immediate health check responses during deployment
if (process.env.NODE_ENV === 'production' && process.env.PORT) {
  console.log('🏥 Starting Cloud Run optimized health check server...');
  
  const healthServer = spawn('node', ['server/cloud-run-health-only.js'], {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env }
  });

  healthServer.on('error', (error) => {
    console.error('❌ Health check server failed to start:', error.message);
    process.exit(1);
  });

  healthServer.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ Health check server exited with code:', code);
      process.exit(code);
    }
  });
} else {
  // For development, use the full server
  console.log('🌟 Starting development server...');
  
  const startProcess = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    shell: true
  });

  startProcess.on('error', (error) => {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  });

  startProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ Server exited with code:', code);
      process.exit(code);
    }
  });
}