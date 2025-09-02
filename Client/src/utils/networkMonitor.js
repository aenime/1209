/**
 * Network Monitor - Tracks all network activity and script loading
 * Provides comprehensive logging for debugging
 */

class NetworkMonitor {
  constructor() {
    this.isMonitoring = false;
    this.loadedScripts = new Set();
    this.networkRequests = [];
    this.originalFetch = null;
    this.originalXHROpen = null;
    
    this.init();
  }

  init() {
    if (this.isMonitoring) return;
    
    // Network monitor initialization logging removed for cleaner console output
    
    this.setupFetchMonitoring();
    this.setupXHRMonitoring();
    this.setupScriptMonitoring();
    this.logExistingScripts();
    
    this.isMonitoring = true;
    // Network monitoring active
  }

  setupFetchMonitoring() {
    if (this.originalFetch) return; // Already setup
    
    this.originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      
      const startTime = performance.now();
      
      try {
        const response = await this.originalFetch.apply(window, args);
        const endTime = performance.now();
        
        // Track the request
        this.networkRequests.push({
          type: 'fetch',
          url: url.toString(),
          method: options.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          timestamp: new Date()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        console.error('Network request failed:', {
          error: error.message,
          errorName: error.name,
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          url: url.toString()
        });
        
        // Track failed request
        this.networkRequests.push({
          type: 'fetch',
          url: url.toString(),
          method: options.method || 'GET',
          status: 'error',
          duration: endTime - startTime,
          error: error.message,
          timestamp: new Date()
        });
        
        throw error;
      }
    };
  }

  setupXHRMonitoring() {
    if (this.originalXHROpen) return; // Already setup
    
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    const originalOpen = this.originalXHROpen; // Store reference
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      // XHR request logging removed for cleaner console output
      const requestInfo = {
        method,
        url: url.toString(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      const startTime = performance.now();
      
      this.addEventListener('load', () => {
        const endTime = performance.now();
        // XHR success logging removed for cleaner console output
        const successInfo = {
          status: this.status,
          statusText: this.statusText,
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          url: url.toString(),
          responseLength: this.responseText?.length || 0
        };
      });
      
      this.addEventListener('error', () => {
        const endTime = performance.now();
        console.error('XMLHttpRequest error:', {
          status: this.status,
          statusText: this.statusText,
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          url: url.toString(),
          readyState: this.readyState,
          errorType: 'Network/CORS Error'
        });
        
        // Additional CORS-specific logging
        if (this.status === 0) {
        }
        
      });
      
      return originalOpen.call(this, method, url, ...args);
    };
  }

  setupScriptMonitoring() {
    // Monitor script loading via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') {
            this.logScriptLoading(node);
          }
        });
      });
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    // Also monitor script elements added to body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  logScriptLoading(scriptElement) {
    const src = scriptElement.src;
    const isInline = !src;
    
    // Script loading logging removed for cleaner console output
    const scriptInfo = {
      type: isInline ? 'inline' : 'external',
      src: src || 'inline script',
      async: scriptElement.async,
      defer: scriptElement.defer,
      timestamp: new Date().toLocaleTimeString()
    };

    if (src && !this.loadedScripts.has(src)) {
      this.loadedScripts.add(src);
      
      scriptElement.onload = () => {
        // Script loaded successfully - logging removed for cleaner console output
      };
      
      scriptElement.onerror = () => {
      };
    } else {
    }
  }

  logExistingScripts() {
    // Existing scripts audit logging removed for cleaner console output
    
    const scripts = document.querySelectorAll('script');
    // Found scripts - logging removed
    
    scripts.forEach((script, index) => {
      const src = script.src;
      const isInline = !src;
      
      // Script details logging removed
      
      if (src) {
        this.loadedScripts.add(src);
      }
    });
    
  }

  getNetworkSummary() {
    return {
      totalRequests: this.networkRequests.length,
      loadedScripts: Array.from(this.loadedScripts),
      recentRequests: this.networkRequests.slice(-10) // Last 10 requests
    };
  }

  logNetworkSummary() {
    
    const summary = this.getNetworkSummary();
    
    // Network monitoring active
    
    
    if (summary.recentRequests.length > 0) {
      // Recent requests available for monitoring
    }
    
  }

  // Check if tracking scripts are loaded
  checkTrackingScripts() {
    const trackingScripts = {
      googleAnalytics: this.loadedScripts.has('https://www.googletagmanager.com/gtag/js') || 
                      Array.from(this.loadedScripts).some(src => src.includes('googletagmanager.com')),
      facebookPixel: this.loadedScripts.has('https://connect.facebook.net/en_US/fbevents.js') ||
                    Array.from(this.loadedScripts).some(src => src.includes('facebook.net')),
      gtag: typeof window.gtag === 'function',
      fbq: typeof window.fbq === 'function',
      dataLayer: Array.isArray(window.dataLayer)
    };
    
    // Check for tracking readiness
    const isTrackingReady = trackingScripts.gtag && trackingScripts.dataLayer;
    const isFBReady = trackingScripts.fbq;
    
    return trackingScripts;
  }
}

// Create singleton instance
const networkMonitor = new NetworkMonitor();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.networkMonitor = networkMonitor;
  
  // Add global helper functions
  window.logNetworkSummary = () => networkMonitor.logNetworkSummary();
  window.checkTrackingScripts = () => networkMonitor.checkTrackingScripts();
  
  // Network debugging utilities logging removed for cleaner console output
}

export default networkMonitor;
