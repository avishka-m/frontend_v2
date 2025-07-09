import { useState, useEffect, useRef, useCallback } from "react";
import { authService } from "../services/authService";

const WEBSOCKET_URL = "ws://localhost:8000/api/v1/ws/orders";

export const useWebSocket = (options = {}) => {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 3, // Reduced from 10 to 3 to prevent spam
    onMessage = null,
    onConnect = null,
    onDisconnect = null,
    onError = null,
  } = options;

  const [connectionStatus, setConnectionStatus] = useState("Closed");
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);

  // Use refs to avoid recreating the connect function on every render
  const callbacksRef = useRef({
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onConnect,
      onDisconnect,
      onError,
    };
  });

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setConnectionError("No authentication token available");
      return;
    }

    try {
      const wsUrl = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connection opened");
        setConnectionStatus("Open");
        setConnectionError(null);
        reconnectAttempts.current = 0;

        if (callbacksRef.current.onConnect) {
          callbacksRef.current.onConnect();
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);
          setLastMessage(data);

          if (callbacksRef.current.onMessage) {
            callbacksRef.current.onMessage(data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        setConnectionStatus("Closed");

        if (callbacksRef.current.onDisconnect) {
          callbacksRef.current.onDisconnect();
        }

        // Only attempt to reconnect if not at max attempts and if close wasn't intentional
        if (
          reconnectAttempts.current < maxReconnectAttempts &&
          event.code !== 1000
        ) {
          reconnectAttempts.current++;
          console.log(
            `WebSocket reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`
          );
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.log(
            "WebSocket max reconnect attempts reached or connection closed normally"
          );
        }
      };

      ws.current.onerror = (error) => {
        setConnectionError("WebSocket connection error");

        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(error);
        }
      };
    } catch (error) {
      setConnectionError("Failed to create WebSocket connection");
      console.error("WebSocket connection error:", error);
    }
  }, [reconnectInterval, maxReconnectAttempts]); // Removed callback dependencies

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
      ws.current.send(
        typeof message === "string" ? message : JSON.stringify(message)
      );
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  const sendHeartbeat = useCallback(() => {
    sendMessage("ping");
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
    if (connectionStatus === "Open") {
      // Send initial heartbeat after connection
      const initialTimeout = setTimeout(() => {
        sendHeartbeat();
      }, 1000); // Send first heartbeat after 1 second

      // Then send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(sendHeartbeat, 30000);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(heartbeatInterval);
      };
    }
  }, [connectionStatus, sendHeartbeat]);

  return {
    connectionStatus,
    lastMessage,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionStatus === "Open",
  };
};

export default useWebSocket;
