import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import useOrderWebSocket from '../../hooks/useOrderWebSocket';
import workflowOrderService from '../../services/workflowOrderService';
import OrderCard from './OrderCard';
import OrderDetailsModal from './OrderDetailsModal';
import OptimalPathModal from './OptimalPathModal';
import { toast } from 'react-hot-toast';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Search,
  Package,
  User,
  History,
  Clock,
  Play,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin
} from 'lucide-react';

const WorkflowDashboard = ({ 
  title = "Workflow Dashboard",
  role = "User",
  iconComponent: IconComponent = Package,
  gradientColors = "from-blue-500 to-purple-600"
}) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const userRole = currentUser?.role || role;
  const workerId = currentUser?.workerID || currentUser?.id || currentUser?.username;
  
  // Tab Management
  const [activeTab, setActiveTab] = useState('available');
  
  // State for each tab
  const [availableOrders, setAvailableOrders] = useState([]);
  const [workingOrders, setWorkingOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOptimalPath, setShowOptimalPath] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // WebSocket
  const { isConnected, connectionStatus, connectionError, addOrderUpdateListener } = useOrderWebSocket();

  // Tab Configuration
  const tabs = [
    {
      id: 'available',
      label: 'Available',
      icon: Package,
      count: availableOrders.length,
      color: 'blue'
    },
    {
      id: 'working', 
      label: 'Working',
      icon: Play,
      count: workingOrders.length,
      color: 'orange'
    },
    {
      id: 'history',
      label: 'History', 
      icon: History,
      count: historyOrders.length,
      color: 'gray'
    }
  ];

  // Get role-specific statuses
  const getRoleStatuses = useCallback(() => {
    return workflowOrderService.getRoleStatuses(userRole);
  }, [userRole]);

  // Fetch orders for all tabs
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const roleStatuses = getRoleStatuses();
      
      // Fetch all orders for this role
      const result = await workflowOrderService.getOrdersByRole(userRole, roleStatuses);
      
      if (result.success) {
        const allOrders = result.data;
        
        // Separate orders into different tabs
        const available = [];
        const working = [];
        const history = [];
        
        allOrders.forEach(order => {
          const orderId = order.order_id || order.orderID;
          const assignedWorker = order.assigned_worker;
          const status = order.order_status;
          
          // Check if order is assigned to current user
          const isAssignedToMe = assignedWorker && assignedWorker.toString() === workerId?.toString();
          
          console.log(`📋 Categorizing Order #${orderId}:`, {
            status,
            assignedWorker,
            isAssignedToMe,
            workerId,
            roleStatuses
          });
          
          // Determine which tab the order belongs to based on step-by-step workflow
          if (roleStatuses.includes(status)) {
            // This role can work on this status
            
            if (isAssignedToMe) {
              // Order is assigned to me - goes to working tab
              console.log(`→ Working: Order #${orderId} assigned to me (${status})`);
              working.push(order);
            } else {
              // Order is not assigned to me - available to take
              console.log(`→ Available: Order #${orderId} available for ${userRole} (${status})`);
              available.push(order);
            }
          } else {
            // Check if this role previously worked on this order (for history)
            const wasWorkedOnByMe = orderWasProcessedByRole(order, userRole, workerId);
            
            if (wasWorkedOnByMe) {
              console.log(`→ History: Order #${orderId} was processed by ${userRole}`);
              history.push(order);
            } else {
              console.log(`→ Ignored: Order #${orderId} not relevant for ${userRole} (status: ${status})`);
            }
          }
        });
        
        setAvailableOrders(available);
        setWorkingOrders(working);
        setHistoryOrders(history);
        
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [userRole, workerId, getRoleStatuses]);

  // Helper: Check if order update is relevant to current user's role
  const isOrderUpdateRelevant = useCallback((updateData) => {
    const { orderId, newStatus, oldStatus, updateType } = updateData;
    const roleStatuses = getRoleStatuses();
    
    // Check if this update is relevant to the current role
    if (updateType === 'status_change') {
      // Show notification if:
      // 1. New status is something this role can work on (order coming in)
      // 2. Old status was something this role was working on (order leaving)
      const isNewStatusRelevant = roleStatuses.includes(newStatus);
      const isOldStatusRelevant = oldStatus && roleStatuses.includes(oldStatus);
      
      return isNewStatusRelevant || isOldStatusRelevant;
    }
    
    if (updateType === 'assignment') {
      // Show assignment notifications if the order is in a status this role works on
      const { orderData } = updateData;
      return orderData && roleStatuses.includes(orderData.order_status);
    }
    
    return false;
  }, [getRoleStatuses]);

  // Helper: Get role-specific notification message
  const getRoleNotificationMessage = useCallback((updateData) => {
    const { orderId, newStatus, oldStatus, updateType } = updateData;
    const roleStatuses = getRoleStatuses();
    
    if (updateType === 'status_change') {
      if (roleStatuses.includes(newStatus)) {
        // Order is coming to this role
        return `Order #${orderId} is now ${newStatus} - available to work on`;
      } else if (oldStatus && roleStatuses.includes(oldStatus)) {
        // Order is leaving this role
        return `Order #${orderId} completed - moved to ${newStatus}`;
      }
    }
    
    if (updateType === 'assignment') {
      return `Order #${orderId} assigned to you`;
    }
    
    return `Order #${orderId} updated`;
  }, [getRoleStatuses]);

  // Helper: Add notification to both toast and notification center
  const addOrderNotification = useCallback((updateData) => {
    if (!isOrderUpdateRelevant(updateData)) return;
    
    const message = getRoleNotificationMessage(updateData);
    const { orderId, newStatus, updateType } = updateData;
    
    // Add to toast (immediate feedback)
    toast.success(message);
    
    // Add to notification center (persistent)
    addNotification({
      title: 'Order Update',
      message: message,
      type: 'success',
      role: userRole,
      orderId: orderId,
      status: newStatus,
      updateType: updateType,
      duration: 5000, // 8 seconds
      autoHide: true
    });
  }, [isOrderUpdateRelevant, getRoleNotificationMessage, addNotification, userRole]);

  // Handle targeted order updates from WebSocket
  const handleOrderUpdate = useCallback((updateData) => {
    console.log('Handling targeted order update:', updateData);
    console.log('Current user context:', { userRole, workerId });
    
    // Filter notifications based on role relevance
    if (!isOrderUpdateRelevant(updateData)) {
      console.log('Order update not relevant to current role, skipping notification');
      // Still process the update for data consistency, but no notification
    }
    
    if (updateData.updateType === 'status_change') {
      const { orderId, newStatus, orderData } = updateData;
      const roleStatuses = getRoleStatuses();
      
      console.log('📊 Status change detected:', {
        orderId,
        newStatus,
        roleStatuses,
        orderData: orderData ? 'present' : 'missing'
      });
      
      // Remove order from all tabs first
      setAvailableOrders(prev => {
        const filtered = prev.filter(order => (order.order_id || order.orderID) !== orderId);
        console.log(`🗂️ Removed Order #${orderId} from Available (${prev.length} → ${filtered.length})`);
        return filtered;
      });
      setWorkingOrders(prev => {
        const filtered = prev.filter(order => (order.order_id || order.orderID) !== orderId);
        console.log(`🗂️ Removed Order #${orderId} from Working (${prev.length} → ${filtered.length})`);
        return filtered;
      });
      setHistoryOrders(prev => {
        const filtered = prev.filter(order => (order.order_id || order.orderID) !== orderId);
        console.log(`🗂️ Removed Order #${orderId} from History (${prev.length} → ${filtered.length})`);
        return filtered;
      });
      
      // Add to appropriate tab if relevant to this role
      if (orderData && roleStatuses.includes(newStatus)) {
        const updatedOrder = { ...orderData, order_status: newStatus };
        const assignedWorker = updatedOrder.assigned_worker;
        const isAssignedToMe = assignedWorker && assignedWorker.toString() === workerId?.toString();
        
        console.log('🎯 Order relevant to role:', {
          assignedWorker,
          isAssignedToMe,
          workerId
        });
        
        if (userRole === 'Manager' && newStatus === 'pending') {
          // Special case: Managers always see pending orders in Available tab
          setAvailableOrders(prev => {
            const newOrders = [...prev, updatedOrder];
            console.log(`✅ Added Order #${orderId} to Available (Manager/pending) (${prev.length} → ${newOrders.length})`);
            return newOrders;
          });
          
          // Add notification to both toast and notification center
          addOrderNotification(updateData);
        } else if (isAssignedToMe) {
          setWorkingOrders(prev => {
            const newOrders = [...prev, updatedOrder];
            console.log(`✅ Added Order #${orderId} to Working (${prev.length} → ${newOrders.length})`);
            return newOrders;
          });
          
          // Add notification to both toast and notification center
          addOrderNotification(updateData);
        } else if (!assignedWorker) {
          setAvailableOrders(prev => {
            const newOrders = [...prev, updatedOrder];
            console.log(`✅ Added Order #${orderId} to Available (${prev.length} → ${newOrders.length})`);
            return newOrders;
          });
          
          // Add notification to both toast and notification center
          addOrderNotification(updateData);
        } else {
          console.log(`➡️ Order #${orderId} assigned to someone else (${assignedWorker})`);
        }
      } else {
        // Order moved out of this role's scope - add to history
        if (orderData) {
          setHistoryOrders(prev => {
            const newOrders = [...prev, { ...orderData, order_status: newStatus }];
            console.log(`📚 Added Order #${orderId} to History (${prev.length} → ${newOrders.length})`);
            return newOrders;
          });
          
          // Add notification to both toast and notification center
          addOrderNotification(updateData);
        }
      }
    } else if (updateData.updateType === 'assignment') {
      const { orderId, workerId: assignedWorkerId } = updateData;
      const isAssignedToMe = assignedWorkerId?.toString() === workerId?.toString();
      
      console.log('👤 Assignment update:', {
        orderId,
        assignedWorkerId,
        isAssignedToMe,
        currentWorkerId: workerId
      });
      
      // Move order between available and working tabs
      if (isAssignedToMe) {
        // Move from available to working
        const orderToMove = availableOrders.find(order => 
          (order.order_id || order.orderID) === orderId
        );
        if (orderToMove) {
          setAvailableOrders(prev => prev.filter(order => 
            (order.order_id || order.orderID) !== orderId
          ));
          setWorkingOrders(prev => [...prev, { ...orderToMove, assigned_worker: assignedWorkerId }]);
          
          // Add notification to both toast and notification center
          addOrderNotification(updateData);
          
          console.log(`✅ Moved Order #${orderId} from Available to Working`);
        } else {
          console.log(`❓ Order #${orderId} not found in Available tab`);
        }
      }
    }
  }, [userRole, workerId, getRoleStatuses, availableOrders, addOrderNotification]);

  // Setup WebSocket listener
  useEffect(() => {
    const cleanup = addOrderUpdateListener(handleOrderUpdate);
    return cleanup;
  }, [addOrderUpdateListener, handleOrderUpdate]);

  // Handle order action (take/complete)
  const handleOrderAction = async (order) => {
    const orderId = order.order_id || order.orderID;
    setProcessingOrderId(orderId);
    
    try {
      let result;
      const currentStatus = order.order_status;
      const isInWorkingTab = workingOrders.some(o => (o.order_id || o.orderID) === orderId);
      
      if (isInWorkingTab) {
        // Complete action - move order to next status
        switch (userRole) {
          case 'Manager':
            if (currentStatus === 'pending') {
              result = await workflowOrderService.confirmOrder(orderId);
            }
            break;
          case 'ReceivingClerk':
          case 'receiving_clerk':
            if (currentStatus === 'processing') {
              result = await workflowOrderService.processToPickingOrder(orderId);
            }
            break;
          case 'Picker':
            if (currentStatus === 'picking') {
              result = await workflowOrderService.completePickingOrder(orderId, workerId);
            }
            break;
          case 'Packer':
            if (currentStatus === 'packing') {
              result = await workflowOrderService.completePackingOrder(orderId, workerId);
            }
            break;
          case 'Driver':
            if (currentStatus === 'packed' || currentStatus === 'shipping') {
              result = await workflowOrderService.takeForDelivery(orderId, workerId);
            } else if (currentStatus === 'shipped') {
              result = await workflowOrderService.markAsDelivered(orderId);
            }
            break;
        }
        
        if (result?.success) {
          const actionLabel = workflowOrderService.getRoleActionLabel(currentStatus, userRole);
          toast.success(`Order #${orderId} ${actionLabel.toLowerCase()}d`);
        } else {
          toast.error(result?.error || 'Failed to process order');
        }
      } else {
        // Take action - determine appropriate action based on role and status
        if (userRole === 'Manager' && currentStatus === 'pending') {
          // Manager taking pending order should confirm it
          result = await workflowOrderService.confirmOrder(orderId);
          
          if (result?.success) {
            toast.success(`Order #${orderId} confirmed and moved to processing`);
          } else {
            toast.error(result?.error || 'Failed to confirm order');
          }
        } else {
          // For other roles, just assign order to current worker (no status change)
          result = await workflowOrderService.assignOrderToWorker(orderId, workerId);
          
          if (result?.success) {
            toast.success(`Order #${orderId} assigned to you`);
            // The WebSocket will handle moving the order to working tab
          } else {
            toast.error(result?.error || 'Failed to take order');
          }
        }
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handle optimal path (AI feature for pickers)
  const handleOptimalPath = async (order) => {
    try {
      const result = await workflowOrderService.getOptimalPickingPath(order.order_id || order.orderID);
      if (result.success) {
        setShowOptimalPath({
          order,
          pathData: result.data
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to get optimal path');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllOrders();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Get current tab orders with search filter
  const getCurrentTabOrders = () => {
    let orders = [];
    switch (activeTab) {
      case 'available':
        orders = availableOrders;
        break;
      case 'working':
        orders = workingOrders;
        break;
      case 'history':
        orders = historyOrders;
        break;
      default:
        orders = [];
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return orders.filter(order => {
        const orderId = (order.order_id || order.orderID).toString().toLowerCase();
        const customerName = (order.customer_name || '').toLowerCase();
        const status = (order.order_status || '').toLowerCase();
        
        return orderId.includes(search) || 
               customerName.includes(search) || 
               status.includes(search);
      });
    }
    
    return orders;
  };

  const currentTabOrders = getCurrentTabOrders();
  const isHistoryTab = activeTab === 'history';

  // Helper: Check if order was previously processed by this role
  const orderWasProcessedByRole = (order, userRole, workerId) => {
    // Check if this role previously worked on this order by looking at:
    // 1. Status history - if order has passed through this role's status
    // 2. Assignment history - if order was assigned to this worker
    
    const roleStatusMap = {
      'Manager': 'pending',
      'ReceivingClerk': 'processing',
      'receiving_clerk': 'processing',
      'Picker': 'picking',
      'Packer': 'packing',
      'Driver': 'shipping',
    };

    const roleStatus = roleStatusMap[userRole];
    if (!roleStatus) return false;

    // Check if order has progressed past this role's status
    const statusOrder = ['pending', 'processing', 'picking', 'packing', 'packed', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const roleStatusIndex = statusOrder.indexOf(roleStatus);

    // If current status is after this role's status, then this role worked on it
    return currentStatusIndex > roleStatusIndex;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors} text-white shadow-lg`}>
                <IconComponent className="h-6 w-6" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">
                  {userRole} Dashboard - {availableOrders.length + workingOrders.length} active orders
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus}
                </span>
                {connectionError && (
                  <span className="text-xs text-red-500 ml-2">
                    ({connectionError})
                  </span>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`mr-2 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                  <span className={`ml-2 py-1 px-2 rounded-full text-xs ${
                    isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} orders...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading orders...</span>
          </div>
        ) : currentTabOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching orders found' : `No ${activeTab} orders`}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : activeTab === 'available' 
                  ? 'No orders available to process'
                  : activeTab === 'working'
                    ? 'No orders currently assigned to you'
                    : 'No order history available'
              }
            </p>
          </div>
        ) : (
          <>
            {/* History Tab - List View */}
            {isHistoryTab ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                  <p className="text-sm text-gray-600">Previously processed orders</p>
                </div>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTabOrders.map((order) => (
                        <tr key={order.order_id || order.orderID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.order_id || order.orderID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer_name || `Customer ${order.customerID}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                              ${order.order_status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : order.order_status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                              {order.order_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Available/Working Tabs - Card View */
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentTabOrders.map((order) => (
                  <OrderCard
                    key={order.order_id || order.orderID}
                    order={order}
                    userRole={userRole}
                    onAction={handleOrderAction}
                    onViewDetails={setSelectedOrder}
                    isProcessing={processingOrderId === (order.order_id || order.orderID)}
                    showOptimalPath={userRole === 'Picker' && activeTab === 'working'}
                    onOptimalPath={handleOptimalPath}
                    actionContext={activeTab} // 'available' or 'working'
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
      
      {showOptimalPath && (
        <OptimalPathModal
          order={showOptimalPath.order}
          pathData={showOptimalPath.pathData}
          onClose={() => setShowOptimalPath(null)}
        />
      )}
    </div>
  );
};

export default WorkflowDashboard; 