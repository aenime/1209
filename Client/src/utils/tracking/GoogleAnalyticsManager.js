// Google Analytics Manager
// Handles GA4 tracking events and script loading

import envConfig from '../envConfig';

class GoogleAnalyticsManager {
  constructor() {
    this.ready = false;
    this.configured = false;
    this.trackingId = null;
  }

  async initialize() {
    if (!envConfig || typeof envConfig.get !== 'function') {
      return;
    }
    
    const g4Id = envConfig.get('REACT_APP_G4');

    // Check for valid tracking ID (not placeholder values)
    const validG4Id = g4Id && 
                     g4Id !== 'one@one' && 
                     g4Id !== 'G-XXXXXXXXXX' && 
                     g4Id !== 'Not configured' &&
                     g4Id.startsWith('G-') &&
                     g4Id.length > 5;

    if (!validG4Id) {
      return;
    }

    this.trackingId = g4Id;

    return new Promise((resolve) => {
      try {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function() {
          window.dataLayer.push(arguments);
        };

        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${g4Id}`;
        
        let scriptLoaded = false;
        let detectionInterval;
        
        // Function to detect and configure Google Analytics
        const detectAndConfigureGA = () => {
          if (scriptLoaded) return;
          
          // Check if gtag is available
          if (typeof window.gtag !== 'undefined') {
            scriptLoaded = true;
            clearInterval(detectionInterval);
            
            try {
              // Initialize gtag
              window.gtag('js', new Date());
              
              // Configure Google Analytics
              window.gtag('config', g4Id, {
                send_page_view: false // CRITICAL: Prevent automatic page views
              });
              
              this.ready = true;
              this.configured = true;
              resolve();
            } catch (configError) {
              resolve(); // Don't reject - continue without Google Analytics
            }
          }
        };
        
        script.onload = () => {
          detectAndConfigureGA();
        };
        
        script.onerror = () => {
          if (scriptLoaded) return;
          scriptLoaded = true;
          clearInterval(detectionInterval);
          resolve(); // Don't reject - continue without Google Analytics
        };
        
        // Start periodic detection (check every 100ms for up to 8 seconds)
        detectionInterval = setInterval(detectAndConfigureGA, 100);
        
        setTimeout(() => {
          if (!scriptLoaded) {
            scriptLoaded = true;
            clearInterval(detectionInterval);
            resolve(); // Don't reject - continue without Google Analytics
          }
        }, 8000); // 8 second timeout
        
        document.head.appendChild(script);
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
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR' } = productData;

    const gaData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: [{
        item_id: product_id,
        item_name: product_name,
        category,
        quantity: 1,
        price: value
      }]
    };

    try {
      window.gtag('event', 'view_item', {
        ...gaData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackAddToCart(productData) {
    if (!this.ready || !window.gtag) {
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR', quantity = 1 } = productData;

    const gaData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: [{
        item_id: product_id,
        item_name: product_name,
        category,
        quantity,
        price: value
      }]
    };

    try {
      window.gtag('event', 'add_to_cart', {
        ...gaData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackInitiateCheckout(checkoutData) {
    if (!this.ready || !window.gtag) {
      return;
    }

    const { value, currency = 'INR', items = [] } = checkoutData;

    const gaData = {
      currency,
      value,
      event_category: 'ecommerce',
      items
    };

    try {
      window.gtag('event', 'begin_checkout', {
        ...gaData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackPurchase(purchaseData) {
    if (!this.ready || !window.gtag) {
      return;
    }

    const { 
      transaction_id, 
      value, 
      currency = 'INR', 
      items = [],
      tax = 0,
      shipping = 0 
    } = purchaseData;

    const gaData = {
      transaction_id,
      value,
      currency,
      tax,
      shipping,
      event_category: 'ecommerce',
      items
    };

    try {
      window.gtag('event', 'purchase', {
        ...gaData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackAddToWishlist(productData) {
    if (!this.ready || !window.gtag) {
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR' } = productData;

    const gaData = {
      currency,
      value,
      event_category: 'ecommerce',
      items: [{
        item_id: product_id,
        item_name: product_name,
        category,
        quantity: 1,
        price: value
      }]
    };

    try {
      window.gtag('event', 'add_to_wishlist', {
        ...gaData,
        send_to: this.trackingId
      });
    } catch (error) {
    }
  }

  trackSearch(searchData) {
    if (!this.ready || !window.gtag) {
      return;
    }

    const { search_term, number_of_results = 0 } = searchData;

    const gaData = {
      search_term,
      event_category: 'engagement',
      custom_parameters: {
        number_of_results
      }
    };

    try {
      window.gtag('event', 'search', {
        ...gaData,
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

export default GoogleAnalyticsManager;
