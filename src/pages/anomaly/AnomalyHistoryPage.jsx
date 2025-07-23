import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAnomalyDetection } from '../../hooks/useAnomalyDetection';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import AnomalyCard from '../../components/anomaly/AnomalyCard';
import AnomalyDetailsModal from '../../components/anomaly/AnomalyDetailsModal';

/**
 * 📋 Anomaly History Page
 * 
 * Historical view of anomalies with:
 * - Timeline view of past anomalies
 * - Advanced filtering and search
 * - Export capabilities
 * - Trend analysis
 * - Resolution tracking
 */
const AnomalyHistoryPage = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d'); // '1d', '7d', '30d', '90d', 'all'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'resolved', 'dismissed', 'active'
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'list', 'stats'

  // Mock historical data - in real app, this would come from API
  const [historicalAnomalies, setHistoricalAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadHistoricalData();
  }, [dateRange, statusFilter]);

  const loadHistoricalData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock historical data
      const mockData = generateMockHistoricalData(dateRange);
      setHistoricalAnomalies(mockData);
      setStats(calculateStats(mockData));
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistoricalData = (range) => {
    const days = range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const anomalies = [];
    
    for (let i = 0; i < days * 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(i / 3));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      const severities = ['critical', 'high', 'medium', 'low'];
      const categories = ['inventory', 'orders', 'workflow', 'workers'];
      const statuses = ['resolved', 'dismissed', 'active'];
      const techniques = ['rule_based', 'ml_based', 'both'];
      
      anomalies.push({
        id: `hist_${i}`,
        title: `Historical Anomaly ${i + 1}`,
        description: `This is a historical anomaly detected on ${date.toDateString()}`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        technique: techniques[Math.floor(Math.random() * techniques.length)],
        timestamp: date.toISOString(),
        resolved_at: Math.random() > 0.5 ? new Date(date.getTime() + Math.random() * 86400000).toISOString() : null,
        confidence: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
      });
    }
    
    return anomalies.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const calculateStats = (anomalies) => {
    const total = anomalies.length;
    const resolved = anomalies.filter(a => a.status === 'resolved').length;
    const dismissed = anomalies.filter(a => a.status === 'dismissed').length;
    const active = anomalies.filter(a => a.status === 'active').length;
    
    const severityCounts = anomalies.reduce((acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) + 1;
      return acc;
    }, {});
    
    const categoryCounts = anomalies.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total,
      resolved,
      dismissed,
      active,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      severityCounts,
      categoryCounts
    };
  };

  // Filter and search logic
  const filteredAnomalies = React.useMemo(() => {
    let filtered = [...historicalAnomalies];
    
    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'timestamp' || sortBy === 'resolved_at') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [historicalAnomalies, statusFilter, severityFilter, categoryFilter, searchTerm, sortBy, sortOrder]);

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Category', 'Severity', 'Status', 'Timestamp', 'Resolved At'].join(','),
      ...filteredAnomalies.map(a => [
        a.id,
        `"${a.title}"`,
        a.category,
        a.severity,
        a.status,
        a.timestamp,
        a.resolved_at || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomaly-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupAnomaliesByDate = (anomalies) => {
    const groups = {};
    anomalies.forEach(anomaly => {
      const date = new Date(anomaly.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(anomaly);
    });
    return groups;
  };

  const timelineGroups = groupAnomaliesByDate(filteredAnomalies);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-purple-600" />
            <span>Anomaly History</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Historical analysis and tracking of detected anomalies
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          
          <Select
            value={viewMode}
            onValueChange={setViewMode}
            className="w-32"
          >
            <option value="timeline">Timeline</option>
            <option value="list">List</option>
            <option value="stats">Statistics</option>
          </Select>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Anomalies</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.dismissed || 0}</div>
            <div className="text-sm text-gray-600">Dismissed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.active || 0}</div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.resolutionRate || 0}%</div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search anomalies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <option value="all">All Categories</option>
                <option value="inventory">Inventory</option>
                <option value="orders">Orders</option>
                <option value="workflow">Workflow</option>
                <option value="workers">Workers</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}>
                <option value="timestamp-desc">Newest First</option>
                <option value="timestamp-asc">Oldest First</option>
                <option value="severity-desc">Severity High-Low</option>
                <option value="severity-asc">Severity Low-High</option>
                <option value="resolved_at-desc">Recently Resolved</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading historical data...</p>
          </CardContent>
        </Card>
      ) : viewMode === 'timeline' ? (
        <div className="space-y-6">
          {Object.entries(timelineGroups).map(([date, anomalies]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span>{date}</span>
                  <span className="text-sm font-normal text-gray-500">
                    ({anomalies.length} anomalies)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <AnomalyCard
                      key={anomaly.id}
                      anomaly={anomaly}
                      onSelect={setSelectedAnomaly}
                      onViewDetails={(anomaly) => {
                        setSelectedAnomaly(anomaly);
                        setShowDetailsModal(true);
                      }}
                      compact={true}
                      showActions={false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredAnomalies.map((anomaly) => (
            <AnomalyCard
              key={anomaly.id}
              anomaly={anomaly}
              onSelect={setSelectedAnomaly}
              onViewDetails={(anomaly) => {
                setSelectedAnomaly(anomaly);
                setShowDetailsModal(true);
              }}
              showActions={false}
            />
          ))}
        </div>
      ) : (
        // Statistics view would go here
        <Card>
          <CardContent className="p-8 text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Statistics View
            </h3>
            <p className="text-gray-600">
              Detailed statistics and charts will be available here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!loading && filteredAnomalies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Historical Data Found
            </h3>
            <p className="text-gray-600">
              No anomalies match your current filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Details Modal */}
      {showDetailsModal && selectedAnomaly && (
        <AnomalyDetailsModal
          anomaly={selectedAnomaly}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAnomaly(null);
          }}
          canDismiss={false} // Historical anomalies can't be dismissed
        />
      )}
    </div>
  );
};

export default AnomalyHistoryPage;
