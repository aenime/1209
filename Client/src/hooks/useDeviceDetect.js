import { useEffect, useState } from 'react';
import { getDetectionMode, getOfferUrlSuffix } from '../utils/envConfig';
import envConfig from '../utils/envConfig';

/**
 * Custom hook for detecting device type and bot status
 * Detects mobile devices (Android/iOS) and bot/crawler traffic
 */
export default function useDeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isBot: false,
    isDesktop: false,
    userAgent: '',
    deviceType: 'unknown'
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Bot detection patterns
      const botPatterns = [
        /bot/i,
        /crawl/i,
        /spider/i,
        /googlebot/i,
        /bingbot/i,
        /slurp/i,
        /duckduckbot/i,
        /baiduspider/i,
        /yandexbot/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /linkedinbot/i,
        /whatsapp/i,
        /phantom/i,
        /headless/i,
        /selenium/i,
        /webdriver/i,
        /puppeteer/i,
        /playwright/i
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
      
      setDeviceInfo({
        isMobile,
        isAndroid,
        isIOS,
        isBot,
        isDesktop,
        userAgent,
        deviceType
      });
    };

    // Re-detect on user agent changes (rare but possible)
    detectDevice();
    
    // Listen for potential user agent changes
    window.addEventListener('resize', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return deviceInfo;
}

/**
 * Simplified Offer Control System
 * New straightforward logic flow:
 * Step 1: URL Suffix Check → Step 2/3: Query/Detection → Step 4: Device Type
 */
export function useOfferEligibility() {
  const deviceInfo = useDeviceDetect();
  const [isOfferEligible, setIsOfferEligible] = useState(null);
  const [isCodAvailable, setIsCodAvailable] = useState(null);

  useEffect(() => {
    const determineEligibility = async () => {
      // Ensure env config is loaded first
      try {
        await envConfig.ensureLoaded();
      } catch (error) {
      }
      
      // Get configuration values
      const offerSuffix = getOfferUrlSuffix(); // URL suffix from config
      const detectionMode = getDetectionMode(); // Detection mode (0,1,2,3)
      
        offerSuffix,
        detectionMode,
        currentURL: window.location.href,
        currentSearch: window.location.search,
        envConfigLoaded: envConfig.isDynamicLoaded()
      });
      
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
          const urlParams = new URLSearchParams(window.location.search);
          const suffixParams = new URLSearchParams(offerSuffix);
          
          
          queryMatch = true;
          for (const [key, value] of suffixParams) {
            const urlValue = urlParams.get(key);
            if (!urlValue || urlValue !== value) {
              queryMatch = false;
              break;
            } else {
            }
          }
          
          if (queryMatch) {
          }
        }
        // For any other suffix value, treat as always matching for now
        // (You can add custom logic here if needed for other suffix types)
        else {
          queryMatch = true;
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
      
        isOfferEligible: eligible,
        isCodAvailable: codAvailable,
        flow: 'URL Suffix → Query Check → Detection Mode → Device Type'
      });
      
      // Set final results
      setIsOfferEligible(eligible);
      setIsCodAvailable(codAvailable);
      
    };
    
    // ═══════════════════════════════════════════════════════
    // STEP 4: AC (Device Type Check)
    // ═══════════════════════════════════════════════════════
    const checkDeviceType = (deviceInfo, detectionMode) => {
        isMobile: deviceInfo.isMobile,
        isBot: deviceInfo.isBot,
        userAgent: navigator.userAgent,
        detectionMode
      });
      
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
    
    // Run when device info is available
    if (deviceInfo.isMobile !== undefined && deviceInfo.isBot !== undefined) {
      determineEligibility(); // Now this is async
    } else {
    }
  }, [deviceInfo]);

  return {
    ...deviceInfo,
    isOfferEligible: isOfferEligible !== null ? isOfferEligible : false,
    isEligibleForOffers: isOfferEligible !== null ? isOfferEligible : false,
    showOffer: isOfferEligible !== null ? isOfferEligible : false,
    isCodAvailable: isCodAvailable !== null ? isCodAvailable : false
  };
}
