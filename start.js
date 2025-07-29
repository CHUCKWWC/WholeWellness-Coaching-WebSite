#!/usr/bin/env node

// Production start script for deployment
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function start() {
  console.log('Starting WholeWellness Coaching Platform...');
  
  try {
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    // Use PORT environment variable for deployment, fallback to 5000
    const port = process.env.PORT || 5000;
    process.env.PORT = port;
    
    console.log(`Server starting on port ${port}...`);
    
    // Start the server using tsx for TypeScript execution
    const { spawn } = await import('child_process');
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
      console.log(`Server process exited with code ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();