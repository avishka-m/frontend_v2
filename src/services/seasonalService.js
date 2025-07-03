/**
 * Seasonal Inventory Service
 * Handles all seasonal inventory analysis and AI prediction operations
 */

// Updated import path for proper module resolution
import { apiGet, apiPost, apiDelete } from './api';

/**
 * Seasonal Inventory API Service
 */
export const seasonalService = {
  // Analyze seasonal patterns
  async analyzeSeasonalPatterns(analysisRequest = {}) {
    try {
      const response = await apiPost('/inventory/seasonal/analyze', {
        analysis_period_months: 12,
        include_predictions: true,
        include_recommendations: true,
        ...analysisRequest
      });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze seasonal patterns:', error);
      throw new Error('Failed to analyze seasonal patterns');
    }
  },

  // Get demand forecast for a product
  async getDemandForecast(productId, forecastOptions = {}) {
    try {
      const response = await apiPost('/inventory/seasonal/forecast', {
        product_id: productId,
        forecast_horizon_days: 90,
        include_seasonal_adjustment: true,
        confidence_interval: 0.95,
        ...forecastOptions
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get demand forecast:', error);
      throw new Error('Failed to get demand forecast');
    }
  },

  // Get seasonal recommendations
  async getSeasonalRecommendations(season = null) {
    try {
      const params = season ? { season } : {};
      const response = await apiGet('/inventory/seasonal/recommendations', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get seasonal recommendations:', error);
      throw new Error('Failed to get seasonal recommendations');
    }
  },

  // Get seasonal patterns for a specific product
  async getProductSeasonalPatterns(productId) {
    try {
      const response = await apiGet(`/inventory/seasonal/patterns/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get product seasonal patterns:', error);
      throw new Error('Failed to get product seasonal patterns');
    }
  },

  // Get predictions for a specific product
  async getProductPredictions(productId) {
    try {
      const response = await apiGet(`/inventory/seasonal/predictions/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get product predictions:', error);
      throw new Error('Failed to get product predictions');
    }
  },

  // Delete a recommendation
  async deleteRecommendation(recommendationId) {
    try {
      const response = await apiDelete(`/inventory/seasonal/recommendations/${recommendationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete recommendation:', error);
      throw new Error('Failed to delete recommendation');
    }
  },

  // Get seasonal analytics summary
  async getAnalyticsSummary() {
    try {
      const response = await apiGet('/inventory/seasonal/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      throw new Error('Failed to get analytics summary');
    }
  },

  // Search seasonal data
  async searchSeasonalData(query, filters = {}) {
    try {
      const response = await apiPost('/inventory/seasonal/search', {
        query,
        ...filters
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search seasonal data:', error);
      throw new Error('Failed to search seasonal data');
    }
  }
};

export default seasonalService;
