/**
 * React hooks and context imports
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * Category service for API operations
 */
import CategoryService from "../utils/CategoryService";

/**
 * Global Promise Cache for Categories
 * 
 * Prevents duplicate API calls by caching the promise while a request is in progress.
 * This ensures that multiple components requesting categories simultaneously will
 * share the same API call rather than making redundant requests.
 */
let categoriesPromise = null;

/**
 * Product Context for global product and category state management
 */
const ProductContextProvide = createContext();

/**
 * Custom hook to access product context
 * @returns {Object} Product context value with all product-related methods and state
 */
const useProduct = () => useContext(ProductContextProvide);

/**
 * Product Context Provider Component
 * 
 * Manages global product and category state throughout the application including:
 * - Single product details for product pages
 * - Related products for recommendations
 * - All categories for navigation and filtering
 * - Current category data for category pages
 * - Optimized category fetching with promise caching
 * - Error handling and connection diagnostics
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 */
const ProductContext = ({ children }) => {
  /**
   * Product State Variables
   */
  const [singleProduct, setSingleProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({});

  /**
   * Optimized Categories Fetching with Promise Caching
   * 
   * This function implements smart caching to prevent duplicate API calls:
   * 1. Returns cached data if already available in state
   * 2. Returns existing promise if fetch is already in progress
   * 3. Creates new promise and caches it for new requests
   * 4. Includes error handling and connection diagnostics
   * 
   * @returns {Promise<Array>} Promise resolving to categories array
   */
  const fetchCategories = useCallback(async () => {
    // Return cached data if already available
    if (categories.length > 0) {
      return categories;
    }

    // If fetch is already in progress, return the same promise
    if (categoriesPromise) {
      try {
        const result = await categoriesPromise;
        return result;
      } catch (error) {
        categoriesPromise = null; // Reset cache on error
        throw error;
      }
    }

    try {
      // Create and cache the promise to prevent duplicate calls
      categoriesPromise = CategoryService.getAllCategories();
      const result = await categoriesPromise;
      
      if (result.success) {
        setCategories(result.data);
        categoriesPromise = null; // Reset cache after successful completion
        return result.data;
      } else {
        // Run connection diagnostics if API call fails
        await CategoryService.diagnoseConnection();
        categoriesPromise = null; // Reset cache on failure
        return [];
      }
    } catch (error) {
      // Run detailed connection diagnostics on network errors
      try {
        await CategoryService.diagnoseConnection();
      } catch (diagError) {
        // Silently handle diagnosis errors to prevent cascading failures
      }
      
      categoriesPromise = null; // Reset cache on error
      return [];
    }
  }, [categories]);

  /**
   * Initialize categories on component mount
   * Fetches categories when the context provider first loads
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Product Context Provider Value
   * 
   * Provides all product-related state and methods to child components:
   * - singleProduct: Current product being viewed
   * - setSingleProduct: Function to update current product
   * - relatedProducts: Products related to current product
   * - setRelatedProducts: Function to update related products
   * - categories: All available product categories
   * - setCategories: Function to update categories
   * - category: Current category being viewed
   * - setCategory: Function to update current category
   * - fetchCategories: Optimized function to fetch categories
   */
  return (
    <ProductContextProvide.Provider
      value={{
        singleProduct,
        setSingleProduct,
        relatedProducts,
        setRelatedProducts,
        categories,
        setCategories,
        category,
        setCategory,
        fetchCategories,
      }}
    >
      {children}
    </ProductContextProvide.Provider>
  );
};

export { useProduct, ProductContext };
