const express = require('express');
const PaymentController = require('../Controller/Payment.controller');
const router = express.Router();

// Get payment configuration (environment info)
router.get('/config', PaymentController.getPaymentConfig);

// Create payment order
router.post('/create-order', PaymentController.createOrder);

// Test endpoint to verify API routing is working  
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Payment API routing is working correctly',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

// Debug endpoint to simulate Cashfree return with different parameter formats
router.get('/debug/simulate-return', (req, res) => {
  
  // Simulate different formats Cashfree might use
  const testOrder = req.query.order_id || 'test_order_12345';
  const testFormats = [
    `?order_id=${testOrder}&cf_order_id=987654321&order_token=sample_token`,
    `?orderId=${testOrder}&cfOrderId=987654321&orderToken=sample_token`, 
    `?ORDER_ID=${testOrder}&CF_ORDER_ID=987654321&ORDER_TOKEN=sample_token`,
    `?order_id=${testOrder}&status=SUCCESS&payment_status=PAID`,
    `?cf_order_id=987654321&order_id=${testOrder}`
  ];
  
  res.json({
    message: 'Cashfree return simulation',
    testOrder: testOrder,
    testFormats: testFormats,
    actualReturnUrl: `/api/payment/return`,
    instructions: 'Try these URLs to test return handling:',
    testUrls: testFormats.map(format => `/api/payment/return${format}`)
  });
});

// Verify payment
router.get('/verify/:orderId', PaymentController.verifyPayment);

// Test Cashfree configuration
router.post('/test-config', PaymentController.testCashfreeConfig);

// Handle payment return from Cashfree
router.get('/return', PaymentController.handlePaymentReturn);

// Clean up order data after payment processing
router.get('/cleanup', PaymentController.cleanupOrderData);

// Handle webhook notifications from Cashfree
router.post('/webhook', PaymentController.handleWebhook);

// Server-side redirect route for Cashfree checkout
router.get('/checkout/:orderId', PaymentController.handleCashfreeCheckout);

// Debug routes for production troubleshooting
router.get('/debug/environment', PaymentController.debugEnvironment);
router.get('/debug/cashfree-config', PaymentController.debugCashfreeConfig);
router.get('/debug/api-connection', PaymentController.debugApiConnection);
router.get('/debug/simulate-payment-return', PaymentController.debugSimulatePaymentReturn);
router.get('/debug/test-payment-return', PaymentController.debugTestPaymentReturn);

module.exports = router;
