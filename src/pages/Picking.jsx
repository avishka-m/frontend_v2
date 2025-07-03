import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  QrCodeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const Picking = () => {
  const { currentUser } = useAuth();
  const [pickingTasks, setPickingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status badge component
  const StatusBadge = ({ status }) => {
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    
    switch (status) {
      case 'pending':
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case 'in_progress':
        classes += "bg-blue-100 text-blue-800";
        break;
      case 'completed':
        classes += "bg-green-100 text-green-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }
    
    return <span className={classes}>{status.replace('_', ' ')}</span>;
  };

  // Format the status for display
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  useEffect(() => {
    const fetchPickingTasks = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For now, we'll just simulate a network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock picking tasks data
        const mockTasks = [
          { 
            id: 1, 
            orderNumber: 'ORD-1001', 
            items: 5, 
            status: 'pending', 
            priority: 'high',
            assignedTo: null,
            location: 'Zone A, Aisle 3',
            deadline: '2025-05-02T14:00:00'
          },
          { 
            id: 2, 
            orderNumber: 'ORD-1002', 
            items: 2, 
            status: 'in_progress', 
            priority: 'medium',
            assignedTo: 'John Doe',
            location: 'Zone B, Aisle 1',
            deadline: '2025-05-01T16:30:00'
          },
          { 
            id: 3, 
            orderNumber: 'ORD-1003', 
            items: 8, 
            status: 'pending', 
            priority: 'medium',
            assignedTo: null,
            location: 'Zone A, Aisle 5',
            deadline: '2025-05-02T10:00:00'
          },
          { 
            id: 4, 
            orderNumber: 'ORD-1004', 
            items: 3, 
            status: 'completed', 
            priority: 'low',
            assignedTo: 'Jane Smith',
            location: 'Zone C, Aisle 2',
            deadline: '2025-05-01T12:00:00'
          },
          { 
            id: 5, 
            orderNumber: 'ORD-1005', 
            items: 12, 
            status: 'pending', 
            priority: 'high',
            assignedTo: null,
            location: 'Zone B, Aisle 4',
            deadline: '2025-05-01T17:00:00'
          },
        ];
        
        setPickingTasks(mockTasks);
      } catch (err) {
        console.error('Error fetching picking tasks:', err);
        setError('Failed to load picking tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPickingTasks();
  }, []);

  // Filter tasks based on status
  const filteredTasks = pickingTasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  // Handle assigning a task to yourself
  const handleAssignTask = (taskId) => {
    setPickingTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {...task, status: 'in_progress', assignedTo: currentUser?.username} 
          : task
      )
    );
  };

  // Handle completing a task
  const handleCompleteTask = (taskId) => {
    setPickingTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {...task, status: 'completed'} 
          : task
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Picking Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track order picking operations</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setLoading(true)}
            className="btn btn-icon btn-secondary"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {currentUser?.role === 'Manager' && (
            <button className="btn btn-primary">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Tasks
            </button>
          )}
          <button className="btn btn-primary">
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Scan Barcode
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('all')}
        >
          All Tasks
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 border border-gray-300'}`}
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
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No picking tasks found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{task.items}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          task.priority === 'high' ? 'text-red-600 font-medium' : 
                          task.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {task.priority.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {task.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(task.deadline).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {task.assignedTo || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {task.status === 'pending' && (
                          <button 
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            onClick={() => handleAssignTask(task.id)}
                          >
                            Assign to me
                          </button>
                        )}
                        {task.status === 'in_progress' && task.assignedTo === currentUser?.username && (
                          <button 
                            className="text-green-600 hover:text-green-900 mr-3"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            Complete
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
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

export default Picking;