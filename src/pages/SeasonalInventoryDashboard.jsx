import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { seasonalInventoryService } from '../../services/seasonalInventoryService';
import ForecastChart from '../../components/SeasonalInventory/ForecastChart';
import SeasonalPatternsChart from '../../components/SeasonalInventory/SeasonalPatternsChart';
import InventoryRecommendations from '../../components/SeasonalInventory/InventoryRecommendations';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SeasonalInventoryDashboard = () => {
  useAuth(); // Ensure user is authenticated
  const [loading, setLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forecastDays, setForecastDays] = useState(30);
  // Removed systemStatus state (no backend endpoint)
  const [availableProducts, setAvailableProducts] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [itemAnalysis, setItemAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // Initialize system and load available products
  const loadProducts = async () => {
    setSystemLoading(true);
    setError(null);
    try {
      const productsResponse = await seasonalInventoryService.getAvailableProducts();
      if (productsResponse.data && productsResponse.data.length > 0) {
        setAvailableProducts(productsResponse.data.slice(0, 20));
        setSelectedProduct(productsResponse.data[0].id || productsResponse.data[0].name);
      }
      toast.success('Seasonal Inventory system initialized successfully');
    } catch (err) {
      console.error('System initialization error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to initialize system');
      toast.error('Failed to connect to seasonal inventory service');
    } finally {
      setSystemLoading(false);
    }
  };
  useEffect(() => {
    loadProducts();
  }, []);

  // Generate forecast for selected product
  const generateForecast = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get forecast
      const forecastResponse = await seasonalInventoryService.getProductForecast(
        selectedProduct, 
        forecastDays, 
        0.95
      );
      
      console.log('Forecast response:', forecastResponse);
      
      if (forecastResponse.status === 'success') {
        setForecastData(forecastResponse);
        
        // Get item analysis
        const analysisResponse = await seasonalInventoryService.getItemAnalysis(selectedProduct);
        setItemAnalysis(analysisResponse);
        
        // Get recommendations
        const recommendationsResponse = await seasonalInventoryService.getInventoryRecommendations(
          forecastDays, 
          0.8
        );
        setRecommendations(recommendationsResponse.recommendations || []);
        
        toast.success('Forecast generated successfully');
      } else {
        throw new Error(forecastResponse.message || 'Forecast generation failed');
      }
    } catch (err) {
      console.error('Forecast error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate forecast';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Retrain models (disabled, endpoint not available)
  const handleRetrain = async () => {
    toast.error('Model retraining is not available.');
  };

  if (systemLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">Loading Seasonal Inventory Products...</p>
            <p className="text-sm text-gray-600">Fetching available products</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">System Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="btn btn-primary"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Seasonal Inventory Forecasting
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered demand forecasting and inventory optimization
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={loadProducts}
              disabled={systemLoading}
              className="btn btn-secondary"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh Products
            </button>
            <button 
              onClick={handleRetrain}
              disabled={loading || !selectedProduct}
              className="btn btn-primary"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Retrain Model
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      {/* System Status removed: endpoint not available */}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="font-medium text-yellow-800">Forecast Error</p>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecast Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a product...</option>
              {availableProducts.map(product => (
                <option key={product.id || product.name} value={product.id || product.name}>
                  {product.id || product.name} - {product.description || product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Days
            </label>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
          <div>
            <button
              onClick={generateForecast}
              disabled={loading || !selectedProduct}
              className="w-full btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        {forecastData && (
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
              <ForecastChart data={forecastData} loading={loading} />
              
              {/* Forecast Metrics */}
              {forecastData.model_metrics && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {forecastData.model_metrics.accuracy || 'N/A'}
                      {forecastData.model_metrics.accuracy ? '%' : ''}
                    </p>
                    <p className="text-sm text-gray-600">Model Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {forecastData.forecast_insights?.predicted_total_demand || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Predicted Total Demand</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {forecastData.forecast_insights?.peak_demand_value || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Peak Demand</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seasonal Patterns */}
        {itemAnalysis && itemAnalysis.seasonal_patterns && (
          <div className={forecastData ? '' : 'lg:col-span-3'}>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Patterns</h3>
              <SeasonalPatternsChart data={itemAnalysis.seasonal_patterns} loading={loading} />
            </div>
          </div>
        )}
      </div>

      {/* Inventory Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <InventoryRecommendations recommendations={recommendations} loading={loading} />
        </div>
      )}

      {/* No Data State */}
      {!loading && !forecastData && selectedProduct && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecast Data</h3>
          <p className="text-gray-600 mb-4">
            Click "Generate Forecast" to create predictions for {selectedProduct}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeasonalInventoryDashboard;
