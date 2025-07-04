import React from 'react';
import { Package } from 'lucide-react';
import OrderCard from './OrderCard';

const OrderList = ({ 
  orders, 
  showHistory, 
  onViewDetails, 
  onStartReceiving, 
  onCompleteReceiving, 
  processingOrder,
  searchTerm,
  onRefresh 
}) => {
  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.orderID.toString().includes(searchTerm) ||
    order.customerID.toString().includes(searchTerm) ||
    (order.items && order.items.some(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {showHistory ? 'Processed Orders History' : 'Active Orders for Receiving'}
            </h2>
            <p className="text-sm text-gray-600">
              {showHistory ? 
                `${filteredOrders.length} orders processed by you` : 
                `${filteredOrders.length} orders ready for receiving`
              }
            </p>
          </div>
          {!showHistory && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.orderID}
              order={order}
              onViewDetails={onViewDetails}
              onStartReceiving={onStartReceiving}
              onCompleteReceiving={onCompleteReceiving}
              processingOrder={processingOrder}
              showHistory={showHistory}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {showHistory ? 'No processed orders found' : 'No orders ready for receiving'}
            </p>
            <p className="text-sm">
              {showHistory 
                ? 'You haven\'t processed any orders yet.'
                : searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'New orders will appear here when they\'re ready for receiving.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
