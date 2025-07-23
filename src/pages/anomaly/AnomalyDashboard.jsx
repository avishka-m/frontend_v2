import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  FunnelIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAnomalyDetection } from '../../hooks/useAnomalyDetection';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';

// Anomaly components
import AnomalyStatsOverview from '../../components/anomaly/AnomalyStatsOverview';
import AnomalyList from '../../components/anomaly/AnomalyList';
import AnomalyDetailsModal from '../../components/anomaly/AnomalyDetailsModal';
import AnomalyCategoryFilters from '../../components/anomaly/AnomalyCategoryFilters';
import AnomalyHealthScore from '../../components/anomaly/AnomalyHealthScore';
import AnomalyChart from '../../components/anomaly/AnomalyChart';

/**
 * 🔍 Enhanced Anomaly Detection Dashboard
 * 
 * Comprehensive dashboard featuring:
 * - Real-time anomaly monitoring with auto-refresh
 * - Advanced filtering and categorization
 * - Interactive charts and visualizations
 * - Detailed anomaly investigation tools
 * - Health scoring and system status
 * - Mobile-responsive design
 */
const AnomalyDashboard = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'chart'
  const [selectedCategories, setSelectedCategories] = useState(new Set(['all']));
  const [selectedSeverities, setSelectedSeverities] = useState(new Set(['all']));
  const [detectionTechnique, setDetectionTechnique] = useState('both');
  
  // Refs
  const refreshIntervalRef = useRef(null);

  // Get anomaly detection hook
  const {
    anomalies,
    allAnomalies,
    summary,
    healthScore,
    loading,
    detecting,
    error,
    hasAnomalies,
    criticalCount,
    highCount,
    isHealthy,
    detectAllAnomalies,
    detectCategoryAnomalies,
    dismissAnomaly,
    refreshData,
    getAnalysisSummary
  } = useAnomalyDetection({
    initialCategory: searchParams.get('category') || 'all',
    initialSeverity: searchParams.get('severity') || 'all',
    includeMl: true,
    autoRefresh: autoRefreshEnabled
  });

  // Effects
  useEffect(() => {
    // Initial load
    detectAllAnomalies();
    getAnalysisSummary();
  }, []);

  useEffect(() => {
    // Handle auto-refresh
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, refreshInterval, refreshData]);

  // Event handlers
  const handleRefresh = async () => {
    await detectAllAnomalies();
  };

  const handleCategoryFilter = (categories) => {
    setSelectedCategories(categories);
    if (categories.size === 1 && !categories.has('all')) {
      const category = Array.from(categories)[0];
      detectCategoryAnomalies(category, detectionTechnique);
    } else {
      detectAllAnomalies();
    }
  };

  const handleSeverityFilter = (severities) => {
    setSelectedSeverities(severities);
    // Filter is applied in the component level
  };

  const handleTechniqueChange = (technique) => {
    setDetectionTechnique(technique);
    if (selectedCategories.size === 1 && !selectedCategories.has('all')) {
      const category = Array.from(selectedCategories)[0];
      detectCategoryAnomalies(category, technique);
    } else {
      detectAllAnomalies();
    }
  };

  const handleAnomalySelect = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setShowDetailsModal(true);
  };

  const handleAnomalyDismiss = async (anomaly) => {
    await dismissAnomaly(anomaly);
    await refreshData();
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  // Filter anomalies based on current selections
  const filteredAnomalies = React.useMemo(() => {
    let filtered = [...(anomalies || [])];

    if (!selectedSeverities.has('all')) {
      filtered = filtered.filter(anomaly => 
        selectedSeverities.has(anomaly.severity)
      );
    }

    return filtered;
  }, [anomalies, selectedSeverities]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isManager = currentUser?.role === 'Manager' || currentUser?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <ShieldExclamationIcon className="h-8 w-8 text-blue-600" />
            <span>Anomaly Detection Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and analysis of warehouse anomalies
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Auto-refresh controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={autoRefreshEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleAutoRefreshToggle}
              className="flex items-center space-x-2"
            >
              {autoRefreshEnabled ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              <span>{autoRefreshEnabled ? 'Auto-Refresh On' : 'Auto-Refresh Off'}</span>
            </Button>
            
            {autoRefreshEnabled && (
              <Select
                value={refreshInterval.toString()}
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
                className="w-20"
              >
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
              </Select>
            )}
          </div>

          {/* Manual refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || detecting}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${(loading || detecting) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* View mode selector */}
          <Select
            value={viewMode}
            onValueChange={setViewMode}
            className="w-24"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="chart">Chart</option>
          </Select>
        </div>
      </div>

      {/* Health Score and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AnomalyHealthScore 
          score={healthScore}
          isHealthy={isHealthy}
          loading={loading}
        />
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
                <p className="text-2xl font-bold text-blue-600">{allAnomalies?.length || 0}</p>
              </div>
              <ShieldExclamationIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5" />
            <span>Filters & Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detection Technique
              </label>
              <Select
                value={detectionTechnique}
                onValueChange={handleTechniqueChange}
              >
                <option value="both">🔍 Rule-based + ML</option>
                <option value="rule">📋 Rule-based Only</option>
                <option value="ml">🤖 ML-based Only</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <AnomalyCategoryFilters
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryFilter}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Levels
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                  <Badge
                    key={severity}
                    variant={selectedSeverities.has(severity) ? "default" : "outline"}
                    className={`cursor-pointer ${selectedSeverities.has(severity) ? getSeverityColor(severity) : ''}`}
                    onClick={() => {
                      const newSet = new Set(selectedSeverities);
                      if (severity === 'all') {
                        setSelectedSeverities(new Set(['all']));
                      } else {
                        newSet.delete('all');
                        if (newSet.has(severity)) {
                          newSet.delete(severity);
                          if (newSet.size === 0) newSet.add('all');
                        } else {
                          newSet.add(severity);
                        }
                        setSelectedSeverities(newSet);
                      }
                    }}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Area */}
      {viewMode === 'chart' ? (
        <AnomalyChart 
          anomalies={filteredAnomalies}
          summary={summary}
          loading={loading}
        />
      ) : viewMode === 'grid' ? (
        <AnomalyStatsOverview
          anomalies={filteredAnomalies}
          summary={summary}
          onSelectAnomaly={handleAnomalySelect}
          onDismissAnomaly={handleAnomalyDismiss}
          loading={loading}
        />
      ) : (
        <AnomalyList
          anomalies={filteredAnomalies}
          loading={loading}
          onSelectAnomaly={handleAnomalySelect}
          onDismissAnomaly={handleAnomalyDismiss}
          onViewDetails={handleAnomalySelect}
          onRefresh={handleRefresh}
          compact={false}
          showFilters={false} // We have filters above
          showSearch={true}
        />
      )}

      {/* No Anomalies State */}
      {!loading && !error && (!filteredAnomalies || filteredAnomalies.length === 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              No Anomalies Detected
            </h3>
            <p className="text-green-600 mb-4">
              Your warehouse operations are running smoothly! All systems are operating within normal parameters.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Run Another Check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(loading || detecting) && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">
              {detecting ? 'Analyzing warehouse data for anomalies...' : 'Loading dashboard...'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Details Modal */}
      {showDetailsModal && selectedAnomaly && (
        <AnomalyDetailsModal
          anomaly={selectedAnomaly}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAnomaly(null);
          }}
          onDismiss={handleAnomalyDismiss}
          canDismiss={true}
        />
      )}

      {/* Quick Actions Floating Button (Mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={handleRefresh}
          disabled={loading || detecting}
        >
          <ArrowPathIcon className={`h-6 w-6 ${(loading || detecting) ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default AnomalyDashboard;
