// Simple test to verify API connectivity with authentication
async function testAPIWithAuth() {
    const API_BASE = 'http://localhost:8002';
    
    try {
        // First, let's try to login to get a token
        const loginResponse = await fetch(`${API_BASE}/api/v1/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: 'manager',
                password: 'manager123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const token = loginData.access_token;
            
            console.log('✅ Authentication successful');
            
            // Now test orders endpoint with auth
            const ordersResponse = await fetch(`${API_BASE}/api/v1/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': 'application/json'
                }
            });
            
            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                console.log('✅ Orders endpoint working:', orders.length, 'orders found');
                return true;
            } else {
                console.log('❌ Orders endpoint failed:', ordersResponse.status);
                return false;
            }
        } else {
            console.log('❌ Authentication failed:', loginResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ API test failed:', error.message);
        return false;
    }
}

// Run the test
testAPIWithAuth().then(success => {
    console.log(success ? '🎉 API test passed!' : '💥 API test failed!');
});
