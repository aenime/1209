/**
 * Enhanced Cashfree Payment Controller
 * 
 * This controller provides a robust implementation of Cashfree Payment Gateway integration
 * with comprehensive error handling, data validation, and proper API v4 support.
 * 
 * Features:
 * - Complete Cashfree Order Creation API v4 implementation
 * - Enhanced error handling and validation
 * - Server-side redirect solution for payment URLs
 * - Webhook handling for payment notifications
 * - Comprehensive debug endpoints for troubleshooting
 * - Auto-detection of URLs for different environments
 */

const CashfreeOrderService = require('../services/payment/CashfreeOrderService');

class EnhancedPaymentController {
  /**
   * Create Payment Order
   * 
   * Creates a new payment order using Cashfree Payment Gateway API v4.
   * Handles comprehensive validation, error handling, and environment detection.
   */
  static async createOrder(req, res) {
    try {
      const orderData = req.body;
      
      // Basic validation
      if (!orderData.amount || !orderData.customer) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Missing required fields: amount and customer details',
            fields: ['amount', 'customer']
          }
        });
      }

      // Auto-detect server URL for return/notify URLs
      const serverUrl = EnhancedPaymentController.getServerUrl(req);
      
      // Create order using the enhanced service
      const result = await CashfreeOrderService.createOrder(orderData, serverUrl);
      
      if (result.success) {
        // Log successful order creation
        console.log(`✅ Order created successfully: ${result.data.order_id}`);
        
        res.status(200).json(result);
      } else {
        // Handle API errors with proper status codes
        const statusCode = result.error.status || 400;
        console.error(`❌ Order creation failed: ${result.error.message}`);
        
        res.status(statusCode).json(result);
      }
      
    } catch (error) {
      console.error('❌ Create order controller error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Verify Payment Status
   */
  static async verifyPayment(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ORDER_ID',
            message: 'Order ID is required'
          }
        });
      }
      
      const result = await CashfreeOrderService.verifyPayment(orderId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          status: result.status,
          isPaid: result.isPaid,
          order: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: 'Payment verification failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Get Payment Configuration
   * Returns non-sensitive configuration for frontend
   */
  static async getPaymentConfig(req, res) {
    try {
      const config = await CashfreeOrderService.getConfig();
      
      res.status(200).json({
        success: true,
        enabled: config.enabled,
        environment: config.environment,
        isConfigured: !!(config.enabled && config.clientId && config.clientSecret),
        apiVersion: '2025-01-01'
      });
    } catch (error) {
      // Return safe defaults if configuration fails
      res.status(200).json({
        success: true,
        enabled: false,
        environment: 'sandbox',
        isConfigured: false,
        error: 'Configuration not available'
      });
    }
  }

  /**
   * Test Cashfree Configuration
   * Validates credentials by making a test API call
   */
  static async testCashfreeConfig(req, res) {
    try {
      const { clientId, clientSecret, environment } = req.body;
      
      if (!clientId || !clientSecret) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Client ID and Secret are required'
          }
        });
      }

      // Temporarily set environment variables for testing
      const originalClientId = process.env.CASHFREE_CLIENT_ID;
      const originalClientSecret = process.env.CASHFREE_CLIENT_SECRET;
      const originalEnvironment = process.env.CASHFREE_ENVIRONMENT;

      process.env.CASHFREE_CLIENT_ID = clientId;
      process.env.CASHFREE_CLIENT_SECRET = clientSecret;
      process.env.CASHFREE_ENVIRONMENT = environment || 'sandbox';

      try {
        const result = await CashfreeOrderService.testConnection();
        
        res.status(200).json({
          success: result.success,
          message: result.message,
          environment: result.environment,
          error: result.error
        });
      } finally {
        // Restore original environment variables
        process.env.CASHFREE_CLIENT_ID = originalClientId;
        process.env.CASHFREE_CLIENT_SECRET = originalClientSecret;
        process.env.CASHFREE_ENVIRONMENT = originalEnvironment;
      }

    } catch (error) {
      console.error('❌ Test config error:', error);
      
      res.status(400).json({
        success: false,
        error: {
          code: 'CONFIG_TEST_FAILED',
          message: error.message || 'Configuration test failed'
        }
      });
    }
  }

  /**
   * Handle Payment Return from Cashfree
   * Processes the return URL callback from Cashfree after payment
   */
  static async handlePaymentReturn(req, res) {
    try {
      // Extract order ID from various possible parameter names
      const orderId = req.query.order_id || req.query.orderId || req.query.ORDER_ID;
      
      if (!orderId) {
        const clientUrl = EnhancedPaymentController.getClientUrl(req);
        return res.redirect(`${clientUrl}/cart?error=missing_order_id`);
      }
      
      // Verify payment status with Cashfree
      const verificationResult = await CashfreeOrderService.verifyPayment(orderId);
      
      const clientUrl = EnhancedPaymentController.getClientUrl(req);
      
      if (verificationResult.success && verificationResult.isPaid) {
        // Payment successful - redirect to thank you page
        const successUrl = `${clientUrl}/thankyou?order_id=${orderId}&payment_status=success&verified=true&timestamp=${new Date().toISOString()}`;
        console.log(`✅ Payment successful for order: ${orderId}`);
        res.redirect(successUrl);
      } else {
        // Payment failed or pending - redirect to cart with error
        const errorUrl = `${clientUrl}/cart?error=payment_failed&order_id=${orderId}`;
        console.log(`❌ Payment failed for order: ${orderId}`);
        res.redirect(errorUrl);
      }
      
    } catch (error) {
      console.error('❌ Payment return error:', error);
      
      const clientUrl = EnhancedPaymentController.getClientUrl(req);
      const errorUrl = `${clientUrl}/cart?error=payment_verification_failed`;
      res.redirect(errorUrl);
    }
  }

  /**
   * Server-side Checkout Redirect
   * Handles the redirect to Cashfree payment page
   */
  static async handleCashfreeCheckout(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ORDER_ID',
            message: 'Order ID is required'
          }
        });
      }
      
      // Get order details from Cashfree
      const orderResult = await CashfreeOrderService.getOrderDetails(orderId);
      
      if (!orderResult.success || !orderResult.data.payment_session_id) {
        throw new Error('Payment session not found or order invalid');
      }

      const orderData = orderResult.data;
      
      // Determine Cashfree environment URLs
      const isProduction = orderData.environment === 'production';
      const baseUrl = isProduction 
        ? 'https://payments.cashfree.com'
        : 'https://payments-test.cashfree.com';
      
      // Multiple URL formats for maximum compatibility with Cashfree 2025 API
      const redirectUrls = [
        `${baseUrl}/checkout/${orderData.payment_session_id}`,
        `${baseUrl}/payments/v4/checkout?session_id=${orderData.payment_session_id}`,
        `${baseUrl}/pgappnew/checkout?session_id=${orderData.payment_session_id}`
      ];
      
      // Generate professional redirect page
      const redirectHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redirecting to Payment Gateway</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
              }
              .container { 
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                text-align: center;
                max-width: 450px;
                width: 100%;
              }
              .spinner { 
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h1 { 
                color: #333;
                margin-bottom: 10px;
                font-size: 24px;
                font-weight: 600;
              }
              p { 
                color: #666;
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.5;
              }
              .order-info {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
              }
              .fallback { 
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              .btn {
                display: inline-block;
                margin: 8px;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
              }
              .btn:hover { background: #5a6fd8; }
              .security-info {
                background: #e8f5e8;
                padding: 12px;
                border-radius: 6px;
                margin-top: 20px;
                font-size: 12px;
                color: #2d5a2d;
              }
            </style>
            <script>
              setTimeout(() => {
                window.location.href = "${redirectUrls[0]}";
              }, 3000);
            </script>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h1>Redirecting to Payment</h1>
              <p>Please wait while we securely redirect you to the payment gateway...</p>
              
              <div class="order-info">
                <strong>Order ID:</strong> ${orderId}<br>
                <strong>Amount:</strong> ₹${orderData.order_amount}<br>
                <strong>Environment:</strong> ${isProduction ? 'Production' : 'Sandbox'}
              </div>

              <div class="security-info">
                🔒 Your payment is secured by Cashfree Payment Gateway
              </div>
              
              <div class="fallback">
                <p style="font-size: 14px; color: #888; margin-bottom: 16px;">
                  If you're not redirected automatically, click below:
                </p>
                ${redirectUrls.map((url, index) => 
                  `<a href="${url}" class="btn" target="_self">Payment Gateway ${index + 1}</a>`
                ).join('')}
              </div>
            </div>
          </body>
        </html>
      `;
      
      res.send(redirectHtml);
    } catch (error) {
      console.error('❌ Cashfree checkout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHECKOUT_REDIRECT_FAILED',
          message: error.message,
          details: 'Failed to redirect to payment gateway'
        }
      });
    }
  }

  /**
   * Handle Webhook Notifications from Cashfree
   */
  static async handleWebhook(req, res) {
    try {
      const webhookData = req.body;
      
      console.log('📨 Cashfree webhook received:', {
        order_id: webhookData.order_id,
        cf_order_id: webhookData.cf_order_id,
        order_status: webhookData.order_status,
        payment_status: webhookData.payment_status,
        timestamp: new Date().toISOString()
      });
      
      // TODO: Implement webhook signature verification
      // TODO: Update order status in your database
      // TODO: Send confirmation emails/SMS
      // TODO: Update inventory
      
      res.status(200).json({ 
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * Clean up order data after payment processing
   */
  static cleanupOrderData(req, res) {
    try {
      res.json({
        success: true,
        message: 'Order cleanup instructions',
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
        error: {
          code: 'CLEANUP_FAILED',
          message: error.message
        }
      });
    }
  }

  /**
   * Debug: Get Environment Information
   */
  static async debugEnvironment(req, res) {
    try {
      const autoClientUrl = EnhancedPaymentController.getClientUrl(req);
      const autoServerUrl = EnhancedPaymentController.getServerUrl(req);
      
      res.json({
        environment: process.env.NODE_ENV || 'development',
        urls: {
          client_auto: autoClientUrl,
          server_auto: autoServerUrl,
          client_env: process.env.CLIENT_URL || 'NOT SET',
          server_env: process.env.SERVER_URL || 'NOT SET'
        },
        cashfree: {
          client_id: process.env.CASHFREE_CLIENT_ID ? 'SET' : 'NOT SET',
          client_secret: process.env.CASHFREE_CLIENT_SECRET ? 'SET' : 'NOT SET',
          environment: process.env.CASHFREE_ENVIRONMENT || 'NOT SET',
          enabled: process.env.CASHFREE_ENABLED || 'NOT SET'
        },
        request_info: {
          host: req.get('Host'),
          protocol: req.protocol,
          forwarded_proto: req.get('X-Forwarded-Proto'),
          forwarded_host: req.get('X-Forwarded-Host')
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get environment info',
        message: error.message
      });
    }
  }

  /**
   * Debug: Test API Connection
   */
  static async debugApiConnection(req, res) {
    try {
      const result = await CashfreeOrderService.testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to test API connection',
        message: error.message
      });
    }
  }

  /**
   * Helper: Auto-detect client URL from request
   */
  static getClientUrl(req) {
    // Check environment variable first
    if (process.env.CLIENT_URL && process.env.CLIENT_URL !== 'auto') {
      return process.env.CLIENT_URL;
    }
    
    // Auto-detect from request headers  
    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
    
    if (host) {
      // For client URLs, use port 3000 for localhost, otherwise use the same domain
      const clientHost = host.includes('localhost') ? host.replace(/:\d+/, ':3000') : host.split(':')[0];
      return `${protocol}://${clientHost}`;
    }
    
    return 'http://localhost:3000';
  }
  
  /**
   * Helper: Auto-detect server URL from request
   */
  static getServerUrl(req) {
    // Check environment variable first
    if (process.env.SERVER_URL && process.env.SERVER_URL !== 'auto') {
      return process.env.SERVER_URL;
    }
    
    // Auto-detect from request headers
    const protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
    const host = req.get('X-Forwarded-Host') || req.get('Host') || req.hostname;
    
    if (host) {
      // For API calls, typically same domain but different port for localhost
      const serverHost = host.includes('localhost') ? host.replace(/:\d+/, ':5001') : host.split(':')[0];
      return `${protocol}://${serverHost}`;
    }
    
    return 'http://localhost:5001';
  }
}

module.exports = EnhancedPaymentController;
