# 🎯 Payment Return URL Configuration - Complete Guide

## 🌐 How Your Payment Return URLs Work

Your payment system is now configured with **smart auto-detection** that automatically handles return URLs for any deployment environment.

### 📍 Payment Flow:
```
1. Customer clicks "Pay Now"
2. Redirects to Cashfree Payment Gateway
3. Customer completes payment
4. Cashfree calls: https://your-domain.com/api/payment/return
5. Server verifies payment with Cashfree
6. Success → Redirect to: https://your-domain.com/thankyou
7. Failed → Redirect to: https://your-domain.com/cart
```

## ✅ Auto-Detection Features

Your system automatically detects the correct URLs from:

### 🔍 **Deployment Platforms:**
- **Render**: Uses `RENDER_EXTERNAL_URL` 
- **Vercel**: Uses `VERCEL_URL`
- **Heroku**: Uses `HEROKU_APP_NAME`
- **Netlify**: Uses request headers
- **Custom domains**: Auto-detected from request

### 📡 **Request Headers:**
- `X-Forwarded-Proto` (https/http)
- `X-Forwarded-Host` (domain name)
- `Host` header
- Protocol detection

## 🔧 Configuration Options

### **Option 1: Automatic (Recommended)**
```env
APP_BASE_URL=auto
CLIENT_URL=auto
SERVER_URL=auto
CASHFREE_ENVIRONMENT=production
```
✅ **Works everywhere** - No manual configuration needed

### **Option 2: Manual Override**
```env
DEPLOYED_DOMAIN=https://your-actual-domain.com
CLIENT_URL=https://your-actual-domain.com
SERVER_URL=https://your-actual-domain.com
```
✅ **Use if auto-detection fails**

### **Option 3: Environment-Specific**
```env
# Production
DEPLOYED_DOMAIN=https://yourstore.com
# Staging  
DEPLOYED_DOMAIN=https://staging-yourstore.com
```

## 🚀 Deployment Setup

### **For Render:**
```env
# Auto-detected from RENDER_EXTERNAL_URL
# No manual configuration needed
CASHFREE_ENVIRONMENT=production
```

### **For Vercel:**
```env
# Auto-detected from VERCEL_URL
# No manual configuration needed
CASHFREE_ENVIRONMENT=production
```

### **For Custom Domains:**
```env
# Optional - only if auto-detection fails
DEPLOYED_DOMAIN=https://yourstore.com
CASHFREE_ENVIRONMENT=production
```

## 🧪 Testing Your Setup

### **1. Check URL Detection:**
```bash
cd Server && ./configure-payment-urls.sh
```

### **2. Test Payment Flow:**
1. Add items to cart
2. Go to checkout
3. Click "Pay Now"
4. Complete test payment
5. Verify redirect to `/thankyou` or `/cart`

### **3. Check Logs:**
Monitor server logs for:
```
✅ Payment successful for order: ORDER_123 - Redirecting to: https://yourdomain.com/thankyou
❌ Payment failed for order: ORDER_123 - Redirecting to: https://yourdomain.com/cart
```

## 🛠️ Troubleshooting

### **Issue: Wrong domain in return URL**
**Solution:** Set `DEPLOYED_DOMAIN` environment variable
```env
DEPLOYED_DOMAIN=https://your-actual-domain.com
```

### **Issue: HTTP instead of HTTPS**
**Solution:** Ensure your deployment platform sets proper headers
```env
# Force HTTPS in production
NODE_ENV=production
```

### **Issue: Localhost in production**
**Solution:** Check environment variables
```env
APP_BASE_URL=auto  # Not localhost:3000
CASHFREE_ENVIRONMENT=production
```

## 📋 Environment Variables Summary

```env
# Required for Production
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENVIRONMENT=production
NODE_ENV=production

# Auto-Detection (Recommended)
APP_BASE_URL=auto
CLIENT_URL=auto
SERVER_URL=auto

# Manual Override (If Needed)
DEPLOYED_DOMAIN=https://your-domain.com
```

## 🎉 Success Confirmation

When everything is working correctly, you'll see:

### **✅ Payment Success:**
- URL: `https://yourdomain.com/thankyou?order_id=ORDER_123&payment_status=success`
- Page shows: Order confirmation with order details

### **❌ Payment Failed:**
- URL: `https://yourdomain.com/cart?error=payment_failed&order_id=ORDER_123`
- Page shows: Cart with error message

## 🔒 Security Notes

- All return URLs use HTTPS in production
- Payment status is verified with Cashfree before redirect
- Order IDs are validated to prevent tampering
- Error messages are logged for debugging

Your payment return URL system is now **fully automatic** and will work on any deployment platform! 🚀
