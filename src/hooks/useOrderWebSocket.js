import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { authService } from "../services/authService";

const useOrderWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Order update listeners
  const orderListenersRef = useRef(new Set());

  // Message deduplication
  const processedMessagesRef = useRef(new Set());
  const messageTimeoutRef = useRef(new Map());

  // Get token and auth status
  const getAuthData = useCallback(() => {
    const token = authService.getToken();
    const isAuth = isAuthenticated();
    console.log("🔑 Auth data:", {
      token: token ? "present" : "missing",
      isAuth,
    });
    return { token, isAuth };
  }, [isAuthenticated]);

  // Add order update listener
  const addOrderUpdateListener = useCallback((callback) => {
    orderListenersRef.current.add(callback);

    // Return cleanup function
    return () => {
      orderListenersRef.current.delete(callback);
    };
  }, []);

  // Check if message is duplicate
  const isDuplicateMessage = useCallback((messageData) => {
    const messageKey = `${messageData.type}-${messageData.data?.order_id}-${messageData.data?.order_status}-${messageData.data?.timestamp}`;

    if (processedMessagesRef.current.has(messageKey)) {
      console.log("🚫 Duplicate message detected, skipping:", messageKey);
      return true;
    }

    // Add to processed messages
    processedMessagesRef.current.add(messageKey);

    // Clean up old messages after 5 seconds
    const timeoutId = setTimeout(() => {
      processedMessagesRef.current.delete(messageKey);
      messageTimeoutRef.current.delete(messageKey);
    }, 5000);

    messageTimeoutRef.current.set(messageKey, timeoutId);

    return false;
  }, []);

  // Notify all order listeners
  const notifyOrderListeners = useCallback((updateData) => {
    orderListenersRef.current.forEach((callback) => {
      try {
        callback(updateData);
      } catch (error) {
        console.error("Error in order update listener:", error);
      }
    });
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    const { token, isAuth } = getAuthData();

    if (!token || !isAuth) {
      console.log("❌ Cannot connect WebSocket: No token or not authenticated");
      console.log("Token:", token ? "present" : "missing");
      console.log("IsAuth:", isAuth);
      setConnectionStatus("disconnected");
      setConnectionError("Not authenticated");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket already connected");
      return;
    }

    try {
      setConnectionStatus("connecting");
      setConnectionError(null);

      const wsUrl = `ws://localhost:8002/api/v1/ws/orders?token=${token}`;
      console.log("🔗 Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Order WebSocket connected successfully");
        setIsConnected(true);
        setConnectionStatus("connected");
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Send heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
            console.log("📡 Heartbeat sent");
          } else {
            clearInterval(heartbeatInterval);
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          console.log("📨 Raw WebSocket message:", event.data);

          // Handle non-JSON messages (like pong)
          if (event.data === "pong" || event.data.includes("pong")) {
            console.log("🏓 Heartbeat response received");
            return;
          }

          const data = JSON.parse(event.data);
          console.log("📨 Parsed WebSocket message:", data);

          if (data.type === "connection_established") {
            console.log(
              "✅ WebSocket connection established for user:",
              data.user_id
            );
            return;
          }

          // Check for duplicate messages
          if (isDuplicateMessage(data)) {
            return;
          }

          if (data.type === "order_update") {
            // Targeted order update - handle the actual backend message format
            const statusHistory = data.data.order_data?.status_history || {};
            const statusKeys = Object.keys(statusHistory);
            const oldStatus =
              statusKeys.length > 1 ? statusKeys[statusKeys.length - 2] : null;

            const updateInfo = {
              orderId: data.data.order_id,
              oldStatus: oldStatus,
              newStatus: data.data.order_status,
              orderData: data.data.order_data,
              timestamp: new Date(),
              updateType: "status_change",
            };

            console.log("🔄 Order status update:", updateInfo);
            setLastUpdate(updateInfo);
            notifyOrderListeners(updateInfo);
          } else if (data.type === "order_assignment") {
            // Worker assignment update
            const updateInfo = {
              orderId: data.data ? data.data.order_id : data.order_id,
              workerId: data.data ? data.data.worker_id : data.worker_id,
              workerName: data.data ? data.data.worker_name : data.worker_name,
              orderData: data.data ? data.data.order_data : null,
              timestamp: new Date(),
              updateType: "assignment",
            };

            console.log("👤 Order assignment update:", updateInfo);
            setLastUpdate(updateInfo);
            notifyOrderListeners(updateInfo);
          } else if (data.type === "bulk_order_update") {
            // Multiple orders updated
            const updateInfo = {
              orderIds: data.order_ids,
              updateType: "bulk_update",
              timestamp: new Date(),
              details: data.details,
            };

            console.log("📦 Bulk order update:", updateInfo);
            setLastUpdate(updateInfo);
            notifyOrderListeners(updateInfo);
          } else {
            console.log("❓ Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
          console.error("Raw message:", event.data);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 Order WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
        wsRef.current = null;

        // Set error message based on close code
        if (event.code === 4001) {
          setConnectionError("Authentication failed");
        } else if (event.code === 4000) {
          setConnectionError("Connection error");
        } else if (event.code !== 1000) {
          setConnectionError(`Connection closed unexpectedly (${event.code})`);
        }

        // Auto-reconnect if not a manual close and we have a valid token
        const { token: currentToken, isAuth: currentIsAuth } = getAuthData();
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts &&
          currentToken &&
          currentIsAuth
        ) {
          reconnectAttempts.current++;
          console.log(
            `🔄 Auto-reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts} in ${reconnectDelay}ms`
          );

          setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Order WebSocket error:", error);
        setConnectionStatus("error");
        setConnectionError("Connection error occurred");
      };
    } catch (error) {
      console.error("❌ Error creating WebSocket connection:", error);
      setConnectionStatus("error");
      setConnectionError("Failed to create connection");
    }
  }, [getAuthData, notifyOrderListeners, isDuplicateMessage]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log("🔌 Manually disconnecting WebSocket");
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setConnectionError(null);

    // Clean up message deduplication
    messageTimeoutRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    messageTimeoutRef.current.clear();
    processedMessagesRef.current.clear();
  }, []);

  // Send message to WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log("📤 Message sent:", message);
    } else {
      console.log("❌ Cannot send message: WebSocket not connected");
    }
  }, []);

  // Auto-connect when component mounts and token is available
  useEffect(() => {
    const { token, isAuth } = getAuthData();
    console.log("🔍 useEffect triggered - auth state changed");
    console.log("🔍 Current auth state:", {
      token: token ? "present" : "missing",
      isAuth,
    });

    if (token && isAuth) {
      console.log("🔄 Token available, attempting WebSocket connection");
      connect();
    } else {
      console.log(
        "⏸️ No token or not authenticated, skipping WebSocket connection"
      );
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [getAuthData, connect, disconnect]);

  // Also listen for authentication state changes
  useEffect(() => {
    const { token, isAuth } = getAuthData();
    console.log("🔍 Auth state effect triggered");

    if (token && isAuth && !isConnected) {
      console.log("🔄 Authentication detected, connecting WebSocket");
      connect();
    }
  }, [isAuthenticated, getAuthData, connect, isConnected]);

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = setInterval(() => {
      if (wsRef.current) {
        const state = wsRef.current.readyState;
        if (state === WebSocket.CONNECTING) {
          setConnectionStatus("connecting");
        } else if (state === WebSocket.OPEN) {
          setConnectionStatus("connected");
          setIsConnected(true);
        } else if (state === WebSocket.CLOSING) {
          setConnectionStatus("disconnecting");
        } else if (state === WebSocket.CLOSED) {
          setConnectionStatus("disconnected");
          setIsConnected(false);
        }
      }
    }, 1000);


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

    connect,
    disconnect,
    sendMessage,

  };
};

export default useOrderWebSocket;
