const axios = require('axios');

/**
 * Cashfree Payment Service
 * 
 * Service class for handling Cashfree Payment Gateway API v4 integration.
 * Provides methods for order creation, payment verification, and status checking
 * with proper error handling and environment management.
 */
class CashfreeService {
  
  /**
   * Get Cashfree configuration from environment or database
   */
  static async getConfig() {
    try {
      // Try to get configuration from database first (EnvConfig model)
      const EnvConfig = require('../../model/EnvConfig.modal');
      const config = await EnvConfig.findOne({ configName: 'default' });
      
      let clientId, clientSecret, environment, enabled;
      
      if (config) {
        // Use database configuration (preferred for admin-managed settings)
        clientId = config.CASHFREE_CLIENT_ID || process.env.CASHFREE_CLIENT_ID;
        clientSecret = config.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET;
        environment = config.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENVIRONMENT || 'production';
        enabled = config.CASHFREE_ENABLED === true || config.CASHFREE_ENABLED === 'true';
      } else {
        // Fallback to environment variables
        clientId = process.env.CASHFREE_CLIENT_ID;
        clientSecret = process.env.CASHFREE_CLIENT_SECRET;
        environment = process.env.CASHFREE_ENVIRONMENT || 'production';
        enabled = process.env.CASHFREE_ENABLED === 'true';
      }
      
      // Validate configuration
      if (!enabled) {
        throw new Error('Cashfree payment gateway is disabled');
      }
      
      if (!clientId || !clientSecret) {
        throw new Error('Cashfree credentials not configured');
      }
      
      return {
        clientId,
        clientSecret,
        environment,
        enabled,
        apiUrl: environment === 'production' 
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders'
      };
    } catch (error) {
      throw new Error(`Failed to get Cashfree configuration: ${error.message}`);
    }
  }

  /**
   * Create a new payment order
   * 
   * @param {Object} orderData - Order details for payment
   * @param {number} orderData.amount - Payment amount
   * @param {string} orderData.currency - Currency code (default: INR)
   * @param {string} orderData.orderId - Unique order identifier
   * @param {Object} orderData.customer - Customer details
   * @param {string} orderData.orderNote - Order description
   * @param {Object} orderData.orderMeta - Additional order metadata
   * @returns {Object} Cashfree order response
   */
  static async createOrder(orderData) {
    try {
      const config = await this.getConfig();
      
      const requestData = {
        order_amount: orderData.amount,
        order_currency: orderData.currency || 'INR',
        order_id: orderData.orderId,
        customer_details: {
          customer_id: orderData.customer.customer_id || `CUST_${Date.now()}`,
          customer_phone: orderData.customer.customer_phone || orderData.customer.mobile || '9999999999',
          customer_email: orderData.customer.customer_email || orderData.customer.email || 'customer@example.com',
          customer_name: orderData.customer.customer_name || orderData.customer.name || 'Customer'
        },
        order_note: orderData.orderNote || 'Payment for order'
      };
      
      // Add optional fields if provided
      if (orderData.orderMeta) {
        requestData.order_meta = orderData.orderMeta;
      }
      
      if (orderData.cartDetails) {
        requestData.cart_details = orderData.cartDetails;
      }
      
      const response = await axios.post(config.apiUrl, requestData, {
        headers: {
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
          'x-api-version': '2025-01-01',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error) {
      console.error('Cashfree order creation error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Get order details by order ID
   * 
   * @param {string} orderId - Order identifier
   * @returns {Object} Order details from Cashfree
   */
  static async getOrderDetails(orderId) {
    try {
      const config = await this.getConfig();
      
      const response = await axios.get(`${config.apiUrl}/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
          'x-api-version': '2025-01-01'
        },
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error) {
      console.error('Cashfree order details error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Verify payment status
   * 
   * @param {string} orderId - Order identifier
   * @returns {Object} Payment verification result
   */
  static async verifyPayment(orderId) {
    try {
      const orderResult = await this.getOrderDetails(orderId);
      
      if (!orderResult.success) {
        return orderResult;
      }
      
      const order = orderResult.data;
      
      return {
        success: true,
        status: order.order_status,
        data: order,
        isPaid: order.order_status === 'PAID',
        isActive: order.order_status === 'ACTIVE',
        isExpired: order.order_status === 'EXPIRED',
        isTerminated: order.order_status === 'TERMINATED'
      };
      
    } catch (error) {
      console.error('Cashfree payment verification error:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate payment checkout URLs
   * 
   * @param {string} paymentSessionId - Payment session ID from order creation
   * @param {string} environment - Environment (sandbox/production)
   * @returns {Array} Array of possible checkout URLs
   */
  static generateCheckoutUrls(paymentSessionId, environment = 'sandbox') {
    const baseUrl = environment === 'production' 
      ? 'https://payments.cashfree.com'
      : 'https://payments-test.cashfree.com';
    
    return [
      `${baseUrl}/pgappnew/checkout?session_id=${paymentSessionId}`,
      `${baseUrl}/checkout/${paymentSessionId}`,
      `${baseUrl}/billpay/checkout/post/submit?payment_session_id=${paymentSessionId}`
    ];
  }

  /**
   * Test API connection and credentials
   * 
   * @param {Object} credentials - Optional credentials to test
   * @returns {Object} Connection test result
   */
  static async testConnection(credentials = null) {
    try {
      const config = credentials || await this.getConfig();
      
      // Create a test order to verify credentials
      const testOrder = {
        order_amount: 1,
        order_currency: 'INR',
        order_id: `test_${Date.now()}`,
        customer_details: {
          customer_id: 'test_customer',
          customer_phone: '9999999999',
          customer_name: 'Test Customer',
          customer_email: 'test@example.com'
        },
        order_note: 'Test order for API validation'
      };
      
      const response = await axios.post(config.apiUrl, testOrder, {
        headers: {
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
          'x-api-version': '2025-01-01',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      return {
        success: true,
        message: 'Cashfree API connection successful',
        environment: config.environment
      };
      
    } catch (error) {
      console.error('Cashfree connection test error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }
}

module.exports = CashfreeService;
