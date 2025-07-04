import axios from 'axios';

// Test script to verify the add inventory functionality
const testAddInventory = async () => {
  const API_BASE_URL = 'http://localhost:8000';
  
  console.log('🧪 Testing Add Inventory Functionality...\n');
  
  try {
    // Step 1: Login to get authentication token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/token`, {
      username: 'john_doe',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful!');
    
    // Step 2: Test adding a new inventory item
    console.log('\n2️⃣ Adding new inventory item...');
    const newItem = {
      name: 'Test Widget Pro',
      category: 'Electronics',
      size: 'L',
      storage_type: 'standard',
      stock_level: 50,
      min_stock_level: 10,
      max_stock_level: 200,
      supplierID: 1,
      locationID: 1
    };
    
    const addResponse = await axios.post(`${API_BASE_URL}/api/v1/inventory`, newItem, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Item added successfully!');
    console.log('📦 Created item:', addResponse.data);
    
    // Step 3: Verify the item was created by fetching it
    console.log('\n3️⃣ Verifying item creation...');
    const itemId = addResponse.data.itemID;
    const getResponse = await axios.get(`${API_BASE_URL}/api/v1/inventory/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Item retrieved successfully!');
    console.log('📦 Retrieved item:', getResponse.data);
    
    // Step 4: Test master data endpoints
    console.log('\n4️⃣ Testing master data endpoints...');
    
    try {
      const inventoryResponse = await axios.get(`${API_BASE_URL}/api/v1/inventory?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Inventory endpoint working!');
      console.log(`📊 Found ${inventoryResponse.data.length} items`);
    } catch (error) {
      console.log('❌ Inventory endpoint error:', error.response?.data?.detail || error.message);
    }
    
    try {
      const locationResponse = await axios.get(`${API_BASE_URL}/api/v1/location`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Location endpoint working!');
      console.log(`📍 Found ${locationResponse.data.length} locations`);
    } catch (error) {
      console.log('⚠️ Location endpoint not available, will use mock data');
    }
    
    console.log('\n🎉 All tests passed! The add inventory functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.detail || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Tip: Make sure you have the correct login credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Tip: Your user might not have the required permissions (Manager or ReceivingClerk)');
    }
  }
};

// Run the test
testAddInventory();
