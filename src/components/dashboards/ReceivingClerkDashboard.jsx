import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { ClipboardCheck, Package, Inbox, CheckCircle, AlertTriangle, RotateCcw, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ReceivingClerkDashboard = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    itemsReceived: { total: 0, today: 0 },
    itemsReturned: { total: 0, today: 0 },
    lowStockItems: { count: 0, items: [] }
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Fetch receiving clerk specific metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/analytics/receiving-clerk`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              days: 30 // Last 30 days
            }
          }
        );
        
        if (response.data) {
          setMetrics({
            itemsReceived: response.data.items_received || { total: 0, today: 0 },
            itemsReturned: response.data.items_returned || { total: 0, today: 0 },
            lowStockItems: response.data.low_stock_items || { count: 0, items: [] }
          });
        }
      } catch (error) {
        console.error('Error fetching receiving metrics:', error);
        
        // More detailed error logging
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
          
          if (error.response.status === 401) {
            toast.error('Authentication failed. Please login again.');
          } else if (error.response.status === 403) {
            toast.error('You do not have permission to view these metrics.');
          } else if (error.response.status === 404) {
            toast.error('Metrics endpoint not found. Please check backend configuration.');
          } else {
            toast.error(`Failed to load metrics: ${error.response.data?.detail || 'Unknown error'}`);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('Could not connect to server. Please check if backend is running.');
        } else {
          console.error('Error setting up request:', error.message);
          toast.error('Failed to load metrics: ' + error.message);
        }
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="space-y-6">
      {/* Custom Stats Cards for Receiving Clerk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items Received Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Inbox className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Items Received</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingMetrics ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    metrics.itemsReceived.total
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Today</div>
              <div className="text-sm font-medium text-green-600">
                {loadingMetrics ? '...' : `+${metrics.itemsReceived.today}`}
              </div>
            </div>
          </div>
        </div>

        {/* Items Returned Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <RotateCcw className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Items Returned</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingMetrics ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    metrics.itemsReturned.total
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Today</div>
              <div className="text-sm font-medium text-yellow-600">
                {loadingMetrics ? '...' : `+${metrics.itemsReturned.today}`}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loadingMetrics ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    metrics.lowStockItems.count
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Critical</div>
              <div className="text-sm font-medium text-red-600">
                {loadingMetrics ? '...' : (
                  metrics.lowStockItems.count > 0 ? 
                  <AlertTriangle className="h-4 w-4 inline" /> : 
                  <CheckCircle className="h-4 w-4 inline text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Items List (if any) */}
      {!loadingMetrics && metrics.lowStockItems.count > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
            <p className="text-sm text-gray-600">Items requiring immediate attention</p>
          </div>
          <div className="divide-y divide-gray-200">
            {metrics.lowStockItems.items.slice(0, 5).map((item, index) => (
              <div key={item.inventoryID || index} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                    <p className="text-xs text-gray-500">Category: {item.category || 'Uncategorized'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {item.stock_level} / {item.min_stock_level}
                    </p>
                    <p className="text-xs text-gray-500">Current / Min</p>
                  </div>
                </div>
              </div>
            ))}
            {metrics.lowStockItems.count > 5 && (
              <div className="px-6 py-3 text-center">
                <p className="text-sm text-gray-500">
                  And {metrics.lowStockItems.count - 5} more items...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Dashboard Component */}
      <WorkflowDashboard 
        title="Receiving Workflow"
        role="ReceivingClerk"
        iconComponent={ClipboardCheck}
        gradientColors="from-blue-500 to-cyan-600"
      />
    </div>
  );
};

export default ReceivingClerkDashboard;