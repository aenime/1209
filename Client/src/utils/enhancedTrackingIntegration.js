// Integration Guide for Enhanced Analytics
// How to add the comprehensive logging to your existing trackingManager

import trackingManager from './trackingManager';
import analyticsLogger from './analyticsLogger';
import { shouldTrackOfferPrice } from './envConfig';
import { getOfferEligibilityCacheStatus } from '../hooks/useOfferEligibilityOptimized';
import { diagnoseTrackingIssues, testEventFiring, startEventMonitoring } from './trackingDiagnostics';

/**
 * Enhanced Tracking Wrapper Functions
 * These wrap the existing trackingManager methods with comprehensive logging
 */

// Helper function to ensure tracking is initialized before events
const ensureTrackingInitialized = async () => {
  if (!trackingManager.isInitialized) {
    try {
      await trackingManager.initialize();
    } catch (error) {
      
      throw error;
    }
  }
  
  // Double-check status and wait for readiness
  const status = trackingManager.getStatus();
  
  // CRITICAL: Wait for scripts to be ready before proceeding
  if (!status.googleAnalytics || !status.facebookPixel) {
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20; // Reduced from 50 to 20 (2 seconds at 100ms intervals)
      
      const checkTracking = () => {
        const currentStatus = trackingManager.getStatus();
        
        attempts++;
        
        // Check if both GA and FB are ready
        if (currentStatus.googleAnalytics && currentStatus.facebookPixel) {
          resolve(currentStatus);
        } else if (attempts >= maxAttempts) {
          
          resolve(currentStatus);
        } else {
          // THROTTLE FIX: Increased from 100ms to 200ms to reduce IPC load
          setTimeout(checkTracking, 200);
        }
      };
      
      checkTracking();
    });
  }
  
  return status;
};

// Enhanced Purchase Tracking
export const trackPurchaseEnhanced = async (purchaseData) => {
  // CRITICAL: Ensure tracking is initialized before firing events
  await ensureTrackingInitialized();
  
  // Log the event with detailed analysis using our analytics logger
  const eventId = analyticsLogger.logPurchaseEvent(purchaseData, trackingManager);
  
  // Call the original tracking manager method
  trackingManager.trackPurchase(purchaseData);
  
  return eventId;
};

// Enhanced Add to Cart Tracking
export const trackAddToCartEnhanced = async (productData) => {
  // CRITICAL: Ensure tracking is initialized before firing events
  await ensureTrackingInitialized();
  
  // Log the event with detailed analysis
  const eventId = analyticsLogger.logAddToCartEvent(productData, trackingManager);
  
  // Call the original tracking manager method
  trackingManager.trackAddToCart(productData);
  
  return eventId;
};

// Enhanced Begin Checkout Tracking
export const trackBeginCheckoutEnhanced = async (checkoutData) => {
  // CRITICAL: Ensure tracking is initialized before firing events
  await ensureTrackingInitialized();
  
  // Log the event with detailed analysis
  const eventId = analyticsLogger.logBeginCheckoutEvent(checkoutData, trackingManager);
  
  // Call the original tracking manager method
  trackingManager.trackInitiateCheckout(checkoutData);
  
  return eventId;
};

// Enhanced View Content Tracking
export const trackViewContentEnhanced = async (productData) => {
  // CRITICAL: Ensure tracking is initialized before firing events
  await ensureTrackingInitialized();
  
  // Log the event with detailed analysis
  const eventId = analyticsLogger.logViewContentEvent(productData, trackingManager);
  
  // Call the original tracking manager method
  trackingManager.trackViewContent(productData);
  
  return eventId;
};

// Enhanced Page View Tracking
export const trackPageViewEnhanced = async (pageData) => {
  // Enhanced page view tracking logging removed for cleaner console output
  
  // CRITICAL: Ensure tracking is initialized before firing events
  await ensureTrackingInitialized();
  
  // Call the original tracking manager method
  trackingManager.trackPageView(pageData);
  
  // Enhanced page view tracking completion logging removed
};

/**
 * Quick Setup Functions (ASYNC SAFE)
 * Call these in your components instead of trackingManager directly
 * All functions are async and auto-initialize tracking before firing events
 */

// Replace trackingManager.trackPurchase with this
export const logPurchase = async (...args) => await trackPurchaseEnhanced(...args);

// Replace trackingManager.trackAddToCart with this
export const logAddToCart = async (...args) => await trackAddToCartEnhanced(...args);

// Replace trackingManager.trackInitiateCheckout with this
export const logBeginCheckout = async (...args) => await trackBeginCheckoutEnhanced(...args);

// Replace trackingManager.trackViewContent with this
export const logViewContent = async (...args) => await trackViewContentEnhanced(...args);

// Replace trackingManager.trackPageView with this
export const logPageView = async (...args) => await trackPageViewEnhanced(...args);

/**
 * Testing and Debugging Functions
 */

// Test all enhanced tracking
export const testEnhancedTracking = async () => {
  
  // Test each tracking method
  trackViewContentEnhanced({
    product_id: 'test_view_123',
    product_name: 'Test View Product',
    category: 'Test Category',
    value: 99.99
  });
  
  setTimeout(() => {
    trackAddToCartEnhanced({
      product_id: 'test_cart_123',
      product_name: 'Test Cart Product',
      category: 'Test Category',
      value: 99.99,
      quantity: 1
    });
  }, 1000);
  
  setTimeout(() => {
    trackBeginCheckoutEnhanced({
      value: 199.98,
      currency: 'INR',
      items: [{
        item_id: 'test_checkout_1',
        item_name: 'Test Checkout Product',
        category: 'Test Category',
        quantity: 1,
        price: 99.99
      }]
    });
  }, 2000);
  
  setTimeout(() => {
    trackPurchaseEnhanced({
      transaction_id: `test_purchase_${Date.now()}`,
      value: 199.98,
      currency: 'INR',
      items: [{
        item_id: 'test_purchase_1',
        item_name: 'Test Purchase Product',
        category: 'Test Category',
        quantity: 1,
        price: 99.99
      }]
    });
    
    // Show session summary after all tests
    setTimeout(() => {
      analyticsLogger.getSessionSummary();
    }, 1000);
  }, 3000);
};

// Check current tracking status
export const checkTrackingStatus = () => {
  const status = analyticsLogger.checkTrackingReadiness();
  const managerStatus = trackingManager.getStatus();
  const useOfferPrice = shouldTrackOfferPrice();
  const offerCacheStatus = getOfferEligibilityCacheStatus();
  
  if (offerCacheStatus.result) {
  }
  
  return { 
    status, 
    managerStatus, 
    priceTracking: { useOfferPrice, mode: useOfferPrice ? 'offer' : 'regular' },
    offerCache: offerCacheStatus
  };
};

// Comprehensive troubleshooting function
export const troubleshootTracking = () => {
  
  // Step 1: Run diagnostics
  const diagnosticReport = diagnoseTrackingIssues();
  
  // Step 2: Test event firing
  const eventTest = testEventFiring();
  
  // Step 3: Check tracking manager status
  const trackingStatus = checkTrackingStatus();
  
  // Step 4: Analyze results and provide solutions
  
  const solutions = [];
  
  // Check critical issues from diagnostics
  if (diagnosticReport.issues.length > 0) {
    diagnosticReport.issues.forEach(issue => {
      
      // Provide specific solutions
      if (issue.includes('Google Analytics 4 ID is invalid')) {
        solutions.push('🔧 Solution: Configure valid Google Analytics 4 ID in environment settings');
      }
      if (issue.includes('Google Ads ID is invalid')) {
        solutions.push('🔧 Solution: Configure valid Google Ads ID in environment settings');
      }
      if (issue.includes('Facebook Pixel ID is invalid')) {
        solutions.push('🔧 Solution: Configure valid Facebook Pixel ID in environment settings');
      }
      if (issue.includes('tracking script is not loaded')) {
        solutions.push('🔧 Solution: Ensure tracking manager is initialized before firing events');
      }
      if (issue.includes('function is not available')) {
        solutions.push('🔧 Solution: Wait for scripts to load completely before tracking events');
      }
    });
  }
  
  // Check tracking manager readiness
  if (!trackingStatus.managerStatus.isInitialized) {
    solutions.push('🔧 Solution: Call trackingManager.initialize() before firing events');
  }
  
  if (!trackingStatus.managerStatus.gaReady) {
    solutions.push('🔧 Solution: Wait for Google Analytics to initialize (check configuration IDs)');
  }
  
  if (!trackingStatus.managerStatus.fbPixelReady) {
    solutions.push('🔧 Solution: Wait for Facebook Pixel to initialize (check Pixel ID)');
  }
  
  // Check event test results
  if (!eventTest.googleAnalytics && !eventTest.facebookPixel) {
    solutions.push('🔧 Solution: Both Google and Facebook tracking failed - check internet connection and ad blockers');
  }
  
  // Provide actionable solutions
  if (solutions.length > 0) {
  } else {
  }
  
  // Provide quick fix commands
  
  
  return {
    diagnostics: diagnosticReport,
    eventTest,
    trackingStatus,
    solutions,
    hasIssues: diagnosticReport.issues.length > 0 || eventTest.errors.length > 0
  };
};

// Global access for debugging
if (typeof window !== 'undefined') {
  // Enhanced tracking functions
  window.logPurchase = logPurchase;
  window.logAddToCart = logAddToCart;
  window.logBeginCheckout = logBeginCheckout;
  window.logViewContent = logViewContent;
  window.logPageView = logPageView;
  
  // Testing functions
  window.testEnhancedTracking = testEnhancedTracking;
  window.checkTrackingStatus = checkTrackingStatus;
  window.troubleshootTracking = troubleshootTracking;
  
  // Diagnostic functions for troubleshooting
  window.diagnoseTrackingIssues = diagnoseTrackingIssues;
  window.testEventFiring = testEventFiring;
  window.startEventMonitoring = startEventMonitoring;
  
  // Price tracking debugging functions
  window.checkPriceTracking = () => {
    const useOfferPrice = shouldTrackOfferPrice();
    const offerCacheStatus = getOfferEligibilityCacheStatus();
    
    if (offerCacheStatus.result) {
    }
    return { useOfferPrice, mode: useOfferPrice ? 'offer' : 'regular', cache: offerCacheStatus };
  };
  
  window.simulatePriceToggle = (useSalePrice = true) => {
    
    // Test purchase with different price scenarios
    const testData = {
      transaction_id: `price_test_${Date.now()}`,
      value: useSalePrice ? 799.99 : 999.99, // Simulate offer vs regular price
      currency: 'INR',
      items: [{
        item_id: 'price_test_product',
        item_name: `Test Product (${useSalePrice ? 'Sale Price' : 'Regular Price'})`,
        category: 'Test Category',
        quantity: 1,
        price: useSalePrice ? 799.99 : 999.99
      }]
    };
    
    trackPurchaseEnhanced(testData);
  };
  
  // Quick test individual events
  window.quickTestPurchase = () => trackPurchaseEnhanced({
    transaction_id: `quick_test_${Date.now()}`,
    value: 99.99,
    currency: 'INR',
    items: [{ item_id: 'test', item_name: 'Test Product', category: 'Test', quantity: 1, price: 99.99 }]
  });
  
  window.quickTestAddToCart = () => trackAddToCartEnhanced({
    product_id: 'quick_test_cart',
    product_name: 'Quick Test Product',
    category: 'Test',
    value: 99.99,
    quantity: 1
  });
}

const enhancedTracking = {
  logPurchase,
  logAddToCart,
  logBeginCheckout,
  logViewContent,
  logPageView,
  testEnhancedTracking,
  checkTrackingStatus,
  troubleshootTracking,
  analyticsLogger,
  trackingManager
};

export default enhancedTracking;
