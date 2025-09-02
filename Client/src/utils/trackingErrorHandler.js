/**
 * Enhanced Tracking Error Handler
 * 
 * Handles and suppresses common tracking errors that don't affect
 * application functionality while logging important ones for debugging.
 */

class TrackingErrorHandler {
  constructor() {
    this.suppressedErrorsCount = 0;
    this.loggedErrors = new Set();
    this.maxSuppressedErrors = 50;
    this.errorPatterns = {
      // Network-related errors that can be safely suppressed
      network: [
        'Failed to fetch',
        'Network request failed',
        'ERR_BLOCKED_BY_CLIENT',
        'ERR_NETWORK_CHANGED',
        'ERR_INTERNET_DISCONNECTED',
        'AbortError',
        'TimeoutError',
        'ERR_CONNECTION_REFUSED',
        'ERR_CONNECTION_TIMED_OUT'
      ],
      
      // Tracking service errors
      tracking: [
        'google-analytics.com',
        'googleads.com',
        'facebook.net',
        'doubleclick.net',
        'facebook.com/tr',
        'google.com/ccm',
        'googletagmanager.com',
        'fbevents.js'
      ],
      
      // CORS and CSP errors
      cors: [
        'CORS',
        'Cross-Origin',
        'Content Security Policy',
        'Refused to connect',
        'blocked by CORS policy'
      ],
      
      // Service Worker errors
      serviceWorker: [
        'ServiceWorker',
        'sw.js',
        'Cache API',
        'navigator.serviceWorker'
      ]
    };
  }

  /**
   * Handle tracking-related errors
   */
  handleError(error, context = 'tracking') {
    const errorMessage = this.extractErrorMessage(error);
    const errorKey = `${context}:${errorMessage}`;

    // Don't spam console with duplicate errors
    if (this.loggedErrors.has(errorKey)) {
      return true; // Already logged
    }

    // Check if this is a suppressible error
    if (this.shouldSuppressError(errorMessage)) {
      this.suppressedErrorsCount++;
      
      // Log once for debugging, then suppress
      if (!this.loggedErrors.has(errorKey)) {
        console.warn(`🔇 [${context}] Suppressed tracking error:`, errorMessage);
        this.loggedErrors.add(errorKey);
      }
      
      // Reset suppressed count periodically
      if (this.suppressedErrorsCount >= this.maxSuppressedErrors) {
        this.reset();
      }
      
      return true; // Suppressed
    }

    // Log important errors that should be visible
    console.error(`🚨 [${context}] Important tracking error:`, error);
    this.loggedErrors.add(errorKey);
    
    return false; // Not suppressed
  }

  /**
   * Extract error message from various error types
   */
  extractErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error && error.message) return error.message;
    if (error && error.toString) return error.toString();
    return 'Unknown error';
  }

  /**
   * Check if error should be suppressed
   */
  shouldSuppressError(errorMessage) {
    const message = errorMessage.toLowerCase();
    
    return Object.values(this.errorPatterns).some(patterns =>
      patterns.some(pattern => message.includes(pattern.toLowerCase()))
    );
  }

  /**
   * Install global error handlers for tracking
   */
  installGlobalHandlers() {
    // Suppress fetch failures for tracking URLs
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const url = args[0];
        if (typeof url === 'string' && this.isTrackingURL(url)) {
          this.handleError(error, 'fetch');
          // Return a fake successful response for tracking failures
          return new Response('{}', { status: 200, statusText: 'OK' });
        }
        throw error;
      }
    };

    // Suppress XMLHttpRequest failures for tracking URLs
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
      const xhr = this;
      const originalOnError = xhr.onerror;
      
      xhr.onerror = function(event) {
        if (xhr.responseURL && trackingErrorHandler.isTrackingURL(xhr.responseURL)) {
          trackingErrorHandler.handleError(new Error(`XHR failed: ${xhr.responseURL}`), 'xhr');
          return; // Suppress error
        }
        
        if (originalOnError) {
          originalOnError.call(xhr, event);
        }
      };
      
      return originalXHRSend.apply(xhr, args);
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.handleError(event.reason, 'promise')) {
        event.preventDefault(); // Suppress the error
      }
    });

    // Handle window errors
    window.addEventListener('error', (event) => {
      if (this.handleError(event.error || event.message, 'window')) {
        event.preventDefault(); // Suppress the error
      }
    });
  }

  /**
   * Check if URL is a tracking service URL
   */
  isTrackingURL(url) {
    const trackingDomains = [
      'google-analytics.com',
      'googleads.com',
      'googleadservices.com',
      'googlesyndication.com',
      'googletagmanager.com',
      'facebook.net',
      'facebook.com',
      'doubleclick.net',
      'google.com/ccm',
      'google.com/ads'
    ];

    return trackingDomains.some(domain => url.includes(domain));
  }

  /**
   * Reset suppressed error count and clear cache
   */
  reset() {
    this.suppressedErrorsCount = 0;
    this.loggedErrors.clear();
    console.log('🔄 Tracking error handler reset');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      suppressedErrorsCount: this.suppressedErrorsCount,
      uniqueErrorsLogged: this.loggedErrors.size,
      maxSuppressedErrors: this.maxSuppressedErrors
    };
  }
}

// Create singleton instance
const trackingErrorHandler = new TrackingErrorHandler();

// Auto-install global handlers
trackingErrorHandler.installGlobalHandlers();

export default trackingErrorHandler;
