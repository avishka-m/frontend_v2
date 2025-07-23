import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAnomalyDetection } from '../../hooks/useAnomalyDetection';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { 
  prepareSeverityChartData, 
  prepareCategoryChartData,
  ANOMALY_SEVERITY,
  ANOMALY_CATEGORIES 
} from '../../utils/anomalyUtils';

/**
 * 📊 Anomaly Detection Analysis Page
 * 
 * Advanced analytics and reporting for anomaly detection:
 * - Trend analysis over time
 * - Distribution charts by severity and category
 * - Performance metrics and KPIs
 * - Detailed reports and recommendations
 */
const AnomalyAnalysisPage = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [chartType, setChartType] = useState('severity');

  const {
    allAnomalies,
    summary,
    healthScore,
    loading,
    getAnalysisSummary
  } = useAnomalyDetection();

  // Load analysis data
  useEffect(() => {
    getAnalysisSummary({ days: parseInt(timeRange) });
  }, [timeRange, getAnalysisSummary]);

  // Prepare chart data
  const severityChartData = prepareSeverityChartData(summary?.severity_breakdown || {});
  const categoryChartData = prepareCategoryChartData(summary?.category_breakdown || {});

  // Mock trend data (in a real app, this would come from the API)
  const trendData = [
    { date: '2024-01-15', total: 12, critical: 2, high: 4, medium: 4, low: 2 },
    { date: '2024-01-16', total: 8, critical: 1, high: 2, medium: 3, low: 2 },
    { date: '2024-01-17', total: 15, critical: 3, high: 5, medium: 4, low: 3 },
    { date: '2024-01-18', total: 10, critical: 1, high: 3, medium: 4, low: 2 },
    { date: '2024-01-19', total: 7, critical: 0, high: 2, medium: 3, low: 2 },
    { date: '2024-01-20', total: 11, critical: 2, high: 3, medium: 4, low: 2 },
    { date: '2024-01-21', total: 14, critical: 2, high: 4, medium: 5, low: 3 }
  ];

  // Calculate trends
  const calculateTrend = (data, key) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    return previous === 0 ? 0 : ((latest - previous) / previous) * 100;
  };

  const totalTrend = calculateTrend(trendData, 'total');
  const criticalTrend = calculateTrend(trendData, 'critical');

  // Export analysis report
  const exportAnalysis = () => {
    const report = {
      generated_at: new Date().toISOString(),
      time_range: `${timeRange} days`,
      summary: {
        total_anomalies: allAnomalies.length,
        health_score: healthScore,
        severity_breakdown: summary?.severity_breakdown || {},
        category_breakdown: summary?.category_breakdown || {}
      },
      trends: trendData,
      recommendations: summary?.recommendations || []
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomaly-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/anomaly-detection">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Anomaly Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Detailed analytics and trend analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { value: '1', label: 'Last 24 hours' },
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' }
              ]}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={exportAnalysis}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Anomalies</p>
                  <p className="text-2xl font-bold">{allAnomalies.length}</p>
                  <div className="flex items-center mt-1">
                    {totalTrend >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 text-red-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-green-500 mr-1" />
                    )}
                    <span className={`text-xs ${totalTrend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {Math.abs(totalTrend).toFixed(1)}% vs yesterday
                    </span>
                  </div>
                </div>
                <div className="text-3xl">🔍</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary?.severity_breakdown?.critical || 0}
                  </p>
                  <div className="flex items-center mt-1">
                    {criticalTrend >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 text-red-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-green-500 mr-1" />
                    )}
                    <span className={`text-xs ${criticalTrend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {Math.abs(criticalTrend).toFixed(1)}% vs yesterday
                    </span>
                  </div>
                </div>
                <div className="text-3xl">🚨</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Health</p>
                  <p className="text-2xl font-bold">{healthScore}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {healthScore >= 90 ? 'Excellent' : 
                     healthScore >= 70 ? 'Good' : 
                     healthScore >= 50 ? 'Warning' : 'Critical'}
                  </p>
                </div>
                <div className="text-3xl">
                  {healthScore >= 90 ? '✅' : 
                   healthScore >= 70 ? '⚠️' : '🚨'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Detection Rate</p>
                  <p className="text-2xl font-bold">
                    {(allAnomalies.length / parseInt(timeRange)).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per day average</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Anomaly Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple trend visualization */}
                <div className="h-48 flex items-end space-x-2">
                  {trendData.map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${(point.total / Math.max(...trendData.map(d => d.total))) * 100}%`,
                          minHeight: '4px'
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(point.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Anomalies detected over the last {timeRange} days
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Distribution Analysis</span>
                <Select
                  value={chartType}
                  onChange={setChartType}
                  options={[
                    { value: 'severity', label: 'By Severity' },
                    { value: 'category', label: 'By Category' }
                  ]}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple distribution visualization */}
                {chartType === 'severity' ? (
                  <div className="space-y-3">
                    {Object.values(ANOMALY_SEVERITY).map((severity) => {
                      const count = summary?.severity_breakdown?.[severity.value] || 0;
                      const percentage = allAnomalies.length > 0 
                        ? (count / allAnomalies.length) * 100 
                        : 0;
                      
                      return (
                        <div key={severity.value} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 w-20">
                            <span>{severity.icon}</span>
                            <span className="text-sm font-medium">{severity.label}</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: severity.color
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.values(ANOMALY_CATEGORIES).map((category) => {
                      const count = summary?.category_breakdown?.[category.value] || 0;
                      const percentage = allAnomalies.length > 0 
                        ? (count / allAnomalies.length) * 100 
                        : 0;
                      
                      return (
                        <div key={category.value} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 w-24">
                            <span>{category.icon}</span>
                            <span className="text-sm font-medium">{category.label}</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: category.color
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {summary?.recommendations && summary.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-500 mt-1">💡</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">{rec.title || 'Recommendation'}</p>
                      <p className="text-sm text-blue-700 mt-1">{rec.description || rec}</p>
                      {rec.priority && (
                        <span className={`
                          inline-block px-2 py-1 text-xs rounded mt-2
                          ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'}
                        `}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading analysis data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAnalysisPage;
