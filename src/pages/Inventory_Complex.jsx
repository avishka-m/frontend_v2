import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { inventoryService } from '../services/inventoryService';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Available categories - in a real app, this might come from the API
const defaultCategories = [
  'Electronics',
  'Clothing',
  'Home Goods',
  'Sporting Goods',
  'Toys',
  'Office Supplies',
  'Food & Beverage'
];

const Inventory = () => {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const itemsPerPage = 10;

  // Check if user can edit inventory
  const canEdit = ['clerk', 'manager'].includes(currentUser?.role || '');

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await inventoryService.getInventory({
          page,
          limit: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
          search: searchTerm,
          category: categoryFilter
        });

        if (Array.isArray(response)) {
          setInventory(response);
          setTotalPages(Math.ceil(response.length / itemsPerPage));
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [page, searchTerm, categoryFilter, itemsPerPage]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  // Handle delete inventory item
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteInventoryItem(id);
        // Fetch updated inventory after successful deletion
        const response = await inventoryService.getInventory({
          page,
          limit: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
          search: searchTerm,
          category: categoryFilter
        });
        setInventory(response);
        alert('Item deleted successfully');
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Export inventory data to CSV
  const handleExport = async () => {
    try {
      // Get all inventory items for export
      const response = await inventoryService.getInventory({ limit: 1000 });
      
      if (!response.items || response.items.length === 0) {
        alert('No data to export');
        return;
      }

      // Create CSV content
      const headers = Object.keys(response.items[0]).join(',');
      const rows = response.items.map(item => Object.values(item).join(','));
      const csvContent = [headers, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting inventory:', err);
      alert('Failed to export inventory data');
    }
  };

  // Render inventory table
  const renderInventoryTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (inventory.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">No inventory items found</p>
          {canEdit && (
            <Link
              to="/inventory/add"
              className="mt-4 inline-flex items-center btn btn-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Item
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">SKU</th>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Quantity</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Price</th>
                {canEdit && <th className="table-header-cell">Actions</th>}
              </tr>
            </thead>
            <tbody className="table-body">
              {inventory.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="table-cell font-medium">{item.sku}</td>
                  <td className="table-cell">{item.name}</td>
                  <td className="table-cell">{item.category}</td>
                  <td className="table-cell">
                    <span className={`${
                      item.quantity < 10 ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {item.quantity}
                    </span>
                    {item.quantity < 10 && (
                      <span className="ml-2 badge badge-danger">Low</span>
                    )}
                  </td>
                  <td className="table-cell">{item.location_code || 'Unassigned'}</td>
                  <td className="table-cell">${Number(item.unit_price).toFixed(2)}</td>
                  {canEdit && (
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <Link
                          to={`/inventory/edit/${item.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * itemsPerPage, (totalPages * itemsPerPage))}
                </span> of{' '}
                <span className="font-medium">{totalPages * itemsPerPage}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(page => Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                    page === 1 
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === pageNum
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(page => Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                    page === totalPages 
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {canEdit && (
            <Link
              to="/inventory/add"
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Add Item
            </Link>
          )}
          <button
            className="btn btn-outline flex items-center"
            onClick={handleExport}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by SKU or name..."
                className="form-control pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-outline flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-5 h-5 mr-1" />
              Filter
            </button>
          </div>

          <div>
            <button type="submit" className="btn btn-primary w-full md:w-auto">
              Search
            </button>
          </div>
        </form>

        {/* Filters - conditionally shown */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="form-control"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {/* Additional filters can go here */}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 mr-4"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory table */}
      {renderInventoryTable()}
    </div>
  );
};

export default Inventory;