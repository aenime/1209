/**
 * Reload Prevention Utility
 * Helps debug and prevent unwanted page reloads
 */

class ReloadPrevention {
  constructor() {
    this.reloadAttempts = 0;
    this.lastReloadTime = 0;
    this.isEnabled = process.env.NODE_ENV === 'development';
    
    if (this.isEnabled) {
      this.interceptReloads();
    }
  }

  interceptReloads() {
    // Store original reload function
    const originalReload = window.location.reload;
    
    // Override reload function
    window.location.reload = (...args) => {
      const now = Date.now();
      const timeSinceLastReload = now - this.lastReloadTime;
      
      this.reloadAttempts++;
      this.lastReloadTime = now;
      
      // Log reload attempts
      
      // Prevent rapid reloads (less than 5 seconds apart)
      if (timeSinceLastReload < 5000 && this.reloadAttempts > 1) {
        return false;
      }
      
      // Allow reload if not too frequent
      return originalReload.apply(window.location, args);
    };
    
  }

  // Get reload statistics
  getStats() {
    return {
      attempts: this.reloadAttempts,
      lastReloadTime: new Date(this.lastReloadTime),
      isEnabled: this.isEnabled
    };
  }

  // Reset statistics
  reset() {
    this.reloadAttempts = 0;
    this.lastReloadTime = 0;
  }
}

// Create instance
const reloadPrevention = new ReloadPrevention();

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.reloadPrevention = reloadPrevention;
}

export default reloadPrevention;
