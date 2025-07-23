import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading forecast data...</span>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No forecast data available
      </div>
    );
  }

  // Prepare chart data for forecast only
  const forecastDates = data.map(item => item.ds);
  const forecastValues = data.map(item => item.yhat);
  const upperBound = data.map(item => item.yhat_upper);
  const lowerBound = data.map(item => item.yhat_lower);

  const chartData = {
    labels: forecastDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Forecast',
        data: forecastValues,
        borderColor: '#22c55e', // green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [],
        fill: false,
      },
      {
        label: 'Confidence Upper',
        data: upperBound,
        borderColor: '#6b7280', // gray
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1',
        order: 3,
      },
      {
        label: 'Confidence Lower',
        data: lowerBound,
        borderColor: '#6b7280', // gray
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        order: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Demand Forecast for ${data.product_id || 'Product'}`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          filter: function(legendItem) {
            return !legendItem.text.includes('Confidence');
          }
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value !== null) {
              return `${label}: ${Math.round(value)} units`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Demand (Units)',
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ForecastChart;
