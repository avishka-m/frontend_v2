// Test frontend authentication with browser localStorage
// This simulates what the frontend should do

// Set up token in localStorage (simulating successful login)
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5hZ2VyIiwidXNlcm5hbWUiOiJtYW5hZ2VyIiwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3MzU5NjA5NDYsImV4cCI6MTczNTk2NDU0Nn0.JzSzQPpxTUfBrOJGmkOLWZQjTfcHRGlmSjHPQWQsASc');

// Test workers endpoint
async function testFrontendWorkers() {
    const API_URL = 'http://localhost:8002/api/v1';
    
    try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'No token');
        
        const response = await fetch(`${API_URL}/workers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Workers endpoint successful');
            console.log('Workers count:', data.length);
            console.log('First worker:', data[0]);
        } else {
            const errorData = await response.text();
            console.error('❌ Workers endpoint failed');
            console.error('Error data:', errorData);
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

// Run test
testFrontendWorkers();
