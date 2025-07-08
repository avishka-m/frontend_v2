import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Detail Page Template
 * 
 * This template provides a consistent structure for all detail pages
 * with progressive loading, error handling, and responsive layout.
 * 
 * Usage:
 * <DetailPageTemplate
 *   entityType="packing"
 *   entityId={id}
 *   useDataHook={usePackingData}
 *   components={{
 *     Header: PackingHeader,
 *     Status: PackingStatus,
 *     Details: PackingDetails,
 *     Actions: PackingActions,
 *     ItemsList: PackingItemsList,
 *     History: PackingHistory
 *   }}
 *   backRoute="/packing"
 * />
 */
const DetailPageTemplate = ({
  entityType,
  entityId,
  useDataHook,
  components,
  backRoute,
  showProgressPanel = false,
  customSidebar = null,
  className = ""
}) => {
  const navigate = useNavigate();
  
  // Use the provided data hook
  const hookResult = useDataHook(entityId);
  const {
    basicInfo,
    items,
    history,
    actions,
    loading,
    errors,
    loadHistory,
    refreshAll
  } = hookResult;

  // Extract components
  const {
    Header,
    Status,
    Details,
    Actions,
    ItemsList,
    History
  } = components;

  // Handle critical error (basic info failed to load)
  if (errors.basicInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Details
          </h3>
          <p className="text-sm text-gray-500 mb-4">{errors.basicInfo}</p>
          <button
            onClick={() => navigate(backRoute)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header loads immediately with basic info */}
      <Header 
        {...{[`${entityType}Data`]: basicInfo}}
        loading={loading.basicInfo} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Component - Loads second */}
            <Suspense fallback={<StatusSkeleton />}>
              <Status 
                {...{[`${entityType}Data`]: basicInfo}}
                loading={loading.basicInfo}
                onRefresh={refreshAll}
              />
            </Suspense>
            
            {/* Details Component - Loads third */}
            <Suspense fallback={<DetailsSkeleton />}>
              <Details 
                {...{[`${entityType}Data`]: basicInfo}}
                loading={loading.basicInfo}
                error={errors.basicInfo}
              />
            </Suspense>
            
            {/* Items List - Loads fourth (most important content) */}
            <Suspense fallback={<ItemsListSkeleton />}>
              <ItemsList 
                items={items}
                loading={loading.items}
                error={errors.items}
                onRefresh={refreshAll}
              />
            </Suspense>
            
          </div>
          
          {/* Right Column - Actions & Secondary */}
          <div className="space-y-6">
            
            {/* Actions Panel - Loads after basic info */}
            <Suspense fallback={<ActionsSkeleton />}>
              <Actions 
                {...{[`${entityType}Data`]: basicInfo}}
                availableActions={actions}
                loading={loading.actions}
                onAction={refreshAll}
                {...hookResult} // Pass all hook results for action-specific functions
              />
            </Suspense>
            
            {/* Progress Panel (optional) */}
            {showProgressPanel && basicInfo && (
              <ProgressPanel 
                entityType={entityType}
                basicInfo={basicInfo}
              />
            )}
            
            {/* Custom Sidebar Content (optional) */}
            {customSidebar && customSidebar(basicInfo, loading, errors)}
            
            {/* History Panel - Lazy loaded only when requested */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Activity History</h3>
                <button
                  onClick={loadHistory}
                  className="text-sm text-blue-600 hover:text-blue-500"
                  disabled={loading.history}
                >
                  {loading.history ? 'Loading...' : 'Load History'}
                </button>
              </div>
              
              {history.length > 0 && (
                <Suspense fallback={<HistorySkeleton />}>
                  <History 
                    history={history}
                    loading={loading.history}
                    error={errors.history}
                  />
                </Suspense>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

// Optional Progress Panel Component
const ProgressPanel = ({ entityType, basicInfo }) => {
  // Different progress displays based on entity type
  const getProgressData = () => {
    switch (entityType) {
      case 'receiving':
        return {
          total: basicInfo.total_quantity || 0,
          completed: basicInfo.received_quantity || 0,
          label: 'Received',
          color: 'green'
        };
      case 'packing':
        return {
          total: basicInfo.total_items || 0,
          completed: basicInfo.packed_items || 0,
          label: 'Packed',
          color: 'blue'
        };
      case 'picking':
        return {
          total: basicInfo.total_items || 0,
          completed: basicInfo.picked_items || 0,
          label: 'Picked',
          color: 'purple'
        };
      default:
        return null;
    }
  };

  const progressData = getProgressData();
  if (!progressData) return null;

  const { total, completed, label, color } = progressData;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Progress
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Items</span>
          <span className="font-medium">{total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{label}</span>
          <span className={`font-medium text-${color}-600`}>{completed}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Remaining</span>
          <span className="font-medium text-orange-600">{remaining}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Skeleton Components
const StatusSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

const DetailsSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const ItemsListSkeleton = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <div className="w-28 h-6 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const ActionsSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

const HistorySkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start space-x-3">
        <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse mt-2"></div>
        <div className="flex-1 space-y-1">
          <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export default DetailPageTemplate; 