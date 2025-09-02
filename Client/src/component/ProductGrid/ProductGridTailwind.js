/**
 * React Core Import
 */
import React from 'react';

/**
 * Component Imports
 */
import ProductCardTailwind from '../ProductCard/ProductCardTailwind';
import SkeletonLoader from '../SkeletonLoader';

/**
 * Utility Functions
 */
import { cn } from '../../utils/cn';
import { getCategoryConfig } from '../../utils/aspectRatioHelper';

/**
 * Product Grid Component - Responsive Product Display System
 * 
 * Modern product grid featuring:
 * - Responsive grid layout optimized for all devices
 * - Maximum 4 columns design for optimal product visibility
 * - Configurable aspect ratios for different product types
 * - Loading states with skeleton animations
 * - Pagination support for large product catalogs
 * - Mobile-first design with progressive enhancement
 * - Minimal gap spacing for maximum product density
 * 
 * Key Features:
 * - Fixed responsive breakpoints: 2 → 3 → 4 columns
 * - 4px gap spacing for clean, dense layout
 * - Skeleton loading for 8 products during initial load
 * - Empty state handling with user-friendly messages
 * - Prop filtering to prevent DOM attribute warnings
 * - Supports infinite scroll with loading indicators
 * - Customizable aspect ratios (square, portrait, landscape)
 * 
 * Responsive Breakpoints:
 * - Mobile: 2 columns (grid-cols-2)
 * - Tablet: 3 columns (sm:grid-cols-3)
 * - Desktop+: 4 columns (lg:grid-cols-4) - Maximum for optimal UX
 * 
 * Design Philosophy:
 * - Maximum 4 columns even on large screens for better product focus
 * - Minimal gaps (4px) to maximize product display area
 * - Consistent aspect ratios across all breakpoints
 * - Progressive enhancement from mobile to desktop
 * 
 * Props:
 * - products: Array of product objects to display
 * - columns: Grid column configuration (defaults to 4 max)
 * - categoryAspectRatio: Numeric aspect ratio for the category (overrides auto-detection)
 * - fitMode: Image fit mode ('contain' for minimal padding, 'cover' for full coverage)
 * - category: Category object for automatic aspect ratio detection
 * - className: Additional CSS classes
 * - showPagination: Enable pagination controls
 * - currentPage/totalPages: Pagination state
 * - onPageChange: Pagination callback
 * - isLoadingMore: Loading state for infinite scroll
 * - loading: Initial loading state
 */
const ProductGridTailwind = ({ 
  products = [], 
  columns = 4, 
  categoryAspectRatio,
  fitMode = 'contain',
  category,
  className = '',
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  isLoadingMore = false,
  loading = false,
  ...props 
}) => {
  /**
   * Category-Based Aspect Ratio Configuration
   * 
   * Determines the optimal aspect ratio configuration for the product grid:
   * - Priority 1: Manual categoryAspectRatio prop (numeric override)
   * - Priority 2: Category object for automatic detection
   * - Priority 3: First product's category for fallback detection
   * - Priority 4: Default square aspect ratio
   * 
   * This system ensures consistent image display with minimal padding
   * across all products in the same category.
   */
  const getAspectRatioConfig = () => {
    // Manual override via categoryAspectRatio prop
    if (typeof categoryAspectRatio === 'number') {
      return { aspectRatio: categoryAspectRatio, fitMode };
    }
    
    // Use category object if provided
    if (category) {
      const config = getCategoryConfig(category);
      return { aspectRatio: config.aspectRatio, fitMode: fitMode || config.fitMode };
    }
    
    // Fallback to first product's category
    if (products && products.length > 0 && products[0].category) {
      const config = getCategoryConfig(products[0].category);
      return { aspectRatio: config.aspectRatio, fitMode: fitMode || config.fitMode };
    }
    
    // Default configuration
    return { aspectRatio: 1, fitMode: 'contain' };
  };

  const aspectRatioConfig = getAspectRatioConfig();

  /**
   * Responsive Grid Class Generator
   * 
   * Creates optimized grid classes for product display:
   * - Fixed 4px gap for minimal spacing
   * - Progressive column increase: mobile 2 → tablet 3 → desktop 4
   * - Maximum 4 columns for optimal product visibility
   * - Consistent across all screen sizes
   * 
   * Design Rationale:
   * - 4 columns maximum prevents products from becoming too small
   * - 4px gaps maximize product display area
   * - Mobile-first approach ensures usability on all devices
   */
  const getResponsiveGridClasses = (cols) => {
    return cn(
      'grid gap-1', // 4px gap (gap-1 = 0.25rem = 4px)
      'grid-cols-2', // Mobile: 2 columns for thumb-friendly browsing
      'sm:grid-cols-3', // Tablet: 3 columns for better product visibility
      'lg:grid-cols-4' // Desktop: 4 columns maximum for optimal focus
    );
  };

  /**
   * Props Filtering for DOM Compliance
   * 
   * Removes custom component props to prevent React DOM warnings:
   * - Filters out all component-specific props
   * - Passes only valid DOM attributes to container
   * - Maintains clean DOM structure
   */
  const { 
    isLoadingMore: _isLoadingMore, 
    loading: _loading, 
    products: _products,
    columns: _columns,
    categoryAspectRatio: _categoryAspectRatio,
    aspectRatio: _aspectRatio,
    fitMode: _fitMode,
    category: _category,
    showPagination: _showPagination,
    currentPage: _currentPage,
    totalPages: _totalPages,
    onPageChange: _onPageChange,
    ...domProps 
  } = props;

  /**
   * Loading State Render
   * 
   * Displays skeleton loaders during initial load:
   * - Shows 8 skeleton cards for consistent appearance
   * - Maintains same grid structure as actual content
   * - Provides engaging loading experience
   * - Matches final layout dimensions
   */
  if (loading && (!products || products.length === 0)) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
        {Array(8).fill(0).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    );
  }

  /**
   * Empty State Render
   * 
   * User-friendly message when no products available:
   * - Clear messaging for empty results
   * - Consistent styling with overall design
   * - Accessible text contrast and sizing
   */
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div 
      className={cn('w-full', className)} 
      {...domProps}
    >
      {/* Product Grid - using same responsive structure as CategoryGrid */}
      <div className={getResponsiveGridClasses(columns)}>
        {products.map((product, index) => (
          <div key={product._id || index} className="w-full h-full">
            {product.isPlaceholder ? (
              // Skeleton loader for placeholder products
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse h-full">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              // Real product card with consistent category-based sizing
              <ProductCardTailwind 
                product={product}
                categoryAspectRatio={aspectRatioConfig.aspectRatio}
                fitMode={aspectRatioConfig.fitMode}
                className="h-full"
              />
            )}
          </div>
        ))}
        
        {/* Loading indicators for infinite scroll */}
        {isLoadingMore && (
          <>
            {Array(4).fill(0).map((_, index) => (
              <div key={`loading-skeleton-${index}`} className="w-full h-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            )}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                )}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGridTailwind);
