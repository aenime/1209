/**
 * Navigation Throttle Protection Utility
 * 
 * Prevents Facebook Pixel (fbevents.js) and other tracking scripts from causing
 * "Throttling navigation to prevent browser hanging" errors.
 * 
 * Root causes:
 * 1. Facebook Pixel using aggressive 100ms setInterval checks
 * 2. Multiple rapid navigation events triggering tracking calls
 * 3. IPC flooding between browser processes
 * 
 * Solution: Debounce navigation events and limit tracking calls
 */

class NavigationThrottleProtection {
  constructor() {
    this.lastNavigationTime = 0;
    this.navigationQueue = [];
    this.isProcessing = false;
    this.throttleDelay = 300; // 300ms delay between navigations
    this.maxTrackingCallsPerSecond = 5;
    this.trackingCallTimestamps = [];
    
    this.init();
  }

  init() {
    // Override Facebook Pixel functions to add throttling
    this.protectFacebookPixel();
    
    // Monitor navigation events
    this.monitorNavigationEvents();
    
    // Clean up old tracking call timestamps periodically
    setInterval(() => {
      const oneSecondAgo = Date.now() - 1000;
      this.trackingCallTimestamps = this.trackingCallTimestamps.filter(
        timestamp => timestamp > oneSecondAgo
      );
    }, 1000);
  }

  protectFacebookPixel() {
    // Wait for Facebook Pixel to load
    const checkForFbq = () => {
      if (typeof window.fbq === 'function') {
        this.wrapFacebookPixelMethods();
      } else {
        // Check again in 500ms (less aggressive than the original 100ms)
        setTimeout(checkForFbq, 500);
      }
    };
    
    checkForFbq();
  }

  wrapFacebookPixelMethods() {
    const originalFbq = window.fbq;
    const self = this;
    
    window.fbq = function(...args) {
      // Check if we're exceeding tracking call limits
      if (self.shouldThrottleTrackingCall()) {
        console.warn('Facebook Pixel call throttled to prevent IPC flooding');
        return;
      }
      
      // Record this tracking call
      self.trackingCallTimestamps.push(Date.now());
      
      // Call original Facebook Pixel function
      try {
        return originalFbq.apply(this, args);
      } catch (error) {
        console.warn('Facebook Pixel error (suppressed):', error.message);
      }
    };
    
    // Preserve original properties
    Object.keys(originalFbq).forEach(key => {
      window.fbq[key] = originalFbq[key];
    });
  }

  shouldThrottleTrackingCall() {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Count calls in the last second
    const recentCalls = this.trackingCallTimestamps.filter(
      timestamp => timestamp > oneSecondAgo
    ).length;
    
    return recentCalls >= this.maxTrackingCallsPerSecond;
  }

  monitorNavigationEvents() {
    // Override History API methods
    this.wrapHistoryMethod('pushState');
    this.wrapHistoryMethod('replaceState');
    
    // Monitor popstate events
    const originalPopstateHandler = window.onpopstate;
    window.onpopstate = (event) => {
      this.throttleNavigation(() => {
        if (originalPopstateHandler) {
          originalPopstateHandler.call(window, event);
        }
      });
    };
  }

  wrapHistoryMethod(methodName) {
    const originalMethod = window.history[methodName];
    const self = this;
    
    window.history[methodName] = function(...args) {
      self.throttleNavigation(() => {
        originalMethod.apply(this, args);
      });
    };
  }

  throttleNavigation(callback) {
    const now = Date.now();
    
    if (now - this.lastNavigationTime < this.throttleDelay) {
      // Queue the navigation
      this.navigationQueue.push(callback);
      this.processNavigationQueue();
      return;
    }
    
    this.lastNavigationTime = now;
    callback();
  }

  processNavigationQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    setTimeout(() => {
      if (this.navigationQueue.length > 0) {
        const nextNavigation = this.navigationQueue.shift();
        this.lastNavigationTime = Date.now();
        nextNavigation();
      }
      
      this.isProcessing = false;
      
      // Process next item if queue still has items
      if (this.navigationQueue.length > 0) {
        this.processNavigationQueue();
      }
    }, this.throttleDelay);
  }

  // Method to disable Facebook Pixel detection interval
  static disableAggressivePixelDetection() {
    // Override setInterval to catch Facebook Pixel's aggressive polling
    const originalSetInterval = window.setInterval;
    
    window.setInterval = function(callback, delay, ...args) {
      // If delay is 100ms or less and it looks like tracking detection
      if (delay <= 100 && (
        callback.toString().includes('fbq') ||
        callback.toString().includes('detectAndConfigureFB') ||
        callback.toString().includes('facebook') ||
        callback.toString().includes('pixel')
      )) {
        // Increase the interval to 500ms to reduce IPC load
        console.log('Facebook Pixel detection interval throttled from', delay, 'ms to 500ms');
        delay = 500;
      }
      
      return originalSetInterval.call(this, callback, delay, ...args);
    };
  }

  // Method to create debounced authentication check
  static createDebouncedAuthCheck(originalCheckFn, delay = 1000) {
    let timeoutId;
    
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalCheckFn.apply(this, args);
      }, delay);
    };
  }

  // Static method to apply all protections
  static apply() {
    // Apply aggressive pixel detection protection immediately
    NavigationThrottleProtection.disableAggressivePixelDetection();
    
    // Create the main protection instance
    return new NavigationThrottleProtection();
  }
}

export default NavigationThrottleProtection;
