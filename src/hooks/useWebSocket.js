import { useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';

const WEBSOCKET_URL = 'ws://localhost:8002/api/v1/ws/orders';

export const useWebSocket = (options = {}) => {
  const { 
    autoConnect = true, 
    reconnectInterval = 5000, 
    maxReconnectAttempts = 10,
    onMessage = null,
    onConnect = null,
    onDisconnect = null,
    onError = null 
  } = options;

  const [connectionStatus, setConnectionStatus] = useState('Closed');
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setConnectionError('No authentication token available');
      return;
    }

    try {
      const wsUrl = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setConnectionStatus('Open');
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        if (onConnect) {
          onConnect();
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('Closed');
        
        if (onDisconnect) {
          onDisconnect();
        }

        // Attempt to reconnect if not at max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setConnectionError('WebSocket connection error');
        
        if (onError) {
          onError(error);
        }
      };

    } catch (error) {
      setConnectionError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', error);
    }
  }, [onConnect, onMessage, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const sendHeartbeat = useCallback(() => {
    sendMessage('ping');
  }, [sendMessage]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Send heartbeat every 30 seconds to keep connection alive
  useEffect(() => {
    if (connectionStatus === 'Open') {
      const heartbeatInterval = setInterval(sendHeartbeat, 30000);
      return () => clearInterval(heartbeatInterval);
    }
  }, [connectionStatus, sendHeartbeat]);

  return {
    connectionStatus,
    lastMessage,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionStatus === 'Open'
  };
};

export default useWebSocket;
