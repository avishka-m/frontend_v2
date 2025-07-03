import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowPathIcon, 
  PlusIcon,
  UserPlusIcon,
  KeyIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const Workers = () => {
  const { currentUser } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  // Role badge component
  const RoleBadge = ({ role }) => {
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    
    switch (role) {
      case 'Manager':
        classes += "bg-purple-100 text-purple-800";
        break;
      case 'ReceivingClerk':
        classes += "bg-blue-100 text-blue-800";
        break;
      case 'Picker':
        classes += "bg-green-100 text-green-800";
        break;
      case 'Packer':
        classes += "bg-orange-100 text-orange-800";
        break;
      case 'Driver':
        classes += "bg-red-100 text-red-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }
    
    return <span className={classes}>{role}</span>;
  };

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For now, we'll just simulate a network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock workers data
        const mockWorkers = [
          { 
            id: 1, 
            name: 'John Smith', 
            username: 'jsmith', 
            email: 'john.smith@example.com', 
            phone: '555-1234', 
            role: 'Manager', 
            disabled: false,
            lastActive: '2025-05-01T09:30:00'
          },
          { 
            id: 2, 
            name: 'Maria Garcia', 
            username: 'mgarcia', 
            email: 'maria.garcia@example.com', 
            phone: '555-2345', 
            role: 'ReceivingClerk', 
            disabled: false,
            lastActive: '2025-05-01T08:45:00'
          },
          { 
            id: 3, 
            name: 'Robert Johnson', 
            username: 'rjohnson', 
            email: 'robert.johnson@example.com', 
            phone: '555-3456', 
            role: 'Picker', 
            disabled: false,
            lastActive: '2025-05-01T10:15:00'
          },
          { 
            id: 4, 
            name: 'Sarah Lee', 
            username: 'slee', 
            email: 'sarah.lee@example.com', 
            phone: '555-4567', 
            role: 'Packer', 
            disabled: true,
            lastActive: '2025-04-28T16:20:00'
          },
          { 
            id: 5, 
            name: 'David Wilson', 
            username: 'dwilson', 
            email: 'david.wilson@example.com', 
            phone: '555-5678', 
            role: 'Driver', 
            disabled: false,
            lastActive: '2025-05-01T07:30:00'
          },
          { 
            id: 6, 
            name: 'Emily Brown', 
            username: 'ebrown', 
            email: 'emily.brown@example.com', 
            phone: '555-6789', 
            role: 'Picker', 
            disabled: false,
            lastActive: '2025-05-01T09:10:00'
          },
        ];
        
        setWorkers(mockWorkers);
      } catch (err) {
        console.error('Error fetching workers:', err);
        setError('Failed to load workers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Filter workers based on role
  const filteredWorkers = workers.filter(worker => {
    if (roleFilter === 'all') return true;
    return worker.role === roleFilter;
  });

  // Toggle worker disabled status
  const toggleWorkerStatus = (workerId) => {
    setWorkers(prevWorkers => 
      prevWorkers.map(worker => 
        worker.id === workerId 
          ? {...worker, disabled: !worker.disabled} 
          : worker
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-600 mt-1">Manage warehouse staff and their roles</p>
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
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Worker
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setRoleFilter('all')}
        >
          All Roles
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleFilter === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setRoleFilter('Manager')}
        >
          Managers
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleFilter === 'ReceivingClerk' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setRoleFilter('ReceivingClerk')}
        >
          Receiving Clerks
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleFilter === 'Picker' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setRoleFilter('Picker')}
        >
          Pickers
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleFilter === 'Packer' ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setRoleFilter('Packer')}
        >
          Packers
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleFilter === 'Driver' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setRoleFilter('Driver')}
        >
          Drivers
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
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No workers found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => (
                    <tr key={worker.id} className={`hover:bg-gray-50 ${worker.disabled ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{worker.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{worker.email}</div>
                        <div className="text-sm text-gray-500">{worker.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={worker.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {worker.disabled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <NoSymbolIcon className="h-3 w-3 mr-1" /> Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(worker.lastActive).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          onClick={() => console.log('Edit worker', worker.id)}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                          onClick={() => console.log('Reset password', worker.id)}
                        >
                          <KeyIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className={`${worker.disabled ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                          onClick={() => toggleWorkerStatus(worker.id)}
                        >
                          {worker.disabled ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <NoSymbolIcon className="h-5 w-5" />
                          )}
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

export default Workers;