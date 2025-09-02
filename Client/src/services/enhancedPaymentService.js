/**
 * Enhanced Payment Service for Frontend
 * 
 * Provides comprehensive payment functionality for Cashfree integration
 * with proper error handling, validation, and fallback mechanisms.
 */

class EnhancedPaymentService {
  constructor() {
    this.apiVersion = '2025-01-01';
    this.baseUrl = '/api/payment';
  }

  /**
   * Generate unique order ID
   */
  generateOrderId(prefix = 'order') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate payment data before sending to server
   */
  validatePaymentData(paymentData) {
    const errors = [];
    
    // Validate amount
    if (!paymentData.amount || typeof paymentData.amount !== 'number') {
      errors.push('Amount is required and must be a number');
    } else if (paymentData.amount < 1) {
      errors.push('Amount must be at least ₹1.00');
    } else if (paymentData.amount > 999999) {
      errors.push('Amount exceeds maximum limit of ₹9,99,999');
    }
    
    // Validate customer details
    if (!paymentData.customer) {
      errors.push('Customer details are required');
    } else {
      if (!paymentData.customer.customer_phone) {
        errors.push('Customer phone number is required');
      } else {
        const phone = paymentData.customer.customer_phone.toString();
        if (!/^[6-9]\d{9}$/.test(phone)) {
          errors.push('Phone number must be a valid 10-digit Indian mobile number');
        }
      }
      
      if (paymentData.customer.customer_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(paymentData.customer.customer_email)) {
          errors.push('Email format is invalid');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format payment amount to 2 decimal places
   */
  formatPaymentAmount(amount) {
    return parseFloat(amount).toFixed(2);
  }

  /**
   * Check if Cashfree payment gateway is enabled and configured
   */
  async isCashfreeEnabled() {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        enabled: data.success && data.enabled && data.isConfigured,
        environment: data.environment || 'sandbox',
        configured: data.isConfigured || false,
        error: data.error
      };
    } catch (error) {
      console.error('❌ Error checking Cashfree status:', error);
      return {
        enabled: false,
        environment: 'sandbox',
        configured: false,
        error: error.message
      };
    }
  }

  /**
   * Create payment order via backend API
   */
  async createPaymentOrder(orderData) {
    try {
      // Validate data before sending
      const validation = this.validatePaymentData(orderData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Ensure order_id is set
      if (!orderData.order_id) {
        orderData.order_id = this.generateOrderId();
      }

      // Log order creation attempt
      console.log('🚀 Creating payment order:', {
        order_id: orderData.order_id,
        amount: orderData.amount,
        customer_phone: orderData.customer?.customer_phone,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || result.message || 'Order creation failed');
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Order creation was not successful');
      }

      // Validate required fields in response
      if (!result.data?.payment_session_id) {
        throw new Error('Invalid response: missing payment_session_id');
      }

      console.log('✅ Payment order created successfully:', {
        order_id: result.data.order_id,
        cf_order_id: result.data.cf_order_id,
        payment_session_id: result.data.payment_session_id ? 'present' : 'missing'
      });

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Payment order creation error:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'ORDER_CREATION_FAILED'
        }
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required for verification');
      }

      const response = await fetch(`${this.baseUrl}/verify/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      return {
        success: result.success,
        status: result.status,
        isPaid: result.isPaid,
        order: result.order,
        error: result.error
      };
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'VERIFICATION_FAILED'
        }
      };
    }
  }

  /**
   * Check if Cashfree SDK is loaded and ready
   */
  isCashfreeSdkReady() {
    // Check if SDK failed to load
    if (typeof window !== 'undefined' && window.cashfreeSdkFailed) {
      console.warn('⚠️ Cashfree SDK failed to load, will use server redirect');
      return false;
    }
    
    // Check if SDK is ready
    const sdkReady = typeof window !== 'undefined' && 
                     typeof window.Cashfree !== 'undefined' && 
                     typeof window.Cashfree === 'function';
    
    if (sdkReady) {
      try {
        // Test if SDK can create instance
        const testInstance = window.Cashfree({ mode: 'sandbox' });
        return typeof testInstance.checkout === 'function';
      } catch (error) {
        console.error('❌ Cashfree SDK test failed:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Wait for SDK to load with timeout
   */
  async waitForSdkLoad(timeoutMs = 15000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkSdk = () => {
        if (this.isCashfreeSdkReady()) {
          console.log('✅ Cashfree SDK is ready');
          resolve(true);
          return;
        }
        
        if (window.cashfreeSdkFailed) {
          console.warn('⚠️ Cashfree SDK failed to load');
          resolve(false);
          return;
        }
        
        if (Date.now() - startTime > timeoutMs) {
          console.warn('⚠️ Cashfree SDK load timeout');
          resolve(false);
          return;
        }
        
        // Check again in 500ms
        setTimeout(checkSdk, 500);
      };
      
      checkSdk();
    });
  }

  /**
   * Initialize Cashfree checkout using SDK (primary method)
   */
  async initializeCashfreeCheckout(paymentSessionId, environment = 'sandbox') {
    if (!this.isCashfreeSdkReady()) {
      throw new Error('Cashfree SDK not loaded. Make sure to include the SDK script.');
    }

    if (!paymentSessionId) {
      throw new Error('Payment session ID is required');
    }

    try {
      console.log('🔄 Initializing Cashfree SDK checkout:', {
        paymentSessionId: paymentSessionId.substring(0, 10) + '...',
        environment
      });

      const cashfree = window.Cashfree({
        mode: environment === 'production' ? 'production' : 'sandbox'
      });

      await cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self"
      });

      console.log('✅ Cashfree SDK checkout initiated successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Cashfree SDK checkout error:', error);
      throw new Error(`SDK checkout failed: ${error.message}`);
    }
  }

  /**
   * Redirect to server-side checkout (fallback method)
   */
  redirectToServerCheckout(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required for server checkout');
    }

    console.log('🔄 Redirecting to server-side checkout:', orderId);
    
    // Use server-side redirect as fallback
    window.location.href = `${this.baseUrl}/checkout/${orderId}`;
  }

  /**
   * Complete payment flow with fallback mechanisms
   */
  async processPayment(orderData) {
    try {
      // Step 1: Create order
      const orderResult = await this.createPaymentOrder(orderData);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error?.message || 'Failed to create order');
      }

      const { payment_session_id, order_id, environment } = orderResult.data;

      // Step 2: Wait for SDK to load (with timeout)
      console.log('🔄 Waiting for Cashfree SDK to load...');
      const sdkReady = await this.waitForSdkLoad(10000);

      if (sdkReady) {
        try {
          console.log('🚀 Using Cashfree SDK for payment');
          await this.initializeCashfreeCheckout(payment_session_id, environment);
          return { success: true, method: 'sdk' };
        } catch (sdkError) {
          console.warn('⚠️ SDK checkout failed, falling back to server redirect:', sdkError.message);
        }
      } else {
        console.warn('⚠️ Cashfree SDK not available, using server redirect');
      }

      // Step 3: Fallback to server-side redirect
      console.log('🔄 Using server-side redirect for payment');
      this.redirectToServerCheckout(order_id);
      return { success: true, method: 'redirect' };

    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'PAYMENT_PROCESSING_FAILED'
        }
      };
    }
  }

  /**
   * Clean up payment data from local storage
   */
  cleanupPaymentData() {
    const keysToClean = [
      'currentOrderData',
      'pendingPaymentOrder',
      'paymentAmount',
      'cartTotalPrice',
      'checkoutData',
      'activePaymentSession',
      'paymentSessionId',
      'lastOrderId'
    ];

    let cleanedKeys = 0;

    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleanedKeys++;
      }
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        cleanedKeys++;
      }
    });

    console.log(`✅ Payment data cleanup completed. Cleaned ${cleanedKeys} items.`);
    
    return {
      success: true,
      cleanedItems: cleanedKeys,
      message: 'Payment data cleaned successfully'
    };
  }

  /**
   * Get payment status from URL parameters (for return page)
   */
  getPaymentStatusFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      orderId: urlParams.get('order_id') || urlParams.get('orderId'),
      paymentStatus: urlParams.get('payment_status') || urlParams.get('paymentStatus'),
      verified: urlParams.get('verified') === 'true',
      timestamp: urlParams.get('timestamp'),
      error: urlParams.get('error')
    };
  }

  /**
   * Handle payment return page logic
   */
  async handlePaymentReturn() {
    const status = this.getPaymentStatusFromUrl();
    
    if (status.error) {
      return {
        success: false,
        error: status.error,
        message: 'Payment failed or was cancelled'
      };
    }

    if (status.orderId && status.paymentStatus === 'success') {
      // Verify payment status with server
      const verification = await this.verifyPayment(status.orderId);
      
      if (verification.success && verification.isPaid) {
        // Clean up payment data on successful payment
        this.cleanupPaymentData();
        
        return {
          success: true,
          orderId: status.orderId,
          verified: verification.isPaid,
          message: 'Payment completed successfully'
        };
      }
    }

    return {
      success: false,
      error: 'PAYMENT_VERIFICATION_FAILED',
      message: 'Unable to verify payment status'
    };
  }

  /**
   * Test configuration with provided credentials
   */
  async testConfiguration(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/test-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const enhancedPaymentService = new EnhancedPaymentService();

export default enhancedPaymentService;
