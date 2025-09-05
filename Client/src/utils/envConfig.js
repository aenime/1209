/**
 * Environment Configuration Manager for E-Commerce Application
 * 
 * This module provides centralized configuration management with intelligent caching:
 * 
 * Core Features:
 * - Database-driven configuration that can be updated without deployments
 * - LocalStorage caching to minimize API calls and improve performance
 * - In-memory caching for ultra-fast access during user sessions
 * - Cache invalidation and refresh mechanisms
 * - Offline support after initial configuration load
 * - Development utilities for debugging and testing
 * 
 * Cache Strategy:
 * 1. Check in-memory cache first (fastest)
 * 2. Check localStorage cache second (fast, persists across tabs)
 * 3. Fetch from database API as fallback (network required)
 * 4. Cache persists until manual clear or hard browser refresh
 * 
 * Benefits:
 * - Eliminates repeated API calls for configuration data
 * - Prevents configuration polling and reduces server load
 * - Enables faster application startup and navigation
 * - Supports offline functionality after initial load
 * - Allows real-time configuration updates when needed
 */

/**
 * Domain Extraction Utility
 * 
 * Extracts the primary domain name without TLD for branding purposes.
 * Used to generate dynamic app names and branding elements.
 * 
 * @returns {string} Domain name without TLD or 'YourBrand' as fallback
 */
const getDomainWithoutTLD = () => {
  if (typeof window === 'undefined') return 'YourBrand'; // Server-side rendering safety
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost, IP addresses, and development environments
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return 'YourBrand';
  }
  
  // For domains like 'example.com' or 'sub.example.com'
  // Take the main domain part (before the TLD)
  if (parts.length >= 2) {
    return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
  }
  
  return hostname;
};

// Dynamic configuration cache
let dynamicConfig = null;
let configPromise = null;
let autoRefreshStarted = false; // Singleton flag to prevent multiple auto-refresh setups

// Local storage key for cached config
const CONFIG_CACHE_KEY = 'envConfig'; // Keep compatibility with existing cache
const CONFIG_TIMESTAMP_KEY = 'envConfigTimestamp';
const CONFIG_VERSION_KEY = 'envConfigVersion'; // New version tracking
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

// Check if cached config exists and is valid
const getCachedConfig = () => {
  try {
    const cachedData = localStorage.getItem(CONFIG_CACHE_KEY);
    const timestamp = localStorage.getItem(CONFIG_TIMESTAMP_KEY);
    
    if (cachedData && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      const config = JSON.parse(cachedData);
      
      // Check if cache is expired (older than CACHE_DURATION)
      if (age > CACHE_DURATION) {
        clearConfigCache();
        return null;
      }
      
      // Using cached config - logging removed for cleaner console output
      return config;
    }
  } catch (error) {
    clearConfigCache();
  }
  return null;
};

// Clear config cache helper
const clearConfigCache = () => {
  localStorage.removeItem(CONFIG_CACHE_KEY);
  localStorage.removeItem(CONFIG_TIMESTAMP_KEY);
  localStorage.removeItem(CONFIG_VERSION_KEY);
};

// Save config to localStorage with version tracking
const saveConfigToCache = (config, serverVersion = null) => {
  try {
    const currentTime = Date.now();
    const configVersion = serverVersion || currentTime; // Use server version if available, otherwise timestamp
    
    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(CONFIG_TIMESTAMP_KEY, currentTime.toString());
    localStorage.setItem(CONFIG_VERSION_KEY, configVersion.toString());
    
  } catch (error) {
  }
};

// Fetch dynamic configuration from database API
const fetchDynamicConfig = async () => {
  // First, try to get from cache (with expiration check)
  const cachedConfig = getCachedConfig();
  if (cachedConfig) {
    return cachedConfig;
  }

  // If no valid cache, fetch from API
  try {
    // Fetch config only - NO version checking to prevent API spam
    const configResponse = await fetch('/api/env-config/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      signal: AbortSignal.timeout(8000)
    });
    
    // Process config response
    if (configResponse.ok) {
      const result = await configResponse.json();
      if (result.success && result.data) {
        // Extract only the environment variables, exclude metadata
        const { _id, __v, configName, createdAt, updatedAt, isActive, ...envData } = result.data;
        
        // Save to cache without version (version checking disabled)
        saveConfigToCache(envData, null);
        
        return envData;
      }
    }
    throw new Error(`API response not successful: ${configResponse.status}`);
  } catch (error) {
    
    // Try to use expired cache as emergency fallback
    const expiredCache = getExpiredCacheIfAvailable();
    if (expiredCache) {
      return expiredCache;
    }
    
    // In production, also try to get from process.env as ultimate fallback
    if (process.env.NODE_ENV === 'production') {
      const fallbackConfig = getProductionFallbacks();
      saveConfigToCache(fallbackConfig);
      return fallbackConfig;
    }
    
    const fallbackConfig = getStaticFallbacks();
    saveConfigToCache(fallbackConfig);
    return fallbackConfig;
  }
};

// Get expired cache if available (emergency fallback)
const getExpiredCacheIfAvailable = () => {
  try {
    const cachedData = localStorage.getItem(CONFIG_CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
  }
  return null;
};

// Production fallback configuration (uses process.env when database is unavailable)
const getProductionFallbacks = () => {
  return {
    // Branding & UI
    REACT_APP_FAM: process.env.REACT_APP_FAM || "",
    REACT_APP_BRAND_TAGLINE: process.env.REACT_APP_BRAND_TAGLINE || "ONLINE",
    REACT_APP_LOGO: process.env.REACT_APP_LOGO || "",
    REACT_APP_MO: process.env.REACT_APP_MO || " ",
    REACT_APP_ADDRESS: process.env.REACT_APP_ADDRESS || "",
    
    // Theme Colors
    REACT_APP_KEY_COLOR: process.env.REACT_APP_KEY_COLOR || "",
    REACT_APP_S_COLOR: process.env.REACT_APP_S_COLOR || "",
    REACT_APP_ADDRESS_BUTTON_COLOR: process.env.REACT_APP_ADDRESS_BUTTON_COLOR || "",
    
    // Feature Toggles
    REACT_APP_COD: process.env.REACT_APP_COD || "",
    REACT_APP_SIZE: process.env.REACT_APP_SIZE || "",
    
    // Payment Options - Cashfree
    CASHFREE_ENABLED: process.env.CASHFREE_ENABLED === 'true' || false,
    CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID || "",
    CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET || "",
    CASHFREE_ENVIRONMENT: process.env.CASHFREE_ENVIRONMENT || "production",
    
    
    // Analytics - These are critical for tracking in production
    REACT_APP_G4: process.env.REACT_APP_G4 || "",
    REACT_APP_FBPIXEL: process.env.REACT_APP_FBPIXEL || "",
    REACT_APP_AW: process.env.REACT_APP_AW || "",
    REACT_APP_AW_CONVERSION_ID: process.env.REACT_APP_AW_CONVERSION_ID || "",
    REACT_APP_TRACKING_USE_OFFER_PRICE: process.env.REACT_APP_TRACKING_USE_OFFER_PRICE || "",
    
    // Advanced
    REACT_APP_DETECTION_MODE: process.env.REACT_APP_DETECTION_MODE || "",
    REACT_APP_OFFER_URL_SUFFIX: process.env.REACT_APP_OFFER_URL_SUFFIX || ""
  };
};

// Static fallback configuration (only used when database is unavailable)
const getStaticFallbacks = () => {
  return {
    // Branding & UI
    REACT_APP_FAM: "",
    REACT_APP_BRAND_TAGLINE: "ONLINE",
    REACT_APP_LOGO: "",
    REACT_APP_MO: " ",
    REACT_APP_ADDRESS: "",
    
    // Theme Colors
    REACT_APP_KEY_COLOR: "",
    REACT_APP_S_COLOR: "",
    REACT_APP_ADDRESS_BUTTON_COLOR: "",
    
    // Feature Toggles
    REACT_APP_COD: "",
    REACT_APP_SIZE: "",
    
    // Payment Options - Cashfree
    CASHFREE_ENABLED: false,
    CASHFREE_CLIENT_ID: "",
    CASHFREE_CLIENT_SECRET: "",
    CASHFREE_ENVIRONMENT: "production",
    
    
    // Analytics
    REACT_APP_G4: "",
    REACT_APP_FBPIXEL: "",
    REACT_APP_AW: "",
    REACT_APP_AW_CONVERSION_ID: "",
    REACT_APP_TRACKING_USE_OFFER_PRICE: "",
    
    // Advanced
    REACT_APP_DETECTION_MODE: "",
    REACT_APP_OFFER_URL_SUFFIX: ""
  };
};

// Dynamic environment configuration
const envConfig = {
  // Initialize and cache configuration
  init: async function() {
    if (configPromise) return configPromise;
    
    configPromise = (async () => {
      try {
        // First check if we already have cached config in memory
        if (dynamicConfig) {
          return dynamicConfig;
        }
        
        // Load from localStorage or API
        dynamicConfig = await fetchDynamicConfig();
        return dynamicConfig;
      } catch (error) {
        const fallbackConfig = getStaticFallbacks();
        dynamicConfig = fallbackConfig;
        saveConfigToCache(fallbackConfig);
        return dynamicConfig;
      }
    })();
    
    return configPromise;
  },
  
  // Get configuration value (always from cache)
  get: function(key) {
    if (dynamicConfig && dynamicConfig[key] !== undefined) {
      const value = dynamicConfig[key];
      
      // Special handling for REACT_APP_FAM
      if (key === 'REACT_APP_FAM' && (!value || value.trim() === '')) {
        return getDomainWithoutTLD();
      }
      
      return value;
    }
    
    // If not loaded in memory, try localStorage
    const cachedConfig = getCachedConfig();
    if (cachedConfig && cachedConfig[key] !== undefined) {
      const value = cachedConfig[key];
      
      // Special handling for REACT_APP_FAM
      if (key === 'REACT_APP_FAM' && (!value || value.trim() === '')) {
        return getDomainWithoutTLD();
      }
      
      return value;
    }
    
    // Last resort: use static fallbacks
    const fallbacks = getStaticFallbacks();
    const value = fallbacks[key];
    
    // Special handling for REACT_APP_FAM
    if (key === 'REACT_APP_FAM' && (!value || value.trim() === '')) {
      return getDomainWithoutTLD();
    }
    
    return value || '';
  },
  
  // Get all configuration (from memory or cache)
  getAll: function() {
    if (dynamicConfig) return dynamicConfig;
    return getCachedConfig() || getStaticFallbacks();
  },
  
  // Clear cache and reload configuration from database (only when explicitly needed)
  forceReload: async function() {
    // Clear all caches
    configPromise = null;
    dynamicConfig = null;
    localStorage.removeItem(CONFIG_CACHE_KEY);
    localStorage.removeItem(CONFIG_TIMESTAMP_KEY);
    
    // Also clear offer eligibility cache since config changed
    this.clearOfferCache();
    
    // Fetch fresh data
    return await this.init();
  },
  
  // Check if dynamic config is loaded
  isDynamicLoaded: function() {
    return dynamicConfig !== null || getCachedConfig() !== null;
  },
  
  // Clear cache (useful for development)
  clearCache: function() {
    clearConfigCache();
    dynamicConfig = null;
    configPromise = null;
    
    // Clear version check throttling when cache is cleared
    localStorage.removeItem('lastVersionCheck');
    
    // Also clear offer cache since config changed
    this.clearOfferCache();
  },

  // Clear offer eligibility cache when config changes
  clearOfferCache: function() {
    try {
      localStorage.removeItem('offerEligibilityResult');
      localStorage.removeItem('offerEligibilityTimestamp');
      localStorage.removeItem('offerSessionId');
    } catch (error) {
    }
  },

  // Refresh cache if it's getting old (LOCAL CHECK ONLY - no server version check)
  refreshCacheIfNeeded: async function() {
    const timestamp = localStorage.getItem(CONFIG_TIMESTAMP_KEY);
    
    // Check if cache is getting old (LOCAL CHECK ONLY)
    let shouldRefresh = false;
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp);
      // Only refresh when cache is completely expired, not before
      if (age > CACHE_DURATION) {
        shouldRefresh = true;
      }
    } else {
      shouldRefresh = true; // No cache exists
    }
    
    // NO SERVER VERSION CHECK - only refresh when cache is expired
    if (shouldRefresh) {
      await this.forceReload();
    }
  },  // Check cache health and return status
  getCacheStatus: function() {
    const timestamp = localStorage.getItem(CONFIG_TIMESTAMP_KEY);
    const version = localStorage.getItem(CONFIG_VERSION_KEY);
    const cachedData = localStorage.getItem(CONFIG_CACHE_KEY);
    
    if (!timestamp || !cachedData) {
      return { status: 'empty', age: 0, valid: false };
    }
    
    const age = Date.now() - parseInt(timestamp);
    const isExpired = age > CACHE_DURATION;
    
    return {
      status: isExpired ? 'expired' : 'valid',
      age: Math.round(age / 1000), // age in seconds
      valid: !isExpired,
      version: version || 'unknown',
      cacheSize: cachedData.length,
      keysCount: cachedData ? Object.keys(JSON.parse(cachedData)).length : 0
    };
  },

  // Check server version (MANUAL USE ONLY - for development/debugging)
  checkServerVersion: async function() {
    
    try {
      const response = await fetch('/api/env-config/version', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const { version: serverVersion } = await response.json();
        const cachedVersion = localStorage.getItem(CONFIG_VERSION_KEY);
        
        
        // If versions don't match, cache is outdated
        if (cachedVersion && parseInt(cachedVersion) < serverVersion) {
          return false; // Cache is invalid
        }
        
        return true; // Cache is valid
      }
    } catch (error) {
    }
    
    return true; // Assume cache is valid if we can't check
  },

  // Enhanced cache validation including server version check
  validateCache: async function() {
    // First check local cache expiration
    const localStatus = this.getCacheStatus();
    if (!localStatus.valid) {
      return false;
    }
    
    // Then check server version
    return await this.checkServerVersion();
  },
  
  // Debug information (development only)
  debug: function() {
    if (process.env.NODE_ENV !== 'development') return;
    
  },
  
  // Ensure configuration is loaded before use
  ensureLoaded: async function() {
    if (!this.isDynamicLoaded()) {
      await this.init();
    }
    return this.isDynamicLoaded();
  },

  // Start automatic cache refresh (DISABLED - only manual refresh on page reload)
  startAutoRefresh: function() {
    // DISABLED: No automatic refresh to prevent unnecessary API calls
    // Configuration will only refresh when:
    // 1. User manually refreshes the page
    // 2. Cache expires (5 minutes) and user navigates
    // 3. Developer manually calls forceReload()
    
    if (typeof window === 'undefined' || autoRefreshStarted) {
      return;
    }
    
    autoRefreshStarted = true;
    // Auto-refresh system disabled to keep console clean
    
    // NO setInterval - no automatic background checking
    // This eliminates all automatic API calls to version endpoint
  }
};

// Export individual getters for convenience
export const getBrandName = () => envConfig.get('REACT_APP_FAM');
export const getBrandTagline = () => envConfig.get('REACT_APP_BRAND_TAGLINE');
export const getLogoUrl = () => envConfig.get('REACT_APP_LOGO');
export const getMobileNumber = () => envConfig.get('REACT_APP_MO');
export const getAddress = () => envConfig.get('REACT_APP_ADDRESS');
export const getPrimaryThemeColor = () => envConfig.get('REACT_APP_KEY_COLOR');
export const getSecondaryThemeColor = () => envConfig.get('REACT_APP_S_COLOR');
export const getAddressButtonColor = () => envConfig.get('REACT_APP_ADDRESS_BUTTON_COLOR');
export const isCODEnabled = () => envConfig.get('REACT_APP_COD') === 'yes';
export const isSizeEnabled = () => envConfig.get('REACT_APP_SIZE') === 'yes';

// Cashfree Payment Gateway Configuration
export const isCashfreeEnabled = () => envConfig.get('CASHFREE_ENABLED') === true || envConfig.get('CASHFREE_ENABLED') === 'true';
export const getCashfreeClientId = () => envConfig.get('CASHFREE_CLIENT_ID');
export const getCashfreeClientSecret = () => envConfig.get('CASHFREE_CLIENT_SECRET');
export const getCashfreeEnvironment = () => envConfig.get('CASHFREE_ENVIRONMENT') || 'production';

export const getGoogleAnalyticsId = () => envConfig.get('REACT_APP_G4');
export const getFacebookPixelId = () => envConfig.get('REACT_APP_FBPIXEL');
export const getGoogleAdsId = () => envConfig.get('REACT_APP_AW');
export const getGooglePurchaseTag = () => envConfig.get('REACT_APP_AW_CONVERSION_ID');
export const shouldTrackOfferPrice = () => envConfig.get('REACT_APP_TRACKING_USE_OFFER_PRICE') === 'yes';
export const getDetectionMode = () => envConfig.get('REACT_APP_DETECTION_MODE');
export const getOfferUrlSuffix = () => envConfig.get('REACT_APP_OFFER_URL_SUFFIX');

// Development utilities - Make cache management available globally
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.envConfigUtils = {
    clearCache: () => envConfig.clearCache(),
    forceReload: () => envConfig.forceReload(),
    debug: () => envConfig.debug(),
    getCacheInfo: () => ({
      inMemory: envConfig.isDynamicLoaded(),
      cacheStatus: envConfig.getCacheStatus(),
      cacheTimestamp: localStorage.getItem('envConfigTimestamp'),
      cachedAt: new Date(parseInt(localStorage.getItem('envConfigTimestamp') || '0')),
      autoRefreshDisabled: true,
      versionCheckDisabled: true
    }),
    manualVersionCheck: () => envConfig.checkServerVersion(),
    validateCache: () => envConfig.validateCache(),
    clearOfferCache: () => envConfig.clearOfferCache(),
    resetVersionThrottle: () => {
      localStorage.removeItem('lastVersionCheck');
      // Version check throttling reset (logging disabled)
    }
  };
  
  // Show utilities info (disabled in production)
  if (!sessionStorage.getItem('envConfigUtilsShown')) {
    // Debug info logging disabled to keep console clean
    sessionStorage.setItem('envConfigUtilsShown', 'true');
  }
}

export default envConfig;

// Auto-start cache refresh system when module loads
if (typeof window !== 'undefined') {
  // Start auto refresh after a short delay to ensure everything is initialized
  setTimeout(() => {
    envConfig.startAutoRefresh();
  }, 5000); // 5 second delay
}
