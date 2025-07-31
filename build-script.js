#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('Starting build process...');
    
    // Run npm install with legacy peer deps
    console.log('Installing dependencies...');
    await execAsync('npm install --legacy-peer-deps');
    
    // Run vite build
    console.log('Building frontend...');
    await execAsync('npx vite build');
    
    // Run esbuild for server
    console.log('Building server...');
    await execAsync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    
    console.log('Build completed successfully!');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();