const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Enhanced Cashfree Payment Service with Database Configuration Loading
 * Loads credentials from Admin Panel (/myadmin/env > Payment) with environment fallback
 */
class NewCashfreeService {
  constructor() {
    this.config = null; // Will be loaded dynamically from database
    this.client = null; // Will be initialized after config load
    this.API_VERSION = "2022-01-01"; // Using same API version as PHP implementation
  }

  /**
   * Load configuration from database (Admin Panel) with fallback to environment variables
   */
  async loadConfig() {
    try {
      // Import here to avoid circular dependency
      const EnvConfig = require('../../model/EnvConfig.modal.js');
      
      // Try to load from database first
      const dbConfig = await EnvConfig.findOne({ isActive: true });
      
      let configLoaded = false;
      if (dbConfig) {
        // Check for new field names
        const appId = dbConfig.CASHFREE_APP_ID;
        const secretKey = dbConfig.CASHFREE_SECRET_KEY;
        
        if (appId && secretKey) {
          console.log('📋 Loading Cashfree config from database (Admin Panel)');
          this.config = {
            CASHFREE_APP_ID: appId,
            CASHFREE_SECRET_KEY: secretKey,
            CASHFREE_ENV: 'PRODUCTION'  // Always force production mode
          };
          console.log('   Using new field names: CASHFREE_APP_ID/CASHFREE_SECRET_KEY');
          configLoaded = true;
        } else {
          console.log('📋 Database config found but missing Cashfree credentials');
        }
      }
      
      if (!configLoaded) {
        console.log('📋 Fallback: Loading Cashfree config from environment variables');
        // Fallback to environment variables with new field names only
        const envAppId = process.env.CASHFREE_APP_ID;
        const envSecretKey = process.env.CASHFREE_SECRET_KEY;
        
        if (envAppId && envSecretKey) {
          this.config = {
            CASHFREE_APP_ID: envAppId,
            CASHFREE_SECRET_KEY: envSecretKey,
            CASHFREE_ENV: 'PRODUCTION'  // Always force production mode
          };
          console.log('✅ Loaded Cashfree config from environment variables');
        } else {
          this.config = {
            CASHFREE_APP_ID: process.env.CASHFREE_APP_ID,
            CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
            CASHFREE_ENV: 'PRODUCTION'  // Always force production mode
          };
        }
      }
      
      // Validation
      if (!this.config.CASHFREE_APP_ID || !this.config.CASHFREE_SECRET_KEY) {
        console.warn('⚠️  Missing Cashfree credentials in both database and environment variables');
        console.warn('   Please configure credentials in Admin Panel: /myadmin/env > Payment section');
        console.warn('   Or set environment variables:');
        console.warn('   - CASHFREE_APP_ID');
        console.warn('   - CASHFREE_SECRET_KEY');
        
        throw new Error('Cashfree credentials not configured. Please set them in Admin Panel: /myadmin/env > Payment');
      }
      
      // Set API base URL - ALWAYS use production mode
      this.baseURL = 'https://api.cashfree.com/pg';
      
      // Force production environment - never use sandbox
      this.config.CASHFREE_ENV = 'PRODUCTION';
        
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
      
      console.log(`✅ Cashfree SDK initialized successfully`);
      console.log(`   Environment: ${this.config.CASHFREE_ENV}`);
      console.log(`   API URL: ${this.baseURL}`);
      console.log(`   App ID: ${this.config.CASHFREE_APP_ID.substring(0, 8)}...`);
      console.log(`   Loaded from: ${dbConfig ? 'Database (Admin Panel)' : 'Environment Variables'}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load Cashfree configuration:', error);
      throw error;
    }
  }

  /**
   * Helper method to get dynamic client URL for payment returns
   * @param {Object} req - Express request object (optional, for auto-detection)
   * @returns {string} Dynamic client URL
   */
  getDynamicClientUrl(req = null) {
    // Check environment variable first
    const envUrl = process.env.APP_BASE_URL;
    if (envUrl && envUrl !== 'auto') {
      return envUrl;
    }
    
    // If request object is provided, auto-detect from headers
    if (req) {
      const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
      const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
      
      if (host) {
        // For client URLs, use port 3000 for localhost, otherwise use the same domain
        const clientHost = host.includes('localhost') ? host.replace(/:\d+/, ':3000') : host.split(':')[0];
        
        // Force HTTPS for production mode, even with localhost
        const finalProtocol = (this.config && this.config.CASHFREE_ENV === 'PRODUCTION') ? 'https' : protocol;
        return `${finalProtocol}://${clientHost}`;
      }
    }
    
    // Fallback to localhost for development
    return 'http://localhost:3000';
  }

  /**
   * Helper method to get server URL
   * @param {Object} req - Express request object
   * @returns {string} Server URL
   */
  getDynamicServerUrl(req) {
    if (!req) {
      return 'http://localhost:5001';
    }

    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
    
    if (host) {
      // Check if this is localhost development
      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
      
      if (isLocalhost) {
        // For localhost in PRODUCTION mode, force HTTPS for Cashfree compatibility
        if (this.config.CASHFREE_ENV === 'PRODUCTION') {
          const serverHost = host.includes('localhost') ? host.replace(':3000', ':5001') : host;
          return `https://${serverHost}`;
        } else {
          // For other environments, use HTTP
          const serverHost = host.includes('localhost') ? host.replace(':3000', ':5001') : host;
          return `http://${serverHost}`;
        }
      } else {
        // Production/staging environment - ensure HTTPS
        const cleanHost = host.split(':')[0];
        return `https://${cleanHost}`;
      }
    }
    
    return 'http://localhost:5001';
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
   * @param {Object} options.req - Express request object for dynamic URL detection (optional)
   * @returns {Promise<Object>} Response with payment link
   */
  async createCashfreeOrder(options) {
    try {
      // Ensure configuration is loaded from database
      if (!this.config || !this.client) {
        console.log('🔄 Loading Cashfree configuration from database...');
        await this.loadConfig();
      }
      
      const { 
        orderId, 
        orderAmount,
        orderCurrency = "INR",
        customerName = "John Doe",
        customerEmail = "john.doe@example.com",
        customerPhone = "9999999999",
        returnUrl = null,
        req = null
      } = options;
      
      // Determine return URL based on environment and request context
      let dynamicReturnUrl;
      
      // Handle localhost with production mode by using HTTPS URLs
      if (req) {
        const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
        const isLocalhost = host && (host.includes('localhost') || host.includes('127.0.0.1'));
        
        if (this.config.CASHFREE_ENV === 'PRODUCTION' && isLocalhost) {
          console.warn('⚠️  PRODUCTION mode with localhost detected!');
          console.warn('   🔧 Using HTTPS URLs required for production Cashfree.');
          console.warn('   💡 For localhost testing with production, consider using ngrok.');
        }
      }
      
      if (returnUrl) {
        // Use provided return URL
        dynamicReturnUrl = returnUrl;
      } else {
        // Auto-detect URLs and create dynamic return URL
        const clientUrl = this.getDynamicClientUrl(req);
        
        // Use backend API endpoint that will handle payment success/failure redirection
        if (req) {
          const serverUrl = this.getDynamicServerUrl(req);
          
          // Backend API will handle dynamic redirection based on payment status  
          dynamicReturnUrl = `${serverUrl}/api/enhanced-payment/return`;
        } else {
          // Fallback to direct client URL
          dynamicReturnUrl = `${clientUrl}/payment-return`;
        }
      }
      
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
          return_url: dynamicReturnUrl
        }
      };

      console.log('Creating order with dynamic return URL:', dynamicReturnUrl);
      console.log('Order payload:', JSON.stringify(orderData, null, 2));

      // Store original environment for restoration
      const originalBaseURL = this.baseURL;

      // Make API call to create order
      const response = await this.client.post('/orders', orderData);
      
      // Restore original environment if it was temporarily changed
      if (this.baseURL !== originalBaseURL) {
        this.baseURL = originalBaseURL;
        this.client.defaults.baseURL = this.baseURL;
        console.log('🔄 Restored original Cashfree environment');
      }
      
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
          environment: this.config.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
          return_url: dynamicReturnUrl
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
      // Ensure configuration is loaded from database
      if (!this.config || !this.client) {
        console.log('🔄 Loading Cashfree configuration from database...');
        await this.loadConfig();
      }
      
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
      // Ensure configuration is loaded from database
      if (!this.config || !this.client) {
        console.log('🔄 Loading Cashfree configuration from database...');
        await this.loadConfig();
      }
      
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

/**
 * Wrapper functions for easy use with automatic config loading
 */
async function createCashfreeOrder(orderId, orderAmount, customerName, customerEmail, customerPhone, req = null) {
  const service = new NewCashfreeService();
  return await service.createCashfreeOrder({
    orderId,
    orderAmount,
    customerName,
    customerEmail,
    customerPhone,
    req
  });
}

async function verifyPayment(orderId) {
  const service = new NewCashfreeService();
  return await service.verifyPayment(orderId);
}

async function getOrderDetails(orderId) {
  const service = new NewCashfreeService();
  return await service.getOrderDetails(orderId);
}

module.exports = NewCashfreeService;

// Export wrapper functions for backward compatibility
module.exports.createCashfreeOrder = createCashfreeOrder;
module.exports.verifyPayment = verifyPayment;
module.exports.getOrderDetails = getOrderDetails;
