const axios = require('axios');

/**
 * Cashfree Configuration Helper
 * Retrieves Cashfree API credentials from environment or database
 */
async function getCashfreeConfig() {
  try {
    // Try to get configuration from database first (EnvConfig model)
    const EnvConfig = require('../model/EnvConfig.modal');
    const config = await EnvConfig.findOne({ configName: 'default' });
    
    let clientId, clientSecret, environment, enabled;
    
    if (config) {
      // Use database configuration (preferred for admin-managed settings)
      clientId = config.CASHFREE_CLIENT_ID || process.env.CASHFREE_CLIENT_ID;
      clientSecret = config.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET;
      environment = config.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENVIRONMENT || 'sandbox';
      enabled = config.CASHFREE_ENABLED === true || config.CASHFREE_ENABLED === 'true';
    } else {
      // Fallback to environment variables
      clientId = process.env.CASHFREE_CLIENT_ID;
      clientSecret = process.env.CASHFREE_CLIENT_SECRET;
      environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';
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
      enabled
    };
  } catch (error) {
    throw new Error(`Failed to get Cashfree configuration: ${error.message}`);
  }
}

/**
 * Payment Controller Class
 * 
 * Handles all payment-related operations for the e-commerce platform.
 * Implements Cashfree Payment Gateway integration with proper error handling,
 * data validation, and environment management.
 */
class PaymentController {
  /**
   * Create Payment Order
   * 
   * Creates a new payment order using Cashfree Payment Gateway API v4.
   * Handles both sandbox testing and production environments with:
   * - Customer data extraction and validation
   * - Order data construction with unique identifiers
   * - Real-time API integration with Cashfree
   * - Environment-specific behavior (test vs production)
   * 
   * @param {Object} req - Express request object containing order details
   * @param {Object} req.body - Order data including amount, customer info, products
   * @param {Object} res - Express response object
   */
  static async createOrder(req, res) {
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.amount || !orderData.customer) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: amount and customer details'
        });
      }
      
      // Get Cashfree configuration
      const config = await getCashfreeConfig();
      
      // Generate unique order ID
      const orderId = orderData.order_id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine API URL based on environment
      const apiUrl = config.environment === 'production' 
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';
      
      // Auto-detect URLs for return/notify URLs
      let returnUrl, notifyUrl;
      
      // Check if we're in a localhost development environment
      const isLocalhost = req.get('Host')?.includes('localhost') || req.get('Host')?.includes('127.0.0.1');
      
      if (isLocalhost) {
        // For localhost development, use local return URLs
        const clientUrl = PaymentController.getClientUrl(req);
        returnUrl = `${clientUrl}/payment-return`;
        notifyUrl = `${PaymentController.getServerUrl(req)}/api/payment/webhook`;
        console.log(`🏠 Localhost detected - using return URL: ${returnUrl}`);
      } else {
        // Production or HTTPS environment - Use backend API for return handling
        const serverUrl = PaymentController.getServerUrl(req);
        
        // IMPORTANT: Cashfree return_url should point to backend API endpoint
        // The backend will then redirect to appropriate frontend pages
        returnUrl = `${serverUrl}/api/payment/return`;  // Backend API that handles redirects
        notifyUrl = `${serverUrl}/api/payment/webhook`;  // Backend webhook for server notifications
      }

      const requestData = {
        order_amount: orderData.amount,
        order_currency: orderData.order_currency || 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: orderData.customer.customer_id || `CUST_${Date.now()}`,
          customer_phone: orderData.customer.customer_phone || orderData.customer.mobile || '9999999999',
          customer_email: orderData.customer.customer_email || orderData.customer.email || 'customer@example.com',
          customer_name: orderData.customer.customer_name || orderData.customer.name || 'Customer'
        },
        order_note: orderData.orderNote || 'Payment for order',
        ...(returnUrl && {
          order_meta: {
            return_url: returnUrl,
            notify_url: notifyUrl
          }
        })
      };
      
      // Add cart details if provided
      if (orderData.cart_details) {
        requestData.cart_details = orderData.cart_details;
      }
      
      // Make API call to Cashfree
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
          'x-api-version': '2025-01-01',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      // Return successful response
      res.status(200).json({
        success: true,
        data: {
          ...response.data,
          api_version: '2025-01-01',
          environment: config.environment
        }
      });
      
    } catch (error) {
      console.error('Create order error:', error);
      
      if (error.response) {
        // Cashfree API error
        res.status(error.response.status || 500).json({
          success: false,
          error: 'Cashfree API error',
          message: error.response.data?.message || error.message,
          details: error.response.data
        });
      } else {
        // Network or other error
        res.status(500).json({
          success: false,
          error: 'Payment order creation failed',
          message: error.message
        });
      }
    }
  }

  // Verify payment status - Following official documentation
  static async verifyPayment(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }
      
      const result = await PaymentController.verifyPaymentStatus(orderId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          status: result.status,
          order: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Payment verification failed',
          message: result.error
        });
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Payment verification failed',
        message: error.message
      });
    }
  }

  // Get Cashfree environment configuration for frontend
  static async getPaymentConfig(req, res) {
    try {
      const config = await getCashfreeConfig();
      
      // Only send non-sensitive configuration to frontend
      res.status(200).json({
        success: true,
        enabled: config.enabled,
        environment: config.environment,
        isConfigured: !!(config.enabled && config.clientId && config.clientSecret)
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        enabled: false,
        environment: 'sandbox',
        isConfigured: false
      });
    }
  }

  // Test Cashfree configuration
  static async testCashfreeConfig(req, res) {
    try {
      const { clientId, clientSecret, environment } = req.body;
      
      if (!clientId || !clientSecret) {
        return res.status(400).json({
          success: false,
          error: 'Client ID and Secret are required'
        });
      }

      // Use direct API call for testing credentials
      const apiUrl = environment === 'production' 
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

      const testOrder = {
        order_amount: 1,
        order_currency: 'INR',
        order_id: 'test_' + Date.now(),
        customer_details: {
          customer_id: 'test_customer',
          customer_phone: process.env.TEST_CUSTOMER_PHONE || '9999999999',
          customer_name: 'Test Customer',
          customer_email: 'test@example.com'
        }
      };

      const axios = require('axios');
      const response = await axios.post(apiUrl, testOrder, {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
          'x-api-version': '2025-01-01'
        },
        timeout: 10000
      });
      
      res.json({
        success: true,
        message: 'Configuration is valid',
        environment: environment
      });

    } catch (error) {
      console.error('Test config error:', error);
      
      res.status(400).json({
        success: false,
        error: error.message || 'Invalid Cashfree configuration'
      });
    }
  }

  // Handle payment return from Cashfree
  static async handlePaymentReturn(req, res) {
    try {
      const orderId = req.query.order_id || req.query.orderId || req.query.ORDER_ID;
      
      if (!orderId) {
        // Redirect to cart with error if no order ID
        return res.redirect('/cart?error=missing_order_id');
      }
      
      // Verify payment status with Cashfree
      const verificationResult = await PaymentController.verifyPaymentStatus(orderId);
      
      const clientUrl = PaymentController.getClientUrl(req);
      
      if (verificationResult.success && verificationResult.status === 'PAID') {
        // Payment successful - redirect to thank you page
        const thankYouUrl = `${clientUrl}/thankyou?order_id=${orderId}&payment_status=success&verified=true&timestamp=${new Date().toISOString()}`;
        res.redirect(thankYouUrl);
      } else {
        // Payment failed or pending - redirect to cart with error
        const cartUrl = `${clientUrl}/cart?error=payment_failed&order_id=${orderId}`;
        res.redirect(cartUrl);
      }
      
    } catch (error) {
      console.error('Payment return error:', error);
      
      // Redirect to cart with error
      const clientUrl = PaymentController.getClientUrl(req);
      const cartUrl = `${clientUrl}/cart?error=payment_verification_failed`;
      res.redirect(cartUrl);
    }
  }

  // Verify payment status helper method
  static async verifyPaymentStatus(orderId) {
    try {
      const config = await getCashfreeConfig();
      
      const apiUrl = config.environment === 'production' 
        ? `https://api.cashfree.com/pg/orders/${orderId}`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

      const axios = require('axios');
      const response = await axios.get(apiUrl, {
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
        status: response.data.order_status,
        data: response.data
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // 🔥 NEW: Helper method to clean up order data after successful processing
  static cleanupOrderData(req, res) {
    try {
      // Return cleanup instructions for frontend
      res.json({
        success: true,
        message: 'Order cleanup completed',
        actions: [
          'Clear localStorage payment data',
          'Clear sessionStorage order data',
          'Reset cart state',
          'Clear payment form state'
        ],
        storageKeys: [
          'currentOrderData',
          'pendingPaymentOrder',
          'paymentAmount',
          'cartTotalPrice',
          'checkoutData',
          'activePaymentSession'
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Cleanup failed',
        message: error.message
      });
    }
  }

  // Webhook handler for payment notifications
  static async handleWebhook(req, res) {
    try {
      const webhookData = req.body;
      
      // Verify webhook signature if configured
      // TODO: Implement webhook signature verification
      
      console.log('Cashfree webhook received:', webhookData);
      
      // Process webhook data and update order status in database
      // TODO: Update order status in your database based on webhook data
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Server-side redirect route for Cashfree checkout (NEW)
  static async handleCashfreeCheckout(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'Order ID is required' });
      }
      
      // Get order details from Cashfree
      const orderDetails = await PaymentController.verifyPaymentStatus(orderId);
      
      if (!orderDetails.success || !orderDetails.data.payment_session_id) {
        throw new Error('Payment session not found or order invalid');
      }
      
      // Multiple Cashfree URL formats for maximum compatibility
      const redirectUrls = [
        `https://payments-test.cashfree.com/pgappnew/checkout?session_id=${orderDetails.data.payment_session_id}`,
        `https://payments-test.cashfree.com/checkout/${orderDetails.data.payment_session_id}`,
        `https://payments-test.cashfree.com/billpay/checkout/post/submit?${new URLSearchParams({
          order_id: orderId,
          payment_session_id: orderDetails.data.payment_session_id
        })}`
      ];
      
      // Auto-redirect to primary URL with fallback options
      const redirectHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting to Payment...</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0; padding: 20px; min-height: 100vh;
                display: flex; align-items: center; justify-content: center;
              }
              .container { 
                background: white; padding: 40px; border-radius: 12px; 
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                text-align: center; max-width: 400px; width: 100%;
              }
              .spinner { 
                width: 40px; height: 40px; border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea; border-radius: 50%;
                animation: spin 1s linear infinite; margin: 0 auto 20px;
              }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              h3 { color: #333; margin-bottom: 10px; }
              p { color: #666; font-size: 14px; margin-bottom: 20px; }
              a { 
                display: inline-block; margin: 5px; padding: 10px 20px;
                background: #667eea; color: white; text-decoration: none;
                border-radius: 6px; font-size: 14px;
              }
              a:hover { background: #5a6fd8; }
              .fallback { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
            </style>
            <script>
              setTimeout(() => {
                window.location.href = "${redirectUrls[0]}";
              }, 2000);
            </script>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h3>Redirecting to Payment Gateway...</h3>
              <p>Please wait while we redirect you to the secure payment page.</p>
              <div class="fallback">
                <p style="font-size: 12px; color: #888;">If not redirected automatically, click below:</p>
                ${redirectUrls.map((url, index) => 
                  `<a href="${url}" target="_self">Payment Option ${index + 1}</a>`
                ).join('')}
              </div>
            </div>
          </body>
        </html>
      `;
      
      res.send(redirectHtml);
    } catch (error) {
      console.error('Cashfree checkout error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message,
        error: 'Failed to redirect to payment gateway'
      });
    }
  }

  // Debug endpoint to simulate payment return for testing
  static async debugSimulatePaymentReturn(req, res) {
    try {
      const testOrderId = `test_order_${Date.now()}`;
      const testScenarios = [
        {
          scenario: 'Success',
          url: `/api/payment/return?order_id=${testOrderId}&cf_order_id=123456&payment_status=SUCCESS`
        },
        {
          scenario: 'Failed',
          url: `/api/payment/return?order_id=${testOrderId}&cf_order_id=123456&payment_status=FAILED`
        },
        {
          scenario: 'Missing Order ID',
          url: `/api/payment/return?cf_order_id=123456&payment_status=SUCCESS`
        }
      ];
      
      res.json({
        message: 'Payment return simulation endpoints',
        testOrderId: testOrderId,
        scenarios: testScenarios,
        instructions: 'Use these URLs to test payment return handling'
      });
      
    } catch (error) {
      res.status(500).json({
        error: 'Simulation failed',
        message: error.message
      });
    }
  }

  // Debug endpoint to test payment return URL parsing
  static async debugTestPaymentReturn(req, res) {
    try {
      // Test different URL formats that Cashfree might send
      const testUrls = [
        '/api/payment/return?order_id=test_123&cf_order_id=456&order_token=token_789',
        '/api/payment/return?orderId=test_123&cfOrderId=456&orderToken=token_789',
        '/api/payment/return?ORDER_ID=test_123&CF_ORDER_ID=456&ORDER_TOKEN=token_789',
        '/api/payment/return?order_id=test_123',
        '/api/payment/return?cf_order_id=456&order_token=token_789',
        '/api/payment/return'
      ];
      
      const results = testUrls.map(url => {
        const urlObj = new URL(url, 'http://localhost');
        const params = Object.fromEntries(urlObj.searchParams);
        
        return {
          url: url,
          extractedOrderId: params.order_id || params.orderId || params.ORDER_ID,
          allParams: params,
          isValid: !!(params.order_id || params.orderId || params.ORDER_ID)
        };
      });
      
      res.json({
        message: 'Payment return URL parsing test results',
        testResults: results,
        tips: [
          'Check if Cashfree is using different parameter names',
          'Verify the return_url configuration in order creation',
          'Check for case sensitivity in parameter names',
          'Ensure no URL encoding issues'
        ]
      });
      
    } catch (error) {
      res.status(500).json({
        error: 'Test failed',
        message: error.message
      });
    }
  }

  // Debug endpoint to check environment configuration
  static async debugEnvironment(req, res) {
    try {
      const autoClientUrl = PaymentController.getClientUrl(req);
      const autoServerUrl = PaymentController.getServerUrl(req);
      
      res.json({
        NODE_ENV: process.env.NODE_ENV,
        // Environment variables
        CLIENT_URL_ENV: process.env.CLIENT_URL || 'NOT SET',
        SERVER_URL_ENV: process.env.SERVER_URL || 'NOT SET',
        // Auto-detected URLs
        CLIENT_URL_AUTO: autoClientUrl,
        SERVER_URL_AUTO: autoServerUrl,
        // Other config
        CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID ? 'SET' : 'NOT SET',
        CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET ? 'SET' : 'NOT SET',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get environment info',
        message: error.message
      });
    }
  }

  // Debug endpoint to check Cashfree configuration
  static async debugCashfreeConfig(req, res) {
    try {
      const config = await getCashfreeConfig();
      
      res.json({
        environment: config.environment,
        clientId: config.clientId ? 'SET (starts with: ' + config.clientId.substring(0, 8) + '...)' : 'NOT SET',
        clientSecret: config.clientSecret ? 'SET (starts with: ' + config.clientSecret.substring(0, 8) + '...)' : 'NOT SET',
        apiUrl: config.environment === 'production' 
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get Cashfree config',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Debug endpoint to test Cashfree API connection
  static async debugApiConnection(req, res) {
    try {
      const config = await getCashfreeConfig();
      
      const apiUrl = config.environment === 'production' 
        ? 'https://api.cashfree.com/pg/orders/test_connection_check'
        : 'https://sandbox.cashfree.com/pg/orders/test_connection_check';

      const axios = require('axios');
      
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': config.clientId,
            'x-client-secret': config.clientSecret,
            'x-api-version': '2025-01-01'
          },
          timeout: 10000
        });
        
        res.json({
          status: 'API connection successful',
          response: response.data
        });
      } catch (apiError) {
        res.status(500).json({
          status: 'API connection failed',
          error: {
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            data: apiError.response?.data,
            message: apiError.message,
            config: {
              url: apiError.config?.url,
              method: apiError.config?.method,
              headers: apiError.config?.headers
            }
          }
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to test API connection',
        message: error.message
      });
    }
  }

  // Helper method to automatically get client URL from request
  static getClientUrl(req) {
    // Check environment variable first (if explicitly set)
    if (process.env.CLIENT_URL && process.env.CLIENT_URL !== 'auto') {
      return process.env.CLIENT_URL;
    }
    
    // Auto-detect from request headers  
    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
    
    // Handle different deployment scenarios
    if (host) {
      // For client URLs, use port 3000 for localhost, otherwise use the same domain
      const cleanHost = host.includes('localhost') ? host.replace('5001', '3000') : host.split(':')[0];
      const clientUrl = `${protocol}://${cleanHost}`;
      
      return clientUrl;
    }
    
    // Fallback to localhost for development
    return 'http://localhost:3000';
  }
  
  // Helper method to automatically get server URL from request
  static getServerUrl(req) {
    // Check environment variable first (if explicitly set)
    if (process.env.SERVER_URL && process.env.SERVER_URL !== 'auto') {
      return process.env.SERVER_URL;
    }
    
    // Auto-detect from request headers
    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
    
    // Handle different deployment scenarios
    if (host) {
      // For API calls, typically same domain as client
      const cleanHost = host.includes('localhost') ? host.replace('3000', '5001') : host.split(':')[0];
      const serverUrl = `${protocol}://${cleanHost}`;
      
      return serverUrl;
    }
    
    // Fallback to localhost for development
    return 'http://localhost:5001';
  }
}

module.exports = PaymentController;
