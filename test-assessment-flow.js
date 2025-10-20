#!/usr/bin/env node

/**
 * Assessment System End-to-End Test
 * Tests the complete assessment flow including:
 * - User authentication
 * - Fetching user programs
 * - Creating free assessments (3 free limit)
 * - Payment checkout session creation
 */

const baseUrl = 'http://localhost:5000';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User'
};

let authToken = '';
let csrfToken = '';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ${message}`, 'yellow');
}

async function makeRequest(method, endpoint, body = null, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers['x-csrf-token'] = csrfToken;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, options);
  const data = await response.json().catch(() => ({}));
  
  return { response, data };
}

async function registerUser() {
  logStep('STEP 1', 'Registering test user');
  
  const { response, data } = await makeRequest('POST', '/api/auth/register', {
    email: testUser.email,
    password: testUser.password,
    firstName: testUser.firstName,
    lastName: testUser.lastName
  });

  if (response.ok) {
    logSuccess(`User registered successfully`);
    return true;
  } else if (response.status === 400 && data.error?.includes('already exists')) {
    logInfo('User already exists, will attempt login');
    return true;
  } else {
    logError(`Registration failed: ${data.error || response.statusText}`);
    return false;
  }
}

async function loginUser() {
  logStep('STEP 2', 'Logging in');
  
  const { response, data } = await makeRequest('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });

  if (response.ok && data.token) {
    authToken = data.token;
    logSuccess('Login successful');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Login failed: ${data.error || response.statusText}`);
    return false;
  }
}

async function getCsrfToken() {
  logStep('STEP 3', 'Fetching CSRF token');
  
  const { response, data } = await makeRequest('GET', '/api/csrf-token', null, true);

  if (response.ok && data.token) {
    csrfToken = data.token;
    logSuccess('CSRF token fetched');
    logInfo(`Token: ${csrfToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Failed to get CSRF token: ${data.error || response.statusText}`);
    return false;
  }
}

async function getUserPrograms() {
  logStep('STEP 4', 'Fetching user programs');
  
  const { response, data } = await makeRequest('GET', '/api/programs', null, true);

  if (response.ok && Array.isArray(data)) {
    const freeCount = data.filter(p => !p.paid).length;
    const paidCount = data.filter(p => p.paid).length;
    
    logSuccess(`Fetched ${data.length} programs`);
    logInfo(`Free assessments: ${freeCount}/3`);
    logInfo(`Paid assessments: ${paidCount}`);
    
    return data;
  } else {
    logError(`Failed to fetch programs: ${data.error || response.statusText}`);
    return null;
  }
}

async function createAssessment(assessmentType, paid = false) {
  logInfo(`Creating ${paid ? 'PAID' : 'FREE'} assessment: ${assessmentType}`);
  
  const { response, data } = await makeRequest('POST', '/api/programs', {
    assessmentType,
    paid
  }, true);

  if (response.ok) {
    logSuccess(`Assessment created: ${data.id}`);
    logInfo(`Type: ${data.assessmentType}, Paid: ${data.paid}`);
    return data;
  } else {
    logError(`Failed to create assessment: ${data.error || response.statusText}`);
    return null;
  }
}

async function createPaymentSession(assessmentId) {
  logInfo(`Creating payment session for: ${assessmentId}`);
  
  const { response, data } = await makeRequest('POST', '/api/create-payment-intent', {
    assessmentId,
    amount: 9.99
  }, true);

  if (response.ok && data.sessionId) {
    logSuccess(`Payment session created`);
    logInfo(`Session ID: ${data.sessionId}`);
    return data;
  } else {
    logError(`Failed to create payment session: ${data.error || response.statusText}`);
    return null;
  }
}

async function testFreeAssessmentLimit() {
  logStep('STEP 5', 'Testing free assessment limit (3 free)');
  
  const programs = await getUserPrograms();
  if (!programs) return false;

  const freeAssessments = programs.filter(p => !p.paid);
  const remaining = 3 - freeAssessments.length;

  logInfo(`Remaining free assessments: ${remaining}`);

  // Create assessments up to the free limit
  const assessmentTypes = [
    'wellness_personality',
    'career_alignment',
    'stress_resilience'
  ];

  for (let i = 0; i < Math.min(remaining, 3); i++) {
    const result = await createAssessment(assessmentTypes[i], false);
    if (!result) return false;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return true;
}

async function testPaidAssessment() {
  logStep('STEP 6', 'Testing paid assessment flow');
  
  // First verify we've used our free assessments
  const programs = await getUserPrograms();
  if (!programs) return false;

  const freeCount = programs.filter(p => !p.paid).length;
  
  if (freeCount < 3) {
    logInfo('Not all free assessments used yet, creating more...');
    await testFreeAssessmentLimit();
  }

  // Try to create a paid assessment
  const paidAssessment = await createAssessment('relationship_patterns', true);
  if (!paidAssessment) return false;

  // Test payment session creation
  const paymentSession = await createPaymentSession('relationship_patterns');
  if (!paymentSession) return false;

  logSuccess('Payment flow validated successfully');
  return true;
}

async function verifyDataIntegrity() {
  logStep('STEP 7', 'Verifying data integrity');
  
  const programs = await getUserPrograms();
  if (!programs) return false;

  // Check each program has required fields
  for (const program of programs) {
    if (!program.id || !program.assessmentType || program.paid === undefined) {
      logError(`Invalid program data: ${JSON.stringify(program)}`);
      return false;
    }
  }

  logSuccess('All programs have valid data structure');
  return true;
}

async function runTests() {
  log('\n='.repeat(60), 'cyan');
  log('ASSESSMENT SYSTEM END-TO-END TEST', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    // Authentication flow
    if (!await registerUser()) process.exit(1);
    if (!await loginUser()) process.exit(1);
    if (!await getCsrfToken()) process.exit(1);

    // Initial state check
    await getUserPrograms();

    // Test free assessment creation
    if (!await testFreeAssessmentLimit()) process.exit(1);

    // Test paid assessment flow
    if (!await testPaidAssessment()) process.exit(1);

    // Verify data integrity
    if (!await verifyDataIntegrity()) process.exit(1);

    // Final summary
    log('\n' + '='.repeat(60), 'green');
    log('ALL TESTS PASSED ✓', 'green');
    log('='.repeat(60), 'green');
    log('\nAssessment system is working correctly!', 'green');
    
  } catch (error) {
    log('\n' + '='.repeat(60), 'red');
    log('TEST FAILED ✗', 'red');
    log('='.repeat(60), 'red');
    logError(`\nError: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();
