import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOffer } from '../contexts/OfferContext';

/**
 * Custom hook for managing dynamic page titles
 * Creates titles in format: "O hostname - PageName" for offer users or "N hostname - PageName" for non-offer users
 * Always enabled - no environment variable dependency
 */
const useDynamicTitle = (customPageName = null) => {
  const routerLocation = useLocation();
  const { isEligibleForOffers } = useOffer();

  useEffect(() => {
    const updateTitle = () => {
      // Get hostname
      const hostname = window.location.hostname;
      
      // Determine page name
      let pageName = customPageName;
      
      if (!pageName) {
        // Auto-generate page name from route
        const path = routerLocation.pathname;
        
        if (path === '/') {
          pageName = 'Home';
        } else if (path.startsWith('/single-product/')) {
          pageName = 'Product';
        } else if (path.startsWith('/category/')) {
          pageName = 'Category';
        } else if (path === '/cart') {
          pageName = 'Shopping Cart';
        } else if (path === '/checkout/address') {
          pageName = 'Checkout';
        } else if (path === '/checkout/payment') {
          pageName = 'Payment';
        } else if (path === '/wishlist') {
          pageName = 'Wishlist';
        } else if (path === '/ThankYou') {
          pageName = 'Thank You';
        } else if (path === '/contact-us') {
          pageName = 'Contact Us';
        } else if (path === '/about-us') {
          pageName = 'About Us';
        } else if (path === '/faqs') {
          pageName = 'FAQ';
        } else if (path === '/order-tracking') {
          pageName = 'Order Tracking';
        } else if (path === '/profile') {
          pageName = 'My Account';
        } else if (path === '/privacypolicy') {
          pageName = 'Privacy Policy';
        } else if (path === '/termsofservice') {
          pageName = 'Terms of Service';
        } else if (path === '/refund-policy') {
          pageName = 'Return Policy';
        } else if (path === '/shippingpolicy') {
          pageName = 'Shipping Policy';
        } else {
          // Convert path to readable name
          pageName = path
            .replace(/^\//, '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase()) || 'Page';
        }
      }

      // Fixed title template: "{PREFIX} {HOST} - {PAGE}" with offer-based prefix
      const offerPrefix = isEligibleForOffers ? 'O' : 'N';
      const title = `${offerPrefix} ${hostname} - ${pageName}`;

      document.title = title;
    };

    updateTitle();
  }, [routerLocation.pathname, customPageName, isEligibleForOffers]);

  // Return function to manually update title with offer prefix
  const setCustomTitle = (title) => {
    const offerPrefix = isEligibleForOffers ? 'O' : 'N';
    document.title = `${offerPrefix} ${title}`;
  };

  return { setCustomTitle };
};

export default useDynamicTitle;
