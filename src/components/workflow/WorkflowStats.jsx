import React from 'react';
import { Package, Clock, CheckCircle, TrendingUp, Activity, Users } from 'lucide-react';

const WorkflowStats = ({ 
  orders, 
  tabs, 
  statusMapping, 
  themeColor = 'blue',
  isUpdating,
  updateMessage 
}) => {
  const getTabCount = (tabId) => {
    return orders[tabId]?.length || 0;
  };

  const getTotalOrders = () => {
    return Object.values(orders).reduce((total, tabOrders) => total + (tabOrders?.length || 0), 0);
  };

  const getStatsCards = () => {
    const totalOrders = getTotalOrders();
    const completedOrders = getTabCount('completed') || getTabCount('shipped') || getTabCount('delivered');
    const inProgressOrders = getTabCount('in_progress') || getTabCount('picking') || getTabCount('packing');
    const pendingOrders = getTabCount('pending') || getTabCount('new');

    return [
      {
        title: 'Total Orders',
        value: totalOrders,
        icon: Package,
        color: 'blue',
        trend: null
      },
      {
        title: 'In Progress',
        value: inProgressOrders,
        icon: Activity,
        color: 'orange',
        trend: null
      },
      {
        title: 'Completed',
        value: completedOrders,
        icon: CheckCircle,
        color: 'green',
        trend: '+12%'
      },
      {
        title: 'Pending',
        value: pendingOrders,
        icon: Clock,
        color: 'yellow',
        trend: null
      }
    ];
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          icon: 'text-blue-500'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-600',
          icon: 'text-orange-500'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-600',
          icon: 'text-green-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-600',
          icon: 'text-yellow-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          icon: 'text-gray-500'
        };
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="space-y-4">
      {/* Update Status */}
      {isUpdating && updateMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 font-medium">{updateMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          const IconComponent = card.icon;
          
          return (
            <div key={index} className={`${colors.bg} rounded-lg p-4 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${colors.bg} rounded-lg`}>
                    <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {card.value}
                    </p>
                  </div>
                </div>
                {card.trend && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{card.trend}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Workflow Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => {
            const count = getTabCount(tab.id);
            const percentage = getTotalOrders() > 0 ? ((count / getTotalOrders()) * 100).toFixed(1) : 0;
            
            return (
              <div key={tab.id} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{tab.label}</div>
                <div className="text-xs text-gray-500">({percentage}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStats;
