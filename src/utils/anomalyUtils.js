/**
 * 🔍 Anomaly Detection Utilities and Constants
 * 
 * Provides utility functions, constants, and helpers for the anomaly detection system
 */

// =============================================================================
// CONSTANTS AND ENUMS
// =============================================================================

/**
 * Anomaly severity levels with display properties
 */
export const ANOMALY_SEVERITY = {
  CRITICAL: {
    value: 'critical',
    label: 'Critical',
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '🚨',
    priority: 1,
    description: 'Requires immediate attention'
  },
  HIGH: {
    value: 'high',
    label: 'High',
    color: '#ea580c',
    bgColor: '#fff7ed',
    icon: '⚠️',
    priority: 2,
    description: 'Should be addressed soon'
  },
  MEDIUM: {
    value: 'medium',
    label: 'Medium',
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: '⚡',
    priority: 3,
    description: 'Monitor and plan resolution'
  },
  LOW: {
    value: 'low',
    label: 'Low',
    color: '#65a30d',
    bgColor: '#f7fee7',
    icon: 'ℹ️',
    priority: 4,
    description: 'For awareness and tracking'
  }
};

/**
 * Anomaly detection categories with metadata
 */
export const ANOMALY_CATEGORIES = {
  INVENTORY: {
    value: 'inventory',
    label: 'Inventory',
    icon: '📦',
    color: '#3b82f6',
    description: 'Stock levels, quantities, and inventory management issues'
  },
  ORDERS: {
    value: 'orders',
    label: 'Orders',
    icon: '🛒',
    color: '#10b981',
    description: 'Order processing, timing, and fulfillment anomalies'
  },
  WORKFLOW: {
    value: 'workflow',
    label: 'Workflow',
    icon: '🔄',
    color: '#8b5cf6',
    description: 'Process bottlenecks, stuck orders, and workflow issues'
  },
  WORKERS: {
    value: 'workers',
    label: 'Workers',
    icon: '👷',
    color: '#f59e0b',
    description: 'Worker performance and behavior patterns'
  }
};

/**
 * Detection techniques with metadata
 */
export const DETECTION_TECHNIQUES = {
  RULE: {
    value: 'rule',
    label: 'Rule-based',
    icon: '📋',
    description: 'Based on predefined business rules and thresholds'
  },
  ML: {
    value: 'ml',
    label: 'Machine Learning',
    icon: '🤖',
    description: 'AI-powered detection using Isolation Forest'
  },
  BOTH: {
    value: 'both',
    label: 'Hybrid',
    icon: '🔬',
    description: 'Combined rule-based and ML detection'
  }
};

/**
 * System health status levels
 */
export const HEALTH_STATUS = {
  EXCELLENT: {
    value: 'excellent',
    label: 'Excellent',
    color: '#10b981',
    icon: '✅',
    range: [90, 100]
  },
  GOOD: {
    value: 'good',
    label: 'Good',
    color: '#65a30d',
    icon: '👍',
    range: [70, 89]
  },
  WARNING: {
    value: 'warning',
    label: 'Warning',
    color: '#d97706',
    icon: '⚠️',
    range: [50, 69]
  },
  CRITICAL: {
    value: 'critical',
    label: 'Critical',
    color: '#dc2626',
    icon: '🚨',
    range: [0, 49]
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get severity configuration by value
 * @param {string} severity - Severity level
 * @returns {Object} Severity configuration
 */
export const getSeverityConfig = (severity) => {
  return Object.values(ANOMALY_SEVERITY).find(s => s.value === severity) || ANOMALY_SEVERITY.LOW;
};

/**
 * Get category configuration by value
 * @param {string} category - Category name
 * @returns {Object} Category configuration
 */
export const getCategoryConfig = (category) => {
  return Object.values(ANOMALY_CATEGORIES).find(c => c.value === category) || ANOMALY_CATEGORIES.INVENTORY;
};

/**
 * Get health status based on score
 * @param {number} score - Health score (0-100)
 * @returns {Object} Health status configuration
 */
export const getHealthStatus = (score) => {
  for (const status of Object.values(HEALTH_STATUS)) {
    if (score >= status.range[0] && score <= status.range[1]) {
      return status;
    }
  }
  return HEALTH_STATUS.CRITICAL;
};

/**
 * Sort anomalies by severity and timestamp
 * @param {Array} anomalies - Array of anomalies
 * @returns {Array} Sorted anomalies
 */
export const sortAnomaliesBySeverity = (anomalies) => {
  return [...anomalies].sort((a, b) => {
    const severityA = getSeverityConfig(a.severity).priority;
    const severityB = getSeverityConfig(b.severity).priority;
    
    if (severityA !== severityB) {
      return severityA - severityB; // Lower priority number = higher severity
    }
    
    // If same severity, sort by timestamp (newest first)
    return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
  });
};

/**
 * Filter anomalies by category
 * @param {Array} anomalies - Array of anomalies
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered anomalies
 */
export const filterAnomaliesByCategory = (anomalies, category) => {
  if (!category || category === 'all') {
    return anomalies;
  }
  return anomalies.filter(anomaly => anomaly.category === category);
};

/**
 * Filter anomalies by severity
 * @param {Array} anomalies - Array of anomalies
 * @param {string} severity - Severity to filter by
 * @returns {Array} Filtered anomalies
 */
export const filterAnomaliesBySeverity = (anomalies, severity) => {
  if (!severity || severity === 'all') {
    return anomalies;
  }
  return anomalies.filter(anomaly => anomaly.severity === severity);
};

/**
 * Group anomalies by category
 * @param {Array} anomalies - Array of anomalies
 * @returns {Object} Grouped anomalies
 */
export const groupAnomaliesByCategory = (anomalies) => {
  return anomalies.reduce((groups, anomaly) => {
    const category = anomaly.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(anomaly);
    return groups;
  }, {});
};

/**
 * Group anomalies by severity
 * @param {Array} anomalies - Array of anomalies
 * @returns {Object} Grouped anomalies
 */
export const groupAnomaliesBySeverity = (anomalies) => {
  return anomalies.reduce((groups, anomaly) => {
    const severity = anomaly.severity || 'low';
    if (!groups[severity]) {
      groups[severity] = [];
    }
    groups[severity].push(anomaly);
    return groups;
  }, {});
};

/**
 * Calculate anomaly statistics
 * @param {Array} anomalies - Array of anomalies
 * @returns {Object} Statistics object
 */
export const calculateAnomalyStats = (anomalies) => {
  const total = anomalies.length;
  const byCategory = groupAnomaliesByCategory(anomalies);
  const bySeverity = groupAnomaliesBySeverity(anomalies);
  
  return {
    total,
    byCategory: Object.entries(byCategory).reduce((stats, [category, items]) => {
      stats[category] = items.length;
      return stats;
    }, {}),
    bySeverity: Object.entries(bySeverity).reduce((stats, [severity, items]) => {
      stats[severity] = items.length;
      return stats;
    }, {}),
    percentages: {
      byCategory: Object.entries(byCategory).reduce((percentages, [category, items]) => {
        percentages[category] = total > 0 ? Math.round((items.length / total) * 100) : 0;
        return percentages;
      }, {}),
      bySeverity: Object.entries(bySeverity).reduce((percentages, [severity, items]) => {
        percentages[severity] = total > 0 ? Math.round((items.length / total) * 100) : 0;
        return percentages;
      }, {})
    }
  };
};

/**
 * Format anomaly for display
 * @param {Object} anomaly - Anomaly object
 * @returns {Object} Formatted anomaly
 */
export const formatAnomalyForDisplay = (anomaly) => {
  const severityConfig = getSeverityConfig(anomaly.severity);
  const categoryConfig = getCategoryConfig(anomaly.category);
  
  return {
    ...anomaly,
    severityConfig,
    categoryConfig,
    formattedTimestamp: formatTimestamp(anomaly.timestamp),
    displayTitle: anomaly.title || anomaly.type || 'Unknown Anomaly',
    displayDescription: anomaly.description || anomaly.message || 'No description available'
  };
};

/**
 * Format timestamp for display
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

/**
 * Generate color palette for charts
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color values
 */
export const generateColorPalette = (count) => {
  const baseColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1'  // indigo
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

/**
 * Validate anomaly detection configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result
 */
export const validateAnomalyConfig = (config) => {
  const errors = [];
  const warnings = [];
  
  // Validate thresholds
  if (config.thresholds) {
    Object.entries(config.thresholds).forEach(([category, values]) => {
      if (typeof values !== 'object') {
        errors.push(`Invalid threshold configuration for ${category}`);
      }
    });
  }
  
  // Validate detection techniques
  if (config.technique && !Object.values(DETECTION_TECHNIQUES).some(t => t.value === config.technique)) {
    errors.push(`Invalid detection technique: ${config.technique}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Create anomaly notification data
 * @param {Object} anomaly - Anomaly object
 * @returns {Object} Notification data
 */
export const createAnomalyNotification = (anomaly) => {
  const severityConfig = getSeverityConfig(anomaly.severity);
  const categoryConfig = getCategoryConfig(anomaly.category);
  
  return {
    id: `anomaly_${anomaly.id || Date.now()}`,
    title: `${severityConfig.icon} ${severityConfig.label} ${categoryConfig.label} Anomaly`,
    message: anomaly.description || anomaly.message || 'Anomaly detected',
    severity: anomaly.severity,
    category: anomaly.category,
    timestamp: new Date().toISOString(),
    actions: [
      { label: 'View Details', action: 'view_details' },
      { label: 'Dismiss', action: 'dismiss' }
    ],
    color: severityConfig.color,
    icon: categoryConfig.icon
  };
};

// =============================================================================
// CHART AND VISUALIZATION HELPERS
// =============================================================================

/**
 * Prepare data for severity distribution chart
 * @param {Object} severityBreakdown - Severity breakdown data
 * @returns {Array} Chart data
 */
export const prepareSeverityChartData = (severityBreakdown) => {
  return Object.entries(ANOMALY_SEVERITY).map(([key, config]) => ({
    name: config.label,
    value: severityBreakdown[config.value] || 0,
    color: config.color,
    icon: config.icon
  })).filter(item => item.value > 0);
};

/**
 * Prepare data for category distribution chart
 * @param {Object} categoryBreakdown - Category breakdown data
 * @returns {Array} Chart data
 */
export const prepareCategoryChartData = (categoryBreakdown) => {
  return Object.entries(ANOMALY_CATEGORIES).map(([key, config]) => ({
    name: config.label,
    value: categoryBreakdown[config.value] || 0,
    color: config.color,
    icon: config.icon
  })).filter(item => item.value > 0);
};

/**
 * Prepare data for trend chart
 * @param {Array} historicalData - Historical anomaly data
 * @returns {Array} Trend chart data
 */
export const prepareTrendChartData = (historicalData) => {
  return historicalData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    total: item.total || 0,
    critical: item.critical || 0,
    high: item.high || 0,
    medium: item.medium || 0,
    low: item.low || 0
  }));
};

export default {
  ANOMALY_SEVERITY,
  ANOMALY_CATEGORIES,
  DETECTION_TECHNIQUES,
  HEALTH_STATUS,
  getSeverityConfig,
  getCategoryConfig,
  getHealthStatus,
  sortAnomaliesBySeverity,
  filterAnomaliesByCategory,
  filterAnomaliesBySeverity,
  groupAnomaliesByCategory,
  groupAnomaliesBySeverity,
  calculateAnomalyStats,
  formatAnomalyForDisplay,
  formatTimestamp,
  generateColorPalette,
  validateAnomalyConfig,
  createAnomalyNotification,
  prepareSeverityChartData,
  prepareCategoryChartData,
  prepareTrendChartData
};
