// Facebook Pixel Manager
// Handles Facebook Pixel tracking events and script loading

import envConfig from '../envConfig';

class FacebookPixelManager {
  constructor() {
    this.ready = false;
    this.initialized = false;
    this.pixelId = null;
  }

  async initialize() {
    if (!envConfig || typeof envConfig.get !== 'function') {
      return;
    }
    
    const fbPixelId = envConfig.get('REACT_APP_FBPIXEL');
    
    // Check if we have a valid Facebook Pixel ID (not placeholder)
    const validFbPixelId = fbPixelId && 
                          fbPixelId !== '8098098090980' && 
                          fbPixelId !== 'XXXXXXXXXXXXXXXXX' &&
                          /^\d+$/.test(fbPixelId) &&
                          fbPixelId.length > 5;
    
    if (!validFbPixelId) {
      return;
    }

    this.pixelId = fbPixelId;

    return new Promise((resolve) => {
      try {
        // Check if Facebook Pixel is already loaded
        if (typeof window.fbq !== 'undefined') {
          if (!this.initialized) {
            window.fbq('init', fbPixelId);
            this.initialized = true;
          }
          
          this.ready = true;
          resolve();
          return;
        }
        
        // Facebook Pixel initialization code
        let fbPixelLoaded = false;
        let fbDetectionInterval;
        
        const detectAndConfigureFB = () => {
          if (fbPixelLoaded) return;
          
          if (typeof window.fbq !== 'undefined') {
            fbPixelLoaded = true;
            clearInterval(fbDetectionInterval);
            
            try {
              if (!this.initialized) {
                window.fbq('init', fbPixelId);
                this.initialized = true;
              }
              
              this.ready = true;
              resolve();
            } catch (initError) {
              resolve();
            }
          }
        };
        
        (function(f,b,e,v,n,t,s) {
          if(f.fbq) return;
          n=f.fbq=function(){
            n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments);
          };
          if(!f._fbq) f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s);
          
          t.onload = function() {
            detectAndConfigureFB();
          };
          
          t.onerror = function() {
            if (fbPixelLoaded) return;
            fbPixelLoaded = true;
            clearInterval(fbDetectionInterval);
            resolve();
          };
          
        })(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

        // THROTTLE FIX: Reduced from 100ms to 500ms to prevent IPC flooding
        fbDetectionInterval = setInterval(detectAndConfigureFB, 500);

        // Reduced timeout to prevent long-running intervals
        setTimeout(() => {
          if (!fbPixelLoaded) {
            fbPixelLoaded = true;
            clearInterval(fbDetectionInterval);
            resolve();
          }
        }, 3000); // Reduced from 5000ms to 3000ms
        
      } catch (error) {
        resolve();
      }
    });
  }

  trackPageView() {
    if (!this.ready || !window.fbq) {
      return;
    }

    try {
      window.fbq('track', 'PageView');
    } catch (error) {
    }
  }

  trackViewContent(productData) {
    if (!this.ready && !window.fbq) {
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR' } = productData;

    const fbData = {
      content_ids: [product_id],
      content_name: product_name,
      content_category: category,
      content_type: 'product',
      value,
      currency
    };

    try {
      window.fbq('track', 'ViewContent', fbData);
    } catch (error) {
    }
  }

  trackAddToCart(productData) {
    if (!this.ready && !window.fbq) {
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR', quantity = 1 } = productData;

    const fbData = {
      content_ids: [product_id],
      content_name: product_name,
      content_category: category,
      content_type: 'product',
      value,
      currency,
      num_items: quantity
    };

    try {
      window.fbq('track', 'AddToCart', fbData);
    } catch (error) {
    }
  }

  trackInitiateCheckout(checkoutData) {
    if (!this.ready && !window.fbq) {
      return;
    }

    const { value, currency = 'INR', items = [] } = checkoutData;

    const fbData = {
      content_ids: items.map(item => item.item_id),
      contents: items.map(item => ({
        id: item.item_id,
        quantity: item.quantity
      })),
      content_type: 'product',
      value,
      currency,
      num_items: items.length
    };

    try {
      window.fbq('track', 'InitiateCheckout', fbData);
    } catch (error) {
    }
  }

  trackPurchase(purchaseData) {
    // Try firing even if not marked as ready, as long as fbq exists
    if (!window.fbq) {
      this.initialize().then(() => {
        if (window.fbq) {
          this._firePurchaseEvent(purchaseData);
        }
      }).catch(() => {
        // Ignore initialization errors
      });
      return;
    }

    this._firePurchaseEvent(purchaseData);
  }

  _firePurchaseEvent(purchaseData) {
    const { value, currency = 'INR', items = [] } = purchaseData;

    const fbData = {
      content_ids: items.map(item => item.item_id),
      contents: items.map(item => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price
      })),
      content_type: 'product',
      value,
      currency,
      num_items: items.length
    };

    try {
      window.fbq('track', 'Purchase', fbData);
      
      if (!this.ready) {
        this.ready = true;
      }
    } catch (error) {
    }
  }

  trackAddToWishlist(productData) {
    if (!this.ready || !window.fbq) {
      return;
    }

    const { product_id, product_name, category, value, currency = 'INR' } = productData;

    const fbData = {
      content_ids: [product_id],
      content_name: product_name,
      content_category: category,
      content_type: 'product',
      value,
      currency
    };

    try {
      window.fbq('track', 'AddToWishlist', fbData);
    } catch (error) {
    }
  }

  trackSearch(searchData) {
    if (!this.ready || !window.fbq) {
      return;
    }

    const { search_term } = searchData;

    const fbData = {
      content_type: 'product',
      search_string: search_term
    };

    try {
      window.fbq('track', 'Search', fbData);
    } catch (error) {
    }
  }

  trackCustomEvent(eventName, parameters = {}) {
    if (!this.ready || !window.fbq) {
      return;
    }

    const fbStandardEvents = [
      'Lead', 'CompleteRegistration', 'Contact', 'CustomizeProduct', 
      'Donate', 'FindLocation', 'Schedule', 'Search', 'StartTrial', 
      'SubmitApplication', 'Subscribe'
    ];

    if (fbStandardEvents.includes(eventName)) {
      try {
        window.fbq('track', eventName, parameters);
      } catch (error) {
      }
    }
  }

  autoFix() {
    if (typeof window.fbq !== 'undefined' && !this.ready) {
      this.ready = true;
      return true;
    }
    return false;
  }

  isReady() {
    return this.ready;
  }
}

export default FacebookPixelManager;
