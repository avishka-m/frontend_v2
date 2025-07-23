import React, { useState } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LinkIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Dialog } from '../common/Dialog';
import { formatTimestamp, getSeverityConfig, getCategoryConfig } from '../../utils/anomalyUtils';

/**
 * 🔍 Anomaly Details Modal Component
 * 
 * Detailed view modal for individual anomalies showing:
 * - Complete anomaly information
 * - Detection method and confidence
 * - Related data and context
 * - Action buttons and workflow
 * - Timeline and history
 */
const AnomalyDetailsModal = ({
  anomaly,
  isOpen,
  onClose,
  onDismiss,
  onResolve,
  onEscalate,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isResolving, setIsResolving] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  if (!anomaly) return null;

  const severityConfig = getSeverityConfig(anomaly.severity);
  const categoryConfig = getCategoryConfig(anomaly.category);

  const handleDismiss = async () => {
    if (isDismissing) return; // Prevent multiple clicks
    setIsDismissing(true);
    
    try {
      if (onDismiss) {
        await onDismiss(anomaly);
      }
      onClose();
    } catch (error) {
      console.error('Error dismissing anomaly:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  const handleResolve = async () => {
    if (isResolving) return; // Prevent multiple clicks
    setIsResolving(true);
    
    try {
      if (onResolve) {
        await onResolve(anomaly);
      }
      onClose();
    } catch (error) {
      console.error('Error resolving anomaly:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleEscalate = () => {
    if (onEscalate) {
      onEscalate(anomaly);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: InformationCircleIcon },
    { id: 'context', label: 'Context', icon: LinkIcon },
    { id: 'actions', label: 'Actions', icon: ExclamationTriangleIcon }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: severityConfig.bgColor, color: severityConfig.color }}
            >
              <span className="text-xl">{categoryConfig.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {anomaly.title || anomaly.type || 'Anomaly Details'}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span 
                  className="px-2 py-1 text-xs font-semibold rounded-full"
                  style={{ 
                    backgroundColor: severityConfig.bgColor, 
                    color: severityConfig.color 
                  }}
                >
                  {severityConfig.label.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  {categoryConfig.label}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(anomaly.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            if (tab.id === 'details') return null; // Comment out Details tab button
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Details Tab (commented out) */}
          {/*
          {activeTab === 'details' && (
            <div>...details tab content commented out...</div>
          )}
          */}

          {/* Context Tab */}
          {activeTab === 'context' && (
            <div className="space-y-6">
              {/* Related Items */}
              {(anomaly.item_id || anomaly.order_id || anomaly.worker_id) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {anomaly.item_id && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📦</span>
                          <div>
                            <p className="text-sm font-medium">Inventory Item</p>
                            <p className="text-xs text-gray-600">ID: {anomaly.item_id}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/inventory?search=${anomaly.item_id}`, '_blank')}
                        >
                          View Item
                        </Button>
                      </div>
                    )}
                    
                    {anomaly.order_id && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🛒</span>
                          <div>
                            <p className="text-sm font-medium">Order</p>
                            <p className="text-xs text-gray-600">ID: {anomaly.order_id}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/orders/${anomaly.order_id}`, '_blank')}
                        >
                          View Order
                        </Button>
                      </div>
                    )}
                    
                    {anomaly.worker_id && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">👷</span>
                          <div>
                            <p className="text-sm font-medium">Worker</p>
                            <p className="text-xs text-gray-600">ID: {anomaly.worker_id}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/workers/${anomaly.worker_id}`, '_blank')}
                        >
                          View Worker
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {anomaly.recommendations && anomaly.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {anomaly.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="primary"
                      onClick={handleResolve}
                      disabled={loading || isResolving}
                      className="justify-start"
                    >
                      {isResolving ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Resolving...
                        </>
                      ) : (
                        <>
                          ✅ Mark as Resolved
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="secondary"
                      onClick={handleEscalate}
                      disabled={loading || isResolving || isDismissing}
                      className="justify-start"
                    >
                      🚨 Escalate to Manager
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Create support ticket
                        const ticketData = {
                          anomaly_id: anomaly.id,
                          type: anomaly.type,
                          severity: anomaly.severity,
                          category: anomaly.category,
                          description: anomaly.description,
                          created_at: new Date().toISOString()
                        };
                        console.log('Creating support ticket for anomaly:', ticketData);
                        alert('🎫 Support ticket created! (This is a demo implementation)');
                      }}
                      disabled={loading || isResolving || isDismissing}
                      className="justify-start"
                    >
                      🎫 Create Support Ticket
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={handleDismiss}
                      disabled={loading || isDismissing}
                      className="justify-start"
                    >
                      {isDismissing ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Dismissing...
                        </>
                      ) : (
                        <>
                          ❌ Dismiss Anomaly
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Investigation Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Investigation Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Export anomaly data
                      const data = JSON.stringify(anomaly, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `anomaly-${anomaly.id}-${Date.now()}.json`;
                      a.click();
                    }}
                    className="w-full justify-start"
                  >
                    📥 Export Anomaly Data
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(anomaly, null, 2))}
                    className="w-full justify-start"
                  >
                    📋 Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Anomaly ID: {anomaly.id} • Detected: {formatTimestamp(anomaly.timestamp)}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {anomaly.actionable && (
              <Button variant="primary" onClick={handleResolve}>
                Take Action
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AnomalyDetailsModal;
