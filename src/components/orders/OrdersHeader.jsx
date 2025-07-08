import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  RefreshCw, 
  Download, 
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Package,
  Truck
} from 'lucide-react';

const OrdersHeader = ({ 
  ordersData, 
  loading = false, 
  onRefresh, 
  refreshing = false, 
  currentUser,
  onExport,
  stats
}) => {
  if (loading) {
    return <OrdersHeaderSkeleton />;
  }

  const canManageOrders = ['clerk', 'manager'].includes(currentUser?.role || '');

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col space-y-4">
        {/* Title and Main Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and track customer orders
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            {canManageOrders && (
              <Link
                to="/orders/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Link>
            )}
          </div>
        </div>

        {/* Real-time Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Orders */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? (
                      <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.total || 0
                    )}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                All time
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {loading ? (
                      <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.pending || 0
                    )}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              {(stats.pending || 0) > 0 && (
                <div className="mt-2 flex items-center text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Needs attention
                </div>
              )}
            </div>

            {/* In Progress Orders */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? (
                      <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      ((stats.receiving || 0) + (stats.picking || 0) + (stats.packing || 0) + (stats.shipping || 0))
                    )}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-purple-600">
                <Package className="w-4 h-4 mr-1" />
                Processing
              </div>
            </div>

            {/* Shipped Orders */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? (
                      <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      (stats.shipped || 0) + (stats.delivered || 0)
                    )}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Fulfilled
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions for Managers */}
        {canManageOrders && (
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">Quick Actions:</p>
            <Link
              to="/orders?status=pending"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Review Pending ({stats?.pending || 0})
            </Link>
            <Link
              to="/orders?status=shipped"
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Track Shipments ({stats?.shipped || 0})
            </Link>
            <Link
              to="/analytics"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View Analytics
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const OrdersHeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-56 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-28 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-2">
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default OrdersHeader; 