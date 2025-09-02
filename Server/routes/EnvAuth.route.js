const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const EnvAuth = require('../model/EnvAuth.modal');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Stricter rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts per window per IP
  message: {
    error: 'Too many login attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Get client IP helper
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         '127.0.0.1';
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// Input validation middleware
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-50 characters, alphanumeric only'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters'),
    
  body('captcha')
    .optional()
    .isLength({ min: 4, max: 6 })
    .withMessage('Invalid captcha')
];

// Session validation middleware
const validateSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.envAuthToken ||
                  req.body?.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }
    
    // Find user with valid session
    const user = await EnvAuth.findOne({
      currentSessionToken: token,
      isActive: true
    });
    
    if (!user || !user.isValidSession(token)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION'
      });
    }
    
    // Check IP if whitelist is enabled
    const clientIP = getClientIP(req);
    if (!user.isIPAllowed(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied from this IP address',
        code: 'IP_BLOCKED'
      });
    }
    
    // Extend session if it's going to expire soon
    if (user.sessionExpiry - new Date() < 5 * 60 * 1000) { // Less than 5 minutes
      user.sessionExpiry = new Date(Date.now() + EnvAuth.SESSION_TIMEOUT);
      await user.save();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_ERROR'
    });
  }
};

// Login endpoint
router.post('/login', 
  securityHeaders,
  loginLimiter,
  validateLogin,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: errors.array(),
          code: 'VALIDATION_ERROR'
        });
      }
      
      const { username, password } = req.body;
      const clientIP = getClientIP(req);
      
      
      // Find user
      const user = await EnvAuth.findOne({ username: username.toLowerCase() });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          error: 'Account temporarily locked due to failed login attempts',
          code: 'ACCOUNT_LOCKED',
          lockedUntil: user.lockedUntil
        });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Account is disabled',
          code: 'ACCOUNT_DISABLED'
        });
      }
      
      // Check IP whitelist
      if (!user.isIPAllowed(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP address',
          code: 'IP_BLOCKED'
        });
      }
      
      // Verify password
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        
        // Increment failed attempts
        await user.incLoginAttempts();
        
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          attemptsRemaining: Math.max(0, EnvAuth.MAX_LOGIN_ATTEMPTS - (user.failedLoginAttempts + 1))
        });
      }
      
      // Successful login
      
      // Reset failed attempts
      await user.resetLoginAttempts();
      
      // Generate new session token
      const sessionToken = user.generateSessionToken();
      
      // Update login info
      user.lastLogin = new Date();
      user.lastLoginIP = clientIP;
      
      await user.save();
      
      // Set secure cookie
      res.cookie('envAuthToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: EnvAuth.SESSION_TIMEOUT
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: sessionToken,
          expiresIn: EnvAuth.SESSION_TIMEOUT,
          user: {
            username: user.username,
            lastLogin: user.lastLogin,
            sessionTimeout: user.sessionExpiry
          }
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authentication service error',
        code: 'LOGIN_ERROR'
      });
    }
  }
);

// Logout endpoint - no validation required, always clear cookie
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.cookies?.envAuthToken ||
                 req.body?.token;
    
    if (token) {
      // Try to find and clear the user session if token exists
      try {
        const user = await EnvAuth.findOne({ currentSessionToken: token });
        if (user) {
          user.currentSessionToken = null;
          user.sessionExpiry = null;
          await user.save();
        }
      } catch (userError) {
        // Continue even if user update fails
      }
    }
    
    // Always clear cookie, even if no token or user found
    res.clearCookie('envAuthToken');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    // Still clear cookie even if there's an error
    res.clearCookie('envAuthToken');
    res.status(200).json({
      success: true,
      message: 'Logged out with cleanup errors'
    });
  }
});

// Validate session endpoint
router.get('/validate', validateSession, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        username: req.user.username,
        lastLogin: req.user.lastLogin,
        sessionExpiry: req.user.sessionExpiry
      }
    }
  });
});

// Change password endpoint
router.post('/change-password',
  validateSession,
  [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password required'),
    body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be 8-128 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: errors.array()
        });
      }
      
      const { currentPassword, newPassword } = req.body;
      const user = req.user;
      
      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      // Update password
      user.passwordHash = newPassword; // Will be hashed by pre-save hook
      user.updatedAt = new Date();
      
      // Invalidate all sessions for security
      user.currentSessionToken = null;
      user.sessionExpiry = null;
      
      await user.save();
      
      
      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Password change service error'
      });
    }
  }
);

// Security status endpoint
router.get('/security-status', validateSession, (req, res) => {
  const user = req.user;
  
  res.json({
    success: true,
    data: {
      username: user.username,
      lastLogin: user.lastLogin,
      lastLoginIP: user.lastLoginIP,
      sessionExpiry: user.sessionExpiry,
      twoFactorEnabled: user.twoFactorEnabled,
      ipWhitelistEnabled: user.requireIPWhitelist,
      allowedIPs: user.allowedIPs,
      accountLocked: user.isLocked(),
      failedAttempts: user.failedLoginAttempts
    }
  });
});

// Master password reset endpoint (for login page)
router.post('/master-reset', 
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per window
    message: { error: 'Too many reset attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
  }),
  [
    body('masterPassword').notEmpty().withMessage('Master password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }
      
      const { masterPassword, newPassword } = req.body;
      
      // Check master password
      if (masterPassword !== 'anand@7286') {
        return res.status(403).json({
          success: false,
          error: 'Invalid master password'
        });
      }
      
      // Find admin user
      const user = await EnvAuth.findOne({ username: 'admin' });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Admin user not found'
        });
      }
      
      // Reset the password
      user.passwordHash = newPassword; // Will be hashed by pre-save hook
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      user.currentSessionToken = null;
      user.sessionExpiry = null;
      user.updatedAt = new Date();
      
      await user.save();
      
      
      res.json({
        success: true,
        message: 'Password reset successfully using master password.',
        data: {
          username: user.username,
          resetTime: new Date().toISOString()
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Password reset service error'
      });
    }
  }
);

// Emergency password reset endpoint (for admin recovery)
router.post('/emergency-reset', 
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per window
    message: { error: 'Too many reset attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
  }),
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Valid username required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }
      
      const { username, newPassword } = req.body;
      
      // Only allow reset for admin user
      if (username !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Emergency reset only available for admin user'
        });
      }
      
      const user = await EnvAuth.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Reset the password
      user.passwordHash = newPassword; // Will be hashed by pre-save hook
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      user.currentSessionToken = null;
      user.sessionExpiry = null;
      user.updatedAt = new Date();
      
      await user.save();
      
      
      res.json({
        success: true,
        message: 'Password reset successfully. You can now login with the new password.',
        data: {
          username: user.username,
          resetTime: new Date().toISOString()
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Password reset service error'
      });
    }
  }
);

module.exports = router;
