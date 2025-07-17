import api from './api';

class SeasonalInventoryService {
  constructor() {
    this.baseURL = '/api/v1/prophet';
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

  // Get forecast for specific product
  async getProductForecast(productId, days = 30, confidenceInterval = 0.95) {
    try {
      const response = await api.post(`${this.baseURL}/item/predict`, {
        item_id: productId,
        prediction_horizon_days: days,
        confidence_interval: confidenceInterval,
        include_external_factors: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get product forecast:', error);
      throw error;
    }
  }

  // Get batch forecast for multiple products
  async getBatchForecast(productIds, days = 30, confidenceInterval = 0.95) {
    try {
      const response = await api.post(`${this.baseURL}/items/batch-predict`, {
        item_ids: productIds,
        prediction_horizon_days: days,
        confidence_interval: confidenceInterval,
        include_external_factors: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get batch forecast:', error);
      throw error;
    }
  }

  // Get item analysis for specific product
  async getItemAnalysis(productId, analysisPeriodDays = 90) {
    try {
      const response = await api.post(`${this.baseURL}/item/analyze`, {
        item_id: productId,
        analysis_period_days: analysisPeriodDays,
        include_recommendations: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get item analysis:', error);
      throw error;
    }
  }

  // Get inventory recommendations
  async getInventoryRecommendations(daysAhead = 30, minConfidence = 0.8) {
    try {
      const response = await api.get(`${this.baseURL}/recommendations/inventory`, {
        params: { 
          days_ahead: daysAhead,
          min_confidence: minConfidence
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get inventory recommendations:', error);
      throw error;
    }
  }

  // Get category predictions
  async getCategoryForecast(category, days = 30, confidenceInterval = 0.95) {
    try {
      const response = await api.get(`${this.baseURL}/category/${category}/predict`, {
        params: {
          prediction_horizon_days: days,
          confidence_interval: confidenceInterval
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get category forecast:', error);
      throw error;
    }
  }

  // Retrain models for specific products
  async retrainModels(productIds = null) {
    try {
      const response = await api.post(`${this.baseURL}/retrain`, 
        productIds || []
      );
      return response.data;
    } catch (error) {
      console.error('Failed to retrain models:', error);
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
}

export const seasonalInventoryService = new SeasonalInventoryService();
export default seasonalInventoryService;
