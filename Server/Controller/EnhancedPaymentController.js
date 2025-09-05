/**
 * Enhanced Cashfree Payment Controller - New SDK Implementation
 * 
 * This controller provides the new Cashfree Node.js SDK implementation
 * following the official documentation with 100% API compatibility with PHP version.
 * 
 * Features:
 * - Official Cashfree Node.js SDK integration
 * - Same authentication method as PHP (headers + credentials)
 * - Same API endpoints (production/sandbox URLs)
 * - Same request structure (JSON payload)
 * - Same response format (payment link extraction)
 * - Same error handling (try/catch + logging)
 * - Same environment configuration (.env variables)
 */

// Import the new Cashfree service class
const NewCashfreeService = require('../services/payment/NewCashfreeService.js');
const { verifyPayment } = require('../services/payment/NewCashfreeService.js');

class EnhancedPaymentController {
  /**
   * Create Payment Order using New Cashfree SDK
   * Same as PHP create_order.php - maintains 100% API compatibility
   */
  static async createOrder(req, res) {
    try {
      const { amount, customerName, customerEmail, customerPhone } = req.body;
      
      // Same validation as PHP
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing amount.',
          code: 'INVALID_AMOUNT'
        });
      }

      // Same order creation logic as PHP
      const service = new NewCashfreeService();
      const paymentResult = await service.createCashfreeOrder({
        orderId: 'ORDER_' + Date.now(),
        orderAmount: parseFloat(amount),
        customerName: customerName || "John Doe",
        customerEmail: customerEmail || "john.doe@example.com",
        customerPhone: customerPhone || "9999999999",
        req: req // Pass request object for dynamic URL detection
      });
      
            // Same JSON response structure as PHP
      if (paymentResult.success && paymentResult.payment_link) {
        console.log(`✅ Order created successfully with payment link`);
        
        res.json({
          status: 'success',
          data: {
            payment_link: paymentResult.payment_link,
            payment_session_id: paymentResult.payment_session_id,
            order_id: paymentResult.order_id,
            cf_order_id: paymentResult.cf_order_id,
            order_status: paymentResult.order_status,
            environment: paymentResult.environment,
            order_token: paymentResult.order_token
          },
          success: true
        });
      } else {
        console.log(`❌ Order creation failed:`, paymentResult);
        
        res.status(400).json({
          status: 'error',
          message: paymentResult.message || 'Failed to create payment order',
          success: false
        });
      }
    } catch (error) {
      console.error('❌ Create order controller error:', error);
      
      // Same error response as PHP
      res.json({
        status: 'error',
        message: 'An unexpected server error occurred. Please try again.',
        details: error.message
      });
    }
  }

  /**
   * Verify Payment Status using New SDK
   */
  static async verifyPayment(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }
      
      // Use new SDK verification
      const result = await verifyPayment(orderId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          status: result.status,
          isPaid: result.isPaid,
          isActive: result.isActive,
          isExpired: result.isExpired,
          isTerminated: result.isTerminated,
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
        error: 'Payment verification failed',
        message: error.message
      });
    }
  }

  /**
   * Get Payment Configuration using New SDK
   */
  static async getPaymentConfig(req, res) {
    try {
      // Check if new Cashfree SDK is properly configured
      const isConfigured = !!(
        process.env.CASHFREE_APP_ID && 
        process.env.CASHFREE_SECRET_KEY
      );
      
      res.status(200).json({
        success: true,
        enabled: isConfigured,
        environment: process.env.CASHFREE_ENVIRONMENT || 'production',
        isConfigured: isConfigured,
        apiVersion: '2022-01-01', // Using same API version as PHP
        sdkType: 'nodejs-official'
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
   * Test New Cashfree SDK Configuration
   */
  static async testCashfreeConfig(req, res) {
    try {
      const { appId, secretKey, environment } = req.body;
      
      if (!appId || !secretKey) {
        return res.status(400).json({
          success: false,
          error: 'App ID and Secret Key are required'
        });
      }

      // Temporarily set environment variables for testing
      const originalAppId = process.env.CASHFREE_APP_ID;
      const originalSecretKey = process.env.CASHFREE_SECRET_KEY;
      const originalEnvironment = process.env.CASHFREE_ENVIRONMENT;

      process.env.CASHFREE_APP_ID = appId;
      process.env.CASHFREE_SECRET_KEY = secretKey;
      process.env.CASHFREE_ENVIRONMENT = environment || 'production';

      try {
        // Test with a minimal order using new SDK
        const testPaymentLink = await createCashfreeOrder(
          1.00,
          "Test Customer",
          "test@example.com",
          "9999999999"
        );
        
        if (testPaymentLink && testPaymentLink.startsWith('http')) {
          res.json({
            success: true,
            message: 'New Cashfree SDK configuration is working',
            environment: environment || 'sandbox'
          });
        } else {
          res.json({
            success: false,
            message: 'Configuration test failed',
            error: testPaymentLink
          });
        }
      } finally {
        // Restore original environment variables
        process.env.CASHFREE_APP_ID = originalAppId;
        process.env.CASHFREE_SECRET_KEY = originalSecretKey;
        process.env.CASHFREE_ENVIRONMENT = originalEnvironment;
      }

    } catch (error) {
      console.error('❌ Test config error:', error);
      
      res.status(400).json({
        success: false,
        error: error.message || 'Configuration test failed'
      });
    }
  }

  /**
   * Handle Payment Return using New SDK
   */
  static async handlePaymentReturn(req, res) {
    try {
      console.log('🔄 Enhanced Payment API (New SDK):', req.method, '/return', {
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      
      // 🚨 IMMEDIATE PRODUCTION FIX - Handle empty parameters from Cashfree
      const hasNoParams = Object.keys(req.query).length === 0 && Object.keys(req.body).length === 0;
      const referer = req.get('Referer') || '';
      const fromCashfree = referer.includes('cashfree.com');
      
      if (hasNoParams && fromCashfree) {
        const clientUrl = EnhancedPaymentController.getClientUrl(req);
        
        console.log('🚨 PRODUCTION FIX: Empty Cashfree return detected');
        console.log('🔍 Referer:', referer);
        
        // Detect success from referer URL
        if (referer.includes('success') || referer.includes('paid') || referer.includes('complete')) {
          console.log('🎉 SUCCESS inferred from referer');
          const successUrl = `${clientUrl}/thankyou?payment_status=success&verified=false&source=referer_inference&timestamp=${new Date().toISOString()}`;
          return res.redirect(successUrl);
        } else {
          console.log('🔄 Unclear status - redirecting to verification page');
          const verifyUrl = `${clientUrl}/thankyou?payment_status=unknown&verified=false&needs_verification=true&source=cashfree_empty`;
          return res.redirect(verifyUrl);
        }
      } {
      }
      
      // Continue with existing logic...
      console.log('🔍 Payment return received with query parameters:', req.query);
      console.log('🔍 Payment return received with body:', req.body);
      
      console.log('🔍 DEBUG: query keys length:', Object.keys(req.query).length);
      console.log('🔍 DEBUG: body keys length:', Object.keys(req.body).length);
      console.log('🔍 DEBUG: Condition check result:', Object.keys(req.query).length === 0 && Object.keys(req.body).length === 0);
      
      // SIMPLE WORKING FIX for empty parameters - IMMEDIATE SOLUTION
      if (Object.keys(req.query).length === 0 && Object.keys(req.body).length === 0) {
        const referer = req.get('Referer') || '';
        const clientUrl = EnhancedPaymentController.getClientUrl(req);
        
        console.log('🔧 SIMPLE FIX: Empty parameters detected, referer:', referer);
        
        if (referer.includes('cashfree.com')) {
          if (referer.includes('success') || referer.includes('paid')) {
            console.log('🎉 SUCCESS detected from referer - redirecting to thankyou');
            const successUrl = `${clientUrl}/thankyou?payment_status=success&verified=false&source=referer_fix&timestamp=${new Date().toISOString()}`;
            return res.redirect(successUrl);
          } else {
            console.log('🔄 Unclear status from Cashfree - redirecting to recovery');
            const recoveryUrl = `${clientUrl}/thankyou?payment_status=unknown&verified=false&needs_verification=true&source=referer_fix`;
            return res.redirect(recoveryUrl);
          }
        } else {
          console.log('❌ No Cashfree referer - redirecting to cart with enhanced error');
          const errorUrl = `${clientUrl}/cart?error=missing_payment_data&message=${encodeURIComponent('Payment data is missing. Please try again or contact support.')}&source=simple_fix`;
          return res.redirect(errorUrl);
        }
      }
      
      // ENHANCED URL PARSING - Extract from multiple sources
      const extractParametersFromUrl = (req) => {
        const params = { ...req.query, ...req.body };
        
        // Parse from full URL if query is empty
        if (Object.keys(req.query).length === 0 && req.originalUrl) {
          console.log('🔍 Parsing from full URL:', req.originalUrl);
          const urlParts = req.originalUrl.split('?');
          if (urlParts[1]) {
            const urlParams = new URLSearchParams(urlParts[1]);
            urlParams.forEach((value, key) => {
              params[key] = value;
            });
          }
        }
        
        // Parse from referer URL (Cashfree sometimes puts params there)
        const referer = req.get('Referer');
        if (referer && Object.keys(params).length === 0) {
          console.log('🔍 Parsing from referer:', referer);
          try {
            const url = new URL(referer);
            url.searchParams.forEach((value, key) => {
              params[key] = value;
            });
          } catch (e) {
            console.log('⚠️ Could not parse referer URL');
          }
        }
        
        // Parse from headers (some gateways put data in custom headers)
        Object.keys(req.headers).forEach(header => {
          if (header.toLowerCase().includes('order') || 
              header.toLowerCase().includes('payment') || 
              header.toLowerCase().includes('cf')) {
            params[`header_${header}`] = req.headers[header];
          }
        });
        
        return params;
      };
      
      const allParams = extractParametersFromUrl(req);
      console.log('🔍 All extracted parameters:', allParams);
      
      // Extract order ID from various possible parameter names
      const orderId = allParams.order_id || 
                     allParams.orderId || 
                     allParams.ORDER_ID ||
                     allParams.cf_order_id ||
                     allParams.cfOrderId ||
                     allParams.order_token ||
                     allParams.orderToken ||
                     allParams.reference_id ||
                     allParams.referenceId ||
                     allParams.merchant_order_id ||
                     allParams.merchantOrderId;
      
      // Also check for payment session ID which might contain order info
      const paymentSessionId = allParams.payment_session_id || allParams.paymentSessionId;
      
      console.log('🔍 Extracted order ID:', orderId);
      console.log('🔍 Payment session ID:', paymentSessionId);
      
      // SESSION-BASED RECOVERY - Try to recover order from session/IP tracking
      const attemptSessionRecovery = async (req, allParams) => {
        const clientIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const timestamp = new Date();
        
        console.log('🔄 Attempting session recovery for IP:', clientIp);
        
        // Try to find recent orders from same IP/user agent
        try {
          // You can enhance this with your actual order model
          // For now, we'll use a simple timestamp-based approach
          
          // Check if this looks like a successful payment using enhanced detection
          const isSuccessfulPayment = allParams.payment_status === 'SUCCESS' || 
                                     allParams.status === 'SUCCESS' ||
                                     allParams.payment_status === 'PAID' ||
                                     allParams.status === 'PAID' ||
                                     allParams.order_status === 'PAID' ||
                                     allParams.payment_state === 'SUCCESS' ||
                                     allParams.txn_status === 'SUCCESS' ||
                                     // Check referer for success indicators
                                     req.get('Referer')?.includes('success') ||
                                     req.get('Referer')?.includes('paid');
          
          if (isSuccessfulPayment) {
            console.log('🎉 Payment appears successful - creating recovery session');
            
            // Store recovery data for potential manual verification
            const recoveryData = {
              ip: clientIp,
              userAgent,
              timestamp,
              referer: req.get('Referer'),
              allParams,
              recoveryMethod: 'session_based'
            };
            
            // You could store this in database for admin review
            console.log('💾 Recovery data:', JSON.stringify(recoveryData, null, 2));
            
            return {
              recovered: true,
              orderId: `RECOVERED_${timestamp.getTime()}`,
              needsVerification: true
            };
          }
        } catch (error) {
          console.log('⚠️ Session recovery failed:', error.message);
        }
        
        return { recovered: false };
      };
      
      let sessionRecovery = { recovered: false };
      
      console.log('🔍 Debug - orderId:', orderId, 'paymentSessionId:', paymentSessionId);
      console.log('🔍 Debug - Condition check: !orderId =', !orderId, '!paymentSessionId =', !paymentSessionId);
      
      if (!orderId && !paymentSessionId) {
        console.log('🔄 Conditions met - calling attemptSessionRecovery');
        sessionRecovery = await attemptSessionRecovery(req, allParams);
        console.log('🔄 Session recovery result:', sessionRecovery);
      } else {
        console.log('🔄 Session recovery skipped - at least one condition false');
      }
      
      if (!orderId && !paymentSessionId && !sessionRecovery.recovered) {
        const clientUrl = EnhancedPaymentController.getClientUrl(req);
        
        // Enhanced parameter logging for debugging
        console.log('❌ No order ID found. Available parameters:', {
          query: req.query,
          body: req.body,
          allParams: allParams,
          headers: Object.keys(req.headers).filter(h => 
            h.toLowerCase().includes('order') || 
            h.toLowerCase().includes('payment') || 
            h.toLowerCase().includes('cf')
          ).reduce((obj, key) => {
            obj[key] = req.headers[key];
            return obj;
          }, {}),
          referer: req.get('Referer'),
          ip: req.ip || req.connection.remoteAddress
        });
        
        // Enhanced success detection using allParams
        const isPaymentSuccess = allParams.payment_status === 'SUCCESS' || 
                                allParams.status === 'SUCCESS' ||
                                allParams.payment_status === 'PAID' ||
                                allParams.status === 'PAID' ||
                                allParams.order_status === 'PAID' ||
                                allParams.payment_state === 'SUCCESS' ||
                                allParams.txn_status === 'SUCCESS' ||
                                // Check headers for success indicators
                                req.get('Referer')?.includes('success') ||
                                req.get('Referer')?.includes('paid');
                                
        if (isPaymentSuccess) {
          console.log('🎉 Payment successful but no order ID - using enhanced recovery');
          const successUrl = `${clientUrl}/thankyou?payment_status=success&verified=false&recovery_method=enhanced&timestamp=${new Date().toISOString()}`;
          return res.redirect(successUrl);
        }
        
        // If coming from Cashfree but no clear success/failure indication
        const fromCashfree = req.get('Referer')?.includes('cashfree.com');
        if (fromCashfree) {
          console.log('🔄 Payment return from Cashfree but unclear status - redirecting to recovery page');
          const recoveryUrl = `${clientUrl}/thankyou?payment_status=unknown&verified=false&needs_verification=true&timestamp=${new Date().toISOString()}`;
          return res.redirect(recoveryUrl);
        }
        
        const errorUrl = `${clientUrl}/cart?error=missing_order_id&message=${encodeURIComponent('Order ID is missing from payment return')}&debug=enhanced_parsing`;
        console.log(`❌ Missing order ID - Redirecting to: ${errorUrl}`);
        return res.redirect(errorUrl);
      }
      
      // Use recovered order ID if available
      const finalOrderId = orderId || sessionRecovery.orderId;
      
      // Verify payment status with new Cashfree SDK
      const verificationResult = await verifyPayment(finalOrderId);
      
      const clientUrl = EnhancedPaymentController.getClientUrl(req);
      
      // Enhanced verification result handling
      if (sessionRecovery.recovered) {
        console.log('🔄 Using session recovery data for verification');
        // Add recovery flag to verification result
        verificationResult.recoveryMethod = 'session_based';
        verificationResult.needsManualVerification = true;
      }
      
      if (verificationResult.success && verificationResult.isPaid) {
        // Payment successful - redirect to thank you page
        const successUrl = `${clientUrl}/thankyou?order_id=${orderId}&payment_status=success&verified=true&timestamp=${new Date().toISOString()}`;
        console.log(`✅ Payment successful for order: ${orderId} - Redirecting to: ${successUrl}`);
        res.redirect(successUrl);
      } else {
        // Payment failed or pending - redirect to cart with error
        const errorUrl = `${clientUrl}/cart?error=payment_failed&order_id=${orderId}&payment_status=${verificationResult.status || 'failed'}`;
        console.log(`❌ Payment verification failed for order: ${orderId}`);
        console.log(`   Order Status: ${verificationResult.status}`);
        console.log(`   Payment Status: ${verificationResult.payment_status}`);
        
        // 🔧 DEVELOPMENT MODE: Allow ACTIVE orders to be treated as successful for testing
        const isDevelopment = process.env.NODE_ENV === 'development' || req.get('host')?.includes('localhost');
        const hasSuccessReferer = req.get('Referer')?.includes('success');
        
        if (isDevelopment && verificationResult.status === 'ACTIVE' && hasSuccessReferer) {
          console.log('🔧 DEV MODE: Treating ACTIVE order as successful for testing');
          const successUrl = `${clientUrl}/thankyou?payment_status=success&verified=false&source=dev_mode_active&order_id=${orderId}&timestamp=${new Date().toISOString()}`;
          return res.redirect(successUrl);
        }
        
        const cartErrorUrl = `${clientUrl}/cart?error=payment_failed&order_id=${orderId}&payment_status=${verificationResult.status || 'failed'}`;
        console.log(`❌ Payment failed for order: ${orderId} - Status: ${verificationResult.status} - Redirecting to: ${cartErrorUrl}`);
        return res.redirect(cartErrorUrl);
        res.redirect(errorUrl);
      }
      
    } catch (error) {
      console.error('❌ Payment return error:', error);
      
      const clientUrl = EnhancedPaymentController.getClientUrl(req);
      const errorUrl = `${clientUrl}/cart?error=payment_verification_failed&message=${encodeURIComponent(error.message)}`;
      console.log(`❌ Payment verification failed - Redirecting to: ${errorUrl}`);
      res.redirect(errorUrl);
    }
  }

  /**
   * Server-side Checkout Redirect using New SDK
   */
  static async handleCashfreeCheckout(req, res) {
    try {
      const { orderId } = req.params;
      
      console.log('🚀 CASHFREE CHECKOUT HANDLER - UPDATED VERSION CALLED!');
      console.log('📝 OrderId received:', orderId, 'Length:', orderId.length);
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }
      
      console.log('🔍 Checking orderId:', orderId, 'Length:', orderId.length);
      
      // Check if this is a payment session ID (shorter) or order ID (longer)
      const isSessionId = orderId.length <= 20; // Session IDs are typically 20 chars or less
      
      console.log('🔍 Is session ID?', isSessionId);
      
      if (isSessionId) {
        // This is a payment session ID, use it directly for checkout
        const isProduction = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION';
        const baseUrl = isProduction 
          ? 'https://api.cashfree.com/pg/view/sessions/checkout/web'
          : 'https://api-test.cashfree.com/pg/view/sessions/checkout/web';
        
        const checkoutUrl = `${baseUrl}/${orderId}`;
        console.log('✅ Using session ID for direct checkout:', checkoutUrl);
        
        return res.redirect(checkoutUrl);
      }
      
      // If it's an order ID, try to get order details using new SDK
      const service = new NewCashfreeService();
      const orderResult = await service.getOrderDetails(orderId);
      
      if (!orderResult.success || !orderResult.data.payment_session_id) {
        throw new Error('Payment session not found or order invalid');
      }

      const orderData = orderResult.data;
      
      // Determine Cashfree environment URLs based on new SDK
      const isProduction = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION';
      const baseUrl = isProduction 
        ? 'https://payments.cashfree.com'
        : 'https://payments-test.cashfree.com';
      
      // Updated URL formats for 2022-01-01 API version (same as PHP)
      const redirectUrls = [
        `${baseUrl}/checkout/${orderData.payment_session_id}`,
        `${baseUrl}/pgappnew/checkout?session_id=${orderData.payment_session_id}`,
        `${baseUrl}/billpay/checkout/post/submit?payment_session_id=${orderData.payment_session_id}`
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
                <strong>Environment:</strong> ${isProduction ? 'Production' : 'Sandbox'}<br>
                <strong>API Version:</strong> 2022-01-01 (Same as PHP)
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
        error: 'Failed to redirect to payment gateway',
        message: error.message
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
   * Debug: Test API Connection using New SDK
   */
  static async debugApiConnection(req, res) {
    try {
      // Test with a minimal order using new SDK
      const testPaymentLink = await createCashfreeOrder(
        1.00,
        "API Test Customer",
        "test@example.com",
        "9999999999"
      );
      
      if (testPaymentLink && testPaymentLink.startsWith('http')) {
        res.json({
          success: true,
          status: 'New Cashfree SDK API connection successful',
          testPaymentLink: testPaymentLink,
          environment: process.env.CASHFREE_ENVIRONMENT || 'production',
          apiVersion: '2022-01-01'
        });
      } else {
        res.status(500).json({
          success: false,
          status: 'API connection failed',
          error: testPaymentLink
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to test API connection with new SDK',
        message: error.message,
        details: error.response?.data || error.stack
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
