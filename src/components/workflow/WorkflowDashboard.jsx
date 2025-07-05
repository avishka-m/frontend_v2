import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';
import WorkflowHeader from './WorkflowHeader';
import WorkflowStats from './WorkflowStats';
import WorkflowProgress from './WorkflowProgress';
import WorkflowTabs from './WorkflowTabs';
import WorkflowOrdersList from './WorkflowOrdersList';
import OrderDetailsModal from './OrderDetailsModal';
import { 
  Package,
  Clock,
  CheckCircle,
  Activity,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';

// Universal Workflow Dashboard Component
const WorkflowDashboard = ({
  role,
  title,
  iconComponent: IconComponent,
  gradientColors,
  themeColor,
  tabs,
  statusMapping,
  workflowActions
}) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState({});
  const [localActiveOrders, setLocalActiveOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowAnimation, setWorkflowAnimation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Initialize order states for each tab
  useEffect(() => {
    const initialOrders = {};
    tabs.forEach(tab => {
      initialOrders[tab.id] = [];
    });
    setOrders(initialOrders);
  }, [tabs]);

  // Fetch orders and organize by status
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orderService.getOrders();
      
      if (result && Array.isArray(result)) {
        const categorizedOrders = {};
        tabs.forEach(tab => {
          categorizedOrders[tab.id] = result.filter(order => 
            statusMapping[tab.id].includes(order.order_status)
          );
        });
        
        setOrders(categorizedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [tabs, statusMapping]);

  // Handle WebSocket messages with incremental updates
  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'order_update') {
      const { order_id, order_status, order_data } = message.data;
      
      setIsUpdating(true);
      setUpdateMessage(`Order #${order_id} updated`);
      
      // Check if this status is relevant to our workflow
      const relevantStatuses = Object.values(statusMapping).flat();
      
      if (order_data) {
        // Create the updated order object
        const updatedOrder = { ...order_data, order_status };
        
        // Find which tab the order currently belongs to
        let currentTab = null;
        Object.keys(orders).forEach(tabId => {
          if (orders[tabId].some(order => order.orderID === order_id)) {
            currentTab = tabId;
          }
        });
        
        // Also check local active orders
        const isInLocalActive = localActiveOrders.some(order => order.orderID === order_id);
        
        // Determine target tab for the new status
        const targetTab = Object.keys(statusMapping).find(tabId => 
          statusMapping[tabId].includes(order_status)
        );
        
        // Only update if this order is relevant to our workflow
        if (relevantStatuses.includes(order_status) || currentTab || isInLocalActive) {
          setOrders(prev => {
            const newOrders = { ...prev };
            
            // Remove order from current tab if it exists
            if (currentTab) {
              newOrders[currentTab] = newOrders[currentTab].map(order => 
                order.orderID === order_id ? updatedOrder : order
              );
            }
            
            // If status changed and order needs to move to a different tab
            if (targetTab && targetTab !== currentTab) {
              // Remove from current tab
              if (currentTab) {
                newOrders[currentTab] = newOrders[currentTab].filter(order => order.orderID !== order_id);
              }
              
              // Add to new tab (avoid duplicates)
              if (!newOrders[targetTab].some(order => order.orderID === order_id)) {
                newOrders[targetTab] = [...newOrders[targetTab], updatedOrder];
              }
            }
            
            return newOrders;
          });
          

          jbhbhdb
          // Update local active orders if the order is there
          if (isInLocalActive) {
            setLocalActiveOrders(prev =>  
              prev.map(order => 
                order.orderID === order_id ? updatedOrder : order
              )
            );
          }
          
          // Show success message only if it's a significant status change
          if (targetTab && targetTab !== currentTab) {
            toast.success(`Order #${order_id} moved to ${targetTab}`);
          }
        }
      }
      
      setTimeout(() => {
        setIsUpdating(false);
        setUpdateMessage('');
      }, 1500);
    }
  }, [statusMapping, orders, localActiveOrders]);

  // WebSocket connection
  const { connectionStatus, isConnected } = useWebSocket({
    autoConnect: true,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log(`WebSocket connected for ${role} dashboard`),
    onDisconnect: () => console.log('WebSocket disconnected'),
    onError: (error) => console.error('WebSocket error:', error)
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Generic workflow action handler
  const handleWorkflowAction = useCallback(async (actionId, order) => {
    console.log('🔄 Workflow action triggered:', { actionId, order });
    
    try {
      setProcessingOrder(order.orderID || order.order_id);
      
      const action = workflowActions[actionId];
      if (!action) {
        console.error('❌ Action not found:', actionId);
        toast.error('Action not found');
        return;
      }
      
      console.log('✅ Action found:', action);

      // Find the source tab
      let sourceTabId = null;
      Object.keys(orders).forEach(tabId => {
        const foundOrder = orders[tabId].find(o => 
          (o.orderID === order.orderID) || 
          (o.order_id === order.order_id) ||
          (o.orderID === order.order_id) ||
          (o.order_id === order.orderID)
        );
        if (foundOrder) {
          sourceTabId = tabId;
        }
      });

      if (!sourceTabId) {
        console.error('❌ Order not found in any tab:', order);
        toast.error('Order not found');
        return;
      }
      
      console.log('✅ Source tab found:', sourceTabId);

      // Handle local state transition first for immediate feedback
      if (action.localTransition) {
        console.log('🔄 Applying local transition:', action.localTransition);
        
        const { fromTab, toTab, newStatus } = action.localTransition;
        
        // Update order status locally
        const updatedOrder = { 
          ...order, 
          order_status: newStatus,
          status: newStatus // Also update the status field for compatibility
        };
        
        console.log('📝 Updated order:', updatedOrder);
        
        // Remove from source tab
        setOrders(prev => ({
          ...prev,
          [sourceTabId]: prev[sourceTabId].filter(o => 
            (o.orderID !== order.orderID) && 
            (o.order_id !== order.order_id) &&
            (o.orderID !== order.order_id) &&
            (o.order_id !== order.orderID)
          )
        }));
        
        // Move to local active orders temporarily if needed
        if (toTab && tabs.find(tab => tab.id === toTab)?.includeLocalActive) {
          console.log('📋 Adding to local active orders');
          setLocalActiveOrders(prev => [...prev, updatedOrder]);
          setActiveTab(toTab);
        }
        
        // Animation
        setWorkflowAnimation(toTab);
        setTimeout(() => setWorkflowAnimation(null), 1000);
        
        // Show immediate feedback
        toast.success(`${action.successMessage} - Processing...`);
      }

      // Try to make API call for persistent state change
      if (action.localTransition?.newStatus) {
        console.log('🌐 Making API call to update order status');
        
        try {
          // Use the existing orderService to update the order status
          const result = await orderService.updateOrderStatus(
            order.orderID || order.order_id, 
            action.localTransition.newStatus
          );
          
          console.log('✅ API call successful:', result);
          
          if (result) {
            toast.success(action.successMessage);
            
            // Refresh orders after a short delay to get the latest state
            setTimeout(() => {
              console.log('🔄 Refreshing orders...');
              fetchOrders();
            }, 1500);
          } else {
            console.warn('⚠️ API call returned no result');
            // If API call fails, revert the local changes
            toast.error(action.errorMessage + ' - Changes reverted');
            setTimeout(() => {
              fetchOrders();
            }, 500);
          }
        } catch (apiError) {
          console.error('❌ API Error:', apiError);
          
          // Check if it's a network error or server error
          if (apiError.response) {
            // Server responded with error
            toast.error(`${action.errorMessage} - Server error: ${apiError.response.status}`);
          } else if (apiError.request) {
            // Network error
            toast.error(`${action.errorMessage} - Network error. Working in offline mode.`);
            toast.success(action.successMessage + ' (local only)');
          } else {
            // Other error
            toast.error(`${action.errorMessage} - ${apiError.message}`);
          }
        }
      } else {
        // If no API endpoint, just show success for local changes
        console.log('ℹ️ No API call needed, local changes only');
        toast.success(action.successMessage);
      }
    } catch (error) {
      console.error(`❌ Error in workflow action ${actionId}:`, error);
      toast.error(action?.errorMessage || 'An error occurred');
      
      // Revert changes on error
      setTimeout(() => {
        console.log('🔄 Reverting changes...');
        fetchOrders();
      }, 500);
    } finally {
      setProcessingOrder(null);
    }
  }, [orders, workflowActions, fetchOrders, tabs, orderService]);

  // Get current orders for active tab
  const getCurrentOrders = useCallback(() => {
    const tabOrders = orders[activeTab] || [];
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    
    // Include local active orders if this is the active tab
    if (activeTabConfig?.includeLocalActive) {
      return [...tabOrders, ...localActiveOrders];
    }
    
    return tabOrders;
  }, [orders, activeTab, localActiveOrders, tabs]);

  // Filter orders based on search
  const filteredOrders = getCurrentOrders().filter(order => 
    order.order_id?.toString().includes(searchTerm) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items?.some(item => 
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate totals for each tab
  const getTabCounts = useCallback(() => {
    const counts = {};
    tabs.forEach(tab => {
      let count = orders[tab.id]?.length || 0;
      if (tab.includeLocalActive) {
        count += localActiveOrders.length;
      }
      counts[tab.id] = count;
    });
    return counts;
  }, [orders, localActiveOrders, tabs]);

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${themeColor}-600`}></div>
        <span className="ml-2 text-gray-600">Loading {title.toLowerCase()}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Component */}
      <WorkflowHeader
        title={title}
        currentUser={currentUser}
        IconComponent={IconComponent}
        gradientColors={gradientColors}
        isConnected={isConnected}
        tabCounts={tabCounts}
        tabs={tabs}
        isUpdating={isUpdating}
        updateMessage={updateMessage}
      />

      {/* Stats Cards Component */}
      <WorkflowStats
        tabs={tabs}
        tabCounts={tabCounts}
        themeColor={themeColor}
      />

      {/* Progress Indicator Component */}
      <WorkflowProgress
        title={title}
        tabs={tabs}
        tabCounts={tabCounts}
        workflowAnimation={workflowAnimation}
        themeColor={themeColor}
      />

      {/* Navigation Tabs Component */}
      <WorkflowTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabCounts={tabCounts}
        workflowAnimation={workflowAnimation}
        themeColor={themeColor}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={fetchOrders}
      />

      {/* Orders List Component */}
      <WorkflowOrdersList
        orders={filteredOrders}
        activeTab={activeTab}
        tabs={tabs}
        processingOrder={processingOrder}
        onWorkflowAction={handleWorkflowAction}
        onViewDetails={setSelectedOrder}
        themeColor={themeColor}
        searchTerm={searchTerm}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default WorkflowDashboard;
