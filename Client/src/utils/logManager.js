/**
 * Minimal Log Manager - Only logs errors and warnings for production debugging
 */

class LogManager {
  constructor() {
    this.logCounts = new Map();
    this.maxLogCount = 3; // Maximum times to log the same message
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Log a message with duplicate prevention - Only errors and warnings in production
   * @param {string} key - Unique key for the log message
   * @param {string} message - The message to log
   * @param {string} level - Log level (log, warn, error)
   * @param {*} data - Additional data to log
   */
  log(key, message, level = 'log', data = null) {
    // In production, only log errors and warnings
    if (!this.isDevelopment && level !== 'error' && level !== 'warn') {
      return;
    }

    const count = this.logCounts.get(key) || 0;
    
    // Don't log if we've exceeded the max count for this message
    if (count >= this.maxLogCount) {
      return;
    }
    
    // Update count
    this.logCounts.set(key, count + 1);
    
    // Determine the appropriate console method
    const logMethod = console[level] || console.log;
    
    // Log the message
    if (data) {
      logMethod(message, data);
    } else {
      logMethod(message);
    }
  }

  /**
   * Force log an error or warning (always logs regardless of environment)
   */
  error(message, data = null) {
    if (data) {
    } else {
    }
  }

  warn(message, data = null) {
    if (data) {
    } else {
    }
  }

  /**
   * Development-only logging
   */
  dev(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
      } else {
      }
    }
  }

  /**
   * Reset log counts (useful for testing)
   */
  reset() {
    this.logCounts.clear();
  }
}

// Export singleton instance
const logManagerInstance = new LogManager();
export default logManagerInstance;
