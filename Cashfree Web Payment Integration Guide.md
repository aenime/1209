basic 

# Cashfree Payments - Web (Redirect) Integration Guide

## Overview

Cashfree's Web (Redirect) integration allows merchants to accept online payments by redirecting customers to a payment page hosted by Cashfree. This method simplifies PCI DSS compliance since sensitive card data is handled directly by Cashfree rather than the merchant.

## Key Features

- **PCI DSS Compliant**: No card data touches merchant servers
- **Multiple Payment Methods**: Cards, NetBanking, UPI, Wallets, and EMI
- **Customizable UI**: White-label options available
- **Seamless Redirection**: Customers redirected to/from payment page
- **Payment Status**: Real-time updates via webhooks and API

## Integration Workflow

### 1. Order Creation
```javascript
// Example request to create order
POST https://api.cashfree.com/pg/orders
```

**Required Parameters:**
- `order_id`: Unique merchant order ID
- `order_amount`: Order amount
- `order_currency`: Currency (ISO format)
- `customer_details`: Customer information object

### 2. Payment Page Redirection
After order creation, redirect customer to:
```
https://payments.cashfree.com/redirect/#/{order_id}
```

### 3. Payment Processing
Customer completes payment on Cashfree's secure payment page.

### 4. Payment Confirmation
Cashfree provides multiple confirmation methods:

- **Webhooks**: Instant payment notifications
- **Polling**: Check payment status via API
- **Return URL**: Redirect customer after payment completion

## API Implementation

### Order Creation Request
```javascript
// Sample cURL request
curl -XPOST -H 'Content-Type: application/json' 
-H 'x-api-version: 2022-09-01' 
-H 'x-client-id: YOUR_APP_ID' 
-H 'x-client-secret: YOUR_SECRET_KEY' 
-d '{
  "order_id": "order_12345",
  "order_amount": 100.50,
  "order_currency": "INR",
  "customer_details": {
    "customer_id": "cust_123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "9999999999"
  },
  "order_meta": {
    "return_url": "https://example.com/return?order_id={order_id}"
  }
}' 'https://api.cashfree.com/pg/orders'
```

### Response Handling
Successful response includes:
- `payment_session_id`: Unique payment identifier
- `order_id`: Merchant's order reference
- `payment_url`: URL for payment page redirection

## Webhook Implementation

### Webhook Configuration
Set up endpoint to receive payment notifications:

```javascript
// Example webhook endpoint
app.post('/webhook/cashfree', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const rawBody = JSON.stringify(req.body);
  
  // Verify signature
  if (verifySignature(rawBody, signature, secretKey)) {
    const paymentData = req.body;
    // Process payment status update
    updateOrderStatus(paymentData);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

### Webhook Events
Cashfree sends notifications for:
- `PAYMENT_SUCCESS`
- `PAYMENT_FAILED`
- `PAYMENT_PENDING`
- `ORDER_APPROVED`

## Security Considerations

### Signature Verification
Always verify webhook signatures to prevent fraud:

```javascript
function verifySignature(body, signature, secret) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return computedSignature === signature;
}
```

### API Security
- Use HTTPS for all requests
- Store API keys securely
- Rotate keys periodically
- Implement rate limiting

## Error Handling

### Common Error Codes
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid credentials
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Cashfree system issue

### Retry Logic
Implement retry mechanisms for:
- Network failures
- Temporary API errors
- Webhook delivery failures

## Testing and Go-Live

### Test Environment
- Use test API credentials
- Test with dummy card numbers
- Verify all payment scenarios
- Test webhook delivery

### Production Checklist
- [ ] Update to production API keys
- [ ] Configure production webhook URL
- [ ] Test end-to-end payment flow
- [ ] Set up monitoring and alerts

## Best Practices

### Order Management
- Generate unique order IDs
- Validate order amounts server-side
- Implement idempotency for duplicate requests

### Customer Experience
- Provide clear payment instructions
- Implement loading states during redirection
- Handle payment failures gracefully

### Performance Optimization
- Cache static resources
- Minimize API calls
- Implement lazy loading for payment page

## Support and Resources

- **Documentation**: https://www.cashfree.com/docs
- **API Reference**: https://www.cashfree.com/docs/api
- **Support Portal**: https://support.cashfree.com
- **Status Page**: https://status.cashfree.com

## Version Information

This documentation applies to API version `2022-09-01`. Always specify the API version in headers to ensure compatibility.

```javascript
// Required headers for all API requests
headers: {
  'Content-Type': 'application/json',
  'x-api-version': '2022-09-01',
  'x-client-id': 'YOUR_APP_ID',
  'x-client-secret': 'YOUR_SECRET_KEY'
}
```

## Conclusion

The Cashfree Web (Redirect) integration provides a secure, compliant, and feature-rich payment solution. By following this guide and implementing proper error handling, security measures, and testing procedures, merchants can create a seamless payment experience for their customers while maintaining the highest security standards.