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
import AnomalyDetailsModal from '../../components/anomaly/AnomalyDetailsModal';

/**
 * 🔍 Anomaly Detection Dashboard
 * 
 * Streamlined dashboard for anomaly detection and management featuring:
 * - Clean, focused real-time anomaly monitoring
 * - Essential status indicators (Active Anomalies, Critical Issues, Live Monitoring)
 * - Comprehensive filtering and search capabilities
 * - Detailed anomaly investigation with modal views
 * - Enhanced empty states and error handling
 * - Management controls for authorized users
 * - Creative visual design with gradients and better UX
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
  const handleResolveAnomaly = async (anomaly) => {
    try {
      const anomalyId = anomaly.id || anomaly.anomaly_id || `temp-${anomaly.anomaly_type}`;
      console.log('✅ Resolving anomaly:', anomalyId, anomaly);
      
      // Show loading state could be added here
      const result = await anomalyDetectionService.resolveAnomaly(anomaly, {
        resolution: 'Marked as resolved by user',
        resolvedBy: currentUser?.name || 'Current User'
      });
      
      if (result.success) {
        console.log('✅ Anomaly resolved successfully:', result.message);
        
        // Add to localStorage for local tracking
        const resolvedAnomalies = JSON.parse(localStorage.getItem('resolvedAnomalies') || '[]');
        const newResolvedId = anomaly.id || anomaly.anomaly_id || `${anomaly.category}-${anomaly.type}`;
        if (!resolvedAnomalies.includes(newResolvedId)) {
          resolvedAnomalies.push(newResolvedId);
          localStorage.setItem('resolvedAnomalies', JSON.stringify(resolvedAnomalies));
        }
        
        // Show success notification
        if (result.data?.simulated) {
          console.log('ℹ️ Resolution was simulated locally');
          alert(`✅ Anomaly resolved successfully!\n\nThe anomaly has been removed from the active list and marked as resolved.`);
        } else {
          alert(`✅ Anomaly resolved successfully!`);
        }
        
        // Refresh the anomaly data to reflect the resolution
        await refreshAll();
        console.log('🔄 Anomaly data refreshed after resolution');
      } else {
        console.error('❌ Failed to resolve anomaly:', result.error);
        alert(`❌ Failed to resolve anomaly: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error resolving anomaly:', error);
      alert(`❌ Error resolving anomaly: ${error.message}`);
    }
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

  // Clear resolved anomalies from localStorage (debug function)
  const clearResolvedAnomalies = () => {
    if (window.confirm('Are you sure you want to clear all resolved anomalies? This will make them visible again.')) {
      localStorage.removeItem('resolvedAnomalies');
      refreshAll();
      alert('✅ Resolved anomalies cleared! All anomalies will be visible again.');
    }
  };

  const isManager = currentUser?.role === 'Manager';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold text-gray-900"
                  onDoubleClick={clearResolvedAnomalies}
                  title="Double-click to clear resolved anomalies (debug)"
                >
                  Anomaly Detection
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-600">
                    Real-time warehouse monitoring
                  </p>
                  {hasAnomalies && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-orange-600">
                        {allAnomalies.length} active anomal{allAnomalies.length === 1 ? 'y' : 'ies'}
                      </span>
                    </div>
                  )}
                  {!hasAnomalies && !loading && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">All systems normal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

        {/* Enhanced Error Banner */}
        {error && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-xl">🚫</div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-red-800 mb-1">
                    Connection Error
                  </h3>
                  <p className="text-sm text-red-700 mb-3">{error}</p>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshAll}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="text-red-600 hover:bg-red-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Anomalies</p>
                <p className="text-3xl font-bold text-blue-900">{allAnomalies.length}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {hasAnomalies ? 'Requires attention' : 'All clear'}
                </p>
              </div>
              <div className="text-4xl">
                {hasAnomalies ? '🔍' : '✅'}
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
                <p className="text-xs text-red-600 mt-1">
                  {criticalCount > 0 ? 'Immediate action needed' : 'No critical issues'}
                </p>
              </div>
              <div className="text-4xl">
                {criticalCount > 0 ? '🚨' : '🛡️'}
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Live Monitoring</p>
                <p className="text-lg font-bold text-green-900">
                  {autoRefreshEnabled ? 'Active' : 'Paused'}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {autoRefreshEnabled ? 'Auto-refreshing every 30s' : 'Manual refresh only'}
                </p>
              </div>
              <div className="text-4xl">
                {autoRefreshEnabled ? '🔄' : '⏸️'}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Anomaly List */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔎</div>
                <div>
                  <span className="text-xl">Detected Anomalies</span>
                  {autoRefreshEnabled && (
                    <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live monitoring active</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => detectAllAnomalies()}
                  disabled={loading}
                  className="hover:bg-white/50"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          {/* Category Filter Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-6 py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchParams({})}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !searchParams.get('category') || searchParams.get('category') === 'all'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🎯 All ({allAnomalies.length})
                </button>
                
                <button
                  onClick={() => setSearchParams({ category: 'inventory' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.get('category') === 'inventory'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  }`}
                >
                  📦 Inventory ({allAnomalies.filter(a => a.category === 'inventory').length})
                </button>
                
                <button
                  onClick={() => setSearchParams({ category: 'orders' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.get('category') === 'orders'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🛒 Orders ({allAnomalies.filter(a => a.category === 'orders').length})
                </button>
                
                <button
                  onClick={() => setSearchParams({ category: 'workflow' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.get('category') === 'workflow'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔄 Workflow ({allAnomalies.filter(a => a.category === 'workflow').length})
                </button>
                
                {/* <button
                  onClick={() => setSearchParams({ category: 'workers' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.get('category') === 'workers'
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👷 Workers ({allAnomalies.filter(a => a.category === 'workers').length})
                </button> */}
                
                {searchParams.get('category') && (
                  <button
                    onClick={() => setSearchParams({})}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ✕ Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
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

        {/* Enhanced Empty State */}
        {!loading && !hasAnomalies && !error && (
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-dashed border-green-200 mt-8">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              All Clear! 
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your warehouse is operating perfectly. No anomalies detected in the current monitoring cycle.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="primary"
                onClick={refreshAll}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh Scan
              </Button>
              <Link to="/anomaly-detection/analysis">
                <Button variant="outline">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Last scan: {new Date().toLocaleTimeString()}
            </div>
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
