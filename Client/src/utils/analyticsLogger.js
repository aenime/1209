// Enhanced Analytics Logger Utility
// Provides comprehensive console logging for Google Analytics and Facebook Pixel events

class AnalyticsLogger {
  constructor() {
    this.eventCount = 0;
    this.sessionEvents = [];
  }

  // Enhanced Purchase Event Logging
  logPurchaseEvent(purchaseData, trackingManager) {
    this.eventCount++;
    const eventId = `purchase-${this.eventCount}-${Date.now()}`;
    
    
    // Track event in session
    this.sessionEvents.push({
      id: eventId,
      type: 'purchase',
      timestamp: Date.now(),
      data: purchaseData,
      status: 'processing'
    });

    // Check tracking readiness
    const status = this.checkTrackingReadiness();

    // Log to console if events will fire or not
    this.logEventStatus('Google Analytics Purchase', status.googleAnalytics, {
      transactionId: purchaseData.transaction_id,
      value: purchaseData.value,
      currency: purchaseData.currency,
      items: purchaseData.items?.length || 0
    });

    this.logEventStatus('Google Ads Conversion', status.googleAds, {
      awId: status.awId,
      purchaseTag: status.purchaseTag,
      value: purchaseData.value
    });

    this.logEventStatus('Facebook Pixel Purchase', status.facebookPixel, {
      contentIds: purchaseData.items?.map(item => item.item_id) || [],
      value: purchaseData.value,
      currency: purchaseData.currency
    });

    return eventId;
  }

  // Enhanced Add to Cart Event Logging
  logAddToCartEvent(productData, trackingManager) {
    this.eventCount++;
    const eventId = `add-to-cart-${this.eventCount}-${Date.now()}`;
    
    // Track event in session
    this.sessionEvents.push({
      id: eventId,
      type: 'add_to_cart',
      timestamp: Date.now(),
      data: productData,
      status: 'processing'
    });

    // Check tracking readiness
    const status = this.checkTrackingReadiness();

    // Log to console if events will fire or not
    this.logEventStatus('Google Analytics Add to Cart', status.googleAnalytics, {
      productId: productData.product_id,
      productName: productData.product_name,
      value: productData.value,
      quantity: productData.quantity || 1
    });

    this.logEventStatus('Facebook Pixel AddToCart', status.facebookPixel, {
      contentId: productData.product_id,
      productName: productData.product_name,
      value: productData.value
    });

    return eventId;
  }

  // Enhanced Begin Checkout Event Logging
  logBeginCheckoutEvent(checkoutData, trackingManager) {
    this.eventCount++;
    const eventId = `begin-checkout-${this.eventCount}-${Date.now()}`;
    
    // Track event in session
    this.sessionEvents.push({
      id: eventId,
      type: 'begin_checkout',
      timestamp: Date.now(),
      data: checkoutData,
      status: 'processing'
    });

    return eventId;
  }

  // Enhanced View Content Event Logging
  logViewContentEvent(productData, trackingManager) {
    this.eventCount++;
    const eventId = `view-content-${this.eventCount}-${Date.now()}`;
    
    // Track event in session
    this.sessionEvents.push({
      id: eventId,
      type: 'view_content',
      timestamp: Date.now(),
      data: productData,
      status: 'processing'
    });

    // Check tracking readiness
    const status = this.checkTrackingReadiness();

    // Log to console if events will fire or not
    this.logEventStatus('Google Analytics View Item', status.googleAnalytics, {
      productId: productData.product_id,
      productName: productData.product_name,
      category: productData.category,
      value: productData.value
    });

    this.logEventStatus('Facebook Pixel ViewContent', status.facebookPixel, {
      contentId: productData.product_id,
      productName: productData.product_name,
      category: productData.category,
      value: productData.value
    });

    return eventId;
  }

  // Check tracking services readiness
  checkTrackingReadiness() {
    // Import envConfig to check configuration
    let envConfig;
    try {
      envConfig = require('./envConfig').default;
    } catch (e) {
    }

    const gaReady = !!(window.gtag && window.dataLayer);
    const fbReady = !!(window.fbq);
    
    // Get tracking IDs
    const g4Id = envConfig?.get('REACT_APP_G4');
    const awId = envConfig?.get('REACT_APP_AW');
    const fbPixelId = envConfig?.get('REACT_APP_FBPIXEL');
    const purchaseTag = envConfig?.get('REACT_APP_AW_CONVERSION_ID');

    // Validate IDs
    const validG4Id = g4Id && g4Id !== 'one@one' && g4Id !== 'G-XXXXXXXXXX' && g4Id.length > 5;
    const validAwId = awId && awId !== 'aw 798798' && awId !== 'AW-XXXXXXXXX' && awId.length > 5;
    const validFbId = fbPixelId && fbPixelId !== '8098098090980' && fbPixelId.length > 5;

    return {
      googleAnalytics: gaReady && validG4Id,
      googleAds: gaReady && validAwId && purchaseTag,
      facebookPixel: fbReady && validFbId,
      gtag: !!window.gtag,
      fbq: !!window.fbq,
      dataLayer: !!window.dataLayer,
      g4Id: validG4Id ? g4Id : 'Invalid/Missing',
      awId: validAwId ? awId : 'Invalid/Missing',
      fbPixelId: validFbId ? fbPixelId : 'Invalid/Missing',
      purchaseTag: purchaseTag || 'Missing'
    };
  }

  // Log event status (will fire vs won't fire)
  logEventStatus(eventName, willFire, eventData) {
    // Status checking logic preserved, but console logging removed
    // This method still tracks the event status internally
    return { eventName, willFire, eventData };
  }

  // Get session event summary
  getSessionSummary() {
    
    return {
      totalEvents: this.eventCount,
      events: this.sessionEvents,
      eventsByType: this.getEventsByType()
    };
  }

  // Group events by type
  getEventsByType() {
    return this.sessionEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
  }

  // Clear session data
  clearSession() {
    this.eventCount = 0;
    this.sessionEvents = [];
  }

  // Test all tracking services
  testTrackingServices() {
    
    const status = this.checkTrackingReadiness();
    
    // Test Google Analytics
    if (status.googleAnalytics) {
      try {
        window.gtag('event', 'test_event', {
          event_category: 'test',
          event_label: 'analytics_test',
          value: 1
        });
      } catch (e) {
      }
    } else {
    }
    
    // Test Facebook Pixel
    if (status.facebookPixel) {
      try {
        window.fbq('trackCustom', 'TestEvent', {
          test_parameter: 'analytics_test'
        });
      } catch (e) {
      }
    } else {
    }
    
    return status;
  }
}

// Create singleton instance
const analyticsLogger = new AnalyticsLogger();

// Add global access for debugging
if (typeof window !== 'undefined') {
  window.analyticsLogger = analyticsLogger;
}

export default analyticsLogger;
