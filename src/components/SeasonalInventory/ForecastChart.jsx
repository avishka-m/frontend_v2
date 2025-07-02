import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Typography, Space, Tag } from 'antd';

const { Text } = Typography;

const ForecastChart = ({ data }) => {
  if (!data || !data.forecast) {
    return <div>No forecast data available</div>;
  }

  // Prepare data for the chart
  const chartData = [];
  
  // Add historical data if available
  if (data.historical_data) {
    data.historical_data.forEach(point => {
      chartData.push({
        date: new Date(point.ds).toLocaleDateString(),
        historical: point.y,
        forecast: null,
        lower: null,
        upper: null,
        type: 'historical'
      });
    });
  }

  // Add forecast data
  data.forecast.forEach(point => {
    chartData.push({
      date: new Date(point.ds).toLocaleDateString(),
      historical: null,
      forecast: point.yhat,
      lower: point.yhat_lower,
      upper: point.yhat_upper,
      type: 'forecast'
    });
  });

  // Calculate forecast summary
  const forecastSummary = data.forecast.reduce(
    (acc, point) => {
      acc.total += point.yhat;
      acc.avgDaily = acc.total / data.forecast.length;
      acc.maxDaily = Math.max(acc.maxDaily, point.yhat);
      acc.minDaily = Math.min(acc.minDaily, point.yhat);
      return acc;
    },
    { total: 0, avgDaily: 0, maxDaily: 0, minDaily: Infinity }
  );

  return (
    <div>
      {/* Forecast Summary */}
      <Space style={{ marginBottom: '16px', width: '100%' }} wrap>
        <Tag color="blue">
          Total Forecast: {forecastSummary.total.toFixed(0)} units
        </Tag>
        <Tag color="green">
          Avg Daily: {forecastSummary.avgDaily.toFixed(1)} units
        </Tag>
        <Tag color="orange">
          Peak: {forecastSummary.maxDaily.toFixed(1)} units
        </Tag>
        <Tag color="red">
          Low: {forecastSummary.minDaily.toFixed(1)} units
        </Tag>
      </Space>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              value ? `${Number(value).toFixed(1)} units` : 'N/A',
              name
            ]}
          />
          <Legend />
          
          {/* Historical data line */}
          <Line 
            type="monotone" 
            dataKey="historical" 
            stroke="#1890ff" 
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
            name="Historical"
          />
          
          {/* Forecast area with confidence bounds */}
          <Area
            type="monotone"
            dataKey="upper"
            stackId="confidence"
            stroke="#d9d9d9"
            fill="#f0f0f0"
            fillOpacity={0.3}
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stackId="confidence"
            stroke="#d9d9d9"
            fill="#ffffff"
            fillOpacity={1}
            name="Lower Bound"
          />
          
          {/* Forecast line */}
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#52c41a" 
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
            name="Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Chart Legend */}
      <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
        <Space direction="vertical" size="small">
          <Text type="secondary">
            • <span style={{ color: '#1890ff' }}>■</span> Historical: Actual demand data
          </Text>
          <Text type="secondary">
            • <span style={{ color: '#52c41a' }}>■</span> Forecast: Predicted demand
          </Text>
          <Text type="secondary">
            • <span style={{ color: '#f0f0f0' }}>▓</span> Confidence Bounds: 95% prediction interval
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default ForecastChart;
