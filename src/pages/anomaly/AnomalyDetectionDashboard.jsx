import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAnomalyDetection } from '../../hooks/useAnomalyDetection';
import { anomalyDetectionService } from '../../services/anomalyDetectionService';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import AnomalyList from '../../components/anomaly/AnomalyList';
import AnomalyStatsOverview from '../../components/anomaly/AnomalyStatsOverview';
import AnomalyDetailsModal from '../../components/anomaly/AnomalyDetailsModal';

/**
 * 🔍 Anomaly Detection Dashboard
 * 
 * Main dashboard for anomaly detection and management featuring:
 * - Real-time anomaly monitoring
 * - Comprehensive filtering and search
 * - Statistics and overview widgets
 * - Detailed anomaly investigation
 * - Management controls (for authorized users)
 */
const AnomalyDetectionDashboard = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Initialize hook with URL parameters
  const {
    anomalies,
    allAnomalies,
    summary,
    healthScore,
    loading,
    error,
    hasAnomalies,
    criticalCount,
    highCount,
    isHealthy,
    detectAllAnomalies,
    refreshAll,
    setCategoryFilter,
    setSeverityFilter,
    clearError,
    startAutoRefresh,
    stopAutoRefresh
  } = useAnomalyDetection({
    autoRefresh: autoRefreshEnabled,
    refreshInterval: 30000, // 30 seconds
    includeMl: true,
    initialCategory: searchParams.get('category') || 'all',
    initialSeverity: searchParams.get('severity') || 'all'
  });

  // Handle URL parameter changes
  useEffect(() => {
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    
    if (category) {
      setCategoryFilter(category);
    }
    if (severity) {
      setSeverityFilter(severity);
    }
  }, [searchParams, setCategoryFilter, setSeverityFilter]);

  // Handle anomaly selection
  const handleSelectAnomaly = (anomaly) => {
    console.log('👁️ Viewing anomaly details:', anomaly.id || anomaly.anomaly_id, anomaly);
    setSelectedAnomaly(anomaly);
    setShowDetailsModal(true);
    console.log('✅ Details modal opened');
  };

  // Handle anomaly dismissal
  const handleDismissAnomaly = async (anomaly) => {
    try {
      const anomalyId = anomaly.id || anomaly.anomaly_id || `temp-${anomaly.anomaly_type}`;
      console.log('🗑️ Dismissing anomaly:', anomalyId, anomaly);
      
      // Show loading state could be added here
      const result = await anomalyDetectionService.dismissAnomaly(anomaly);
      
      if (result.success) {
        console.log('✅ Anomaly dismissed successfully:', result.message);
        
        // Show success notification (you can replace with toast notification)
        if (result.data?.simulated) {
          console.log('ℹ️ Dismissal was simulated locally');
        }
        
        // Refresh the anomaly data to reflect the dismissal
        await refreshAll();
        console.log('🔄 Anomaly data refreshed after dismissal');
      } else {
        console.error('❌ Failed to dismiss anomaly:', result.error);
        alert(`Failed to dismiss anomaly: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error dismissing anomaly:', error);
      alert(`Error dismissing anomaly: ${error.message}`);
    }
  };

  // Handle anomaly resolution
  const handleResolveAnomaly = (anomaly) => {
    console.log('Resolving anomaly:', anomaly.id);
    // In a real app, this would call an API to resolve the anomaly
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  // Export anomalies data
  const exportAnomalies = () => {
    const data = {
      export_date: new Date().toISOString(),
      total_anomalies: allAnomalies.length,
      summary,
      anomalies: allAnomalies
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomalies-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const isManager = currentUser?.role === 'Manager';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🔍 Anomaly Detection
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and analysis of warehouse anomalies
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Auto-refresh toggle */}
            <Button
              variant={autoRefreshEnabled ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleAutoRefresh}
            >
              {autoRefreshEnabled ? (
                <PauseIcon className="w-4 h-4 mr-1" />
              ) : (
                <PlayIcon className="w-4 h-4 mr-1" />
              )}
              Auto-refresh
            </Button>

            {/* Manual refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportAnomalies}
              disabled={allAnomalies.length === 0}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Export
            </Button>

            {/* Analysis Page */}
            <Link to="/anomaly-detection/analysis">
              <Button variant="outline" size="sm">
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Analysis
              </Button>
            </Link>

            {/* Settings (Manager only) */}
            {isManager && (
              <Link to="/anomaly-detection/settings">
                <Button variant="outline" size="sm">
                  <Cog6ToothIcon className="w-4 h-4 mr-1" />
                  Settings
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-red-500">⚠️</div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error Loading Anomalies
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Health Status Banner */}
        {!isHealthy && hasAnomalies && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-yellow-500">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  System Health Alert
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {criticalCount > 0 && `${criticalCount} critical anomalies detected. `}
                  {highCount > 0 && `${highCount} high-priority anomalies need attention. `}
                  Health score: {healthScore}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Statistics Sidebar */}
          <div className="lg:col-span-1">
            <AnomalyStatsOverview
              stats={summary}
              healthScore={healthScore}
              loading={loading}
              showTrends={true}
              showQuickActions={true}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Detected Anomalies</span>
                  <div className="flex items-center space-x-2">
                    {autoRefreshEnabled && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => detectAllAnomalies()}
                      disabled={loading}
                    >
                      <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnomalyList
                  anomalies={anomalies}
                  loading={loading}
                  onSelectAnomaly={handleSelectAnomaly}
                  onDismissAnomaly={handleDismissAnomaly}
                  onViewDetails={handleSelectAnomaly}
                  onRefresh={refreshAll}
                  showFilters={true}
                  showSearch={true}
                  itemsPerPage={10}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Anomalies</p>
                <p className="text-2xl font-bold">{allAnomalies.length}</p>
              </div>
              <div className="text-2xl">🔍</div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <div className="text-2xl">🚨</div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold">{healthScore}%</p>
              </div>
              <div className="text-2xl">
                {healthScore >= 90 ? '✅' : healthScore >= 70 ? '⚠️' : '🚨'}
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto-refresh</p>
                <p className="text-sm font-medium">
                  {autoRefreshEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="text-2xl">
                {autoRefreshEnabled ? '🔄' : '⏸️'}
              </div>
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {!loading && !hasAnomalies && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Anomalies Detected
            </h3>
            <p className="text-gray-500 mb-4">
              Your warehouse operations are running smoothly!
            </p>
            <Button
              variant="outline"
              onClick={refreshAll}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          </div>
        )}
      </div>

      {/* Anomaly Details Modal */}
      <AnomalyDetailsModal
        anomaly={selectedAnomaly}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAnomaly(null);
        }}
        onDismiss={handleDismissAnomaly}
        onResolve={handleResolveAnomaly}
        onEscalate={(anomaly) => {
          console.log('Escalating anomaly:', anomaly.id);
          // Handle escalation
        }}
      />
    </div>
  );
};

export default AnomalyDetectionDashboard;
