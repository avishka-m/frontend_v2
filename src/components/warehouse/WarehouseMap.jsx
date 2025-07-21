import React, { useState, useEffect } from 'react';
import { Package, Layers, MapPin, Archive, Info, Navigation } from 'lucide-react';
import axios from 'axios';

// Storage capacity constants - easy to modify
const STORAGE_CAPACITY = {
  PELLET_PER_SQUARE: 50,    // Small items per pellet square
  BIN_PER_SQUARE: 50,        // Medium items per bin square
  LARGE_PER_SQUARE: 50       // Large items per large square
};

const WarehouseMap = ({ 
  onLocationSelect, 
  suggestedLocations = null, 
  showSuggestions = false,
  mode = 'normal', // 'storing' or 'collecting'
  pathDestination = null,
  // ✨ NEW: Pathfinding props
  workerLocation = null,
  pickingPath = null,
  currentDestination = null,
  pickingMode = false,
  pickingProgress = null,
  showPathfinding = false
}) => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [occupiedLocations, setOccupiedLocations] = useState([]);
  const [hoveredOccupiedInfo, setHoveredOccupiedInfo] = useState(null);

  // Define warehouse dimensions
  const WAREHOUSE_WIDTH = 10;
  const WAREHOUSE_HEIGHT = 12;
  const FLOORS = 4;

  // ✨ Individual slot mapping according to your requirements
  const getSlotMapping = () => {
    const slots = [];
    
    // B slots (Medium/Bin) - 3 columns: B01-B07, B08-B14, B15-B21
    // ✨ SEASONAL OPTIMIZATION: Higher numbers closer to packing point (0,11)
    // Column 1: x=1, y=8-2 (B07-B01) - B07 closest to packing at y=8
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `B${String(7 - i).padStart(2, '0')}`, // B07, B06, B05, B04, B03, B02, B01
        x: 1,
        y: 8 - i, // y=8,7,6,5,4,3,2 - B07 at y=8 (closest to packing at y=11)
        type: 'M',
        rackGroup: 'B1'
      });
    }
    
    // Column 2: x=3, y=8-2 (B14-B08) - B14 closest to packing at y=8
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `B${String(14 - i).padStart(2, '0')}`, // B14, B13, B12, B11, B10, B09, B08
        x: 3,
        y: 8 - i, // y=8,7,6,5,4,3,2 - B14 at y=8 (closest to packing at y=11)
        type: 'M',
        rackGroup: 'B2'
      });
    }
    
    // Column 3: x=5, y=8-2 (B21-B15) - B21 closest to packing at y=8
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `B${String(21 - i).padStart(2, '0')}`, // B21, B20, B19, B18, B17, B16, B15
        x: 5,
        y: 8 - i, // y=8,7,6,5,4,3,2 - B21 at y=8 (closest to packing at y=11)
        type: 'M',
        rackGroup: 'B3'
      });
    }
    
    // P slots (Small/Pellet) - 2 columns: P01-P07, P08-P14
    // ✨ SEASONAL OPTIMIZATION: Higher numbers closer to packing point (0,11)
    // Column 1: x=7, y=8-2 (P07-P01) - P07 closest to packing at y=8
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `P${String(7 - i).padStart(2, '0')}`, // P07, P06, P05, P04, P03, P02, P01
        x: 7,
        y: 8 - i, // y=8,7,6,5,4,3,2 - P07 at y=8 (closest to packing at y=11)
        type: 'S',
        rackGroup: 'P1'
      });
    }
    
    // Column 2: x=9, y=8-2 (P14-P08) - P14 closest to packing at y=8
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `P${String(14 - i).padStart(2, '0')}`, // P14, P13, P12, P11, P10, P09, P08
        x: 9,
        y: 8 - i, // y=8,7,6,5,4,3,2 - P14 at y=8 (closest to packing at y=11)
        type: 'S',
        rackGroup: 'P2'
      });
    }
    
    // D slots (Large) - 2 rows: D01-D07, D08-D14
    // ✨ SEASONAL OPTIMIZATION: Higher numbers closer to packing point (0,11)
    // Row 1: y=10, x=3-9 (D07-D01) - D07 closest to packing at x=9
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `D${String(7 - i).padStart(2, '0')}`, // D07, D06, D05, D04, D03, D02, D01
        x: 9 - i, // x=9,8,7,6,5,4,3 - D07 at x=9 (closest to packing at x=0)
        y: 10,
        type: 'D',
        rackGroup: 'D1'
      });
    }
    
    // Row 2: y=11, x=3-9 (D14-D08) - D14 closest to packing at x=9
    for (let i = 0; i < 7; i++) {
      slots.push({
        code: `D${String(14 - i).padStart(2, '0')}`, // D14, D13, D12, D11, D10, D09, D08
        x: 9 - i, // x=9,8,7,6,5,4,3 - D14 at x=9 (closest to packing at x=0)
        y: 11,
        type: 'D',
        rackGroup: 'D2'
      });
    }
    
    return slots;
  };

  const slotMapping = getSlotMapping();

  // Update selected suggestions when suggestedLocations changes
  useEffect(() => {
    if (suggestedLocations && showSuggestions) {
      setSelectedSuggestions(suggestedLocations);
    } else {
      setSelectedSuggestions([]);
    }
  }, [suggestedLocations, showSuggestions]);

  // Fetch occupied locations
  useEffect(() => {
    fetchOccupiedLocations();
  }, [selectedFloor]);

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
    }
  };

  // Get slot info by coordinates
  const getSlotInfo = (x, y) => {
    return slotMapping.find(slot => slot.x === x && slot.y === y);
  };

  // Generate location code for individual slots with floors
  const getLocationCode = (slotCode, floor) => {
    return `${slotCode}.${floor}`; // e.g., B01.1, B01.2, P01.3, D01.4
  };

  // Check if a location is suggested
  const isSuggestedLocation = (x, y, floor) => {
    return selectedSuggestions.some(loc => 
      loc.x === x && loc.y === y && loc.floor === floor
    );
  };

  // Check if a location is occupied
  const isOccupiedLocation = (x, y, floor) => {
    return occupiedLocations.some(loc => 
      loc.coordinates.x === x && 
      loc.coordinates.y === y && 
      loc.coordinates.floor === floor
    );
  };

  // Get occupied location info
  const getOccupiedInfo = (x, y, floor) => {
    return occupiedLocations.find(loc => 
      loc.coordinates.x === x && 
      loc.coordinates.y === y && 
      loc.coordinates.floor === floor
    );
  };
  
  // Get occupancy percentage for a location
  const getOccupancyPercentage = (occupiedInfo, slotInfo) => {
    if (!occupiedInfo || !occupiedInfo.quantity) return 0;
    
    let capacity = STORAGE_CAPACITY.BIN_PER_SQUARE; // Default
    if (slotInfo) {
      if (slotInfo.type === 'S') capacity = STORAGE_CAPACITY.PELLET_PER_SQUARE;
      else if (slotInfo.type === 'M') capacity = STORAGE_CAPACITY.BIN_PER_SQUARE;
      else if (slotInfo.type === 'D') capacity = STORAGE_CAPACITY.LARGE_PER_SQUARE;
    }
    
    return Math.min(100, Math.round((occupiedInfo.quantity / capacity) * 100));
  };
  
  // Get color based on occupancy
  const getOccupancyColor = (percentage) => {
    if (percentage === 0) return '';
    if (percentage < 50) return 'bg-yellow-500'; // Partially filled
    if (percentage < 80) return 'bg-orange-500'; // Getting full
    return 'bg-red-600'; // Full or nearly full
  };

  // Get slot color based on type
  const getSlotColor = (slotType) => {
    switch (slotType) {
      case 'S': return 'bg-blue-500'; // Small/Pellet
      case 'M': return 'bg-green-500'; // Medium/Bin
      case 'D': return 'bg-purple-500'; // Large
      default: return 'bg-gray-500';
    }
  };

  // Get slot hover color based on type
  const getSlotHoverColor = (slotType) => {
    switch (slotType) {
      case 'S': return 'hover:bg-blue-600';
      case 'M': return 'hover:bg-green-600';
      case 'D': return 'hover:bg-purple-600';
      default: return 'hover:bg-gray-600';
    }
  };

  // Calculate pixel position for a grid cell (for drawing lines)
  const getCellCenter = (x, y) => {
    const cellSize = 40;
    const centerX = x * cellSize + cellSize / 2;
    const centerY = (WAREHOUSE_HEIGHT - 1 - y) * cellSize + cellSize / 2;
    return { x: centerX, y: centerY };
  };

  // Check if a cell is walkable (not a rack and not occupied)
  const isWalkable = (x, y) => {
    if (x < 0 || x >= WAREHOUSE_WIDTH || y < 0 || y >= WAREHOUSE_HEIGHT) {
      return false;
    }
    
    // Check if it's a slot
    const slotInfo = getSlotInfo(x, y);
    if (slotInfo) return false;
    
    return true;
  };

  // ✨ ENHANCED: A* pathfinding algorithm
  const findPath = (startX, startY, endX, endY) => {
    class Node {
      constructor(x, y, g = 0, h = 0, parent = null) {
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.parent = parent;
      }
    }

    const heuristic = (x1, y1, x2, y2) => {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };

    const getNeighbors = (node) => {
      const neighbors = [];
      const directions = [
        { x: 0, y: 1 },   // Up
        { x: 1, y: 0 },   // Right
        { x: 0, y: -1 },  // Down
        { x: -1, y: 0 }   // Left
      ];

      for (const dir of directions) {
        const newX = node.x + dir.x;
        const newY = node.y + dir.y;
        
        if ((newX === endX && newY === endY) || isWalkable(newX, newY)) {
          neighbors.push({ x: newX, y: newY });
        }
      }

      return neighbors;
    };

    const openList = [];
    const closedList = new Set();
    
    const startNode = new Node(startX, startY, 0, heuristic(startX, startY, endX, endY));
    openList.push(startNode);

    while (openList.length > 0) {
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentIndex].f) {
          currentIndex = i;
        }
      }

      const currentNode = openList.splice(currentIndex, 1)[0];
      
      if (currentNode.x === endX && currentNode.y === endY) {
        const path = [];
        let node = currentNode;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }

      closedList.add(`${currentNode.x},${currentNode.y}`);

      const neighbors = getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        
        if (closedList.has(key)) continue;

        const g = currentNode.g + 1;
        const h = heuristic(neighbor.x, neighbor.y, endX, endY);
        
        const existingIndex = openList.findIndex(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (existingIndex === -1) {
          openList.push(new Node(neighbor.x, neighbor.y, g, h, currentNode));
        } else if (g < openList[existingIndex].g) {
          openList[existingIndex].g = g;
          openList[existingIndex].f = g + h;
          openList[existingIndex].parent = currentNode;
        }
      }
    }

    return [{ x: startX, y: startY }, { x: endX, y: endY }];
  };

  // ✨ NEW: Render picking path visualization
  const renderPickingPath = () => {
    if (!showPathfinding || !currentDestination) return null;

    const pathPoints = findPath(
      currentDestination.from.x, 
      currentDestination.from.y, 
      currentDestination.to.x, 
      currentDestination.to.y
    );

    if (!pathPoints || pathPoints.length < 2) return null;

    const pixelPath = pathPoints.map(point => getCellCenter(point.x, point.y));
    
    let pathString = `M ${pixelPath[0].x} ${pixelPath[0].y}`;
    for (let i = 1; i < pixelPath.length; i++) {
      pathString += ` L ${pixelPath[i].x} ${pixelPath[i].y}`;
    }
    
    const startPoint = pixelPath[0];
    const endPoint = pixelPath[pixelPath.length - 1];
    
    return (
      <g>
        {/* Path visualization dots */}
        {pathPoints.map((point, index) => {
          if (index === 0 || index === pathPoints.length - 1) return null;
          const center = getCellCenter(point.x, point.y);
          return (
            <circle
              key={`picking-path-${index}`}
              cx={center.x}
              cy={center.y}
              r="3"
              fill="#8B5CF6"
              opacity="0.7"
            />
          );
        })}
        
        {/* Background white line for contrast */}
        <path
          d={pathString}
          stroke="white"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Main colored path line with arrow */}
        <path
          d={pathString}
          stroke="#8B5CF6"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8,4"
          markerEnd="url(#picking-arrowhead)"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;12"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Worker position (Start point) */}
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r="8"
          fill="#3B82F6"
          stroke="white"
          strokeWidth="3"
        >
          <animate
            attributeName="r"
            values="8;10;8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Target position (End point) */}
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r="8"
          fill="#10B981"
          stroke="white"
          strokeWidth="3"
        >
          <animate
            attributeName="r"
            values="8;10;8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Step number indicator */}
        {currentDestination.stepNumber && (
          <g>
            <circle
              cx={endPoint.x}
              cy={endPoint.y - 15}
              r="10"
              fill="#F59E0B"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={endPoint.x}
              y={endPoint.y - 11}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
            >
              {currentDestination.stepNumber}
            </text>
          </g>
        )}
      </g>
    );
  };

  // Handle cell click
  const handleCellClick = (x, y) => {
    if (mode === 'storing' && isOccupiedLocation(x, y, selectedFloor)) {
      return;
    }
    
    const slotInfo = getSlotInfo(x, y);
    if (slotInfo) {
      const location = {
        x,
        y,
        floor: selectedFloor,
        locationCode: getLocationCode(slotInfo.code, selectedFloor),
        slotCode: slotInfo.code,
        type: slotInfo.type,
        rackGroup: slotInfo.rackGroup
      };
      setSelectedLocation(location);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    }
  };

  // Render grid
  const renderGrid = () => {
    const grid = [];
    
    for (let y = WAREHOUSE_HEIGHT - 1; y >= 0; y--) {
      const row = [];
      for (let x = 0; x < WAREHOUSE_WIDTH; x++) {
        const slotInfo = getSlotInfo(x, y);
        const isReceiving = x === 0 && y === 0;
        const isPacking = x === 0 && y === 11;

        const isSelected = selectedLocation && 
          selectedLocation.x === x && 
          selectedLocation.y === y && 
          selectedLocation.floor === selectedFloor;
        const isHovered = hoveredLocation && 
          hoveredLocation.x === x && 
          hoveredLocation.y === y;
        const isSuggested = showSuggestions && isSuggestedLocation(x, y, selectedFloor);
        const isOccupied = isOccupiedLocation(x, y, selectedFloor);
        const occupiedInfo = isOccupied ? getOccupiedInfo(x, y, selectedFloor) : null;
        const occupancyPercentage = occupiedInfo ? getOccupancyPercentage(occupiedInfo, slotInfo) : 0;
        const occupancyColor = getOccupancyColor(occupancyPercentage);

        // ✨ NEW: Check if this is the worker location
        const isWorkerLocation = workerLocation && 
          workerLocation.x === x && 
          workerLocation.y === y;

        row.push(
          <div
            key={`${x}-${y}`}
            className={`
              w-10 h-10 border border-gray-300 flex items-center justify-center text-xs cursor-pointer
              transition-all duration-150
              ${isReceiving ? 'bg-red-500 text-white' : ''}
              ${isPacking ? 'bg-orange-500 text-white' : ''}
              ${isWorkerLocation ? 'bg-blue-600 text-white ring-2 ring-blue-300' : ''}
              ${slotInfo && !isReceiving && !isPacking && !isOccupied && !isWorkerLocation ? `${getSlotColor(slotInfo.type)} text-white ${getSlotHoverColor(slotInfo.type)}` : ''}
              ${slotInfo && isOccupied ? `${occupancyColor} text-white` : ''}
              ${!slotInfo && !isReceiving && !isPacking && !isWorkerLocation ? 'bg-gray-100 hover:bg-gray-200' : ''}
              ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
              ${isHovered && slotInfo ? 'transform scale-105' : ''}
              ${isSuggested ? 'ring-2 ring-green-400 ring-offset-1 animate-pulse' : ''}
              ${mode === 'storing' && isOccupied ? 'cursor-not-allowed opacity-75' : ''}
            `}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => {
              setHoveredLocation({ x, y });
              if (isOccupied && occupiedInfo) {
                setHoveredOccupiedInfo(occupiedInfo);
              }
            }}
            onMouseLeave={() => {
              setHoveredLocation(null);
              setHoveredOccupiedInfo(null);
            }}
            title={
              isWorkerLocation 
                ? `Worker Location (${x},${y})`
                : slotInfo 
                  ? (isOccupied && occupiedInfo 
                      ? `${getLocationCode(slotInfo.code, selectedFloor)} - ${occupiedInfo.itemName} (${occupiedInfo.quantity} units - ${occupancyPercentage}% full)` 
                      : getLocationCode(slotInfo.code, selectedFloor))
                  : isReceiving 
                    ? 'Receiving Point (R)' 
                    : isPacking 
                      ? 'Packing Point (P)' 
                      : `Empty (${x},${y})`
            }
          >
            {isReceiving && (
              <div className="flex flex-col items-center">
                <Archive className="w-6 h-6" />
                <span className="text-[8px] font-bold">R</span>
              </div>
            )}
            {isPacking && (
              <div className="flex flex-col items-center">
                <Package className="w-6 h-6" />
                <span className="text-[8px] font-bold">P</span>
              </div>
            )}
            {isWorkerLocation && (
              <div className="flex flex-col items-center">
                <Navigation className="w-6 h-6" />
                <span className="text-[8px] font-bold">W</span>
              </div>
            )}
            {slotInfo && !isReceiving && !isPacking && !isWorkerLocation && (
              <span className="font-semibold text-[8px] leading-none">
                {slotInfo.code}
              </span>
            )}
          </div>
        );
      }
      grid.push(
        <div key={`row-${y}`} className="flex">
          {row}
        </div>
      );
    }
    
    return grid;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="mb-6">
        
        {/* ✨ NEW: Picking mode header */}
        {pickingMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Picking Mode Active</span>
              </div>
              {pickingProgress && (
                <div className="text-sm text-blue-700">
                  Step {pickingProgress.currentStep}/{pickingProgress.totalSteps}
                </div>
              )}
            </div>
            {currentDestination && (
              <div className="mt-2 text-sm text-blue-700">
                {currentDestination.description || 'Navigate to highlighted destination'}
              </div>
            )}
          </div>
        )}
        
        {/* Floor Selector */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Floor Level:</span>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition-colors
                  ${selectedFloor === floor 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                F{floor}
              </button>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Layers className="w-4 h-4 mr-1" />
             <span>4 floors per slot (e.g., B01.1, B01.2, B01.3, B01.4)</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Receiving Point (R)</span>
          </div>
           <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">Packing Point (P)</span>
          </div>
          {pickingMode && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm text-gray-600">Worker Location (W)</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Small (P01-P14) - Pellets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Medium (B01-B21) - Bin</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Large (D01-D14)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-600">Occupied</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block relative min-h-full">
          {/* Y-axis labels */}
          <div className="flex">
            <div className="w-8 pr-2">
              {Array.from({ length: WAREHOUSE_HEIGHT }, (_, i) => WAREHOUSE_HEIGHT - i - 1).map((y) => (
                <div key={`y-${y}`} className="h-10 flex items-center justify-end text-xs text-gray-500">
                  {y}
                </div>
              ))}
            </div>
            
            {/* Grid with SVG overlay */}
            <div className="relative">
              {renderGrid()}
              
              {/* ✨ ENHANCED: SVG Overlay for pathfinding */}
              {(mode === 'storing' || mode === 'collecting' || showPathfinding) && (
                <svg 
                  className="absolute top-0 left-0 pointer-events-none"
                  width={WAREHOUSE_WIDTH * 40}
                  height={WAREHOUSE_HEIGHT * 40}
                  style={{ zIndex: 10 }}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={mode === 'storing' ? '#3B82F6' : '#10B981'}
                      />
                    </marker>
                    {/* ✨ NEW: Arrow for picking paths */}
                    <marker
                      id="picking-arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#8B5CF6"
                      />
                    </marker>
                  </defs>
                  
                  {/* ✨ NEW: Render picking path if in picking mode */}
                  {showPathfinding && renderPickingPath()}
                  
                  {/* Original storing/collecting path logic */}
                  {!showPathfinding && pathDestination && (() => {
                    let pathPoints = [];
                    
                    if (mode === 'storing') {
                      pathPoints = findPath(0, 0, pathDestination.x, pathDestination.y);
                    } else if (mode === 'collecting') {
                      pathPoints = findPath(pathDestination.x, pathDestination.y, 0, 11);
                    }
                    
                    if (pathPoints && pathPoints.length > 1) {
                      const pixelPath = pathPoints.map(point => getCellCenter(point.x, point.y));
                      
                      let pathString = `M ${pixelPath[0].x} ${pixelPath[0].y}`;
                      for (let i = 1; i < pixelPath.length; i++) {
                        pathString += ` L ${pixelPath[i].x} ${pixelPath[i].y}`;
                      }
                      
                      const startPoint = pixelPath[0];
                      const endPoint = pixelPath[pixelPath.length - 1];
                      
                      return (
                        <g>
                          {/* Path visualization dots */}
                          {pathPoints.map((point, index) => {
                            if (index === 0 || index === pathPoints.length - 1) return null;
                            const center = getCellCenter(point.x, point.y);
                            return (
                              <circle
                                key={`path-${index}`}
                                cx={center.x}
                                cy={center.y}
                                r="2"
                                fill={mode === 'storing' ? '#93C5FD' : '#86EFAC'}
                                opacity="0.5"
                              />
                            );
                          })}
                          
                          {/* Background white line for contrast */}
                          <path
                            d={pathString}
                            stroke="white"
                            strokeWidth="5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Main colored path line with arrow */}
                          <path
                            d={pathString}
                            stroke={mode === 'storing' ? '#3B82F6' : '#10B981'}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="5,5"
                            markerEnd="url(#arrowhead)"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              values="0;10"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </path>
                          
                          {/* Start point */}
                          <circle
                            cx={startPoint.x}
                            cy={startPoint.y}
                            r="6"
                            fill={mode === 'storing' ? '#EF4444' : '#3B82F6'}
                            stroke="white"
                            strokeWidth="2"
                          />
                          
                          {/* End point */}
                          <circle
                            cx={endPoint.x}
                            cy={endPoint.y}
                            r="6"
                            fill={mode === 'storing' ? '#3B82F6' : '#F97316'}
                            stroke="white"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    }
                    return null;
                  })()}
                </svg>
              )}
              
              {/* ✨ NEW: Picking progress indicator */}
              {pickingMode && pickingProgress && (
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
                  <div className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <Navigation className="w-4 h-4 mr-1" />
                    Picking Progress
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(pickingProgress.currentStep / pickingProgress.totalSteps) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {pickingProgress.currentStep}/{pickingProgress.totalSteps}
                    </span>
                  </div>
                  {currentDestination && (
                    <div className="text-xs text-gray-600 mt-1">
                      Step {currentDestination.stepNumber}: {
                        currentDestination.description || 
                        (currentDestination.item?.locationID 
                          ? `Navigate to ${currentDestination.item.locationID}`
                          : 'Navigate to destination')
                      }
                    </div>
                  )}
                </div>
              )}
              
              {/* X-axis labels */}
              <div className="flex mt-1">
                {Array.from({ length: WAREHOUSE_WIDTH }, (_, i) => i).map((x) => (
                  <div key={`x-${x}`} className="w-10 text-center text-xs text-gray-500">
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Selected Location</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Location Code:</span>
              <span className="ml-2 font-medium">{selectedLocation.locationCode}</span>
            </div>
            <div>
              <span className="text-gray-600">Slot:</span>
              <span className="ml-2 font-medium">{selectedLocation.slotCode}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium">{selectedLocation.type}</span>
            </div>
            <div>
              <span className="text-gray-600">Coordinates:</span>
              <span className="ml-2 font-medium">({selectedLocation.x}, {selectedLocation.y})</span>
            </div>
            <div>
              <span className="text-gray-600">Floor:</span>
              <span className="ml-2 font-medium">F{selectedLocation.floor}</span>
            </div>
            <div>
              <span className="text-gray-600">Rack Group:</span>
              <span className="ml-2 font-medium">{selectedLocation.rackGroup}</span>
            </div>
          </div>
        </div>
      )}

      {/* ✨ NEW: Worker Location Info */}
      {pickingMode && workerLocation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Navigation className="w-4 h-4 mr-1" />
            Worker Location
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Position:</span>
              <span className="ml-2 font-medium text-blue-900">({workerLocation.x}, {workerLocation.y})</span>
            </div>
            <div>
              <span className="text-blue-700">Floor:</span>
              <span className="ml-2 font-medium text-blue-900">F{workerLocation.floor}</span>
            </div>
          </div>
          {currentDestination && (
            <div className="mt-2 text-sm">
              <span className="text-blue-700">Next Destination:</span>
              <span className="ml-2 font-medium text-blue-900">
                {currentDestination.item?.locationID || `(${currentDestination.to.x}, ${currentDestination.to.y})`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Individual Slot Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>P01-P14 (Small/Pellet)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>B01-B21 (Medium/Bin)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span>D01-D14 (Large)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span>Partially Filled (&lt;50%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span>Getting Full (50-80%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
            <span>Full/Nearly Full (&gt;80%)</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <p>Each slot has 4 floors: e.g., B01.1, B01.2, B01.3, B01.4</p>
          <p>All floors of same slot share coordinates but different storage levels</p>
          {pickingMode && (
            <p className="text-blue-600 font-medium">Purple path shows optimal route to next item</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          Click on any storage slot to select it. Use floor buttons to view different levels.
        </p>
        {mode === 'storing' && !pickingMode && (
          <p className="flex items-center mt-1">
            <Archive className="w-4 h-4 mr-1" />
            Blue path shows route from Receiving Point (R) to selected storage location.
          </p>
        )}
        {mode === 'collecting' && !pickingMode && (
          <p className="flex items-center mt-1">
            <Package className="w-4 h-4 mr-1" />
            Green path shows route from storage location to Packing Point (P).
          </p>
        )}
        {pickingMode && (
          <p className="flex items-center mt-1">
            <Navigation className="w-4 h-4 mr-1" />
            Purple path shows optimal picking route. Follow the animated path from worker (W) to target item.
          </p>
        )}
      </div>

      {/* Hover Info for Occupied Items */}
      {hoveredOccupiedInfo && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            Occupied Location Details
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Item:</span>
              <span className="ml-2 font-medium text-gray-900">{hoveredOccupiedInfo.itemName}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantity:</span>
              <span className="ml-2 font-medium text-gray-900">{hoveredOccupiedInfo.quantity}</span>
            </div>
            {hoveredOccupiedInfo.category && (
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium text-gray-900">{hoveredOccupiedInfo.category}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Stored:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(hoveredOccupiedInfo.storedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { STORAGE_CAPACITY };
export default WarehouseMap;