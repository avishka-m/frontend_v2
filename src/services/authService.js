import { api } from './apiConfig';

export const authService = {
  login: async (username, password) => {
    try {
      console.log('AuthService: Starting login for user:', username);
      
      // Real API implementation - always use backend API
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      console.log('AuthService: Sending login request to backend...');
      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('AuthService: Login response received:', response.data);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        console.log('AuthService: Token stored, fetching user profile...');
        
        // Get user profile information after setting the token
        const userProfile = await authService.getCurrentUser();
        console.log('AuthService: User profile fetched:', userProfile);
        
        return {
          ...userProfile,
          access_token: response.data.access_token,
          token_type: response.data.token_type
        };
      }
      
      throw new Error('No access token received');
    } catch (error) {
      console.error('AuthService: Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      // If it's an error from getCurrentUser, return a simpler success response
      if (error.message.includes('Failed to get user information')) {
        console.log('AuthService: Profile fetch failed, returning basic login success');
        return {
          username: username,
          access_token: localStorage.getItem('token'),
          message: 'Login successful but user profile could not be loaded'
        };
      }
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Real API implementation - get user profile from backend
      const response = await api.get('/auth/me');
      
      // Parse the name into first and last name
      const fullName = response.data.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        id: response.data.id,
        username: response.data.username,
        firstName: firstName,
        lastName: lastName,
        email: response.data.email,
        role: response.data.role,
        phone: response.data.phone,
        permissions: getPermissionsByRole(response.data.role),
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };
    } catch (error) {
      console.error('Get current user error:', error);
      
      // If the API call fails, clear the token and throw error
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        throw new Error('Authentication expired. Please login again.');
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to get user information');
    }
  }
};

// Helper function to simulate role-based permissions
function getPermissionsByRole(role) {
  const permissions = {
    base: ['view_dashboard', 'view_profile', 'edit_profile'],
    Manager: [
      'view_inventory', 'add_inventory', 'edit_inventory', 'delete_inventory',
      'view_orders', 'create_order', 'edit_order', 'cancel_order',
      'view_workers', 'add_worker', 'edit_worker', 'disable_worker',
      'view_customers', 'add_customer', 'edit_customer',
      'view_analytics', 'export_reports',
      'view_settings', 'edit_settings',
      'view_all_modules'
    ],
    ReceivingClerk: [
      'view_inventory', 'add_inventory', 'edit_inventory',
      'view_orders', 'create_order',
      'view_receiving', 'process_receiving',
      'view_returns', 'process_returns'
    ],
    Picker: [
      'view_inventory', 'view_orders',
      'view_picking', 'process_picking',
      'view_locations'
    ],
    Packer: [
      'view_orders',
      'view_packing', 'process_packing'
    ],
    Driver: [
      'view_orders',
      'view_shipping', 'process_delivery',
      'view_vehicles'
    ]
  };
  
  return [...permissions.base, ...(permissions[role] || [])];
}