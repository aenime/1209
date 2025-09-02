# 🚀 Cashfree Payment Gateway - Quick Setup Guide

## 🔧 **Step 1: Get Cashfree Credentials**

### **For Testing (Sandbox):**
1. Go to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/login)
2. Create a free account or login
3. Navigate to **"Developers" → "API Keys"**
4. Copy your **Sandbox** credentials:
   - `App ID` (Client ID)
   - `Secret Key` (Client Secret)

### **For Production:**
1. Complete KYC verification in your Cashfree account
2. Get your **Production** credentials from the same API Keys section

## 🛠 **Step 2: Configure Your Application**

### **Update Environment Variables:**
Edit the file `/Users/anand.social/ONECOM/Fullapp-e/Server/.env`:

```env
# Replace with your actual Cashfree credentials
CASHFREE_CLIENT_ID=your_actual_client_id_here
CASHFREE_CLIENT_SECRET=your_actual_client_secret_here
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_ENABLED=true
```

### **Example with dummy credentials:**
```env
CASHFREE_CLIENT_ID=TEST123456789
CASHFREE_CLIENT_SECRET=test_secret_key_here
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_ENABLED=true
```

## 🧪 **Step 3: Test Your Setup**

### **1. Restart Your Server**
```bash
cd /Users/anand.social/ONECOM/Fullapp-e/Server
npm start
# or
node index.js
```

### **2. Test Configuration**
```bash
curl -X GET http://localhost:5001/api/payment-enhanced/debug/environment
```

**Expected Response:**
```json
{
  "cashfree": {
    "client_id": "SET",
    "client_secret": "SET", 
    "environment": "sandbox",
    "enabled": "true"
  }
}
```

### **3. Test API Connection**
```bash
curl -X GET http://localhost:5001/api/payment-enhanced/debug/api-connection
```

### **4. Use Debug Test Page**
Open: `test-cashfree-sdk-debug.html` in your browser

## 💳 **Step 4: Test Payment Flow**

### **Test with These Sandbox Cards:**

#### **✅ Successful Payment:**
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: `12/25` (any future date)
- **CVV**: `123` (any 3 digits)
- **Name**: `Test User`

#### **❌ Failed Payment:**
- **Card Number**: `4012 0010 3714 1112`
- **Expiry**: `12/25`
- **CVV**: `123`

#### **⏳ Pending Payment:**
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: `12/25`
- **CVV**: `123`

## 🌐 **Step 5: Configure Webhooks (Optional)**

In your Cashfree dashboard:
1. Go to **"Developers" → "Webhooks"**
2. Add webhook URL: `https://yourdomain.com/api/payment-enhanced/webhook`
3. For local testing: Use [ngrok](https://ngrok.com/) to expose your local server

## 🚀 **Step 6: Go Live (Production)**

### **When ready for production:**
1. Update `.env` file:
   ```env
   CASHFREE_CLIENT_ID=your_production_client_id
   CASHFREE_CLIENT_SECRET=your_production_secret
   CASHFREE_ENVIRONMENT=production
   ```

2. Update webhook URLs to production domain
3. Test with real payment methods (₹1 transactions)
4. Go live!

## 🔍 **Troubleshooting**

### **SDK Loading Issues:**
- ✅ Fixed with improved SDK loading mechanism
- ✅ Automatic fallback to server-side redirect
- ✅ Multiple SDK URL attempts with retry logic

### **Payment Not Working:**
1. Check credentials are correctly set
2. Verify server is running on port 5001
3. Check network connectivity
4. Use the debug test page

### **Common Errors:**
- **"Client ID not set"**: Update `.env` file with your credentials
- **"SDK failed to load"**: Fixed with new fallback mechanism
- **"Order creation failed"**: Check server logs and credentials

## 📞 **Support Resources**

- **Cashfree Documentation**: https://docs.cashfree.com
- **Test Page**: `test-cashfree-sdk-debug.html`
- **Debug Endpoint**: `/api/payment-enhanced/debug/environment`
- **Your Implementation**: Fully complete and ready to use!

## ✅ **Current Status**

Your Cashfree integration is **completely implemented** with:
- ✅ Modern SDK with fallback mechanisms
- ✅ Comprehensive error handling
- ✅ Server-side and client-side implementations
- ✅ Debug tools and test pages
- ✅ Production-ready code

**Just add your Cashfree credentials and start accepting payments!** 🎉
