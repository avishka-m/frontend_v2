import React, { useState, useMemo } from 'react';
import { 
  FunnelIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import AnomalyCard from './AnomalyCard';
import { 
  ANOMALY_SEVERITY, 
  ANOMALY_CATEGORIES, 
  DETECTION_TECHNIQUES,
  sortAnomaliesBySeverity,
  filterAnomaliesByCategory,
  filterAnomaliesBySeverity
} from '../../utils/anomalyUtils';

/**
 * 🔍 Anomaly List Component
 * 
 * Advanced list view for anomalies with:
 * - Filtering by category, severity, technique
 * - Search functionality
 * - Sorting options
 * - Pagination
 * - Bulk actions
 */
const AnomalyList = ({
  anomalies = [],
  loading = false,
  onSelectAnomaly,
  onDismissAnomaly,
  onViewDetails,
  onRefresh,
  compact = false,
  showFilters = true,
  showSearch = true,
  itemsPerPage = 10,
  className = ''
}) => {
  // Filter and search states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [techniqueFilter, setTechniqueFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('severity');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnomalies, setSelectedAnomalies] = useState(new Set());

  // Filter and sort anomalies
  const filteredAndSortedAnomalies = useMemo(() => {
    let filtered = [...anomalies];

    // Apply filters
    if (categoryFilter !== 'all') {
      filtered = filterAnomaliesByCategory(filtered, categoryFilter);
    }
    
    if (severityFilter !== 'all') {
      filtered = filterAnomaliesBySeverity(filtered, severityFilter);
    }
    
    if (techniqueFilter !== 'all') {
      filtered = filtered.filter(anomaly => 
        anomaly.detection_method === techniqueFilter ||
        (techniqueFilter === 'both' && anomaly.detection_method)
      );
    }

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(anomaly =>
        (anomaly.title || '').toLowerCase().includes(searchLower) ||
        (anomaly.description || '').toLowerCase().includes(searchLower) ||
        (anomaly.type || '').toLowerCase().includes(searchLower) ||
        (anomaly.item_id || '').toString().toLowerCase().includes(searchLower) ||
        (anomaly.order_id || '').toString().toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortBy === 'severity') {
      filtered = sortAnomaliesBySeverity(filtered);
      if (sortOrder === 'desc') {
        filtered.reverse();
      }
    } else {
      filtered.sort((a, b) => {
        let aVal = a[sortBy] || '';
        let bVal = b[sortBy] || '';
        
        if (sortBy === 'timestamp') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return filtered;
  }, [anomalies, categoryFilter, severityFilter, techniqueFilter, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAnomalies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnomalies = filteredAndSortedAnomalies.slice(startIndex, startIndex + itemsPerPage);

  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter('all');
    setSeverityFilter('all');
    setTechniqueFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Toggle selection
  const toggleSelection = (anomalyId) => {
    if (!anomalyId) {
      console.warn('⚠️ Anomaly ID is missing');
      return;
    }
    
    console.log('🔄 Toggling selection for anomaly ID:', anomalyId);
    
    const newSelected = new Set(selectedAnomalies);
    if (newSelected.has(anomalyId)) {
      newSelected.delete(anomalyId);
      console.log('➖ Anomaly deselected:', anomalyId);
    } else {
      newSelected.add(anomalyId);
      console.log('➕ Anomaly selected:', anomalyId);
    }
    setSelectedAnomalies(newSelected);
    
    console.log('📊 Total selected:', newSelected.size);
  };

  // Select all visible
  const selectAllVisible = () => {
    console.log('📋 Selecting all visible anomalies...');
    
    // Generate IDs using the same logic as in the checkbox rendering
    const visibleIds = new Set(paginatedAnomalies.map((a, index) => 
      a.id || a.anomaly_id || `temp-${a.anomaly_type}-${index}`
    ));
    
    console.log('🎯 Generated visible IDs:', Array.from(visibleIds));
    setSelectedAnomalies(visibleIds);
    
    console.log('✅ All visible anomalies selected:', visibleIds.size);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedAnomalies(new Set());
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Anomalies ({filteredAndSortedAnomalies.length})
          </h3>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedAnomalies.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedAnomalies.size} selected
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <ArrowsUpDownIcon className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search anomalies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">Filters:</span>
              </div>
              
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...Object.values(ANOMALY_CATEGORIES).map(cat => ({
                    value: cat.value,
                    label: `${cat.icon} ${cat.label}`
                  }))
                ]}
                className="min-w-[140px]"
              />
              
              <Select
                value={severityFilter}
                onChange={setSeverityFilter}
                options={[
                  { value: 'all', label: 'All Severities' },
                  ...Object.values(ANOMALY_SEVERITY).map(sev => ({
                    value: sev.value,
                    label: `${sev.icon} ${sev.label}`
                  }))
                ]}
                className="min-w-[140px]"
              />
              
              <Select
                value={techniqueFilter}
                onChange={setTechniqueFilter}
                options={[
                  { value: 'all', label: 'All Techniques' },
                  ...Object.values(DETECTION_TECHNIQUES).map(tech => ({
                    value: tech.value,
                    label: `${tech.icon} ${tech.label}`
                  }))
                ]}
                className="min-w-[140px]"
              />
              
              <Select
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'severity', label: 'Sort by Severity' },
                  { value: 'timestamp', label: 'Sort by Time' },
                  { value: 'category', label: 'Sort by Category' },
                  { value: 'type', label: 'Sort by Type' }
                ]}
                className="min-w-[140px]"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              
              {(categoryFilter !== 'all' || severityFilter !== 'all' || techniqueFilter !== 'all' || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Bulk Actions - Always visible for better UX */}
          {paginatedAnomalies.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('📋 Select All Visible clicked');
                    selectAllVisible();
                    console.log('✅ All visible anomalies selected');
                  }}
                  disabled={paginatedAnomalies.length === 0}
                  className="font-medium"
                >
                  ✅ Select All Visible
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('🔄 Clear Selection clicked');
                    clearSelection();
                    console.log('✅ Selection cleared');
                  }}
                  disabled={selectedAnomalies.size === 0}
                  className="font-medium"
                >
                  ❌ Clear Selection
                </Button>
              </div>
              
              {/* Selection count indicator */}
              {selectedAnomalies.size > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedAnomalies.size} of {paginatedAnomalies.length} selected
                  {/* Debug: Show selected IDs */}
                  <div className="text-xs text-gray-400 mt-1">
                    Selected IDs: {Array.from(selectedAnomalies).slice(0, 3).join(', ')}
                    {selectedAnomalies.size > 3 && '...'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Anomaly List */}
      <div className="space-y-3">
        {loading && anomalies.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading anomalies...</p>
          </div>
        ) : paginatedAnomalies.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FunnelIcon className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">
              {filteredAndSortedAnomalies.length === 0 && anomalies.length > 0
                ? 'No anomalies match your filters'
                : 'No anomalies detected'
              }
            </p>
            {filteredAndSortedAnomalies.length === 0 && anomalies.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          paginatedAnomalies.map((anomaly, index) => {
            const anomalyId = anomaly.id || anomaly.anomaly_id || `temp-${anomaly.anomaly_type}-${index}`;
            
            return (
              <div key={anomalyId} className="flex items-start space-x-3">
                {/* Selection checkbox */}
                <input
                  type="checkbox"
                  checked={selectedAnomalies.has(anomalyId)}
                  onChange={() => toggleSelection(anomalyId)}
                  className="mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  title={`Select anomaly: ${anomaly.title || anomaly.type || 'Unknown'}`}
                />
              
                {/* Anomaly card */}
                <div className="flex-1">
                  <AnomalyCard
                    anomaly={anomaly}
                    onSelect={onSelectAnomaly}
                    onDismiss={onDismissAnomaly}
                    onViewDetails={onViewDetails}
                    compact={compact}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedAnomalies.length)} of {filteredAndSortedAnomalies.length} anomalies
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyList;
