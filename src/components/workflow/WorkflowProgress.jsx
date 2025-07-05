import React from 'react';
import { CheckCircle, Circle, ArrowRight, Activity } from 'lucide-react';

const WorkflowProgress = ({ 
  tabs, 
  activeTab, 
  orders, 
  workflowAnimation,
  themeColor = 'blue' 
}) => {
  const getTabCount = (tabId) => {
    return orders[tabId]?.length || 0;
  };

  const getProgressPercentage = () => {
    const totalOrders = Object.values(orders).reduce((total, tabOrders) => total + (tabOrders?.length || 0), 0);
    if (totalOrders === 0) return 0;
    
    const completedIndex = tabs.findIndex(tab => tab.id === 'completed' || tab.id === 'shipped' || tab.id === 'delivered');
    if (completedIndex === -1) return 0;
    
    let completedOrders = 0;
    for (let i = completedIndex; i < tabs.length; i++) {
      completedOrders += getTabCount(tabs[i].id);
    }
    
    return ((completedOrders / totalOrders) * 100).toFixed(1);
  };

  const getStepStatus = (tabId) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    
    if (tabIndex < currentIndex) return 'completed';
    if (tabIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-300';
      case 'active':
        return `text-${themeColor}-600 bg-${themeColor}-100 border-${themeColor}-300`;
      case 'pending':
        return 'text-gray-400 bg-gray-100 border-gray-300';
      default:
        return 'text-gray-400 bg-gray-100 border-gray-300';
    }
  };

  const getConnectorColor = (fromStatus, toStatus) => {
    if (fromStatus === 'completed') return 'bg-green-300';
    if (fromStatus === 'active') return `bg-${themeColor}-300`;
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Workflow Progress</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Overall Progress:</span>
          <span className={`text-sm font-semibold text-${themeColor}-600`}>
            {getProgressPercentage()}%
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {tabs.map((tab, index) => {
            const status = getStepStatus(tab.id);
            const count = getTabCount(tab.id);
            const isLast = index === tabs.length - 1;
            
            return (
              <div key={tab.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${getStepColor(status)}`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : status === 'active' ? (
                      <Activity className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                    
                    {/* Animation for active step */}
                    {status === 'active' && workflowAnimation && (
                      <div className={`absolute inset-0 rounded-full border-2 border-${themeColor}-400 animate-ping`}></div>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      status === 'completed' ? 'text-green-600' : 
                      status === 'active' ? `text-${themeColor}-600` : 
                      'text-gray-500'
                    }`}>
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {count} orders
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-4">
                    <div className={`h-0.5 transition-all duration-300 ${
                      getConnectorColor(status, getStepStatus(tabs[index + 1].id))
                    }`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Completion Rate</span>
          <span className="text-sm font-medium text-gray-900">{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${themeColor}-600 h-2 rounded-full transition-all duration-500`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Workflow Animation Indicator */}
      {workflowAnimation && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Activity className="h-4 w-4 animate-spin" />
          <span>Workflow in progress...</span>
        </div>
      )}
    </div>
  );
};

export default WorkflowProgress;
