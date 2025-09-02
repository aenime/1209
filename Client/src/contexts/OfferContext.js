import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOfferEligibilityOptimized } from '../hooks/useOfferEligibilityOptimized';

/**
 * Global Offer Context with Ultra-Strict Detection
 * Provides ultra-strict offer system data to all components throughout the app
 */
const OfferContext = createContext();

/**
 * Offer Provider Component with Enhanced Security
 * Now uses OPTIMIZED offer eligibility that runs only once on home page
 */
export const OfferProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const offerData = useOfferEligibilityOptimized();

  // Add loading state management to prevent premature COD availability
  useEffect(() => {
    // Set loading to false after offer data is determined
    if (offerData && typeof offerData.isEligibleForOffers === 'boolean' && typeof offerData.isCodAvailable === 'boolean') {
      setIsLoading(false);
    }
  }, [offerData]);

  const contextValue = {
    ...offerData,
    isLoading
  };

  return (
    <OfferContext.Provider value={contextValue}>
      {children}
    </OfferContext.Provider>
  );
};

/**
 * Hook to use ultra-strict offer data in any component
 * @returns {object} Ultra-strict offer eligibility data
 */
export const useOffer = () => {
  const context = useContext(OfferContext);
  
  if (context === undefined) {
    throw new Error('useOffer must be used within an OfferProvider');
  }
  
  return context;
};

/**
 * Higher-order component to inject ultra-strict offer data
 * @param {Component} Component - Component to wrap
 * @returns {Component} Enhanced component with ultra-strict offer props
 */
export const withOffer = (Component) => {
  return function OfferEnhancedComponent(props) {
    const offerData = useOffer();
    
    return <Component {...props} offerData={offerData} />;
  };
};

export default OfferContext;
