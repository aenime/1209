import { useEffect, useState } from 'react';
import { getDetectionMode, getOfferUrlSuffix } from '../utils/envConfig';
import envConfig from '../utils/envConfig';
import StorageService from '../services/storageService';

/**
 * OPTIMIZED Offer Eligibility Hook
 * - Runs offer determination ONLY ONCE on home page
 * - Stores result in localStorage for all other pages
 * - Prevents repeated expensive calculations
 * - WAITS for env config to be cached before running
 */

// LocalStorage keys
const OFFER_ELIGIBILITY_KEY = 'offerEligibilityResult';
const OFFER_ELIGIBILITY_TIMESTAMP_KEY = 'offerEligibilityTimestamp';
const OFFER_SESSION_ID_KEY = 'offerSessionId';
const PERMANENT_OFFER_FLAG_KEY = 'permanentOfferEligible'; // NEW: Permanent offer flag

// Cache duration (24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Check if we're on the home page
 */
const isHomePage = () => {
  return window.location.pathname === '/' || window.location.pathname === '/home';
};

/**
 * Check if user has permanent offer eligibility (never expires)
 */
const isPermanentOfferEligible = () => {
  try {
    const permanentFlag = StorageService.getItem(PERMANENT_OFFER_FLAG_KEY);
    return permanentFlag === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Set permanent offer eligibility (never expires)
 */
const setPermanentOfferEligible = () => {
  try {
    StorageService.setItem(PERMANENT_OFFER_FLAG_KEY, 'true');
    // Permanent offer eligibility logging removed for cleaner console output
  } catch (error) {
  }
};

/**
 * Get cached offer eligibility result
 */
const getCachedResult = () => {
  try {
    // 🔒 FIRST: Check if user has permanent offer eligibility
    if (isPermanentOfferEligible()) {
      // Return permanent offer-eligible result
      const permanentResult = {
        ...detectDevice(),
        isOfferEligible: true,
        isEligibleForOffers: true,
        showOffer: true,
        isCodAvailable: false,
        determinedAt: new Date().toISOString(),
        determinedOn: 'permanent-offer-flag',
        isPermanent: true,
        configSnapshot: {
          note: 'Permanent offer eligibility - user always sees offer view'
        }
      };
      return permanentResult;
    }
    // 📋 SECOND: Check regular cache (with expiration)
    const cachedResult = StorageService.getItem(OFFER_ELIGIBILITY_KEY);
    const cachedTimestamp = StorageService.getItem(OFFER_ELIGIBILITY_TIMESTAMP_KEY);
    const sessionId = StorageService.getItem(OFFER_SESSION_ID_KEY);
    if (cachedResult && cachedTimestamp && sessionId) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      // Check if cache is still valid (within 24 hours)
      if (now - timestamp < CACHE_DURATION) {
        const result = JSON.parse(cachedResult);
        return result;
      } else {
        // Clear expired cache
        StorageService.removeItem(OFFER_ELIGIBILITY_KEY);
        StorageService.removeItem(OFFER_ELIGIBILITY_TIMESTAMP_KEY);
        StorageService.removeItem(OFFER_SESSION_ID_KEY);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Store offer eligibility result in localStorage
 */
const storeResult = (result) => {
  try {
    const sessionId = generateSessionId();
    const timestamp = Date.now();
    // 🔒 CRITICAL: If user is eligible for offers, set permanent flag
    if (result.isOfferEligible || result.isEligibleForOffers || result.showOffer) {
      setPermanentOfferEligible();
      // Permanent offer eligibility logging removed for cleaner console output
    }
    StorageService.setItem(OFFER_ELIGIBILITY_KEY, JSON.stringify(result));
    StorageService.setItem(OFFER_ELIGIBILITY_TIMESTAMP_KEY, timestamp.toString());
    StorageService.setItem(OFFER_SESSION_ID_KEY, sessionId);
    // Offer eligibility result storage logging removed for cleaner console output
  } catch (error) {
  }
};

/**
 * Device detection (lightweight version)
 */
const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Bot detection patterns
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /googlebot/i, /bingbot/i, /slurp/i,
    /duckduckbot/i, /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
    /twitterbot/i, /linkedinbot/i, /whatsapp/i, /phantom/i, /headless/i,
    /selenium/i, /webdriver/i, /puppeteer/i, /playwright/i
  ];
  
  // Check for bot patterns
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  // Mobile device detection
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMobile = isAndroid || isIOS;
  const isDesktop = !isMobile;
  
  // Determine device type
  let deviceType = 'unknown';
  if (isBot) {
    deviceType = 'bot';
  } else if (isAndroid) {
    deviceType = 'android';
  } else if (isIOS) {
    deviceType = 'ios';
  } else if (isDesktop) {
    deviceType = 'desktop';
  }
  
  return {
    isMobile,
    isAndroid,
    isIOS,
    isBot,
    isDesktop,
    userAgent,
    deviceType
  };
};

/**
 * Perform offer eligibility determination (ONLY on home page)
 * Now includes env config validation
 */
const performOfferDetermination = () => {
  // Offer eligibility determination for production
  
  const deviceInfo = detectDevice();
  
  // Verify env config is loaded before getting values
  const isEnvLoaded = envConfig.isDynamicLoaded();
  
  if (!isEnvLoaded) {
    // Try to load cached config at least
  envConfig.getAll();
  }
  
  // Get configuration values
  const offerSuffix = getOfferUrlSuffix();
  const detectionMode = getDetectionMode();
  
  let eligible = false;
  let codAvailable = false;
  
  // ═══════════════════════════════════════════════════════
  // STEP 1: URL Suffix Check
  // ═══════════════════════════════════════════════════════
  
  // Case: URL Suffix = EMPTY/Null → NON OFFER-VIEW
  if (!offerSuffix || offerSuffix.trim() === '') {
    eligible = false;
    codAvailable = true;
  }
  // Case: URL Suffix = "off" → Step 3 (AB)
  else if (offerSuffix.trim().toLowerCase() === 'off') {
    // ═══════════════════════════════════════════════════════
    // STEP 3: AB (Detection Mode Check)
    // ═══════════════════════════════════════════════════════
    
    // Detection Mode = 0 or empty → OFFER-VIEW
    if (!detectionMode || detectionMode === '0' || detectionMode === 0) {
      eligible = true;
      codAvailable = false;
    }
    // Detection Mode = 1/2/3 → Step 4 (Check AC)
    else {
      const result = checkDeviceType(deviceInfo, detectionMode);
      eligible = result.eligible;
      codAvailable = result.codAvailable;
    }
  }
  // Case: URL Suffix = Query OR Any other value → Step 2 (AA)
  else {
    // ═══════════════════════════════════════════════════════
    // STEP 2: AA (Query Validation)
    // ═══════════════════════════════════════════════════════
    
    let queryMatch = false;
    
    // Check if it's a query-based suffix
    if (offerSuffix.startsWith('?')) {
      // Enhanced query-based suffix processing with contains matching
      const urlParams = new URLSearchParams(window.location.search);
      const suffixParams = new URLSearchParams(offerSuffix);
      
      // NEW: Contains matching - check if URL contains all required parameters
      queryMatch = true;
      for (const [key, value] of suffixParams) {
        const urlValue = urlParams.get(key);
        // Enhanced parameter matching - allows additional parameters
        if (!urlValue || urlValue !== value) {
          queryMatch = false;
          break;
        }
      }
    }
    // Check if it's a query-based suffix without ? prefix (COMMON CONFIGURATION ERROR)
    else if (offerSuffix.includes('=') && (offerSuffix.includes('&') || offerSuffix.split('=').length === 2)) {
      // Auto-fix: Treat as query-based suffix by adding the missing ?
      const urlParams = new URLSearchParams(window.location.search);
      const suffixParams = new URLSearchParams('?' + offerSuffix);
      
      // Enhanced query matching with auto-fix
      queryMatch = true;
      for (const [key, value] of suffixParams) {
        const urlValue = urlParams.get(key);
        if (!urlValue || urlValue !== value) {
          queryMatch = false;
          break;
        }
      }
    }
    // For any other suffix value, treat as legacy path-based suffix
    else {
      const path = window.location.pathname.toLowerCase();
      queryMatch = path.includes(`/${offerSuffix}`);
    }
    
    // Query NOT MATCH → NON OFFER-VIEW
    if (!queryMatch) {
      eligible = false;
      codAvailable = true;
    }
    // Query MATCH → Step 3 (AB - Detection Mode Check)
    else {
      // ═══════════════════════════════════════════════════════
      // STEP 3: AB (Detection Mode Check)
      // ═══════════════════════════════════════════════════════
      
      // Detection Mode = 0 or empty → OFFER-VIEW
      if (!detectionMode || detectionMode === '0' || detectionMode === 0) {
        eligible = true;
        codAvailable = false;
      }
      // Detection Mode = 1/2/3 → Step 4 (Check AC)
      else {
        const result = checkDeviceType(deviceInfo, detectionMode);
        eligible = result.eligible;
        codAvailable = result.codAvailable;
      }
    }
  }
  
  const finalResult = {
    ...deviceInfo,
    isOfferEligible: eligible,
    isEligibleForOffers: eligible,
    showOffer: eligible,
    isCodAvailable: codAvailable,
    determinedAt: new Date().toISOString(),
    determinedOn: 'home-page',
    configSnapshot: {
      offerSuffix,
      detectionMode,
      url: window.location.href
    }
  };
  
  return finalResult;
};

/**
 * Device type check helper
 */
const checkDeviceType = (deviceInfo, detectionMode) => {
  // Device = BOT → NON OFFER-VIEW
  if (deviceInfo.isBot) {
    return { eligible: false, codAvailable: true };
  }
  // Device = Mobile → OFFER-VIEW
  else if (deviceInfo.isMobile) {
    return { eligible: true, codAvailable: false };
  }
  // Device ≠ Mobile → NON OFFER-VIEW
  else {
    return { eligible: false, codAvailable: true };
  }
};

/**
 * OPTIMIZED Hook: useOfferEligibilityOptimized
 * - Runs determination ONLY on home page
 * - Uses cached results on all other pages
 * - Automatic cache management with 24-hour expiry
 */
export function useOfferEligibilityOptimized() {
  const [offerData, setOfferData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('unknown');

  useEffect(() => {
    const initializeOfferEligibility = async () => {
      // Optimized offer eligibility initialization logging removed for cleaner console output
      
      // STEP 1: Ensure env config is loaded and cached first
      // Step 1 logging removed
      
      try {
        await envConfig.ensureLoaded();
        // Env config loaded logging removed
        
        // Get config values to verify they're available
  // getDetectionMode();
  // getOfferUrlSuffix();
        // Config values loaded logging removed
        
      } catch (error) {
      }
      
      const onHomePage = isHomePage();
      // Current page logging removed
      
      // Check if there's a valid cached result first
      const cachedResult = getCachedResult();
      if (cachedResult) {
        setOfferData(cachedResult);
        setSource(cachedResult.isPermanent ? 'permanent-flag' : 'cache');
        setIsLoading(false);
        return;
      }
      
      // For home page specifically
      if (onHomePage) {
        const freshCachedResult = getCachedResult();
        if (freshCachedResult) {
          // Home page cached result usage logging removed for cleaner console output
          
          setOfferData(freshCachedResult);
          setSource(freshCachedResult.isPermanent ? 'permanent-flag-home' : 'cache-home');
          setIsLoading(false);
          return;
        }
        
        // HOME PAGE: Perform fresh offer determination
        // Home page fresh determination logging removed for cleaner console output
        
        // Small delay to ensure env config is fully processed
        setTimeout(() => {
          const result = performOfferDetermination();
          storeResult(result);
          setOfferData(result);
          setSource('fresh-calculation');
          setIsLoading(false);
        }, 200); // Increased delay to ensure env config is ready
        return;
      }
      
      if (cachedResult && onHomePage) {
        // On home page with valid cache, still use cache but mark for potential refresh
        // Home page cache usage logging removed for cleaner console output
        setOfferData(cachedResult);
        setSource('cache-home');
        setIsLoading(false);
        return;
      }
      
      // NON-HOME PAGE without cache: Use default safe values
      // Non-home page defaults logging removed for cleaner console output
      const defaultResult = {
        ...detectDevice(),
        isOfferEligible: false,
        isEligibleForOffers: false,
        showOffer: false,
        isCodAvailable: true,
        determinedAt: new Date().toISOString(),
        determinedOn: 'non-home-page-default',
        configSnapshot: {
          note: 'Default values used - no cache available and not on home page'
        }
      };
      
      setOfferData(defaultResult);
      setSource('default');
      setIsLoading(false);
      
    };

    initializeOfferEligibility();
  }, []); // Run only once on mount

  // Provide debugging information
  const debugInfo = {
    source,
    isHomePage: isHomePage(),
    currentPath: window.location.pathname,
    cacheStatus: getCachedResult() ? 'available' : 'not-available',
    lastDetermined: offerData?.determinedAt || 'never'
  };

  return {
    ...offerData,
    isLoading,
    debugInfo
  };
}

/**
 * Legacy compatibility hook - uses optimized version
 */
export function useOfferEligibility() {
  return useOfferEligibilityOptimized();
}

/**
 * Force refresh offer eligibility (useful for testing)
 */
export const forceRefreshOfferEligibility = () => {
  // Force refresh logging removed for cleaner console output
  StorageService.removeItem(OFFER_ELIGIBILITY_KEY);
  StorageService.removeItem(OFFER_ELIGIBILITY_TIMESTAMP_KEY);
  StorageService.removeItem(OFFER_SESSION_ID_KEY);
  // NOTE: We DON'T remove PERMANENT_OFFER_FLAG_KEY to preserve permanent eligibility
  // Permanent offer flag preservation logging removed for cleaner console output
  window.location.reload();
};

/**
 * DANGEROUS: Clear ALL offer eligibility data including permanent flag
 */
export const clearAllOfferEligibilityData = () => {
  // Complete reset warning logging removed for cleaner console output
  StorageService.removeItem(OFFER_ELIGIBILITY_KEY);
  StorageService.removeItem(OFFER_ELIGIBILITY_TIMESTAMP_KEY);
  StorageService.removeItem(OFFER_SESSION_ID_KEY);
  StorageService.removeItem(PERMANENT_OFFER_FLAG_KEY); // This clears permanent eligibility
  // All data cleared logging removed for cleaner console output
  window.location.reload();
};

/**
 * Get current cache status (useful for debugging)
 */
export const getOfferEligibilityCacheStatus = () => {
  const cachedResult = StorageService.getItem(OFFER_ELIGIBILITY_KEY);
  const cachedTimestamp = StorageService.getItem(OFFER_ELIGIBILITY_TIMESTAMP_KEY);
  const sessionId = StorageService.getItem(OFFER_SESSION_ID_KEY);
  const permanentFlag = StorageService.getItem(PERMANENT_OFFER_FLAG_KEY);
  const isPermanent = permanentFlag === 'true';
  if (cachedResult && cachedTimestamp && sessionId) {
    const timestamp = parseInt(cachedTimestamp, 10);
    const now = Date.now();
    const isValid = now - timestamp < CACHE_DURATION;
    return {
      hasCachedResult: true,
      isValid,
      result: JSON.parse(cachedResult),
      sessionId,
      cachedAt: new Date(timestamp).toLocaleString(),
      expiresIn: Math.round((CACHE_DURATION - (now - timestamp)) / (1000 * 60 * 60)) + ' hours',
      isPermanentOfferEligible: isPermanent,
      permanentNote: isPermanent ? 'User has permanent offer eligibility - will always see offer view' : 'No permanent eligibility set'
    };
  }
  return {
    hasCachedResult: false,
    isValid: false,
    result: null,
    sessionId: null,
    cachedAt: null,
    expiresIn: null,
    isPermanentOfferEligible: isPermanent,
    permanentNote: isPermanent ? 'User has permanent offer eligibility - will always see offer view' : 'No permanent eligibility set'
  };
};

// Global debugging functions
if (typeof window !== 'undefined') {
  window.forceRefreshOfferEligibility = forceRefreshOfferEligibility;
  window.clearAllOfferEligibilityData = clearAllOfferEligibilityData;
  window.getOfferEligibilityCacheStatus = getOfferEligibilityCacheStatus;
  window.isPermanentOfferEligible = isPermanentOfferEligible;
  window.checkOfferCache = () => {
    const status = getOfferEligibilityCacheStatus();
    if (status.isPermanentOfferEligible) {
    }
    return status;
  };
}

export default useOfferEligibilityOptimized;
