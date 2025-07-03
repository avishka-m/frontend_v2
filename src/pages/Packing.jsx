import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowPathIcon,
  ArchiveBoxIcon,
  ClipboardDocumentCheckIcon,
  QrCodeIcon,
  CheckCircleIcon,
  BarsArrowUpIcon
} from '@heroicons/react/24/outline';

const Packing = () => {
  const { currentUser } = useAuth();
  const [packingTasks, setPackingTasks] = useState([]);
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
      case 'in_progress':
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case 'completed':
        classes += "bg-green-100 text-green-800";
        break;
      case 'on_hold':
        classes += "bg-red-100 text-red-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }
    
    return <span className={classes}>{status.replace('_', ' ')}</span>;
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    
    switch (priority) {
      case 'high':
        classes += "bg-red-100 text-red-800";
        break;
      case 'medium':
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case 'low':
        classes += "bg-green-100 text-green-800";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
    }
    
    return <span className={classes}>{priority}</span>;
  };

  useEffect(() => {
    const fetchPackingTasks = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For now, we'll just simulate a network delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock packing tasks data
        const mockPackingTasks = [
          { 
            id: 1, 
            orderNumber: 'ORD-1001', 
            customer: 'Acme Corporation', 
            items: 5,
            status: 'ready',
            priority: 'high',
            assignedTo: null,
            pickingComplete: true,
            packageType: 'Box - Medium',
            shippingMethod: 'Express'
          },
          { 
            id: 2, 
            orderNumber: 'ORD-1002', 
            customer: 'TechCorp Inc.', 
            items: 2,
            status: 'in_progress',
            priority: 'medium',
            assignedTo: 'Sarah Lee',
            pickingComplete: true,
            packageType: 'Box - Small',
            shippingMethod: 'Standard'
          },
          { 
            id: 3, 
            orderNumber: 'ORD-1003', 
            customer: 'Global Industries', 
            items: 8,
            status: 'on_hold',
            priority: 'medium',
            assignedTo: 'Sarah Lee',
            pickingComplete: false,
            packageType: 'Box - Large',
            shippingMethod: 'Express',
            holdReason: 'Waiting for picking to complete'
          },
          { 
            id: 4, 
            orderNumber: 'ORD-1004', 
            customer: 'Pinnacle Group', 
            items: 3,
            status: 'completed',
            priority: 'low',
            assignedTo: 'Sarah Lee',
            pickingComplete: true,
            packageType: 'Envelope',
            shippingMethod: 'Standard',
            completedAt: '2025-05-01T11:30:00'
          },
          { 
            id: 5, 
            orderNumber: 'ORD-1005', 
            customer: 'Summit Enterprises', 
            items: 6,
            status: 'ready',
            priority: 'high',
            assignedTo: null,
            pickingComplete: true,
            packageType: 'Box - Medium',
            shippingMethod: 'Express'
          },
        ];
        
        setPackingTasks(mockPackingTasks);
      } catch (err) {
        console.error('Error fetching packing tasks:', err);
        setError('Failed to load packing tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackingTasks();
  }, []);

  // Filter tasks based on status
  const filteredTasks = packingTasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  // Handle assigning a task to yourself
  const handleAssignTask = (taskId) => {
    setPackingTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {...task, status: 'in_progress', assignedTo: currentUser?.username} 
          : task
      )
    );
  };

  // Handle completing a task
  const handleCompleteTask = (taskId) => {
    setPackingTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? {
              ...task, 
              status: 'completed',
              completedAt: new Date().toISOString()
            } 
          : task
      )
    );
  };

  // Get task counts for stats
  const getTaskCounts = () => {
    const counts = {
      ready: 0,
      in_progress: 0,
      on_hold: 0,
      completed: 0
    };

    packingTasks.forEach(task => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });

    return counts;
  };

  const taskCounts = getTaskCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packing</h1>
          <p className="text-gray-600 mt-1">Manage and track order packing operations</p>
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
            Scan Order
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
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'ready' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('ready')}
        >
          Ready
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'on_hold' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700 border border-gray-300'}`}
          onClick={() => setStatusFilter('on_hold')}
        >
          On Hold
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Ready</div>
              <div className="text-lg font-semibold">{taskCounts.ready}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
              <ArchiveBoxIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">In Progress</div>
              <div className="text-lg font-semibold">{taskCounts.in_progress}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
              <BarsArrowUpIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">On Hold</div>
              <div className="text-lg font-semibold">{taskCounts.on_hold}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Completed</div>
              <div className="text-lg font-semibold">{taskCounts.completed}</div>
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
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
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
                      No packing tasks found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className={`hover:bg-gray-50 ${task.status === 'on_hold' ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{task.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                        {task.holdReason && (
                          <div className="mt-1 text-xs text-red-600">
                            {task.holdReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.packageType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.assignedTo || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {task.status === 'ready' && (
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => handleAssignTask(task.id)}
                          >
                            Start Packing
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

export default Packing;