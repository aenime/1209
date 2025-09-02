/**
 * Navigation Throttle Manager
 * 
 * Prevents excessive navigation requests that can cause browser throttling
 * and IPC flooding protection to trigger. Implements intelligent request
 * batching and rate limiting.
 */

class NavigationThrottleManager {
  constructor() {
    this.requests = new Map();
    this.lastRequestTime = 0;
    this.minInterval = 250; // Minimum 250ms between requests
    this.maxConcurrentRequests = 5;
    this.activeRequests = 0;
    this.requestQueue = [];
    this.suppressedErrors = new Set();
  }

  /**
   * Throttle navigation requests to prevent IPC flooding
   */
  throttleRequest(requestFn, key = 'default') {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Check if we need to throttle this request
      if (timeSinceLastRequest < this.minInterval || this.activeRequests >= this.maxConcurrentRequests) {
        // Queue the request
        this.requestQueue.push({
          requestFn,
          key,
          resolve,
          reject,
          timestamp: now
        });
        
        // Process queue after delay
        setTimeout(() => this.processQueue(), this.minInterval);
        return;
      }

      // Execute request immediately
      this.executeRequest(requestFn, key, resolve, reject);
    });
  }

  /**
   * Execute a throttled request
   */
  async executeRequest(requestFn, key, resolve, reject) {
    this.activeRequests++;
    this.lastRequestTime = Date.now();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      // Suppress common tracking errors that don't affect functionality
      if (this.shouldSuppressError(error)) {
        console.warn('🔇 Suppressed tracking error:', error.message);
        resolve(null);
      } else {
        reject(error);
      }
    } finally {
      this.activeRequests--;
      
      // Process next request in queue
      setTimeout(() => this.processQueue(), 50);
    }
  }

  /**
   * Process the request queue
   */
  processQueue() {
    if (this.requestQueue.length === 0 || this.activeRequests >= this.maxConcurrentRequests) {
      return;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest >= this.minInterval) {
      const request = this.requestQueue.shift();
      if (request) {
        this.executeRequest(request.requestFn, request.key, request.resolve, request.reject);
      }
    } else {
      // Schedule next processing attempt
      setTimeout(() => this.processQueue(), this.minInterval - timeSinceLastRequest);
    }
  }

  /**
   * Check if an error should be suppressed
   */
  shouldSuppressError(error) {
    const suppressibleErrors = [
      'Failed to fetch',
      'Network request failed',
      'ERR_BLOCKED_BY_CLIENT',
      'ERR_NETWORK_CHANGED',
      'ERR_INTERNET_DISCONNECTED',
      'AbortError',
      'TimeoutError',
      'google-analytics.com',
      'googleads.com',
      'facebook.net',
      'doubleclick.net'
    ];

    const errorMessage = error.message || error.toString();
    return suppressibleErrors.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Batch similar requests to reduce load
   */
  batchRequest(requestFn, batchKey, delay = 100) {
    if (this.requests.has(batchKey)) {
      clearTimeout(this.requests.get(batchKey).timeoutId);
    }

    const timeoutId = setTimeout(async () => {
      try {
        await this.throttleRequest(requestFn, batchKey);
      } catch (error) {
        console.warn('🚫 Batched request failed:', error);
      } finally {
        this.requests.delete(batchKey);
      }
    }, delay);

    this.requests.set(batchKey, { timeoutId, timestamp: Date.now() });
  }

  /**
   * Clear all pending requests and reset state
   */
  reset() {
    // Clear all pending timeouts
    this.requests.forEach(({ timeoutId }) => clearTimeout(timeoutId));
    this.requests.clear();
    
    // Clear queue
    this.requestQueue = [];
    this.activeRequests = 0;
    this.lastRequestTime = 0;
  }

  /**
   * Get current throttle status
   */
  getStatus() {
    return {
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      lastRequestTime: this.lastRequestTime,
      timeSinceLastRequest: Date.now() - this.lastRequestTime
    };
  }
}

// Create singleton instance
const navigationThrottleManager = new NavigationThrottleManager();

// Enhanced fetch wrapper with throttling
const throttledFetch = (url, options = {}) => {
  return navigationThrottleManager.throttleRequest(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, `fetch:${url}`);
};

// Enhanced XMLHttpRequest wrapper
const createThrottledXHR = () => {
  const xhr = new XMLHttpRequest();
  const originalSend = xhr.send;

  xhr.send = function(...args) {
    return navigationThrottleManager.throttleRequest(() => {
      return new Promise((resolve, reject) => {
        this.onload = () => resolve(this);
        this.onerror = () => reject(new Error('XHR failed'));
        this.ontimeout = () => reject(new Error('XHR timeout'));
        originalSend.apply(this, args);
      });
    }, `xhr:${this.responseURL || 'unknown'}`);
  };

  return xhr;
};

export {
  navigationThrottleManager,
  throttledFetch,
  createThrottledXHR
};

export default navigationThrottleManager;
