import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Returns = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
          <p className="text-gray-600 mt-1">Process and track customer returns and manage returned inventory</p>
        </div>
      </div>

      <div className="card p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-medium mb-2">Returns Processing</h2>
        <p className="text-gray-600 mb-4">
          This feature is currently under development and will be available soon.
        </p>
        {currentUser?.role === 'Manager' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Manager Note:</strong> The returns module will handle RMA processing, quality inspection, inventory restocking, and customer refunds tracking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;