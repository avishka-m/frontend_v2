// Test the authentication flow in the frontend
import axios from 'axios';

const API_URL = 'http://localhost:8002/api/v1';

async function testAuthFlow() {
    console.log('Testing authentication flow...');
    
    try {
        // 1. Login to get token
        console.log('1. Attempting login...');
        const loginResponse = await axios.post(`${API_URL}/auth/token`, 
            new URLSearchParams({
                username: 'manager',
                password: 'manager123'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        );
        
        console.log('✅ Login successful');
        console.log('Token:', loginResponse.data.access_token.substring(0, 20) + '...');
        
        const token = loginResponse.data.access_token;
        
        // 2. Test /auth/me endpoint
        console.log('2. Testing /auth/me endpoint...');
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ /auth/me successful');
        console.log('User:', meResponse.data);
        
        // 3. Test workers endpoint
        console.log('3. Testing workers endpoint...');
        const workersResponse = await axios.get(`${API_URL}/workers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Workers endpoint successful');
        console.log('Workers count:', workersResponse.data.length);
        
        // 4. Test orders endpoint
        console.log('4. Testing orders endpoint...');
        const ordersResponse = await axios.get(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Orders endpoint successful');
        console.log('Orders count:', ordersResponse.data.length);
        
        console.log('\n🎉 All authentication tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Authentication test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return false;
    }
}

testAuthFlow().then(success => {
    console.log(success ? '\n✅ Authentication flow working correctly' : '\n❌ Authentication flow has issues');
});
