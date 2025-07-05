import React, { useState } from 'react';
import { 
  X, 
  Route, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Navigation,
  Target,
  Zap
} from 'lucide-react';

const OptimalPathModal = ({ order, pathData, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const handleStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex === currentStep && stepIndex < pathData.optimal_path.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const getStepStatus = (stepIndex) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const orderId = order.order_id || order.orderID;
  const path = pathData.optimal_path || [];
  const pickingList = pathData.picking_list || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Optimal Picking Path
                </h3>
                <p className="text-sm text-gray-600">
                  Order #{orderId} - AI-powered route optimization
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Path Overview */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Route Stats */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Route Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Items:</span>
                    <span className="font-medium text-blue-900">{pathData.total_items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Estimated Time:</span>
                    <span className="font-medium text-blue-900">{pathData.estimated_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Route Steps:</span>
                    <span className="font-medium text-blue-900">{path.length}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Progress</span>
                  <span className="text-sm text-gray-600">
                    {completedSteps.size}/{path.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSteps.size / path.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Path Steps */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Navigation className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Picking Route</h4>
              </div>

              {path.length > 0 ? (
                <div className="space-y-4">
                  {path.map((step, index) => {
                    const status = getStepStatus(index);
                    const isCompleted = completedSteps.has(index);
                    const isCurrent = index === currentStep;
                    
                    return (
                      <div 
                        key={index}
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          isCurrent ? 'border-blue-300 bg-blue-50' : 
                          isCompleted ? 'border-green-300 bg-green-50' : 
                          'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStepColor(status)}`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {step.location || `Location ${step.zone || index + 1}`}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Zone {step.zone} - Aisle {step.aisle} - Shelf {step.shelf}
                                </p>
                              </div>
                            </div>

                            {/* Items at this location */}
                            {step.items && step.items.length > 0 && (
                              <div className="ml-11 space-y-2">
                                {step.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center space-x-2">
                                      <Package className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {item.name || item.item_name || `Item ${item.id}`}
                                      </span>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Navigation hint */}
                            {step.directions && (
                              <div className="ml-11 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <div className="flex items-center space-x-1">
                                  <Navigation className="h-3 w-3 text-yellow-600" />
                                  <span className="text-xs text-yellow-800 font-medium">Navigation:</span>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">{step.directions}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          {isCurrent && !isCompleted && (
                            <button
                              onClick={() => handleStepComplete(index)}
                              className="ml-4 flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Complete</span>
                            </button>
                          )}
                        </div>

                        {/* Arrow to next step */}
                        {index < path.length - 1 && (
                          <div className="flex justify-center mt-3">
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Completion Message */}
                  {completedSteps.size === path.length && (
                    <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
                      <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <h4 className="font-semibold text-green-900">Route Completed!</h4>
                      <p className="text-sm text-green-700">
                        All items have been picked. Ready for packing.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No optimal path data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <Clock className="h-4 w-4 inline mr-1" />
              Estimated completion: {pathData.estimated_time}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {completedSteps.size === path.length && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Proceed to Packing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimalPathModal; 