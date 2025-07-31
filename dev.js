#!/usr/bin/env node

// Development server entry point
// Redirects to the actual development server in the correct directory

console.log('🚀 Starting WholeWellness Coaching Platform - Development Mode...');
console.log(`📊 Environment: development`);
console.log(`🌐 Port: ${process.env.PORT || 5000}`);

// Import the development server from the server directory
import('./server/index.ts');