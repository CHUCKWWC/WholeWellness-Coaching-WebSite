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

// Start the production server
console.log('🌟 Starting production server...');

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