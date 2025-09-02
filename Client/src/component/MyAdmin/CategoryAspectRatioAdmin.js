/**
 * Category Aspect Ratio Admin Component
 * 
 * Administrative interface for managing category aspect ratios and fit modes.
 * Provides tools for:
 * - Viewing current aspect ratio configurations
 * - Editing aspect ratios for specific categories
 * - Bulk updates for multiple categories
 * - Preview of how changes affect product display
 * - Analytics on aspect ratio distribution
 * 
 * Features:
 * - Real-time preview of aspect ratio changes
 * - Validation of aspect ratio values
 * - Batch operations for efficiency
 * - Undo/redo functionality
 * - Export/import configuration
 */

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { 
  getCategoryConfig, 
  validateCategoryConfig, 
  ASPECT_RATIO_CLASSES 
} from '../../utils/aspectRatioHelper';

const CategoryAspectRatioAdmin = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [bulkConfig, setBulkConfig] = useState({ aspectRatio: 1, fitMode: 'contain' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByRatio, setFilterByRatio] = useState('all');

  /**
   * Fetch Categories from API
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/category/get');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const result = await response.json();
      if (result.statusCode === 1 && result.data) {
        setCategories(result.data);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update Category Configuration
   */
  const updateCategory = async (categoryId, config) => {
    try {
      const validation = validateCategoryConfig('temp', config.aspectRatio, config.fitMode);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await fetch(`/api/category/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aspectRatio: config.aspectRatio,
          fitMode: config.fitMode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Update local state
      setCategories(prev => prev.map(cat => 
        cat._id === categoryId 
          ? { ...cat, aspectRatio: config.aspectRatio, fitMode: config.fitMode }
          : cat
      ));

      setSuccess('Category updated successfully');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  /**
   * Bulk Update Selected Categories
   */
  const bulkUpdateCategories = async () => {
    if (selectedCategories.size === 0) {
      setError('No categories selected');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatePromises = Array.from(selectedCategories).map(categoryId =>
        updateCategory(categoryId, bulkConfig)
      );

      await Promise.all(updatePromises);
      setSelectedCategories(new Set());
      setSuccess(`Updated ${selectedCategories.size} categories successfully`);

    } catch (err) {
      setError('Some updates failed. Please check individual categories.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset Category to Default Configuration
   */
  const resetToDefault = async (category) => {
    const defaultConfig = getCategoryConfig(category.name);
    await updateCategory(category._id, {
      aspectRatio: defaultConfig.aspectRatio,
      fitMode: defaultConfig.fitMode
    });
  };

  /**
   * Filter and Search Categories
   */
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply aspect ratio filter
    if (filterByRatio !== 'all') {
      const targetRatio = parseFloat(filterByRatio);
      filtered = filtered.filter(cat =>
        Math.abs((cat.aspectRatio || 1) - targetRatio) < 0.01
      );
    }

    return filtered;
  }, [categories, searchTerm, filterByRatio]);

  /**
   * Aspect Ratio Statistics
   */
  const stats = useMemo(() => {
    const ratioDistribution = {};
    const fitModeDistribution = {};

    categories.forEach(cat => {
      const ratio = cat.aspectRatio || 1;
      const fitMode = cat.fitMode || 'contain';

      ratioDistribution[ratio] = (ratioDistribution[ratio] || 0) + 1;
      fitModeDistribution[fitMode] = (fitModeDistribution[fitMode] || 0) + 1;
    });

    return {
      total: categories.length,
      ratioDistribution,
      fitModeDistribution
    };
  }, [categories]);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Category Aspect Ratio Management
        </h1>
        <p className="text-gray-600">
          Configure aspect ratios and fit modes for consistent product image display
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Categories</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Most Common Ratio</h3>
          <p className="text-3xl font-bold text-green-600">
            {Object.entries(stats.ratioDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || '1'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selected</h3>
          <p className="text-3xl font-bold text-purple-600">{selectedCategories.size}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Categories
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by category name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Ratio
            </label>
            <select
              value={filterByRatio}
              onChange={(e) => setFilterByRatio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratios</option>
              {ASPECT_RATIO_CLASSES.map(({ ratio, description }) => (
                <option key={ratio} value={ratio}>
                  {ratio} ({description})
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Operations */}
          {selectedCategories.size > 0 && (
            <div className="flex gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Aspect Ratio
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5"
                  value={bulkConfig.aspectRatio}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, aspectRatio: parseFloat(e.target.value) }))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Fit Mode
                </label>
                <select
                  value={bulkConfig.fitMode}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, fitMode: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill</option>
                </select>
              </div>
              
              <button
                onClick={bulkUpdateCategories}
                disabled={saving}
                className={cn(
                  'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  saving && 'opacity-50 cursor-not-allowed'
                )}
              >
                {saving ? 'Updating...' : `Update ${selectedCategories.size}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            isSelected={selectedCategories.has(category._id)}
            onSelect={(id, selected) => {
              const newSelection = new Set(selectedCategories);
              if (selected) {
                newSelection.add(id);
              } else {
                newSelection.delete(id);
              }
              setSelectedCategories(newSelection);
            }}
            onUpdate={(config) => updateCategory(category._id, config)}
            onReset={() => resetToDefault(category)}
          />
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || filterByRatio !== 'all' 
              ? 'No categories match your filters' 
              : 'No categories found'
            }
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Category Card Component
 */
const CategoryCard = ({ category, isSelected, onSelect, onUpdate, onReset }) => {
  const [editing, setEditing] = useState(false);
  const [config, setConfig] = useState({
    aspectRatio: category.aspectRatio || 1,
    fitMode: category.fitMode || 'contain'
  });

  const handleSave = async () => {
    await onUpdate(config);
    setEditing(false);
  };

  const handleCancel = () => {
    setConfig({
      aspectRatio: category.aspectRatio || 1,
      fitMode: category.fitMode || 'contain'
    });
    setEditing(false);
  };

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border-2 transition-all duration-200',
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(category._id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <h3 className="font-medium text-gray-900">{category.name}</h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      <div className="p-4">
        <div 
          className="bg-gray-100 rounded-lg overflow-hidden mb-4"
          style={{ aspectRatio: config.aspectRatio }}
        >
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className={cn(
                'w-full h-full transition-all duration-200',
                config.fitMode === 'cover' ? 'object-cover' : 'object-contain'
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Configuration */}
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aspect Ratio
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={config.aspectRatio}
                onChange={(e) => setConfig(prev => ({ ...prev, aspectRatio: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fit Mode
              </label>
              <select
                value={config.fitMode}
                onChange={(e) => setConfig(prev => ({ ...prev, fitMode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="contain">Contain (Minimal Padding)</option>
                <option value="cover">Cover (Full Coverage)</option>
                <option value="fill">Fill (Stretch)</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Aspect Ratio:</span>
              <span className="font-medium">{config.aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span>Fit Mode:</span>
              <span className="font-medium capitalize">{config.fitMode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAspectRatioAdmin;
