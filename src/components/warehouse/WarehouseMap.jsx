import React, { useState, useEffect } from 'react';
import { Package, Layers, MapPin, Archive, Info } from 'lucide-react';
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
  pathDestination = null 
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

  // Define rack configurations
  const racks = {
    // Small racks (Pellets)
    P1: {
      type: 'S',
      name: 'P1',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      bounds: { x1: 7, y1: 2, x2: 7, y2: 8 }, // 7-8 in 1-indexed becomes 6-7 in 0-indexed
    },
    P2: {
      type: 'S',
      name: 'P2',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      bounds: { x1: 9, y1: 2, x2: 9, y2: 8 }, // 9-10 becomes 8-9
    },
    // Medium racks (Bin)
    B1: {
      type: 'M',
      name: 'B1',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      bounds: { x1: 1, y1: 2, x2: 1, y2: 8 }, // 1-2 becomes 0-1
    },
    B2: {
      type: 'M',
      name: 'B2',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      bounds: { x1: 3, y1: 2, x2: 3, y2: 8 }, // 3-4 becomes 2-3
    },
    B3: {
      type: 'M',
      name: 'B3',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      bounds: { x1: 5, y1: 2, x2: 5, y2: 8 }, // 5-6 becomes 4-5
    },
    // Large rack
    D: {
      type: 'D',
      name: 'D',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      bounds: { x1: 3, y1: 10, x2: 9, y2: 11 }, // Adjusted to fit within 10x12 grid
    },
  };

  // Generate location code based on rack, position, and floor
  const getLocationCode = (rackName, x, y, floor) => {
    const rack = racks[rackName];
    const relativeX = x - rack.bounds.x1 + 1;
    const relativeY = y - rack.bounds.y1 + 1;
    return `${rackName}-${relativeX}${relativeY}-F${floor}`;
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
  const getOccupancyPercentage = (occupiedInfo, cellInfo) => {
    if (!occupiedInfo || !occupiedInfo.quantity) return 0;
    
    let capacity = STORAGE_CAPACITY.BIN_PER_SQUARE; // Default
    if (cellInfo) {
      if (cellInfo.type === 'S') capacity = STORAGE_CAPACITY.PELLET_PER_SQUARE;
      else if (cellInfo.type === 'M') capacity = STORAGE_CAPACITY.BIN_PER_SQUARE;
      else if (cellInfo.type === 'D') capacity = STORAGE_CAPACITY.LARGE_PER_SQUARE;
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

  // Calculate pixel position for a grid cell (for drawing lines)
  const getCellCenter = (x, y) => {
    // Each cell is 40px (w-10 h-10), plus borders
    const cellSize = 40;
    const centerX = x * cellSize + cellSize / 2;
    const centerY = (WAREHOUSE_HEIGHT - 1 - y) * cellSize + cellSize / 2;
    return { x: centerX, y: centerY };
  };

  // Check if a cell is walkable (not a rack and not occupied)
  const isWalkable = (x, y) => {
    // Check bounds
    if (x < 0 || x >= WAREHOUSE_WIDTH || y < 0 || y >= WAREHOUSE_HEIGHT) {
      return false;
    }
    
    // Check if it's a rack
    const cellInfo = getCellInfo(x, y);
    if (cellInfo) return false;
    
    // Check if it's occupied (for pathfinding purposes)
    // Note: We allow walking through occupied empty spaces for navigation
    return true;
  };

  // A* pathfinding algorithm
  const findPath = (startX, startY, endX, endY) => {
    // Node class for A*
    class Node {
      constructor(x, y, g = 0, h = 0, parent = null) {
        this.x = x;
        this.y = y;
        this.g = g; // Cost from start
        this.h = h; // Heuristic cost to end
        this.f = g + h; // Total cost
        this.parent = parent;
      }
    }

    // Heuristic function (Manhattan distance)
    const heuristic = (x1, y1, x2, y2) => {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };

    // Get neighbors
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
        
        // Check if the neighbor is walkable or is the destination
        if ((newX === endX && newY === endY) || isWalkable(newX, newY)) {
          neighbors.push({ x: newX, y: newY });
        }
      }

      return neighbors;
    };

    // Initialize open and closed lists
    const openList = [];
    const closedList = new Set();
    
    // Create start node
    const startNode = new Node(startX, startY, 0, heuristic(startX, startY, endX, endY));
    openList.push(startNode);

    while (openList.length > 0) {
      // Find node with lowest f cost
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentIndex].f) {
          currentIndex = i;
        }
      }

      const currentNode = openList.splice(currentIndex, 1)[0];
      
      // Check if we reached the end
      if (currentNode.x === endX && currentNode.y === endY) {
        // Reconstruct path
        const path = [];
        let node = currentNode;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }

      // Add to closed list
      closedList.add(`${currentNode.x},${currentNode.y}`);

      // Check neighbors
      const neighbors = getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        
        // Skip if in closed list
        if (closedList.has(key)) continue;

        const g = currentNode.g + 1;
        const h = heuristic(neighbor.x, neighbor.y, endX, endY);
        
        // Check if neighbor is already in open list
        const existingIndex = openList.findIndex(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (existingIndex === -1) {
          // Add new node
          openList.push(new Node(neighbor.x, neighbor.y, g, h, currentNode));
        } else if (g < openList[existingIndex].g) {
          // Update existing node if this path is better
          openList[existingIndex].g = g;
          openList[existingIndex].f = g + h;
          openList[existingIndex].parent = currentNode;
        }
      }
    }

    // No path found - return direct line as fallback
    return [{ x: startX, y: startY }, { x: endX, y: endY }];
  };

  // Check if a cell is part of a rack
  const getCellInfo = (x, y) => {
    for (const [rackName, rack] of Object.entries(racks)) {
      if (x >= rack.bounds.x1 && x <= rack.bounds.x2 && 
          y >= rack.bounds.y1 && y <= rack.bounds.y2) {
        return {
          rack: rackName,
          type: rack.type,
          color: rack.color,
          hoverColor: rack.hoverColor,
          locationCode: getLocationCode(rackName, x, y, selectedFloor),
        };
      }
    }
    return null;
  };

  // Handle cell click
  const handleCellClick = (x, y) => {
    // Don't allow selecting occupied locations when storing
    if (mode === 'storing' && isOccupiedLocation(x, y, selectedFloor)) {
      return;
    }
    
    const cellInfo = getCellInfo(x, y);
    if (cellInfo) {
      const location = {
        x,
        y,
        floor: selectedFloor,
        ...cellInfo,
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
    
    // Start from top-left and go down (to match Cartesian coordinates)
    for (let y = WAREHOUSE_HEIGHT - 1; y >= 0; y--) {
      const row = [];
      for (let x = 0; x < WAREHOUSE_WIDTH; x++) {
        const cellInfo = getCellInfo(x, y);
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
        const occupancyPercentage = occupiedInfo ? getOccupancyPercentage(occupiedInfo, cellInfo) : 0;
        const occupancyColor = getOccupancyColor(occupancyPercentage);

        row.push(
          <div
            key={`${x}-${y}`}
            className={`
              w-10 h-10 border border-gray-300 flex items-center justify-center text-xs cursor-pointer
              transition-all duration-150
              ${isReceiving ? 'bg-red-500 text-white' : ''}
              ${isPacking ? 'bg-orange-500 text-white' : ''}
              ${cellInfo && !isReceiving && !isPacking && !isOccupied ? `${cellInfo.color} text-white ${cellInfo.hoverColor}` : ''}
              ${cellInfo && isOccupied ? `${occupancyColor} text-white` : ''}
              ${!cellInfo && !isReceiving && !isPacking ? 'bg-gray-100 hover:bg-gray-200' : ''}
              ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
              ${isHovered && cellInfo ? 'transform scale-105' : ''}
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
              cellInfo 
                ? (isOccupied && occupiedInfo 
                    ? `${cellInfo.locationCode} - ${occupiedInfo.itemName} (${occupiedInfo.quantity} units - ${occupancyPercentage}% full)` 
                    : cellInfo.locationCode)
                : isReceiving 
                  ? 'Receiving Point' 
                  : isPacking 
                    ? 'Packing Point' 
                    : `Empty (${x},${y})`
            }
          >
            {isReceiving && <Archive className="w-6 h-6" />}
            {isPacking && <Package className="w-6 h-6" />}
            {cellInfo && !isReceiving && !isPacking && (
              <span className="font-semibold text-[10px]">
                {cellInfo.rack}
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
            <span>4 floors per rack</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Receiving Point</span>
          </div>
           <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">Packing Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Small (S) - Pellets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Medium (M) - Bin</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Large (D)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Empty Space</span>
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
              
              {/* SVG Overlay for drawing paths */}
              {(mode === 'storing' || mode === 'collecting') && pathDestination && (
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
                  </defs>
                  {(() => {
                    let pathPoints = [];
                    
                    if (mode === 'storing') {
                      // From receiving (0,0) to destination
                      pathPoints = findPath(0, 0, pathDestination.x, pathDestination.y);
                    } else if (mode === 'collecting') {
                      // From source to packing (0,11)
                      pathPoints = findPath(pathDestination.x, pathDestination.y, 0, 11);
                    }
                    
                    if (pathPoints && pathPoints.length > 1) {
                      // Convert grid coordinates to pixel coordinates
                      const pixelPath = pathPoints.map(point => getCellCenter(point.x, point.y));
                      
                      // Create SVG path string
                      let pathString = `M ${pixelPath[0].x} ${pixelPath[0].y}`;
                      for (let i = 1; i < pixelPath.length; i++) {
                        pathString += ` L ${pixelPath[i].x} ${pixelPath[i].y}`;
                      }
                      
                      const startPoint = pixelPath[0];
                      const endPoint = pixelPath[pixelPath.length - 1];
                      
                      return (
                        <g>
                          {/* Path segments for visualization */}
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
                          
                          {/* Colored path line */}
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
                          
                          {/* Start and end point circles */}
                          <circle
                            cx={startPoint.x}
                            cy={startPoint.y}
                            r="6"
                            fill={mode === 'storing' ? '#EF4444' : '#3B82F6'}
                            stroke="white"
                            strokeWidth="2"
                          />
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
              <span className="text-gray-600">Rack:</span>
              <span className="ml-2 font-medium">{selectedLocation.rack}</span>
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
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Color Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>Small (Pellet) Rack</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Medium (Bin) Rack</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span>Large Rack</span>
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
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          Click on any rack location to select it. Use floor buttons to view different levels.
        </p>
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