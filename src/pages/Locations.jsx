import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Locations = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Locations</h1>
          <p className="text-gray-600 mt-1">Manage and track warehouse zones, aisles, and bins</p>
        </div>
      </div>

      <div className="card p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-medium mb-2">Locations Management</h2>
        <p className="text-gray-600 mb-4">
          This feature is currently under development and will be available soon.
        </p>
        {currentUser?.role === 'Manager' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Manager Note:</strong> The warehouse locations module will allow for zone mapping, bin organization, and optimized pick paths.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;