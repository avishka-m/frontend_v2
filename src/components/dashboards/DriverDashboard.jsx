import React, { useEffect } from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { Truck, MapPin, Route, Navigation } from 'lucide-react';
import useOrderWebSocket from '../../hooks/useOrderWebSocket';

const DriverDashboard = () => {
  const handleWebSocketMessage = (message) => {
    console.log('Received WebSocket message:', message);
    // Add logic to update state or trigger re-renders based on message content
  };

  // Shared WebSocket connection for real-time updates
  const { isConnected, connectionStatus, connectionError, addOrderUpdateListener } = useOrderWebSocket();

  useEffect(() => {
    const cleanup = addOrderUpdateListener(handleWebSocketMessage);
    return cleanup;
  }, [addOrderUpdateListener, handleWebSocketMessage]);

  return (
    <WorkflowDashboard 
      title="Driver Dashboard"
      role="Driver"
      iconComponent={Truck}
      gradientColors="from-green-500 to-emerald-600"
    />
  );
};

export default DriverDashboard;
