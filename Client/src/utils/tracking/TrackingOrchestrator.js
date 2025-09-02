// Centralized Tracking Orchestrator
// Coordinates Google Analytics, Google Ads, and Facebook Pixel

import GoogleAnalyticsManager from './GoogleAnalyticsManager';
import GoogleAdsManager from './GoogleAdsManager';
import FacebookPixelManager from './FacebookPixelManager';
import envConfig from '../envConfig';
import logManager from '../logManager';
import { navigationThrottleManager } from '../navigationThrottleManager';

class TrackingOrchestrator {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
    this.lastPageViewTracked = { path: null, timestamp: 0 };
    this.lastProductViews = new Map(); // Use Map for better performance
    this.lastCartActions = new Map(); // Use Map for better performance
    
    // Initialize platform managers
    this.googleAnalytics = new GoogleAnalyticsManager();
    this.googleAds = new GoogleAdsManager();
    this.facebookPixel = new FacebookPixelManager();
  }

  // Initialize all tracking services once
  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    // CRITICAL FIX: Add timeout to prevent hanging
    this.initPromise = Promise.race([
      this._initializeTracking(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout after 15 seconds')), 15000)
      )
    ]).catch(error => {
      logManager.error('tracking-init-timeout', 'Tracking Manager initialization failed/timeout:', error);
      
      // Even if initialization fails, mark as initialized to prevent infinite retries
      this.isInitialized = true;
    });
    
    return this.initPromise;
  }

  async _initializeTracking() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Wait for envConfig to be ready before initializing tracking (with timeout)
      if (envConfig && typeof envConfig.ensureLoaded === 'function') {
        // Add timeout to envConfig loading
        const envConfigPromise = envConfig.ensureLoaded();
        const envConfigTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('EnvConfig loading timeout after 10 seconds')), 10000)
        );
        
        await Promise.race([envConfigPromise, envConfigTimeout]);
      }

      // Initialize all tracking platforms in parallel
      await Promise.allSettled([
        this.googleAnalytics.initialize(),
        this.googleAds.initialize(),
        this.facebookPixel.initialize()
      ]);
      
      this.isInitialized = true;
      
    } catch (error) {
      logManager.error('tracking-init-failed', 'Tracking Manager initialization failed:', error);
    }
  }

  // Track page view - SIMPLIFIED to prevent duplicates
  trackPageView(pageData = {}) {
    const { page_path } = pageData;
    
    try {
      // Strong deduplication - only track if path actually changed
      const currentPath = page_path || window.location.pathname;
      const currentTime = Date.now();
      
      // Skip if exact same page tracked within last 2 seconds
      if (this.lastPageViewTracked && 
          this.lastPageViewTracked.path === currentPath && 
          currentTime - this.lastPageViewTracked.timestamp < 2000) {
        return; // SKIP - prevents duplicate events
      }
      
      // Update tracking record
      this.lastPageViewTracked = {
        path: currentPath,
        timestamp: currentTime
      };
      
      // Use throttling for tracking calls to prevent IPC flooding
      navigationThrottleManager.batchRequest(async () => {
        this.googleAnalytics.trackPageView(pageData);
        this.googleAds.trackPageView(pageData);
        this.facebookPixel.trackPageView();
      }, `pageview:${currentPath}`, 200);
      
    } catch (error) {
    }
  }

  // Track product view with comprehensive logging
  trackViewContent(productData) {
    const { product_id } = productData;
    
    // Create deduplication key
    const recentKey = `view_item_${product_id}`;
    
    // Check if we've tracked this product view recently (within 3 seconds)
    const lastViewTime = this.lastProductViews.get(recentKey);
    if (lastViewTime && Date.now() - lastViewTime < 3000) {
      return; // Skip duplicate
    }
    
    // Store this view to prevent duplicates
    this.lastProductViews.set(recentKey, Date.now());

    // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded (MUST RUN FIRST)
    this._autoFixReadyFlags();
    
    // Track on all platforms
    this.googleAnalytics.trackViewContent(productData);
    this.googleAds.trackViewContent(productData);
    this.facebookPixel.trackViewContent(productData);
  }

  // Track add to cart with comprehensive logging
  trackAddToCart(productData) {
    const { product_id, quantity = 1 } = productData;
    
    try {
      // Create deduplication key
      const recentKey = `add_to_cart_${product_id}_${quantity}`;
      
      // Check if we've tracked this exact add to cart recently (within 2 seconds)
      const lastAddTime = this.lastCartActions.get(recentKey);
      if (lastAddTime && Date.now() - lastAddTime < 2000) {
        return; // Skip duplicate
      }
      
      // Store this action to prevent duplicates
      this.lastCartActions.set(recentKey, Date.now());

      // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded (MUST RUN FIRST)
      this._autoFixReadyFlags();
      
      // Track on all platforms
      this.googleAnalytics.trackAddToCart(productData);
      this.googleAds.trackAddToCart(productData);
      this.facebookPixel.trackAddToCart(productData);
      
    } catch (error) {
      logManager.error('add-to-cart-tracking-failed', 'Add to cart tracking error:', error);
    }
  }

  // Track checkout initiation
  trackInitiateCheckout(checkoutData) {
    // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded (MUST RUN FIRST)
    this._autoFixReadyFlags();
    
    // Track on all platforms
    this.googleAnalytics.trackInitiateCheckout(checkoutData);
    this.googleAds.trackInitiateCheckout(checkoutData);
    this.facebookPixel.trackInitiateCheckout(checkoutData);
  }

  // Track purchase/conversion with comprehensive logging
  trackPurchase(purchaseData) {
    const { transaction_id } = purchaseData;
    
    // Generate fallback transaction ID if not provided
    const finalTransactionId = transaction_id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // CRITICAL: Check if this transaction has already been tracked (with 5-minute timeout)
    const trackedPurchases = sessionStorage.getItem('tracked_purchases') || '{}';
    try {
      const trackedPurchasesObj = JSON.parse(trackedPurchases);
      const now = Date.now();
      
      // Clean up old purchases (older than 5 minutes)
      Object.keys(trackedPurchasesObj).forEach(txnId => {
        if (now - trackedPurchasesObj[txnId].timestamp > 5 * 60 * 1000) {
          delete trackedPurchasesObj[txnId];
        }
      });
      
      if (trackedPurchasesObj[finalTransactionId]) {
        const timeSinceTracked = now - trackedPurchasesObj[finalTransactionId].timestamp;
        
        if (timeSinceTracked < 30000) { // Only block if tracked in last 30 seconds
          return; // CRITICAL: Don't track duplicate purchases
        }
      }
      
      // Mark this transaction as tracked
      const { value, currency, items = [] } = purchaseData;
      trackedPurchasesObj[finalTransactionId] = {
        value,
        currency,
        timestamp: now,
        items: items.length
      };
      sessionStorage.setItem('tracked_purchases', JSON.stringify(trackedPurchasesObj));
      
    } catch (e) {
    }

    // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded (MUST RUN FIRST)
    this._autoFixReadyFlags();
    
    // Update purchase data with final transaction ID
    const finalPurchaseData = { ...purchaseData, transaction_id: finalTransactionId };
    
    // Track on all platforms
    this.googleAnalytics.trackPurchase(finalPurchaseData);
    this.googleAds.trackPurchase(finalPurchaseData);
    this.facebookPixel.trackPurchase(finalPurchaseData);
  }

  // Track Add to Wishlist event
  trackAddToWishlist(productData) {

    // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded (MUST RUN FIRST)
    this._autoFixReadyFlags();

    // Tracking status summary (will show fixed flags)
    
    // Track on all platforms
    this.googleAnalytics.trackAddToWishlist(productData);
    this.googleAds.trackAddToWishlist(productData);
    this.facebookPixel.trackAddToWishlist(productData);
    
  }

  // Track Search event
  trackSearch(searchData) {

    // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded (MUST RUN FIRST)
    this._autoFixReadyFlags();

    // Tracking status summary (will show fixed flags)
    
    // Track on all platforms
    this.googleAnalytics.trackSearch(searchData);
    this.googleAds.trackSearch(searchData);
    this.facebookPixel.trackSearch(searchData);
    
  }

  // Track custom events
  trackCustomEvent(eventName, parameters = {}) {
    // Add default category if not provided
    const enhancedParameters = {
      event_category: parameters.event_category || 'custom',
      ...parameters
    };
    
    // Track on all platforms
    this.googleAnalytics.trackCustomEvent(eventName, enhancedParameters);
    this.googleAds.trackCustomEvent(eventName, enhancedParameters);
    this.facebookPixel.trackCustomEvent(eventName, enhancedParameters);
  }

  // Utility method to check if tracking is ready
  isReady() {
    return this.isInitialized && (
      this.googleAnalytics.isReady() || 
      this.googleAds.isReady() || 
      this.facebookPixel.isReady()
    );
  }

  // Enhanced ready check that waits for initialization
  async ensureReady() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isReady();
  }

  // Get tracking status
  getStatus() {
    return {
      initialized: this.isInitialized,
      googleAnalytics: this.googleAnalytics.isReady(),
      googleAds: this.googleAds.isReady(),
      facebookPixel: this.facebookPixel.isReady()
    };
  }

  // CRITICAL FIX: Auto-detect and fix ready flags if scripts are loaded but flags are wrong
  _autoFixReadyFlags() {
    let fixesApplied = false;
    
    // Fix platform managers
    if (this.googleAnalytics.autoFix()) fixesApplied = true;
    if (this.googleAds.autoFix()) fixesApplied = true;
    if (this.facebookPixel.autoFix()) fixesApplied = true;
    
    // Mark as initialized if scripts are working but not marked as initialized
    if (this.isReady() && !this.isInitialized) {
      this.isInitialized = true;
      fixesApplied = true;
    }
    
    if (fixesApplied) {
    }
  }
}

export default TrackingOrchestrator;
