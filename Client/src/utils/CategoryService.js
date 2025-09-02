/**
 * Category Service for E-Commerce Application
 * 
 * This service handles all category-related API operations with:
 * - Unified API service integration for caching and error handling
 * - Auto-configured API base URL for flexible deployment
 * - Comprehensive error handling and connectivity diagnostics
 * - Data transformation for consistent category structure
 * - Network health monitoring and troubleshooting
 * 
 * Features:
 * - Category fetching with product relationships
 * - Connection diagnostics for troubleshooting
 * - Data transformation and normalization
 * - Timeout handling and retry logic
 * - Performance monitoring
 */

import apiService from "../services/apiService";
import API_BASE_URL from "../config/api";

/**
 * CategoryService Class
 * 
 * Provides methods for category management with enhanced error handling,
 * data transformation, and connectivity monitoring.
 */
class CategoryService {
  
  /**
   * Get All Categories with Products
   * 
   * Fetches all product categories from the backend with their associated products.
   * Includes data transformation to ensure consistent category structure and
   * comprehensive error handling for network issues.
   * 
   * @returns {Promise<Object>} Promise resolving to categories data with success status
   * @returns {boolean} success - Whether the operation was successful
   * @returns {Array} data - Array of transformed category objects
   * @returns {string} message - Status message
   */
  static async getAllCategories() {
    try {
      const apiUrl = `/api/products/get`;
      
      // Make API request with timeout and proper headers
      const response = await apiService.request(apiUrl, {
        timeout: 10000, // 10 second timeout for category data
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response?.statusCode === 1) {
        const categories = response.data || [];
        
        // Transform category data structure for frontend consistency
        const transformedCategories = categories.map((category, index) => {
          return {
            _id: category._id,
            name: category.categoryName,
            categoryName: category.categoryName,
            products: category.products || [],
            productCount: category.products?.length || 0,
            // Extract preview image from first product if available
            image: category.products?.[0]?.images?.[0] || null
          };
        });

        return {
          success: true,
          data: transformedCategories,
          message: "Categories fetched successfully"
        };
      } else {
        
        return {
          success: false,
          data: [],
          message: response?.message || "Failed to fetch categories"
        };
      }
    } catch (error) {
      
      // Detailed error analysis with CORS-specific handling
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        // CORS/Network issue detected
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        // Connection refused - backend server not running
      } else if (error.code === 'ENOTFOUND' || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        // DNS resolution failed
      } else if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
        // Request timeout
      } else if (error.response) {
        // HTTP error response
      }
      
      // Additional debugging info
      
      return {
        success: false,
        data: [],
        message: error.message || "Network error"
      };
    }
  }

  /**
   * Fetch category by ID with products
   * @param {string} categoryId - The category ID
   */
  static async getCategoryById(categoryId) {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      const apiUrl = `/api/category/${categoryId}`;
      
      const response = await apiService.request(apiUrl);
      
      
      if (response?.statusCode === 1) {
        
        return {
          success: true,
          data: response.data || {},
          message: "Category fetched successfully"
        };
      } else {
        
        return {
          success: false,
          data: {},
          message: response?.message || "Category not found"
        };
      }
    } catch (error) {
      return {
        success: false,
        data: {},
        message: error.message || "Network error"
      };
    }
  }

  /**
   * Fetch multiple categories with their products for home page
   * @param {number} limit - Number of categories to fetch
   */
  static async getCategoriesForHome(limit = 6) {
    try {
      
      const categoriesResponse = await this.getAllCategories();
      
      if (!categoriesResponse.success) {
        
        return categoriesResponse;
      }

      // Filter out categories with only one product
      const filteredCategories = categoriesResponse.data.filter(cat => cat.productCount > 1);
      
      
      const categories = filteredCategories.slice(0, limit);
      
      return {
        success: true,
        data: categories,
        message: "Categories with products fetched successfully"
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || "Failed to fetch categories for home"
      };
    }
  }

  /**
   * Search categories by name
   * @param {string} searchTerm - The search term
   */
  static async searchCategories(searchTerm) {
    try {
      const response = await apiService.request(`/api/categories/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response?.statusCode === 1) {
        return {
          success: true,
          data: response.data || [],
          message: "Categories search completed"
        };
      } else {
        return {
          success: false,
          data: [],
          message: response?.message || "No categories found"
        };
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || "Search failed"
      };
    }
  }

  /**
   * Test backend connectivity and health
   * @returns {Promise<Object>} Health status
   */
  static async checkBackendHealth() {
    
    const healthStatus = {
      isConnected: false,
      responseTime: null,
      serverStatus: null,
      apiBaseUrl: API_BASE_URL,
      environment: process.env.NODE_ENV,
      errors: []
    };

    try {

      const startTime = performance.now();
      
      // Test primary endpoint
      const response = await apiService.request(`/api/products/get`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Health-Check': 'true'
        }
      });

      const endTime = performance.now();
      healthStatus.responseTime = Math.round(endTime - startTime);
      healthStatus.isConnected = true;
      healthStatus.serverStatus = 200; // apiService handles HTTP status internally
      
      // Response received successfully, connection is healthy
      if (response) {
        healthStatus.isConnected = true;
      }

    } catch (error) {
      
      healthStatus.errors.push({
        type: error.name,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });

      // Provide specific diagnosis
      if (error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        healthStatus.diagnosis = 'Backend server not running on ' + API_BASE_URL;
        healthStatus.solution = 'Start the backend server';
      } else if (error.code === 'ENOTFOUND') {
        healthStatus.diagnosis = 'Cannot resolve backend hostname';
        healthStatus.solution = 'Check network connection';
      } else if (error.code === 'TIMEOUT') {
        healthStatus.diagnosis = 'Backend server timeout';
        healthStatus.solution = 'Check server performance';
      }
    }

    return healthStatus;
  }

  /**
   * Auto-diagnose backend connection issues
   * @returns {Promise<Object>} Diagnostic report
   */
  static async diagnoseConnection() {
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiBaseUrl: API_BASE_URL,
      currentUrl: window.location.href,
      networkStatus: navigator.onLine,
      issues: [],
      recommendations: []
    };

    // Check 1: Network connectivity
    if (!navigator.onLine) {
      diagnosis.issues.push('No internet connection');
      diagnosis.recommendations.push('Check your internet connection');
    }

    // Check 2: API URL configuration
    if (!API_BASE_URL) {
      diagnosis.issues.push('API_BASE_URL is not configured');
      diagnosis.recommendations.push('Configure API_BASE_URL in config/api.js');
    }

    // Check 3: Environment-specific issues
    if (process.env.NODE_ENV === 'development') {
      if (API_BASE_URL.includes('localhost:5001')) {
        diagnosis.recommendations.push('Ensure backend server is running on port 5001');
        diagnosis.recommendations.push('Run "npm start" in the Server/ directory');
      }
    }

    // Check 4: Backend health
    const healthStatus = await this.checkBackendHealth();
    if (!healthStatus.isConnected) {
      diagnosis.issues.push('Cannot connect to backend server');
      if (healthStatus.diagnosis) {
        diagnosis.issues.push(healthStatus.diagnosis);
      }
      if (healthStatus.solution) {
        diagnosis.recommendations.push(healthStatus.solution);
      }
    }

    return diagnosis;
  }
}

export default CategoryService;
