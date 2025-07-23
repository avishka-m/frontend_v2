import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldExclamationIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';

// Import anomaly detection pages
import AnomalyDashboard from './anomaly/AnomalyDashboard';
import AnomalyAnalysisPage from './anomaly/AnomalyAnalysisPage';
import AnomalySettingsPage from './anomaly/AnomalySettingsPage';
import AnomalyHistoryPage from './anomaly/AnomalyHistoryPage';

/**
 * 🔍 Main Anomaly Detection System Page
 * 
 * Central hub for all anomaly detection functionality with:
 * - Navigation to different anomaly modules
 * - Quick access to critical anomalies
 * - System health overview
 * - Real-time status monitoring
 */
const AnomalyDetection = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [systemHealth, setSystemHealth] = useState(null);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if user has manager role for advanced features
  const isManager = currentUser?.role === 'Manager' || currentUser?.role === 'Admin';

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      // This would typically call your anomaly detection service
      // For now, using mock data
      setSystemHealth({
        status: 'healthy',
        score: 85,
        lastCheck: new Date().toISOString()
      });
      setCriticalCount(3);
    } catch (error) {
      console.error('Error loading system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    {
      path: 'dashboard',
      title: '🔍 Detection Dashboard',
      description: 'Real-time anomaly monitoring and detection',
      icon: ShieldExclamationIcon,
      color: 'bg-blue-500',
      available: true
    },
    {
      path: 'analysis',
      title: '📊 Analysis & Reports',
      description: 'Detailed analysis and trend reports',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      available: true
    },
    {
      path: 'history',
      title: '📋 Anomaly History',
      description: 'Historical anomaly data and patterns',
      icon: ClockIcon,
      color: 'bg-purple-500',
      available: true
    },
    {
      path: 'settings',
      title: '⚙️ Settings & Thresholds',
      description: 'Configure detection parameters and ML models',
      icon: Cog6ToothIcon,
      color: 'bg-orange-500',
      available: isManager
    }
  ];

  const currentPath = location.pathname.split('/').pop();

  // If we're on the root anomaly path, show the main navigation
  if (currentPath === 'anomaly-detection' || currentPath === '') {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🔍 Anomaly Detection System
              </h1>
              <p className="text-blue-100 text-lg">
                Advanced AI-powered monitoring for your warehouse operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {criticalCount > 0 && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <BellIcon className="h-5 w-5" />
                  <span className="font-semibold">{criticalCount} Critical</span>
                </div>
              )}
              <div className={`px-4 py-2 rounded-lg ${
                systemHealth?.status === 'healthy' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-black'
              }`}>
                System: {systemHealth?.status || 'Checking...'}
              </div>
            </div>
          </div>
        </div> */}

        {/* System Overview Cards */}


        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navigationItems.map((item) => {
            if (!item.available) return null;
            
            return (
              <Card 
                key={item.path}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${item.color} p-3 rounded-lg`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <Button variant="outline" size="sm">
                        Access Module →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldExclamationIcon className="h-5 w-5 text-blue-500" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Health Score</span>
                  <span className="font-semibold text-lg">{systemHealth?.score || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (systemHealth?.score || 0) >= 80 ? 'bg-green-500' :
                      (systemHealth?.score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${systemHealth?.score || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  Last checked: {systemHealth?.lastCheck ? 
                    new Date(systemHealth.lastCheck).toLocaleTimeString() : 'Never'
                  }
                </p>
              </div>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-red-500" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-600">Critical</span>
                  <span className="font-semibold text-red-600">{criticalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">High</span>
                  <span className="font-semibold text-orange-600">7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Medium</span>
                  <span className="font-semibold text-yellow-600">12</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate('dashboard')}
                >
                  View All Anomalies
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-green-500" />
                <span>Detection Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold">28 detected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold">156 detected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-semibold text-green-600">94.2%</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate('analysis')}
                >
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="p-4 h-auto flex-col"
                onClick={() => navigate('dashboard')}
              >
                <ShieldExclamationIcon className="h-8 w-8 mb-2 text-blue-500" />
                <span>Run Detection</span>
              </Button>
              <Button 
                variant="outline" 
                className="p-4 h-auto flex-col"
                onClick={() => navigate('analysis')}
              >
                <ChartBarIcon className="h-8 w-8 mb-2 text-green-500" />
                <span>View Reports</span>
              </Button>
              <Button 
                variant="outline" 
                className="p-4 h-auto flex-col"
                onClick={() => navigate('history')}
              >
                <ClockIcon className="h-8 w-8 mb-2 text-purple-500" />
                <span>Check History</span>
              </Button>
              {isManager && (
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  onClick={() => navigate('settings')}
                >
                  <Cog6ToothIcon className="h-8 w-8 mb-2 text-orange-500" />
                  <span>Configure</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render routes for sub-pages
  return (
    <Routes>
      <Route path="dashboard" element={<AnomalyDashboard />} />
      <Route path="analysis" element={<AnomalyAnalysisPage />} />
      <Route path="history" element={<AnomalyHistoryPage />} />
      {isManager && <Route path="settings" element={<AnomalySettingsPage />} />}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AnomalyDetection;
