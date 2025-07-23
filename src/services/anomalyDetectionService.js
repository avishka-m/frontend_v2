import { api } from './apiConfig';

/**
 * 🔍 Advanced Anomaly Detection Service
 * 
 * Provides comprehensive anomaly detection capabilities including:
 * - Rule-based detection for known patterns
 * - ML-based detection using Isolation Forest
 * - Multi-category anomaly analysis (inventory, orders, workflow, workers)
 * - Model management and threshold configuration
 * - Real-time monitoring and alerts
 */
export const anomalyDetectionService = {
  
  // =============================================================================
  // HEALTH & STATUS ENDPOINTS
  // =============================================================================
  
  /**
   * 🔍 Check anomaly detection system health
   * @returns {Promise} System health and capabilities
   */
  getHealth: async () => {
    try {
      const response = await api.get('/anomaly-detection/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error checking anomaly detection health:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // =============================================================================
  // COMPREHENSIVE DETECTION ENDPOINTS
  // =============================================================================

  /**
   * 🚨 Comprehensive anomaly detection (all categories)
   * @param {Object} options - Detection options
   * @param {boolean} options.includeMl - Include ML-based detection (default: true)
   * @returns {Promise} Complete anomaly analysis results
   */
  detectAllAnomalies: async (options = {}) => {
    try {
      const { includeMl = true } = options;
      const params = new URLSearchParams();
      params.append('include_ml', includeMl);

      const response = await api.get(`/anomaly-detection/detect?${params.toString()}`);
      
      // Transform and enrich the response data
      const data = response.data.data || response.data;
      
      return {
        success: true,
        data: {
          ...data,
          // Add computed fields for easier frontend consumption
          timestamp: new Date().toISOString(),
          hasAnomalies: data.summary?.total_anomalies > 0,
          healthScore: _calculateHealthScore(data),
          priorityAnomalies: _getPriorityAnomalies(data)
        }
      };
    } catch (error) {
      console.error('❌ Error in comprehensive anomaly detection:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // =============================================================================
  // CATEGORY-SPECIFIC DETECTION ENDPOINTS
  // =============================================================================

  /**
   * 📦 Inventory anomaly detection
   * @param {Object} options - Detection options
   * @param {string} options.technique - 'rule', 'ml', or 'both' (default: 'both')
   * @returns {Promise} Inventory anomaly results
   */
  detectInventoryAnomalies: async (options = {}) => {
    try {
      const { technique = 'both' } = options;
      const params = new URLSearchParams();
      params.append('technique', technique);

      const response = await api.get(`/anomaly-detection/detect/inventory?${params.toString()}`);
      
      return {
        success: true,
        data: {
          ...response.data,
          // Add enhanced fields for frontend
          category: 'inventory',
          techniqueUsed: technique,
          enhancedAnomalies: _enhanceInventoryAnomalies(response.data.anomalies || [])
        }
      };
    } catch (error) {
      console.error('❌ Error in inventory anomaly detection:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * 🛒 Order anomaly detection
   * @param {Object} options - Detection options
   * @param {string} options.technique - 'rule', 'ml', or 'both' (default: 'both')
   * @returns {Promise} Order anomaly results
   */
  detectOrderAnomalies: async (options = {}) => {
    try {
      const { technique = 'both' } = options;
      const params = new URLSearchParams();
      params.append('technique', technique);

      const response = await api.get(`/anomaly-detection/detect/orders?${params.toString()}`);
      
      return {
        success: true,
        data: {
          ...response.data,
          category: 'orders',
          techniqueUsed: technique,
          enhancedAnomalies: _enhanceOrderAnomalies(response.data.anomalies || [])
        }
      };
    } catch (error) {
      console.error('❌ Error in order anomaly detection:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * 🔄 Workflow anomaly detection
   * @returns {Promise} Workflow anomaly results
   */
  detectWorkflowAnomalies: async () => {
    try {
      const response = await api.get('/anomaly-detection/detect/workflow');
      
      return {
        success: true,
        data: {
          ...response.data,
          category: 'workflow',
          enhancedAnomalies: _enhanceWorkflowAnomalies(response.data.anomalies || [])
        }
      };
    } catch (error) {
      console.error('❌ Error in workflow anomaly detection:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * 👷 Worker anomaly detection (Manager only)
   * @returns {Promise} Worker anomaly results
   */
  detectWorkerAnomalies: async () => {
    try {
      const response = await api.get('/anomaly-detection/detect/workers');
      
      return {
        success: true,
        data: {
          ...response.data,
          category: 'workers',
          enhancedAnomalies: _enhanceWorkerAnomalies(response.data.anomalies || [])
        }
      };
    } catch (error) {
      console.error('❌ Error in worker anomaly detection:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // =============================================================================
  // ANALYSIS & REPORTING ENDPOINTS
  // =============================================================================

  /**
   * 📊 Get comprehensive anomaly analysis summary
   * @param {Object} options - Analysis options
   * @param {number} options.days - Number of days to analyze (default: 7)
   * @returns {Promise} Analysis summary with trends and recommendations
   */
  getAnalysisSummary: async (options = {}) => {
    try {
      const { days = 7 } = options;
      
      // Ensure days is a number and construct URL properly
      const daysParam = typeof days === 'number' ? days : 7;
      const response = await api.get(`/anomaly-detection/analysis/summary?days=${daysParam}`);
      
      return {
        success: true,
        data: {
          ...response.data.summary,
          // Add frontend-friendly enhancements
          analysisDate: new Date().toISOString(),
          formattedRecommendations: _formatRecommendations(response.data.summary?.recommendations || []),
          chartData: _generateChartData(response.data.summary)
        }
      };
    } catch (error) {
      console.error('❌ Error getting anomaly analysis summary:', error);
      
      // Return fallback data structure when API fails
      return {
        success: true, // Mark as success to prevent breaking the UI
        data: {
          total_anomalies: 0,
          severity_breakdown: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          },
          category_breakdown: {
            inventory: 0,
            orders: 0,
            workers: 0,
            workflow: 0
          },
          technique_breakdown: {
            rule_based: 0,
            ml_based: 0,
            statistical: 0
          },
          trends: {
            daily_trend: 0,
            weekly_trend: 0,
            severity_trend: 'stable'
          },
          recommendations: [],
          analysisDate: new Date().toISOString(),
          formattedRecommendations: [],
          chartData: null,
          isOfflineMode: true // Flag to indicate this is fallback data
        },
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // =============================================================================
  // MODEL MANAGEMENT ENDPOINTS (Manager Only)
  // =============================================================================

  /**
   * 🤖 Retrain ML models with latest data (Manager only)
   * @returns {Promise} Retraining status
   */
  retrainModels: async () => {
    try {
      const response = await api.post('/anomaly-detection/models/retrain');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error retraining ML models:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * 📈 Get ML models status and performance (Manager only)
   * @returns {Promise} Models status information
   */
  getModelsStatus: async () => {
    try {
      const response = await api.get('/anomaly-detection/models/status');
      
      return {
        success: true,
        data: {
          ...response.data,
          // Add enhanced model information
          modelsCount: Object.keys(response.data.models || {}).length,
          trainedModels: Object.values(response.data.models || {}).filter(m => m.status === 'trained').length,
          lastUpdate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error getting models status:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // =============================================================================
  // ANOMALY MANAGEMENT ENDPOINTS
  // =============================================================================

  /**
   * 🗑️ Dismiss an anomaly
   * @param {string|Object} anomalyIdOrObject - Anomaly ID or anomaly object
   * @returns {Promise} Dismiss result
   */
  dismissAnomaly: async (anomalyIdOrObject) => {
    try {
      const anomalyId = typeof anomalyIdOrObject === 'string' 
        ? anomalyIdOrObject 
        : anomalyIdOrObject.id || anomalyIdOrObject.anomaly_id;
      
      if (!anomalyId) {
        throw new Error('Anomaly ID is required for dismissal');
      }

      const response = await api.delete(`/anomaly-detection/anomalies/${anomalyId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Anomaly dismissed successfully'
      };
    } catch (error) {
      console.error('❌ Error dismissing anomaly:', error);
      
      // If the API endpoint doesn't exist, simulate dismissal locally
      if (error.response?.status === 404) {
        console.warn('Dismiss endpoint not found, simulating local dismissal');
        return {
          success: true,
          data: { dismissed: true, simulated: true },
          message: 'Anomaly dismissed (local simulation)'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * ✅ Resolve an anomaly
   * @param {string|Object} anomalyIdOrObject - Anomaly ID or anomaly object
   * @param {Object} options - Resolution options
   * @param {string} options.resolution - Resolution description
   * @param {string} options.resolvedBy - User who resolved it
   * @returns {Promise} Resolve result
   */
  resolveAnomaly: async (anomalyIdOrObject, options = {}) => {
    try {
      const anomalyId = typeof anomalyIdOrObject === 'string' 
        ? anomalyIdOrObject 
        : anomalyIdOrObject.id || anomalyIdOrObject.anomaly_id || `temp-${anomalyIdOrObject.type}`;
      
      if (!anomalyId) {
        throw new Error('Anomaly ID is required for resolution');
      }

      const resolveData = {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution: options.resolution || 'Resolved by user',
        resolved_by: options.resolvedBy || 'Current User',
        ...options
      };

      // Try to call the backend API to resolve the anomaly
      const response = await api.patch(`/anomaly-detection/anomalies/${anomalyId}/resolve`, resolveData);
      
      return {
        success: true,
        data: response.data,
        message: 'Anomaly resolved successfully'
      };
    } catch (error) {
      console.error('❌ Error resolving anomaly:', error);
      
      // If the API endpoint doesn't exist, simulate resolution locally
      if (error.response?.status === 404 || error.response?.status === 405) {
        console.warn('Resolve endpoint not found, simulating local resolution');
        return {
          success: true,
          data: { 
            resolved: true, 
            simulated: true,
            anomaly_id: typeof anomalyIdOrObject === 'string' ? anomalyIdOrObject : anomalyIdOrObject.id,
            resolved_at: new Date().toISOString()
          },
          message: 'Anomaly resolved (local simulation)'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * 🗑️ Dismiss multiple anomalies
   * @param {Array} anomalies - Array of anomaly IDs or anomaly objects
   * @returns {Promise} Bulk dismiss result
   */
  dismissMultipleAnomalies: async (anomalies) => {
    try {
      const anomalyIds = anomalies.map(a => 
        typeof a === 'string' ? a : a.id || a.anomaly_id
      ).filter(Boolean);

      if (anomalyIds.length === 0) {
        throw new Error('No valid anomaly IDs provided');
      }

      // Try bulk dismiss endpoint first
      try {
        const response = await api.post('/anomaly-detection/anomalies/dismiss-bulk', {
          anomaly_ids: anomalyIds
        });
        
        return {
          success: true,
          data: response.data,
          message: `${anomalyIds.length} anomalies dismissed successfully`
        };
      } catch (bulkError) {
        // If bulk endpoint doesn't exist, dismiss individually
        console.warn('Bulk dismiss endpoint not found, dismissing individually');
        
        const results = await Promise.allSettled(
          anomalyIds.map(id => anomalyDetectionService.dismissAnomaly(id))
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        return {
          success: successful > 0,
          data: {
            successful,
            failed,
            results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
          },
          message: `${successful} anomalies dismissed successfully${failed > 0 ? `, ${failed} failed` : ''}`
        };
      }
    } catch (error) {
      console.error('❌ Error dismissing multiple anomalies:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // =============================================================================
  // THRESHOLD MANAGEMENT ENDPOINTS (Manager Only)
  // =============================================================================

  /**
   * ⚙️ Get current detection thresholds (Manager only)
   * @returns {Promise} Current threshold configuration
   */
  getDetectionThresholds: async () => {
    try {
      const response = await api.get('/anomaly-detection/thresholds');
      
      return {
        success: true,
        data: {
          ...response.data,
          // Add frontend-friendly formatting
          formattedThresholds: _formatThresholds(response.data.thresholds || {})
        }
      };
    } catch (error) {
      console.error('❌ Error getting detection thresholds:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * ⚙️ Update detection thresholds (Manager only)
   * @param {Object} thresholds - New threshold values
   * @returns {Promise} Update result
   */
  updateDetectionThresholds: async (thresholds) => {
    try {
      const response = await api.put('/anomaly-detection/thresholds', thresholds);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error updating detection thresholds:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // =============================================================================
  // UTILITY & CONVENIENCE METHODS
  // =============================================================================

  /**
   * 🔄 Refresh all anomaly data (convenience method)
   * @returns {Promise} Complete refresh of all anomaly detection data
   */
  refreshAllData: async () => {
    try {
      const [health, allAnomalies, summary] = await Promise.all([
        anomalyDetectionService.getHealth(),
        anomalyDetectionService.detectAllAnomalies(),
        anomalyDetectionService.getAnalysisSummary()
      ]);

      return {
        success: true,
        data: {
          health: health.data,
          anomalies: allAnomalies.data,
          summary: summary.data,
          refreshedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error refreshing all anomaly data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * 🎯 Get anomalies by severity level
   * @param {string} severity - 'critical', 'high', 'medium', or 'low'
   * @returns {Promise} Filtered anomalies by severity
   */
  getAnomaliesBySeverity: async (severity) => {
    try {
      const result = await anomalyDetectionService.detectAllAnomalies();
      
      if (!result.success) {
        return result;
      }

      const filteredAnomalies = _filterAnomaliesBySeverity(result.data, severity);

      return {
        success: true,
        data: {
          severity,
          anomalies: filteredAnomalies,
          count: filteredAnomalies.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`❌ Error getting ${severity} anomalies:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * 📋 Get quick anomaly dashboard data
   * @returns {Promise} Essential data for dashboard display
   */
  getDashboardData: async () => {
    try {
      const [allAnomalies, summary] = await Promise.all([
        anomalyDetectionService.detectAllAnomalies(),
        anomalyDetectionService.getAnalysisSummary()
      ]);

      if (!allAnomalies.success || !summary.success) {
        throw new Error('Failed to fetch dashboard data');
      }

      return {
        success: true,
        data: {
          totalAnomalies: allAnomalies.data.summary?.total_anomalies || 0,
          healthStatus: allAnomalies.data.summary?.health_status || 'unknown',
          severityBreakdown: allAnomalies.data.summary?.severity_breakdown || {},
          categoryBreakdown: allAnomalies.data.summary?.category_breakdown || {},
          recommendations: summary.data.recommendations?.slice(0, 5) || [],
          healthScore: allAnomalies.data.healthScore || 0,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error getting dashboard data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// =============================================================================
// PRIVATE UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate overall system health score based on anomalies
 * @private
 */
function _calculateHealthScore(data) {
  const summary = data.summary || {};
  const totalAnomalies = summary.total_anomalies || 0;
  const severityBreakdown = summary.severity_breakdown || {};
  
  // Calculate weighted score (0-100)
  const criticalWeight = 4;
  const highWeight = 3;
  const mediumWeight = 2;
  const lowWeight = 1;
  
  const weightedScore = 
    (severityBreakdown.critical || 0) * criticalWeight +
    (severityBreakdown.high || 0) * highWeight +
    (severityBreakdown.medium || 0) * mediumWeight +
    (severityBreakdown.low || 0) * lowWeight;
  
  // Convert to health score (inverse relationship)
  const maxPossibleScore = totalAnomalies * criticalWeight;
  const healthScore = maxPossibleScore > 0 
    ? Math.max(0, 100 - (weightedScore / maxPossibleScore) * 100)
    : 100;
  
  return Math.round(healthScore);
}

/**
 * Get priority anomalies (critical and high severity)
 * @private
 */
function _getPriorityAnomalies(data) {
  const combined = data.combined || {};
  const priorityAnomalies = [];
  
  Object.values(combined).forEach(categoryAnomalies => {
    if (Array.isArray(categoryAnomalies)) {
      const priority = categoryAnomalies.filter(
        anomaly => ['critical', 'high'].includes(anomaly.severity)
      );
      priorityAnomalies.push(...priority);
    }
  });
  
  return priorityAnomalies.sort((a, b) => 
    a.severity === 'critical' ? -1 : 
    b.severity === 'critical' ? 1 : 0
  );
}

/**
 * Enhance inventory anomalies with additional frontend fields
 * @private
 */
function _enhanceInventoryAnomalies(anomalies) {
  return anomalies.map(anomaly => ({
    ...anomaly,
    // Add display-friendly fields
    displaySeverity: anomaly.severity?.toUpperCase() || 'UNKNOWN',
    severityColor: _getSeverityColor(anomaly.severity),
    icon: '📦',
    category: 'inventory',
    actionable: true,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Enhance order anomalies with additional frontend fields
 * @private
 */
function _enhanceOrderAnomalies(anomalies) {
  return anomalies.map(anomaly => ({
    ...anomaly,
    displaySeverity: anomaly.severity?.toUpperCase() || 'UNKNOWN',
    severityColor: _getSeverityColor(anomaly.severity),
    icon: '🛒',
    category: 'orders',
    actionable: true,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Enhance workflow anomalies with additional frontend fields
 * @private
 */
function _enhanceWorkflowAnomalies(anomalies) {
  return anomalies.map(anomaly => ({
    ...anomaly,
    displaySeverity: anomaly.severity?.toUpperCase() || 'UNKNOWN',
    severityColor: _getSeverityColor(anomaly.severity),
    icon: '🔄',
    category: 'workflow',
    actionable: true,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Enhance worker anomalies with additional frontend fields
 * @private
 */
function _enhanceWorkerAnomalies(anomalies) {
  return anomalies.map(anomaly => ({
    ...anomaly,
    displaySeverity: anomaly.severity?.toUpperCase() || 'UNKNOWN',
    severityColor: _getSeverityColor(anomaly.severity),
    icon: '👷',
    category: 'workers',
    actionable: true,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Get color code for severity level
 * @private
 */
function _getSeverityColor(severity) {
  const colors = {
    critical: '#dc2626', // red-600
    high: '#ea580c',     // orange-600
    medium: '#d97706',   // amber-600
    low: '#65a30d'       // lime-600
  };
  return colors[severity] || '#6b7280'; // gray-500
}

/**
 * Format recommendations for display
 * @private
 */
function _formatRecommendations(recommendations) {
  return recommendations.map((rec, index) => ({
    id: index + 1,
    ...rec,
    priority: rec.priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Generate chart data for visualization
 * @private
 */
function _generateChartData(summary) {
  const severityBreakdown = summary?.severity_breakdown || {};
  const categoryBreakdown = summary?.category_breakdown || {};
  
  return {
    severityChart: Object.entries(severityBreakdown).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: _getSeverityColor(severity)
    })),
    categoryChart: Object.entries(categoryBreakdown).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count
    }))
  };
}

/**
 * Format thresholds for frontend display
 * @private
 */
function _formatThresholds(thresholds) {
  const formatted = {};
  
  Object.entries(thresholds).forEach(([category, values]) => {
    formatted[category] = {
      ...values,
      displayName: category.charAt(0).toUpperCase() + category.slice(1),
      editable: true
    };
  });
  
  return formatted;
}

/**
 * Filter anomalies by severity level
 * @private
 */
function _filterAnomaliesBySeverity(data, severity) {
  const combined = data.combined || {};
  const filtered = [];
  
  Object.values(combined).forEach(categoryAnomalies => {
    if (Array.isArray(categoryAnomalies)) {
      const matches = categoryAnomalies.filter(
        anomaly => anomaly.severity === severity
      );
      filtered.push(...matches);
    }
  });
  
  return filtered;
}

export default anomalyDetectionService;
