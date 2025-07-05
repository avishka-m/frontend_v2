// Simple test to check API connectivity
// Run this in the browser console to test API endpoints

async function testAPIConnectivity() {
  console.log('🔍 Testing API connectivity...\n');
  
  try {
    // Test 1: Check if the server is running
    const healthCheck = await fetch('/api/health');
    console.log('✅ Health check response:', healthCheck.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  try {
    // Test 2: Get orders
    const ordersResponse = await fetch('/api/orders');
    const ordersData = await ordersResponse.json();
    console.log('✅ Orders API response:', ordersData);
    
    if (ordersData && ordersData.length > 0) {
      console.log('📋 Sample order structure:', ordersData[0]);
    }
  } catch (error) {
    console.log('❌ Orders API failed:', error.message);
  }
  
  try {
    // Test 3: Test order status update (with a fake order ID)
    const testOrderId = 'TEST123';
    const statusResponse = await fetch(`/api/orders/${testOrderId}/status?new_status=shipped`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (statusResponse.status === 404) {
      console.log('✅ Status update endpoint exists (404 expected for test order)');
    } else {
      console.log('✅ Status update response:', statusResponse.status);
    }
  } catch (error) {
    console.log('❌ Status update API failed:', error.message);
  }
  
  console.log('\n🔍 Testing complete. Check results above.');
}

// Test orderService directly
async function testOrderService() {
  console.log('🔍 Testing orderService...\n');
  
  try {
    // Import orderService (this might not work in console)
    console.log('📦 Checking if orderService is available...');
    
    // Test order fetching
    console.log('📋 Testing order fetching...');
    
    // Note: This test is meant to be run in the browser console
    // where the orderService would be available through React DevTools
    
    console.log('💡 To test orderService:');
    console.log('1. Open React DevTools');
    console.log('2. Find a dashboard component');
    console.log('3. Check if orders are being fetched');
    console.log('4. Look for console logs when clicking buttons');
    
  } catch (error) {
    console.log('❌ OrderService test failed:', error.message);
  }
}

// Combined test function
async function runFullTest() {
  await testAPIConnectivity();
  await testOrderService();
}

console.log('🚀 API Test Script Loaded');
console.log('Run testAPIConnectivity() to test API endpoints');
console.log('Run runFullTest() to run all tests');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAPIConnectivity, testOrderService, runFullTest };
}
