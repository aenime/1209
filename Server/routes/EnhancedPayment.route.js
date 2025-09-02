/**
 * Enhanced Payment Routes
 * 
 * Provides comprehensive routing for Cashfree Payment Gateway integration
 * with enhanced error handling, validation, and debug capabilities.
 */

const express = require('express');
const EnhancedPaymentController = require('../Controller/EnhancedPaymentController');
const router = express.Router();

// Middleware to log all payment API requests
router.use((req, res, next) => {
  console.log(`🔄 Payment API: ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Core Payment APIs
// ===================

/**
 * GET /api/payment/config
 * Get payment gateway configuration (non-sensitive)
 */
router.get('/config', EnhancedPaymentController.getPaymentConfig);

/**
 * POST /api/payment/create-order
 * Create a new payment order with Cashfree
 * 
 * Body:
 * {
 *   "amount": 100.00,
 *   "customer": {
 *     "customer_phone": "9999999999",
 *     "customer_email": "user@example.com",
 *     "customer_name": "John Doe"
 *   },
 *   "order_currency": "INR",
 *   "orderNote": "Payment for order",
 *   "cart_details": {...}
 * }
 */
router.post('/create-order', EnhancedPaymentController.createOrder);

/**
 * GET /api/payment/verify/:orderId
 * Verify payment status for an order
 */
router.get('/verify/:orderId', EnhancedPaymentController.verifyPayment);

/**
 * POST /api/payment/test-config
 * Test Cashfree configuration with provided credentials
 * 
 * Body:
 * {
 *   "clientId": "your_client_id",
 *   "clientSecret": "your_client_secret",
 *   "environment": "sandbox"
 * }
 */
router.post('/test-config', EnhancedPaymentController.testCashfreeConfig);

// Payment Flow Handlers
// =====================

/**
 * GET /api/payment/return
 * Handle payment return from Cashfree
 * Query params: order_id, cf_order_id, payment_status, etc.
 */
router.get('/return', EnhancedPaymentController.handlePaymentReturn);

/**
 * POST /api/payment/webhook
 * Handle webhook notifications from Cashfree
 */
router.post('/webhook', EnhancedPaymentController.handleWebhook);

/**
 * GET /api/payment/checkout/:orderId
 * Server-side redirect to Cashfree payment page
 */
router.get('/checkout/:orderId', EnhancedPaymentController.handleCashfreeCheckout);

/**
 * GET /api/payment/cleanup
 * Get cleanup instructions for frontend
 */
router.get('/cleanup', EnhancedPaymentController.cleanupOrderData);

// Debug & Testing Endpoints
// =========================

/**
 * GET /api/payment/test
 * Basic API health check
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Payment API is working correctly',
    version: '2025-01-01',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    server: 'Enhanced Payment Controller'
  });
});

/**
 * GET /api/payment/debug/environment
 * Get environment information for debugging
 */
router.get('/debug/environment', EnhancedPaymentController.debugEnvironment);

/**
 * GET /api/payment/debug/api-connection
 * Test API connection to Cashfree
 */
router.get('/debug/api-connection', EnhancedPaymentController.debugApiConnection);

/**
 * GET /api/payment/debug/simulate-return
 * Simulate payment return scenarios for testing
 */
router.get('/debug/simulate-return', (req, res) => {
  const testOrderId = req.query.order_id || `test_order_${Date.now()}`;
  const scenarios = [
    {
      scenario: 'Success',
      description: 'Successful payment return',
      url: `/api/payment/return?order_id=${testOrderId}&cf_order_id=123456&payment_status=SUCCESS&order_status=PAID`
    },
    {
      scenario: 'Failed',
      description: 'Failed payment return',
      url: `/api/payment/return?order_id=${testOrderId}&cf_order_id=123456&payment_status=FAILED&order_status=ACTIVE`
    },
    {
      scenario: 'Missing Order ID',
      description: 'Return without order ID',
      url: `/api/payment/return?cf_order_id=123456&payment_status=SUCCESS`
    },
    {
      scenario: 'Different Parameter Format',
      description: 'Alternative parameter names',
      url: `/api/payment/return?orderId=${testOrderId}&cfOrderId=123456&paymentStatus=SUCCESS`
    }
  ];
  
  res.json({
    message: 'Payment return simulation endpoints',
    testOrderId: testOrderId,
    scenarios: scenarios,
    instructions: 'Use these URLs to test payment return handling',
    note: 'These are for testing only - actual returns come from Cashfree'
  });
});

/**
 * GET /api/payment/debug/test-checkout-redirect
 * Test checkout redirect functionality
 */
router.get('/debug/test-checkout-redirect', (req, res) => {
  const testOrderId = req.query.order_id || `test_order_${Date.now()}`;
  
  res.json({
    message: 'Checkout redirect test',
    testUrl: `/api/payment/checkout/${testOrderId}`,
    instructions: [
      '1. Create a test order first using /api/payment/create-order',
      '2. Use the returned order_id in the checkout URL',
      '3. Visit /api/payment/checkout/{order_id} to test redirect'
    ],
    example: {
      step1: 'POST /api/payment/create-order with test data',
      step2: 'GET /api/payment/checkout/{order_id} from response',
      step3: 'Should redirect to Cashfree payment page'
    }
  });
});

// Error handling middleware for payment routes
router.use((error, req, res, next) => {
  console.error('❌ Payment API Error:', {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'PAYMENT_API_ERROR',
      message: 'An error occurred in the payment API',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  });
});

module.exports = router;
