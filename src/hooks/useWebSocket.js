import { useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

const WEBSOCKET_URL = 'ws://localhost:8002/api/v1/ws/orders';

export const useWebSocket = (url, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      const token = authService.getToken();
      if (!token) {
        console.error('No authentication token available');
        return;
      }

      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        onMessage(event.data);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Add reconnect delay (2 seconds) to prevent rapid retries
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      // Cleanup: Clear timeout and close socket
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, onMessage]);

  return { isConnected };
};

export default useWebSocket;
