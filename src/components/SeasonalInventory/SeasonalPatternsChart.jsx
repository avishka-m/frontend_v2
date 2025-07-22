import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SeasonalPatternsChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading seasonal patterns...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No seasonal pattern data available
      </div>
    );
  }

  // Prepare weekly seasonality data
  const weeklyData = data.weekly_seasonality ? 
    Object.entries(data.weekly_seasonality).map(([day, value]) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)],
      value: value * 100, // Convert to percentage
      dayNumber: parseInt(day)
    })).sort((a, b) => a.dayNumber - b.dayNumber) : [];

  // Prepare monthly seasonality data
  const monthlyData = data.monthly_seasonality ? 
    Object.entries(data.monthly_seasonality).map(([month, value]) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1],
      value: value * 100, // Convert to percentage
      monthNumber: parseInt(month)
    })).sort((a, b) => a.monthNumber - b.monthNumber) : [];

  // Get insights
  const getWeeklyInsights = () => {
    if (weeklyData.length === 0) return null;
    
    const maxDay = weeklyData.reduce((max, day) => day.value > max.value ? day : max);
    const minDay = weeklyData.reduce((min, day) => day.value < min.value ? day : min);
    
    return { peak: maxDay, low: minDay };
  };

  const getMonthlyInsights = () => {
    if (monthlyData.length === 0) return null;
    
    const maxMonth = monthlyData.reduce((max, month) => month.value > max.value ? month : max);
    const minMonth = monthlyData.reduce((min, month) => month.value < min.value ? month : min);
    
    return { peak: maxMonth, low: minMonth };
  };

  const weeklyInsights = getWeeklyInsights();
  const monthlyInsights = getMonthlyInsights();

  // Chart configurations
  const weeklyChartData = {
    labels: weeklyData.map(item => item.day),
    datasets: [
      {
        label: 'Weekly Pattern (%)',
        data: weeklyData.map(item => item.value),
        backgroundColor: weeklyData.map(item => 
          item.value > 100 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
        ),
        borderColor: weeklyData.map(item => 
          item.value > 100 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Pattern (%)',
        data: monthlyData.map(item => item.value),
        backgroundColor: monthlyData.map(item => 
          item.value > 100 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(156, 163, 175, 0.7)'
        ),
        borderColor: monthlyData.map(item => 
          item.value > 100 ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const isAboveAverage = value > 100;
            return `${Math.round(value)}% of average (${isAboveAverage ? 'Above' : 'Below'} average)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '% of Average',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Weekly Patterns */}
      {weeklyData.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Weekly Patterns</h4>
          <div className="h-48 mb-4">
            <Bar data={weeklyChartData} options={chartOptions} />
          </div>
          {weeklyInsights && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-gray-900">Weekly Insights:</p>
              <p className="text-gray-700">
                Highest demand on {weeklyInsights.peak.day} 
                ({weeklyInsights.peak.value.toFixed(1)}% of average)
              </p>
              <p className="text-gray-700">
                Lowest demand on {weeklyInsights.low.day} 
                ({weeklyInsights.low.value.toFixed(1)}% of average)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Monthly Patterns */}
      {monthlyData.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Monthly Patterns</h4>
          <div className="h-48 mb-4">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
          {monthlyInsights && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-gray-900">Monthly Insights:</p>
              <p className="text-gray-700">
                Peak season in {monthlyInsights.peak.month} 
                ({monthlyInsights.peak.value.toFixed(1)}% of average)
              </p>
              <p className="text-gray-700">
                Low season in {monthlyInsights.low.month} 
                ({monthlyInsights.low.value.toFixed(1)}% of average)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Plan inventory increases before peak periods</li>
          <li>• Consider promotions during low demand periods</li>
          <li>• Adjust staffing levels based on weekly patterns</li>
          <li>• Schedule maintenance during low-demand times</li>
        </ul>
      </div>
    </div>
  );
};

export default SeasonalPatternsChart;
