import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowPathIcon,
  PlusIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon, // Replaced ClipboardCheckIcon with ClipboardDocumentCheckIcon
  ArchiveBoxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Receiving = () => {
  const { currentUser } = useAuth();
  const [receivingOrders, setReceivingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status badge component
  const StatusBadge = ({ status }) => {
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    
    switch (status) {
      case 'scheduled':
        classes += "bg-blue-100 text-blue-800";
        break;
      case 'in_progress':
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case 'completed':
        classes += "bg-green-100 text-green-800";
        break;
      case 'issue':
        classes += "bg-red-100 text-red-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }
    
    return <span className={classes}>{status.replace('_', ' ')}</span>;
  };

  useEffect(() => {
    const fetchReceivingOrders = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For now, we'll just simulate a network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock receiving orders data
        const mockReceivingOrders = [
          { 
            id: 1, 
            poNumber: 'PO-10045', 
            supplier: 'Global Electronics Ltd.', 
            scheduledDate: '2025-05-02T10:00:00',
            items: 12,
            status: 'scheduled',
            dock: 'Dock A'
          },
          { 
            id: 2, 
            poNumber: 'PO-10046', 
            supplier: 'Premium Office Supplies', 
            scheduledDate: '2025-05-01T14:30:00',
            items: 8,
            status: 'in_progress',
            dock: 'Dock B'
          },
          { 
            id: 3, 
            poNumber: 'PO-10047', 
            supplier: 'Tech Components Inc.', 
            scheduledDate: '2025-05-01T11:00:00',
            items: 5,
            status: 'completed',
            dock: 'Dock C'
          },
          { 
            id: 4, 
            poNumber: 'PO-10048', 
            supplier: 'Industrial Parts Co.', 
            scheduledDate: '2025-05-03T09:30:00',
            items: 15,
            status: 'scheduled',
            dock: 'Dock A'
          },
          { 
            id: 5, 
            poNumber: 'PO-10049', 
            supplier: 'Central Distribution', 
            scheduledDate: '2025-05-01T16:00:00',
            items: 7,
            status: 'issue',
            dock: 'Dock D',
            issue: 'Missing 2 items'
          },
        ];
        
        setReceivingOrders(mockReceivingOrders);
      } catch (err) {
        console.error('Error fetching receiving orders:', err);
        setError('Failed to load receiving orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceivingOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders = receivingOrders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setReceivingOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? {...order, status: newStatus} 
          : order
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receiving</h1>
          <p className="text-gray-600 mt-1">Manage incoming inventory and purchase orders</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setLoading(true)}
            className="btn btn-icon btn-secondary"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Schedule Delivery
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('all')}
        >
          All Orders
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('scheduled')}
        >
          Scheduled
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'completed' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'issue' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('issue')}
        >
          Issues
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No receiving orders found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${order.status === 'issue' ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.poNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.supplier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.scheduledDate).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.dock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                        {order.issue && (
                          <div className="mt-1 flex items-center text-xs text-red-600">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            {order.issue}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {order.status === 'scheduled' && (
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                          >
                            Start Receiving
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-900 mr-3"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                            >
                              Complete
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 mr-3"
                              onClick={() => updateOrderStatus(order.id, 'issue')}
                            >
                              Report Issue
                            </button>
                          </>
                        )}
                        <button className="text-primary-600 hover:text-primary-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <TruckIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Scheduled Today</div>
              <div className="text-2xl font-semibold">3</div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">In Progress</div>
              <div className="text-2xl font-semibold">1</div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Issues</div>
              <div className="text-2xl font-semibold">1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receiving;