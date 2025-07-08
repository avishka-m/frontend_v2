import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, Hash, MapPin } from 'lucide-react';

const ReceivingHeader = ({ receivingData, loading = false }) => {
  if (loading) {
    return <ReceivingHeaderSkeleton />;
  }

  if (!receivingData) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb and Title */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/receiving" 
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Receiving
          </Link>
          
          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Receiving #{receivingData.receiving_id}
                </h1>
                <p className="text-sm text-gray-500">
                  Order #{receivingData.order_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Created: {new Date(receivingData.created_at).toLocaleDateString()}</span>
          </div>
          
          {receivingData.assigned_worker && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Clerk: {receivingData.worker_name}</span>
            </div>
          )}
          
          {receivingData.reference_number && (
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>Ref: {receivingData.reference_number}</span>
            </div>
          )}

          {receivingData.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location: {receivingData.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReceivingHeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="border-l border-gray-300 pl-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-36 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default ReceivingHeader; 