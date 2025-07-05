// Simple test to check authentication status
console.log('=== Authentication Check ===');

// Check token
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token:', token ? `${token.substring(0, 20)}...` : 'None');

// Check user data
const username = localStorage.getItem('username');
const userRole = localStorage.getItem('userRole');
console.log('Username:', username);
console.log('User Role:', userRole);

// Check other user data
console.log('User First Name:', localStorage.getItem('userFirstName'));
console.log('User Last Name:', localStorage.getItem('userLastName'));
console.log('User Email:', localStorage.getItem('userEmail'));

// Test API call with current auth
async function testAuth() {
    try {
        const response = await fetch('http://localhost:8002/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Auth check status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('Current user from API:', userData);
        } else {
            console.log('Auth check failed:', await response.text());
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

if (token) {
    testAuth();
} else {
    console.log('No token found - user needs to log in');
}
