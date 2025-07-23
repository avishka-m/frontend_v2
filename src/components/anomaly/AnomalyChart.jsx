import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

/**
 * 📊 Anomaly Chart Component
 * 
 * Interactive charts and visualizations for anomaly data:
 * - Severity distribution (pie chart)
 * - Category breakdown (bar chart)
 * - Trend analysis (line chart)
 * - Detection technique comparison
 */
const AnomalyChart = ({ 
  anomalies = [], 
  summary = {}, 
  loading = false,
  timeRange = '7d' // '1d', '7d', '30d'
}) => {
  // Color schemes
  const SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#65a30d'
  };

  const CATEGORY_COLORS = {
    inventory: '#10b981',
    orders: '#f59e0b',
    workflow: '#8b5cf6',
    workers: '#6366f1'
  };

  // Prepare severity data
  const severityData = React.useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    anomalies.forEach(anomaly => {
      if (counts.hasOwnProperty(anomaly.severity)) {
        counts[anomaly.severity]++;
      }
    });
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([severity, count]) => ({
        name: severity.charAt(0).toUpperCase() + severity.slice(1),
        value: count,
        color: SEVERITY_COLORS[severity]
      }));
  }, [anomalies]);

  // Prepare category data
  const categoryData = React.useMemo(() => {
    const counts = { inventory: 0, orders: 0, workflow: 0, workers: 0 };
    anomalies.forEach(anomaly => {
      if (counts.hasOwnProperty(anomaly.category)) {
        counts[anomaly.category]++;
      }
    });
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
        color: CATEGORY_COLORS[category]
      }));
  }, [anomalies]);

  // Prepare technique comparison data
  const techniqueData = React.useMemo(() => {
    const counts = { rule_based: 0, ml_based: 0, both: 0 };
    anomalies.forEach(anomaly => {
      const technique = anomaly.technique || anomaly.detection_method || 'unknown';
      if (counts.hasOwnProperty(technique)) {
        counts[technique]++;
      }
    });
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([technique, count]) => ({
        name: technique.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count
      }));
  }, [anomalies]);

  // Mock trend data (in a real app, this would come from historical data)
  const trendData = React.useMemo(() => {
    const days = timeRange === '1d' ? 24 : timeRange === '7d' ? 7 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate mock data based on current anomalies
      const totalAnomalies = anomalies.length;
      const mockValue = Math.max(0, totalAnomalies + Math.floor(Math.random() * 10) - 5);
      
      data.push({
        date: timeRange === '1d' 
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        anomalies: mockValue,
        critical: Math.floor(mockValue * 0.1),
        high: Math.floor(mockValue * 0.2),
        medium: Math.floor(mockValue * 0.4),
        low: Math.floor(mockValue * 0.3)
      });
    }
    
    return data;
  }, [anomalies, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-300 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{anomalies.length}</div>
            <div className="text-sm text-gray-600">Total Anomalies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {severityData.find(d => d.name === 'Critical')?.value || 0}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {severityData.find(d => d.name === 'High')?.value || 0}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((severityData.find(d => d.name === 'Low')?.value || 0) / (anomalies.length || 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Low Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>🏷️ Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Anomaly Trends ({timeRange})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="critical" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Critical"
                />
                <Line 
                  type="monotone" 
                  dataKey="high" 
                  stroke="#ea580c" 
                  strokeWidth={2}
                  name="High"
                />
                <Line 
                  type="monotone" 
                  dataKey="medium" 
                  stroke="#d97706" 
                  strokeWidth={2}
                  name="Medium"
                />
                <Line 
                  type="monotone" 
                  dataKey="low" 
                  stroke="#65a30d" 
                  strokeWidth={2}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detection Technique Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>🔬 Detection Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={techniqueData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* No Data State */}
      {anomalies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 text-lg mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Display</h3>
            <p className="text-gray-600">
              Run anomaly detection to see charts and visualizations here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnomalyChart;
