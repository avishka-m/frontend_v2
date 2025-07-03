import React from 'react';

const QuickAction = ({ title, icon, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow transition-shadow border border-gray-100 ${
        color ? `text-${color}-500` : 'text-gray-700'
      }`}
    >
      {icon}
      <span className="mt-2 text-sm font-medium text-center">{title}</span>
    </button>
  );
};

export default QuickAction;