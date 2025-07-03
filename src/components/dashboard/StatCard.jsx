import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, change, to }) => {
  return (
    <Link to={to || '#'} className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
            {title}
          </h3>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </Link>
  );
};

export default StatCard;