# Comprehensive Cashfree Hosted Payment Page Integration for React-Node.js-MongoDB Application

## Architecture Overview

```
Frontend (React) → Backend (Node.js/Express) → Cashfree API → Payment Processing
      ↑                   ↑                       ↓
      ←-- Redirect -------- ←--- Webhooks --------- ←-- Bank Systems
      ↓                   ↓
MongoDB (Order Data)   MongoDB (Payment Status)
```

## Backend Implementation (Node.js/Express)

### 1. Environment Configuration

```javascript
// .env
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_API_VERSION=2022-09-01
CASHFREE_BASE_URL=https://api.cashfree.com
CASHFREE_PG_URL=https://payments.cashfree.com
WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=https://yourdomain.com
```

### 2. Order Model (MongoDB Schema)

```javascript
// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  orderAmount: {
    type: Number,
    required: true
  },
  orderCurrency: {
    type: String,
    default: 'INR'
  },
  customerDetails: {
    customerId: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String
  },
  orderNote: String,
  orderTags: mongoose.Schema.Types.Mixed,
  paymentSessionId: String,
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
    default: 'PENDING'
  },
  cfPaymentId: String,
  paymentMethod: String,
  paymentChannel: String,
  bankReference: String,
  authId: String,
  paymentTime: Date,
  refunds: [{
    refundId: String,
    refundAmount: Number,
    refundNote: String,
    refundStatus: String,
    processedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days in seconds
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customerDetails.customerId': 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
```

### 3. Cashfree Service Layer

```javascript
// services/cashfreeService.js
const axios = require('axios');
const Order = require('../models/Order');

class CashfreeService {
  constructor() {
    this.baseURL = process.env.CASHFREE_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-version': process.env.CASHFREE_API_VERSION,
      'x-client-id': process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY
    };
  }

  async createOrder(orderData) {
    try {
      const response = await axios.post(`${this.baseURL}/pg/orders`, orderData, {
        headers: this.headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Cashfree API Error:', error.response?.data || error.message);
      throw new Error(`Failed to create order: ${error.response?.data?.message || error.message}`);
    }
  }

  async getOrderStatus(orderId) {
    try {
      const response = await axios.get(`${this.baseURL}/pg/orders/${orderId}`, {
        headers: this.headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Cashfree API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch order status: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPaymentStatus(orderId) {
    try {
      const response = await axios.get(`${this.baseURL}/pg/orders/${orderId}/payments`, {
        headers: this.headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Cashfree API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch payment status: ${error.response?.data?.message || error.message}`);
    }
  }

  async initiateRefund(orderId, refundData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/pg/orders/${orderId}/refunds`, 
        refundData,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Cashfree API Error:', error.response?.data || error.message);
      throw new Error(`Failed to initiate refund: ${error.response?.data?.message || error.message}`);
    }
  }

  verifyWebhookSignature(rawBody, signature) {
    const crypto = require('crypto');
    const computedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(rawBody)
      .digest('base64');
    
    return computedSignature === signature;
  }
}

module.exports = new CashfreeService();
```

### 4. API Routes

```javascript
// routes/payment.js
const express = require('express');
const router = express.Router();
const CashfreeService = require('../services/cashfreeService');
const Order = require('../models/Order');

// Create order and payment session
router.post('/create-order', async (req, res) => {
  try {
    const {
      orderId,
      orderAmount,
      orderCurrency = 'INR',
      customerDetails,
      orderNote,
      orderTags
    } = req.body;

    // Validate required fields
    if (!orderId || !orderAmount || !customerDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, orderAmount, customerDetails'
      });
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order ID already exists'
      });
    }

    // Prepare Cashfree order data
    const cashfreeOrderData = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency,
      customer_details: customerDetails,
      order_note: orderNote,
      order_tags: orderTags,
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/status?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`
      }
    };

    // Create order in Cashfree
    const cashfreeResponse = await CashfreeService.createOrder(cashfreeOrderData);

    // Save order to database
    const order = new Order({
      orderId,
      orderAmount,
      orderCurrency,
      customerDetails,
      orderNote,
      orderTags,
      paymentSessionId: cashfreeResponse.payment_session_id
    });

    await order.save();

    res.json({
      success: true,
      data: {
        paymentSessionId: cashfreeResponse.payment_session_id,
        paymentUrl: `${process.env.CASHFREE_PG_URL}/redirect/#/${cashfreeResponse.payment_session_id}`,
        orderId: cashfreeResponse.order_id
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order status
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Optionally fetch latest status from Cashfree
    const paymentStatus = await CashfreeService.getPaymentStatus(orderId);
    
    // Update order status if different
    if (paymentStatus[0]?.payment_status !== order.paymentStatus) {
      order.paymentStatus = paymentStatus[0]?.payment_status;
      order.cfPaymentId = paymentStatus[0]?.cf_payment_id;
      order.paymentMethod = paymentStatus[0]?.payment_method;
      order.paymentChannel = paymentStatus[0]?.payment_channel;
      order.bankReference = paymentStatus[0]?.bank_reference;
      order.authId = paymentStatus[0]?.auth_id;
      order.paymentTime = paymentStatus[0]?.payment_time;
      
      await order.save();
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const rawBody = req.body.toString();
    
    // Verify webhook signature
    if (!CashfreeService.verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(rawBody);
    const { order_id, payment_status, cf_payment_id, payment_method, 
            payment_channel, bank_reference, auth_id, payment_time } = event;

    // Find and update order
    const order = await Order.findOne({ orderId: order_id });
    if (order) {
      order.paymentStatus = payment_status;
      order.cfPaymentId = cf_payment_id;
      order.paymentMethod = payment_method;
      order.paymentChannel = payment_channel;
      order.bankReference = bank_reference;
      order.authId = auth_id;
      order.paymentTime = payment_time;
      order.updatedAt = new Date();
      
      await order.save();
      
      // Additional business logic based on payment status
      if (payment_status === 'SUCCESS') {
        // Handle successful payment (e.g., send confirmation email, update inventory, etc.)
        console.log(`Payment successful for order: ${order_id}`);
      } else if (payment_status === 'FAILED') {
        // Handle failed payment
        console.log(`Payment failed for order: ${order_id}`);
      }
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// Initiate refund
router.post('/refund', async (req, res) => {
  try {
    const { orderId, refundAmount, refundNote } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund a non-successful payment'
      });
    }

    if (refundAmount > order.orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order amount'
      });
    }

    const refundId = `refund_${Date.now()}`;
    const refundData = {
      refund_id: refundId,
      refund_amount: refundAmount,
      refund_note: refundNote
    };

    const refundResponse = await CashfreeService.initiateRefund(orderId, refundData);

    // Update order with refund information
    order.refunds.push({
      refundId,
      refundAmount,
      refundNote,
      refundStatus: refundResponse.refund_status,
      processedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      data: refundResponse
    });

  } catch (error) {
    console.error('Refund initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

## Frontend Implementation (React)

### 1. Payment Context

```javascript
// contexts/PaymentContext.js
import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

const PaymentContext = createContext();

const paymentReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_ORDER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'CREATE_ORDER_SUCCESS':
      return { ...state, loading: false, orderData: action.payload, error: null };
    case 'CREATE_ORDER_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'RESET_ORDER':
      return { ...state, orderData: null, error: null };
    default:
      return state;
  }
};

export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, {
    loading: false,
    orderData: null,
    error: null
  });

  const createOrder = async (orderData) => {
    dispatch({ type: 'CREATE_ORDER_REQUEST' });
    
    try {
      const response = await axios.post('/api/payment/create-order', orderData);
      dispatch({ type: 'CREATE_ORDER_SUCCESS', payload: response.data.data });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      dispatch({ type: 'CREATE_ORDER_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const resetOrder = () => {
    dispatch({ type: 'RESET_ORDER' });
  };

  const value = {
    ...state,
    createOrder,
    resetOrder
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
```

### 2. Checkout Component

```javascript
// components/Checkout.js
import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';

const Checkout = () => {
  const [formData, setFormData] = useState({
    orderId: `order_${Date.now()}`,
    orderAmount: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderNote: ''
  });

  const { loading, error, createOrder } = usePayment();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        orderId: formData.orderId,
        orderAmount: parseFloat(formData.orderAmount),
        customerDetails: {
          customerId: `cust_${Date.now()}`,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone
        },
        orderNote: formData.orderNote
      };

      const response = await createOrder(orderData);
      
      // Redirect to Cashfree payment page
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Order Amount (INR)</label>
          <input
            type="number"
            name="orderAmount"
            value={formData.orderAmount}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Order Note (Optional)</label>
          <textarea
            name="orderNote"
            value={formData.orderNote}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          className="pay-button"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
```

### 3. Payment Status Component

```javascript
// components/PaymentStatus.js
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentStatus = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!orderId) {
        setError('Order ID not found in URL');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/payment/order-status/${orderId}`);
        setPaymentStatus(response.data.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [orderId]);

  if (loading) {
    return <div className="loading">Loading payment status...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="payment-status-container">
      <h2>Payment Status</h2>
      
      <div className="status-card">
        <div className={`status-indicator ${paymentStatus.paymentStatus.toLowerCase()}`}>
          {paymentStatus.paymentStatus}
        </div>
        
        <div className="order-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {paymentStatus.orderId}</p>
          <p><strong>Amount:</strong> ₹{paymentStatus.orderAmount}</p>
          <p><strong>Payment Method:</strong> {paymentStatus.paymentMethod || 'N/A'}</p>
          <p><strong>Payment Channel:</strong> {paymentStatus.paymentChannel || 'N/A'}</p>
          {paymentStatus.bankReference && (
            <p><strong>Bank Reference:</strong> {paymentStatus.bankReference}</p>
          )}
          {paymentStatus.paymentTime && (
            <p><strong>Payment Time:</strong> {new Date(paymentStatus.paymentTime).toLocaleString()}</p>
          )}
        </div>
        
        {paymentStatus.paymentStatus === 'SUCCESS' && (
          <div className="success-message">
            <h3>Payment Successful!</h3>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
          </div>
        )}
        
        {paymentStatus.paymentStatus === 'FAILED' && (
          <div className="error-message">
            <h3>Payment Failed</h3>
            <p>Your payment could not be processed. Please try again.</p>
          </div>
        )}
        
        {paymentStatus.paymentStatus === 'PENDING' && (
          <div className="warning-message">
            <h3>Payment Pending</h3>
            <p>Your payment is being processed. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
```

## Security Considerations

### 1. Input Validation

```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateOrder = [
  body('orderId').isLength({ min: 5, max: 50 }).withMessage('Order ID must be between 5-50 characters'),
  body('orderAmount').isFloat({ min: 1 }).withMessage('Order amount must be at least 1'),
  body('customerDetails.customerName').isLength({ min: 2, max: 100 }).withMessage('Customer name must be between 2-100 characters'),
  body('customerDetails.customerEmail').isEmail().withMessage('Invalid email address'),
  body('customerDetails.customerPhone').isMobilePhone().withMessage('Invalid phone number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
```

### 2. Rate Limiting

```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 create-order requests per windowMs
  message: {
    success: false,
    message: 'Too many orders created from this IP, please try again after 15 minutes'
  }
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 50 webhook requests per minute
  message: 'Too many webhook requests'
});

module.exports = { createOrderLimiter, webhookLimiter };
```

## Error Handling and Logging

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Cashfree API errors
  if (err.message.includes('Cashfree API Error')) {
    return res.status(502).json({
      success: false,
      message: 'Payment service temporarily unavailable'
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Order ID already exists'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;
```

## Deployment Considerations

### 1. Environment Setup

```bash
# Install dependencies
npm install express mongoose axios crypto express-validator rate-limit

# Production dependencies
npm install helmet compression cors
```

### 2. Production Configuration

```javascript
// app.js (main application file)
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/payment', require('./routes/payment'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. Webhook Security

Ensure your webhook endpoint is:
- HTTPS enabled
- Protected with signature verification
- Rate limited to prevent abuse
- Logging all incoming requests for audit purposes

## Testing Strategy

### 1. Unit Tests

```javascript
// tests/payment.test.js
const request = require('supertest');
const app = require('../app');
const Order = require('../models/Order');

describe('Payment API', () => {
  beforeEach(async () => {
    await Order.deleteMany({});
  });

  it('should create a new order', async () => {
    const response = await request(app)
      .post('/api/payment/create-order')
      .send({
        orderId: 'test_order_123',
        orderAmount: 100,
        customerDetails: {
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '9876543210'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.paymentSessionId).toBeDefined();
  });

  it('should reject duplicate order IDs', async () => {
    // Create first order
    await request(app)
      .post('/api/payment/create-order')
      .send({
        orderId: 'duplicate_order',
        orderAmount: 100,
        customerDetails: {
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '9876543210'
        }
      });

    // Try to create duplicate order
    const response = await request(app)
      .post('/api/payment/create-order')
      .send({
        orderId: 'duplicate_order',
        orderAmount: 200,
        customerDetails: {
          customerName: 'Another User',
          customerEmail: 'test2@example.com',
          customerPhone: '9876543211'
        }
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### 2. Integration Tests

Test the complete flow:
1. Order creation
2. Redirect to Cashfree
3. Webhook processing
4. Status checking

## Monitoring and Analytics

```javascript
// middleware/analytics.js
const analytics = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }));
  });
  
  next();
};

module.exports = analytics;
```

This comprehensive implementation provides a robust foundation for integrating Cashfree's hosted payment page into your React-Node.js-MongoDB application. Remember to thoroughly test all flows in the sandbox environment before going live and ensure you comply with all security best practices.