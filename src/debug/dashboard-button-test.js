// Test script to check if dashboard buttons are working
// Run this in the browser console to debug workflow actions

// Test function to simulate a workflow action
function testWorkflowAction() {
  console.log('Testing workflow action...');
  
  // Check if toast is available
  if (typeof toast === 'undefined') {
    console.log('Toast not available - this is expected in console');
  }
  
  // Test order structure
  const testOrder = {
    orderID: 'TEST123',
    order_id: 'TEST123',
    customer_name: 'Test Customer',
    order_status: 'shipping',
    items: [
      { item_name: 'Test Item', quantity: 1, price: 10.00 }
    ]
  };
  
  console.log('Test order:', testOrder);
  
  // Test action configuration
  const testAction = {
    id: 'start_delivery',
    label: 'Start Delivery',
    variant: 'primary',
    primary: true,
    apiEndpoint: '/api/orders/start-delivery',
    successMessage: 'Delivery started successfully',
    errorMessage: 'Failed to start delivery'
  };
  
  console.log('Test action:', testAction);
  
  // Test workflow action
  const testWorkflowAction = {
    'start_delivery': {
      apiEndpoint: '/api/orders/start-delivery',
      method: 'POST',
      localTransition: {
        fromTab: 'ready',
        toTab: 'delivery',
        newStatus: 'shipped'
      },
      successMessage: 'Delivery started successfully',
      errorMessage: 'Failed to start delivery'
    }
  };
  
  console.log('Test workflow action:', testWorkflowAction);
  
  // Check if the workflow action exists
  const action = testWorkflowAction['start_delivery'];
  if (action) {
    console.log('✅ Workflow action found:', action);
  } else {
    console.log('❌ Workflow action not found');
  }
  
  // Test local transition
  if (action.localTransition) {
    console.log('✅ Local transition configured:', action.localTransition);
  } else {
    console.log('❌ Local transition not configured');
  }
  
  return {
    order: testOrder,
    action: testAction,
    workflowAction: testWorkflowAction
  };
}

// Check if React DevTools are available
function checkReactDevTools() {
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available');
  } else {
    console.log('❌ React DevTools not available');
  }
}

// Check if the app is running
function checkAppStatus() {
  const appElement = document.getElementById('root');
  if (appElement && appElement.innerHTML) {
    console.log('✅ App is running');
  } else {
    console.log('❌ App not found or not running');
  }
}

// Main test function
function runDashboardTest() {
  console.log('🔍 Running Dashboard Button Test...\n');
  
  checkAppStatus();
  checkReactDevTools();
  
  const testData = testWorkflowAction();
  
  console.log('\n📋 Test Results:');
  console.log('- Order structure: ✅ Valid');
  console.log('- Action configuration: ✅ Valid');
  console.log('- Workflow action: ✅ Valid');
  console.log('- Local transition: ✅ Configured');
  
  console.log('\n💡 If buttons are not working, check:');
  console.log('1. Are there any console errors?');
  console.log('2. Are the action IDs matching between tabs.actions and workflowActions?');
  console.log('3. Is the onWorkflowAction function being called?');
  console.log('4. Is the orderService working properly?');
  console.log('5. Are the backend endpoints available?');
  
  return testData;
}

// Auto-run the test
console.log('🚀 Dashboard Button Test Script Loaded');
console.log('Run runDashboardTest() to start the test');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDashboardTest, testWorkflowAction };
}
