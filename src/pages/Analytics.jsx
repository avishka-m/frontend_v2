import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  
  // Simulated chart data
  const mockChartData = {
    // Simulate data for orders processed over time
    ordersProcessed: {
      day: [12, 15, 8, 11, 14, 9, 13],
      week: [65, 72, 81, 76, 84, 92, 88, 79],
      month: [280, 290, 315, 342, 370, 385, 412, 425, 405, 392, 410, 435],
      year: [1250, 1380, 1420, 1510, 1680, 1790, 1880, 1950, 2050, 2150, 2270, 2380]
    },
    // Simulate data for inventory levels
    inventoryLevels: {
      day: [2400, 2410, 2390, 2380, 2375, 2350, 2340],
      week: [2450, 2400, 2380, 2350, 2340, 2320, 2310, 2290],
      month: [2500, 2475, 2450, 2425, 2400, 2375, 2350, 2325, 2300, 2275, 2250, 2225],
      year: [2600, 2550, 2500, 2450, 2400, 2350, 2300, 2250, 2200, 2150, 2100, 2050]
    },
    // Simulate data for warehouse utilization
    warehouseUtilization: {
      day: [72, 74, 75, 73, 76, 77, 75],
      week: [70, 71, 73, 75, 76, 74, 72, 71],
      month: [68, 69, 70, 71, 72, 73, 74, 75, 76, 75, 74, 73],
      year: [65, 67, 68, 70, 72, 74, 75, 76, 77, 78, 79, 80]
    },
    // Simulate data for worker productivity
    workerProductivity: {
      day: [85, 87, 86, 88, 90, 89, 91],
      week: [84, 85, 86, 87, 88, 89, 90, 91],
      month: [82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93],
      year: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91]
    }
  };

  // Simulated metrics data
  const mockMetricsData = {
    day: {
      ordersProcessed: 82,
      ordersPercentChange: 5.1,
      inventoryTurnover: 0.12,
      inventoryTurnoverChange: -0.8,
      avgPickingTime: 15,
      pickingTimeChange: -2.3,
      avgPackingTime: 8,
      packingTimeChange: -1.5,
      onTimeDelivery: 96.5,
      onTimeDeliveryChange: 0.4,
      returns: 3,
      returnsChange: -0.2
    },
    week: {
      ordersProcessed: 537,
      ordersPercentChange: 7.4,
      inventoryTurnover: 0.83,
      inventoryTurnoverChange: 1.2,
      avgPickingTime: 16,
      pickingTimeChange: -1.8,
      avgPackingTime: 9,
      packingTimeChange: -0.9,
      onTimeDelivery: 94.8,
      onTimeDeliveryChange: 1.2,
      returns: 15,
      returnsChange: -0.6
    },
    month: {
      ordersProcessed: 2345,
      ordersPercentChange: 12.6,
      inventoryTurnover: 3.65,
      inventoryTurnoverChange: 3.5,
      avgPickingTime: 17,
      pickingTimeChange: -4.2,
      avgPackingTime: 10,
      packingTimeChange: -2.1,
      onTimeDelivery: 93.7,
      onTimeDeliveryChange: 2.5,
      returns: 68,
      returnsChange: -1.8
    },
    year: {
      ordersProcessed: 28750,
      ordersPercentChange: 18.3,
      inventoryTurnover: 42.1,
      inventoryTurnoverChange: 5.7,
      avgPickingTime: 22,
      pickingTimeChange: -15.4,
      avgPackingTime: 12,
      packingTimeChange: -8.3,
      onTimeDelivery: 91.2,
      onTimeDeliveryChange: 4.6,
      returns: 824,
      returnsChange: -3.2
    }
  };

  // Simulate fetching analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setAnalytics({
          chartData: mockChartData,
          metrics: mockMetricsData
        });
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Helper function to display a trend indicator
  const TrendIndicator = ({ value, inverse = false }) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const trendClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`flex items-center text-sm ${trendClass}`}>
        {isPositive ? (
          <ArrowTrendingUpIcon className="h-3 w-3 mr-1 rotate-0" />
        ) : (
          <ArrowTrendingUpIcon className="h-3 w-3 mr-1 rotate-180" />
        )}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  // Stat card component
  const StatCard = ({ title, value, trend, trendInverse = false, icon }) => {
    return (
      <div className="card p-6">
        <div className="flex items-center mb-3">
          <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-3">
            {icon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500">{title}</div>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-semibold">{value}</div>
              {trend !== undefined && (
                <TrendIndicator value={trend} inverse={trendInverse} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateTimeLabels = () => {
    switch (timeRange) {
      case 'day':
        return ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'];
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor warehouse performance and key metrics</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setLoading(true)}
            className="btn btn-icon btn-secondary"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="btn btn-primary">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === 'day' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setTimeRange('day')}
        >
          Today
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === 'week' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setTimeRange('week')}
        >
          This Week
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === 'month' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setTimeRange('month')}
        >
          This Month
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === 'year' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setTimeRange('year')}
        >
          This Year
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state or content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              title="Orders Processed" 
              value={analytics.metrics[timeRange].ordersProcessed} 
              trend={analytics.metrics[timeRange].ordersPercentChange}
              icon={<DocumentChartBarIcon className="h-6 w-6" />}
            />
            <StatCard 
              title="Inventory Turnover" 
              value={analytics.metrics[timeRange].inventoryTurnover.toFixed(2)} 
              trend={analytics.metrics[timeRange].inventoryTurnoverChange}
              icon={<CubeIcon className="h-6 w-6" />}
            />
            <StatCard 
              title="On-time Delivery" 
              value={`${analytics.metrics[timeRange].onTimeDelivery}%`} 
              trend={analytics.metrics[timeRange].onTimeDeliveryChange}
              icon={<TruckIcon className="h-6 w-6" />}
            />
            <StatCard 
              title="Avg. Picking Time" 
              value={`${analytics.metrics[timeRange].avgPickingTime} min`} 
              trend={analytics.metrics[timeRange].pickingTimeChange}
              trendInverse={true}
              icon={<ClockIcon className="h-6 w-6" />}
            />
            <StatCard 
              title="Avg. Packing Time" 
              value={`${analytics.metrics[timeRange].avgPackingTime} min`} 
              trend={analytics.metrics[timeRange].packingTimeChange}
              trendInverse={true}
              icon={<ClockIcon className="h-6 w-6" />}
            />
            <StatCard 
              title="Returns" 
              value={analytics.metrics[timeRange].returns} 
              trend={analytics.metrics[timeRange].returnsChange}
              trendInverse={true}
              icon={<ArrowPathIcon className="h-6 w-6" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Processed Chart */}
            <div className="card p-6">
              <h3 className="font-medium mb-4">Orders Processed</h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2">Chart visualization would be here</p>
                  <p className="text-sm">Data: {analytics.chartData.ordersProcessed[timeRange].join(', ')}</p>
                  <p className="text-sm mt-2">Labels: {generateTimeLabels().join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Inventory Levels Chart */}
            <div className="card p-6">
              <h3 className="font-medium mb-4">Inventory Levels</h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2">Chart visualization would be here</p>
                  <p className="text-sm">Data: {analytics.chartData.inventoryLevels[timeRange].join(', ')}</p>
                  <p className="text-sm mt-2">Labels: {generateTimeLabels().join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Warehouse Utilization Chart */}
            <div className="card p-6">
              <h3 className="font-medium mb-4">Warehouse Utilization (%)</h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2">Chart visualization would be here</p>
                  <p className="text-sm">Data: {analytics.chartData.warehouseUtilization[timeRange].join(', ')}</p>
                  <p className="text-sm mt-2">Labels: {generateTimeLabels().join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Worker Productivity Chart */}
            <div className="card p-6">
              <h3 className="font-medium mb-4">Worker Productivity (%)</h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2">Chart visualization would be here</p>
                  <p className="text-sm">Data: {analytics.chartData.workerProductivity[timeRange].join(', ')}</p>
                  <p className="text-sm mt-2">Labels: {generateTimeLabels().join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="card p-6">
            <h3 className="font-medium mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Order Processing Efficiency Increased</h4>
                  <p className="text-gray-600 mt-1">
                    Order processing efficiency has increased by {analytics.metrics[timeRange].ordersPercentChange.toFixed(1)}% compared to the previous period.
                    This improvement may be attributed to recent workflow optimizations and staff training.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Worker Productivity on the Rise</h4>
                  <p className="text-gray-600 mt-1">
                    Worker productivity is trending upward, with an average increase of {analytics.chartData.workerProductivity[timeRange][analytics.chartData.workerProductivity[timeRange].length - 1] - analytics.chartData.workerProductivity[timeRange][0]}% over the period.
                    Consider implementing rewards for top performers.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Seasonal Trend Alert</h4>
                  <p className="text-gray-600 mt-1">
                    Based on historical data, we're entering a period of increased order volume. 
                    Consider scheduling additional staff and preparing inventory accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Analytics;