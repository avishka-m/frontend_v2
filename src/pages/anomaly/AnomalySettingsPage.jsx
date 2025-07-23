import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAnomalyDetection } from '../../hooks/useAnomalyDetection';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Input } from '../../components/common/Input';

/**
 * ⚙️ Anomaly Detection Settings Page
 * 
 * Configuration interface for anomaly detection system (Manager only):
 * - Detection thresholds configuration
 * - ML model management
 * - System preferences
 * - Performance monitoring
 */
const AnomalySettingsPage = () => {
  const { currentUser } = useAuth();
  const {
    thresholds,
    modelsStatus,
    getThresholds,
    updateThresholds,
    getModelsStatus,
    retrainModels,
    loading
  } = useAnomalyDetection();

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [retraining, setRetraining] = useState(false);

  // Check if user is manager
  const isManager = currentUser?.role === 'Manager';

  useEffect(() => {
    if (isManager) {
      getThresholds();
      getModelsStatus();
    }
  }, [isManager, getThresholds, getModelsStatus]);

  useEffect(() => {
    if (thresholds?.thresholds) {
      setFormData(thresholds.thresholds);
    }
  }, [thresholds]);

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSaveThresholds = async () => {
    setSaving(true);
    try {
      const result = await updateThresholds(formData);
      if (result?.success) {
        // Show success message
        console.log('Thresholds updated successfully');
      }
    } catch (error) {
      console.error('Error updating thresholds:', error);
    }
    setSaving(false);
  };

  const handleRetrainModels = async () => {
    setRetraining(true);
    try {
      const result = await retrainModels();
      if (result?.success) {
        console.log('Model retraining initiated');
        // Refresh models status after a delay
        setTimeout(() => {
          getModelsStatus();
        }, 5000);
      }
    } catch (error) {
      console.error('Error retraining models:', error);
    }
    setRetraining(false);
  };

  const exportConfiguration = () => {
    const config = {
      export_date: new Date().toISOString(),
      thresholds: formData,
      models_status: modelsStatus,
      exported_by: currentUser?.username
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomaly-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (!isManager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only managers can access anomaly detection settings.
          </p>
          <Link to="/anomaly-detection">
            <Button variant="primary">
              Back to Anomaly Detection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/anomaly-detection">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⚙️ Anomaly Detection Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure detection thresholds and manage ML models
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={exportConfiguration}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
              Export Config
            </Button>
          </div>
        </div>

        {/* Detection Thresholds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Detection Thresholds</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading thresholds...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Inventory Thresholds */}
                {formData.inventory && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <span>📦</span>
                      <span>Inventory Thresholds</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Critical Stock Level
                        </label>
                        <Input
                          type="number"
                          value={formData.inventory.critical_stock_level || 0}
                          onChange={(e) => handleInputChange('inventory', 'critical_stock_level', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Low Stock Threshold
                        </label>
                        <Input
                          type="number"
                          value={formData.inventory.low_stock_threshold || 0}
                          onChange={(e) => handleInputChange('inventory', 'low_stock_threshold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dead Stock Days
                        </label>
                        <Input
                          type="number"
                          value={formData.inventory.dead_stock_days || 0}
                          onChange={(e) => handleInputChange('inventory', 'dead_stock_days', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Stock Multiplier
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.inventory.max_stock_multiplier || 0}
                          onChange={(e) => handleInputChange('inventory', 'max_stock_multiplier', e.target.value)}
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Thresholds */}
                {formData.orders && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <span>🛒</span>
                      <span>Order Thresholds</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          High Value Threshold ($)
                        </label>
                        <Input
                          type="number"
                          value={formData.orders.high_value_threshold || 0}
                          onChange={(e) => handleInputChange('orders', 'high_value_threshold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bulk Order Threshold
                        </label>
                        <Input
                          type="number"
                          value={formData.orders.bulk_order_threshold || 0}
                          onChange={(e) => handleInputChange('orders', 'bulk_order_threshold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Processing Delay (hours)
                        </label>
                        <Input
                          type="number"
                          value={formData.orders.processing_delay_hours || 0}
                          onChange={(e) => handleInputChange('orders', 'processing_delay_hours', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          After Hours Threshold (hour)
                        </label>
                        <Input
                          type="number"
                          value={formData.orders.after_hours_threshold || 0}
                          onChange={(e) => handleInputChange('orders', 'after_hours_threshold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Workflow Thresholds */}
                {formData.workflow && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Workflow Thresholds</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stuck Order Hours
                        </label>
                        <Input
                          type="number"
                          value={formData.workflow.stuck_order_hours || 0}
                          onChange={(e) => handleInputChange('workflow', 'stuck_order_hours', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bottleneck Threshold
                        </label>
                        <Input
                          type="number"
                          value={formData.workflow.bottleneck_threshold || 0}
                          onChange={(e) => handleInputChange('workflow', 'bottleneck_threshold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    onClick={handleSaveThresholds}
                    disabled={saving}
                    className="mr-3"
                  >
                    {saving ? 'Saving...' : 'Save Thresholds'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFormData(thresholds?.thresholds || {})}
                  >
                    Reset to Current
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ML Models Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cog6ToothIcon className="w-5 h-5" />
              <span>ML Models Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading models status...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Models Status */}
                {modelsStatus?.models && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Model Status</h3>
                    <div className="space-y-3">
                      {Object.entries(modelsStatus.models).map(([modelName, status]) => (
                        <div key={modelName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{modelName.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`font-medium ${status.status === 'trained' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {status.status}
                              </span>
                              {status.last_training && (
                                <span className="ml-2">
                                  • Last trained: {new Date(status.last_training).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                            {status.reason && (
                              <p className="text-sm text-red-600">Reason: {status.reason}</p>
                            )}
                          </div>
                          <div className="text-2xl">
                            {status.status === 'trained' ? '✅' : '⚠️'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retrain Models */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Model Retraining</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-3">
                      Retrain all ML models with the latest data to improve anomaly detection accuracy.
                      This process typically takes 5-10 minutes.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleRetrainModels}
                      disabled={retraining}
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      {retraining ? 'Retraining Models...' : 'Retrain All Models'}
                    </Button>
                  </div>
                </div>

                {/* System Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Models:</span>
                      <span className="ml-2 font-medium">{modelsStatus?.modelsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trained Models:</span>
                      <span className="ml-2 font-medium">{modelsStatus?.trainedModels || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Overall Status:</span>
                      <span className="ml-2 font-medium">{modelsStatus?.overall_status || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Update:</span>
                      <span className="ml-2 font-medium">
                        {modelsStatus?.lastUpdate ? new Date(modelsStatus.lastUpdate).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnomalySettingsPage;
