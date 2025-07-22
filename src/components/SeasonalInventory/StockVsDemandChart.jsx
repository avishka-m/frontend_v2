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

const StockVsDemandChart = ({ forecastData, currentStock, reorderPoint }) => {
  if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  // Prepare chart data
  const dates = forecastData.map(item => item.date);
  const predictedDemand = forecastData.map(item => item.predicted_demand);
  let stockLevels = [];
  let stock = currentStock ?? 0;
  for (let i = 0; i < forecastData.length; i++) {
    stock -= forecastData[i].predicted_demand;
    stockLevels.push(stock);
  }

  const reorderPointLine = Array(forecastData.length).fill(reorderPoint ?? 0);

  const chartData = {
    labels: dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Predicted Demand',
        data: predictedDemand,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        pointRadius: 2,
        fill: false,
      },
      {
        label: 'Stock Level',
        data: stockLevels,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 2,
        fill: false,
      },
      {
        label: 'Reorder Point',
        data: reorderPointLine,
        borderColor: 'rgb(239, 68, 68)', // red
        borderDash: [6, 6],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Stock vs Demand & Reorder Point',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: true,
        position: 'top',
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
              return `${label}: ${Math.round(value)}`;
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
          text: 'Units',
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

export default StockVsDemandChart;
