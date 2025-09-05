# Cashfree Payment Gateway Integration

This document explains the implementation of Cashfree Payment Gateway using the official Node.js SDK in our application.

## Overview

The implementation uses the [cashfree-pg-sdk-nodejs](https://github.com/cashfree/cashfree-pg-sdk-nodejs) package to interact with Cashfree's Payment Gateway API. It provides endpoints for:

1. Creating payment orders
2. Generating payment links
3. Verifying payment status

## Implementation Details

### Core Components

1. **NewCashfreeService.js**: Main service class that handles all Cashfree API interactions
2. **EnhancedPaymentController.js**: Controller for handling payment-related requests
3. **EnhancedPayment.route.js**: API routes for payment operations

### Features

- **PHP Compatibility**: Maintains API compatibility with existing PHP implementation
- **SDK-based**: Uses official Cashfree SDK for reliable API interactions
- **Environment Support**: Works in both Sandbox and Production environments
- **Payment Verification**: Built-in methods to verify payment status

## Installation & Setup

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- Cashfree account with API credentials

### Steps

1. Install the Cashfree SDK:

```bash
npm install cashfree-pg-sdk-nodejs
```

1. Configure environment variables in `.env` file:

```plaintext
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENV=SANDBOX  # or PRODUCTION
APP_BASE_URL=https://your-website.com  # Return URL after payment
```

## Usage

### Creating a Payment Order

```javascript
const { NewCashfreeService } = require('./services/payment/NewCashfreeService');

// Initialize the service
const cashfreeService = new NewCashfreeService();

// Create an order
async function createPaymentOrder() {
  const response = await cashfreeService.createCashfreeOrder({
    orderId: 'ORDER123',
    orderAmount: 100.50,
    orderCurrency: 'INR',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '9999999999'
  });

  if (response.success) {
    console.log('Payment Link:', response.payment_link);
    return response.payment_link;
  } else {
    console.error('Error creating order:', response.message);
    return null;
  }
}
```

### Verifying Payment Status

```javascript
async function checkPaymentStatus(orderId) {
  const status = await cashfreeService.verifyPayment(orderId);
  
  if (status.isPaid) {
    console.log('Payment successful!');
    // Update your database, fulfill order, etc.
  } else {
    console.log('Payment status:', status.status);
    // Handle other statuses accordingly
  }
  
  return status;
}
```

## API Endpoints

### 1. Create Order with Redirect

**URL:** `/api/enhanced-payment/payment_cashfree`  
**Method:** GET  

**Parameters:**

- `amount`: Payment amount (required)

This endpoint creates a payment order and redirects the user to the Cashfree payment page.

### 2. Create Order (JSON API)

**URL:** `/api/enhanced-payment/create_order`  
**Method:** GET  

**Parameters:**

- `amount`: Payment amount (required)
- `name`: Customer name (optional)
- `email`: Customer email (optional)
- `phone`: Customer phone (optional)

**Response:**

```json
{
  "status": "success",
  "payment_link": "https://sandbox.cashfree.com/pg/orders/ORDER123",
  "order_id": "ORDER123"
}
```

### 3. Verify Payment

**URL:** `/api/enhanced-payment/verify/:orderId`  
**Method:** GET  

**Parameters:**

- `orderId`: Order ID to verify (in URL)

**Response:**

```json
{
  "status": "success",
  "message": "Payment verification successful",
  "payment_details": {
    "success": true,
    "status": "PAID",
    "data": { ... },
    "isPaid": true
  }
}
```

## Testing

A standalone test server is available for testing the Cashfree integration:

```bash
npm run test-cashfree
```

This starts a test server at `http://localhost:3030` with a UI for testing payment creation and verification.

## PHP vs Node.js Implementation

| Feature | PHP Implementation | Node.js Implementation |
|---------|-------------------|------------------------|
| Authentication | API ID + Secret Key | API ID + Secret Key |
| API Version | 2022-01-01 | 2022-01-01 |
| Endpoints | payment_cashfree.php, create_order.php | /payment_cashfree, /create_order |
| Request Format | JSON | JSON |
| Response Format | JSON with payment_link | JSON with payment_link |

## Important Notes

1. **Order IDs**: Must be unique for each order. The implementation generates them automatically.
2. **Sandbox Testing**: Use test cards provided by Cashfree for sandbox testing.
3. **Security**: Keep your Cashfree credentials secure and never expose them in client-side code.
4. **Webhooks**: Set up webhooks in your Cashfree dashboard for real-time payment notifications.

## Troubleshooting

### Common Issues

1. **"Authentication Failed" Error**:
   - Check if CASHFREE_APP_ID and CASHFREE_SECRET_KEY are correctly set in .env file
   - Verify that you're using the right environment (Sandbox/Production)

2. **"Order Creation Failed" Error**:
   - Ensure all required parameters are provided
   - Check if the order ID is unique
   - Verify that the amount is valid (greater than 0)

3. **No Payment Link in Response**:
   - Check Cashfree dashboard for any account issues
   - Verify API endpoint URLs
   - Ensure correct API version is being used

## References

- [Cashfree Documentation](https://docs.cashfree.com/reference/pg-getting-started)
- [Cashfree Node.js SDK](https://github.com/cashfree/cashfree-pg-sdk-nodejs)
- [Test Cards for Sandbox](https://docs.cashfree.com/reference/test-cards)
