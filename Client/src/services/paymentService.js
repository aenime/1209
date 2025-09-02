// Enhanced payment utilities for Cashfree v4 API and COD payments
// This service handles payment operations with latest Cashfree integration

class PaymentService {
  static generateOrderId() {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  static validatePaymentData(paymentData) {
    const required = ['amount', 'customer'];
    return required.every(field => paymentData[field]);
  }

  static formatPaymentAmount(amount) {
    return parseFloat(amount).toFixed(2);
  }

  // Check if Cashfree payment gateway is enabled
  static async isCashfreeEnabled() {
    try {
      const response = await fetch('/api/payment/config');
      if (!response.ok) {
        throw new Error('Failed to fetch payment configuration');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Check if Cashfree is enabled and configured
        return data.enabled && data.isConfigured;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking Cashfree status:', error);
      return false;
    }
  }

  // Create payment order via backend API
  static async createPaymentOrder(orderData) {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Order creation failed');
      }

      return result.data;
    } catch (error) {
      console.error('Payment order creation error:', error);
      throw error;
    }
  }

  // Verify payment status
  static async verifyPayment(orderId) {
    try {
      const response = await fetch(`/api/payment/verify/${orderId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();
      
      return {
        success: result.success,
        status: result.status,
        order: result.order
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up payment data after successful transaction
  static cleanupPaymentData() {
    const keysToClean = [
      'currentOrderData',
      'pendingPaymentOrder',
      'paymentAmount',
      'cartTotalPrice',
      'checkoutData',
      'activePaymentSession'
    ];

    keysToClean.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('✅ Payment data cleanup completed');
  }

  // Check if Cashfree SDK is loaded and ready
  static isCashfreeSdkReady() {
    return typeof window.Cashfree !== 'undefined' && 
           typeof window.Cashfree.checkout === 'function';
  }

  // Initialize Cashfree checkout with SDK
  static async initializeCashfreeCheckout(paymentSessionId, environment = 'sandbox') {
    if (!this.isCashfreeSdkReady()) {
      throw new Error('Cashfree SDK not loaded');
    }

    try {
      const cashfree = window.Cashfree({
        mode: environment === 'production' ? 'production' : 'sandbox'
      });

      await cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self"
      });

      return true;
    } catch (error) {
      console.error('Cashfree SDK checkout error:', error);
      throw error;
    }
  }
}

export default PaymentService;
