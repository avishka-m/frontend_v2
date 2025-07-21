import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Package, Archive, MapPin, Check, AlertCircle, Eye, Maximize2, Minimize2, ClipboardList, ChevronRight, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import WarehouseMap, { STORAGE_CAPACITY } from '../warehouse/WarehouseMap';
import inventoryIncreaseService from '../../services/inventoryIncreaseService';
import orderService from '../../services/orderService';
import workerLocationService from '../../services/workerLocationService';


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
  
  // ✨ UPDATED: Separate loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  const [currentPickingOrder, setCurrentPickingOrder] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [pickingMode, setPickingMode] = useState(false);

  const [workerLocation, setWorkerLocation] = useState({ x: 0, y: 0, floor: 1 });
  const [locationStatus, setLocationStatus] = useState('offline');

  const [pickingPath, setPickingPath] = useState(null);
  
  // ✨ NEW: Occupied locations state for floor visualization
  const [occupiedLocations, setOccupiedLocations] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [pickingProgress, setPickingProgress] = useState({
    currentStep: 0,
    totalSteps: 0,
    completedItems: [],
    phase: 'preparing' // 'preparing', 'picking', 'to_packing', 'completed'
  });

  // ✨ Helper function to safely split locationID
  const safeLocationSplit = (locationID) => {
    if (!locationID || typeof locationID !== 'string') {
      return { base: '', floor: '' };
    }
    const parts = locationID.split('.');
    return {
      base: parts[0] || '',
      floor: parts[1] || ''
    };
  };

  const parseLocationToCoordinates = (locationID) => {
  try {
    console.log('🔍 Parsing locationID:', locationID, 'Type:', typeof locationID);
    
    // ✨ FIX: Handle different locationID formats
    let slotCode, floorStr;
    
    if (typeof locationID !== 'string') {
      console.warn('🔍 locationID is not a string:', locationID);
      // Convert to string if it's a number
      locationID = String(locationID);
    }
    
    // Handle format like "B01.1", "P05.2", "D03.1"
    if (locationID.includes('.')) {
      [slotCode, floorStr] = locationID.split('.');
    } else {
      // Handle simple number format like "8" - convert to B01.1 format
      const id = parseInt(locationID) || 1;
      
      // Simple fallback mapping for numbers
      if (id <= 7) {
        slotCode = `B${String(id).padStart(2, '0')}`;
      } else if (id <= 14) {
        slotCode = `B${String(id).padStart(2, '0')}`;
      } else if (id <= 21) {
        slotCode = `B${String(id).padStart(2, '0')}`;
      } else {
        slotCode = 'B01'; // Default fallback
      }
      floorStr = '1'; // Default floor
    }
    
    const floor = parseInt(floorStr) || 1;
    
    // Extract prefix and number
    const prefix = slotCode[0];
    const number = parseInt(slotCode.substring(1));
    
    let x, y;
    
    switch (prefix) {
      case 'B': // B Rack locations
        if (number <= 7) {
          x = 1; y = 1 + number; // B01-B07: column 1
        } else if (number <= 14) {
          x = 3; y = number - 6; // B08-B14: column 3
        } else {
          x = 5; y = number - 13; // B15-B21: column 5
        }
        break;
        
      case 'P': // P Rack locations
        if (number <= 7) {
          x = 7; y = 1 + number; // P01-P07: column 7
        } else {
          x = 9; y = number - 6; // P08-P14: column 9
        }
        break;
        
      case 'D': // D Rack locations
        if (number <= 7) {
          x = 2 + number; y = 10; // D01-D07: row 10
        } else {
          x = number - 5; y = 11; // D08-D14: row 11
        }
        break;
        
      default:
        console.warn('🔍 Unknown prefix:', prefix);
        x = 1; y = 2; // Default fallback
    }
    
    const result = { x, y, floor };
    console.log('🔍 Parsed coordinates:', result);
    return result;
    
  } catch (error) {
    console.error('🔍 Error parsing location ID:', locationID, error);
    return { x: 1, y: 2, floor: 1 }; // Default fallback
  }
};

  // ✨ NEW: Helper function to calculate fallback location if real location not found
  const calculateFallbackLocation = (itemID) => {
    const id = itemID || 1;
    
    if (id % 3 === 0) {
      const rackNum = (id % 2) + 1;
      const position = Math.floor((id / 3) % 7) + 1;
      return {
        locationID: `P${String(rackNum).padStart(2, '0')}.1`,
        coordinates: { x: 6 + rackNum * 2, y: 1 + position, floor: 1 }
      };
    } else if (id % 3 === 1) {
      const rackNum = Math.floor((id / 3) % 3) + 1;
      const position = Math.floor((id / 3) % 7) + 1;
      return {
        locationID: `B${String(rackNum * 7 + position).padStart(2, '0')}.1`,
        coordinates: { x: rackNum * 2 - 1, y: 1 + position, floor: 1 }
      };
    } else {
      const position = Math.floor((id / 2) % 7) + 1;
      return {
        locationID: `D${String(position).padStart(2, '0')}.1`,
        coordinates: { x: 2 + position, y: 10, floor: 1 }
      };
    }
  };

  // ✨ NEW: Helper function to calculate complete picking path
  const calculatePickingPath = (workerLocation, items, packingCounter) => {
    const segments = [];
    let currentLocation = workerLocation;
    
    // Worker to first item
    if (items.length > 0) {
      segments.push({
        from: currentLocation,
        to: items[0].coordinates,
        type: 'worker_to_item',
        itemName: items[0].itemName,
        stepNumber: 1,
        description: `Go to ${items[0].locationID} for ${items[0].itemName}`
      });
      currentLocation = items[0].coordinates;
    }
    
    // Item to item paths
    for (let i = 1; i < items.length; i++) {
      segments.push({
        from: currentLocation,
        to: items[i].coordinates,
        type: 'item_to_item',
        fromItem: items[i-1].itemName,
        toItem: items[i].itemName,
        stepNumber: i + 1,
        description: `From ${items[i-1].locationID} to ${items[i].locationID} for ${items[i].itemName}`
      });
      currentLocation = items[i].coordinates;
    }
    
    // Last item to packing counter
    if (items.length > 0) {
      segments.push({
        from: currentLocation,
        to: packingCounter,
        type: 'item_to_packing',
        fromItem: items[items.length - 1].itemName,
        stepNumber: items.length + 1,
        description: `Take all collected items to packing counter`
      });
    }
    
    return {
      segments,
      totalSegments: segments.length,
      currentSegment: 0
    };
  };

  // Helper function to generate dummy location based on item ID (new format)
  const generateDummyLocation = (itemId) => {
    const id = itemId || 1;
    if (id % 3 === 0) {
      const rackNum = (id % 2) + 1; // P01 or P02
      const floor = Math.floor((id / 3) % 4) + 1; // Floor 1-4
      return `P${String(rackNum).padStart(2, '0')}.${floor}`;
    } else if (id % 3 === 1) {
      const rackNum = Math.floor((id / 3) % 21) + 1; // B01-B21
      const floor = Math.floor((id / 9) % 4) + 1; // Floor 1-4
      return `B${String(rackNum).padStart(2, '0')}.${floor}`;
    } else {
      const rackNum = Math.floor((id / 2) % 14) + 1; // D01-D14
      const floor = Math.floor((id / 7) % 4) + 1; // Floor 1-4
      return `D${String(rackNum).padStart(2, '0')}.${floor}`;
    }
  };

  // ✨ NEW: Fetch occupied locations for floor visualization
  const fetchOccupiedLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/storage-history/occupied-locations?floor=${selectedFloor}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        setOccupiedLocations(response.data);
      }
    } catch (error) {
      console.error('Error fetching occupied locations:', error);
      setOccupiedLocations([]); // Set empty array on error
    }
  };

  // ✨ UPDATED: fetchInventoryIncreases with background loading
  const fetchInventoryIncreases = async (isBackgroundRefresh = false) => {
    try {
      // Only show loading spinner on initial load, not background refreshes
      if (!isBackgroundRefresh) {
        setInitialLoading(true);
      } else {
        setBackgroundRefreshing(true);
      }
      
      const token = localStorage.getItem('token');
      
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
      
      // ✨ UPDATED: Only log when there are changes
      const newItemsCount = response.data.length;
      const currentItemsCount = itemsData.available_for_storing.length;
      
      if (newItemsCount !== currentItemsCount || !isBackgroundRefresh) {
        console.log(`Items update: ${newItemsCount} items (was ${currentItemsCount})`);
      }
      
      // Transform the data
      const availableForStoring = response.data.map(item => ({
        itemID: item.itemID,
        itemName: item.item_name,
        quantity: item.quantity_increased,
        category: item.size || 'Medium',
        size: item.size || 'M',
        condition: 'good',
        receivingID: item.reference_id,
        lastIncreaseDate: item.timestamp,
        source: item.source,
        reason: item.reason,
        awaiting_prediction: true,
        notes: item.notes || ''
      }));
      
      setItemsData(prevData => ({
        ...prevData,
        available_for_storing: availableForStoring
      }));
      
      setLastRefreshTime(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('Error fetching inventory increases:', error);
      // Only show error toast on initial load, not background refreshes
      if (!isBackgroundRefresh) {
        toast.error('Failed to load items for storing');
      }
    } finally {
      setInitialLoading(false);
      setBackgroundRefreshing(false);
    }
  };

  // ✨ UPDATED: fetchPendingOrders with background loading
const fetchPendingOrders = async (isBackgroundRefresh = false) => {
  try {
    const orders = await orderService.getOrders({ status: 'pending' });
    
    // ✨ NEW: Only log when there are changes
    const newOrdersCount = orders.length;
    const currentOrdersCount = itemsData.pending_orders.length;
    
    if (newOrdersCount !== currentOrdersCount || !isBackgroundRefresh) {
      console.log(`Orders update: ${newOrdersCount} pending orders (was ${currentOrdersCount})`);
    }
    
    setItemsData(prevData => ({
      ...prevData,
      pending_orders: orders
    }));
    
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    if (!isBackgroundRefresh) {
      toast.error('Failed to load pending orders');
    }
  }
};

  // ✨ UPDATED: Initial load and background refresh logic
  useEffect(() => {
    // Initial load (with loading spinner)
    const initialLoad = async () => {
      await Promise.all([
        fetchInventoryIncreases(false),
        fetchPendingOrders(false)
      ]);
    };
    
    initialLoad();
    
    // ✨ UPDATED: Background refresh every 30 seconds (without disrupting UI)
    const refreshInterval = setInterval(() => {
      // Only do background refresh if no modal is open
      if (!selectedStoringItem) {
        fetchInventoryIncreases(true);
        fetchPendingOrders(true);
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // ✨ NEW: Fetch occupied locations when floor changes or modal opens
  useEffect(() => {
    if (selectedStoringItem && selectedMapLocation) {
      fetchOccupiedLocations();
    }
  }, [selectedFloor, selectedStoringItem, selectedMapLocation]);

  // ✨ NEW: Manual refresh function
  const handleManualRefresh = async () => {
    await Promise.all([
      fetchInventoryIncreases(true),
      fetchPendingOrders(true)
    ]);
    toast.success('Data refreshed!', { duration: 2000 });
  };

  // ✨ NEW: Manual order completion function
  const handleCompleteOrder = async () => {
    if (!currentPickingOrder) return;
    
    try {
      setMarkingAsStored(true);
      const token = localStorage.getItem('token');
      
      console.log(`🔄 Manually completing order ${currentPickingOrder.orderID}`);
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/orders/${currentPickingOrder.orderID}/status?new_status=picked`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log(`✅ Order completed successfully:`, response.data);
      toast.success(`Order #${currentPickingOrder.orderID} completed successfully!`);
      
      // Reset picking mode
      setPickingMode(false);
      setCurrentPickingOrder(null);
      setCurrentItemIndex(0);
      setSelectedStoringItem(null);
      setLocationId('');
      setSuggestedLocations([]);
      setSelectedMapLocation(null);
      setPickingPath(null);
      setCurrentDestination(null);
      setActionMode('storing'); // Reset to storing mode
      
      // Refresh orders list
      await fetchPendingOrders(true);
      
      if (isFullscreen) {
        document.exitFullscreen();
      }
      
    } catch (error) {
      console.error('❌ Error completing order:', error);
      toast.error(`Failed to complete order: ${error.response?.data?.detail || error.message}`);
    } finally {
      setMarkingAsStored(false);
    }
  };

  const handleMarkAsStored = async (item) => {
  try {
    setMarkingAsStored(true);
    const token = localStorage.getItem('token');
    
    if (pickingMode && currentPickingOrder) {
      // ✨ COMPLETE: Picking logic for order collection
      try {
        console.log(`🔄 Collecting item:`, item);
        
        // Mark item as collected from storage
        const collectData = {
          itemID: item.itemID,
          itemName: item.itemName,
          quantity: item.quantity,
          locationID: item.locationID,
          locationCoordinates: {
            x: item.coordinates?.x || 0,
            y: item.coordinates?.y || 0,
            floor: item.coordinates?.floor || 1
          },
          category: item.category || 'General',
          // Additional fields for reference (backend will ignore these)
          orderID: currentPickingOrder.orderID,
          collectedBy: currentUser?.username || 'Unknown'
        };
        
        console.log(`📤 Sending collection data:`, collectData);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/storage-history/collect-item`,
          collectData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log(`📥 Collection API response:`, response.data);
        
        if (response.data) {
          console.log(`✅ Item ${item.itemName} collected successfully from ${item.locationID}`);
          toast.success(`Item ${item.itemName} collected from ${item.locationID}`);
          
          // ✨ NEW: Update worker location to current item location
          const currentItemLocation = item.coordinates || parseLocationToCoordinates(item.locationID);
          setWorkerLocation(currentItemLocation);
          console.log(`🚶 Worker moved to:`, currentItemLocation);
          
          // ✨ NEW: Update worker location in database
          try {
            await workerLocationService.updateLocation(
              currentItemLocation.x,
              currentItemLocation.y,
              currentItemLocation.floor,
              'online'
            );
            console.log(`📡 Worker location updated in database:`, currentItemLocation);
          } catch (error) {
            console.warn(`⚠️ Failed to update worker location in database:`, error);
          }
          
          // Move to next item or complete order
          if (currentItemIndex < currentPickingOrder.items.length - 1) {
            console.log(`📦 Moving to next item (${currentItemIndex + 1} → ${currentItemIndex + 2})`);
            // Move to next item
            const nextIndex = currentItemIndex + 1;
            setCurrentItemIndex(nextIndex);
            
            const nextItem = currentPickingOrder.items[nextIndex];
            const nextLocationID = nextItem.locationID || generateDummyLocation(nextItem.itemID);
            
            const nextItemData = {
              itemID: nextItem.itemID,
              itemName: nextItem.item_name || `Item ${nextItem.itemID}`,
              quantity: nextItem.quantity,
              locationID: nextLocationID,
              coordinates: parseLocationToCoordinates(nextLocationID),
              orderID: currentPickingOrder.orderID
            };
            
            // ✨ NEW: Update the path from current item to next item
            const currentItemLocation = item.coordinates || parseLocationToCoordinates(item.locationID);
            const nextItemLocation = nextItemData.coordinates;
            
            const newPathSegment = {
              from: currentItemLocation,
              to: nextItemLocation,
              type: 'item_to_item',
              fromItem: item.itemName,
              toItem: nextItemData.itemName,
              stepNumber: nextIndex + 1,
              description: `From ${item.locationID} to ${nextItemData.locationID} for ${nextItemData.itemName}`
            };
            
            // Update the picking path to show current segment
            setPickingPath([newPathSegment]);
            
            // Update the current destination on the map
            setCurrentDestination({
              from: currentItemLocation,
              to: nextItemLocation,
              item: nextItemData,
              stepNumber: nextIndex + 1,
              totalSteps: currentPickingOrder.items.length
            });
            
            setSelectedStoringItem(nextItemData);
            handleOpenCollectModal(nextItemData);
            
            toast(`Moving to item ${nextIndex + 1} of ${currentPickingOrder.items.length} - Head to ${nextLocationID}`, {
              icon: '📦',
              duration: 4000
            });
          } else {
            console.log(`🎯 Last item collected! Setting up path to packing counter...`);
            // Last item collected - show path to packing counter
            const packingCounter = { x: 0, y: 11, floor: 1 };
            const currentItemLocation = item.coordinates || parseLocationToCoordinates(item.locationID);
            
            // ✨ NEW: Update worker location to current item location first
            setWorkerLocation(currentItemLocation);
            
            // ✨ NEW: Update worker location in database
            try {
              await workerLocationService.updateLocation(
                currentItemLocation.x,
                currentItemLocation.y,
                currentItemLocation.floor,
                'online'
              );
              console.log(`📡 Worker location updated in database for last item:`, currentItemLocation);
            } catch (error) {
              console.warn(`⚠️ Failed to update worker location in database:`, error);
            }
            
            console.log(`📍 Current location:`, currentItemLocation);
            console.log(`📦 Packing counter:`, packingCounter);
            
            const packingPathSegment = {
              from: currentItemLocation,
              to: packingCounter,
              type: 'item_to_packing',
              fromItem: item.itemName,
              stepNumber: currentPickingOrder.items.length + 1,
              description: `Take all collected items to packing counter`
            };
            
            console.log(`🚶 Packing path segment:`, packingPathSegment);
            
            // Force close modal first to ensure map is visible
            // setSelectedStoringItem(null); // ✨ CHANGED: Keep modal open for completion
            
            // Small delay to ensure state updates before setting path
            setTimeout(() => {
              console.log(`🔄 Setting packing counter path with modal open...`);
              
              // Update the picking path to show path to packing
              setPickingPath([packingPathSegment]);
              
              // Update the current destination on the map
              setCurrentDestination({
                from: currentItemLocation,
                to: packingCounter,
                item: { itemName: 'Packing Counter', locationID: 'Packing' },
                stepNumber: currentPickingOrder.items.length + 1,
                totalSteps: currentPickingOrder.items.length + 1
              });
              
              console.log(`✅ Path to packing counter set successfully`);
              setActionMode('completing');  // New state to show completion button
              
              // Don't close the modal - let user see the completion button in the modal
              console.log(`🔄 Keeping modal open for packing path completion...`);
            }, 200); // Increased delay to ensure modal is fully closed
            
            toast.success(`All items collected! Head to packing counter to complete order.`);
          }
        }
      } catch (error) {
        console.error('Error collecting item:', error);
        
        // Check if it's a network error or API error
        if (error.response) {
          // API returned an error response
          const errorDetail = error.response?.data?.detail || error.message;
          console.error('❌ API Error details:', errorDetail);
          toast.error(`Failed to collect item: ${errorDetail}`);
        } else if (error.request) {
          // Network error
          console.error('❌ Network error:', error.request);
          toast.error('Network error - check connection');
        } else {
          // Other error
          console.error('❌ Unexpected error:', error.message);
          toast.error(`Unexpected error: ${error.message}`);
        }
        
        // Don't prevent moving to next item or showing packing path on minor errors
        // The collection might have succeeded even if there's a client-side error
      }
      
    } else {
      // ✨ COMPLETE: Original storing logic for inventory increases
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
        // ✨ SUCCESS: Item successfully stored
        toast.success(`Item ${item.itemName} stored at ${locationId}`);
        
        // ✨ UPDATED: Send actual location used to backend for inventory tracking
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/inventory-increases/mark-as-stored`,
            {
              itemID: item.itemID,
              item_name: item.itemName,
              quantity_stored: item.quantity,
              actual_location: locationId  // Track where it was actually stored
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          console.log(`✅ Inventory records updated for item ${item.itemID} at ${locationId}`);
          
        } catch (error) {
          console.error('Error marking inventory increases as stored:', error);
          toast.error('Item stored but failed to update inventory records');
        }
        
        // Clear selections and close modal
        setSelectedStoringItem(null);
        setLocationId('');
        setSuggestedLocations([]);
        setSelectedMapLocation(null);
        
        // Refresh the items list
        fetchInventoryIncreases(true);
        
        if (isFullscreen) {
          document.exitFullscreen();
        }
      }
      
      // ✨ IMPORTANT: Update worker location after successful storage (moved outside response.data check)
      if (selectedMapLocation) {
        const storageLocation = {
          x: selectedMapLocation.x,
          y: selectedMapLocation.y,
          floor: selectedMapLocation.floor || 1
        };
        
        setWorkerLocation(storageLocation);
        console.log(`🚶 Worker moved to storage location (${storageLocation.x}, ${storageLocation.y}, Floor ${storageLocation.floor})`);
        
        // Update worker location in database
        try {
          await workerLocationService.updateLocation(
            storageLocation.x,
            storageLocation.y,
            storageLocation.floor,
            'online'
          );
          console.log(`📡 Worker location updated in database after storage: (${storageLocation.x}, ${storageLocation.y}, Floor ${storageLocation.floor})`);
          
          // Show location update feedback
          toast(`📍 Worker location updated to ${locationId}`, {
            duration: 2000,
            icon: '🚶'
          });
        } catch (error) {
          console.warn(`⚠️ Failed to update worker location in database after storage:`, error);
          toast.error('Storage completed but failed to update worker location');
        }
      }
    }
  } catch (error) {
    console.error('Error marking item as stored/collected:', error);
    toast.error('Failed to process item');
  } finally {
    setMarkingAsStored(false);
  }
};

  // ✨ NEW: Handle order completion handover
  const handleCompleteHandover = async () => {
    if (!currentPickingOrder) return;
    
    try {
      console.log(`🤝 Completing handover for order ${currentPickingOrder.orderID}...`);
      
      const token = localStorage.getItem('token');
      
      // Update order status to completed/handed over
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/orders/${currentPickingOrder.orderID}/status?new_status=packing`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log(`✅ Order handover completed:`, response.data);
      
      toast.success(`🎉 Order #${currentPickingOrder.orderID} handed over to packing successfully!`);
      
      // Reset all picking states
      setPickingMode(false);
      setCurrentPickingOrder(null);
      setCurrentItemIndex(0);
      setSelectedStoringItem(null);
      setLocationId('');
      setSuggestedLocations([]);
      setSelectedMapLocation(null);
      setPickingPath(null);
      setCurrentDestination(null);
      setActionMode('storing'); // Reset to storing mode
      setPickingProgress({
        currentStep: 0,
        totalSteps: 0,
        completedItems: [],
        phase: 'completed'
      });
      
      // Update worker location to packing counter
      try {
        await workerLocationService.updateLocation(0, 11, 1, 'online');
        setWorkerLocation({ x: 0, y: 11, floor: 1 });
        console.log(`📡 Worker location updated to packing counter`);
      } catch (error) {
        console.warn(`⚠️ Failed to update worker location:`, error);
      }
      
      // Refresh orders list
      await fetchPendingOrders(true);
      
      // Exit fullscreen if active
      if (isFullscreen) {
        document.exitFullscreen();
      }
      
    } catch (error) {
      console.error('❌ Error completing handover:', error);
      toast.error(`Failed to complete handover: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Calculate suggested storage locations based on item type and quantity
  const calculateSuggestedLocations = (item) => {
    if (!item) return [];
    
    const quantity = item.quantity || 0;
    let requiredSquares = 0;
    let rackType = '';
    
    // Determine item size based on category or other logic
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

  // ✨ UPDATED: Handle opening store modal with real-time ML prediction
  const handleOpenStoreModal = async (item) => {
    setSelectedStoringItem(item);
    setActionMode('storing');
    
    // Clear previous selections
    setSelectedMapLocation(null);
    setLocationId('');
    setSuggestedLocations([]);

    // Show loading state
    toast.loading('Finding the optimal location for the item...', { id: 'ml-prediction' });

    try {
      // ✨ NEW: Call real-time ML prediction when "Store" is clicked
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/ai/predict-location`,
        {
          itemID: item.itemID,
          item_name: item.itemName,
          category: item.category || 'General',
          size: item.size || 'M',
          quantity: item.quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        const prediction = response.data;
        
        console.log('Real-time ML prediction:', prediction);

        // Set the predicted location
        setSelectedMapLocation({
          x: prediction.coordinates.x,
          y: prediction.coordinates.y,
          floor: prediction.coordinates.floor,
          locationCode: prediction.allocated_location
        });
        setLocationId(prediction.allocated_location);

        // Clear loading and show success
        toast.success(
          `AI recommends: ${prediction.allocated_location} (${(prediction.confidence * 100).toFixed(1)}% confidence)`,
          { id: 'ml-prediction', duration: 4000 }
        );

        // Also show detailed prediction info
        setTimeout(() => {
          toast(`Reason: ${prediction.allocation_reason}`, {
            icon: 'ℹ️',
            duration: 3000
          });
        }, 1000);

      } else {
        throw new Error(response.data?.error || 'ML prediction failed');
      }

    } catch (error) {
      console.error('Real-time ML prediction failed:', error);
      
      // Clear loading toast
      toast.dismiss('ml-prediction');
      
      // Show fallback message
      toast.error('AI prediction unavailable - please select location manually', {
        duration: 4000
      });

      // Use fallback location suggestions (your existing logic)
      const suggestions = calculateSuggestedLocations(item);
      setSuggestedLocations(suggestions);
      
      if (suggestions.length > 0) {
        setSelectedMapLocation({
          x: suggestions[0].x,
          y: suggestions[0].y,
          floor: suggestions[0].floor,
          locationCode: `${suggestions[0].rack}.1` // Default to floor 1
        });
        setLocationId(`${suggestions[0].rack}.1`);
        
        toast(`Using fallback suggestion: ${suggestions[0].rack}.1`, {
          icon: '💡',
          duration: 3000
        });
      }
    }
  };

  // Handle starting order picking
  const handleStartPickingEnhanced = async (order) => {
  try {
    setCurrentPickingOrder(order);
    setCurrentItemIndex(0);
    setPickingMode(true);

    console.log('Starting enhanced picking for order:', order);
    
    // Step 1: Get worker's current location from database
    let workerLoc = { x: 0, y: 0, floor: 1 }; // Default to receiving area
    try {
      const workerLocationResponse = await workerLocationService.getCurrentLocation();
      if (workerLocationResponse.success && workerLocationResponse.location) {
        workerLoc = {
          x: workerLocationResponse.location.x || 0,
          y: workerLocationResponse.location.y || 0,
          floor: workerLocationResponse.location.floor || 1
        };
        console.log('Worker location from DB:', workerLoc);
        // Fixed toast call
        toast(` Worker location: (${workerLoc.x}, ${workerLoc.y})`, { 
          duration: 3000,
          icon: 'ℹ️'
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch worker location, using default:', error);
      // Fixed toast call
      toast('Using default worker location (receiving area)', {
        duration: 3000,
        icon: '⚠️'
      });
    }
    
    setWorkerLocation(workerLoc);

    // Step 2: Fetch real item locations from inventory for each item in the order
    const token = localStorage.getItem('token');
    const itemsWithRealLocations = [];
    
    // Fixed toast call
    toast('Finding item locations...', { 
      id: 'finding-locations',
      duration: Infinity
    });
    
    for (const item of order.items) {
  try {
    console.log('🔍 Processing item:', item);
    
    // Get item location from inventory collection
    const inventoryResponse = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'}/inventory/${item.itemID}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (inventoryResponse.data && inventoryResponse.data.locationID) {
      console.log('🔍 Found inventory item:', inventoryResponse.data);
      
      // Parse location ID (e.g., "B01.1" -> coordinates)
      const locationCoords = parseLocationToCoordinates(inventoryResponse.data.locationID);
      
      itemsWithRealLocations.push({
        ...item,
        itemName: item.item_name || inventoryResponse.data.name || `Item ${item.itemID}`,
        locationID: inventoryResponse.data.locationID,
        coordinates: locationCoords,
        actualInventory: inventoryResponse.data
      });
      
      console.log(`📦 Item ${item.itemID} found at ${inventoryResponse.data.locationID}:`, locationCoords);
    } else {
      throw new Error('No location found in inventory');
    }
    
  } catch (error) {
    console.warn(`⚠️ Could not find real location for item ${item.itemID}, using fallback`);
    
    // ✨ ENHANCED: Better fallback location generation
    const fallbackLocation = calculateFallbackLocation(item.itemID);
    const fallbackCoords = parseLocationToCoordinates(fallbackLocation.locationID);
    
    itemsWithRealLocations.push({
      ...item,
      itemName: item.item_name || `Item ${item.itemID}`,
      locationID: fallbackLocation.locationID,
      coordinates: fallbackCoords, // ✅ Ensure coordinates are always set
      isFallback: true
    });
    
    console.log(`📦 Item ${item.itemID} using fallback ${fallbackLocation.locationID}:`, fallbackCoords);
  }
}

    toast.dismiss('finding-locations');
    
    // Step 3: Define packing counter location
    const packingCounter = { x: 0, y: 11, floor: 1 }; // Packing counter coordinates

    // Step 4: Calculate the complete picking path
    const completePath = calculatePickingPath(workerLoc, itemsWithRealLocations, packingCounter);
    
    setPickingPath(completePath);
    setPickingProgress({
      currentStep: 0,
      totalSteps: itemsWithRealLocations.length + 1, // +1 for final trip to packing
      completedItems: [],
      phase: 'picking'
    });

    // Update order with real locations
    setCurrentPickingOrder({
      ...order,
      items: itemsWithRealLocations
    });

    // Step 5: Start with first item
    if (itemsWithRealLocations.length > 0) {
      const firstItem = itemsWithRealLocations[0];
      
      setSelectedStoringItem(firstItem);
      setActionMode('collecting');
      
      // Set destination to first item with path from worker location
      setCurrentDestination({
        from: workerLoc,
        to: firstItem.coordinates,
        item: firstItem,
        stepNumber: 1,
        totalSteps: itemsWithRealLocations.length
      });
      
      setSelectedMapLocation({
        x: firstItem.coordinates.x,
        y: firstItem.coordinates.y,
        floor: firstItem.coordinates.floor,
        locationCode: firstItem.locationID
      });
      setLocationId(firstItem.locationID);
      
      toast.success(
        `Order #${order.orderID} started! Head to ${firstItem.locationID} for ${firstItem.itemName}`,
        { duration: 5000 }
      );
      
      // Fallback warning removed - estimated locations work fine
      // const fallbackItems = itemsWithRealLocations.filter(item => item.isFallback);
      // if (fallbackItems.length > 0) {
      //   toast(`⚠️ Using estimated locations for ${fallbackItems.length} item(s)`, { 
      //     duration: 4000,
      //     icon: '⚠️'
      //   });
      // }
      
      console.log(`Path: Worker (${workerLoc.x}, ${workerLoc.y}) → Item at (${firstItem.coordinates.x}, ${firstItem.coordinates.y})`);
    }
    
  } catch (error) {
    console.error('Error starting enhanced picking:', error);
    toast.error('Failed to start picking order');
    setPickingMode(false);
    setCurrentPickingOrder(null);
  }
};

  // Handle opening collect modal
  const handleOpenCollectModal = (item) => {
  console.log('🔍 Opening collect modal for item:', item);
  
  setSelectedStoringItem(item);
  setActionMode('collecting');
  setSuggestedLocations([]);
  
  // When in picking mode, set the path destination from item location
  if (pickingMode && item.locationID) {
    console.log('🔍 Setting location for picking mode:', item.locationID);
    
    // ✨ FIX: Don't try to parse locationID if it's already coordinates
    if (item.coordinates) {
      // Use existing coordinates
      console.log('🔍 Using existing coordinates:', item.coordinates);
      setSelectedMapLocation({
        x: item.coordinates.x,
        y: item.coordinates.y,
        floor: item.coordinates.floor || 1
      });
      setLocationId(item.locationID); // ✅ Access as property, not function
    } else {
      // Parse location ID to get coordinates (old logic)
      console.log('🔍 Parsing location ID:', item.locationID);
      
      try {
        const locationParts = item.locationID.split('-'); // ✅ Access as property
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
            setLocationId(item.locationID); // ✅ Access as property
            
            console.log('🔍 Parsed coordinates:', { x, y, floor });
          }
        }
      } catch (error) {
        console.error('🔍 Error parsing location ID:', error);
        // Fallback to default
        setSelectedMapLocation({ x: 0, y: 0, floor: 1 });
        setLocationId(item.locationID || 'Unknown'); // ✅ Access as property
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

  return (
    <div className="space-y-6">
      {/* ✨ NEW: Refresh indicator and manual refresh button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Picker Dashboard</h1>
          {backgroundRefreshing && (
            <div className="flex items-center text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {lastRefreshTime && (
            <span className="text-sm text-gray-500">
              Last updated: {lastRefreshTime}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={backgroundRefreshing}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

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

      {/* ✨ UPDATED: Tables Section with improved loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available for Storing Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Archive className="h-5 w-5 text-yellow-600 mr-2" />
                  Items Available for Storing
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Items ready for storing
                </p>
              </div>
              
              {/* ✨ NEW: Small refresh indicator */}
              {backgroundRefreshing && (
                <div className="flex items-center text-xs text-blue-600">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking for updates...
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {/* ✨ UPDATED: Only show loading spinner on initial load */}
            {initialLoading ? (
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
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
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
                        <div>
                          <div className="text-sm text-gray-900">{item.category}</div>
                          <div className="text-xs text-gray-500">Size: {item.size || 'M'}</div>
                        </div>
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
                          disabled={backgroundRefreshing && selectedStoringItem}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
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

        {/* Pending Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ClipboardList className="h-5 w-5 text-blue-600 mr-2" />
                  Pending Orders for Picking
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Orders ready for collection and packing
                </p>
              </div>
              
              {/* ✨ NEW: Small refresh indicator for orders */}
              {backgroundRefreshing && (
                <div className="flex items-center text-xs text-blue-600">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking for new orders...
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {/* ✨ UPDATED: Only show loading spinner on initial load */}
            {initialLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-gray-500">Loading orders...</span>
                </div>
              </div>
            ) : itemsData.pending_orders.length === 0 ? (
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
                          onClick={() => handleStartPickingEnhanced(order)}
                          disabled={backgroundRefreshing && selectedStoringItem}
                          className="flex items-center text-blue-600 hover:text-blue-900 disabled:opacity-50 transition-colors"
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
                        AI has selected the optimal available location
                      </p>
                    </div>
                  )}
                  
                  {/* ✨ NEW: Floor-by-Floor Slot Visualization */}
                  {actionMode === 'storing' && locationId && typeof locationId === 'string' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
                        <Layers className="w-4 h-4 mr-1" />
                        Slot Floor Details: {safeLocationSplit(locationId).base}
                      </h4>
                      
                      {/* Floor Rack Visualization */}
                      <div className="flex items-center space-x-4">
                        {/* Visual Rack Representation */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-600 mb-2">Rack View</span>
                          <div className="flex flex-col-reverse space-y-reverse space-y-1">
                            {[1, 2, 3, 4].map((floor) => {
                              const locationParts = safeLocationSplit(locationId);
                              const floorLocationId = `${locationParts.base}.${floor}`;
                              const isOccupied = (occupiedLocations && Array.isArray(occupiedLocations)) ? 
                                occupiedLocations.some(loc => 
                                  loc.coordinates?.x === selectedMapLocation?.x && 
                                  loc.coordinates?.y === selectedMapLocation?.y && 
                                  loc.coordinates?.floor === floor
                                ) : false;
                              const isRecommended = locationId === floorLocationId;
                              const occupiedInfo = (isOccupied && occupiedLocations) ? 
                                occupiedLocations.find(loc => 
                                  loc.coordinates?.x === selectedMapLocation?.x && 
                                  loc.coordinates?.y === selectedMapLocation?.y && 
                                  loc.coordinates?.floor === floor
                                ) : null;
                              
                              return (
                                <div
                                  key={floor}
                                  className={`
                                    w-16 h-8 border-2 rounded flex items-center justify-center text-xs font-medium
                                    ${isRecommended 
                                      ? 'border-green-500 bg-green-100 text-green-800 shadow-md' 
                                      : isOccupied 
                                        ? 'border-red-400 bg-red-100 text-red-800' 
                                        : 'border-gray-300 bg-white text-gray-600'
                                    }
                                  `}
                                  title={
                                    isRecommended 
                                      ? `Floor ${floor} - RECOMMENDED for new item`
                                      : isOccupied 
                                        ? `Floor ${floor} - Occupied by ${occupiedInfo?.itemName} (${occupiedInfo?.quantity} units)`
                                        : `Floor ${floor} - Available`
                                  }
                                >
                                  F{floor}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500 mt-2">Ground Level</span>
                        </div>
                        
                        {/* Floor Status Legend */}
                        <div className="flex-1 space-y-2">
                          {[1, 2, 3, 4].map((floor) => {
                            const locationParts = safeLocationSplit(locationId);
                            const floorLocationId = `${locationParts.base}.${floor}`;
                            const isOccupied = occupiedLocations.some(loc => 
                              loc.coordinates.x === selectedMapLocation?.x && 
                              loc.coordinates.y === selectedMapLocation?.y && 
                              loc.coordinates.floor === floor
                            );
                            const isRecommended = locationId === floorLocationId;
                            const occupiedInfo = isOccupied ? occupiedLocations.find(loc => 
                              loc.coordinates.x === selectedMapLocation?.x && 
                              loc.coordinates.y === selectedMapLocation?.y && 
                              loc.coordinates.floor === floor
                            ) : null;
                            
                            return (
                              <div key={floor} className="flex items-center space-x-3">
                                <div className={`
                                  w-3 h-3 rounded-full border-2
                                  ${isRecommended 
                                    ? 'bg-green-500 border-green-600' 
                                    : isOccupied 
                                      ? 'bg-red-500 border-red-600' 
                                      : 'bg-gray-200 border-gray-300'
                                  }
                                `}></div>
                                <div className="flex-1">
                                  <span className={`text-sm font-medium ${
                                    isRecommended ? 'text-green-800' : 
                                    isOccupied ? 'text-red-800' : 'text-gray-600'
                                  }`}>
                                    {floorLocationId}
                                  </span>
                                  <span className={`ml-2 text-xs ${
                                    isRecommended ? 'text-green-700' : 
                                    isOccupied ? 'text-red-700' : 'text-gray-500'
                                  }`}>
                                    {isRecommended 
                                      ? '← Store here' 
                                      : isOccupied 
                                        ? `${occupiedInfo?.itemName} (${occupiedInfo?.quantity})` 
                                        : 'Available'
                                    }
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Helpful Instructions */}
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          💡 <strong>Instructions:</strong> Place your item on floor <strong>{safeLocationSplit(locationId).floor}</strong> of slot <strong>{safeLocationSplit(locationId).base}</strong>. 
                          Green indicates the optimal floor for seasonal storage efficiency.
                        </p>
                      </div>
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
                  
                  {/* ✨ NEW: Floor-by-Floor Collection Visualization */}
                  {actionMode === 'collecting' && selectedStoringItem?.locationID && typeof selectedStoringItem.locationID === 'string' && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                        <Layers className="w-4 h-4 mr-1" />
                        Collection Floor Details: {safeLocationSplit(selectedStoringItem.locationID).base}
                      </h4>
                      
                      {/* Floor Rack Visualization for Collection */}
                      <div className="flex items-center space-x-4">
                        {/* Visual Rack Representation */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-600 mb-2">Rack View</span>
                          <div className="flex flex-col-reverse space-y-reverse space-y-1">
                            {[1, 2, 3, 4].map((floor) => {
                              const locationParts = safeLocationSplit(selectedStoringItem.locationID);
                              const floorLocationId = `${locationParts.base}.${floor}`;
                              const isTargetFloor = selectedStoringItem.locationID === floorLocationId;
                              const isOccupied = occupiedLocations.some(loc => 
                                loc.coordinates.x === selectedMapLocation?.x && 
                                loc.coordinates.y === selectedMapLocation?.y && 
                                loc.coordinates.floor === floor
                              );
                              const occupiedInfo = isOccupied ? occupiedLocations.find(loc => 
                                loc.coordinates.x === selectedMapLocation?.x && 
                                loc.coordinates.y === selectedMapLocation?.y && 
                                loc.coordinates.floor === floor
                              ) : null;
                              
                              return (
                                <div
                                  key={floor}
                                  className={`
                                    w-16 h-8 border-2 rounded flex items-center justify-center text-xs font-medium
                                    ${isTargetFloor 
                                      ? 'border-orange-500 bg-orange-100 text-orange-800 shadow-md' 
                                      : isOccupied 
                                        ? 'border-blue-400 bg-blue-100 text-blue-800' 
                                        : 'border-gray-300 bg-white text-gray-600'
                                    }
                                  `}
                                  title={
                                    isTargetFloor 
                                      ? `Floor ${floor} - COLLECT FROM HERE`
                                      : isOccupied 
                                        ? `Floor ${floor} - Contains ${occupiedInfo?.itemName} (${occupiedInfo?.quantity} units)`
                                        : `Floor ${floor} - Empty`
                                  }
                                >
                                  F{floor}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500 mt-2">Ground Level</span>
                        </div>
                        
                        {/* Floor Status Legend for Collection */}
                        <div className="flex-1 space-y-2">
                          {[1, 2, 3, 4].map((floor) => {
                            const locationParts = safeLocationSplit(selectedStoringItem.locationID);
                            const floorLocationId = `${locationParts.base}.${floor}`;
                            const isTargetFloor = selectedStoringItem.locationID === floorLocationId;
                            const isOccupied = occupiedLocations.some(loc => 
                              loc.coordinates.x === selectedMapLocation?.x && 
                              loc.coordinates.y === selectedMapLocation?.y && 
                              loc.coordinates.floor === floor
                            );
                            const occupiedInfo = isOccupied ? occupiedLocations.find(loc => 
                              loc.coordinates.x === selectedMapLocation?.x && 
                              loc.coordinates.y === selectedMapLocation?.y && 
                              loc.coordinates.floor === floor
                            ) : null;
                            
                            return (
                              <div key={floor} className="flex items-center space-x-3">
                                <div className={`
                                  w-3 h-3 rounded-full border-2
                                  ${isTargetFloor 
                                    ? 'bg-orange-500 border-orange-600' 
                                    : isOccupied 
                                      ? 'bg-blue-500 border-blue-600' 
                                      : 'bg-gray-200 border-gray-300'
                                  }
                                `}></div>
                                <div className="flex-1">
                                  <span className={`text-sm font-medium ${
                                    isTargetFloor ? 'text-orange-800' : 
                                    isOccupied ? 'text-blue-800' : 'text-gray-600'
                                  }`}>
                                    {floorLocationId}
                                  </span>
                                  <span className={`ml-2 text-xs ${
                                    isTargetFloor ? 'text-orange-700' : 
                                    isOccupied ? 'text-blue-700' : 'text-gray-500'
                                  }`}>
                                    {isTargetFloor 
                                      ? '← Collect from here' 
                                      : isOccupied 
                                        ? `${occupiedInfo?.itemName} (${occupiedInfo?.quantity})` 
                                        : 'Empty'
                                    }
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Collection Instructions */}
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-800">
                          📦 <strong>Collection:</strong> Retrieve <strong>{selectedStoringItem.itemName}</strong> from floor <strong>{safeLocationSplit(selectedStoringItem.locationID).floor}</strong> of slot <strong>{safeLocationSplit(selectedStoringItem.locationID).base}</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Selected Location Code</label>
                    <input
                      type="text"
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      placeholder="AI will predict optimal location"
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

                    workerLocation={pickingMode ? workerLocation : null}
                    pickingPath={pickingPath}
                    currentDestination={currentDestination}
                    pickingMode={pickingMode}
                    pickingProgress={pickingProgress}
                    showPathfinding={pickingMode && currentDestination}
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
                  onClick={() => {
                    // Different action based on mode
                    if (pickingMode && actionMode === 'completing') {
                      handleCompleteHandover(); // Use new completion function
                    } else {
                      handleMarkAsStored(selectedStoringItem); // Original function
                    }
                  }}
                  disabled={(!pickingMode && actionMode === 'storing' && !locationId) || markingAsStored}
                  className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    pickingMode ? 'bg-green-600 text-white hover:bg-green-700' :
                    actionMode === 'storing' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {pickingMode ? 
                    (actionMode === 'completing' ? 
                      (markingAsStored ? 'Completing Handover...' : 'Complete Handover') :
                      (currentItemIndex < currentPickingOrder?.items?.length - 1 ? 
                        (markingAsStored ? 'Processing...' : 'Collect & Next Item') : 
                        (markingAsStored ? 'Processing...' : 'Collect & Go to Packing')
                      )
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
      
      {/* ✨ NEW: Floating map for packing counter path when completing order */}
      {pickingMode && actionMode === 'completing' && currentPickingOrder && !selectedStoringItem && (
        <div className="fixed inset-4 bg-white rounded-lg shadow-2xl z-40 flex flex-col max-h-screen">
          <div className="flex items-center justify-between p-4 border-b bg-green-50 flex-shrink-0">
            <div>
              <h3 className="text-lg font-medium text-green-900">
                🎯 Order #{currentPickingOrder.orderID} - All Items Collected!
              </h3>
              <p className="text-sm text-green-700">
                Follow the path to the packing counter to complete your order
              </p>
            </div>
            <button
              onClick={() => {
                setPickingMode(false);
                setCurrentPickingOrder(null);
                setPickingPath(null);
                setCurrentDestination(null);
                setActionMode('storing');
              }}
              className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-lg transition-colors"
              title="Close and cancel order"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto min-h-0">
            <WarehouseMap 
              onLocationSelect={() => {}} // No location selection needed
              suggestedLocations={[]}
              showSuggestions={false}
              mode="completing"
              pathDestination={null}
              workerLocation={workerLocation}
              pickingPath={pickingPath}
              currentDestination={currentDestination}
              pickingMode={true}
              pickingProgress={pickingProgress}
              showPathfinding={true}
            />
          </div>
          
          <div className="border-t p-4 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <div className="text-sm text-gray-600">
              📍 Navigate from your current location to the packing counter (purple path)
            </div>
            <button
              onClick={handleCompleteHandover}
              disabled={markingAsStored}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
            >
              {markingAsStored ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <span>📦</span>
                  <span>Complete Handover</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Completion Button - Shows when modal is open or as fallback */}
      {pickingMode && actionMode === 'completing' && currentPickingOrder && selectedStoringItem && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleCompleteHandover}
            disabled={markingAsStored}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center space-x-2 text-lg"
          >
            {markingAsStored ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Completing Order...</span>
              </>
            ) : (
              <>
                <span>📦</span>
                <span>Complete Handover</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PickerDashboard;