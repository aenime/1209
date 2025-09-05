#!/bin/bash

echo "🔧 Cashfree Production + Localhost Setup"
echo "========================================"
echo
echo "❌ Current Issue: Production credentials require HTTPS URLs"
echo "📍 You're using localhost (HTTP) which Cashfree Production mode doesn't allow"
echo
echo "🚀 Quick Solutions:"
echo
echo "1️⃣  USE NGROK (Recommended for testing):"
echo "   npm install -g ngrok"
echo "   ngrok http 5001"
echo "   # Update .env with ngrok HTTPS URL"
echo
echo "2️⃣  GET SANDBOX CREDENTIALS (Recommended for development):"
echo "   - Login to Cashfree merchant dashboard"
echo "   - Switch to Test/Sandbox mode"  
echo "   - Copy sandbox credentials (they start with 'test')"
echo "   - Update .env with sandbox credentials"
echo
echo "3️⃣  DEPLOY TO HTTPS SERVER (For production testing):"
echo "   - Deploy your app to a server with HTTPS"
echo "   - Update APP_BASE_URL to your HTTPS domain"
echo
echo "💡 Current Status:"
echo "   - Credentials: PRODUCTION ✅"
echo "   - Environment: localhost ❌ (needs HTTPS)"
echo "   - Solution: Choose one of the options above"
echo
echo "🔧 For immediate testing with ngrok:"
echo "   1. Run: ngrok http 5001"
echo "   2. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "   3. Update .env: APP_BASE_URL=\"https://abc123.ngrok.io\""
echo "   4. Restart your server"
echo
echo "✅ This will allow production credentials to work with localhost!"
