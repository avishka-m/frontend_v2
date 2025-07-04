import React from 'react';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const OrderStats = ({ stats }) => {
  const { 
    total_orders = 0, 
    pending_orders = 0, 
    receiving_orders = 0, 
    completed_orders = 0 
  } = stats || {};

  const statItems = [
    {
      title: 'Total Orders',
      value: total_orders,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending',
      value: pending_orders,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Receiving',
      value: receiving_orders,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed',
      value: completed_orders,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStats;
