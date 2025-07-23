import React, { useState } from 'react';
import { 
  FunnelIcon,
  TagIcon 
} from '@heroicons/react/24/outline';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

/**
 * 🏷️ Anomaly Category Filters Component
 * 
 * Interactive filter component for anomaly categories with:
 * - Multi-select category filtering
 * - Visual category indicators
 * - Quick select/deselect all
 * - Category counts (if provided)
 */
const AnomalyCategoryFilters = ({
  selectedCategories = new Set(['all']),
  onCategoryChange,
  categoryCounts = {},
  showCounts = false,
  layout = 'horizontal', // 'horizontal', 'vertical', 'grid'
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);

  const categories = [
    {
      id: 'all',
      name: 'All Categories',
      icon: '🔍',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: '📦',
      color: 'bg-green-50 text-green-700 border-green-200',
      description: 'Stock levels, dead stock, sudden drops'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '🛒',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      description: 'Order patterns, high values, duplicates'
    },
    {
      id: 'workflow',
      name: 'Workflow',
      icon: '🔄',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Process delays, bottlenecks, stuck orders'
    },
    {
      id: 'workers',
      name: 'Workers',
      icon: '👷',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Performance, login patterns, productivity'
    }
  ];

  const handleCategoryToggle = (categoryId) => {
    const newCategories = new Set(selectedCategories);
    
    if (categoryId === 'all') {
      // If 'all' is selected, clear all others
      onCategoryChange(new Set(['all']));
    } else {
      // Remove 'all' if selecting specific categories
      newCategories.delete('all');
      
      if (newCategories.has(categoryId)) {
        newCategories.delete(categoryId);
        // If no categories selected, select 'all'
        if (newCategories.size === 0) {
          newCategories.add('all');
        }
      } else {
        newCategories.add(categoryId);
      }
      
      onCategoryChange(newCategories);
    }
  };

  const handleSelectAll = () => {
    onCategoryChange(new Set(['all']));
  };

  const handleSelectNone = () => {
    onCategoryChange(new Set());
  };

  const visibleCategories = showAll ? categories : categories.slice(0, 5);

  const renderCategory = (category) => {
    const isSelected = selectedCategories.has(category.id);
    const count = categoryCounts[category.id] || 0;
    
    return (
      <div
        key={category.id}
        className={`
          inline-flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer
          transition-all duration-200 hover:shadow-sm
          ${isSelected 
            ? category.color 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }
        `}
        onClick={() => handleCategoryToggle(category.id)}
      >
        <span className="text-lg">{category.icon}</span>
        <span className="font-medium">{category.name}</span>
        {showCounts && count > 0 && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
      </div>
    );
  };

  if (layout === 'grid') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Categories</span>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-xs"
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectNone}
              className="text-xs"
            >
              None
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {visibleCategories.map(renderCategory)}
        </div>
        
        {!showAll && categories.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(true)}
            className="w-full text-sm"
          >
            Show More Categories
          </Button>
        )}
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <TagIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Category</span>
        </div>
        
        <div className="space-y-1">
          {visibleCategories.map((category) => {
            const isSelected = selectedCategories.has(category.id);
            const count = categoryCounts[category.id] || 0;
            
            return (
              <div
                key={category.id}
                className={`
                  flex items-center justify-between p-2 rounded cursor-pointer
                  transition-colors duration-200
                  ${isSelected 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-gray-500">{category.description}</div>
                    )}
                  </div>
                </div>
                {showCounts && count > 0 && (
                  <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                    {count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {visibleCategories.map(renderCategory)}
      </div>
      
      {!showAll && categories.length > 5 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowAll(true)}
          className="text-sm"
        >
          + {categories.length - 5} more
        </Button>
      )}
      
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <span>Selected: {selectedCategories.size === 1 && selectedCategories.has('all') ? 'All' : selectedCategories.size}</span>
        {selectedCategories.size > 1 && !selectedCategories.has('all') && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSelectAll}
            className="text-xs underline"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default AnomalyCategoryFilters;
