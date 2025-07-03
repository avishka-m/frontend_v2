import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Vehicles = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600 mt-1">Manage delivery vehicles, maintenance schedules, and routes</p>
        </div>
      </div>

      <div className="card p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-medium mb-2">Vehicle Fleet Management</h2>
        <p className="text-gray-600 mb-4">
          This feature is currently under development and will be available soon.
        </p>
        {currentUser?.role === 'Manager' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Manager Note:</strong> The fleet management module will include vehicle tracking, maintenance scheduling, driver assignments, and route optimization.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;