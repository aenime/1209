/**
 * Node.js Core Modules
 */
const path = require("path");
const crypto = require("crypto");

/**
 * Environment Configuration
 * Load environment variables from both root and local .env files
 * Root .env takes precedence for deployment settings
 */
require("dotenv").config({ path: path.join(__dirname, '../.env') });
require("dotenv").config(); // Load local .env as override

/**
 * Express Framework and Middleware Imports
 */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

/**
 * Environment Detection
 * Auto-detect production vs development based on environment variables
 */
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || !!process.env.RENDER_SERVICE_ID;
const isDevelopment = !isProduction;

/**
 * Security Configuration
 * Auto-generate session secret if not provided for security
 */
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Port Configuration
 * Auto-detect port from environment (Render sets PORT automatically)
 * Fallback to 10000 for production, 5001 for development
 */
const PORT = process.env.PORT || (isProduction ? 10000 : 5001);

/**
 * MongoDB Database Connection Configuration
 * Uses environment variables with fallback to default connection string
 */
const dbName = process.env.DB || "kurti";
const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;

/**
 * Database Connection and Initialization
 */
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

database.once("connected", async () => {
  console.log("📊 Database connected successfully");
  
  // Initialize default admin user for environment configuration
  const EnvAuth = require('./model/EnvAuth.modal');
  await EnvAuth.createDefaultAdmin();
});

/**
 * Express Application Initialization
 */
const app = express();

/**
 * Security Middleware Configuration
 * 
 * Helmet.js provides security headers with custom CSP (Content Security Policy)
 * configured to allow necessary external resources for:
 * - Google Analytics and Google Ads tracking
 * - Facebook Pixel tracking
 * - Font and stylesheet resources
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'",
        "https://www.googletagmanager.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://www.googletagmanager.com",
        "https://connect.facebook.net",
        "https://www.google-analytics.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "https://www.google-analytics.com",
        "https://www.facebook.com",
        "https://googleads.g.doubleclick.net"
      ],
      connectSrc: [
        "'self'",
        "https://www.google-analytics.com",
        "https://analytics.google.com",
        "https://www.facebook.com",
        "https://connect.facebook.net",
        "https://www.google.com",
        "https://google.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googleadservices.com"
      ],
      frameSrc: [
        "'self'", 
        "https://www.facebook.com",
        "https://td.doubleclick.net",
        "https://www.googletagmanager.com"
      ],
      formAction: [
        "'self'"
      ],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

/**
 * Trust Proxy Configuration
 * Enable accurate IP detection when behind reverse proxies (Render, Cloudflare, etc.)
 */
app.set('trust proxy', 1);

/**
 * Cookie Parser Middleware
 * Enable parsing of cookies for session management
 */
app.use(cookieParser());

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Development: Allow localhost origins for local development
 * Production: Dynamic validation for secure HTTPS-only connections
 */
const allowedOrigins = isDevelopment 
  ? [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3001',
      'http://localhost:3002', 
      'http://127.0.0.1:3002'
    ]
  : null; // In production, use dynamic validation instead of fixed list

/**
 * Dynamic CORS Origin Validation for Production
 * 
 * Validates incoming requests in production environment:
 * - Requires HTTPS protocol for security
 * - Allows requests with no origin (mobile apps, etc.)
 * - Validates URL format for security
 * 
 * @param {string} origin - The origin of the incoming request
 * @returns {boolean} Whether the origin is allowed
 */
const isValidProductionOrigin = (origin) => {
  if (!origin) return true; // Allow requests with no origin (mobile apps, etc.)
  
  // Parse the origin URL safely
  try {
    const url = new URL(origin);
    
    // Require HTTPS in production for security
    if (url.protocol !== 'https:') {
      return false;
    }
    
    // Allow any valid domain with HTTPS
    // Additional domain validation can be added here if needed
    return true;
    
  } catch (error) {
    return false; // Invalid URL format
  }
};


/**
 * CORS Middleware Configuration
 * 
 * Configures Cross-Origin Resource Sharing based on environment:
 * - Development: Allows specific localhost origins for local testing
 * - Production: Uses dynamic validation with HTTPS requirement for security
 */
app.use(cors({
  origin: function (origin, callback) {
    if (isDevelopment) {
      // Development: Use predefined localhost origins for testing
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Production: Use dynamic validation with security checks
      if (isValidProductionOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Checkout-Address',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Legacy browser compatibility
}));

/**
 * Request Body Parsing Middleware
 * 
 * Configures Express to parse JSON and URL-encoded data with:
 * - 10MB limit for large image uploads and bulk operations
 * - Extended URL encoding for complex form data
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Checkout-Address, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Additional CORS debugging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
  }
  
  // Debug all API requests
  if (req.path.startsWith('/api/')) {
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    // CORS preflight request handled by middleware
  }
  
  next();
});

// API Routes - Ensure routes are loaded before catch-all
const configRoute = require('./routes/Config.route');
const envConfigRoute = require('./routes/EnvConfig.route');
const envAuthRoute = require('./routes/EnvAuth.route');
const pincodeRoute = require('./routes/Pincode.route');
const paymentRoute = require('./routes/Payment.route');
const enhancedPaymentRoute = require('./routes/EnhancedPayment.route');

// Mount API routes first (critical for proper routing)
app.use('/api', configRoute);
app.use('/api/env-config', envConfigRoute);
app.use('/api/env-auth', envAuthRoute);
app.use('/api/pincode', pincodeRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/enhanced-payment', enhancedPaymentRoute); // New Cashfree SDK routes

// Legacy route compatibility for frontend
app.use('/api/payment-enhanced', enhancedPaymentRoute); // For backward compatibility with frontend

// Product and Slider routes  
require("./routes/Products.route")(app);
require("./routes/Slider.route")(app);


// Serve static files - auto mode
const productionPath = path.join(__dirname, '../Client/build');
const developmentPath = path.join(__dirname, 'public');
const staticPath = isProduction ? productionPath : developmentPath;

app.use(express.static(staticPath));

// Serve additional static files from public directory in production
if (isProduction) {
  app.use('/public', express.static(path.join(__dirname, 'public')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CSP debug endpoint for tracking configuration
app.get('/api/csp-debug', (req, res) => {
  res.status(200).json({
    status: 'CSP Configuration',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    csp_domains: {
      google_analytics: ['https://www.google-analytics.com', 'https://analytics.google.com'],
      google_ads: ['https://www.google.com', 'https://google.com', 'https://googleads.g.doubleclick.net', 'https://www.googleadservices.com'],
      facebook: ['https://www.facebook.com', 'https://connect.facebook.net'],
      frames: ['https://td.doubleclick.net', 'https://www.googletagmanager.com']
    },
    message: 'Updated CSP to allow Google Ads tracking domains'
  });
});

// Tracking validation endpoint for production debugging
app.get('/api/tracking-status', async (req, res) => {
  try {
    const EnvConfig = require('./model/EnvConfig.modal');
    const config = await EnvConfig.findOne({ configName: 'default' });
    
    if (!config) {
      return res.json({
        status: 'error',
        message: 'No environment configuration found',
        tracking: {
          google_analytics: false,
          facebook_pixel: false,
          google_ads: false
        }
      });
    }
    
    const trackingStatus = {
      google_analytics: !!(config.REACT_APP_G4 && config.REACT_APP_G4 !== '' && config.REACT_APP_G4 !== 'one@one'),
      facebook_pixel: !!(config.REACT_APP_FBPIXEL && config.REACT_APP_FBPIXEL !== '' && config.REACT_APP_FBPIXEL !== '8098098090980'),
      google_ads: !!(config.REACT_APP_AW && config.REACT_APP_AW !== '' && config.REACT_APP_AW !== 'aw 798798'),
      purchase_tag: !!(config.REACT_APP_AW_CONVERSION_ID && config.REACT_APP_AW_CONVERSION_ID !== ''),
      use_offer_price: config.REACT_APP_TRACKING_USE_OFFER_PRICE === 'yes'
    };
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
      tracking: trackingStatus,
      config_ids: {
        ga4: config.REACT_APP_G4 ? config.REACT_APP_G4.substring(0, 8) + '...' : 'not set',
        fbpixel: config.REACT_APP_FBPIXEL ? config.REACT_APP_FBPIXEL.substring(0, 4) + '...' : 'not set',
        google_ads: config.REACT_APP_AW ? config.REACT_APP_AW.substring(0, 8) + '...' : 'not set'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for environment variables (development only)
app.get('/debug-env', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Debug endpoint disabled in production' });
  }
  
  res.json({
    message: 'Environment variables are now managed via database. Use /api/env-config/current instead.',
    newEndpoint: '/api/env-config/current',
    configPage: '/env',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Legacy environment check - redirect to new system
app.get('/env-check', (req, res) => {
  res.status(301).json({
    deprecated: true,
    message: 'Environment variables are now managed via database.',
    newEndpoint: '/api/env-config/current',
    configPage: '/env',
    timestamp: new Date().toISOString()
  });
});

// Simple tracking debug endpoint
app.get('/api/tracking-debug', async (req, res) => {
  try {
    const EnvConfig = require('./model/EnvConfig.modal');
    const config = await EnvConfig.findOne({ configName: 'default' });
    
    res.json({
      success: true,
      trackingConfig: {
        googleAnalytics: config?.REACT_APP_G4 ? 'Configured' : 'Not configured',
        facebookPixel: config?.REACT_APP_FBPIXEL ? 'Configured' : 'Not configured',
        googleAds: config?.REACT_APP_AW ? 'Configured' : 'Not configured',
        useOfferPrice: config?.REACT_APP_TRACKING_USE_OFFER_PRICE || 'Not set'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check tracking configuration',
      timestamp: new Date().toISOString()
    });
  }
});

// Config version endpoint for cache invalidation
app.get('/api/env-config/version', async (req, res) => {
  try {
    const EnvConfig = require('./model/EnvConfig.modal');
    const config = await EnvConfig.findOne({ configName: 'default' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }
    
    res.json({
      success: true,
      version: config.updatedAt ? new Date(config.updatedAt).getTime() : Date.now(),
      lastModified: config.updatedAt || new Date().toISOString(),
      configExists: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get config version',
      timestamp: new Date().toISOString()
    });
  }
});

// Password reset functionality moved to login page

// Handle React routing - return all requests to React app
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(productionPath) 
    ? path.join(productionPath, 'index.html')
    : path.join(developmentPath, 'index.html');
  res.sendFile(indexPath);
});

// Auto port detection
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});