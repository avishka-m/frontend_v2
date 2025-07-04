/**
 * Comprehensive Order Management Test Script
 * Tests the complete order workflow: creation, retrieval, updates, and UI integration
 */

import { orderService, ORDER_STATUS, ORDER_PRIORITY } from './src/services/orderService.js';
import { masterDataService } from './src/services/masterDataService.js';
import { inventoryService } from './src/services/inventoryService.js';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:8000',
  frontendUrl: 'http://localhost:5173',
  testTimeout: 30000
};

// Test data
const TEST_ORDER = {
  customerID: 1,
  shipping_address: '123 Test Street, Test City, TC 12345',
  order_status: ORDER_STATUS.PENDING,
  priority: ORDER_PRIORITY.HIGH,
  notes: 'Test order created by automated test script',
  items: [
    {
      itemID: 1,
      quantity: 2,
      price: 25.99
    },
    {
      itemID: 2,
      quantity: 1,
      price: 15.50
    }
  ]
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAILED ${message}`);
  }
  testResults.details.push({ testName, passed, message });
}

function logSection(sectionName) {
  console.log(`\n🔍 ${sectionName}`);
  console.log('='.repeat(50));
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testOrderCreation() {
  logSection('Order Creation Tests');
  
  try {
    // Test 1: Create a new order
    console.log('Creating test order...');
    const createdOrder = await orderService.createOrder(TEST_ORDER);
    
    logTest('Order Creation', 
      createdOrder && createdOrder.orderID,
      `Order ID: ${createdOrder.orderID}`
    );
    
    // Test 2: Verify order data integrity
    logTest('Order Data Integrity',
      createdOrder.customerID === TEST_ORDER.customerID &&
      createdOrder.shipping_address === TEST_ORDER.shipping_address &&
      createdOrder.order_status === TEST_ORDER.order_status &&
      createdOrder.priority === TEST_ORDER.priority,
      'All order fields match input data'
    );
    
    // Test 3: Verify items are included
    logTest('Order Items Creation',
      createdOrder.items && createdOrder.items.length === TEST_ORDER.items.length,
      `${createdOrder.items?.length || 0} items created`
    );
    
    return createdOrder;
    
  } catch (error) {
    logTest('Order Creation', false, error.message);
    throw error;
  }
}

async function testOrderRetrieval(orderId) {
  logSection('Order Retrieval Tests');
  
  try {
    // Test 1: Get specific order
    console.log(`Retrieving order ${orderId}...`);
    const retrievedOrder = await orderService.getOrder(orderId);
    
    logTest('Single Order Retrieval',
      retrievedOrder && retrievedOrder.orderID === orderId,
      `Retrieved order ${orderId}`
    );
    
    // Test 2: Get all orders
    console.log('Retrieving all orders...');
    const allOrders = await orderService.getOrders();
    
    logTest('All Orders Retrieval',
      Array.isArray(allOrders) && allOrders.length > 0,
      `Retrieved ${allOrders.length} orders`
    );
    
    // Test 3: Verify our test order exists in the list
    const testOrderExists = allOrders.some(order => order.orderID === orderId);
    logTest('Test Order in List',
      testOrderExists,
      'Test order found in orders list'
    );
    
    return retrievedOrder;
    
  } catch (error) {
    logTest('Order Retrieval', false, error.message);
    throw error;
  }
}

async function testOrderUpdates(orderId) {
  logSection('Order Update Tests');
  
  try {
    // Test 1: Update order details
    const updateData = {
      shipping_address: '456 Updated Street, New City, NC 67890',
      order_status: ORDER_STATUS.PROCESSING,
      priority: ORDER_PRIORITY.MEDIUM,
      notes: 'Updated by automated test script'
    };
    
    console.log(`Updating order ${orderId}...`);
    const updatedOrder = await orderService.updateOrder(orderId, updateData);
    
    logTest('Order Update',
      updatedOrder && updatedOrder.shipping_address === updateData.shipping_address,
      'Order details updated successfully'
    );
    
    // Test 2: Update order status specifically
    console.log(`Updating order status to ${ORDER_STATUS.PICKING}...`);
    await orderService.updateOrderStatus(orderId, ORDER_STATUS.PICKING);
    
    const orderAfterStatusUpdate = await orderService.getOrder(orderId);
    logTest('Order Status Update',
      orderAfterStatusUpdate.order_status === ORDER_STATUS.PICKING,
      `Status updated to ${ORDER_STATUS.PICKING}`
    );
    
    return updatedOrder;
    
  } catch (error) {
    logTest('Order Updates', false, error.message);
    throw error;
  }
}

async function testOrderStats() {
  logSection('Order Statistics Tests');
  
  try {
    // Test 1: Get order statistics
    console.log('Retrieving order statistics...');
    const stats = await orderService.getOrderStats();
    
    logTest('Order Statistics',
      stats && typeof stats.total === 'number' && stats.total >= 0,
      `Total orders: ${stats.total}`
    );
    
    // Test 2: Verify statistics structure
    const requiredFields = ['total', 'pending', 'processing', 'picked', 'shipped', 'delivered'];
    const hasAllFields = requiredFields.every(field => typeof stats[field] === 'number');
    
    logTest('Statistics Structure',
      hasAllFields,
      'All required statistical fields present'
    );
    
    return stats;
    
  } catch (error) {
    logTest('Order Statistics', false, error.message);
    throw error;
  }
}

async function testMasterDataIntegration() {
  logSection('Master Data Integration Tests');
  
  try {
    // Test 1: Get customers
    console.log('Testing customer data retrieval...');
    const customers = await masterDataService.getCustomers();
    
    logTest('Customer Data Retrieval',
      Array.isArray(customers) && customers.length > 0,
      `Retrieved ${customers.length} customers`
    );
    
    // Test 2: Verify customer data structure
    const firstCustomer = customers[0];
    const hasRequiredFields = firstCustomer.customerID && firstCustomer.name && firstCustomer.email;
    
    logTest('Customer Data Structure',
      hasRequiredFields,
      'Customer objects have required fields'
    );
    
    // Test 3: Get inventory items
    console.log('Testing inventory data retrieval...');
    const inventoryItems = await inventoryService.getItems({ limit: 10 });
    
    logTest('Inventory Data Retrieval',
      Array.isArray(inventoryItems) && inventoryItems.length > 0,
      `Retrieved ${inventoryItems.length} inventory items`
    );
    
    return { customers, inventoryItems };
    
  } catch (error) {
    logTest('Master Data Integration', false, error.message);
    throw error;
  }
}

async function testDataTransformation() {
  logSection('Data Transformation Tests');
  
  try {
    // Test 1: Create order and verify transformation
    const testOrder = await orderService.createOrder(TEST_ORDER);
    
    // Verify frontend-friendly fields are added
    const hasTransformedFields = testOrder.status_display && 
                                testOrder.priority_display && 
                                testOrder.status_color && 
                                testOrder.priority_color;
    
    logTest('Data Transformation',
      hasTransformedFields,
      'Frontend-friendly fields added to order data'
    );
    
    // Test 2: Verify calculated fields
    const hasCalculatedFields = typeof testOrder.items_count === 'number' && 
                               typeof testOrder.items_total_quantity === 'number';
    
    logTest('Calculated Fields',
      hasCalculatedFields,
      'Calculated fields present in order data'
    );
    
    return testOrder;
    
  } catch (error) {
    logTest('Data Transformation', false, error.message);
    throw error;
  }
}

async function testErrorHandling() {
  logSection('Error Handling Tests');
  
  try {
    // Test 1: Invalid order ID
    try {
      await orderService.getOrder('invalid-id');
      logTest('Invalid Order ID Handling', false, 'Should have thrown error');
    } catch (error) {
      logTest('Invalid Order ID Handling', true, 'Correctly handled invalid ID');
    }
    
    // Test 2: Empty order creation
    try {
      await orderService.createOrder({});
      logTest('Empty Order Creation Handling', false, 'Should have thrown error');
    } catch (error) {
      logTest('Empty Order Creation Handling', true, 'Correctly handled empty order');
    }
    
    // Test 3: Invalid update data
    try {
      await orderService.updateOrder('nonexistent-id', { invalid: 'data' });
      logTest('Invalid Update Handling', false, 'Should have thrown error');
    } catch (error) {
      logTest('Invalid Update Handling', true, 'Correctly handled invalid update');
    }
    
  } catch (error) {
    logTest('Error Handling', false, error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Order Management System Tests');
  console.log('=' .repeat(80));
  
  let createdOrder = null;
  
  try {
    // Run all test suites
    createdOrder = await testOrderCreation();
    await delay(1000);
    
    if (createdOrder) {
      await testOrderRetrieval(createdOrder.orderID);
      await delay(1000);
      
      await testOrderUpdates(createdOrder.orderID);
      await delay(1000);
    }
    
    await testOrderStats();
    await delay(1000);
    
    await testMasterDataIntegration();
    await delay(1000);
    
    await testDataTransformation();
    await delay(1000);
    
    await testErrorHandling();
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    // Cleanup: Delete test order if created
    if (createdOrder && createdOrder.orderID) {
      try {
        console.log(`\n🧹 Cleaning up test order ${createdOrder.orderID}...`);
        await orderService.deleteOrder(createdOrder.orderID);
        console.log('✅ Test order cleaned up successfully');
      } catch (error) {
        console.log('⚠️  Failed to clean up test order:', error.message);
      }
    }
  }
  
  // Print final results
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  - ${test.testName}: ${test.message}`);
      });
  }
  
  console.log('\n🎉 Order Management System Testing Complete!');
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testResults };
