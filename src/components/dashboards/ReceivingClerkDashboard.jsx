import React, { useEffect } from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { ClipboardCheck, Package, Inbox, CheckCircle } from 'lucide-react';
import useOrderWebSocket from '../../hooks/useOrderWebSocket';

const ReceivingClerkDashboard = () => {
  const handleWebSocketMessage = (message) => {
    console.log('Received WebSocket message:', message);
    // Add logic to update the dashboard state based on the message
  };

  // Shared WebSocket connection for real-time updates
  const { isConnected, connectionStatus, connectionError, addOrderUpdateListener } = useOrderWebSocket();

  useEffect(() => {
    const cleanup = addOrderUpdateListener(handleWebSocketMessage);
    return cleanup;
  }, [addOrderUpdateListener, handleWebSocketMessage]);

  return (
    <WorkflowDashboard 
      title="Receiving Clerk Dashboard"
      role="ReceivingClerk"
      iconComponent={ClipboardCheck}
      gradientColors="from-blue-500 to-cyan-600"
    />
  );
};

export default ReceivingClerkDashboard;
