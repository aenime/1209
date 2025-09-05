# IMMEDIATE FIX: ngrok Setup for Cashfree Production Testing

## Step 1: Install ngrok
```bash
npm install -g ngrok
# or
brew install ngrok  # on macOS
```

## Step 2: Start ngrok tunnel
```bash
# In a NEW terminal window
ngrok http 5001
```

## Step 3: Copy the HTTPS URL
You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5001
```

## Step 4: Update your .env file
```bash
# In .env
APP_BASE_URL="https://abc123.ngrok.io"
CASHFREE_ENV=PRODUCTION
```

## Step 5: Restart your server
```bash
# Ctrl+C to stop current server, then:
npm start
```

## ✅ Result
- Your localhost will be accessible via HTTPS through ngrok
- Cashfree production API will accept the HTTPS return URLs
- Payment success → redirects to your frontend/thankyou
- Payment failure → redirects to your frontend/cart

## Alternative: Quick Sandbox Credentials
If you prefer to use sandbox for development:

1. Visit: https://merchant.cashfree.com/
2. Switch to "Test" mode
3. Get new credentials (they'll start with "test" not "prod")
4. Update .env:
```bash
CASHFREE_APP_ID=your_test_app_id
CASHFREE_SECRET_KEY=cfsk_ma_test_your_secret
CASHFREE_ENV=SANDBOX
APP_BASE_URL=auto
```

Both solutions will fix the authentication error you're seeing!
