import React from 'react';
import { 
  Search,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';

const WorkflowTabs = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  tabCounts, 
  workflowAnimation, 
  themeColor,
  searchTerm,
  setSearchTerm,
  onRefresh
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => {
          const count = tabCounts[tab.id] || 0;
          const isActive = activeTab === tab.id;
          const isAnimating = workflowAnimation === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${isActive 
                  ? `bg-${themeColor}-100 text-${themeColor}-700 border-2 border-${themeColor}-200` 
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }
                ${isAnimating ? 'animate-pulse ring-2 ring-green-400' : ''}
              `}
            >
              {tab.icon && <tab.icon size={16} />}
              <span>{tab.label}</span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-bold
                ${isActive 
                  ? `bg-${themeColor}-200 text-${themeColor}-800` 
                  : 'bg-gray-200 text-gray-700'
                }
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Search and Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
};

export default WorkflowTabs;
