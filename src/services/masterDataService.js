import { api } from './apiConfig';

export const locationService = {
  // Get all locations
  getLocations: async () => {
    try {
      const response = await api.get('/location');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Return mock data if API fails
      return [
        { id: 1, name: 'Warehouse A-1', description: 'Main storage area A-1' },
        { id: 2, name: 'Warehouse A-2', description: 'Main storage area A-2' },
        { id: 3, name: 'Warehouse B-1', description: 'Main storage area B-1' },
        { id: 4, name: 'Warehouse B-2', description: 'Main storage area B-2' },
        { id: 5, name: 'Cold Storage', description: 'Temperature controlled storage' },
        { id: 6, name: 'Receiving Dock', description: 'Incoming goods area' },
        { id: 7, name: 'Shipping Dock', description: 'Outgoing goods area' },
        { id: 8, name: 'Hazmat Storage', description: 'Hazardous materials storage' }
      ];
    }
  },

  // Get a specific location by ID
  getLocation: async (id) => {
    try {
      const response = await api.get(`/location/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching location ${id}:`, error);
      throw error;
    }
  },

  // Create a new location
  createLocation: async (location) => {
    try {
      const response = await api.post('/location', location);
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  // Update a location
  updateLocation: async (id, location) => {
    try {
      const response = await api.put(`/location/${id}`, location);
      return response.data;
    } catch (error) {
      console.error(`Error updating location ${id}:`, error);
      throw error;
    }
  },

  // Delete a location
  deleteLocation: async (id) => {
    try {
      const response = await api.delete(`/location/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting location ${id}:`, error);
      throw error;
    }
  }
};

export const supplierService = {
  // Get all suppliers
  getSuppliers: async () => {
    try {
      const response = await api.get('/customers'); // Using customers endpoint as suppliers
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Return mock data if API fails
      return [
        { id: 1, name: 'TechCorp Electronics', contact: 'contact@techcorp.com' },
        { id: 2, name: 'Fashion World', contact: 'orders@fashionworld.com' },
        { id: 3, name: 'Food Supply Co', contact: 'supply@foodco.com' },
        { id: 4, name: 'Hardware Plus', contact: 'sales@hardwareplus.com' },
        { id: 5, name: 'Office Supplies Inc', contact: 'info@officesupplies.com' }
      ];
    }
  },

  // Get a specific supplier by ID
  getSupplier: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  }
};

export const categoryService = {
  // Get available categories
  getCategories: async () => {
    try {
      // This could be a dedicated endpoint, or we could fetch from inventory items
      const response = await api.get('/inventory');
      const items = response.data;
      
      // Extract unique categories
      const categories = [...new Set(items.map(item => item.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return default categories if API fails
      return ['Electronics', 'Clothing', 'Food', 'Hardware', 'Office Supplies', 'Other'];
    }
  }
};

export const customerService = {
  // Get all customers
  getCustomers: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Return mock data if API fails
      return [
        { customerID: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0101' },
        { customerID: 2, name: 'Jane Doe', email: 'jane.doe@email.com', phone: '+1-555-0102' },
        { customerID: 3, name: 'Bob Johnson', email: 'bob.johnson@email.com', phone: '+1-555-0103' },
        { customerID: 4, name: 'Alice Brown', email: 'alice.brown@email.com', phone: '+1-555-0104' },
        { customerID: 5, name: 'Charlie Wilson', email: 'charlie.wilson@email.com', phone: '+1-555-0105' }
      ];
    }
  },

  // Get a specific customer by ID
  getCustomer: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  // Create a new customer
  createCustomer: async (customer) => {
    try {
      const response = await api.post('/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
};

// Main export combining all services
export const masterDataService = {
  // Location methods
  getLocations: locationService.getLocations,
  getLocation: locationService.getLocation,
  createLocation: locationService.createLocation,
  updateLocation: locationService.updateLocation,
  deleteLocation: locationService.deleteLocation,
  
  // Supplier methods
  getSuppliers: supplierService.getSuppliers,
  getSupplier: supplierService.getSupplier,
  createSupplier: supplierService.createSupplier,
  updateSupplier: supplierService.updateSupplier,
  deleteSupplier: supplierService.deleteSupplier,
  
  // Category methods
  getCategories: categoryService.getCategories,
  
  // Customer methods
  getCustomers: customerService.getCustomers,
  getCustomer: customerService.getCustomer,
  createCustomer: customerService.createCustomer
};
