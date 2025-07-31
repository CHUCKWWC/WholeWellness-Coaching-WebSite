#!/usr/bin/env node

// Cloud Run deployment entry point
// Automatically chooses the appropriate server based on environment

console.log('🚀 Starting Whole Wellness Coaching Platform...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${process.env.PORT || 5000}`);

// Check if this is a Cloud Run production deployment
const isCloudRun = process.env.NODE_ENV === 'production' && process.env.K_SERVICE;
const isHealthCheckOnly = process.env.HEALTH_CHECK_ONLY === 'true';

if (isCloudRun || isHealthCheckOnly) {
  // Use minimal health check server for Cloud Run promotion phase
  console.log('🏥 Starting minimal health check server for Cloud Run...');
  import('./server/cloud-run-health-only.js');
} else {
  // Use full application server for development and normal production
  console.log('🔧 Starting full application server...');
  import('./server/index.js');
}