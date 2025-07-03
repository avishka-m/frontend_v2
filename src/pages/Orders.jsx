import { ShoppingCart, Plus, Search, Filter, Eye } from 'lucide-react';

const Orders = () => {
  const orders = [
    { id: 'ORD-001', customer: 'John Doe', status: 'pending', total: '$150.00', date: '2025-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', status: 'processing', total: '$275.50', date: '2025-01-15' },
    { id: 'ORD-003', customer: 'Bob Johnson', status: 'shipped', total: '$89.99', date: '2025-01-14' },
    { id: 'ORD-004', customer: 'Alice Wilson', status: 'delivered', total: '$345.00', date: '2025-01-14' },
    { id: 'ORD-005', customer: 'Charlie Brown', status: 'pending', total: '$125.75', date: '2025-01-13' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Order</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
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
                  Total
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingCart className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
