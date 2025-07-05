import React from 'react';
import { 
  Package,
  Clock,
  CheckCircle,
  Activity,
  TrendingUp,
  Calendar
} from 'lucide-react';

const WorkflowStats = ({ tabs, tabCounts, themeColor }) => {
  const getIconForTab = (tabId) => {
    switch (tabId) {
      case 'pending':
      case 'ready':
      case 'available':
        return Package;
      case 'active':
      case 'processing':
      case 'picking':
      case 'delivery':
        return Activity;
      case 'completed':
      case 'delivered':
      case 'history':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getColorForTab = (tabId) => {
    switch (tabId) {
      case 'pending':
      case 'ready':
      case 'available':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'active':
      case 'processing':
      case 'picking':
      case 'delivery':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'completed':
      case 'delivered':
      case 'history':
        return 'bg-green-50 text-green-600 border-green-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tabs.map((tab) => {
        const IconComponent = getIconForTab(tab.id);
        const colorClass = getColorForTab(tab.id);
        const count = tabCounts[tab.id] || 0;
        
        return (
          <div 
            key={tab.id} 
            className={`p-4 rounded-xl border-2 ${colorClass} transition-all duration-300 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-75">{tab.label}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/50">
                <IconComponent size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowStats;
