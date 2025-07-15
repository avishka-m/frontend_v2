import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { authService } from '../services/authService';

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
  console.debug('[WebSocket] Attempting to connect. Token:', token, 'Is Authenticated:', isAuth);
  if (!token || !isAuth) {
    sharedConnectionStatus = 'disconnected';
    sharedConnectionError = 'Not authenticated';
    console.debug('[WebSocket] Not authenticated. Aborting connection.');
    return;
  }
  try {
    sharedConnectionStatus = 'connecting';
    sharedConnectionError = null;
    const wsUrl = `ws://localhost:8002/ws/orders?token=${token}`;
    console.debug('[WebSocket] Connecting to', wsUrl);
    const ws = new WebSocket(wsUrl);
    sharedWsRef = ws;
    ws.onopen = () => {
      sharedIsConnected = true;
      sharedConnectionStatus = 'connected';
      sharedConnectionError = null;
      sharedReconnectAttempts = 0;
      console.debug('[WebSocket] Connection opened');
      // Heartbeat
      const heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
          console.debug('[WebSocket] Heartbeat sent');
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);
    };
    ws.onmessage = (event) => {
      console.debug('[WebSocket] Message received:', event.data);
      if (event.data === 'pong' || event.data.includes('pong')) return;
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.type === 'connection_established') return;
      if (isDuplicateMessage(data)) return;
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
      } else if (data.type === 'bulk_order_update') {
        const updateInfo = {
          orderIds: data.order_ids,
          updateType: 'bulk_update',
          timestamp: new Date(),
          details: data.details
        };
        sharedLastUpdate = updateInfo;
        notifyAllListeners(updateInfo);
      } else if (data.type === 'assignment_update') {
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
      sharedIsConnected = false;
      sharedConnectionStatus = 'disconnected';
      sharedWsRef = null;
      console.debug('[WebSocket] Connection closed. Code:', event.code, 'Reason:', event.reason);
      if (event.code !== 1000 && sharedReconnectAttempts < maxReconnectAttempts) {
        sharedReconnectAttempts++;
        console.debug('[WebSocket] Attempting to reconnect. Attempt:', sharedReconnectAttempts);
        setTimeout(() => connectSharedWebSocket(getAuthData), reconnectDelay);
      }
    };
    ws.onerror = (err) => {
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
  const { isAuthenticated } = useAuth();
  const getAuthData = () => {
    const token = authService.getToken();
    const isAuth = isAuthenticated();
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