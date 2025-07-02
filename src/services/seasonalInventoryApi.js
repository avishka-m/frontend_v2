import axios from 'axios';

// Base URL for the main WMS API (contains the predictions endpoints)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance for seasonal inventory API
const seasonalInventoryApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000, // 30 seconds timeout for model training
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
seasonalInventoryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
seasonalInventoryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Seasonal Inventory API Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Seasonal Inventory API endpoints
export const seasonalInventoryService = {
  // Health check for prediction services
  healthCheck: async () => {
    const response = await seasonalInventoryApi.get('/predictions/health');
    return response.data;
  },

  // Get forecast for specific product
  getProductForecast: async (productId, days = 30, confidenceInterval = 0.95) => {
    const response = await seasonalInventoryApi.post('/predictions/item/predict', {
      item_id: productId,
      prediction_horizon_days: days,
      confidence_interval: confidenceInterval,
      include_external_factors: true
    });
    return response.data;
  },

  // Get batch forecast for multiple products
  getBatchForecast: async (productIds, days = 30, confidenceInterval = 0.95) => {
    const response = await seasonalInventoryApi.post('/predictions/items/batch-predict', {
      item_ids: productIds,
      prediction_horizon_days: days,
      confidence_interval: confidenceInterval,
      include_external_factors: true
    });
    return response.data;
  },

  // Get item analysis for specific product
  getItemAnalysis: async (productId, comparisonItems = null, analysisPeriodDays = 90) => {
    const response = await seasonalInventoryApi.post('/predictions/item/analyze', {
      item_id: productId,
      comparison_items: comparisonItems,
      analysis_period_days: analysisPeriodDays,
      include_recommendations: true
    });
    return response.data;
  },

  // Get seasonal patterns analysis (part of item analysis)
  getSeasonalPatterns: async (productId) => {
    // This will be part of the item analysis response
    const response = await seasonalInventoryApi.post('/predictions/item/analyze', {
      item_id: productId,
      analysis_period_days: 90,
      include_recommendations: false
    });
    return response.data;
  },

  // Get inventory recommendations
  getInventoryRecommendations: async (daysAhead = 30, minConfidence = 0.8) => {
    const response = await seasonalInventoryApi.get('/predictions/recommendations/inventory', {
      params: { 
        days_ahead: daysAhead,
        min_confidence: minConfidence
      }
    });
    return response.data;
  },

  // Get system status and health
  getSystemStatus: async () => {
    const response = await seasonalInventoryApi.get('/predictions/models/status');
    return response.data;
  },

  // Get category predictions
  getCategoryForecast: async (category, days = 30, confidenceInterval = 0.95) => {
    const response = await seasonalInventoryApi.get(`/predictions/category/${category}/predict`, {
      params: {
        prediction_horizon_days: days,
        confidence_interval: confidenceInterval
      }
    });
    return response.data;
  },

  // Retrain models for specific products
  retrainModels: async (productIds = null) => {
    const response = await seasonalInventoryApi.post('/predictions/models/retrain', {
      item_ids: productIds
    });
    return response.data;
  },

  // Get model performance metrics (part of system status)
  getModelMetrics: async () => {
    const response = await seasonalInventoryApi.get('/predictions/models/status');
    return response.data;
  },

  // Search products - will need to use inventory API
  searchProducts: async (query, category = null) => {
    // This will need to be implemented using the inventory API
    // For now, return a placeholder
    const response = await seasonalInventoryApi.get('/inventory', {
      params: { 
        search: query,
        category: category,
        limit: 100
      }
    });
    return response.data;
  }
};

export default seasonalInventoryApi;
