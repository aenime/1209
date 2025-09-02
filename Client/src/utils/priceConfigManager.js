/**
 * Price Configuration Manager
 * 
 * A centralized utility to handle price types across the application:
 * - Provides consistent price handling for analytics and storage
 * - Always uses MRP/original prices for tracking
 */

import envConfig from './envConfig';

/**
 * Price Configuration Manager
 */
class PriceConfigManager {
  /**
   * Get the current configuration dynamically (not cached)
   * @returns {Object} Current configuration state
   */
  _getCurrentConfig() {
    const configValue = envConfig.get('REACT_APP_TRACKING_USE_OFFER_PRICE') || 'no';
    const useOfferPrice = configValue.toLowerCase() === 'yes';
    const priceUsageType = useOfferPrice ? 'Discounted/Offer Price' : 'Original/MRP Price';
    
    return {
      useOfferPrice,
      configValue: configValue.toLowerCase(),
      priceUsageType
    };
  }

  /**
   * Get which type of price is being used for tracking
   * @returns {string} Description of price type being used
   */
  getPriceUsageType() {
    const config = this._getCurrentConfig();
    return config.priceUsageType;
  }

  /**
   * Get configuration info for debugging
   * @returns {Object} Configuration details
   */
  getConfigInfo() {
    const config = this._getCurrentConfig();
    return {
      useOfferPrice: config.useOfferPrice,
      configValue: config.configValue,
      priceType: config.priceUsageType,
      priorityOrder: config.useOfferPrice 
        ? ['price', 'salePrice', 'discount', 'originalPrice', 'mrp', 'regularPrice']
        : ['originalPrice', 'mrp', 'regularPrice', 'price', 'salePrice', 'discount']
    };
  }

  /**
   * Get the appropriate price for a product based on configuration
   * @param {Object} product - Product object containing price information
   * @returns {number} The price value to use
   */
  getProductPrice(product) {
    if (!product) return 0;
    
    const config = this._getCurrentConfig();
    
    // Use the appropriate price based on current configuration
    if (config.useOfferPrice) {
      // Use discounted/offer price
      return parseFloat(
        product.price || 
        product.salePrice || 
        product.discount || 
        product.originalPrice || 
        product.mrp || 
        product.regularPrice || 
        0
      );
    } else {
      // Use original/non-discounted price
      return parseFloat(
        product.originalPrice || 
        product.mrp || 
        product.regularPrice || 
        product.price || 
        product.salePrice || 
        product.discount ||
        0
      );
    }
  }

  /**
   * Get tracking price for cart items based on configuration
   * @param {number} totalPrice - Current total with discounts
   * @param {number} totalMRP - Original total without discounts
   * @param {Array} products - Optional array of products to calculate from
   * @returns {number} Total price to use for tracking
   */
  getTrackingTotal(totalPrice, totalMRP, products = []) {
    // Ensure we have valid numbers
    const validTotalPrice = parseFloat(totalPrice || 0);
    const validTotalMRP = parseFloat(totalMRP || 0);
    
    // IMPORTANT: Check session storage first for consistent tracking values
    const trackedTransactions = sessionStorage.getItem('tracked_purchases') || '{}';
    try {
      const trackedTransactionsObj = JSON.parse(trackedTransactions);
      const orderId = localStorage.getItem("orderId");
      
      // If we've already tracked a value for this transaction, use that value consistently
      if (orderId && trackedTransactionsObj[orderId]) {
        const previousValue = trackedTransactionsObj[orderId].value;
        
        return previousValue;
      }
    } catch (e) {
      
    }
    
    // Get current configuration dynamically
    const config = this._getCurrentConfig();
    
    // Log tracking price calculation for debugging
    
    if (config.useOfferPrice) {
      // Use discounted total (actual amount paid)
      return validTotalPrice;
    } else {
      // Use MRP for tracking (not the discounted prices)
      if (validTotalMRP > 0) {
        return validTotalMRP;
      }
      
      // If no MRP available, calculate original total from products
      if (products && products.length > 0) {
        const calculatedTotal = products.reduce((sum, product) => {
          // Use original price, not discounted price for tracking
          const originalPrice = parseFloat(product.originalPrice || product.mrp || product.price || 0);
          return sum + originalPrice * (product.quantity || 1);
        }, 0);
        if (calculatedTotal > 0) {
          return calculatedTotal;
        }
      }
      
      // Fallback: use payment amount (but log this as a warning since it contradicts config)
      if (validTotalPrice > 0) {
        return validTotalPrice;
      }
      
      // Absolute fallback
      return 0;
    }
  }

  /**
   * Prepare product data for tracking events
   * @param {Object} product - Product data
   * @returns {Object} Tracking-ready product data
   */
  prepareProductForTracking(product) {
    if (!product) return {};
    
    const price = this.getProductPrice(product);
    const config = this._getCurrentConfig();
    
    return {
      name: product.name,
      id: product._id,
      price: price,
      price_type: config.priceUsageType,
      config: config.configValue
    };
  }

  /**
   * Prepare cart data for tracking events
   * @param {Array} products - Cart products
   * @param {number} totalPrice - Cart total with discounts
   * @param {number} totalMRP - Cart total without discounts
   * @returns {Object} Tracking-ready cart data
   */
  prepareCartForTracking(products, totalPrice, totalMRP) {
    // Deduplication key to prevent multiple identical tracking events
    const trackingKey = `cart-${Date.now()}`;
    const trackingValue = this.getTrackingTotal(totalPrice, totalMRP, products);
    const config = this._getCurrentConfig();
    
    // Add event ID for deduplication
    const result = {
      items: products?.length || 0,
      value: trackingValue,
      price_type: config.priceUsageType,
      config: config.configValue,
      event_id: trackingKey,
      source: {
        totalPrice,
        totalMRP,
        productsCount: products?.length || 0
      }
    };
    
    return result;
  }
  
  /**
   * Debug function to log current configuration state (development only)
   */
  debugConfiguration() {
    if (process.env.NODE_ENV !== 'development') return;
    
    const config = this._getCurrentConfig();
    
    return config;
  }
}

// Create singleton instance
const priceConfigManager = new PriceConfigManager();

// Add debug method to global window object for console testing (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.debugPriceConfig = () => priceConfigManager.debugConfiguration();
  window.priceConfigManager = priceConfigManager;
  window.envConfig = envConfig;
  
  // Only show instructions once per session
  if (!sessionStorage.getItem('priceConfigDebugShown')) {
    sessionStorage.setItem('priceConfigDebugShown', 'true');
  }
}

export default priceConfigManager;
