import React, { useState, useEffect } from 'react';
import useOrderWebSocket from '../hooks/useOrderWebSocket';

const WebSocketMonitor = () => {
  const { 
    isConnected, 
    connectionStatus, 
    connectionError, 
    lastUpdate, 
    addOrderUpdateListener 
  } = useOrderWebSocket();
  
  const [updates, setUpdates] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const removeListener = addOrderUpdateListener((update) => {
      setUpdates(prev => [
        {
          ...update,
          id: Date.now() + Math.random(),
          receivedAt: new Date()
        },
        ...prev.slice(0, 19) // Keep only last 20 updates
      ]);
    });

    return removeListener;
  }, [addOrderUpdateListener]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '●';
      case 'connecting': return '◐';
      case 'disconnected': return '○';
      case 'error': return '✕';
      default: return '?';
    }
  };

  const formatUpdateTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Connection Status Badge */}
      <div 
        className={`bg-white border border-gray-300 rounded-lg shadow-lg p-3 cursor-pointer transition-all duration-200 ${
          isExpanded ? 'mb-2' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className={`font-mono text-lg ${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            WebSocket: {connectionStatus}
          </span>
          <span className="text-xs text-gray-500">
            {isExpanded ? '▼' : '▲'}
          </span>
        </div>
        
        {connectionError && (
          <div className="text-xs text-red-600 mt-1">
            Error: {connectionError}
          </div>
        )}
        
        {isConnected && lastUpdate && (
          <div className="text-xs text-gray-600 mt-1">
            Last update: {formatUpdateTime(lastUpdate.timestamp)}
          </div>
        )}
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-80 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">WebSocket Updates</h3>
            <button
              onClick={() => setUpdates([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {updates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No updates received yet
              </p>
            ) : (
              updates.map((update) => (
                <div 
                  key={update.id} 
                  className="border border-gray-200 rounded p-2 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {update.updateType === 'status_change' && (
                          <>Order #{update.orderId} status changed</>
                        )}
                        {update.updateType === 'assignment' && (
                          <>Order #{update.orderId} assigned</>
                        )}
                        {update.updateType === 'bulk_update' && (
                          <>Bulk update: {update.orderIds?.length || 0} orders</>
                        )}
                      </div>
                      
                      {update.updateType === 'status_change' && (
                        <div className="text-xs text-gray-600">
                          {update.oldStatus && (
                            <span>{update.oldStatus} → </span>
                          )}
                          <span className="font-medium">{update.newStatus}</span>
                        </div>
                      )}
                      
                      {update.updateType === 'assignment' && (
                        <div className="text-xs text-gray-600">
                          Assigned to: {update.workerName} (ID: {update.workerId})
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 ml-2">
                      {formatUpdateTime(update.receivedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Connection Stats */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <div>Status: <span className={getStatusColor()}>{connectionStatus}</span></div>
              {lastUpdate && (
                <div>Last update: {formatUpdateTime(lastUpdate.timestamp)}</div>
              )}
              <div>Updates received: {updates.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketMonitor;
