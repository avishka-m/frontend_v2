import api from './api';


class SeasonalInventoryService {
  constructor() {
    this.baseURL = '/prophet';
  }

  // Get available categories for forecasting (extract from products)
  async getAvailableCategories() {
    try {
      const response = await api.get(`${this.baseURL}/products`);
      const products = Array.isArray(response.data.data) ? response.data.data : [];
      const categoriesSet = new Set();
      products.forEach(p => {
        if (p.category) categoriesSet.add(p.category);
      });
      const categories = Array.from(categoriesSet);
      return { data: categories };
    } catch (error) {
      console.error('Failed to get available categories:', error);
      throw error;
    }
  }

  // Health check for prediction services
  async healthCheck() {
    try {
      const response = await api.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Get system status and model performance
  async getSystemStatus() {
    try {
      const response = await api.get(`${this.baseURL}/models/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get system status:', error);
      throw error;
    }
  }


  // Get category predictions
  async getCategoryForecast(category, days = 30, confidenceInterval = 0.95) {
    try {
      const response = await api.get(`${this.baseURL}/category/${category}/predict`, {
        params: {
          prediction_horizon_days: days,
          confidence_interval: confidenceInterval,
          include_external_factors: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get category forecast:', error);
      throw error;
    }
  }

  // Get available products for forecasting
  async getAvailableProducts() {
    try {
      const response = await api.get(`${this.baseURL}/products`);
      return response.data;
    } catch (error) {
      console.error('Failed to get available products:', error);
      throw error;
    }
  }

  // Get category analysis for a specific category
  async getCategoryAnalysis(category, analysisPeriodDays = 90) {
    try {
      const response = await api.post(`${this.baseURL}/category/${category}/analyze`, {
        category,
        analysis_period_days: analysisPeriodDays,
        include_recommendations: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get category analysis:', error);
      throw error;
    }
  }
  async getDbForecast(category, startDate, endDate, leadTimeDays = 3) {
    // Use environment variable or fallback to localhost:8000
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    const url = `${API_BASE_URL}/prophet/db-forecast?category=${encodeURIComponent(category)}&start_date=${startDate}&end_date=${endDate}&lead_time_days=${leadTimeDays}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return await response.json();
  }
}

export const seasonalInventoryService = new SeasonalInventoryService();
export default seasonalInventoryService;
