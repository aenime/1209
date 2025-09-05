const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { NewCashfreeService } = require('./services/payment/NewCashfreeService');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.CASHFREE_TEST_PORT || 3030;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve static files
app.use(express.static(publicDir));

// Initialize Cashfree Service
const cashfreeService = new NewCashfreeService();

// Root route - serve the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'cashfree-test.html'));
});

// Same route as PHP payment_cashfree.php with enhanced functionality
app.get('/api/enhanced-payment/payment_cashfree', async (req, res) => {
  const amount = req.query.amount;

  // Same validation as PHP
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or missing amount'
    });
  }

  try {
    // Generate a unique order ID
    const orderId = `order_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const customerName = 'Test User';
    const customerEmail = 'test@example.com';
    const customerPhone = '9999999999';
    
    // Create order using the Cashfree service
    const response = await cashfreeService.createCashfreeOrder({
      orderId,
      orderAmount: parseFloat(amount),
      orderCurrency: 'INR',
      customerName,
      customerEmail,
      customerPhone
    });
    
    if (response && response.payment_link) {
      // If it's an API call, return JSON
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(200).json({
          status: 'success',
          message: 'Payment link created successfully',
          payment_link: response.payment_link,
          order_id: orderId
        });
      }
      // Otherwise redirect as in the PHP implementation
      return res.redirect(response.payment_link);
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create payment link',
        details: response
      });
    }
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create payment link',
      error: error.message || 'Unknown error'
    });
  }
});

// Enhanced JSON API with full compatibility with PHP create_order.php
app.get('/api/enhanced-payment/create_order', async (req, res) => {
  const amount = parseFloat(req.query.amount) || 100.00;
  const customerName = req.query.name || "John Doe";
  const customerEmail = req.query.email || "john.doe@example.com";
  const customerPhone = req.query.phone || "9999999999";

  try {
    // Generate a unique order ID
    const orderId = `order_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    
    // Create order using the Cashfree service
    const response = await cashfreeService.createCashfreeOrder({
      orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerName,
      customerEmail,
      customerPhone
    });
    
    if (response && response.payment_link) {
      // Same JSON response structure as PHP
      return res.status(200).json({
        status: 'success',
        payment_link: response.payment_link,
        order_id: orderId
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create payment link',
        details: response
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred. Please try again.',
      details: error.message || 'Unknown error'
    });
  }
});

// Route for verifying payment
app.get('/api/enhanced-payment/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID is required'
      });
    }
    
    // Verify payment using the Cashfree service
    const response = await cashfreeService.verifyPayment(orderId);
    
    return res.status(200).json({
      status: 'success',
      message: 'Payment verification successful',
      payment_details: response
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify payment',
      error: error.message || 'Unknown error'
    });
  }
});

// Route for checking Cashfree config
app.get('/api/enhanced-payment/config', (req, res) => {
  try {
    // Return only non-sensitive configuration details
    return res.status(200).json({
      status: 'success',
      environment: process.env.CASHFREE_ENV || 'SANDBOX',
      api_version: '2022-01-01'
    });
  } catch (error) {
    console.error('Error retrieving config:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve configuration',
      error: error.message || 'Unknown error'
    });
  }
});

// Test route
app.get('/api/enhanced-payment/test', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Cashfree test server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Cashfree Test Server running on port ${PORT}`);
  console.log(`View the test page at http://localhost:${PORT}`);
  console.log(`Payment URL: http://localhost:${PORT}/api/enhanced-payment/payment_cashfree?amount=100`);
  console.log(`API URL: http://localhost:${PORT}/api/enhanced-payment/create_order?amount=100`);
});

module.exports = app;
