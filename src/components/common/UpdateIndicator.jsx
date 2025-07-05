import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const UpdateIndicator = ({ isUpdating, message }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setShow(true);
    } else {
      // Hide after animation completes
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  if (!show) return null;

  return (
    <div className={`fixed top-16 right-4 z-40 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg transition-all duration-300 ease-in-out transform ${isUpdating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 text-blue-500 ${isUpdating ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium text-blue-700">
          {message || 'Updating orders...'}
        </span>
      </div>
    </div>
  );
};

export default UpdateIndicator;
