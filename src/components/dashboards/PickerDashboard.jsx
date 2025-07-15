import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Package, Archive, MapPin, Check, AlertCircle, Eye, Maximize2, Minimize2, ClipboardList, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import WarehouseMap, { STORAGE_CAPACITY } from '../warehouse/WarehouseMap';
import inventoryIncreaseService from '../../services/inventoryIncreaseService';
import orderService from '../../services/orderService';

const PickerDashboard = () => {
  const { currentUser } = useAuth();
  const [itemsData, setItemsData] = useState({
    available_for_storing: [],
    available_for_picking: [],
    pending_orders: []
  });
  const [selectedStoringItem, setSelectedStoringItem] = useState(null);
  const [locationId, setLocationId] = useState('');
  const [markingAsStored, setMarkingAsStored] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [actionMode, setActionMode] = useState('storing'); // 'storing' or 'collecting'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [currentPickingOrder, setCurrentPickingOrder] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [pickingMode, setPickingMode] = useState(false);

  // Helper function to generate dummy location based on item ID
  const generateDummyLocation = (itemId) => {
    const id = itemId || 1;
    if (id % 3 === 0) {
      const rack = id % 2 === 0 ? 'P1' : 'P2';
      const position = Math.floor((id / 3) % 7) + 1;
      return `${rack}-${position}1-F1`;
    } else if (id % 3 === 1) {
      const rackNum = Math.floor((id / 3) % 3) + 1;
      const rack = `B${rackNum}`;
      const position = Math.floor((id / 3) % 7) + 1;
      return `${rack}-${position}1-F1`;
    } else {
      const position = Math.floor((id / 2) % 7) + 1;
      return `D-${position}-F1`;
    }
  };

  // Fetch items from inventory_increases collection
  // Replace this function in PickerDashboard.jsx
  const fetchInventoryIncreases = async () => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem('token');
      
      // ✨ FIXED: Call the correct endpoint with ML predictions
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/inventory-increases/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            limit: 100
          }
        }
      );
      
      console.log('Fetched inventory increases with ML predictions:', response.data);
      
      // Transform the data to match your existing format
      const availableForStoring = response.data.map(item => ({
        itemID: item.itemID,
        itemName: item.item_name,
        quantity: item.quantity_increased,
        category: item.size || 'Medium',
        condition: 'good',
        receivingID: item.reference_id,
        lastIncreaseDate: item.timestamp,
        source: item.source,
        reason: item.reason,
        // ✨ ADD: ML prediction data
        predicted_location: item.predicted_location,
        predicted_coordinates: item.predicted_coordinates,
        prediction_confidence: item.prediction_confidence,
        allocation_reason: item.allocation_reason,
        suggested_location: item.suggested_location
      }));
      
      setItemsData(prevData => ({
        ...prevData,
        available_for_storing: availableForStoring
      }));
      
    } catch (error) {
      console.error('Error fetching inventory increases:', error);
      toast.error('Failed to load items for storing');
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      const orders = await orderService.getOrders({ status: 'pending' });
      setItemsData(prevData => ({
        ...prevData,
        pending_orders: orders
      }));
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Failed to load pending orders');
    }
  };

  useEffect(() => {
    fetchInventoryIncreases();
    fetchPendingOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInventoryIncreases();
      fetchPendingOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsStored = async (item) => {
  try {
    setMarkingAsStored(true);
    const token = localStorage.getItem('token');
    
    if (pickingMode && currentPickingOrder) {
      // ... existing picking logic remains the same
    } else {
      // Original storing logic for inventory increases
      if (!locationId || !selectedMapLocation) {
        toast.error('Please select a location from the map');
        return;
      }
      
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
        receivingID: item.receivingID,
        storedBy: currentUser?.username || 'Unknown'
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
        // ✨ UPDATED: Send actual location used to backend
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/inventory-increases/mark-as-stored`,
            {
              itemID: item.itemID,
              item_name: item.itemName,
              quantity_stored: item.quantity,
              actual_location: locationId  // ✨ NEW: Track where it was actually stored
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Show success message with location info
          const predictionAccurate = item.predicted_location === locationId;
          const accuracyMessage = predictionAccurate 
            ? " (ML prediction was accurate!)" 
            : item.predicted_location 
              ? ` (ML predicted ${item.predicted_location}, but you chose ${locationId})`
              : "";
              
          toast.success(`Item ${item.itemName} stored at ${locationId}${accuracyMessage}`);
          
        } catch (error) {
          console.error('Error marking inventory increases as stored:', error);
        }
        
        // ... rest of existing logic remains the same
      }
    }
  } catch (error) {
    console.error('Error marking item as stored/collected:', error);
    toast.error('Failed to process item');
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

  // Use ML-predicted location if available
  if (item.predicted_location && item.predicted_coordinates) {
    console.log('Using ML-predicted location:', item.predicted_location);
    
    setSelectedMapLocation({
      x: item.predicted_coordinates.x - 1,  // Convert to 0-indexed for map
      y: item.predicted_coordinates.y - 1,  // Convert to 0-indexed for map
      floor: item.predicted_coordinates.floor,
      locationCode: item.predicted_location
    });
    setLocationId(item.predicted_location);
    
    // Show prediction info to user
    toast.success(`ML predicted optimal location: ${item.predicted_location} (${(item.prediction_confidence * 100).toFixed(1)}% confidence)`);
  } else if (item.suggested_location) {
    // Fallback to old suggested location logic
    setSelectedMapLocation({
      x: item.suggested_location.x,
      y: item.suggested_location.y,
      floor: item.suggested_location.floor,
      locationCode: item.suggested_location.locationCode
    });
    setLocationId(item.suggested_location.locationCode);
  } else {
    setSelectedMapLocation(null);
  }
};

  // Handle starting order picking
  const handleStartPicking = (order) => {
    setCurrentPickingOrder(order);
    setCurrentItemIndex(0);
    setPickingMode(true);
    
    // Get first item details from inventory
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      // You might need to fetch the actual item details from inventory
      // Generate dummy location if not present
      const locationID = firstItem.locationID || generateDummyLocation(firstItem.itemID);
      
      const itemData = {
        itemID: firstItem.itemID,
        itemName: firstItem.item_name || `Item ${firstItem.itemID}`,
        quantity: firstItem.quantity,
        locationID: locationID,
        orderID: order.orderID
      };
      setSelectedStoringItem(itemData);
      setActionMode('collecting');
      handleOpenCollectModal(itemData);
    }
  };

  // Handle opening collect modal
  const handleOpenCollectModal = (item) => {
    setSelectedStoringItem(item);
    setActionMode('collecting');
    setSuggestedLocations([]);
    
    // When in picking mode, set the path destination from item location
    if (pickingMode && item.locationID) {
      // Parse location ID to get coordinates (assuming format like "B1-12-F1" or "P1-21-F1")
      const locationParts = item.locationID.split('-');
      if (locationParts.length >= 2) {
        const rackName = locationParts[0];
        const position = locationParts[1];
        const floor = locationParts[2] ? parseInt(locationParts[2].replace('F', '')) : 1;
        
        // Map rack names to coordinates (0-indexed)
        const rackCoordinates = {
          'P1': { x: 6, yStart: 1, yEnd: 7 }, // x=7 becomes 6 in 0-indexed
          'P2': { x: 8, yStart: 1, yEnd: 7 }, // x=9 becomes 8
          'B1': { x: 0, yStart: 1, yEnd: 7 }, // x=1 becomes 0
          'B2': { x: 2, yStart: 1, yEnd: 7 }, // x=3 becomes 2
          'B3': { x: 4, yStart: 1, yEnd: 7 }, // x=5 becomes 4
          'D': { xStart: 2, xEnd: 8, y: 9 }   // y=10 becomes 9
        };
        
        const rack = rackCoordinates[rackName];
        if (rack) {
          let x, y;
          if (rack.yStart !== undefined) {
            // Vertical rack
            x = rack.x;
            // Extract y from position (e.g., "21" means row 2)
            const row = parseInt(position[0]) - 1;
            y = rack.yStart + row;
          } else {
            // Horizontal rack (D)
            const col = parseInt(position[0]) - 1;
            x = rack.xStart + col;
            y = rack.y;
          }
          setSelectedMapLocation({ x, y, floor });
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

// function to show prediction details
const showPredictionDetails = (item) => {
  if (!item.predicted_location) {
    toast.error('No ML prediction available for this item');
    return;
  }
  
  const details = `
    Predicted Location: ${item.predicted_location}
    Confidence: ${(item.prediction_confidence * 100).toFixed(1)}%
    Reason: ${item.allocation_reason || 'ML model prediction'}
    Coordinates: (${item.predicted_coordinates?.x}, ${item.predicted_coordinates?.y})
  `;
  
  // You can show this in a modal or alert
  alert(details);
};


  return (
    <div className="space-y-6">

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
              {itemsData.available_for_storing.length}
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
                <p className="text-sm text-gray-600">Orders ready for picking</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {itemsData.pending_orders.length}
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
            {loadingItems ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-gray-500">Loading items...</span>
                </div>
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
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ML Prediction
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
                        <div>
                          <div className="text-sm text-gray-900">{item.source}</div>
                          <div className="text-xs text-gray-500">{item.reason}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenStoreModal(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Store
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.predicted_location ? (
                          <div>
                            <div className="text-sm font-medium text-green-700">
                              {item.predicted_location}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(item.prediction_confidence * 100).toFixed(1)}% confidence
                            </div>
                            <button
                              onClick={() => showPredictionDetails(item)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Details
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            No prediction
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pending Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ClipboardList className="h-5 w-5 text-blue-600 mr-2" />
              Pending Orders for Picking
            </h3>
          </div>
          <div className="overflow-x-auto">
            {itemsData.pending_orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No pending orders available
              </div>
            ) : (
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
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemsData.pending_orders.map((order) => (
                    <tr key={order.orderID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderID}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.order_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer_name || `Customer ${order.customerID}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleStartPicking(order)}
                          className="flex items-center text-blue-600 hover:text-blue-900"
                        >
                          <span>Start Picking</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
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
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {pickingMode ? `Collecting Order #${currentPickingOrder?.orderID} - Item ${currentItemIndex + 1} of ${currentPickingOrder?.items?.length}` : 
                   actionMode === 'storing' ? 'Store Item in Location' : 'Collect Item from Location'}
                </h3>
                {pickingMode && (
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex space-x-1">
                      {currentPickingOrder?.items?.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 w-8 rounded ${
                            index < currentItemIndex ? 'bg-green-500' :
                            index === currentItemIndex ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      Progress: {currentItemIndex}/{currentPickingOrder?.items?.length}
                    </span>
                  </div>
                )}
              </div>
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
                      {pickingMode ? 'Navigate to item location shown on map' : 'Path shown from item location to packing point'}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Item Location: {selectedStoringItem.locationID || 'Unknown'}
                    </p>
                    {pickingMode && (
                      <p className="text-xs text-green-600 mt-1">
                        Blue circle = Receiving point | Orange circle = Item location
                      </p>
                    )}
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
                    if (pickingMode) {
                      // Cancel entire picking process
                      setPickingMode(false);
                      setCurrentPickingOrder(null);
                      setCurrentItemIndex(0);
                    }
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
                  {pickingMode ? 'Cancel Order' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleMarkAsStored(selectedStoringItem)}
                  disabled={(!pickingMode && actionMode === 'storing' && !locationId) || markingAsStored}
                  className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    pickingMode ? 'bg-green-600 text-white hover:bg-green-700' :
                    actionMode === 'storing' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {pickingMode ? 
                    (currentItemIndex < currentPickingOrder?.items?.length - 1 ? 
                      (markingAsStored ? 'Processing...' : 'Collect & Next Item') : 
                      (markingAsStored ? 'Completing Order...' : 'Collect & Complete Order')
                    ) :
                    actionMode === 'storing' 
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