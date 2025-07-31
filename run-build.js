#!/usr/bin/env node

/**
 * Build script for production deployment
 * This script handles the complete build process for the WholeWellness platform
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔨 Building WholeWellness Coaching Platform...');

function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    childProcess.on('error', reject);
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function build() {
  try {
    // Install dependencies
    await runCommand('npm', ['install'], 'Installing dependencies');
    
    // Build frontend
    await runCommand('npx', ['vite', 'build'], 'Building frontend');
    
    // Build backend
    await runCommand('npx', ['esbuild', 'server/index.ts', '--platform=node', '--packages=external', '--bundle', '--format=esm', '--outdir=dist'], 'Building backend');
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();