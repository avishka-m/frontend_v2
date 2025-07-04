#!/usr/bin/env node

/**
 * Test script to verify order management flow
 * This script tests the main order management functionality
 */

import { orderService } from './src/services/orderService.js';
import { masterDataService } from './src/services/masterDataService.js';
import { inventoryService } from './src/services/inventoryService.js';

console.log('🚀 Starting Order Management Flow Test...\n');

const testServices = async () => {
  try {
    // Test 1: Check if services are available
    console.log('📋 Test 1: Service Availability');
    console.log('✓ orderService:', typeof orderService);
    console.log('✓ masterDataService:', typeof masterDataService);
    console.log('✓ inventoryService:', typeof inventoryService);
    
    // Test 2: Check inventory service getItems method
    console.log('\n📦 Test 2: Inventory Service');
    console.log('✓ getItems method:', typeof inventoryService.getItems);
    
    // Test 3: Check if inventory service returns expected data format
    console.log('\n🔧 Test 3: Inventory Data Format');
    try {
      const items = await inventoryService.getItems({ limit: 5 });
      console.log('✓ Retrieved items:', items.length);
      if (items.length > 0) {
        const firstItem = items[0];
        console.log('✓ First item structure:');
        console.log('  - itemID:', firstItem.itemID);
        console.log('  - name:', firstItem.name);
        console.log('  - itemName:', firstItem.itemName);
        console.log('  - stock_level:', firstItem.stock_level);
        console.log('  - current_stock:', firstItem.current_stock);
        console.log('  - price:', firstItem.price);
      }
    } catch (error) {
      console.log('⚠️  Inventory service error:', error.message);
    }
    
    // Test 4: Check customer service
    console.log('\n👥 Test 4: Customer Service');
    try {
      const customers = await masterDataService.getCustomers();
      console.log('✓ Retrieved customers:', customers.length);
      if (customers.length > 0) {
        const firstCustomer = customers[0];
        console.log('✓ First customer structure:');
        console.log('  - customerID:', firstCustomer.customerID);
        console.log('  - name:', firstCustomer.name);
        console.log('  - email:', firstCustomer.email);
      }
    } catch (error) {
      console.log('⚠️  Customer service error:', error.message);
    }
    
    // Test 5: Check order service constants
    console.log('\n📋 Test 5: Order Service Constants');
    console.log('✓ ORDER_STATUS:', Object.keys(orderService.ORDER_STATUS || {}));
    console.log('✓ ORDER_PRIORITY:', Object.keys(orderService.ORDER_PRIORITY || {}));
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
};

// Run the tests
testServices();
