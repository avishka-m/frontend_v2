import { useState, useEffect, useCallback, useRef } from 'react';
import { anomalyDetectionService } from '../services/anomalyDetectionService';
import { 
  sortAnomaliesBySeverity, 
  filterAnomaliesByCategory, 
  filterAnomaliesBySeverity,
  calculateAnomalyStats,
  getHealthStatus
} from '../utils/anomalyUtils';

/**
 * 🔍 Custom React Hook for Anomaly Detection Management
 * 
 * Provides state management and operations for anomaly detection functionality
 * including real-time updates, filtering, and data management.
 */
export const useAnomalyDetection = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    includeMl = true,
    initialCategory = 'all',
    initialSeverity = 'all'
  } = options;

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [state, setState] = useState({
    // Data states
    anomalies: [],
    allAnomalies: [],
    summary: null,
    health: null,
    modelsStatus: null,
    thresholds: null,

    // Loading states
    loading: false,
    refreshing: false,
    detecting: false,
    
    // Filter states
    categoryFilter: initialCategory,
    severityFilter: initialSeverity,
    techniqueFilter: 'both',
    
    // UI states
    selectedAnomaly: null,
    expandedCategories: new Set(['inventory', 'orders']),
    
    // Error states
    error: null,
    lastError: null,
    
    // Meta states
    lastUpdated: null,
    stats: null,
    healthScore: 0
  });

  // Refs for cleanup and interval management
  const refreshIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // =============================================================================
  // CORE DETECTION OPERATIONS
  // =============================================================================

  /**
   * Detect all anomalies with current settings
   */
  const detectAllAnomalies = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setState(prev => ({ ...prev, detecting: true, error: null }));
      }

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const result = await anomalyDetectionService.detectAllAnomalies({
        includeMl
      });

      if (result.success) {
        const allAnomalies = extractAllAnomalies(result.data);
        const sortedAnomalies = sortAnomaliesBySeverity(allAnomalies);
        const stats = calculateAnomalyStats(sortedAnomalies);
        const healthScore = result.data.healthScore || 0;
        const healthStatus = getHealthStatus(healthScore);

        setState(prev => ({
          ...prev,
          allAnomalies: sortedAnomalies,
          anomalies: applyFilters(sortedAnomalies, prev.categoryFilter, prev.severityFilter),
          summary: result.data.summary,
          stats,
          healthScore,
          health: healthStatus,
          lastUpdated: new Date().toISOString(),
          detecting: false,
          error: null
        }));

        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error,
        detecting: false
      }));
      console.error('❌ Error detecting anomalies:', error);
      return null;
    }
  }, [includeMl]);

  /**
   * Detect category-specific anomalies
   */
  const detectCategoryAnomalies = useCallback(async (category, technique = 'both') => {
    try {
      setState(prev => ({ ...prev, detecting: true, error: null }));

      let result;
      switch (category) {
        case 'inventory':
          result = await anomalyDetectionService.detectInventoryAnomalies({ technique });
          break;
        case 'orders':
          result = await anomalyDetectionService.detectOrderAnomalies({ technique });
          break;
        case 'workflow':
          result = await anomalyDetectionService.detectWorkflowAnomalies();
          break;
        case 'workers':
          result = await anomalyDetectionService.detectWorkerAnomalies();
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }

      setState(prev => ({ ...prev, detecting: false }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error,
        detecting: false
      }));
      console.error(`❌ Error detecting ${category} anomalies:`, error);
      return null;
    }
  }, []);

  /**
   * Get system health status
   */
  const getSystemHealth = useCallback(async () => {
    try {
      const result = await anomalyDetectionService.getHealth();
      if (result.success) {
        setState(prev => ({ ...prev, health: result.data }));
        return result.data;
      }
    } catch (error) {
      console.error('❌ Error getting system health:', error);
    }
    return null;
  }, []);

  /**
   * Get analysis summary
   */
  const getAnalysisSummary = useCallback(async (days = 7) => {
    try {
      const result = await anomalyDetectionService.getAnalysisSummary({ days });
      if (result.success) {
        setState(prev => ({ ...prev, summary: result.data }));
        return result.data;
      }
    } catch (error) {
      console.error('❌ Error getting analysis summary:', error);
    }
    return null;
  }, []);

  // =============================================================================
  // MODEL MANAGEMENT OPERATIONS
  // =============================================================================

  /**
   * Get ML models status
   */
  const getModelsStatus = useCallback(async () => {
    try {
      const result = await anomalyDetectionService.getModelsStatus();
      if (result.success) {
        setState(prev => ({ ...prev, modelsStatus: result.data }));
        return result.data;
      }
    } catch (error) {
      console.error('❌ Error getting models status:', error);
    }
    return null;
  }, []);

  /**
   * Retrain ML models
   */
  const retrainModels = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await anomalyDetectionService.retrainModels();
      
      if (result.success) {
        // Refresh models status after retraining
        setTimeout(() => {
          getModelsStatus();
        }, 5000);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error,
        loading: false
      }));
      console.error('❌ Error retraining models:', error);
      return null;
    }
  }, [getModelsStatus]);

  // =============================================================================
  // THRESHOLD MANAGEMENT OPERATIONS
  // =============================================================================

  /**
   * Get detection thresholds
   */
  const getThresholds = useCallback(async () => {
    try {
      const result = await anomalyDetectionService.getDetectionThresholds();
      if (result.success) {
        setState(prev => ({ ...prev, thresholds: result.data }));
        return result.data;
      }
    } catch (error) {
      console.error('❌ Error getting thresholds:', error);
    }
    return null;
  }, []);

  /**
   * Update detection thresholds
   */
  const updateThresholds = useCallback(async (newThresholds) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await anomalyDetectionService.updateDetectionThresholds(newThresholds);
      
      if (result.success) {
        // Refresh thresholds after update
        await getThresholds();
        // Refresh anomalies with new thresholds
        await detectAllAnomalies(false);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error,
        loading: false
      }));
      console.error('❌ Error updating thresholds:', error);
      return null;
    }
  }, [getThresholds, detectAllAnomalies]);

  // =============================================================================
  // FILTERING AND SORTING OPERATIONS
  // =============================================================================

  /**
   * Apply filters to anomalies
   */
  const applyFilters = useCallback((anomalies, categoryFilter, severityFilter) => {
    let filtered = anomalies;
    
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filterAnomaliesByCategory(filtered, categoryFilter);
    }
    
    if (severityFilter && severityFilter !== 'all') {
      filtered = filterAnomaliesBySeverity(filtered, severityFilter);
    }
    
    return filtered;
  }, []);

  /**
   * Set category filter
   */
  const setCategoryFilter = useCallback((category) => {
    setState(prev => {
      const newAnomalies = applyFilters(prev.allAnomalies, category, prev.severityFilter);
      return {
        ...prev,
        categoryFilter: category,
        anomalies: newAnomalies
      };
    });
  }, [applyFilters]);

  /**
   * Set severity filter
   */
  const setSeverityFilter = useCallback((severity) => {
    setState(prev => {
      const newAnomalies = applyFilters(prev.allAnomalies, prev.categoryFilter, severity);
      return {
        ...prev,
        severityFilter: severity,
        anomalies: newAnomalies
      };
    });
  }, [applyFilters]);

  /**
   * Set technique filter
   */
  const setTechniqueFilter = useCallback((technique) => {
    setState(prev => ({ ...prev, techniqueFilter: technique }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      categoryFilter: 'all',
      severityFilter: 'all',
      anomalies: prev.allAnomalies
    }));
  }, []);

  // =============================================================================
  // UI STATE MANAGEMENT
  // =============================================================================

  /**
   * Select an anomaly for detailed view
   */
  const selectAnomaly = useCallback((anomaly) => {
    setState(prev => ({ ...prev, selectedAnomaly: anomaly }));
  }, []);

  /**
   * Clear selected anomaly
   */
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedAnomaly: null }));
  }, []);

  /**
   * Toggle category expansion
   */
  const toggleCategoryExpansion = useCallback((category) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedCategories);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return { ...prev, expandedCategories: newExpanded };
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, lastError: null }));
  }, []);

  // =============================================================================
  // REFRESH AND AUTO-UPDATE
  // =============================================================================

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: null }));
      
      await Promise.all([
        detectAllAnomalies(false),
        getSystemHealth(),
        getAnalysisSummary()
      ]);
      
      setState(prev => ({ ...prev, refreshing: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error,
        refreshing: false
      }));
      console.error('❌ Error refreshing data:', error);
    }
  }, [detectAllAnomalies, getSystemHealth, getAnalysisSummary]);

  /**
   * Start auto-refresh
   */
  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      detectAllAnomalies(false);
    }, refreshInterval);
  }, [detectAllAnomalies, refreshInterval]);

  /**
   * Stop auto-refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initial data load
  useEffect(() => {
    detectAllAnomalies();
    getSystemHealth();
  }, [detectAllAnomalies, getSystemHealth]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    
    return () => stopAutoRefresh();
  }, [autoRefresh, startAutoRefresh, stopAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stopAutoRefresh]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Extract all anomalies from detection result, adding category information
   */
  const extractAllAnomalies = (data) => {
    const allAnomalies = [];
    
    // Process combined anomalies (preferred structure)
    if (data.combined) {
      Object.entries(data.combined).forEach(([category, anomalies]) => {
        if (Array.isArray(anomalies)) {
          anomalies.forEach(anomaly => {
            allAnomalies.push({
              ...anomaly,
              category: anomaly.category || category, // Ensure category is set
              id: anomaly.id || anomaly.anomaly_id || `${category}-${anomaly.type}-${Date.now()}-${Math.random()}`
            });
          });
        }
      });
    }
    
    // Fallback: Process rule_based structure
    if (allAnomalies.length === 0 && data.rule_based) {
      Object.entries(data.rule_based).forEach(([category, anomalies]) => {
        if (Array.isArray(anomalies)) {
          anomalies.forEach(anomaly => {
            allAnomalies.push({
              ...anomaly,
              category, // Add category field for filtering
              id: anomaly.id || anomaly.anomaly_id || `${category}-${anomaly.type}-${Date.now()}-${Math.random()}`
            });
          });
        }
      });
    }
    
    // Also include ML-based anomalies if available
    if (data.ml_based) {
      Object.entries(data.ml_based).forEach(([category, anomalies]) => {
        if (Array.isArray(anomalies)) {
          anomalies.forEach(anomaly => {
            // Avoid duplicates by checking if similar anomaly exists
            const isDuplicate = allAnomalies.some(existing => 
              existing.type === anomaly.type && 
              existing.item_id === anomaly.item_id && 
              existing.order_id === anomaly.order_id &&
              existing.worker_id === anomaly.worker_id
            );
            
            if (!isDuplicate) {
              allAnomalies.push({
                ...anomaly,
                category: anomaly.category || category,
                id: anomaly.id || anomaly.anomaly_id || `${category}-${anomaly.type}-ml-${Date.now()}-${Math.random()}`,
                technique: anomaly.technique || 'ml' // Mark as ML-detected
              });
            }
          });
        }
      });
    }
    
    // Get resolved anomalies from localStorage
    const resolvedAnomalies = JSON.parse(localStorage.getItem('resolvedAnomalies') || '[]');
    
    // Filter out resolved anomalies (both server-side and locally resolved)
    const activeAnomalies = allAnomalies.filter(anomaly => {
      // Filter server-side resolved anomalies
      if (anomaly.status === 'resolved') return false;
      
      // Filter locally resolved anomalies
      const isLocallyResolved = resolvedAnomalies.some(resolvedId => 
        resolvedId === anomaly.id || 
        resolvedId === anomaly.anomaly_id ||
        resolvedId === `${anomaly.category}-${anomaly.type}`
      );
      
      return !isLocallyResolved;
    });
    
    return activeAnomalies;
  };

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,
    
    // Detection operations
    detectAllAnomalies,
    detectCategoryAnomalies,
    getSystemHealth,
    getAnalysisSummary,
    
    // Model management
    getModelsStatus,
    retrainModels,
    
    // Threshold management
    getThresholds,
    updateThresholds,
    
    // Filtering
    setCategoryFilter,
    setSeverityFilter,
    setTechniqueFilter,
    clearFilters,
    
    // UI state
    selectAnomaly,
    clearSelection,
    toggleCategoryExpansion,
    clearError,
    
    // Refresh
    refreshAll,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Computed properties
    hasAnomalies: state.anomalies.length > 0,
    criticalCount: state.anomalies.filter(a => a.severity === 'critical').length,
    highCount: state.anomalies.filter(a => a.severity === 'high').length,
    isHealthy: state.healthScore >= 70,
    
    // Quick access methods
    getAnomaliesByCategory: (category) => filterAnomaliesByCategory(state.allAnomalies, category),
    getAnomaliesBySeverity: (severity) => filterAnomaliesBySeverity(state.allAnomalies, severity)
  };
};

export default useAnomalyDetection;
