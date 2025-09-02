/**
 * Price Helper Utility for E-Commerce Application
 * 
 * This module handles price calculations and tracking for the e-commerce platform.
 * It provides utilities for:
 * - Determining appropriate prices for analytics tracking
 * - Managing payment amounts
 * - Cleaning invalid price data from localStorage
 * - Handling different pricing scenarios (offers, discounts, MRP)
 * 
 * The price helper integrates with the price configuration manager to
 * respect environment-specific pricing rules and tracking preferences.
 */

import priceConfigManager from './priceConfigManager';

/**
 * Get the appropriate price for analytics tracking
 * 
 * Determines which price should be used for tracking purposes based on
 * environment configuration. This can be either the current offer price
 * or the original MRP depending on business requirements.
 * 
 * @param {Object} product - Product object containing price information
 * @param {number} product.price - Current/offer price (discounted)
 * @param {number} product.salePrice - Sale/offer price (discounted)
 * @param {number} product.originalPrice - Original price (before discount)
 * @param {number} product.mrp - Maximum Retail Price (before discount)
 * @param {number} product.regularPrice - Regular price (before discount)
 * @returns {number} Price value to use for tracking purposes
 */
export const getTrackingPrice = (product) => {
  return priceConfigManager.getProductPrice(product);
};

/**
 * Get cart total for analytics tracking
 * 
 * Calculates the appropriate total price for tracking based on environment
 * configuration. This ensures consistent tracking whether using offer prices
 * or original prices for analytics purposes.
 * 
 * @param {number} totalPrice - Current total (with discounts applied)
 * @param {number} totalMRP - Original total (without discounts)
 * @param {Array} products - Array of products for fallback calculation
 * @returns {number} Total price value to use for tracking
 */
export const getTrackingTotal = (totalPrice, totalMRP, products = []) => {
  // Validate and sanitize input values
  const validTotalPrice = typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0;
  const validTotalMRP = typeof totalMRP === 'number' && !isNaN(totalMRP) ? totalMRP : 0;
  
  return priceConfigManager.getTrackingTotal(validTotalPrice, validTotalMRP, products);
};

/**
 * Clean Invalid Price Data from localStorage
 * 
 * Scans localStorage for NaN (Not a Number) values in price-related keys
 * and removes them to prevent calculation errors. This is essential for
 * maintaining data integrity across browser sessions.
 * 
 * @param {Array} keys - Array of localStorage keys to check and clean
 * @returns {Object} Report object containing cleaned and valid keys
 */
export const cleanNaNAmounts = (keys = ['totalPrice', 'cartTotalPrice']) => {
  const report = { cleaned: [], valid: [] };
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    
    // Process only if value exists in localStorage
    if (value !== null && value !== undefined) {
      const numValue = parseFloat(value);
      
      // Remove if value is NaN or invalid
      if (isNaN(numValue)) {
        localStorage.removeItem(key);
        report.cleaned.push(key);
      } else {
        report.valid.push(key);
      }
    }
  });
  
  return report;
};

/**
 * Get price configuration info for debugging
 * @returns {Object} - Configuration details
 */
export const getPriceConfig = () => {
  return priceConfigManager.getConfigInfo();
};

/**
 * Set payment amount in localStorage and context
 * IMPORTANT: Payment amount should ALWAYS be the discounted price (totalPrice),
 * regardless of what price is being used for tracking
 * @param {number} amount - The payment amount to set
 * @param {string} source - Source of the amount (for logging)
 */
export const setPaymentAmount = (amount, source = 'unknown') => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return false;
  }
  
  try {
    // Only clear conflicting keys if this is a checkout flow, not from AuthContext cart save
    if (source !== 'auth-context-cart-save') {
      const conflictingKeys = ['cartTotalPrice', 'totalPrice'];
      conflictingKeys.forEach(key => {
        const existingValue = localStorage.getItem(key);
        if (existingValue) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Make sure we don't have any inadvertent double-counting of extra discounts
    // Check if we're in the cart-checkout flow and ensure we're using the correct price
    if (source === 'cart-checkout' && window.cartAmounts) {
      // Always use totalPrice for payment - never include totalExtraDiscount again
      const correctAmount = window.cartAmounts.totalPrice || amount;
      
      localStorage.setItem("paymentAmount", correctAmount.toString());
      return true;
    }
    
    // Only set paymentAmount - don't create conflicting keys
    localStorage.setItem("paymentAmount", amount.toString());
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get payment amount from all possible sources with priority order
 * @param {number} contextAmount - Amount from React context
 * @param {Array} selectedProducts - Selected products for fallback calculation
 * @param {boolean} debug - Whether to log debug information
 * @returns {number} - Valid payment amount or 0 if none found
 */
export const getPaymentAmount = (contextAmount = 0, selectedProducts = [], debug = false) => {
  // Cache for calculated product amounts to avoid recalculation
  const cachedProductAmount = getPaymentAmount.cachedProductAmount;
  
  // Get amounts from all possible sources
  // Critical: paymentAmount is the primary source and used for redirection logic
  const savedPaymentAmount = parseFloat(localStorage.getItem("paymentAmount") || 0);
  const localStorageAmount = parseFloat(localStorage.getItem("cartTotalPrice") || 0);
  const validContextAmount = typeof contextAmount === 'number' && !isNaN(contextAmount) ? contextAmount : 0;
  
  // Priority order: paymentAmount > contextAmount > cartTotalPrice > calculated from products
  if (savedPaymentAmount > 0) {
    return savedPaymentAmount;
  }
  
  if (validContextAmount > 0) {
    return validContextAmount;
  }
  
  if (localStorageAmount > 0) {
    return localStorageAmount;
  }
  
  // Check if we have a cached calculation for these products
  if (selectedProducts && 
      selectedProducts.length > 0 && 
      cachedProductAmount && 
      cachedProductAmount.hash === JSON.stringify(selectedProducts) &&
      cachedProductAmount.value > 0) {
    return cachedProductAmount.value;
  }
  
  // Fallback: calculate from products
  if (selectedProducts && selectedProducts.length > 0) {
    const calculatedAmount = selectedProducts.reduce((total, product) => {
      const price = product?.discount || product?.price || 0;
      const quantity = product?.quantity || 1;
      const itemTotal = price * quantity;
      return total + itemTotal;
    }, 0);
    
    if (calculatedAmount > 0) {
      // Save calculation to cache
      getPaymentAmount.cachedProductAmount = {
        hash: JSON.stringify(selectedProducts),
        value: calculatedAmount,
        timestamp: Date.now()
      };
      
      return calculatedAmount;
    }
  }
  
  return 0;
};

// Initialize the cache
getPaymentAmount.cachedProductAmount = null;

const priceHelper = {
  getTrackingPrice,
  getTrackingTotal,
  getPriceConfig,
  cleanNaNAmounts,
  setPaymentAmount,
  getPaymentAmount
};

export default priceHelper;
