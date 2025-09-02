/**
 * API Service Main Module
 * 
 * This module serves as the primary interface for all API communications
 * in the e-commerce application. It imports and re-exports the advanced
 * API service with sophisticated caching capabilities.
 * 
 * Features:
 * - Advanced caching with TTL (Time To Live)
 * - Request deduplication
 * - Error handling and retry logic
 * - Backward compatibility with legacy API calls
 * - Performance monitoring and statistics
 * - Critical data preloading
 */

/**
 * Import the advanced API service with enhanced features
 */
import advancedApiService from './advancedApiService';

/**
 * Re-export the advanced service as the default API service
 * This maintains backward compatibility while providing enhanced features
 * such as intelligent caching, request optimization, and error handling
 */
export default advancedApiService;

/**
 * Named exports for backward compatibility
 * 
 * These exports allow existing code to continue working without modification
 * while benefiting from the enhanced functionality of the advanced API service.
 * 
 * Available methods:
 * - request: Core HTTP request method with caching
 * - getProducts: Fetch all products with pagination
 * - getProduct: Fetch single product by ID
 * - getCategory: Fetch category data by ID
 * - getCategories: Fetch all categories
 * - searchProducts: Search products with filters
 * - getUserData: Fetch user profile data
 * - getCart: Fetch user's cart data
 * - invalidateCache: Clear specific cache entries
 * - refreshCache: Refresh cached data
 * - clearAllCaches: Clear all cached data
 * - getStats: Get API usage statistics
 * - preloadCriticalData: Preload essential app data
 */
export const {
  request,
  getProducts,
  getProduct,
  getCategory,
  getCategories,
  searchProducts,
  getUserData,
  getCart,
  invalidateCache,
  refreshCache,
  clearAllCaches,
  getStats,
  preloadCriticalData
} = advancedApiService;
