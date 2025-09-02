// Google Ads Manager
// Handles Google Ads conversion tracking and remarketing

import envConfig from '../envConfig';

class GoogleAdsManager {
  constructor() {
    this.ready = false;
    this.configured = false;
    this.trackingId = null;
    this.conversionId = null;
  }

  async initialize() {
    if (!envConfig || typeof envConfig.get !== 'function') {
      return;
    }
    
    const awId = envConfig.get('REACT_APP_AW');
    const awConversionId = envConfig.get('REACT_APP_AW_CONVERSION_ID');

    // Check for valid tracking ID (not placeholder values)
    const validAwId = awId && 
                     awId !== 'aw 798798' && 
                     awId !== 'AW-XXXXXXXXX' && 
                     awId !== 'Not configured' &&
                     awId.startsWith('AW-') &&
                     awId.length > 5;

    if (!validAwId) {
      return;
    }

    this.trackingId = awId;
    this.conversionId = awConversionId;

    return new Promise((resolve) => {
      try {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function() {
          window.dataLayer.push(arguments);
        };

        // Check if script already exists
        let script = document.querySelector(`script[src*="gtag/js?id=${awId}"]`);
        
        if (!script) {
          script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${awId}`;
          document.head.appendChild(script);
        }
        
        let scriptLoaded = false;
        let detectionInterval;
        
        // Function to detect and configure Google Ads
        const detectAndConfigureAW = () => {
          if (scriptLoaded) return;
          
          if (typeof window.gtag !== 'undefined') {
            scriptLoaded = true;
            clearInterval(detectionInterval);
            
            try {
              window.gtag('js', new Date());
              window.gtag('config', awId, {
                send_page_view: false
              });
              
              this.ready = true;
              this.configured = true;
              resolve();
            } catch (configError) {
              resolve();
            }
          }
        };
        
        script.onload = () => {
          detectAndConfigureAW();
        };
        
        script.onerror = () => {
          if (scriptLoaded) return;
          scriptLoaded = true;
          clearInterval(detectionInterval);
          resolve();
        };
        
        detectionInterval = setInterval(detectAndConfigureAW, 100);
        
        setTimeout(() => {
          if (!scriptLoaded) {
            scriptLoaded = true;
            clearInterval(detectionInterval);
            resolve();
          }
        }, 8000);
        
      } catch (error) {
        resolve();
      }
    });
  }

  trackPageView(pageData = {}) {
    if (!this.ready || !window.gtag || !this.configured) {
      return;
    }

    const { page_title = document.title, page_location = window.location.href, page_path } = pageData;
    const currentPath = page_path || window.location.pathname;

    try {
      window.gtag('event', 'page_view', {
        send_to: this.trackingId,
        page_title,
        page_location,
        page_path: currentPath
      });
    } catch (error) {
    }
  }

  trackViewContent(productData) {
    if (!this.ready || !window.gtag) {
      console.warn('Google Ads not ready for view_content:', {
        ready: this.ready,
        gtagExists: !!window.gtag
      });
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR' } = productData;

    const awData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: [{
        item_id: product_id,
        item_name: product_name,
        category,
        quantity: 1,
        value: value  // ✅ Using "value" instead of "price"
      }]
    };

    try {
      window.gtag('event', 'view_item', {
        ...awData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackAddToCart(productData) {
    if (!this.ready || !window.gtag) {
      console.warn('Google Ads not ready for add_to_cart:', {
        ready: this.ready,
        gtagExists: !!window.gtag
      });
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR', quantity = 1 } = productData;

    const awData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: [{
        item_id: product_id,
        item_name: product_name,
        category,
        quantity,
        value: value  // ✅ Using "value" instead of "price"
      }]
    };

    try {
      window.gtag('event', 'add_to_cart', {
        ...awData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackInitiateCheckout(checkoutData) {
    if (!this.ready || !window.gtag) {
      console.warn('Google Ads not ready for begin_checkout:', {
        ready: this.ready,
        gtagExists: !!window.gtag,
        trackingId: this.trackingId
      });
      return;
    }

    const { value, currency = 'INR', items = [] } = checkoutData;

    // ✅ FIX: Transform items to use "value" instead of "price" for Google Ads
    // This ensures proper remarketing data sharing while using "value" as requested
    const processedItems = items.map(item => ({
      item_id: item.item_id || item.id,
      item_name: item.item_name || item.name,
      category: item.item_category || item.category,
      quantity: item.quantity || 1,
      value: item.price || item.value || 0  // ✅ Using "value" instead of "price"
    }));

    const awData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: processedItems,
      // ✅ FIX: Add user data for remarketing (without personal info)
      custom_parameters: {
        checkout_step: 1,
        checkout_option: 'initiate',
        item_count: processedItems.length,
        platform: 'web'
      }
    };

    try {
      window.gtag('event', 'begin_checkout', {
        ...awData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackPurchase(purchaseData) {
    if (!this.ready || !window.gtag) {
      console.warn('Google Ads not ready for purchase:', {
        ready: this.ready,
        gtagExists: !!window.gtag
      });
      return;
    }

    const { transaction_id, value, currency = 'INR' } = purchaseData;

    if (this.conversionId && this.conversionId.includes('/')) {
      try {
        window.gtag('event', 'conversion', {
          send_to: this.conversionId,
          value: value,
          currency: currency,
          transaction_id: transaction_id
        });
      } catch (error) {
      }
    } else {
      try {
        window.gtag('event', 'conversion', {
          send_to: this.trackingId,
          value: value,
          currency: currency,
          transaction_id: transaction_id
        });
      } catch (error) {
      }
    }
  }

  trackAddToWishlist(productData) {
    if (!this.ready || !window.gtag) {
      console.warn('Google Ads not ready for add_to_wishlist:', {
        ready: this.ready,
        gtagExists: !!window.gtag
      });
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR' } = productData;

    const awData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: [{
        item_id: product_id,
        item_name: product_name,
        category,
        quantity: 1,
        value: value  // ✅ Using "value" instead of "price"
      }]
    };

    try {
      window.gtag('event', 'add_to_wishlist', {
        ...awData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackSearch(searchData) {
    if (!this.ready || !window.gtag) {
      console.warn('Google Ads not ready for search:', {
        ready: this.ready,
        gtagExists: !!window.gtag
      });
      return;
    }

    const { search_term, number_of_results = 0 } = searchData;

    const awData = {
      search_term,
      event_category: 'engagement',
      custom_parameters: {
        number_of_results,
        platform: 'web'
      }
    };

    try {
      window.gtag('event', 'search', {
        ...awData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackCustomEvent(eventName, parameters = {}) {
    if (!this.ready || !window.gtag) {
      return;
    }

    try {
      window.gtag('event', eventName, {
        ...parameters,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  autoFix() {
    if (typeof window.gtag !== 'undefined' && !this.ready) {
      this.ready = true;
      this.configured = true;
      return true;
    }
    return false;
  }

  isReady() {
    return this.ready;
  }
}

export default GoogleAdsManager;
