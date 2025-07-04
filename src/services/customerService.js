import { api } from './apiConfig';

// Customer status constants (for UI display)
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Customer status display names
export const CUSTOMER_STATUS_DISPLAY = {
  [CUSTOMER_STATUS.ACTIVE]: 'Active',
  [CUSTOMER_STATUS.INACTIVE]: 'Inactive'
};

// Customer status colors for UI
export const CUSTOMER_STATUS_COLORS = {
  [CUSTOMER_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [CUSTOMER_STATUS.INACTIVE]: 'bg-red-100 text-red-800'
};

/**
 * Transform backend customer data to frontend format
 */
const transformCustomerData = (customer) => {
  if (!customer) return null;
  
  return {
    // Core fields
    id: customer._id,
    customerID: customer.customerID,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    
    // Status (customers are always active unless specifically marked inactive)
    status: customer.disabled ? CUSTOMER_STATUS.INACTIVE : CUSTOMER_STATUS.ACTIVE,
    status_display: customer.disabled ? CUSTOMER_STATUS_DISPLAY.INACTIVE : CUSTOMER_STATUS_DISPLAY.ACTIVE,
    status_color: customer.disabled ? CUSTOMER_STATUS_COLORS.INACTIVE : CUSTOMER_STATUS_COLORS.ACTIVE,
    
    // Timestamps
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    
    // Computed fields
    contact_info: customer.phone || customer.email || 'No contact info',
    display_name: customer.name || 'Unknown Customer',
    
    // For display purposes
    location: customer.address || 'No address provided'
  };
};

/**
 * Transform frontend customer data to backend format
 */
const transformCustomerForBackend = (customer) => {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone || null,
    address: customer.address || null
  };
};

export const customerService = {
  // Get all customers with optional filtering
  getCustomers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.name) queryParams.append('name', params.name);
      
      const response = await api.get(`/customers?${queryParams.toString()}`);
      
      // Transform backend data to frontend format
      const transformedData = response.data.map(transformCustomerData);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get a single customer by ID
  getCustomer: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: Customer ID must be provided.");
    }

    try {
      const response = await api.get(`/customers/${id}`);
      return transformCustomerData(response.data);
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error.message);
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }
  },

  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      const backendData = transformCustomerForBackend(customerData);
      const response = await api.post('/customers', backendData);
      return transformCustomerData(response.data);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Update an existing customer
  updateCustomer: async (id, updateData) => {
    if (!id) {
      throw new Error("Invalid ID: Customer ID must be provided.");
    }

    try {
      const backendData = {};
      
      // Only include fields that are being updated
      if (updateData.name !== undefined) backendData.name = updateData.name;
      if (updateData.email !== undefined) backendData.email = updateData.email;
      if (updateData.phone !== undefined) backendData.phone = updateData.phone || null;
      if (updateData.address !== undefined) backendData.address = updateData.address || null;
      
      const response = await api.put(`/customers/${id}`, backendData);
      return transformCustomerData(response.data);
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error.message);
      throw new Error(`Failed to update customer: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Delete a customer
  deleteCustomer: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: Customer ID must be provided.");
    }

    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error.message);
      throw new Error(`Failed to delete customer: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get customer orders
  getCustomerOrders: async (customerId, params = {}) => {
    if (!customerId) {
      throw new Error("Invalid ID: Customer ID must be provided.");
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      
      const response = await api.get(`/customers/${customerId}/orders?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error.message);
      throw new Error(`Failed to fetch customer orders: ${error.message}`);
    }
  },

  // Search customers by name
  searchCustomers: async (searchTerm) => {
    try {
      const response = await api.get(`/customers?name=${encodeURIComponent(searchTerm)}`);
      return response.data.map(transformCustomerData);
    } catch (error) {
      console.error(`Error searching customers with term "${searchTerm}":`, error.message);
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  },

  // Get active customers only (not disabled)
  getActiveCustomers: async () => {
    try {
      const customers = await customerService.getCustomers();
      return customers.filter(customer => customer.status === CUSTOMER_STATUS.ACTIVE);
    } catch (error) {
      console.error('Error fetching active customers:', error.message);
      throw new Error(`Failed to fetch active customers: ${error.message}`);
    }
  },

  // Validate customer data
  validateCustomerData: (customerData) => {
    const errors = {};
    
    if (!customerData.name || !customerData.name.trim()) {
      errors.name = 'Customer name is required';
    }
    
    if (!customerData.email || !customerData.email.trim()) {
      errors.email = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        errors.email = 'Invalid email format';
      }
    }
    
    if (customerData.phone && customerData.phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(customerData.phone)) {
        errors.phone = 'Invalid phone number format';
      }
    }
    
    if (!customerData.address || !customerData.address.trim()) {
      errors.address = 'Customer address is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default customerService;
