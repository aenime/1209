/**
 * Enhanced Cashfree Order Service
 * Implements Cashfree Order Creation API v4 with comprehensive error handling
 * and proper data validation according to official documentation
 */

const axios = require('axios');
const crypto = require('crypto');

class CashfreeOrderService {
  constructor() {
    this.apiVersion = '2025-01-01';
    this.sandboxUrl = 'https://sandbox.cashfree.com/pg/orders';
    this.productionUrl = 'https://api.cashfree.com/pg/orders';
  }

  /**
   * Get Cashfree configuration from environment or database
   */
  async getConfig() {
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
      
      // Validate credential format
      if (clientId.length < 10 || clientSecret.length < 20) {
        throw new Error('Invalid Cashfree credentials format');
      }
      
      return {
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        environment: environment.toLowerCase(),
        enabled,
        apiUrl: environment.toLowerCase() === 'production' ? this.productionUrl : this.sandboxUrl
      };
    } catch (error) {
      throw new Error(`Failed to get Cashfree configuration: ${error.message}`);
    }
  }

  /**
   * Generate unique order ID with proper format
   */
  generateOrderId(prefix = 'order') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Generate unique customer ID
   */
  generateCustomerId(phoneOrEmail) {
    if (phoneOrEmail) {
      const hash = crypto.createHash('sha1').update(phoneOrEmail).digest('hex').substring(0, 8);
      return `CUST_${hash}_${Date.now()}`;
    }
    return `CUST_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validate order data according to Cashfree API requirements
   */
  validateOrderData(orderData) {
    const errors = [];
    
    // Validate amount
    if (!orderData.amount || typeof orderData.amount !== 'number') {
      errors.push('Amount is required and must be a number');
    } else if (orderData.amount < 1) {
      errors.push('Amount must be at least 1.00');
    } else if (orderData.amount > 999999) {
      errors.push('Amount exceeds maximum limit');
    }
    
    // Validate customer details
    if (!orderData.customer) {
      errors.push('Customer details are required');
    } else {
      // Validate phone number
      if (!orderData.customer.customer_phone) {
        errors.push('Customer phone number is required');
      } else {
        const phone = orderData.customer.customer_phone.toString();
        if (!/^[6-9]\d{9}$/.test(phone)) {
          errors.push('Customer phone must be a valid 10-digit Indian mobile number');
        }
      }
      
      // Validate email if provided
      if (orderData.customer.customer_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderData.customer.customer_email)) {
          errors.push('Customer email format is invalid');
        }
      }
      
      // Validate name if provided
      if (orderData.customer.customer_name) {
        if (orderData.customer.customer_name.length < 2 || orderData.customer.customer_name.length > 100) {
          errors.push('Customer name must be between 2 and 100 characters');
        }
      }
    }
    
    // Validate order ID if provided
    if (orderData.order_id) {
      if (orderData.order_id.length < 3 || orderData.order_id.length > 45) {
        errors.push('Order ID must be between 3 and 45 characters');
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(orderData.order_id)) {
        errors.push('Order ID can only contain letters, numbers, underscores, and hyphens');
      }
    }
    
    // Validate currency
    if (orderData.order_currency && !['INR', 'USD', 'EUR'].includes(orderData.order_currency)) {
      errors.push('Currency must be INR, USD, or EUR');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Build complete order request payload
   */
  buildOrderPayload(orderData, config, serverUrl = null) {
    const validation = this.validateOrderData(orderData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate IDs if not provided
    const orderId = orderData.order_id || this.generateOrderId();
    const customerId = orderData.customer.customer_id || this.generateCustomerId(
      orderData.customer.customer_phone || orderData.customer.customer_email
    );

    // Build customer details
    const customerDetails = {
      customer_id: customerId,
      customer_phone: orderData.customer.customer_phone.toString(),
      ...(orderData.customer.customer_email && { customer_email: orderData.customer.customer_email }),
      ...(orderData.customer.customer_name && { customer_name: orderData.customer.customer_name })
    };

    // Build order payload
    const payload = {
      order_amount: parseFloat(orderData.amount.toFixed(2)),
      order_currency: orderData.order_currency || 'INR',
      order_id: orderId,
      customer_details: customerDetails,
      order_note: orderData.orderNote || 'Payment for order'
    };

    // Add order expiry time (24 hours from now)
    if (!orderData.order_expiry_time) {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      payload.order_expiry_time = expiryTime.toISOString();
    } else {
      payload.order_expiry_time = orderData.order_expiry_time;
    }

    // Add URLs - include localhost for development
    if (serverUrl) {
      // For localhost, use client return URL instead of server return URL
      const isLocalhost = serverUrl.includes('localhost');
      const clientUrl = isLocalhost ? serverUrl.replace(':5001', ':3000') : serverUrl;
      
      payload.order_meta = {
        return_url: isLocalhost 
          ? `${clientUrl}/payment-return`  // Direct to frontend for localhost
          : `${serverUrl}/api/enhanced-payment/return`,  // Backend handling for production
        notify_url: `${serverUrl}/api/payment/webhook`,
        payment_methods: orderData.payment_methods || 'cc,dc,nb,upi'
      };
      
      console.log(`🔄 Payment URLs configured - Return: ${payload.order_meta.return_url}`);
    }

    // Add cart details if provided
    if (orderData.cart_details) {
      payload.cart_details = orderData.cart_details;
    }

    // Add order tags if provided
    if (orderData.order_tags) {
      payload.order_tags = orderData.order_tags;
    }

    return payload;
  }

  /**
   * Create order with Cashfree API
   */
  async createOrder(orderData, serverUrl = null) {
    try {
      // Get configuration
      const config = await this.getConfig();
      
      // Build request payload
      const payload = this.buildOrderPayload(orderData, config, serverUrl);
      
      // Prepare headers
      const headers = {
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
        'x-api-version': this.apiVersion,
        'Content-Type': 'application/json',
        'x-request-id': `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };

      // Log request for debugging (in development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Cashfree Order Creation Request:', {
          url: config.apiUrl,
          headers: {
            'x-client-id': config.clientId.substring(0, 8) + '...',
            'x-client-secret': config.clientSecret.substring(0, 8) + '...',
            'x-api-version': this.apiVersion
          },
          payload
        });
      }

      // Make API request
      const response = await axios.post(config.apiUrl, payload, {
        headers,
        timeout: 15000, // 15 second timeout
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      // Handle response
      if (response.status >= 200 && response.status < 300) {
        const orderResponse = {
          ...response.data,
          api_version: this.apiVersion,
          environment: config.environment,
          created_at_local: new Date().toISOString()
        };

        // Log successful response (in development only)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Cashfree Order Created Successfully:', {
            order_id: orderResponse.order_id,
            cf_order_id: orderResponse.cf_order_id,
            payment_session_id: orderResponse.payment_session_id ? 'present' : 'missing',
            order_status: orderResponse.order_status
          });
        }

        return {
          success: true,
          data: orderResponse
        };
      } else {
        // Handle API errors
        const errorData = response.data || {};
        console.error('❌ Cashfree API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });

        return {
          success: false,
          error: {
            code: errorData.code || 'API_ERROR',
            message: errorData.message || 'Order creation failed',
            details: errorData,
            status: response.status
          }
        };
      }

    } catch (error) {
      console.error('❌ Cashfree Order Creation Error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response) {
        // API responded with error
        const errorData = error.response.data || {};
        return {
          success: false,
          error: {
            code: errorData.code || 'API_ERROR',
            message: errorData.message || error.message,
            details: errorData,
            status: error.response.status
          }
        };
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: 'Request timeout - please try again',
            details: { timeout: true }
          }
        };
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        // Network error
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Unable to connect to payment gateway',
            details: { network: true }
          }
        };
      } else {
        // Other errors
        return {
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'An unexpected error occurred',
            details: {}
          }
        };
      }
    }
  }

  /**
   * Get order details from Cashfree
   */
  async getOrderDetails(orderId) {
    try {
      const config = await this.getConfig();
      
      const response = await axios.get(`${config.apiUrl}/${orderId}`, {
        headers: {
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
          'x-api-version': this.apiVersion,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Get Order Details Error:', error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(orderId) {
    try {
      const orderResult = await this.getOrderDetails(orderId);
      
      if (orderResult.success) {
        return {
          success: true,
          status: orderResult.data.order_status,
          isPaid: orderResult.data.order_status === 'PAID',
          data: orderResult.data
        };
      } else {
        return {
          success: false,
          error: orderResult.error
        };
      }
    } catch (error) {
      console.error('❌ Payment Verification Error:', error.message);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const config = await this.getConfig();
      
      // Create a minimal test order
      const testOrder = {
        amount: 1,
        customer: {
          customer_phone: '9999999999',
          customer_email: 'test@example.com',
          customer_name: 'Test Connection'
        },
        order_id: `test_connection_${Date.now()}`
      };

      const result = await this.createOrder(testOrder);
      
      return {
        success: result.success,
        environment: config.environment,
        message: result.success ? 'Connection successful' : 'Connection failed',
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed',
        error: { message: error.message }
      };
    }
  }
}

module.exports = new CashfreeOrderService();
