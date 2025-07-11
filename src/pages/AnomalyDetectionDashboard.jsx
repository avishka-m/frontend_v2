/**
 * 🔍 Anomaly Detection Dashboard
 * Beginner-friendly warehouse anomaly detection interface!
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Settings,
  HelpCircle,
  TrendingUp,
  Clock,
  Users,
  Package,
  ShoppingCart,
  Workflow
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import anomalyDetectionService from '../services/anomalyDetectionService';

const AnomalyDetectionDashboard = () => {
  const { addNotification } = useNotification();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExplanation, setShowExplanation] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Load anomalies on component mount
  useEffect(() => {
    loadAnomalies();
    checkHealth();
  }, []);

  /**
   * 🔍 Load all anomalies
   */
  const loadAnomalies = async () => {
    setLoading(true);
    try {
      const result = await anomalyDetectionService.detectAllAnomalies();
      
      if (result.success) {
        setAnomaliesData(result.data);
        addNotification({
          type: 'success',
          message: result.message,
          description: `Found ${result.data.totalCount} anomalies across all categories`
        });
      } else {
        // Use sample data for demonstration if API fails
        const sampleData = anomalyDetectionService.generateSampleAnomalies();
        const processedSample = anomalyDetectionService.processAnomaliesResponse(sampleData);
        setAnomaliesData(processedSample);
        
        addNotification({
          type: 'info',
          message: '📊 Showing sample data',
          description: 'Using demo data to show how anomaly detection works!'
        });
      }
    } catch (error) {
      console.error('Error loading anomalies:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load anomalies',
        description: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 Check system health
   */
  const checkHealth = async () => {
    try {
      const result = await anomalyDetectionService.checkHealth();
      setHealthStatus(result);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  /**
   * 📚 Show explanation for anomaly type
   */
  const showAnomalyExplanation = async (anomalyType) => {
    try {
      const result = await anomalyDetectionService.explainAnomalyType(anomalyType);
      if (result.success) {
        setShowExplanation(result.data);
      } else {
        addNotification({
          type: 'error',
          message: 'Failed to load explanation',
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error loading explanation:', error);
    }
  };

  /**
   * 🎨 Filter anomalies based on selected criteria
   */
  const getFilteredAnomalies = () => {
    if (!anomaliesData?.categorizedAnomalies) return [];

    let allAnomalies = [];
    
    // Collect all anomalies from all categories
    Object.keys(anomaliesData.categorizedAnomalies).forEach(category => {
      if (selectedCategory === 'all' || selectedCategory === category) {
        anomaliesData.categorizedAnomalies[category].forEach(anomaly => {
          allAnomalies.push({ ...anomaly, category });
        });
      }
    });

    // Filter by severity
    if (selectedSeverity !== 'all') {
      allAnomalies = allAnomalies.filter(anomaly => anomaly.severity === selectedSeverity);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      allAnomalies = allAnomalies.filter(anomaly => 
        anomaly.title?.toLowerCase().includes(term) ||
        anomaly.description?.toLowerCase().includes(term) ||
        anomaly.item_name?.toLowerCase().includes(term) ||
        anomaly.worker_name?.toLowerCase().includes(term)
      );
    }

    return allAnomalies;
  };

  /**
   * 🎯 Get summary statistics
   */
  const getSummaryStats = () => {
    if (!anomaliesData) return null;

    const stats = {
      total: anomaliesData.totalCount || 0,
      critical: anomaliesData.severityStats?.critical || 0,
      warning: anomaliesData.severityStats?.warning || 0,
      info: anomaliesData.severityStats?.info || 0,
      categories: {}
    };

    // Count by category
    Object.keys(anomaliesData.categorizedAnomalies || {}).forEach(category => {
      stats.categories[category] = anomaliesData.categorizedAnomalies[category].length;
    });

    return stats;
  };

  const summaryStats = getSummaryStats();
  const filteredAnomalies = getFilteredAnomalies();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 🎯 Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              🔍 Anomaly Detection Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Beginner-friendly warehouse anomaly detection and monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Health Status */}
            {healthStatus && (
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                healthStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {healthStatus.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {healthStatus.success ? 'System Healthy' : 'System Error'}
                </span>
              </div>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={loadAnomalies}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Detecting...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Anomalies */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
                <p className="text-3xl font-bold text-gray-900">{summaryStats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Critical Issues */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-3xl font-bold text-red-600">{summaryStats.critical}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-3xl font-bold text-yellow-600">{summaryStats.warning}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Info Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Info Items</p>
                <p className="text-3xl font-bold text-blue-600">{summaryStats.info}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filter & Search</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search anomalies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="inventory">📦 Inventory</option>
            <option value="orders">🛒 Orders</option>
            <option value="workers">👷 Workers</option>
            <option value="workflow">🔄 Workflow</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">🚨 Critical</option>
            <option value="warning">⚠️ Warning</option>
            <option value="info">ℹ️ Info</option>
          </select>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* 📋 Anomalies List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            📋 Detected Anomalies ({filteredAnomalies.length})
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Click on any anomaly to learn more about it!
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Detecting anomalies...</p>
            </div>
          ) : filteredAnomalies.length > 0 ? (
            filteredAnomalies.map((anomaly, index) => (
              <AnomalyCard 
                key={index} 
                anomaly={anomaly} 
                onExplain={showAnomalyExplanation}
                service={anomalyDetectionService}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                🎉 No Anomalies Found!
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Your warehouse is running smoothly!'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 📚 Explanation Modal */}
      {showExplanation && (
        <ExplanationModal 
          explanation={showExplanation}
          onClose={() => setShowExplanation(null)}
        />
      )}
    </div>
  );
};

/**
 * 📋 Individual Anomaly Card Component
 */
const AnomalyCard = ({ anomaly, onExplain, service }) => {
  const severityBadge = service.getSeverityBadge(anomaly.severity);
  const categoryConfig = service.getCategoryConfig(anomaly.category);

  const getCategoryIcon = (category) => {
    const icons = {
      inventory: Package,
      orders: ShoppingCart,
      workers: Users,
      workflow: Workflow
    };
    return icons[category] || Package;
  };

  const CategoryIcon = getCategoryIcon(anomaly.category);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: categoryConfig.bgColor }}
            >
              <CategoryIcon 
                className="w-5 h-5"
                style={{ color: categoryConfig.color }}
              />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">{anomaly.title}</h3>
              <p className="text-sm text-gray-600">{categoryConfig.title}</p>
            </div>
            
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ 
                color: severityBadge.color,
                backgroundColor: severityBadge.bgColor
              }}
            >
              <span>{severityBadge.icon}</span>
              {severityBadge.label}
            </div>
          </div>

          {/* Content */}
          <div className="ml-11">
            <p className="text-gray-700 mb-2">{anomaly.description}</p>
            
            {/* Action Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium text-blue-900 mb-1">💡 Recommended Action:</p>
              <p className="text-sm text-blue-800">{anomaly.action}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {anomaly.item_name && (
                <div>
                  <span className="font-medium text-gray-600">Item:</span>
                  <p className="text-gray-900">{anomaly.item_name}</p>
                </div>
              )}
              {anomaly.current_stock !== undefined && (
                <div>
                  <span className="font-medium text-gray-600">Stock:</span>
                  <p className="text-gray-900">{anomaly.current_stock}</p>
                </div>
              )}
              {anomaly.worker_name && (
                <div>
                  <span className="font-medium text-gray-600">Worker:</span>
                  <p className="text-gray-900">{anomaly.worker_name}</p>
                </div>
              )}
              {anomaly.order_id && (
                <div>
                  <span className="font-medium text-gray-600">Order ID:</span>
                  <p className="text-gray-900">{anomaly.order_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onExplain(anomaly.type)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Learn more about this anomaly type"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 📚 Explanation Modal Component
 */
const ExplanationModal = ({ explanation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{explanation.title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What it means */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🤔 What it means:</h3>
            <p className="text-gray-700">{explanation.what_it_means}</p>
          </div>

          {/* Why it happens */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🔍 Why it happens:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.why_it_happens?.map((reason, index) => (
                <li key={index} className="text-gray-700">{reason}</li>
              ))}
            </ul>
          </div>

          {/* How to fix */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🔧 How to fix:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.how_to_fix?.map((step, index) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ul>
          </div>

          {/* Severity */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Severity Level:</h3>
            <p className="text-yellow-800">{explanation.severity}</p>
          </div>

          {/* Beginner tip */}
          {explanation.beginner_tip && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Beginner Tip:</h3>
              <p className="text-blue-800">{explanation.beginner_tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it! 👍
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetectionDashboard; 