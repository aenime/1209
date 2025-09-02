/**
 * React Core and Navigation Imports
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Context Hooks and Components
 */
import { useProduct } from "../../contexts/ProductContext";
import CategoryCard from "./CategoryCard";

/**
 * Utility Functions
 */
import { cn } from "../../utils/cn";

/**
 * Category Grid Component - Responsive Category Display System
 * 
 * Modern category grid featuring:
 * - Responsive grid layout adapting to all screen sizes
 * - Dynamic category loading from ProductContext
 * - Configurable category limits for layout optimization
 * - Loading states with skeleton animations
 * - Error handling with user-friendly messages
 * - Accessibility-compliant navigation
 * - Mobile-first design principles
 * 
 * Key Features:
 * - Auto-fetches categories if not already loaded in context
 * - Supports custom category limits for different page layouts
 * - Optional title display for flexible usage
 * - Responsive grid: 2 cols mobile → 3 cols tablet → 4-6 cols desktop
 * - Skeleton loading animations for better UX
 * - Error boundaries with graceful fallbacks
 * - Context-aware data management
 * 
 * Grid Breakpoints:
 * - Mobile (default): 2 columns
 * - Small tablets: 3 columns  
 * - Large tablets: 4 columns
 * - Desktop: 6 columns
 * 
 * Props:
 * - className: Additional CSS classes for customization
 * - maxCategories: Maximum number of categories to display (default: 8)
 * - showTitle: Whether to display the section title (default: true)
 */
const CategoryGrid = ({ className = "", maxCategories = 8, showTitle = true }) => {
  /**
   * Context and Navigation Hooks
   */
  const productContext = useProduct();
  const { categories: contextCategories, fetchCategories } = productContext || {};
  const navigate = useNavigate();

  /**
   * Component State Management
   * 
   * Manages loading and error states:
   * - isLoading: Shows skeleton animations during data fetching
   * - error: Displays user-friendly error messages
   */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Category Data Processing
   * 
   * Processes categories from context:
   * - Uses categories from ProductContext if available
   * - Limits to maxCategories for layout optimization
   * - Falls back to empty array if data unavailable
   * - Ensures type safety with array validation
   */
  const categories = (contextCategories && Array.isArray(contextCategories)) ? contextCategories.slice(0, maxCategories) : [];

  /**
   * Category Loading Effect
   * 
   * Handles automatic category fetching:
   * - Checks if categories already loaded in context
   * - Triggers fetchCategories if data missing
   * - Manages loading states during fetch
   * - Handles errors with user-friendly messages
   * - Prevents unnecessary re-fetching
   */
  useEffect(() => {
    const loadCategories = async () => {
      if (!contextCategories || contextCategories.length === 0) {
        setIsLoading(true);
        setError(null);
        
        try {
          if (fetchCategories) {
            await fetchCategories();
          }
        } catch (error) {
          setError("Failed to load categories");
          console.error('Category loading error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (fetchCategories) {
      loadCategories();
    }
  }, [contextCategories, fetchCategories]);

  /**
   * Loading State Render
   * 
   * Displays skeleton animations during data loading:
   * - Mimics final layout structure
   * - Shows 6 skeleton cards for consistent appearance
   * - Includes animated title skeleton if showTitle enabled
   * - Uses pulse animations for engaging loading experience
   */
  if (isLoading) {
    return (
      <section className={cn("py-8", className)}>
        <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1">
          {showTitle && (
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="w-20 h-1 bg-gray-200 mx-auto rounded-full animate-pulse"></div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={cn("py-8", className)}>
        <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No categories or only one category - don't render component
  if (!categories || categories.length === 0 || categories.length === 1) {
    return null;
  }

  return (
    <section className={cn("py-8 bg-white", className)}>
      <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1">
        {showTitle && (
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
              Shop by Category
            </h2>
            <p className="text-sm text-gray-600 mb-3 max-w-lg mx-auto">
              Discover our wide range of products organized by categories
            </p>
            <div className="w-16 h-0.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category._id || `category-${index}`}
              category={category}
              className="h-full"
            />
          ))}
        </div>

        {/* View All Categories Button */}
        {categories.length >= maxCategories && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/categories')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span>View All Categories</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
