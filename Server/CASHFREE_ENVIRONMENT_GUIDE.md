# Cashfree Environment Configuration Guide

## Problem: HTTPS Requirement Error

If you see this error:
```
❌ Online payment error: Error: order_meta.return_url : url should be https. Value received: http://127.0.0.1/api/payment/return
```

## Solution

### For Development (localhost)
Use **SANDBOX** mode in your `.env` file:
```bash
CASHFREE_ENV="SANDBOX"
```

### For Production (live website)
Use **PRODUCTION** mode only with HTTPS:
```bash
CASHFREE_ENV="PRODUCTION"
```

## Why This Happens

Cashfree's **PRODUCTION** mode requires all URLs to use HTTPS protocol. Localhost typically uses HTTP, which causes the rejection.

## Configuration Options

### Option 1: Use Sandbox for Development (Recommended)
```bash
# .env
CASHFREE_ENV="SANDBOX"
APP_BASE_URL="auto"
```

### Option 2: Use ngrok for HTTPS Testing
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm start

# In another terminal, expose with HTTPS
ngrok http 5001

# Update .env with ngrok URL
APP_BASE_URL="https://abc123.ngrok.io"
CASHFREE_ENV="PRODUCTION"
```

### Option 3: Smart Environment Detection (Automatic)
The system now automatically detects localhost and switches to SANDBOX mode when needed:

```javascript
// Automatic environment handling in NewCashfreeService.js
if (this.config.CASHFREE_ENV === 'PRODUCTION' && isLocalhost) {
  console.warn('⚠️  Production Cashfree with localhost detected!');
  console.warn('   Switching to SANDBOX mode for development compatibility.');
  // Automatically switches to sandbox
}
```

## Testing Payment Flows

### Sandbox Mode (Development)
- Uses Cashfree test environment
- Accepts HTTP URLs
- Test payment flows work
- No real money transactions

### Production Mode (Live)
- Uses Cashfree live environment
- Requires HTTPS URLs
- Real payment transactions
- Must be on deployed server with SSL

## Environment Variables Reference

```bash
# For Development
CASHFREE_ENV="SANDBOX"
APP_BASE_URL="auto"

# For Staging/Production
CASHFREE_ENV="PRODUCTION"
APP_BASE_URL="auto"  # Will auto-detect HTTPS

# For Manual Override
CASHFREE_ENV="PRODUCTION"
APP_BASE_URL="https://yoursite.com"
```

## Current Configuration

Your app is now configured to:
1. **Auto-detect** environment based on hostname
2. **Switch to sandbox** automatically when using localhost with production credentials
3. **Use HTTPS** automatically for non-localhost domains
4. **Redirect appropriately**:
   - Success: `{domain}/thankyou`
   - Failure: `{domain}/cart`

This ensures compatibility across all environments while maintaining the proper payment flow.
