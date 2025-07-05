import React from 'react';
import { Badge } from 'lucide-react';

const WorkflowTabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  orders, 
  searchTerm, 
  onSearchChange,
  themeColor = 'blue' 
}) => {
  const getTabCount = (tabId) => {
    return orders[tabId]?.length || 0;
  };

  const getTabColorClasses = (tabId) => {
    const isActive = activeTab === tabId;
    
    if (isActive) {
      return {
        button: `bg-${themeColor}-50 text-${themeColor}-700 border-${themeColor}-200`,
        badge: `bg-${themeColor}-600 text-white`,
        indicator: `bg-${themeColor}-600`
      };
    }
    
    return {
      button: 'bg-white text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400',
      badge: 'bg-gray-100 text-gray-600',
      indicator: 'bg-transparent'
    };
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Workflow Stages</h3>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const count = getTabCount(tab.id);
          const colors = getTabColorClasses(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${colors.button}
                min-w-0 flex-shrink-0
              `}
            >
              {/* Tab Icon */}
              {tab.icon && (
                <tab.icon className="h-4 w-4 flex-shrink-0" />
              )}
              
              {/* Tab Label */}
              <span className="font-medium whitespace-nowrap">
                {tab.label}
              </span>
              
              {/* Count Badge */}
              <span className={`
                inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                ${colors.badge}
                min-w-[1.5rem] h-6
              `}>
                {count}
              </span>
              
              {/* Active Indicator */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200
                ${colors.indicator}
              `} />
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      {tabs.find(tab => tab.id === activeTab)?.description && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab).description}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const count = getTabCount(tab.id);
          const isActive = activeTab === tab.id;
          
          return (
            <div
              key={`stat-${tab.id}`}
              className={`
                p-3 rounded-lg border transition-all duration-200
                ${isActive ? 
                  `bg-${themeColor}-50 border-${themeColor}-200 text-${themeColor}-700` : 
                  'bg-gray-50 border-gray-200 text-gray-600'
                }
              `}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs truncate">{tab.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Results Indicator */}
      {searchTerm && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>
            Search results for "{searchTerm}"
          </span>
          <button
            onClick={() => onSearchChange('')}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowTabs;
