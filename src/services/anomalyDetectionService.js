/**
 * 🔍 Anomaly Detection Service
 * Beginner-friendly service for warehouse anomaly detection!
 */

import apiClient from './api';

class AnomalyDetectionService {
  constructor() {
    this.baseURL = '/anomaly-detection';
  }

  /**
   * 🔍 Check if anomaly detection service is healthy
   * Perfect for beginners to test the system!
   */
  async checkHealth() {
    try {
      const response = await apiClient.get(`${this.baseURL}/health`);
      return {
        success: true,
        data: response.data,
        message: '🎯 Anomaly detection service is healthy!'
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Anomaly detection service is not responding'
      };
    }
  }

  /**
   * 🚨 Detect ALL types of anomalies
   * Main method for comprehensive anomaly detection!
   */
  async detectAllAnomalies() {
    try {
      const response = await apiClient.get(`${this.baseURL}/detect`);
      
      // Process and categorize anomalies for easy display
      const processedData = this.processAnomaliesResponse(response.data.data);
      
      return {
        success: true,
        data: processedData,
        message: `🎯 Found ${processedData.summary.total_anomalies} anomalies!`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ All anomalies detection failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to detect anomalies'
      };
    }
  }

  /**
   * 📦 Detect only inventory anomalies
   * Great for warehouse managers and inventory clerks!
   */
  async detectInventoryAnomalies() {
    try {
      const response = await apiClient.get(`${this.baseURL}/inventory`);
      return {
        success: true,
        data: response.data,
        message: `📦 Found ${response.data.count} inventory anomalies!`
      };
    } catch (error) {
      console.error('❌ Inventory anomalies detection failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to detect inventory anomalies'
      };
    }
  }

  /**
   * 🛒 Detect only order anomalies
   * Perfect for order processors and customer service!
   */
  async detectOrderAnomalies() {
    try {
      const response = await apiClient.get(`${this.baseURL}/orders`);
      return {
        success: true,
        data: response.data,
        message: `🛒 Found ${response.data.count} order anomalies!`
      };
    } catch (error) {
      console.error('❌ Order anomalies detection failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to detect order anomalies'
      };
    }
  }

  /**
   * 👷 Detect only worker anomalies
   * Great for HR and warehouse managers!
   */
  async detectWorkerAnomalies() {
    try {
      const response = await apiClient.get(`${this.baseURL}/workers`);
      return {
        success: true,
        data: response.data,
        message: `👷 Found ${response.data.count} worker anomalies!`
      };
    } catch (error) {
      console.error('❌ Worker anomalies detection failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to detect worker anomalies'
      };
    }
  }

  /**
   * 🔄 Detect only workflow anomalies
   * Perfect for process managers and supervisors!
   */
  async detectWorkflowAnomalies() {
    try {
      const response = await apiClient.get(`${this.baseURL}/workflow`);
      return {
        success: true,
        data: response.data,
        message: `🔄 Found ${response.data.count} workflow anomalies!`
      };
    } catch (error) {
      console.error('❌ Workflow anomalies detection failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to detect workflow anomalies'
      };
    }
  }

  /**
   * 📊 Get anomaly summary statistics
   * Perfect for dashboards and quick health checks!
   */
  async getAnomalySummary() {
    try {
      const response = await apiClient.get(`${this.baseURL}/summary`);
      return {
        success: true,
        data: response.data.summary,
        message: `📊 System health: ${response.data.summary.health_status.toUpperCase()}`
      };
    } catch (error) {
      console.error('❌ Anomaly summary failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to get anomaly summary'
      };
    }
  }

  /**
   * 📚 Get detailed explanation of an anomaly type
   * Perfect for beginners learning about different anomalies!
   */
  async explainAnomalyType(anomalyType) {
    try {
      const response = await apiClient.get(`${this.baseURL}/explain/${anomalyType}`);
      return {
        success: true,
        data: response.data.explanation,
        message: `📚 Explanation for ${anomalyType} loaded!`
      };
    } catch (error) {
      console.error(`❌ Failed to explain anomaly type ${anomalyType}:`, error);
      return {
        success: false,
        error: error.message,
        message: `❌ Failed to explain anomaly type: ${anomalyType}`
      };
    }
  }

  /**
   * ⚙️ Configure anomaly detection thresholds
   * For advanced users who want to customize detection!
   */
  async configureThresholds(thresholds) {
    try {
      const response = await apiClient.post(`${this.baseURL}/configure`, thresholds);
      return {
        success: true,
        data: response.data,
        message: '⚙️ Thresholds updated successfully!'
      };
    } catch (error) {
      console.error('❌ Threshold configuration failed:', error);
      return {
        success: false,
        error: error.message,
        message: '❌ Failed to configure thresholds'
      };
    }
  }

  /**
   * 🎨 Process anomalies response for better frontend display
   * Helper method to organize data for UI components
   */
  processAnomaliesResponse(data) {
    const processed = {
      ...data,
      categorizedAnomalies: {},
      severityStats: { critical: 0, warning: 0, info: 0 },
      totalCount: 0
    };

    // Categorize anomalies and count severities
    ['inventory', 'orders', 'workers', 'workflow'].forEach(category => {
      if (data[category] && Array.isArray(data[category])) {
        processed.categorizedAnomalies[category] = data[category];
        
        data[category].forEach(anomaly => {
          const severity = anomaly.severity || 'info';
          processed.severityStats[severity]++;
          processed.totalCount++;
        });
      }
    });

    // Add color coding for severities
    processed.severityColors = {
      critical: '#ef4444', // Red
      warning: '#f59e0b',  // Yellow/Orange  
      info: '#3b82f6'      // Blue
    };

    // Add icons for categories
    processed.categoryIcons = {
      inventory: '📦',
      orders: '🛒',
      workers: '👷',
      workflow: '🔄'
    };

    return processed;
  }

  /**
   * 🎯 Get severity badge configuration
   * Helper method for UI styling
   */
  getSeverityBadge(severity) {
    const badges = {
      critical: {
        color: '#ef4444',
        bgColor: '#fee2e2',
        icon: '🚨',
        label: 'Critical'
      },
      warning: {
        color: '#f59e0b', 
        bgColor: '#fef3c7',
        icon: '⚠️',
        label: 'Warning'
      },
      info: {
        color: '#3b82f6',
        bgColor: '#dbeafe',
        icon: 'ℹ️',
        label: 'Info'
      }
    };

    return badges[severity] || badges.info;
  }

  /**
   * 🏷️ Get category configuration
   * Helper method for UI styling
   */
  getCategoryConfig(category) {
    const configs = {
      inventory: {
        icon: '📦',
        color: '#059669',
        bgColor: '#d1fae5',
        title: 'Inventory Anomalies',
        description: 'Stock issues, dead stock, quantity problems'
      },
      orders: {
        icon: '🛒',
        color: '#7c3aed',
        bgColor: '#ede9fe',
        title: 'Order Anomalies',
        description: 'Large orders, timing issues, duplicates'
      },
      workers: {
        icon: '👷',
        color: '#dc2626',
        bgColor: '#fee2e2',
        title: 'Worker Anomalies',
        description: 'Performance issues, unusual patterns'
      },
      workflow: {
        icon: '🔄',
        color: '#ea580c',
        bgColor: '#fed7aa',
        title: 'Workflow Anomalies',
        description: 'Process delays, stuck items, bottlenecks'
      }
    };

    return configs[category] || {
      icon: '❓',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      title: 'Unknown Category',
      description: 'Unknown anomaly category'
    };
  }

  /**
   * 📈 Get health status configuration
   * Helper method for system health display
   */
  getHealthStatusConfig(status) {
    const configs = {
      healthy: {
        icon: '🟢',
        color: '#059669',
        bgColor: '#d1fae5',
        title: 'All Systems Normal',
        message: 'No anomalies detected!'
      },
      warning: {
        icon: '🟡',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        title: 'System Needs Attention',
        message: 'Some warnings detected'
      },
      critical: {
        icon: '🔴',
        color: '#ef4444',
        bgColor: '#fee2e2',
        title: 'Critical Issues Detected',
        message: 'Immediate action required!'
      },
      needs_attention: {
        icon: '🔵',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        title: 'Monitor Closely',
        message: 'Some items need monitoring'
      }
    };

    return configs[status] || configs.needs_attention;
  }

  /**
   * 🎲 Generate sample anomaly data for testing
   * Perfect for beginners to see how the system works!
   */
  generateSampleAnomalies() {
    return {
      inventory: [
        {
          type: 'sudden_stock_drop',
          severity: 'critical',
          title: '🚨 Sudden Stock Drop Detected!',
          description: 'Stock dropped by 75 units suddenly',
          action: 'Check for theft, damage, or data error',
          item_name: 'Gaming Laptop',
          current_stock: 5,
          location: 'A-15-3',
          timestamp: new Date().toISOString()
        },
        {
          type: 'dead_stock',
          severity: 'warning',
          title: '💀 Dead Stock Alert',
          description: 'No movement for 45 days',
          action: 'Consider promotion or redistribution',
          item_name: 'Winter Jacket XL',
          current_stock: 89,
          location: 'B-22-1',
          timestamp: new Date().toISOString()
        }
      ],
      orders: [
        {
          type: 'huge_order',
          severity: 'warning',
          title: '🚀 Unusually Large Order',
          description: 'Order contains 250 items - way above average!',
          action: 'Verify customer and payment method',
          order_id: 'ORD-2024-001',
          customer_id: 'CUST-789',
          order_value: 15000,
          timestamp: new Date().toISOString()
        }
      ],
      workers: [
        {
          type: 'high_error_rate',
          severity: 'warning',
          title: '❌ High Error Rate Alert',
          description: 'Error rate of 12.5% is above normal',
          action: 'Provide additional training and support',
          worker_name: 'Demo Worker',
          worker_role: 'Picker',
          timestamp: new Date().toISOString()
        }
      ],
      workflow: [
        {
          type: 'stuck_workflow',
          severity: 'info',
          title: '⏰ Receiving Process Stuck',
          description: 'Item stuck in pending for too long',
          action: 'Review receiving process and resolve blockage',
          workflow_area: 'receiving',
          status: 'pending',
          processing_time: 26,
          timestamp: new Date().toISOString()
        }
      ],
      summary: {
        total_anomalies: 5,
        critical_count: 1,
        warning_count: 3,
        info_count: 1,
        health_status: 'warning',
        detection_time: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();
export default anomalyDetectionService; 