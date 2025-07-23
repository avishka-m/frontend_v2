import React from 'react';
import { 
  HeartIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../common/Card';

/**
 * 🎯 Anomaly Health Score Component
 * 
 * Displays the overall system health score with:
 * - Visual health indicator
 * - Score percentage
 * - Status description
 * - Trend indication
 */
const AnomalyHealthScore = ({ 
  score = 0, 
  isHealthy = true, 
  loading = false,
  lastUpdated = null,
  trend = null // 'up', 'down', 'stable'
}) => {
  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getHealthIcon = (score) => {
    if (score >= 80) return CheckCircleIcon;
    if (score >= 60) return ExclamationTriangleIcon;
    return ExclamationTriangleIcon;
  };

  const getHealthMessage = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Critical';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const HealthIcon = getHealthIcon(score);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 ${getHealthColor(score)}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <HeartIcon className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-600">System Health</p>
              {trend && (
                <span className="text-xs" title={`Trend: ${trend}`}>
                  {getTrendIcon(trend)}
                </span>
              )}
            </div>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold">{score}</p>
              <p className="text-sm text-gray-500 mb-1">/ 100</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(score)}`}>
                {getHealthMessage(score)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <HealthIcon className={`h-8 w-8 ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`} />
            {lastUpdated && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <ClockIcon className="h-3 w-3" />
                <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Health Score Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-green-500' :
                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnomalyHealthScore;
