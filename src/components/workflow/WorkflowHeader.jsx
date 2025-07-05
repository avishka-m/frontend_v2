import React from 'react';
import { 
  User,
  Activity,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

const WorkflowHeader = ({ 
  title, 
  currentUser, 
  IconComponent, 
  gradientColors, 
  isConnected,
  tabCounts,
  tabs,
  isUpdating,
  updateMessage
}) => {
  const totalOrders = Object.values(tabCounts).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className={`bg-gradient-to-r ${gradientColors} p-6 rounded-xl shadow-lg text-white`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <IconComponent size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-white/80">Welcome back, {currentUser?.name || 'User'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Update Indicator */}
          {isUpdating && (
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">{updateMessage}</span>
            </div>
          )}
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi size={20} className="text-green-300" />
                <span className="text-sm text-white/80">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={20} className="text-red-300" />
                <span className="text-sm text-white/80">Disconnected</span>
              </>
            )}
          </div>
          
          {/* Total Orders */}
          <div className="text-right">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-white/80 text-sm">Total Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowHeader;
