import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

const WorkflowProgress = ({ 
  title, 
  tabs, 
  tabCounts, 
  workflowAnimation, 
  themeColor 
}) => {
  const totalOrders = Object.values(tabCounts).reduce((sum, count) => sum + count, 0);
  
  const getProgressPercentage = (tabId) => {
    const count = tabCounts[tabId] || 0;
    return totalOrders > 0 ? (count / totalOrders) * 100 : 0;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Workflow Progress</h3>
        {workflowAnimation && (
          <div className="flex items-center space-x-2 text-green-600">
            <Zap size={16} className="animate-pulse" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {tabs.map((tab, index) => {
          const percentage = getProgressPercentage(tab.id);
          const count = tabCounts[tab.id] || 0;
          
          return (
            <div key={tab.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{tab.label}</span>
                  <span className="text-sm text-gray-500">{count} orders</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${themeColor}-500 h-2 rounded-full transition-all duration-500 ${
                      workflowAnimation === tab.id ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              
              {index < tabs.length - 1 && (
                <ArrowRight size={16} className="text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Orders in Workflow</span>
          <span className="font-semibold text-gray-800">{totalOrders}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;
