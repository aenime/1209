/**
 * Tracking Error Suppressor
 * Suppresses Google Analytics and other tracking-related console errors
 * that can flood the console during development
 */

class TrackingErrorSuppressor {
  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleLog = console.log;
    this.initialize();
  }

  isTrackingError(message) {
    const trackingPatterns = [
      'google.com/ccm/',
      'google-analytics.com',
      'googletagmanager.com',
      'gtag',
      'analytics',
      'Fetch failed loading: GET "https://google.com',
      'Failed to load resource',
      'fbevents.js',
      'facebook.com',
      'Throttling navigation to prevent the browser from hanging'
    ];

    return trackingPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  initialize() {
    // Override console.error
    console.error = (...args) => {
      const message = args.join(' ');
      if (!this.isTrackingError(message)) {
        this.originalConsoleError.apply(console, args);
      }
    };

    // Override console.warn
    console.warn = (...args) => {
      const message = args.join(' ');
      if (!this.isTrackingError(message)) {
        this.originalConsoleWarn.apply(console, args);
      }
    };

    // Override console.log for fetch logs
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('Fetch finished loading') || 
          message.includes('Fetch failed loading') ||
          this.isTrackingError(message)) {
        return; // Suppress these logs
      }
      this.originalConsoleLog.apply(console, args);
    };

    // Suppress unhandled promise rejections for tracking scripts
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && typeof event.reason === 'string' && 
          this.isTrackingError(event.reason)) {
        event.preventDefault();
      }
    });

    // Suppress network errors for tracking scripts
    window.addEventListener('error', (event) => {
      if (event.target && event.target.src && 
          this.isTrackingError(event.target.src)) {
        event.preventDefault();
        return false;
      }
    }, true);
  }

  restore() {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    console.log = this.originalConsoleLog;
  }
}

// Initialize the suppressor
const trackingErrorSuppressor = new TrackingErrorSuppressor();

export default trackingErrorSuppressor;
