/**
 * URL Utilities for Offer Management
 * Provides helper functions for managing offer/non-offer URLs
 */

import { getOfferUrlSuffix } from './envConfig';

/**
 * Get the offer URL suffix from environment
 * @returns {string|null} The offer suffix or null if not configured
 */
export const getOfferSuffix = () => {
  const suffix = getOfferUrlSuffix();
  
  // Return null if suffix is not configured or empty
  if (!suffix || suffix.trim() === '') {
    return null;
  }
  
  return suffix.trim();
};

/**
 * Check if current URL is an offer URL
 * @returns {boolean} True if current URL contains offer suffix
 */
export const isOfferUrl = () => {
  const suffix = getOfferSuffix();
  
  // If no suffix is configured, never consider URLs as offer URLs
  if (!suffix) {
    return false;
  }
  
  const path = window.location.pathname.toLowerCase();
  
  // Handle query parameter suffix (like ?gad_source=89&gad_campaignid=80521188)
  if (suffix.startsWith('?')) {
    const urlParams = new URLSearchParams(window.location.search);
    const suffixParams = new URLSearchParams(suffix);
    
    // NEW: Check if URL CONTAINS all required parameters (allows additional params)
    for (const [key, value] of suffixParams) {
      const currentValue = urlParams.get(key);
      if (!currentValue || currentValue !== value) {
        return false;
      }
    }
    return true;
  }
  
  // Handle query suffix without ? prefix (COMMON CONFIGURATION ERROR)
  if (suffix.includes('=') && (suffix.includes('&') || suffix.split('=').length === 2)) {
    const urlParams = new URLSearchParams(window.location.search);
    const suffixParams = new URLSearchParams('?' + suffix);
    
    // Check if URL contains all required parameters
    for (const [key, value] of suffixParams) {
      const currentValue = urlParams.get(key);
      if (!currentValue || currentValue !== value) {
        return false;
      }
    }
    return true;
  }
  
  // Handle path-based suffix (like /offer)
  return path.includes(`/${suffix}`);
};

/**
 * Convert a regular URL to offer URL
 * @param {string} url - The URL to convert
 * @returns {string} The offer URL (returns original URL if no suffix configured)
 */
export const toOfferUrl = (url) => {
  const suffix = getOfferSuffix();
  
  // If no suffix is configured, return original URL
  if (!suffix) {
    return url;
  }
  
  // Handle query parameter suffix
  if (suffix.startsWith('?')) {
    // NEW: Merge parameters instead of replacing - preserves existing params
    const urlObj = new URL(url, window.location.origin);
    const suffixParams = new URLSearchParams(suffix);
    
    // Add/update required parameters while preserving existing ones
    for (const [key, value] of suffixParams) {
      urlObj.searchParams.set(key, value);
    }
    
    return urlObj.pathname + urlObj.search;
  }
  
  // Handle query suffix without ? prefix (auto-fix)
  if (suffix.includes('=') && (suffix.includes('&') || suffix.split('=').length === 2)) {
    const urlObj = new URL(url, window.location.origin);
    const suffixParams = new URLSearchParams('?' + suffix);
    
    // Add/update required parameters while preserving existing ones
    for (const [key, value] of suffixParams) {
      urlObj.searchParams.set(key, value);
    }
    
    return urlObj.pathname + urlObj.search;
  }
  
  // Handle path-based suffix (legacy)
  if (url.includes(`/${suffix}`)) {
    return url;
  }
  
  if (url === '/' || url === '') {
    return `/${suffix}`;
  }
  
  return `/${suffix}${url}`;
};

/**
 * Convert an offer URL to regular URL
 * @param {string} url - The offer URL to convert
 * @returns {string} The regular URL (returns original URL if no suffix configured)
 */
export const toRegularUrl = (url) => {
  const suffix = getOfferSuffix();
  
  // If no suffix is configured, return original URL
  if (!suffix) {
    return url;
  }
  
  // Handle query parameter suffix
  if (suffix.startsWith('?')) {
    const suffixParams = new URLSearchParams(suffix);
    const urlObj = new URL(url, window.location.origin);
    
    // NEW: Remove only the required parameters, preserve other existing params
    for (const [key] of suffixParams) {
      urlObj.searchParams.delete(key);
    }
    
    return urlObj.pathname + (urlObj.search || '');
  }
  
  // Handle query suffix without ? prefix (auto-fix)
  if (suffix.includes('=') && (suffix.includes('&') || suffix.split('=').length === 2)) {
    const suffixParams = new URLSearchParams('?' + suffix);
    const urlObj = new URL(url, window.location.origin);
    
    // Remove only the required parameters, preserve other existing params
    for (const [key] of suffixParams) {
      urlObj.searchParams.delete(key);
    }
    
    return urlObj.pathname + (urlObj.search || '');
  }
  
  // Handle path-based suffix (legacy)
  const regex = new RegExp(`/${suffix}`, 'g');
  let cleanUrl = url.replace(regex, '');
  
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  if (cleanUrl === '/') {
    return '/';
  }
  
  return cleanUrl;
};

/**
 * Navigate to offer view of current page
 */
export const navigateToOfferView = () => {
  const suffix = getOfferSuffix();
  
  if (!suffix) {
    return;
  }
  
  if (suffix.startsWith('?')) {
    // Handle query parameter suffix
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const suffixParams = new URLSearchParams(suffix);
    
    // NEW: Add/update required parameters while preserving existing ones
    for (const [key, value] of suffixParams) {
      urlObj.searchParams.set(key, value);
    }
    
    window.history.pushState({}, '', urlObj.toString());
  } else {
    // Handle path-based suffix
    const currentUrl = window.location.pathname;
    const offerUrl = toOfferUrl(currentUrl);
    window.history.pushState({}, '', offerUrl);
  }
  
  // Remove the forced reload - let React handle the URL change
};

/**
 * Navigate to regular view of current page
 */
export const navigateToRegularView = () => {
  const suffix = getOfferSuffix();
  
  if (!suffix) {
    return;
  }
  
  if (suffix.startsWith('?')) {
    // Handle query parameter suffix
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const suffixParams = new URLSearchParams(suffix);
    
    // NEW: Remove only the required parameters, preserve other params
    for (const [key] of suffixParams) {
      urlObj.searchParams.delete(key);
    }
    
    window.history.pushState({}, '', urlObj.pathname + (urlObj.search || ''));
  } else {
    // Handle path-based suffix
    const currentUrl = window.location.pathname;
    const regularUrl = toRegularUrl(currentUrl);
    window.history.pushState({}, '', regularUrl);
  }
  
  // Remove the forced reload - let React handle the URL change
};

/**
 * Get the appropriate link based on current view
 * @param {string} baseUrl - The base URL to convert
 * @returns {string} The appropriate URL for current view context
 */
export const getContextualUrl = (baseUrl) => {
  const isCurrentlyOfferView = isOfferUrl();
  
  if (isCurrentlyOfferView) {
    return toOfferUrl(baseUrl);
  } else {
    return toRegularUrl(baseUrl);
  }
};

/**
 * Advanced URL matcher for sophisticated offer detection
 * @param {string} suffix - The offer suffix to create matcher for
 * @returns {object} Matcher object with various utility methods
 */
export const createAdvancedMatcher = (suffix) => {
  if (!suffix?.startsWith('?')) return null;
  
  const requiredParams = new URLSearchParams(suffix);
  
  return {
    // Check if URL contains all required parameters
    matchesUrl: (url) => {
      try {
        const urlParams = new URLSearchParams(new URL(url, window.location.origin).search);
        
        for (const [key, value] of requiredParams.entries()) {
          if (urlParams.get(key) !== value) {
            return false;
          }
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    
    // Check if current page matches
    matchesCurrentPage: () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      for (const [key, value] of requiredParams.entries()) {
        if (urlParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    },
    
    // Get missing or mismatched parameters
    getMissingParams: (url = window.location.href) => {
      try {
        const urlParams = new URLSearchParams(new URL(url, window.location.origin).search);
        const missing = [];
        
        for (const [key, value] of requiredParams.entries()) {
          const actualValue = urlParams.get(key);
          if (actualValue !== value) {
            missing.push({ 
              key, 
              required: value, 
              actual: actualValue || null,
              status: actualValue ? 'mismatch' : 'missing'
            });
          }
        }
        return missing;
      } catch (error) {
        return [];
      }
    },
    
    // Add required parameters to URL while preserving existing ones
    enhanceUrl: (url) => {
      try {
        const urlObj = new URL(url, window.location.origin);
        
        for (const [key, value] of requiredParams.entries()) {
          urlObj.searchParams.set(key, value);
        }
        
        return urlObj.pathname + urlObj.search;
      } catch (error) {
        return url;
      }
    },
    
    // Remove required parameters from URL while preserving others
    cleanUrl: (url) => {
      try {
        const urlObj = new URL(url, window.location.origin);
        
        for (const [key] of requiredParams.entries()) {
          urlObj.searchParams.delete(key);
        }
        
        return urlObj.pathname + (urlObj.search || '');
      } catch (error) {
        return url;
      }
    },
    
    // Get diagnostic information
    getDiagnostics: (url = window.location.href) => {
      try {
        const urlParams = new URLSearchParams(new URL(url, window.location.origin).search);
        const required = [...requiredParams.entries()];
        const current = [...urlParams.entries()];
        const missing = this.getMissingParams(url);
        
        return {
          isMatch: this.matchesUrl(url),
          requiredParams: required,
          currentParams: current,
          missingParams: missing,
          hasExtraParams: current.length > required.length,
          url: url
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  };
};

/**
 * Get advanced matcher for current offer suffix
 * @returns {object|null} Advanced matcher or null if not applicable
 */
export const getOfferMatcher = () => {
  const suffix = getOfferSuffix();
  return createAdvancedMatcher(suffix);
};

/**
 * Enhanced offer URL detection with detailed information
 * @returns {object} Detailed offer detection result
 */
export const detectOfferUrl = () => {
  const suffix = getOfferSuffix();
  
  if (!suffix) {
    return {
      isOfferUrl: false,
      type: 'no-suffix',
      details: 'No offer suffix configured'
    };
  }
  
  if (suffix.startsWith('?')) {
    const matcher = createAdvancedMatcher(suffix);
    const isMatch = matcher.matchesCurrentPage();
    const diagnostics = matcher.getDiagnostics();
    
    return {
      isOfferUrl: isMatch,
      type: 'query-params',
      details: diagnostics,
      matcher: matcher
    };
  } else {
    const isMatch = window.location.pathname.toLowerCase().includes(`/${suffix}`);
    
    return {
      isOfferUrl: isMatch,
      type: 'path-based',
      details: {
        requiredPath: suffix,
        currentPath: window.location.pathname,
        isMatch: isMatch
      }
    };
  }
};
