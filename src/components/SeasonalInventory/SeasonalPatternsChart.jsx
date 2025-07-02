import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Tabs, Space, Statistic, Row, Col } from 'antd';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const SeasonalPatternsChart = ({ data }) => {
  if (!data) {
    return <div>No seasonal pattern data available</div>;
  }

  // Process weekly seasonality data
  const weeklyData = data.weekly_seasonality ? 
    Object.entries(data.weekly_seasonality).map(([day, value]) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)],
      value: value * 100, // Convert to percentage
      dayNumber: parseInt(day)
    })).sort((a, b) => a.dayNumber - b.dayNumber) : [];

  // Process monthly seasonality data
  const monthlyData = data.monthly_seasonality ?
    Object.entries(data.monthly_seasonality).map(([month, value]) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1],
      value: value * 100, // Convert to percentage
      monthNumber: parseInt(month)
    })).sort((a, b) => a.monthNumber - b.monthNumber) : [];

  // Get peak and low periods
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

  return (
    <Tabs defaultActiveKey="weekly" size="small">
      <TabPane tab="Weekly Patterns" key="weekly">
        <div>
          {weeklyInsights && (
            <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Statistic
                  title="Peak Day"
                  value={weeklyInsights.peak.day}
                  valueStyle={{ color: '#52c41a', fontSize: '14px' }}
                  suffix={`(${weeklyInsights.peak.value.toFixed(1)}%)`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Low Day"
                  value={weeklyInsights.low.day}
                  valueStyle={{ color: '#f5222d', fontSize: '14px' }}
                  suffix={`(${weeklyInsights.low.value.toFixed(1)}%)`}
                />
              </Col>
            </Row>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Seasonal %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Seasonal Effect']} />
              <Bar dataKey="value" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Shows how demand varies by day of the week relative to average
          </Text>
        </div>
      </TabPane>

      <TabPane tab="Monthly Patterns" key="monthly">
        <div>
          {monthlyInsights && (
            <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Statistic
                  title="Peak Month"
                  value={monthlyInsights.peak.month}
                  valueStyle={{ color: '#52c41a', fontSize: '14px' }}
                  suffix={`(${monthlyInsights.peak.value.toFixed(1)}%)`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Low Month"
                  value={monthlyInsights.low.month}
                  valueStyle={{ color: '#f5222d', fontSize: '14px' }}
                  suffix={`(${monthlyInsights.low.value.toFixed(1)}%)`}
                />
              </Col>
            </Row>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Seasonal %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Seasonal Effect']} />
              <Bar dataKey="value" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Shows how demand varies by month relative to average
          </Text>
        </div>
      </TabPane>

      <TabPane tab="Insights" key="insights">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>Seasonal Insights</Title>
          
          {weeklyInsights && (
            <div>
              <Text strong>Weekly Pattern:</Text>
              <br />
              <Text type="secondary">
                Highest demand on {weeklyInsights.peak.day} 
                ({weeklyInsights.peak.value.toFixed(1)}% of average)
              </Text>
              <br />
              <Text type="secondary">
                Lowest demand on {weeklyInsights.low.day} 
                ({weeklyInsights.low.value.toFixed(1)}% of average)
              </Text>
            </div>
          )}

          {monthlyInsights && (
            <div style={{ marginTop: '12px' }}>
              <Text strong>Monthly Pattern:</Text>
              <br />
              <Text type="secondary">
                Peak season in {monthlyInsights.peak.month} 
                ({monthlyInsights.peak.value.toFixed(1)}% of average)
              </Text>
              <br />
              <Text type="secondary">
                Low season in {monthlyInsights.low.month} 
                ({monthlyInsights.low.value.toFixed(1)}% of average)
              </Text>
            </div>
          )}

          <div style={{ marginTop: '12px' }}>
            <Text strong>Recommendations:</Text>
            <br />
            <Text type="secondary">
              • Plan inventory increases before peak periods
            </Text>
            <br />
            <Text type="secondary">
              • Consider promotions during low demand periods
            </Text>
            <br />
            <Text type="secondary">
              • Adjust staffing based on weekly patterns
            </Text>
          </div>
        </Space>
      </TabPane>
    </Tabs>
  );
};

export default SeasonalPatternsChart;
