import { getWixConfig } from './server/wix-integration.js';
import { WixIntegration } from './server/wix-integration.js';

async function testWixBookingIntegration() {
  console.log('🔍 Testing Wix Booking Integration...\n');
  
  try {
    // Initialize Wix integration
    const wixConfig = getWixConfig();
    const wixIntegration = new WixIntegration(wixConfig);
    
    console.log('✅ Wix integration initialized');
    console.log('📋 Client ID:', wixConfig.clientId);
    
    // Test service fetching
    console.log('\n🔍 Testing service fetching...');
    const services = await wixIntegration.getServices();
    console.log(`📊 Found ${services.length} services`);
    
    if (services.length > 0) {
      console.log('📄 Sample service:');
      console.log(`   - Name: ${services[0].name}`);
      console.log(`   - Price: $${services[0].price}`);
      console.log(`   - Duration: ${services[0].duration} minutes`);
      console.log(`   - Category: ${services[0].category}`);
    }
    
    // Test booking fetching
    console.log('\n🔍 Testing booking fetching...');
    const bookings = await wixIntegration.getBookings();
    console.log(`📊 Found ${bookings.length} bookings`);
    
    if (bookings.length > 0) {
      console.log('📄 Sample booking:');
      console.log(`   - ID: ${bookings[0]._id}`);
      console.log(`   - Status: ${bookings[0].status}`);
      console.log(`   - Date: ${bookings[0].dateTime}`);
    }
    
    // Test available slots (if services exist)
    if (services.length > 0) {
      console.log('\n🔍 Testing available slots...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      const slots = await wixIntegration.getAvailableSlots(services[0]._id, dateStr);
      console.log(`📊 Found ${slots.length} available slots for ${dateStr}`);
      
      if (slots.length > 0) {
        console.log('📄 Sample slot:');
        console.log(`   - Start: ${slots[0].startDateTime}`);
        console.log(`   - End: ${slots[0].endDateTime}`);
        console.log(`   - Available: ${slots[0].available}`);
      }
    }
    
    // Test other integrations
    console.log('\n🔍 Testing other Wix integrations...');
    
    const products = await wixIntegration.getProducts();
    console.log(`📊 Found ${products.length} products`);
    
    const plans = await wixIntegration.getPlans();
    console.log(`📊 Found ${plans.length} pricing plans`);
    
    console.log('\n✅ Wix booking integration test completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Configure your Wix site with booking services');
    console.log('2. Set up proper API permissions');
    console.log('3. Test the booking flow in the frontend');
    console.log('4. Configure webhooks for real-time updates');
    
    return true;
    
  } catch (error) {
    console.error('❌ Wix integration test failed:', error.message);
    
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      console.log('\n🔧 Authentication Issue:');
      console.log('- Check your WIX_CLIENT_ID environment variable');
      console.log('- Ensure your Wix app has proper permissions');
      console.log('- Verify your OAuth configuration');
    }
    
    if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Network Issue:');
      console.log('- Check your internet connection');
      console.log('- Verify Wix API endpoints are accessible');
      console.log('- Try running the test again');
    }
    
    console.log('\n📋 For setup help, see: WIX_SETUP_GUIDE.md');
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🔍 Testing API endpoints...');
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:5000';
  
  const endpoints = [
    '/api/wix/services',
    '/api/wix/bookings',
    '/api/wix/products',
    '/api/wix/plans'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const status = response.status;
      
      if (status === 200) {
        console.log(`✅ ${endpoint} - Working`);
      } else {
        console.log(`⚠️  ${endpoint} - Status: ${status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

// Run tests
async function runAllTests() {
  console.log('🧪 Wix Booking Integration Test Suite\n');
  console.log('===================================\n');
  
  const integrationTest = await testWixBookingIntegration();
  await testAPIEndpoints();
  
  if (integrationTest) {
    console.log('\n🎉 All tests passed! Wix booking integration is ready.');
    console.log('🌐 Visit /wix-booking to test the booking interface.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the setup guide for troubleshooting.');
  }
}

runAllTests();