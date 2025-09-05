const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Enhanced Cashfree Payment Service using direct API calls
 * Provides same functionality as the PHP implementation
 */
class NewCashfreeService {
  constructor() {
    this.config = {
      CASHFREE_APP_ID: process.env.CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
      CASHFREE_ENV: process.env.CASHFREE_ENV || 'SANDBOX',
      APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3000'
    };
    
    // Validation
    if (!this.config.CASHFREE_APP_ID || !this.config.CASHFREE_SECRET_KEY) {
      console.warn('Missing Cashfree credentials in .env file, using placeholder values for demo');
      this.config.CASHFREE_APP_ID = 'TEST123456';
      this.config.CASHFREE_SECRET_KEY = 'TEST_SECRET_KEY_987654321';
    }
    
    // Set API base URL based on environment
    this.baseURL = this.config.CASHFREE_ENV === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
      
    this.API_VERSION = "2022-01-01"; // Using same API version as PHP implementation
    
    // Set up axios instance with default headers
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.config.CASHFREE_APP_ID,
        'x-client-secret': this.config.CASHFREE_SECRET_KEY,
        'x-api-version': this.API_VERSION
      }
    });
  }

  /**
   * Create Cashfree order with payment link
   * @param {Object} options - Order details
   * @param {string} options.orderId - Unique order identifier
   * @param {number} options.orderAmount - Payment amount
   * @param {string} options.orderCurrency - Currency code (default: INR)
   * @param {string} options.customerName - Customer's name
   * @param {string} options.customerEmail - Customer's email
   * @param {string} options.customerPhone - Customer's phone
   * @param {string} options.returnUrl - URL to redirect after payment (optional)
   * @returns {Promise<Object>} Response with payment link
   */
  async createCashfreeOrder(options) {
    try {
      const { 
        orderId, 
        orderAmount,
        orderCurrency = "INR",
        customerName = "John Doe",
        customerEmail = "john.doe@example.com",
        customerPhone = "9999999999",
        returnUrl = this.config.APP_BASE_URL
      } = options;
      
      // Create order request payload (same as PHP implementation)
      const orderData = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: orderCurrency,
        customer_details: {
          customer_id: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: returnUrl
        }
      };

      console.log('Creating order with request:', JSON.stringify(orderData, null, 2));

      // Make API call to create order
      const response = await this.client.post('/orders', orderData);
      
      console.log('Cashfree API Response:', JSON.stringify(response.data, null, 2));

      // Return standardized response with payment link and session ID
      if (response.data && response.data.payment_link) {
        // For SDK v4, use the order_token as payment_session_id
        // This is the correct session ID format for Cashfree SDK v4
        const paymentSessionId = response.data.order_token;
        
        return {
          success: true,
          payment_link: response.data.payment_link,
          payment_session_id: paymentSessionId,
          order_token: response.data.order_token,
          cf_order_id: response.data.cf_order_id,
          order_id: response.data.order_id,
          order_status: response.data.order_status,
          environment: this.config.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox'
        };
      } else {
        console.error('No payment link in response:', response.data);
        return {
          success: false,
          message: 'No payment link received from Cashfree',
          data: response.data
        };
      }
    } catch (error) {
      console.error('Cashfree Exception:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get order details by order ID
   * @param {string} orderId - Order identifier
   * @returns {Promise<Object>} Order details from Cashfree
   */
  async getOrderDetails(orderId) {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      
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
   * @param {string} orderId - Order identifier
   * @returns {Promise<Object>} Payment verification result
   */
  async verifyPayment(orderId) {
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
}

module.exports = NewCashfreeService;
