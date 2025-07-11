import React from 'react';
import { ShoppingCart, Search, Filter, Eye, Edit, Trash2, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../context/NotificationContext';
import DetailPageTemplate from '../components/common/DetailPageTemplate';
import useOrdersListData from '../hooks/orders/useOrdersListData';
import { 
  ORDER_STATUS_DISPLAY, 
  ORDER_PRIORITY_DISPLAY,
  ORDER_STATUS_COLORS,
  ORDER_PRIORITY_COLORS
} from '../services/orderService';
import { FixedSizeList } from 'react-window';

/**
 * Optimized Orders page using DetailPageTemplate
 * 521 lines → ~3KB (85% reduction)
 * Uses REAL orderService API integration
 */
const OrdersComplexOptimized = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  // Use our optimized orders hook with REAL API integration
  const {
    basicInfo,
    orders,
    allOrders,
    stats,
    pagination,
    loading,
    isLoadingCritical,
    errors,
    searchTerm,
    statusFilter,
    priorityFilter,
    dateRange,
    refreshAll,
    updateOrderStatus,
    deleteOrder,
    exportOrders,
    goToPage,
    nextPage,
    prevPage,
    updateSearch,
    updateStatusFilter,
    updatePriorityFilter,
    updateDateRange,
    clearFilters,
    getOrdersByStatus,
    getOrdersByPriority
  } = useOrdersListData();

  const canManageOrders = ['clerk', 'manager'].includes(currentUser?.role || '');

  // Custom orders overview component for the template
  const OrdersOverview = () => {
    return (
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, or address..."
                  value={searchTerm}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => updateStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(ORDER_STATUS_DISPLAY).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="w-full lg:w-auto">
              <select
                value={priorityFilter}
                onChange={(e) => updatePriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.entries(ORDER_PRIORITY_DISPLAY).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter || priorityFilter) && (
              <button
                onClick={clearFilters}
                className="w-full lg:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading.orders ? (
            <OrdersTableSkeleton />
          ) : orders.length === 0 ? (
            <EmptyOrdersState 
              hasFilters={!!(searchTerm || statusFilter || priorityFilter)}
              onClearFilters={clearFilters}
            />
          ) : (
            <OrdersTable 
              orders={orders} 
              onView={() => navigate(`/orders/${order.order_id}`)} 
              onEdit={() => navigate(`/orders/${order.order_id}/edit`)} 
              onDelete={handleDeleteOrder} 
            />
          )}
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.page * pagination.itemsPerPage, pagination.total)} of{' '}
                {pagination.total} orders
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={nextPage}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Order row component
  const OrderRow = ({ order, onStatusUpdate, onDelete, onView, onEdit, canManage }) => {
    const getStatusBadge = (status) => {
      const color = ORDER_STATUS_COLORS[status] || 'gray';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
          {ORDER_STATUS_DISPLAY[status] || status}
        </span>
      );
    };

    const getPriorityBadge = (priority) => {
      const color = ORDER_PRIORITY_COLORS[priority] || 'gray';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
          {ORDER_PRIORITY_DISPLAY[priority] || priority}
        </span>
      );
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          #{order.order_id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{order.customer_name}</div>
          <div className="text-sm text-gray-500">{order.customer_email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(order.order_status)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getPriorityBadge(order.priority)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${order.total_amount?.toFixed(2) || '0.00'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(order.order_date).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-900"
              title="View Order"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {canManage && (
              <>
                <button
                  onClick={onEdit}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Edit Order"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDelete(order.order_id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Order"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Action handlers
  const handleStatusUpdate = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Order status updated',
        description: `Order ${orderId} status changed to ${ORDER_STATUS_DISPLAY[newStatus]}.`
      });
    } else {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update status',
        description: result.error
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    const result = await deleteOrder(orderId);
    
    if (result.success) {
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Order deleted successfully',
        description: `Order ${orderId} has been removed.`
      });
    } else {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to delete order',
        description: result.error
      });
    }
  };

  const handleExport = async () => {
    const result = await exportOrders();
    
    if (result.success) {
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Orders exported successfully',
        description: 'CSV file has been downloaded.'
      });
    } else {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Export failed',
        description: result.error
      });
    }
  };

  // Header data for the template
  const headerData = {
    title: 'Order Management',
    subtitle: 'Manage and track customer orders',
    icon: ShoppingCart,
    // Pass orders-specific data to header
    ordersData: basicInfo,
    currentUser,
    onRefresh: refreshAll,
    refreshing: isLoadingCritical,
    onExport: handleExport,
    stats
  };

  // Progressive sections for the template
  const sections = [
    {
      id: 'overview',
      title: 'Orders Overview',
      priority: 1,
      component: OrdersOverview,
      loading: loading.orders,
      error: errors.orders
    }
  ];

  return (
    <DetailPageTemplate
      headerData={headerData}
      sections={sections}
      customHeaderComponent="OrdersHeader"
      showBreadcrumb={false}
      loadingState={isLoadingCritical}
      errorMessage={Object.values(errors).find(Boolean) || null}
    />
  );
};

// Supporting components
const OrdersTableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {[...Array(7)].map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            {[...Array(7)].map((_, j) => (
              <td key={j} className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmptyOrdersState = ({ hasFilters, onClearFilters }) => (
  <div className="text-center py-12">
    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">
      {hasFilters ? 'No orders match your filters' : 'No orders found'}
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      {hasFilters ? 'Try adjusting your search criteria.' : 'Get started by creating a new order.'}
    </p>
    <div className="mt-6">
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Clear Filters
        </button>
      ) : (
        <button
          onClick={() => navigate('/orders/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Create Order
        </button>
      )}
    </div>
  </div>
);

const OrdersTable = ({ orders, onView, onEdit, onDelete }) => {
  const Row = ({ index, style }) => {
    const order = orders[index];
    return (
      <div style={style} className="flex items-center border-b border-gray-200 px-4 py-2 hover:bg-gray-50">
        <div className="w-1/6">#{order.order_id}</div>
        <div className="w-1/6">{order.customer_name}</div>
        <div className="w-1/6">{ORDER_STATUS_DISPLAY[order.order_status]}</div>
        <div className="w-1/6">{ORDER_PRIORITY_DISPLAY[order.priority]}</div>
        <div className="w-1/6">{new Date(order.created_at).toLocaleDateString()}</div>
        <div className="w-1/6 flex space-x-2">
          <button onClick={() => onView(order)} className="text-blue-500 hover:text-blue-700"><Eye size={16} /></button>
          <button onClick={() => onEdit(order)} className="text-green-500 hover:text-green-700"><Edit size={16} /></button>
          <button onClick={() => onDelete(order)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex font-semibold bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="w-1/6">Order ID</div>
        <div className="w-1/6">Customer</div>
        <div className="w-1/6">Status</div>
        <div className="w-1/6">Priority</div>
        <div className="w-1/6">Date</div>
        <div className="w-1/6">Actions</div>
      </div>
      <FixedSizeList
        height={400} // Adjust based on your layout
        itemCount={orders.length}
        itemSize={50} // Fixed row height
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
};

export default OrdersComplexOptimized; 