

import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { seasonalInventoryService } from '../services/seasonalInventoryService';
import ForecastChart from '../components/SeasonalInventory/ForecastChart';
import StockVsDemandChart from '../components/SeasonalInventory/StockVsDemandChart';
import SeasonalPatternsChart from '../components/SeasonalInventory/SeasonalPatternsChart';
import InventoryRecommendations from '../components/SeasonalInventory/InventoryRecommendations';
import React, { useState, useEffect, useMemo } from 'react';
import { ChartBarIcon, ArrowPathIcon, CogIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';


function SeasonalInventoryDashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  // State
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [forecastDays, setForecastDays] = useState(30);
  const [leadTime, setLeadTime] = useState(3); // New state for lead time
  const [systemLoading, setSystemLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forecastData, setForecastData] = useState(null);
  // New state for stock and depletion
  const [currentStock, setCurrentStock] = useState(null);
  const [stockDepletionData, setStockDepletionData] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [outOfStockDate, setOutOfStockDate] = useState(null);

  // Map forecast data to chart-friendly format
  const mappedForecastData = useMemo(() => {
    if (!forecastData || !Array.isArray(forecastData.forecast_data)) return [];
    const arr = forecastData.forecast_data.map(d => ({
      x: d.date,
      y: d.predicted_demand,
      lower: d.lower_bound,
      upper: d.upper_bound
    }));
    console.log('mappedForecastData:', arr);
    return arr;
  }, [forecastData]);




  // Categories are now fetched directly

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setSystemLoading(true);
      setError('');
      try {
        const response = await seasonalInventoryService.getAvailableCategories();
        setAvailableCategories(Array.isArray(response?.data) ? response.data : []);
      } catch {
        setError('Failed to fetch categories.');
      } finally {
        setSystemLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Only allow managers
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== 'Manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only managers can access the Seasonal Inventory Dashboard.</p>
        </div>
      </div>
    );
  }


  // Handlers
  const loadCategories = async () => {
    setSystemLoading(true);
    setError('');
    try {
      const response = await seasonalInventoryService.getAvailableCategories();
      setAvailableCategories(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setError('Failed to fetch categories.');
    } finally {
      setSystemLoading(false);
    }
  };


  // (Removed duplicate categories and filteredProducts declarations)

  // Handlers

  // (Removed duplicate loadProducts, only async version remains)


  // const handleRetrain = async () => {
  //   setLoading(true);
  //   try {
  //     await seasonalInventoryService.retrainModels(selectedCategory ? [selectedCategory] : null);
  //     alert('Model retrained!');
  //   } catch {
  //     alert('Failed to retrain model.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const generateForecast = async () => {
    setLoading(true);
    setError('');
    setCurrentStock(null);
    setStockDepletionData([]);
    setRecommendation(null);
    setOutOfStockDate(null);
    try {
      // Calculate start and end date
      const today = new Date();
      const startDate = today.toISOString().slice(0, 10);
      const endDate = new Date(today.getTime() + (forecastDays - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      // Call backend db-forecast endpoint with lead time
      const forecast = await seasonalInventoryService.getDbForecast(selectedCategory, startDate, endDate, leadTime);
      console.log('DB Forecast API response:', forecast);
      setForecastData(forecast);

      // Use backend's current_stock and recommendation directly
      setCurrentStock(forecast.current_stock ?? null);
      setRecommendation(forecast.recommendation ?? null);

      // Calculate stock depletion over time
      let stock = forecast.current_stock ?? 0;
      let depletion = [];
      let oosDate = null;
      if (forecast.forecast_data) {
        for (let i = 0; i < forecast.forecast_data.length; i++) {
          const d = forecast.forecast_data[i];
          stock -= d.predicted_demand;
          depletion.push({ date: d.date, remaining: stock });
          if (oosDate === null && stock <= 0) {
            oosDate = d.date;
          }
        }
      }
      setStockDepletionData(depletion);
      setOutOfStockDate(oosDate);
    } catch (err) {
      setError('Failed to generate forecast.');
      setForecastData(null);
      setCurrentStock(null);
      setStockDepletionData([]);
      setRecommendation(null);
      setOutOfStockDate(null);
      console.error('Forecast error:', err);
    } finally {
      setLoading(false);
    }
  };
  // TODO: Implement seasonalInventoryService.getDbForecast(category, startDate, endDate) and getCurrentStock(category) in your service file.

  // Debug: log forecast chart data before render
  // Debug: log forecast chart data before render
  if (forecastData && forecastData.forecast_data) {
    console.log('ForecastChart data:', forecastData.forecast_data);
    if (forecastData.forecast_data.length > 0) {
      console.log('First forecast data object:', forecastData.forecast_data[0]);
    }
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Loading State */}
      {systemLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">Loading Seasonal Inventory Products...</p>
              <p className="text-sm text-gray-600">Fetching available products</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !systemLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCategories}
              className="btn btn-primary"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Main UI */}
      {!systemLoading && !error && (
        <>
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
          {/* Removed Refresh Categories and Retrain Model buttons */}
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecast Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a category...</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Time (days)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={leadTime}
                onChange={e => setLeadTime(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                onClick={generateForecast}
                disabled={loading || !selectedCategory}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Forecast Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
            {/* Alert and Recommendation Section */}
            {forecastData && (forecastData.alert || forecastData.recommendation !== null) && (
              <div className="mb-6">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4">
                  {forecastData.alert && (
                    <div>
                      <strong>Inventory Alert:</strong> {forecastData.alert}
                    </div>
                  )}
                  {forecastData.recommendation !== null && (
                    <div>
                      <strong>Recommended Reorder Quantity:</strong> {forecastData.recommendation}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-700">
                    <span>Safety Stock: {forecastData.safety_stock}</span> |
                    <span> Reorder Point: {forecastData.reorder_point}</span> |
                    <span> Max Stock: {forecastData.max_stock}</span> |
                    <span> Avg Daily Demand: {forecastData.average_daily_demand ? Math.round(forecastData.average_daily_demand) : 'N/A'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentStock !== null ? currentStock : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Current Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{recommendation !== null ? recommendation : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Recommended Order</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{outOfStockDate || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Out-of-Stock Date</p>
                  </div>
                </div>
              </div>
            )}
            {/* Demand Forecast Chart - moved above Stock Depletion */}
            {forecastData && Array.isArray(forecastData.forecast_data) && forecastData.forecast_data.length > 0 && (
              <ForecastChart
                data={forecastData.forecast_data.map(d => ({
                  ds: d.date,
                  yhat: d.predicted_demand,
                  yhat_lower: d.lower_bound,
                  yhat_upper: d.upper_bound
                }))}
                loading={loading}
              />
            )}
            {/* Stock vs Demand & Reorder Point Chart */}
            {forecastData && Array.isArray(forecastData.forecast_data) && forecastData.forecast_data.length > 0 && (
              <StockVsDemandChart
                forecastData={forecastData.forecast_data}
                currentStock={forecastData.current_stock}
                reorderPoint={forecastData.reorder_point}
              />
            )}
            {/* Stock Depletion Chart Placeholder */}
            {stockDepletionData.length > 0 && (
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Stock Depletion Over Time</h4>
                {/* Replace below with a real chart component as needed */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Stock</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockDepletionData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                          <td className={`px-4 py-2 whitespace-nowrap ${row.remaining <= 0 ? 'text-red-600 font-bold' : ''}`}>{row.remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Predicted Demand Table */}
            {forecastData && Array.isArray(forecastData.forecast_data) && forecastData.forecast_data.length > 0 ? (
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Predicted Demand Table</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lower Bound</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upper Bound</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mappedForecastData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{row.x}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{row.y.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{row.lower.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{row.upper.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forecast data available</h3>
                <p className="text-gray-600 mb-4">
                  No forecast results for the selected category and days.
                </p>
              </div>
            )}
            {/* Forecast Metrics */}
            {forecastData && forecastData.model_metrics && (
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

        {/* Seasonal Patterns removed */}
      </div>

          {/* Inventory Recommendations removed */}

          {/* No Data State */}
          {!loading && !forecastData && selectedCategory && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecast Data</h3>
              <p className="text-gray-600 mb-4">
                Click "Generate Forecast" to create predictions for {selectedCategory}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SeasonalInventoryDashboard;
