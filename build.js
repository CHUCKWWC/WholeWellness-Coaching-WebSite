#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('Building WholeWellness Coaching Platform...');
    
    // Build frontend with Vite
    console.log('Building frontend...');
    await execAsync('npx vite build');
    console.log('✓ Frontend built successfully');
    
    // Build server with esbuild
    console.log('Building server...');
    await execAsync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    console.log('✓ Server built successfully');
    
    console.log('✓ Build completed successfully!');
    console.log('Ready for deployment to Cloud Run.');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();