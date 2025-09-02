/**
 * COMPREHENSIVE TRACKING DIAGNOSTICS
 * Diagnoses why Google Analytics, Google Ads, and Facebook Pixel events might not be firing
 */

import envConfig from './envConfig';

/**
 * Comprehensive tracking diagnostic tool
 * Checks all possible reasons why events might not fire
 */
export const diagnoseTrackingIssues = () => {
  
  const issues = [];
  const warnings = [];
  const successes = [];
  
  // 1. Check Environment Configuration
  
  let g4Id, awId, fbPixelId, purchaseTag;
  
  try {
    g4Id = envConfig.get('REACT_APP_G4');
    awId = envConfig.get('REACT_APP_AW');
    fbPixelId = envConfig.get('REACT_APP_FBPIXEL');
    purchaseTag = envConfig.get('REACT_APP_AW_CONVERSION_ID');
    
    
    // Validate Google Analytics 4 ID
    const validG4Id = g4Id && 
                     g4Id !== 'one@one' && 
                     g4Id !== 'G-XXXXXXXXXX' && 
                     g4Id !== 'Not configured' &&
                     g4Id.length > 5 &&
                     g4Id.startsWith('G-');
    
    if (validG4Id) {
      successes.push('✅ Google Analytics 4 ID is valid');
    } else {
      issues.push(`❌ Google Analytics 4 ID is invalid: "${g4Id}"`);
    }
    
    // Validate Google Ads ID
    const validAwId = awId && 
                     awId !== 'aw 798798' && 
                     awId !== 'AW-XXXXXXXXX' && 
                     awId !== 'Not configured' &&
                     awId.length > 5 &&
                     awId.startsWith('AW-');
    
    if (validAwId) {
      successes.push('✅ Google Ads ID is valid');
      
      // Check purchase tag for conversions
      if (purchaseTag && purchaseTag.length > 0) {
        successes.push('✅ Google Ads purchase tag is configured');
      } else {
        warnings.push('⚠️ Google Ads purchase tag is missing - conversions will not track');
      }
    } else {
      issues.push(`❌ Google Ads ID is invalid: "${awId}"`);
    }
    
    // Validate Facebook Pixel ID
    const validFbPixelId = fbPixelId && 
                          fbPixelId !== '8098098090980' && 
                          fbPixelId !== 'XXXXXXXXXXXXXXXXX' &&
                          fbPixelId !== 'Not configured' &&
                          fbPixelId.length > 5;
    
    if (validFbPixelId) {
      successes.push('✅ Facebook Pixel ID is valid');
    } else {
      issues.push(`❌ Facebook Pixel ID is invalid: "${fbPixelId}"`);
    }
    
  } catch (error) {
    issues.push(`❌ Failed to retrieve environment configuration: ${error.message}`);
  }
  
  // 2. Check Script Loading
  
  // Check Google Tag Manager script
  const gtagScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (gtagScript) {
    successes.push('✅ Google tracking script is loaded');
  } else {
    issues.push('❌ Google tracking script is not loaded');
  }
  
  // Check Facebook Pixel script
  const fbScript = document.querySelector('script[src*="connect.facebook.net"]') || 
                  document.querySelector('script').textContent?.includes('fbq');
  if (fbScript) {
    successes.push('✅ Facebook Pixel script is loaded');
  } else {
    issues.push('❌ Facebook Pixel script is not loaded');
  }
  
  // 3. Check Global Objects
  
  if (typeof window.gtag === 'function') {
    successes.push('✅ window.gtag function is available');
  } else {
    issues.push('❌ window.gtag function is not available');
  }
  
  if (typeof window.fbq === 'function') {
    successes.push('✅ window.fbq function is available');
  } else {
    issues.push('❌ window.fbq function is not available');
  }
  
  if (Array.isArray(window.dataLayer)) {
    successes.push('✅ window.dataLayer is initialized');
  } else {
    issues.push('❌ window.dataLayer is not initialized');
  }
  
  // 4. Check Network Connectivity
  
  // This is a basic check - in production you might want more sophisticated testing
  if (navigator.onLine) {
    successes.push('✅ Browser reports online status');
  } else {
    issues.push('❌ Browser reports offline status');
  }
  
  // 5. Check Ad Blockers
  
  // Simple ad blocker detection
  const testElement = document.createElement('div');
  testElement.innerHTML = '&nbsp;';
  testElement.className = 'adsbox';
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  setTimeout(() => {
    if (testElement.offsetHeight === 0) {
      warnings.push('⚠️ Possible ad blocker detected - may block tracking');
    } else {
      successes.push('✅ No ad blocker detected');
    }
    document.body.removeChild(testElement);
  }, 100);
  
  // 6. Check Consent & Privacy
  
  // Check for common consent management platforms
  const consentSignals = [
    () => window.__tcfapi,
    () => window.gtag_enable_tcf_support,
    () => window.gaplugins,
    () => localStorage.getItem('cookieConsent'),
    () => localStorage.getItem('gdpr_consent')
  ];
  
  consentSignals.forEach((signalCheck, index) => {
    const signalNames = ['__tcfapi', 'gtag_enable_tcf_support', 'gaplugins', 'cookieConsent', 'gdpr_consent'];
    try {
      const hasSignal = signalCheck();
      if (hasSignal) {
        warnings.push(`⚠️ Consent signal detected: ${signalNames[index]} - may affect tracking`);
      }
    } catch (e) {
      // Signal doesn't exist, which is fine
    }
  });
  
  // 7. Browser Compatibility
  
  const userAgent = navigator.userAgent.toLowerCase();
  const unsupportedBrowsers = [
    { pattern: /msie/i, name: 'Internet Explorer' },
    { pattern: /edge\/12\./i, name: 'Edge Legacy' }
  ];
  
  unsupportedBrowsers.forEach(browser => {
    if (browser.pattern.test(userAgent)) {
      warnings.push(`⚠️ Unsupported browser detected: ${browser.name}`);
    }
  });
  
  successes.push(`✅ Browser: ${navigator.userAgent}`);
  
  // 8. Summary Report
  
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    issues: issues,
    warnings: warnings,
    successes: successes,
    configuration: {
      g4Id,
      awId,
      fbPixelId,
      purchaseTag
    },
    scriptStatus: {
      gtagLoaded: !!gtagScript,
      fbPixelLoaded: !!fbScript,
      gtagFunction: typeof window.gtag === 'function',
      fbqFunction: typeof window.fbq === 'function',
      dataLayer: Array.isArray(window.dataLayer)
    }
  };
  
  // Display Results
  
  if (issues.length > 0) {
  }
  
  if (warnings.length > 0) {
  }
  
  if (successes.length > 0) {
  }
  
  // Provide specific recommendations
  
  if (issues.length === 0) {
  } else {
  }
  
  if (warnings.length > 0) {
  }
  
  
  
  return report;
};

/**
 * Quick test to verify if events are actually firing
 */
export const testEventFiring = () => {
  
  const testResults = {
    googleAnalytics: false,
    googleAds: false,
    facebookPixel: false,
    errors: []
  };
  
  // Test Google Analytics
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'test_event', {
        event_category: 'diagnostics',
        event_label: 'tracking_test',
        value: 1
      });
      testResults.googleAnalytics = true;
    } catch (error) {
      testResults.errors.push(`Google Analytics: ${error.message}`);
    }
  } else {
    testResults.errors.push('Google Analytics: gtag function not available');
  }
  
  // Test Facebook Pixel
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'Lead', {
        content_name: 'diagnostics_test',
        value: 1,
        currency: 'USD'
      });
      testResults.facebookPixel = true;
    } catch (error) {
      testResults.errors.push(`Facebook Pixel: ${error.message}`);
    }
  } else {
    testResults.errors.push('Facebook Pixel: fbq function not available');
  }
  
  
  return testResults;
};

/**
 * Monitor events in real-time (for advanced debugging)
 */
export const startEventMonitoring = () => {
  
  // Monitor dataLayer pushes
  const originalDataLayerPush = window.dataLayer?.push;
  if (originalDataLayerPush) {
    window.dataLayer.push = function(...args) {
      return originalDataLayerPush.apply(this, args);
    };
  }
  
  // Monitor gtag calls
  const originalGtag = window.gtag;
  if (originalGtag) {
    window.gtag = function(...args) {
      return originalGtag.apply(this, args);
    };
  }
  
  // Monitor Facebook Pixel calls
  const originalFbq = window.fbq;
  if (originalFbq) {
    window.fbq = function(...args) {
      return originalFbq.apply(this, args);
    };
  }
  
  
  return {
    stop: () => {
      if (originalDataLayerPush) window.dataLayer.push = originalDataLayerPush;
      if (originalGtag) window.gtag = originalGtag;
      if (originalFbq) window.fbq = originalFbq;
    }
  };
};

// Global access for debugging
if (typeof window !== 'undefined') {
  window.diagnoseTrackingIssues = diagnoseTrackingIssues;
  window.testEventFiring = testEventFiring;
  window.startEventMonitoring = startEventMonitoring;
  
  // Tracking diagnostics logging removed for cleaner console output
}

const trackingDiagnostics = {
  diagnoseTrackingIssues,
  testEventFiring,
  startEventMonitoring
};

export default trackingDiagnostics;
