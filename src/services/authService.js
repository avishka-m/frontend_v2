import { api } from './apiConfig';

export const authService = {
  login: async (username, password) => {
    try {
      // For development purposes, implement a mock login
      // In production, this would connect to your backend API
      if (process.env.NODE_ENV === 'development' || !api.defaults.baseURL) {
        console.log('Using mock authentication in development mode');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock user data based on username
        // Different roles for testing role-based access
        let userData;
        
        if (username === 'manager') {
          userData = {
            id: 1,
            username: 'manager',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@warehouse.com',
            role: 'Manager',
            access_token: 'mock-jwt-token-manager'
          };
        } else if (username === 'receiving') {
          userData = {
            id: 2,
            username: 'receiving',
            firstName: 'Receiving',
            lastName: 'Clerk',
            email: 'receiving@warehouse.com',
            role: 'ReceivingClerk',
            access_token: 'mock-jwt-token-receiving'
          };
        } else if (username === 'picker') {
          userData = {
            id: 3,
            username: 'picker',
            firstName: 'Warehouse',
            lastName: 'Picker',
            email: 'picker@warehouse.com',
            role: 'Picker',
            access_token: 'mock-jwt-token-picker'
          };
        } else if (username === 'packer') {
          userData = {
            id: 4,
            username: 'packer',
            firstName: 'Package',
            lastName: 'Packer',
            email: 'packer@warehouse.com',
            role: 'Packer',
            access_token: 'mock-jwt-token-packer'
          };
        } else if (username === 'driver') {
          userData = {
            id: 5,
            username: 'driver',
            firstName: 'Delivery',
            lastName: 'Driver',
            email: 'driver@warehouse.com',
            role: 'Driver',
            access_token: 'mock-jwt-token-driver'
          };
        } else {
          // Default case - generic user for any other username
          userData = {
            id: 6,
            username: username,
            firstName: 'Generic',
            lastName: 'User',
            email: `${username}@warehouse.com`,
            role: 'ReceivingClerk', // Default role
            access_token: `mock-jwt-token-${username}`
          };
        }
        
        // Save token to localStorage for persistence
        localStorage.setItem('token', userData.access_token);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userRole', userData.role);
        
        return userData;
      }
      
      // Real API implementation for production
      const response = await api.post('/auth/token', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      throw error;
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
  
  getCurrentUser: async () => {
    try {
      // For development purposes, return mock user data
      if (process.env.NODE_ENV === 'development' || !api.defaults.baseURL) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('userRole');
        
        if (!username) {
          throw new Error('No user is currently logged in');
        }
        
        // Mock user data based on stored username and role
        return {
          id: Math.floor(Math.random() * 1000) + 1,
          username: username,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: role.charAt(0).toUpperCase() + role.slice(1),
          email: `${username}@warehouse.com`,
          role: role,
          permissions: getPermissionsByRole(role),
          lastLogin: new Date().toISOString()
        };
      }
      
      // Real API implementation for production
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
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