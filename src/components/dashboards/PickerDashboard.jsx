import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Package, Archive, MapPin, Check, AlertCircle, Loader, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import WarehouseMap, { STORAGE_CAPACITY } from '../warehouse/WarehouseMap';

const PickerDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [itemsData, setItemsData] = useState({
    available_for_storing: [],
    available_for_picking: []
  });
  const [selectedStoringItem, setSelectedStoringItem] = useState(null);
  const [locationId, setLocationId] = useState('');
  const [markingAsStored, setMarkingAsStored] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [actionMode, setActionMode] = useState('storing'); // 'storing' or 'collecting'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);

  // Fetch items by status
  useEffect(() => {
    fetchItemsByStatus();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchItemsByStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchItemsByStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/receiving/items/by-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Items by status response:', response.data); // Debug log
      
      if (response.data) {
        // Ensure the data structure matches what the component expects
        const formattedData = {
          available_for_storing: response.data.available_for_storing || [],
          available_for_picking: response.data.available_for_picking || []
        };
        setItemsData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching items by status:', error);
      // Show more detailed error message
      if (error.response) {
        toast.error(`Failed to load items: ${error.response.data.detail || error.message}`);
      } else {
        toast.error('Failed to load items data - check console for details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsStored = async (item) => {
    if (!locationId || !selectedMapLocation) {
      toast.error('Please select a location from the map');
      return;
    }

    try {
      setMarkingAsStored(true);
      const token = localStorage.getItem('token');
      
      // Call the storage history API
      const storageData = {
        itemID: item.itemID,
        itemName: item.itemName,
        quantity: item.quantity,
        locationID: locationId,
        locationCoordinates: {
          x: selectedMapLocation.x,
          y: selectedMapLocation.y,
          floor: selectedMapLocation.floor || 1
        },
        category: item.category,
        condition: item.condition,
        receivingID: item.receivingID
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/storage-history/store-item`,
        storageData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        // Also update the receiving status
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/receiving/${item.receivingID}/items/${item.itemID}/store`,
          { location_id: locationId },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        toast.success(`Item ${item.itemName} marked as stored at ${locationId}`);
        setSelectedStoringItem(null);
        setLocationId('');
        setSelectedMapLocation(null);
        setSuggestedLocations([]);
        fetchItemsByStatus(); // Refresh data
        
        // Close fullscreen if open
        if (isFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error marking item as stored:', error);
      toast.error('Failed to mark item as stored');
    } finally {
      setMarkingAsStored(false);
    }
  };

  // Calculate suggested storage locations based on item type and quantity
  const calculateSuggestedLocations = (item) => {
    if (!item) return [];
    
    const quantity = item.quantity || 0;
    let requiredSquares = 0;
    let rackType = '';
    
    // Determine item size based on category or other logic
    // For now, let's use a simple mapping - you can customize this
    const itemCategory = item.category?.toLowerCase() || '';
    
    if (itemCategory.includes('small') || itemCategory.includes('pellet')) {
      requiredSquares = Math.ceil(quantity / STORAGE_CAPACITY.PELLET_PER_SQUARE);
      rackType = 'S'; // Small (Pellet)
    } else if (itemCategory.includes('medium') || itemCategory.includes('bin')) {
      requiredSquares = Math.ceil(quantity / STORAGE_CAPACITY.BIN_PER_SQUARE);
      rackType = 'M'; // Medium (Bin)
    } else if (itemCategory.includes('large')) {
      requiredSquares = Math.ceil(quantity / STORAGE_CAPACITY.LARGE_PER_SQUARE);
      rackType = 'D'; // Large
    } else {
      // Default to medium if category is not specified
      requiredSquares = Math.ceil(quantity / STORAGE_CAPACITY.BIN_PER_SQUARE);
      rackType = 'M';
    }
    
    // Find available locations of the appropriate type
    const suggestions = [];
    const racks = {
      'S': [
        { name: 'P1', x: 7, yStart: 2, yEnd: 8 },
        { name: 'P2', x: 9, yStart: 2, yEnd: 8 }
      ],
      'M': [
        { name: 'B1', x: 1, yStart: 2, yEnd: 8 },
        { name: 'B2', x: 3, yStart: 2, yEnd: 8 },
        { name: 'B3', x: 5, yStart: 2, yEnd: 8 }
      ],
      'D': [
        { name: 'D', xStart: 3, xEnd: 9, y: 10 }
      ]
    };
    
    const availableRacks = racks[rackType] || racks['M'];
    let squaresAdded = 0;
    
    // For each rack of the appropriate type, add suggested squares
    for (const rack of availableRacks) {
      if (squaresAdded >= requiredSquares) break;
      
      if (rack.yStart !== undefined) {
        // Vertical rack
        for (let y = rack.yStart; y <= rack.yEnd && squaresAdded < requiredSquares; y++) {
          suggestions.push({
            x: rack.x,
            y: y,
            floor: 1,
            rack: rack.name,
            type: rackType
          });
          squaresAdded++;
        }
      } else {
        // Horizontal rack (large items)
        for (let x = rack.xStart; x <= rack.xEnd && squaresAdded < requiredSquares; x++) {
          suggestions.push({
            x: x,
            y: rack.y,
            floor: 1,
            rack: rack.name,
            type: rackType
          });
          squaresAdded++;
        }
      }
    }
    
    return suggestions;
  };

  // Handle opening store modal
  const handleOpenStoreModal = (item) => {
    setSelectedStoringItem(item);
    setActionMode('storing');
    const suggestions = calculateSuggestedLocations(item);
    setSuggestedLocations(suggestions);
    setSelectedMapLocation(null);
  };

  // Handle opening collect modal
  const handleOpenCollectModal = (item) => {
    setSelectedStoringItem(item);
    setActionMode('collecting');
    setSuggestedLocations([]);
    // Set the item's current location as the path destination
    if (item.locationID) {
      // Parse location ID to get coordinates (assuming format like "B1-12-F1")
      const locationParts = item.locationID.split('-');
      if (locationParts.length >= 2) {
        const rackName = locationParts[0];
        const position = locationParts[1];
        
        // Map rack names to coordinates
        const rackCoordinates = {
          'P1': { x: 7, yStart: 2, yEnd: 8 },
          'P2': { x: 9, yStart: 2, yEnd: 8 },
          'B1': { x: 1, yStart: 2, yEnd: 8 },
          'B2': { x: 3, yStart: 2, yEnd: 8 },
          'B3': { x: 5, yStart: 2, yEnd: 8 },
          'D': { xStart: 3, xEnd: 9, y: 10 }
        };
        
        const rack = rackCoordinates[rackName];
        if (rack) {
          let x, y;
          if (rack.yStart !== undefined) {
            // Vertical rack
            x = rack.x;
            // Extract y from position (e.g., "12" -> row 1, col 2)
            const row = parseInt(position[0]) - 1;
            y = rack.yStart + row;
          } else {
            // Horizontal rack (D)
            const col = parseInt(position[0]) - 1;
            x = rack.xStart + col;
            y = rack.y;
          }
          setSelectedMapLocation({ x, y, floor: 1 });
          setLocationId(item.locationID);
        }
      }
    }
  };

  // Handle location selection from map
  const handleMapLocationSelect = (location) => {
    if (location && location.locationCode) {
      setLocationId(location.locationCode);
      setSelectedMapLocation(location);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Seed dummy data function
  const seedDummyData = async () => {
    try {
      toast.loading('Seeding dummy data...');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/seed-data/seed-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Seed data response:', response.data); // Debug log
      
      if (response.data) {
        toast.dismiss();
        toast.success(`Seeded ${response.data.receiving_items || 0} items for storing and ${response.data.inventory_items || 0} items for picking!`);
        // Wait a moment before refreshing to ensure data is saved
        setTimeout(() => {
          fetchItemsByStatus(); // Refresh the data
        }, 500);
      }
    } catch (error) {
      console.error('Error seeding dummy data:', error);
      toast.dismiss();
      if (error.response) {
        toast.error(`Failed to seed data: ${error.response.data.detail || error.message}`);
      } else {
        toast.error('Failed to seed dummy data - check console');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Development Tools</h3>
              <p className="text-xs text-yellow-600 mt-1">Seed dummy data for testing</p>
            </div>
            <button
              onClick={seedDummyData}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
            >
              Seed Dummy Data
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available for Storing */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Archive className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Available for Storing</h3>
                <p className="text-sm text-gray-600">Newly received items awaiting storage</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : itemsData.available_for_storing.length}
            </div>
          </div>
        </div>

        {/* Available for Picking */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Available for Picking</h3>
                <p className="text-sm text-gray-600">Items stored and ready to pick</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : itemsData.available_for_picking.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available for Storing Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Archive className="h-5 w-5 text-yellow-600 mr-2" />
              Items Available for Storing
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : itemsData.available_for_storing.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No items awaiting storage
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsData.available_for_storing.map((item, index) => (
                    <tr key={`${item.receivingID}-${item.itemID}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.itemName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.itemID}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.condition === 'good' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenStoreModal(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Store
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Available for Picking Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="h-5 w-5 text-green-600 mr-2" />
              Items Available for Picking
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : itemsData.available_for_picking.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No items available for picking
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Action                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsData.available_for_picking.map((item, index) => (
                    <tr key={`${item.itemID}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.itemName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.itemID}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.stockLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {item.locationID}
                        </span>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenCollectModal(item)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Store Item Modal with Warehouse Map */}
      {selectedStoringItem && (
        <div 
          ref={modalRef}
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 ${
            isFullscreen ? '' : 'overflow-y-auto'
          }`}
        >
          <div className={`bg-white rounded-lg ${
            isFullscreen ? 'h-full w-full' : 'max-w-6xl w-full my-8 max-h-[90vh]'
          } flex flex-col`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {actionMode === 'storing' ? 'Store Item in Location' : 'Collect Item from Location'}
              </h3>
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className={`flex-1 overflow-y-auto p-6 ${isFullscreen ? 'pt-4' : ''}`}>
              <div className={`grid grid-cols-1 ${isFullscreen ? 'xl:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
                {/* Left side - Item details and input */}
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item</label>
                  <p className="text-sm text-gray-900">{selectedStoringItem.itemName} (ID: {selectedStoringItem.itemID})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-sm text-gray-900">{selectedStoringItem.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900">{selectedStoringItem.category || 'Not specified'}</p>
                </div>
                
                {/* Storage calculation info - only for storing mode */}
                {actionMode === 'storing' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Storage Requirements</h4>
                    <p className="text-sm text-blue-700">
                      {(() => {
                        const quantity = selectedStoringItem.quantity || 0;
                        const category = selectedStoringItem.category?.toLowerCase() || '';
                        let capacity = STORAGE_CAPACITY.BIN_PER_SQUARE;
                        let type = 'Medium (Bin)';
                        
                        if (category.includes('small') || category.includes('pellet')) {
                          capacity = STORAGE_CAPACITY.PELLET_PER_SQUARE;
                          type = 'Small (Pellet)';
                        } else if (category.includes('large')) {
                          capacity = STORAGE_CAPACITY.LARGE_PER_SQUARE;
                          type = 'Large';
                        }
                        
                        const requiredSquares = Math.ceil(quantity / capacity);
                        return `${type} - ${requiredSquares} square(s) needed (${capacity} items per square)`;
                      })()}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      {suggestedLocations.length} location(s) highlighted on map
                    </p>
                  </div>
                )}
                
                {/* Collection info - only for collecting mode */}
                {actionMode === 'collecting' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Collection Path</h4>
                    <p className="text-sm text-green-700">
                      Path shown from item location to packing point
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Current Location: {selectedStoringItem.locationID || 'Unknown'}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selected Location Code</label>
                  <input
                    type="text"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    placeholder="Click on map or enter location code"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
                {/* Right side - Warehouse Map */}
                <div className={`border border-gray-200 rounded-lg overflow-hidden ${
                  isFullscreen ? 'h-[calc(100vh-300px)]' : ''
                }`}>
                  <WarehouseMap 
                    onLocationSelect={handleMapLocationSelect}
                    suggestedLocations={suggestedLocations}
                    showSuggestions={true}
                    mode={actionMode}
                    pathDestination={selectedMapLocation}
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t p-6 pt-4 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedStoringItem(null);
                    setLocationId('');
                    setSuggestedLocations([]);
                    setSelectedMapLocation(null);
                    if (isFullscreen) {
                      document.exitFullscreen();
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkAsStored(selectedStoringItem)}
                  disabled={actionMode === 'collecting' || !locationId || markingAsStored}
                  className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionMode === 'storing' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {actionMode === 'storing' 
                    ? (markingAsStored ? 'Storing...' : 'Mark as Stored')
                    : 'Confirm Collection'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickerDashboard;