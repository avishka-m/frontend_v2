import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, Hash, MapPin, AlertTriangle } from 'lucide-react';

const InventoryHeader = ({ inventoryData, loading = false }) => {
  if (loading) {
    return <InventoryHeaderSkeleton />;
  }

  if (!inventoryData) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb and Title */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/inventory" 
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Inventory
          </Link>
          
          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {inventoryData.name || `Item #${inventoryData.item_id}`}
                </h1>
                <p className="text-sm text-gray-500">
                  SKU: {inventoryData.sku}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Available: {inventoryData.available_quantity || 0}</span>
          </div>
          
          {inventoryData.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location: {inventoryData.location}</span>
            </div>
          )}
          
          {inventoryData.last_updated && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Updated: {new Date(inventoryData.last_updated).toLocaleDateString()}</span>
            </div>
          )}

          {inventoryData.category && (
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>Category: {inventoryData.category}</span>
            </div>
          )}

          {/* Low Stock Alert */}
          {inventoryData.available_quantity <= inventoryData.reorder_level && (
            <div className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Low Stock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InventoryHeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="border-l border-gray-300 pl-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default InventoryHeader; 