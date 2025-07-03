import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowPathIcon,
  TruckIcon,
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Shipping = () => {
  const { currentUser } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status badge component
  const StatusBadge = ({ status }) => {
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    
    switch (status) {
      case 'ready':
        classes += "bg-blue-100 text-blue-800";
        break;
      case 'in_transit':
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case 'delivered':
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
    const fetchShipments = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For now, we'll just simulate a network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock shipments data
        const mockShipments = [
          { 
            id: 1, 
            orderNumber: 'ORD-1001', 
            customer: 'Acme Corporation', 
            address: '123 Business Ave, New York, NY 10001',
            items: 5,
            status: 'ready',
            assignedTo: null,
            vehicle: null,
            estimatedDelivery: '2025-05-02T14:00:00',
            shippingMethod: 'Express',
            specialInstructions: 'Deliver to loading dock in the back'
          },
          { 
            id: 2, 
            orderNumber: 'ORD-1002', 
            customer: 'TechCorp Inc.', 
            address: '456 Tech Blvd, San Francisco, CA 94107',
            items: 2,
            status: 'in_transit',
            assignedTo: 'David Wilson',
            vehicle: 'Van #103',
            estimatedDelivery: '2025-05-01T16:30:00',
            shippingMethod: 'Standard',
            departureTime: '2025-05-01T08:45:00'
          },
          { 
            id: 3, 
            orderNumber: 'ORD-1003', 
            customer: 'Global Industries', 
            address: '789 Industrial Pkwy, Chicago, IL 60607',
            items: 8,
            status: 'ready',
            assignedTo: null,
            vehicle: null,
            estimatedDelivery: '2025-05-03T11:00:00',
            shippingMethod: 'Express'
          },
          { 
            id: 4, 
            orderNumber: 'ORD-1004', 
            customer: 'Pinnacle Group', 
            address: '321 Corporate Dr, Boston, MA 02110',
            items: 3,
            status: 'delivered',
            assignedTo: 'David Wilson',
            vehicle: 'Van #103',
            estimatedDelivery: '2025-05-01T12:00:00',
            shippingMethod: 'Standard',
            deliveryTime: '2025-05-01T11:45:00',
            signedBy: 'J. Roberts'
          },
          { 
            id: 5, 
            orderNumber: 'ORD-1005', 
            customer: 'Summit Enterprises', 
            address: '555 Summit Ave, Seattle, WA 98101',
            items: 6,
            status: 'issue',
            assignedTo: 'David Wilson',
            vehicle: 'Van #103',
            estimatedDelivery: '2025-05-01T14:30:00',
            shippingMethod: 'Express',
            issue: 'Customer not available at delivery address'
          },
        ];
        
        setShipments(mockShipments);
      } catch (err) {
        console.error('Error fetching shipments:', err);
        setError('Failed to load shipments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Filter shipments based on status
  const filteredShipments = shipments.filter(shipment => {
    if (statusFilter === 'all') return true;
    return shipment.status === statusFilter;
  });

  // Handle assigning a shipment to yourself
  const handleAssignShipment = (shipmentId) => {
    setShipments(prevShipments => 
      prevShipments.map(shipment => 
        shipment.id === shipmentId 
          ? {
              ...shipment, 
              status: 'in_transit', 
              assignedTo: currentUser?.username,
              vehicle: currentUser?.role === 'Driver' ? 'Van #103' : null,
              departureTime: new Date().toISOString()
            } 
          : shipment
      )
    );
  };

  // Handle completing a delivery
  const handleCompleteDelivery = (shipmentId) => {
    setShipments(prevShipments => 
      prevShipments.map(shipment => 
        shipment.id === shipmentId 
          ? {
              ...shipment, 
              status: 'delivered',
              deliveryTime: new Date().toISOString(),
              signedBy: 'Customer'
            } 
          : shipment
      )
    );
  };

  // Handle reporting an issue
  const handleReportIssue = (shipmentId) => {
    setShipments(prevShipments => 
      prevShipments.map(shipment => 
        shipment.id === shipmentId 
          ? {
              ...shipment, 
              status: 'issue',
              issue: 'Delivery issue reported'
            } 
          : shipment
      )
    );
  };

  // Get shipment counts for stats
  const getShipmentCounts = () => {
    const counts = {
      ready: 0,
      in_transit: 0,
      delivered: 0,
      issue: 0
    };

    shipments.forEach(shipment => {
      if (counts[shipment.status] !== undefined) {
        counts[shipment.status]++;
      }
    });

    return counts;
  };

  const shipmentCounts = getShipmentCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
          <p className="text-gray-600 mt-1">Manage and track customer deliveries</p>
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
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Scan Shipment
          </button>
          {currentUser?.role === 'Manager' && (
            <button className="btn btn-primary">
              <MapIcon className="h-5 w-5 mr-2" />
              View Routes
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('all')}
        >
          All Shipments
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'ready' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('ready')}
        >
          Ready
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'in_transit' ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('in_transit')}
        >
          In Transit
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('delivered')}
        >
          Delivered
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <TruckIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Ready</div>
              <div className="text-lg font-semibold">{shipmentCounts.ready}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
              <MapIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">In Transit</div>
              <div className="text-lg font-semibold">{shipmentCounts.in_transit}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Delivered</div>
              <div className="text-lg font-semibold">{shipmentCounts.delivered}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Issues</div>
              <div className="text-lg font-semibold">{shipmentCounts.issue}</div>
            </div>
          </div>
        </div>
      </div>

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
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Delivery
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver / Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No shipments found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className={`hover:bg-gray-50 ${shipment.status === 'issue' ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.orderNumber}</div>
                        <div className="text-xs text-gray-500">{shipment.shippingMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shipment.customer}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{shipment.address}</div>
                        {shipment.specialInstructions && (
                          <div className="text-xs text-gray-500 mt-1">
                            Note: {shipment.specialInstructions}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={shipment.status} />
                        {shipment.issue && (
                          <div className="mt-1 text-xs text-red-600">
                            {shipment.issue}
                          </div>
                        )}
                        {shipment.deliveryTime && (
                          <div className="mt-1 text-xs text-gray-500">
                            Delivered: {new Date(shipment.deliveryTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(shipment.estimatedDelivery).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shipment.assignedTo || 'Unassigned'}</div>
                        {shipment.vehicle && (
                          <div className="text-xs text-gray-500">{shipment.vehicle}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {shipment.status === 'ready' && (
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => handleAssignShipment(shipment.id)}
                          >
                            Start Delivery
                          </button>
                        )}
                        {shipment.status === 'in_transit' && shipment.assignedTo === currentUser?.username && (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-900 mr-3"
                              onClick={() => handleCompleteDelivery(shipment.id)}
                            >
                              Complete
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 mr-3"
                              onClick={() => handleReportIssue(shipment.id)}
                            >
                              Report Issue
                            </button>
                          </>
                        )}
                        <button className="text-primary-600 hover:text-primary-900">
                          Details
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
    </div>
  );
};

export default Shipping;