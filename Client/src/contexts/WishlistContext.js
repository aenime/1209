/**
 * React hooks and context imports
 */
import { createContext, useContext, useState, useEffect } from "react";

/**
 * Storage service for data persistence
 */
import storageService from '../services/storageService';

/**
 * Wishlist Context for global wishlist state management
 */
const WishlistContextProvide = createContext();

/**
 * Custom hook to access wishlist context
 * @returns {Object} Wishlist context value with all wishlist methods and state
 */
const useWishlist = () => useContext(WishlistContextProvide);

/**
 * Wishlist Context Provider Component
 * 
 * Manages global wishlist state throughout the application including:
 * - Adding and removing products from wishlist
 * - Persisting wishlist data in localStorage
 * - Providing wishlist state to all child components
 * - Toggle functionality for wishlist items
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 */
const WishlistContext = ({ children }) => {
  /**
   * Wishlist State
   * 
   * Initialized from localStorage using storageService to restore
   * user's wishlist across browser sessions
   */
  const [whiteListProducts, setWhiteListProducts] = useState(() => storageService.getWishlist());

  /**
   * Toggle Product in Wishlist
   * 
   * Adds product to wishlist if not present, removes if already in wishlist.
   * Provides a simple toggle mechanism for wishlist functionality throughout the app.
   * 
   * @param {Object} item - Product object to add/remove from wishlist
   * @param {string} item._id - Unique product identifier
   */
  const handleSetWhiteListProducts = (item) => {
    if (whiteListProducts?.find((o) => o._id === item._id)) {
      // Remove product from wishlist if already present
      const selectedItem = whiteListProducts.filter((o) => o._id !== item._id);
      setWhiteListProducts(selectedItem);
    } else {
      // Add product to wishlist if not present
      setWhiteListProducts((prevState) => [...prevState, item]);
    }
  };

  /**
   * Persist Wishlist Data
   * 
   * Automatically saves wishlist to localStorage whenever the wishlist changes.
   * This ensures user's wishlist is preserved across browser sessions.
   */
  useEffect(() => {
    storageService.setWishlist(whiteListProducts);
  }, [whiteListProducts]);

  /**
   * Wishlist Context Provider Value
   * 
   * Provides wishlist-related state and methods to child components:
   * - whiteListProducts: Array of products in user's wishlist
   * - setWhiteListProducts: Function to directly update wishlist
   * - handleSetWhiteListProducts: Function to toggle products in wishlist
   */
  return (
    <WishlistContextProvide.Provider
      value={{
        whiteListProducts,
        setWhiteListProducts,
        handleSetWhiteListProducts,
      }}
    >
      {children}
    </WishlistContextProvide.Provider>
  );
};

export { useWishlist, WishlistContext };
