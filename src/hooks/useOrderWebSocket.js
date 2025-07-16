import { useState, useEffect, useRef, useCallback } from 'react';

// Singleton WebSocket instance and listeners
let sharedWsRef = null;
let sharedListenersRef = new Set();
let sharedProcessedMessagesRef = new Set();
let sharedMessageTimeoutRef = new Map();
let sharedReconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000;
let sharedConnectionStatus = 'disconnected';
let sharedIsConnected = false;
let sharedConnectionError = null;
let sharedLastUpdate = null;

function notifyAllListeners(updateData) {
  sharedListenersRef.forEach(cb => {
    try { cb(updateData); } catch (e) { console.error('Error in order update listener:', e); }
  });
}

function isDuplicateMessage(messageData) {
  const messageKey = `${messageData.type}-${messageData.data?.order_id}-${messageData.data?.order_status}-${messageData.data?.timestamp}`;
  if (sharedProcessedMessagesRef.has(messageKey)) return true;
  sharedProcessedMessagesRef.add(messageKey);
  const timeoutId = setTimeout(() => {
    sharedProcessedMessagesRef.delete(messageKey);
    sharedMessageTimeoutRef.delete(messageKey);
  }, 5000);
  sharedMessageTimeoutRef.set(messageKey, timeoutId);
  return false;
}

function connectSharedWebSocket(getAuthData) {
  if (sharedWsRef && sharedWsRef.readyState === WebSocket.OPEN) {
    console.debug('[WebSocket] Already connected');
    return;
  }
  
  const { token, isAuth } = getAuthData();
  console.debug('[WebSocket] Attempting to connect. Token available:', !!token, 'Is Authenticated:', isAuth);
  
  if (!token || !isAuth) {
    sharedConnectionStatus = 'disconnected';
    sharedConnectionError = 'Not authenticated';
    console.debug('[WebSocket] Not authenticated. Aborting connection.');
    return;
  }
  
  try {
    sharedConnectionStatus = 'connecting';
    sharedConnectionError = null;
    const wsUrl = `ws://localhost:8002/api/v1/ws/orders?token=${encodeURIComponent(token)}`;
    console.debug('[WebSocket] Connecting to', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    sharedWsRef = ws;
    
    // Set a connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        sharedConnectionStatus = 'error';
        sharedConnectionError = 'Connection timeout';
        console.debug('[WebSocket] Connection timeout');
      }
    }, 10000);
    
    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      sharedIsConnected = true;
      sharedConnectionStatus = 'connected';
      sharedConnectionError = null;
      sharedReconnectAttempts = 0;
      console.debug('[WebSocket] Connection opened successfully');
      
      // Send initial status check
      ws.send(JSON.stringify({ type: 'status' }));
      
      // Setup heartbeat
      const heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          console.debug('[WebSocket] Heartbeat sent');
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);
      
      // Store interval reference for cleanup
      ws._heartbeatInterval = heartbeatInterval;
    };
    
    ws.onmessage = (event) => {
      console.debug('[WebSocket] Message received:', event.data);
      
      // Handle simple pong responses
      if (event.data === 'pong') return;
      
      let data;
      try { 
        data = JSON.parse(event.data); 
      } catch (e) { 
        console.warn('[WebSocket] Failed to parse message:', event.data);
        return; 
      }
      
      // Handle different message types
      if (data.type === 'connection_established') {
        console.debug('[WebSocket] Connection established confirmation received');
        return;
      }
      
      if (data.type === 'pong') {
        console.debug('[WebSocket] Pong received');
        return;
      }
      
      if (data.type === 'status_response') {
        console.debug('[WebSocket] Status response received:', data);
        return;
      }
      
      if (data.type === 'error') {
        console.error('[WebSocket] Server error:', data.message);
        sharedConnectionError = data.message;
        return;
      }
      
      // Check for duplicate messages
      if (isDuplicateMessage(data)) return;
      
      // Handle order updates
      if (data.type === 'order_update') {
        const statusHistory = data.data.order_data?.status_history || {};
        const statusKeys = Object.keys(statusHistory);
        const oldStatus = statusKeys.length > 1 ? statusKeys[statusKeys.length - 2] : null;
        
        const updateInfo = {
          orderId: data.data.order_id,
          oldStatus,
          newStatus: data.data.order_status,
          orderData: data.data.order_data,
          timestamp: new Date(),
          updateType: 'status_change'
        };
        
        sharedLastUpdate = updateInfo;
        notifyAllListeners(updateInfo);
      } 
      else if (data.type === 'bulk_order_update') {
        const updateInfo = {
          orderIds: data.order_ids,
          updateType: 'bulk_update',
          timestamp: new Date(),
          details: data.details
        };
        
        sharedLastUpdate = updateInfo;
        notifyAllListeners(updateInfo);
      } 
      else if (data.type === 'assignment_update') {
        const updateInfo = {
          orderId: data.data?.order_id,
          workerId: data.data?.worker_id,
          workerName: data.data?.worker_name,
          orderData: data.data?.order_data,
          timestamp: new Date(),
          updateType: 'assignment'
        };
        
        sharedLastUpdate = updateInfo;
        notifyAllListeners(updateInfo);
      }
    };
    
    ws.onclose = (event) => {
      clearTimeout(connectionTimeout);
      if (ws._heartbeatInterval) {
        clearInterval(ws._heartbeatInterval);
      }
      
      sharedIsConnected = false;
      sharedConnectionStatus = 'disconnected';
      sharedWsRef = null;
      
      console.debug('[WebSocket] Connection closed. Code:', event.code, 'Reason:', event.reason);
      
      // Only attempt to reconnect if not a normal closure and under max attempts
      if (event.code !== 1000 && sharedReconnectAttempts < maxReconnectAttempts) {
        sharedReconnectAttempts++;
        console.debug('[WebSocket] Attempting to reconnect. Attempt:', sharedReconnectAttempts);
        setTimeout(() => connectSharedWebSocket(getAuthData), reconnectDelay);
      } else if (event.code === 1000) {
        console.debug('[WebSocket] Normal closure, not reconnecting');
      } else {
        console.debug('[WebSocket] Max reconnection attempts reached');
        sharedConnectionError = 'Failed to reconnect after multiple attempts';
      }
    };
    
    ws.onerror = (err) => {
      clearTimeout(connectionTimeout);
      sharedConnectionStatus = 'error';
      sharedConnectionError = 'Connection error occurred';
      console.debug('[WebSocket] Connection error:', err);
    };
    
  } catch (e) {
    sharedConnectionStatus = 'error';
    sharedConnectionError = 'Failed to create connection';
    console.debug('[WebSocket] Exception during connection:', e);
  }
}

function disconnectSharedWebSocket() {
  if (sharedWsRef) {
    sharedWsRef.close(1000, 'Manual disconnect');
    sharedWsRef = null;
  }
  sharedIsConnected = false;
  sharedConnectionStatus = 'disconnected';
  sharedConnectionError = null;
  sharedMessageTimeoutRef.forEach(timeoutId => clearTimeout(timeoutId));
  sharedMessageTimeoutRef.clear();
  sharedProcessedMessagesRef.clear();
  sharedListenersRef.clear();
}

const useOrderWebSocket = () => {
  // Temporarily simplified to avoid dependency issues
  const getAuthData = () => {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    return { token, isAuth };
  };
  // Connect on first use
  useEffect(() => {
    connectSharedWebSocket(getAuthData);
    return () => {
      // Only disconnect if no listeners left
      if (sharedListenersRef.size === 0) disconnectSharedWebSocket();
    };
  }, []);
  // Listener registration
  const addOrderUpdateListener = useCallback((cb) => {
    sharedListenersRef.add(cb);
    return () => {
      sharedListenersRef.delete(cb);
      if (sharedListenersRef.size === 0) disconnectSharedWebSocket();
    };
  }, []);
  return {
    isConnected: sharedIsConnected,
    connectionStatus: sharedConnectionStatus,
    connectionError: sharedConnectionError,
    lastUpdate: sharedLastUpdate,
    addOrderUpdateListener,
    connect: () => connectSharedWebSocket(getAuthData),
    disconnect: disconnectSharedWebSocket
  };
};

export default useOrderWebSocket; 