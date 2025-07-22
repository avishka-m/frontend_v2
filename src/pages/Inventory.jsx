import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { useNotification } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../context/NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock data as fallback - will be replaced by API data
const mockInventoryData = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    quantity: 45,
    unit_price: 89.99,
    reorder_level: 10,
    max_stock_level: 100,
    location: 'A1-B2-C3',
    supplier: 'TechCorp Ltd',
    last_updated: '2025-01-02',
    status: 'active',
    image: '/api/placeholder/60/60'
  },
  {
    id: 2,
    name: 'Organic Cotton T-Shirt',
    sku: 'OCT-002',
    category: 'Clothing',
    quantity: 8,
    unit_price: 24.99,
    reorder_level: 15,
    max_stock_level: 200,
    location: 'B2-C1-D4',
    supplier: 'Fashion Hub',
    last_updated: '2025-01-01',
    status: 'low_stock',
    image: '/api/placeholder/60/60'
  },
  {
    id: 3,
    name: 'JavaScript Programming Guide',
    sku: 'JPG-003',
    category: 'Books',
    quantity: 120,
    unit_price: 34.99,
    reorder_level: 20,
    max_stock_level: 150,
    location: 'C3-D2-E1',
    supplier: 'BookWorld',
    last_updated: '2025-01-03',
    status: 'active',
    image: '/api/placeholder/60/60'
  },
  {
    id: 4,
    name: 'Garden Hose 50ft',
    sku: 'GH-004',
    category: 'Home & Garden',
    quantity: 0,
    unit_price: 45.99,
    reorder_level: 5,
    max_stock_level: 50,
    location: 'D4-E3-F2',
    supplier: 'Garden Pro',
    last_updated: '2024-12-28',
    status: 'out_of_stock',
    image: '/api/placeholder/60/60'
  }
];

const statusOptions = ['All', 'active', 'low_stock', 'out_of_stock'];

// UpdateInventoryModal component
const UpdateInventoryModal = ({ isOpen, onClose, item, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    size: 'M',
    storage_type: 'standard',
    total_stock: 0,
    min_stock_level: 10,
    max_stock_level: 100,
    supplierID: 1,
    locationID: ''
  });

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || item.itemName || '',
        category: item.category || '',
        size: item.size || 'M',
        storage_type: item.storage_type || 'standard',
        total_stock: item.quantity || item.total_stock || item.stock_level || 0,
        min_stock_level: item.min_stock_level || item.reorderLevel || 10,
        max_stock_level: item.max_stock_level || item.maxStockLevel || 100,
        supplierID: item.supplierID || 1,
        locationID: item.locationID || item.location || ''
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Update Inventory Item
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Item Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Item Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Item ID:</span> {item?.itemID || item?.id}
              </div>
              <div>
                <span className="font-medium">Current Stock:</span> {item?.quantity || item?.total_stock || 0}
              </div>
              <div>
                <span className="font-medium">Location:</span> {item?.locationID || item?.location || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {item?.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Tools & Hardware">Tools & Hardware</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                </select>
              </div>

              {/* Storage Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Storage Type
                </label>
                <select
                  name="storage_type"
                  value={formData.storage_type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="standard">Standard</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="fragile">Fragile</option>
                  <option value="hazardous">Hazardous</option>
                </select>
              </div>

              {/* Total Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Stock
                </label>
                <input
                  type="number"
                  name="total_stock"
                  value={formData.total_stock}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Min Stock Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="min_stock_level"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Max Stock Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Stock Level
                </label>
                <input
                  type="number"
                  name="max_stock_level"
                  value={formData.max_stock_level}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Supplier ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supplier ID
                </label>
                <input
                  type="number"
                  name="supplierID"
                  value={formData.supplierID}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Location ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location ID
                </label>
                <input
                  type="text"
                  name="locationID"
                  value={formData.locationID}
                  onChange={handleChange}
                  placeholder="e.g., B1.4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Stock Level Validation */}
            {formData.total_stock < formData.min_stock_level && (
              <div className="text-yellow-600 bg-yellow-50 p-3 rounded-md text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Current stock is below minimum level - this will mark the item as low stock
              </div>
            )}

            {formData.total_stock === 0 && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Zero stock will mark this item as out of stock
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </div>
                ) : (
                  'Update Inventory'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Inventory = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUpdateItem, setSelectedUpdateItem] = useState(null);
  const queryClient = useQueryClient();

  // Fetch categories with React Query
  const {
    data: categories = ['All'],
    isLoading: loadingCategories,
    isError: errorCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const categoriesData = await inventoryService.getCategories();
        return ['All', ...categoriesData];
      } catch (error) {
        // fallback
        return ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports & Outdoors', 'Health & Beauty', 'Tools & Hardware', 'Food & Beverages'];
      }
    }
  });

  // Fetch inventory with React Query
  const {
    data: inventory = mockInventoryData,
    isLoading: loadingInventory,
    isError: errorInventory
  } = useQuery({
    queryKey: ['inventory', { searchTerm, selectedCategory, selectedStatus, page: pagination.page, limit: pagination.limit, sortKey: sortConfig.key, sortDir: sortConfig.direction }],
    queryFn: async () => {
      try {
        const params = {
          search: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          page: pagination.page,
          limit: pagination.limit,
          sort_by: sortConfig.key,
          sort_order: sortConfig.direction
        };
        const response = await inventoryService.getInventory(params);
        if (response.items && Array.isArray(response.items)) {
          setPagination(prev => ({
            ...prev,
            total: response.total || response.items.length,
            totalPages: response.total_pages || Math.ceil((response.total || response.items.length) / prev.limit)
          }));
          return response.items;
        } else if (Array.isArray(response)) {
          setPagination(prev => ({
            ...prev,
            total: response.length,
            totalPages: Math.ceil(response.length / prev.limit)
          }));
          return response;
        } else {
          return mockInventoryData;
        }
      } catch (error) {
        addNotification({
          type: NOTIFICATION_TYPES.WARNING,
          message: 'Using Sample Data',
          description: 'Could not connect to server. Displaying sample inventory data.'
        });
        setPagination(prev => ({
          ...prev,
          total: mockInventoryData.length,
          totalPages: Math.ceil(mockInventoryData.length / prev.limit)
        }));
        return mockInventoryData;
      }
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => inventoryService.bulkDeleteInventoryItems(ids),
    onSuccess: () => {
      setSelectedItems([]);
      queryClient.invalidateQueries(['inventory']);
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Items Deleted',
        description: `${selectedItems.length} items have been deleted.`
      });
    },
    onError: () => {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Bulk Delete Failed',
        description: 'Could not delete selected items.'
      });
    }
  });

  // Single delete mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id) => inventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Item Deleted',
        description: `Item has been deleted.`
      });
    },
    onError: () => {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Delete Failed',
        description: 'Could not delete the item.'
      });
    }
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryService.updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      setUpdateModalOpen(false);
      setSelectedUpdateItem(null);
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Item Updated',
        description: 'Inventory item has been successfully updated.'
      });
    },
    onError: (error) => {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Update Failed',
        description: error.response?.data?.detail || 'Could not update the item.'
      });
    }
  });

  // Handle manual refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries(['inventory']);
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message: 'Data Refreshed',
      description: 'Inventory data has been updated.'
    });
  };

  // Handle export
  const handleExport = async (format = 'csv') => {
    try {
      const blob = await inventoryService.exportInventory(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Export Successful',
        description: `Inventory data exported as ${format.toUpperCase()}.`
      });
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Export Failed',
        description: 'Could not export inventory data.'
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      bulkDeleteMutation.mutate(selectedItems);
    }
  };

  // Handle single item delete
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  // Handle open update modal
  const handleOpenUpdateModal = (item) => {
    setSelectedUpdateItem(item);
    setUpdateModalOpen(true);
  };

  // Handle update item
  const handleUpdateItem = (formData) => {
    if (!selectedUpdateItem) return;
    updateItemMutation.mutate({
      id: selectedUpdateItem.itemID || selectedUpdateItem.id,
      data: formData
    });
  };

  // Local filtering and sorting (when API doesn't handle it server-side)
  const filteredAndSortedInventory = useMemo(() => {
    let filtered = [...inventory];

    // Apply client-side filtering if needed (fallback when API doesn't support it)
    if (searchTerm && !loadingInventory) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.sku?.toLowerCase().includes(searchLower) ||
          item.supplier?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [inventory, searchTerm, loadingInventory]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when sorting
  };

  const getStatusBadge = (status, quantity, reorderLevel) => {
    // Use the passed reorderLevel parameter or default to 0
    const reorder = reorderLevel || 0;
    
    if (quantity === 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Out of Stock
      </span>;
    } else if (quantity <= reorder) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Low Stock
      </span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        In Stock
      </span>;
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredAndSortedInventory.length 
        ? [] 
        : filteredAndSortedInventory.map(item => item.id)
    );
  };

  // Helper function to get field value (handles both snake_case and camelCase)
  const getFieldValue = (item, field) => {
    return item[field] || item[field.replace(/([A-Z])/g, '_$1').toLowerCase()] || item[field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())];
  };

  if (loadingInventory || loadingCategories) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorInventory || errorCategories) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          Failed to load inventory or categories. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            {loadingInventory ? 'Loading...' : `${pagination.total} items in inventory`}
            {errorInventory && <span className="text-red-600 ml-2">({errorInventory})</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={loadingInventory}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingInventory ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {selectedItems.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedItems.length})
            </button>
          )}
          
          <button 
            onClick={() => navigate('/inventory/add')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
          <button 
            onClick={() => handleExport('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or supplier..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All Status' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedStatus('low_stock')}
                    className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200"
                  >
                    Low Stock
                  </button>
                  <button
                    onClick={() => setSelectedStatus('out_of_stock')}
                    className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loadingInventory && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Loading inventory...</span>
          </div>
        )}
        
        {!loadingInventory && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredAndSortedInventory.length && filteredAndSortedInventory.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>SKU</span>
                      {getSortIcon('sku')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Stock</span>
                      {getSortIcon('quantity')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('unit_price')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Unit Price</span>
                      {getSortIcon('unit_price')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.supplier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">{item.quantity}</span>
                        <span className="text-gray-500 ml-1">/ {getFieldValue(item, 'maxStockLevel') || getFieldValue(item, 'max_stock_level') || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(getFieldValue(item, 'unitPrice') || getFieldValue(item, 'unit_price') || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status, item.quantity, item.reorderLevel || item.min_stock_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => navigate(`/inventory/view/${item.id}`)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenUpdateModal(item)}
                          className="text-green-600 hover:text-green-900"
                          title="Update Inventory"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {/* <button 
                          onClick={() => navigate(`/inventory/edit/${item.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Item"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button> */}
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingInventory && filteredAndSortedInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {errorInventory ? 'There was an error loading data. Try refreshing the page.' : 'Try adjusting your search criteria or add a new item.'}
            </p>
            <div className="mt-6">
              {errorInventory ? (
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              ) : (
                <button
                  onClick={() => navigate('/inventory/add')}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Inventory Modal */}
      {updateModalOpen && selectedUpdateItem && (
        <UpdateInventoryModal
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedUpdateItem(null);
          }}
          item={selectedUpdateItem}
          onUpdate={handleUpdateItem}
          isLoading={updateItemMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Inventory;
