/**
 * React Core Import
 */
import React from 'react';

/**
 * Offer Context Hook for Business Logic
 */
import { useOffer } from '../../contexts/OfferContext';

/**
 * URL Utility Functions for Offer Detection and Navigation
 */
import { isOfferUrl, navigateToOfferView, navigateToRegularView, detectOfferUrl, getOfferSuffix } from '../../utils/urlUtils';

/**
 * Device Detection Hook for Responsive Behavior
 */
import useDeviceDetect from '../../hooks/useDeviceDetect';

/**
 * URL Offer Control Component - Interactive Offer URL Management Interface
 * 
 * Comprehensive offer URL testing and control panel:
 * - Real-time offer URL status monitoring
 * - Interactive controls for switching between offer and regular views
 * - Enhanced "contains" matching logic support
 * - Device type awareness for responsive offer behavior
 * - Configuration display for debugging and verification
 * - Live offer eligibility and COD availability tracking
 * 
 * Key Features:
 * - Live URL pattern detection with enhanced matching logic
 * - Interactive navigation controls for offer/regular view switching
 * - Real-time offer eligibility status display
 * - Device type classification with specific behavior rules
 * - Configuration verification and suffix display
 * - COD availability status monitoring
 * - Enhanced logic explanation for debugging
 * 
 * Enhanced Matching Logic:
 * - Query Parameter Matching: URL must contain all required parameters
 * - Additional parameters are allowed and ignored
 * - Path-based matching: Suffix must appear anywhere in URL path
 * - Device-specific behavior: Mobile gets offers, Desktop/Bot don't
 * - No suffix configuration results in non-offer behavior
 * 
 * Interactive Controls:
 * - Add Suffix: Navigates to offer view with required URL patterns
 * - Remove Suffix: Returns to regular view without offer patterns
 * - Intelligent button states based on current URL and configuration
 * - Disabled state handling for invalid operations
 * 
 * Status Information:
 * - Current URL path display
 * - Offer URL detection status (Yes/No)
 * - Detection type (query-params, path-based, none)
 * - Device classification (Mobile, Desktop, Bot)
 * - Offer eligibility status
 * - COD availability status
 * - Enhanced logic explanation
 * 
 * Configuration Display:
 * - Current suffix configuration
 * - Pattern type identification
 * - Extra parameters allowance for query-based patterns
 * - No configuration warning messages
 * 
 * Usage:
 * - Development tool for testing offer URL patterns
 * - Quick switching between offer and regular views
 * - Verification of offer eligibility rules
 * - Debugging URL pattern matching logic
 */
const UrlOfferControl = () => {
  /**
   * Offer Context State
   * 
   * Provides offer-related business logic:
   * - isEligibleForOffers: Current offer eligibility status
   * - isCodAvailable: Cash on delivery availability
   */
  const { isEligibleForOffers, isCodAvailable } = useOffer();

  /**
   * Device Detection State
   * 
   * Provides device type information:
   * - isMobile: Mobile device detection
   * - isBot: Bot/crawler detection
   */
  const { isMobile, isBot } = useDeviceDetect();
  
  // Current URL and offer detection information
  const currentUrl = window.location.pathname;
  const isCurrentlyOfferUrl = isOfferUrl();
  const offerDetection = detectOfferUrl();
  const suffix = getOfferSuffix();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-xs">
      <div className="text-sm space-y-2">
        {/* Panel Header */}
        <div className="font-semibold text-gray-800">
          🔗 Enhanced URL Offer Control
        </div>
        
        {/* Status Information Display */}
        <div className="space-y-1 text-xs">
          {/* Current URL Path */}
          <div>
            Current URL: <span className="font-mono text-blue-600 break-all">{currentUrl}</span>
          </div>
          
          {/* Offer URL Detection Status */}
          <div>
            Is Offer URL: <span className={isCurrentlyOfferUrl ? 'text-green-600' : 'text-red-600'}>
              {isCurrentlyOfferUrl ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          {/* Detection Type Classification */}
          <div>
            Detection Type: <span className="text-purple-600 font-mono">
              {offerDetection.type}
            </span>
          </div>
          
          {/* Device Type Classification */}
          <div>
            Device: <span className="text-gray-600">
              {isBot ? 'Bot' : isMobile ? 'Mobile' : 'Desktop'}
            </span>
          </div>
          
          {/* Offer Eligibility Status */}
          <div>
            Showing Offers: <span className={isEligibleForOffers ? 'text-green-600' : 'text-red-600'}>
              {isEligibleForOffers ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          {/* COD Availability Status */}
          <div>
            COD Available: <span className={isCodAvailable ? 'text-green-600' : 'text-red-600'}>
              {isCodAvailable ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          {/* Enhanced Logic Explanation */}
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div className="font-semibold mb-1">Enhanced Logic:</div>
            <div>
              {!suffix ? (
                <span className="text-gray-600">No Suffix Configured</span>
              ) : !isCurrentlyOfferUrl ? (
                <span className="text-blue-600">No Suffix → Always Non-Offer</span>
              ) : (
                <span className="text-green-600">
                  Contains Matching → {isBot ? 'Bot (Non-Offer)' : isMobile ? 'Mobile (Offer)' : 'Desktop (Non-Offer)'}
                </span>
              )}
            </div>
            
            {/* Extra Parameters Information for Query-based Patterns */}
            {suffix?.startsWith('?') && offerDetection.details?.hasExtraParams && (
              <div className="mt-1 text-blue-600">
                ✨ Extra parameters allowed
              </div>
            )}
          </div>
          
          {/* Configuration Information Display */}
          {suffix && (
            <div className="border-t pt-2">
              <div className="text-xs">
                <div className="font-semibold mb-1">Current Suffix:</div>
                <div className="font-mono bg-yellow-50 p-1 rounded break-all">
                  {suffix}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Interactive Control Buttons */}
        <div className="flex gap-2 mt-3">
          {/* Add Suffix Button - Navigate to Offer View */}
          <button
            onClick={navigateToOfferView}
            disabled={isCurrentlyOfferUrl || !suffix}
            className={`px-3 py-1 text-xs rounded ${
              isCurrentlyOfferUrl || !suffix
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Add Suffix
          </button>
          
          {/* Remove Suffix Button - Navigate to Regular View */}
          <button
            onClick={navigateToRegularView}
            disabled={!isCurrentlyOfferUrl || !suffix}
            className={`px-3 py-1 text-xs rounded ${
              !isCurrentlyOfferUrl || !suffix
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Remove Suffix
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlOfferControl;
