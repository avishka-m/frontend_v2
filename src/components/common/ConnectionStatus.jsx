import React, { useState, useEffect } from 'react';
import { CheckCircle, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const ConnectionStatus = ({ connectionStatus, isConnected, connectionError }) => {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (connectionStatus === 'Open') {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    } else if (connectionStatus === 'Closed' || connectionError) {
      setShowStatus(true);
    }
  }, [connectionStatus, connectionError]);

  const getStatusConfig = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="w-4 h-4 text-green-500" />,
        text: 'Real-time updates connected',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    } else if (connectionError) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: 'Connection error - updates may be delayed',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: <WifiOff className="w-4 h-4 text-yellow-500" />,
        text: 'Connecting to real-time updates...',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
      };
    }
  };

  if (!showStatus) return null;

  const config = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.bgColor} ${config.borderColor} border rounded-lg p-3 shadow-lg transition-all duration-300 ease-in-out transform ${showStatus ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
