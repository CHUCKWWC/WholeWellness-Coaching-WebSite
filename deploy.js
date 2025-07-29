#!/usr/bin/env node

// Deployment configuration script
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploy() {
  console.log('Configuring deployment...');
  
  try {
    // Ensure dist directory exists
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    // Create a simple server start script for production
    const serverScript = `
const { spawn } = require('child_process');

const port = process.env.PORT || 5000;
console.log('Starting production server on port', port);

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: port
  }
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log('Server process exited with code', code);
  process.exit(code);
});
`;
    
    // Write the production server script
    fs.writeFileSync('dist/server.js', serverScript);
    
    console.log('Deployment configuration complete!');
    console.log('');
    console.log('To deploy this application:');
    console.log('1. Use "node start.js" as the run command');
    console.log('2. Ensure PORT environment variable is set');
    console.log('3. The application will be available on the configured port');
    
  } catch (error) {
    console.error('Deployment configuration failed:', error);
    process.exit(1);
  }
}

deploy();