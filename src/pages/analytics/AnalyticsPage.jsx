import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/analytics/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading analytics...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }

  if (!data) {
    return null;
  }

  // Helper to render a metric card
  const MetricCard = ({ title, metrics }) => (
    <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[250px]">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="space-y-1">
        {Object.entries(metrics).map(([key, value]) => (
          <li key={key} className="flex justify-between text-sm">
            <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
            <span className="font-medium text-gray-900">{String(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Warehouse Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Inventory" metrics={data.inventory || {}} />
        <MetricCard title="Orders" metrics={data.orders || {}} />
        <MetricCard title="Operations" metrics={data.operations || {}} />
        <MetricCard title="Warehouse Utilization" metrics={data.warehouse || {}} />
      </div>
      {/* You can add more detailed charts or tables here if needed */}
    </div>
  );
};

export default AnalyticsPage;
