import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { getHealthStatus, ANOMALY_SEVERITY } from '../../utils/anomalyUtils';

/**
 * 📊 Anomaly Stats Overview Component
 * 
 * Dashboard widget showing key anomaly detection metrics:
 * - System health score and status
 * - Severity breakdown with counts
 * - Category distribution
 * - Trend indicators
 * - Quick action links
 */
const AnomalyStatsOverview = ({
  stats = {},
  healthScore = 0,
  loading = false,
  className = '',
  showTrends = true,
  showQuickActions = true
}) => {
  // Ensure stats is not null and provide default structure
  const safeStats = stats || {};
  
  const {
    total_anomalies = 0,
    severity_breakdown = {},
    category_breakdown = {},
    technique_breakdown = {},
    trends = {}
  } = safeStats;

  const healthStatus = getHealthStatus(healthScore);

  // Calculate percentages for severity breakdown
  const severityPercentages = Object.entries(severity_breakdown).reduce((acc, [severity, count]) => {
    acc[severity] = total_anomalies > 0 ? Math.round((count / total_anomalies) * 100) : 0;
    return acc;
  }, {});

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* System Health Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{healthScore}%</span>
                <span 
                  className="px-2 py-1 text-xs font-semibold rounded-full"
                  style={{ 
                    backgroundColor: healthStatus.color + '20', 
                    color: healthStatus.color 
                  }}
                >
                  {healthStatus.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Based on {total_anomalies} detected anomalies
              </p>
            </div>
            <div className="text-3xl" style={{ color: healthStatus.color }}>
              {healthStatus.icon}
            </div>
          </div>
          
          {/* Health Score Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${healthScore}%`,
                  backgroundColor: healthStatus.color
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Counts by Severity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Severity Breakdown</span>
            </div>
            <span className="text-lg font-bold">{total_anomalies}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(ANOMALY_SEVERITY).map((severity) => {
              const count = severity_breakdown[severity.value] || 0;
              const percentage = severityPercentages[severity.value] || 0;
              
              return (
                <Link
                  key={severity.value}
                  to={`/anomaly-detection?severity=${severity.value}`}
                  className="block p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{ borderColor: severity.color + '40' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{severity.icon}</span>
                        <span className="text-sm font-medium">{severity.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}% of total
                      </p>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-lg font-bold"
                        style={{ color: severity.color }}
                      >
                        {count}
                      </div>
                      {showTrends && trends[severity.value] && (
                        <div className="flex items-center text-xs">
                          {trends[severity.value] > 0 ? (
                            <ArrowTrendingUpIcon className="w-3 h-3 text-red-500 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-3 h-3 text-green-500 mr-1" />
                          )}
                          <span className={trends[severity.value] > 0 ? 'text-red-500' : 'text-green-500'}>
                            {Math.abs(trends[severity.value])}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(category_breakdown).map(([category, count]) => {
              const percentage = total_anomalies > 0 ? Math.round((count / total_anomalies) * 100) : 0;
              
              return (
                <Link
                  key={category}
                  to={`/anomaly-detection?category=${category}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {category === 'inventory' && '📦'}
                      {category === 'orders' && '🛒'}
                      {category === 'workflow' && '🔄'}
                      {category === 'workers' && '👷'}
                    </span>
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-6 text-right">{count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detection Techniques */}
      {technique_breakdown && Object.keys(technique_breakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Detection Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(technique_breakdown).map(([technique, count]) => {
                const percentage = total_anomalies > 0 ? Math.round((count / total_anomalies) * 100) : 0;
                
                return (
                  <div key={technique} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {technique === 'ml' ? '🤖' : '📋'}
                      </span>
                      <span className="text-sm font-medium">
                        {technique === 'ml' ? 'Machine Learning' : 'Rule-based'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{percentage}%</span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/anomaly-detection"
                className="flex items-center justify-between p-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                <span>View All Anomalies</span>
                <span>→</span>
              </Link>
              
              <Link
                to="/anomaly-detection?severity=critical"
                className="flex items-center justify-between p-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                <span>Critical Issues Only</span>
                <span>→</span>
              </Link>
              
              <Link
                to="/anomaly-detection/analysis"
                className="flex items-center justify-between p-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                <span>Analysis & Reports</span>
                <span>→</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
        <ClockIcon className="w-3 h-3" />
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default AnomalyStatsOverview;
