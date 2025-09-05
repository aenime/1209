/**
 * Enhanced Payment Routes - New Cashfree SDK Implementation
 * 
 * Provides comprehensive routing for the new Cashfree Node.js SDK integration
 * following the official documentation with 100% API compatibility with PHP version.
 */

const express = require('express');
const EnhancedPaymentController = require('../Controller/EnhancedPaymentController');
const { createCashfreeOrder } = require('../services/payment/NewCashfreeService');
const router = express.Router();

// Middleware to log all payment API requests
router.use((req, res, next) => {
  console.log(`🔄 Enhanced Payment API (New SDK): ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Same routes as PHP implementation for compatibility
// ===================================================

/**
 * GET /api/enhanced-payment/payment_cashfree?amount=100
 * Same route as PHP payment_cashfree.php
 */
router.get('/payment_cashfree', async (req, res) => {
  try {
    const amount = req.query.amount;

    // Same validation as PHP
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).send('Invalid or missing amount.');
    }

    // Same order creation logic as PHP
    const paymentLink = await createCashfreeOrder(parseFloat(amount));
    
    if (paymentLink && paymentLink.startsWith('http')) {
      // Same redirect behavior as PHP
      res.redirect(paymentLink);
    } else {
      res.status(500).send('Failed to create Cashfree order: ' + paymentLink);
    }
  } catch (error) {
    console.error('Payment redirect error:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * GET /api/enhanced-payment/create_order?amount=100&name=John&email=john@example.com&phone=9999999999
 * Same JSON API as PHP create_order.php
 */
router.get('/create_order', async (req, res) => {
  const amount = parseFloat(req.query.amount) || 100.00;
  const customerName = req.query.name || "John Doe";
  const customerEmail = req.query.email || "john.doe@example.com";
  const customerPhone = req.query.phone || "9999999999";

  try {
    const paymentLink = await createCashfreeOrder(amount, customerName, customerEmail, customerPhone);
    
    // Same JSON response structure as PHP
    if (paymentLink && paymentLink.startsWith('http')) {
      res.json({
        status: 'success',
        payment_link: paymentLink
      });
    } else {
      res.json({
        status: 'error',
        message: 'Failed to create order. ' + paymentLink
      });
    }
  } catch (error) {
    // Same error response as PHP
    res.json({
      status: 'error',
      message: 'An unexpected server error occurred. Please try again.',
      details: error.message
    });
  }
});

// Enhanced APIs using new SDK
// ===========================

/**
 * GET /api/enhanced-payment/config
 * Get payment gateway configuration (non-sensitive) using new SDK
 */
router.get('/config', EnhancedPaymentController.getPaymentConfig);

/**
 * POST /api/enhanced-payment/create-order
 * Create a new payment order with new Cashfree SDK
 */
router.post('/create-order', EnhancedPaymentController.createOrder);

/**
 * GET /api/enhanced-payment/create-order (Frontend compatibility)
 * Same endpoint as POST but for GET requests from frontend
 */
router.get('/create-order', (req, res) => {
  // Transform query params to body format expected by controller
  req.body = {
    amount: req.query.amount,
    customerName: req.query.name || req.query.customerName,
    customerEmail: req.query.email || req.query.customerEmail,
    customerPhone: req.query.phone || req.query.customerPhone
  };
  
  // Call the same controller method
  EnhancedPaymentController.createOrder(req, res);
});

/**
 * GET /api/enhanced-payment/verify/:orderId
 * Verify payment status using new SDK
 */
router.get('/verify/:orderId', EnhancedPaymentController.verifyPayment);

/**
 * POST /api/enhanced-payment/test-config
 * Test new Cashfree SDK configuration
 */
router.post('/test-config', EnhancedPaymentController.testCashfreeConfig);

// Payment Flow Handlers
// =====================

/**
 * GET /api/enhanced-payment/return
 * Handle payment return from Cashfree using new SDK
 */
router.get('/return', EnhancedPaymentController.handlePaymentReturn);

/**
 * POST /api/enhanced-payment/webhook
 * Handle webhook notifications from Cashfree using new SDK
 */
router.post('/webhook', EnhancedPaymentController.handleWebhook);

/**
 * GET /api/enhanced-payment/checkout/:orderId
 * Server-side redirect to Cashfree payment page using new SDK
 */
router.get('/checkout/:orderId', EnhancedPaymentController.handleCashfreeCheckout);

/**
 * GET /api/enhanced-payment/cleanup
 * Get cleanup instructions for frontend after payment
 */
router.get('/cleanup', EnhancedPaymentController.cleanupOrderData);

// Debug & Testing Endpoints for New SDK
// =====================================

/**
 * GET /api/enhanced-payment/test
 * Basic API health check for new SDK
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Payment API with New Cashfree SDK is working',
    version: '2022-01-01', // Same API version as PHP
    sdkType: 'cashfree-pg-sdk-nodejs',
    compatibility: '100% PHP compatible',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

/**
 * GET /api/enhanced-payment/debug/environment
 * Get environment information for new SDK debugging
 */
router.get('/debug/environment', EnhancedPaymentController.debugEnvironment);

/**
 * GET /api/enhanced-payment/debug/api-connection
 * Test API connection to Cashfree using new SDK
 */
router.get('/debug/api-connection', EnhancedPaymentController.debugApiConnection);

/**
 * GET /api/enhanced-payment/debug/simulate-return
 * Simulate payment return scenarios for testing new SDK
 */
router.get('/debug/simulate-return', (req, res) => {
  const testOrderId = req.query.order_id || `test_order_${Date.now()}`;
  const scenarios = [
    {
      scenario: 'Success',
      description: 'Successful payment return',
      url: `/api/enhanced-payment/return?order_id=${testOrderId}&cf_order_id=123456&payment_status=SUCCESS&order_status=PAID`
    },
    {
      scenario: 'Failed',
      description: 'Failed payment return',
      url: `/api/enhanced-payment/return?order_id=${testOrderId}&cf_order_id=123456&payment_status=FAILED&order_status=ACTIVE`
    },
    {
      scenario: 'Missing Order ID',
      description: 'Return without order ID',
      url: `/api/enhanced-payment/return?cf_order_id=123456&payment_status=SUCCESS`
    }
  ];
  
  res.json({
    message: 'Enhanced Payment return simulation (New SDK)',
    testOrderId: testOrderId,
    scenarios: scenarios,
    compatibility: 'Same URLs as PHP implementation',
    instructions: 'Use these URLs to test payment return handling with new SDK'
  });
});

/**
 * GET /api/enhanced-payment/debug/test-checkout-redirect
 * Test checkout redirect functionality with new SDK
 */
router.get('/debug/test-checkout-redirect', (req, res) => {
  const testOrderId = req.query.order_id || `test_order_${Date.now()}`;
  
  res.json({
    message: 'Checkout redirect test (New SDK)',
    testUrl: `/api/enhanced-payment/checkout/${testOrderId}`,
    phpCompatible: 'Same workflow as PHP implementation',
    instructions: [
      '1. Create a test order using /api/enhanced-payment/create_order',
      '2. Use the returned payment_link directly, or',
      '3. Use /api/enhanced-payment/checkout/{order_id} for server redirect'
    ],
    example: {
      directLink: 'GET /api/enhanced-payment/create_order?amount=100',
      serverRedirect: 'GET /api/enhanced-payment/checkout/{order_id}'
    }
  });
});

// Error handling middleware for enhanced payment routes
router.use((error, req, res, next) => {
  console.error('❌ Enhanced Payment API Error (New SDK):', {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'ENHANCED_PAYMENT_API_ERROR',
      message: 'An error occurred in the enhanced payment API',
      sdk: 'cashfree-pg-sdk-nodejs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  });
});

module.exports = router;
