import React, { useState } from 'react';
import ForecastChart from '../../components/SeasonalInventory/ForecastChart';
import SeasonalPatternsChart from '../../components/SeasonalInventory/SeasonalPatternsChart';
import InventoryRecommendations from '../../components/SeasonalInventory/InventoryRecommendations';
import {
  ChartBarIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Mock data for demonstration
const mockProducts = [
  { id: 'SKU001', name: 'SKU001', description: 'Wireless Bluetooth Headphones' },
  { id: 'SKU002', name: 'SKU002', description: 'Smartphone Case' },
  { id: 'SKU003', name: 'SKU003', description: 'USB Charging Cable' },
  { id: '85123A', name: '85123A', description: 'Electronic Component' },
  { id: '22423', name: '22423', description: 'Industrial Part' }
];

const mockForecastData = {
  product_id: 'SKU001',
  status: 'success',
  historical_data: [
    { ds: '2024-12-01', y: 150 },
    { ds: '2024-12-02', y: 145 },
    { ds: '2024-12-03', y: 160 },
    { ds: '2024-12-04', y: 155 },
    { ds: '2024-12-05', y: 175 },
    { ds: '2024-12-06', y: 180 },
    { ds: '2024-12-07', y: 165 }
  ],
  forecast: [
    { ds: '2024-12-08', yhat: 170, yhat_lower: 150, yhat_upper: 190 },
    { ds: '2024-12-09', yhat: 175, yhat_lower: 155, yhat_upper: 195 },
    { ds: '2024-12-10', yhat: 180, yhat_lower: 160, yhat_upper: 200 },
    { ds: '2024-12-11', yhat: 185, yhat_lower: 165, yhat_upper: 205 },
    { ds: '2024-12-12', yhat: 190, yhat_lower: 170, yhat_upper: 210 },
    { ds: '2024-12-13', yhat: 195, yhat_lower: 175, yhat_upper: 215 },
    { ds: '2024-12-14', yhat: 200, yhat_lower: 180, yhat_upper: 220 }
  ],
  model_metrics: {
    accuracy: 97.85,
    mape: 2.15
  },
  forecast_insights: {
    predicted_total_demand: 1225,
    peak_demand_value: 200,
    peak_demand_date: '2024-12-14'
  }
};

const mockSeasonalPatterns = {
  weekly_seasonality: {
    '0': 0.95, // Sunday
    '1': 1.05, // Monday
    '2': 1.10, // Tuesday
    '3': 1.15, // Wednesday
    '4': 1.20, // Thursday
    '5': 1.25, // Friday
    '6': 1.30  // Saturday
  },
  monthly_seasonality: {
    '1': 0.85, '2': 0.90, '3': 0.95, '4': 1.00,
    '5': 1.05, '6': 1.10, '7': 1.15, '8': 1.20,
    '9': 1.25, '10': 1.30, '11': 1.35, '12': 1.40
  }
};

const mockRecommendations = [
  {
    type: 'reorder_point',
    title: 'Recommended Reorder Point',
    description: 'Reorder when stock drops to 450 units',
    value: 450,
    urgency: 'medium',
    calculation: '(175.2 daily demand × 7 lead days) + 225.4 safety stock',
    confidence: 'High (85%)',
    product_id: 'SKU001'
  },
  {
    type: 'order_quantity',
    title: 'Recommended Monthly Order Quantity',
    description: 'Order 1350 units for next month',
    value: 1350,
    urgency: 'normal',
    calculation: '1225 predicted demand + 10% buffer',
    confidence: 'High (90%)',
    product_id: 'SKU001'
  },
  {
    type: 'peak_preparation',
    title: 'Peak Demand Alert',
    description: 'Prepare for high demand (200 units) around 2024-12-14',
    value: 200,
    urgency: 'high',
    confidence: 'Medium (75%)',
    product_id: 'SKU001'
  }
];

const mockSystemStatus = {
  status: 'success',
  service_status: {
    status: 'available',
    data_info: {
      total_records: 276843,
      unique_products: 3941
    }
  },
  models: {
    total_trained: 6,
    ready_models: 6
  }
};

const SeasonalInventoryDemo = () => {
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('SKU001');
  const [forecastDays, setForecastDays] = useState(30);
  const [showForecast, setShowForecast] = useState(false);

  // Simulate loading
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleGenerateForecast = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowForecast(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Seasonal Inventory Forecasting (Demo)
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered demand forecasting and inventory optimization - Demo Version
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-secondary"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="font-medium text-blue-800">Demo Mode</p>
            <p className="text-sm text-blue-700">
              This is a demonstration of the Seasonal Inventory Prediction interface. 
              Connect to the backend API to see real data and forecasts.
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div>
            <p className="font-medium text-green-800">
              System Status: {mockSystemStatus.service_status.status === 'available' ? 'Online' : 'Offline'} (Demo)
            </p>
            <p className="text-sm text-green-700">
              Processing {mockSystemStatus.service_status.data_info.total_records} records across {mockSystemStatus.service_status.data_info.unique_products} products (Simulated)
            </p>
          </div>
        </div>
      </div>

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
              {mockProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.id} - {product.description}
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
              onClick={handleGenerateForecast}
              disabled={loading}
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
      {showForecast && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forecast Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
              <ForecastChart data={mockForecastData} loading={loading} />
              
              {/* Forecast Metrics */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {mockForecastData.model_metrics.accuracy}%
                  </p>
                  <p className="text-sm text-gray-600">Model Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {mockForecastData.forecast_insights.predicted_total_demand}
                  </p>
                  <p className="text-sm text-gray-600">Predicted Total Demand</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {mockForecastData.forecast_insights.peak_demand_value}
                  </p>
                  <p className="text-sm text-gray-600">Peak Demand</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seasonal Patterns */}
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Patterns</h3>
              <SeasonalPatternsChart data={mockSeasonalPatterns} loading={loading} />
            </div>
          </div>
        </div>
      )}

      {/* Inventory Recommendations */}
      {showForecast && (
        <div className="bg-white shadow rounded-lg p-6">
          <InventoryRecommendations recommendations={mockRecommendations} loading={loading} />
        </div>
      )}

      {/* No Data State */}
      {!loading && !showForecast && (
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

export default SeasonalInventoryDemo;
