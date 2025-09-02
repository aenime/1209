/**
 * React Core and Navigation Imports
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Utility Functions and Services
 */
import { getPrimaryThemeColor } from '../../utils/themeColorsSimple';
import advancedApiService from '../../services/advancedApiService';
import StorageService from '../../services/storageService';

/**
 * Environment Configuration Page - Admin Panel for Site Configuration
 * 
 * Comprehensive admin interface for managing environment settings:
 * - Complete site branding and appearance configuration
 * - Payment gateway integration settings (Cashfree, COD)
 * - Business information and contact details management
 * - Offer system configuration and promotional settings
 * - Social media and external service integrations
 * - Advanced developer settings with password protection
 * - Multi-section organized interface for easy navigation
 * - Real-time preview and validation of configuration changes
 * 
 * Key Features:
 * - Admin authentication required for access security
 * - Responsive design for mobile and desktop administration
 * - Auto-save functionality with visual feedback
 * - Configuration validation and error handling
 * - Development mode bypass for easier testing
 * - Advanced settings protection with secondary authentication
 * - Real-time configuration updates with API integration
 * - Organized sections for different configuration categories
 * 
 * Security Features:
 * - Admin authentication requirement
 * - Session validation and timeout handling
 * - Advanced settings password protection
 * - Secure API endpoints for configuration updates
 * - Development mode detection for testing convenience
 * 
 * Configuration Sections:
 * - Branding: Logo, colors, site name, domain settings
 * - Business: Contact information, address, business details
 * - Payment: Cashfree settings, payment methods
 * - Offers: Promotional system configuration and eligibility
 * - Social: Social media links and integration settings
 * - Advanced: Developer settings, API configurations
 * 
 * User Experience:
 * - Tabbed interface for organized configuration management
 * - Visual feedback for save operations and errors
 * - Mobile-responsive design for administration on any device
 * - Real-time validation and preview capabilities
 * - Intuitive form layouts with helpful descriptions
 */
const EnvConfigPage = () => {
  /**
   * Navigation and Location Hooks
   */
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Configuration State Management
   * 
   * Manages all configuration data and UI states:
   * - config: Main configuration object with all settings
   * - UI states: loading, saving, authentication status
   * - User information and session management
   * - Mobile responsiveness and section navigation
   */
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('Branding');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [advancedPassword, setAdvancedPassword] = useState('');
  const [showAdvancedPasswordModal, setShowAdvancedPasswordModal] = useState(false);
  const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(false);
  
  /**
   * Admin Context Detection
   * 
   * Determines if user is accessing through admin panel:
   * - Checks URL path for admin context
   * - Ensures proper routing and access control
   * - Maintains security for configuration access
   */
  const isAdminContext = location.pathname.startsWith('/myadmin') || location.pathname.startsWith('/env');

  /**
   * Authentication and Initialization Effect
   * 
   * Handles component initialization and security:
   * - Redirects old env routes to admin login
   * - Checks authentication status
   * - Sets up responsive design listeners
   * - Initializes configuration loading
   */
  useEffect(() => {
    checkAuthentication();
    
    // Responsive design handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigate]);

  /**
   * Authentication Check for Environment Configuration Access
   * 
   * This function ensures that only authenticated admin users can access
   * environment configuration. All access requires proper login - no auto-authentication.
   * 
   * Features:
   * - Session validation and user information loading
   * - Configuration loading after authentication verification
   * - Redirects to login if authentication fails
   */
  const checkAuthentication = async () => {
    console.log('🔐 Starting authentication check...');
    try {
      // All env configuration requires admin authentication
      const adminLoggedIn = StorageService.getItem('adminLoggedIn');
      console.log('🗂️ Admin logged in status:', adminLoggedIn);
      
      if (!adminLoggedIn) {
        console.log('❌ No admin login found, redirecting to login');
        setIsLoading(false); // Clear loading state before redirect
        navigate('/myadmin/login');
        return;
      }
      
      console.log('📡 Validating admin session...');
      // Verify admin session with backend
      const adminResponse = await advancedApiService.request('/api/env-auth/validate', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('📥 Admin validation response:', adminResponse);

      if (adminResponse && adminResponse.success) {
        console.log('✅ Admin authenticated successfully');
        setIsAuthenticated(true);
        setUser(adminResponse.data.user);
        try {
          console.log('🔄 Loading configuration...');
          await loadCurrentConfigDirect();
        } catch (configError) {
          console.error('Failed to load configuration after authentication:', configError);
          // Even if config loading fails, user is authenticated, so don't redirect
          // The loadCurrentConfigDirect function handles its own error state
        }
      } else {
        // Admin has localStorage auth but not env auth - need to authenticate with env-auth
        console.log('Local admin auth found but env-auth validation failed. Redirecting to login for env authentication.');
        StorageService.removeItem('adminLoggedIn'); // Clear invalid state
        setIsLoading(false); // Clear loading state before redirect
        navigate('/myadmin/login');
        return;
      }
    } catch (error) {
      // For authentication errors, redirect to login to get proper env-auth token
      console.error('❌ Authentication error:', error);
      StorageService.removeItem('adminLoggedIn'); // Clear invalid state
      setIsLoading(false); // Clear loading state before redirect
      navigate('/myadmin/login');
    }
  };

  const handleLogout = async () => {
    try {
      await advancedApiService.request('/api/env-auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear admin login state and redirect to admin login
  StorageService.removeItem('adminLoggedIn');
  StorageService.removeItem('adminLastLogin');
      navigate('/myadmin/login');
    } catch (error) {
      // Force redirect even if logout fails
  StorageService.removeItem('adminLoggedIn');
  StorageService.removeItem('adminLastLogin');
      navigate('/myadmin/login');
    }
  };

  // Environment variable definitions with their types and mobile-friendly metadata
  const envVariables = {
    // Branding & UI
    REACT_APP_FAM: { 
      type: 'text', 
      section: 'Branding', 
      label: 'Brand Name',
      mobileLabel: 'Your Store Name',
      icon: '🏷️',
      placeholder: 'My Amazing Store',
      help: 'This appears as your brand name to customers'
    },
    REACT_APP_BRAND_TAGLINE: { 
      type: 'text', 
      section: 'Branding', 
      label: 'Brand Tagline',
      mobileLabel: 'Store Tagline',
      icon: '💬',
      placeholder: 'SHOP ONLINE',
      help: 'A catchy phrase that describes your store'
    },
    REACT_APP_LOGO: { 
      type: 'text', 
      section: 'Branding', 
      label: 'Logo URL',
      mobileLabel: 'Store Logo URL',
      icon: '🖼️',
      placeholder: 'https://yourstore.com/logo.png',
      help: 'Link to your store logo image'
    },
    REACT_APP_MO: { 
      type: 'text', 
      section: 'Branding', 
      label: 'Mobile Number',
      mobileLabel: 'Customer Support Phone',
      icon: '📱',
      placeholder: '+91 9876543210',
      help: 'Phone number customers can call for help'
    },
    REACT_APP_ADDRESS: { 
      type: 'text', 
      section: 'Branding', 
      label: 'Address',
      mobileLabel: 'Store Address',
      icon: '📍',
      placeholder: 'Mumbai, MH 400043 IN',
      help: 'Your business address for deliveries'
    },
    
    // Theme Colors
    REACT_APP_KEY_COLOR: { 
      type: 'color', 
      section: 'Theme', 
      label: 'Primary Color',
      mobileLabel: 'Main Theme Color',
      icon: '🎨',
      help: 'Primary color for buttons and highlights'
    },
    REACT_APP_S_COLOR: { 
      type: 'color', 
      section: 'Theme', 
      label: 'Secondary Color',
      mobileLabel: 'Secondary Color',
      icon: '🌈',
      help: 'Supporting color for backgrounds'
    },
    REACT_APP_ADDRESS_BUTTON_COLOR: { 
      type: 'color', 
      section: 'Theme', 
      label: 'Address Button Color',
      mobileLabel: 'Address Button Color',
      icon: '🟢',
      help: 'Color for address selection buttons'
    },
    
    // Feature Toggles
    REACT_APP_COD: { 
      type: 'toggle', 
      section: 'Features', 
      label: 'Cash on Delivery',
      mobileLabel: 'Cash on Delivery',
      icon: '💵',
      help: 'Let customers pay when they receive the product'
    },
    REACT_APP_SIZE: { 
      type: 'toggle', 
      section: 'Features', 
      label: 'Size Selection',
      mobileLabel: 'Size Chart for Clothes',
      icon: '📏',
      help: 'Show size chart for clothing items'
    },
    
    // Payment Options
    CASHFREE_ENABLED: { 
      type: 'toggle', 
      section: 'Payment', 
      label: 'Cashfree Payment Gateway',
      mobileLabel: 'Cashfree Payment Gateway',
      icon: '💳',
      help: 'Enable Cashfree hosted payment page for online payments',
      toggleOptions: { on: true, off: false }
    },
    CASHFREE_CLIENT_ID: { 
      type: 'text', 
      section: 'Payment', 
      label: 'Cashfree Client ID',
      mobileLabel: 'Cashfree Client ID',
      icon: '🆔',
      placeholder: 'CF123456ABCDEFGHIJKLMNOP',
      help: 'Your Cashfree Client ID from the dashboard'
    },
    CASHFREE_CLIENT_SECRET: { 
      type: 'text', 
      section: 'Payment', 
      label: 'Cashfree Client Secret',
      mobileLabel: 'Cashfree Client Secret',
      icon: '�',
      placeholder: 'cfsk_ma_test_12345abcdef',
      help: 'Your Cashfree Client Secret (keep this secure)'
    },
    CASHFREE_ENVIRONMENT: { 
      type: 'select', 
      section: 'Payment', 
      label: 'Cashfree Environment',
      mobileLabel: 'Cashfree Environment',
      icon: '🌍',
      options: [
        { value: 'sandbox', label: 'Sandbox (Testing)' },
        { value: 'production', label: 'Production (Live)' }
      ],
      help: 'Choose sandbox for testing, production for live payments'
    },
    
    // Analytics
    REACT_APP_G4: { 
      type: 'text', 
      section: 'Analytics', 
      label: 'Google Analytics 4 ID',
      mobileLabel: 'Google Analytics',
      icon: '📈',
      placeholder: 'G-XXXXXXXXXX (Required)',
      help: 'Track how many people visit your store (free from Google)'
    },
    REACT_APP_FBPIXEL: { 
      type: 'text', 
      section: 'Analytics', 
      label: 'Facebook Pixel ID',
      mobileLabel: 'Facebook Pixel',
      icon: '📘',
      placeholder: '1234567890',
      help: 'Track Facebook ad performance (get from Facebook Ads)'
    },
    REACT_APP_AW: { 
      type: 'text', 
      section: 'Analytics', 
      label: 'Google Ads Account ID',
      mobileLabel: 'Google Ads Account',
      icon: '🎯',
      placeholder: 'AW-XXXXXXXXX (Required)',
      help: 'Your Google Ads account ID (get from Google Ads dashboard)'
    },
    REACT_APP_AW_CONVERSION_ID: { 
      type: 'text', 
      section: 'Analytics', 
      label: 'Google Ads Conversion ID',
      mobileLabel: 'Purchase Conversion Tracking',
      icon: '🛒',
      placeholder: 'AW-XXXXXXXXX/YYYYYYYYY',
      help: 'Google Ads conversion action ID for purchase tracking (Account ID + Conversion Action ID)'
    },
    REACT_APP_TRACKING_USE_OFFER_PRICE: { 
      type: 'toggle', 
      section: 'Analytics', 
      label: 'Track Offer Prices',
      mobileLabel: 'Track Sale Prices',
      icon: '🏷️',
      help: 'Track discounted prices in your analytics'
    },
    
    // Advanced
    REACT_APP_DETECTION_MODE: { 
      type: 'select', 
      section: 'Advanced', 
      label: 'Detection Mode',
      mobileLabel: 'Security Level',
      icon: '🔒',
      options: [
        { value: '0', label: 'Off' },
        { value: '1', label: 'High (For experienced users)' },
        { value: '2', label: 'Medium (Balanced)' },
        { value: '3', label: 'Low (Minimal security)' }
      ],
      help: 'Choose security level for your store'
    },
    REACT_APP_OFFER_URL_SUFFIX: { 
      type: 'text', 
      section: 'Advanced', 
      label: 'Offer URL Suffix',
      mobileLabel: 'Special Offer URL',
      icon: '🎁',
      placeholder: 'special-offer',
      help: 'Custom URL ending for special offer pages (e.g., /special-offer)'
    },
  };

  useEffect(() => {
    // Removed automatic loadCurrentConfig - now called only after authentication
  }, []);

  const loadCurrentConfig = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await advancedApiService.request('/api/env-config/current', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (result.success) {
        // Extract only the environment variables, exclude metadata
        const { _id, __v, configName, createdAt, updatedAt, isActive, ...envData } = result.data;
        setConfig(envData);
      } else {
        throw new Error(result.message || 'Failed to load configuration');
      }
    } catch (error) {
      setSaveMessage('⚠️ Could not load configuration from database. Using defaults.');
      
      // Fallback to defaults
      const defaultConfig = {
        REACT_APP_FAM: '',
        REACT_APP_BRAND_TAGLINE: 'ONLINE',
        REACT_APP_LOGO: '',
        REACT_APP_MO: '',
        REACT_APP_ADDRESS: 'Your  Here',
        REACT_APP_KEY_COLOR: '',
        REACT_APP_S_COLOR: '',
        REACT_APP_ADDRESS_BUTTON_COLOR: '',
        REACT_APP_COD: '',
        REACT_APP_SIZE: '',
        CASHFREE_ENABLED: false,
        CASHFREE_CLIENT_ID: '',
        CASHFREE_CLIENT_SECRET: '',
        CASHFREE_ENVIRONMENT: 'sandbox',
        REACT_APP_G4: '',
        REACT_APP_FBPIXEL: '',
        REACT_APP_AW: '',
        REACT_APP_AW_CONVERSION_ID: '',
        REACT_APP_TRACKING_USE_OFFER_PRICE: '',
        REACT_APP_DETECTION_MODE: '',
        REACT_APP_OFFER_URL_SUFFIX: '',
      };
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct config loading without state dependency
  const loadCurrentConfigDirect = async () => {
    console.log('🔄 Starting loadCurrentConfigDirect...');
    setIsLoading(true);
    
    // Add a timeout to prevent indefinite loading
    const timeout = setTimeout(() => {
      console.warn('⚠️ API request timeout after 10 seconds');
      setIsLoading(false);
      setSaveMessage('⚠️ Request timeout. Using default configuration.');
      // Set default config on timeout
      const defaultConfig = {
        REACT_APP_FAM: '',
        REACT_APP_BRAND_TAGLINE: 'ONLINE',
        REACT_APP_LOGO: '',
        REACT_APP_MO: '',
        REACT_APP_ADDRESS: 'Your Address Here',
        REACT_APP_KEY_COLOR: '',
        REACT_APP_S_COLOR: '',
        REACT_APP_ADDRESS_BUTTON_COLOR: '',
        REACT_APP_COD: '',
        REACT_APP_SIZE: '',
        CASHFREE_ENABLED: false,
        CASHFREE_CLIENT_ID: '',
        CASHFREE_CLIENT_SECRET: '',
        CASHFREE_ENVIRONMENT: 'sandbox',
        REACT_APP_G4: '',
        REACT_APP_FBPIXEL: '',
        REACT_APP_AW: '',
        REACT_APP_AW_CONVERSION_ID: '',
        REACT_APP_TRACKING_USE_OFFER_PRICE: '',
        REACT_APP_DETECTION_MODE: '',
        REACT_APP_OFFER_URL_SUFFIX: '',
      };
      setConfig(defaultConfig);
    }, 10000);
    
    try {
      console.log('📡 Making API request to /api/env-config/current');
      const result = await advancedApiService.request('/api/env-config/current', {
        method: 'GET',
        credentials: 'include'
      });
      
      clearTimeout(timeout); // Clear timeout on successful response
      console.log('📥 Received API response:', result);
      
      if (result.success) {
        console.log('✅ Config loaded successfully');
        // Extract only the environment variables, exclude metadata
        const { _id, __v, configName, createdAt, updatedAt, isActive, ...envData } = result.data;
        setConfig(envData);
        console.log('🎯 Config set to state:', envData);
      } else {
        throw new Error(result.message || 'Failed to load configuration');
      }
    } catch (error) {
      clearTimeout(timeout); // Clear timeout on error
      console.error('❌ Error loading config:', error);
      setSaveMessage('⚠️ Could not load configuration from database. Using defaults.');
      
      // Fallback to defaults - ensuring all tracking fields are included
      const defaultConfig = {
        REACT_APP_FAM: '',
        REACT_APP_BRAND_TAGLINE: 'ONLINE',
        REACT_APP_LOGO: '',
        REACT_APP_MO: '',
        REACT_APP_ADDRESS: 'Your Address Here',
        REACT_APP_KEY_COLOR: '',
        REACT_APP_S_COLOR: '',
        REACT_APP_ADDRESS_BUTTON_COLOR: '',
        REACT_APP_COD: '',
        REACT_APP_SIZE: '',
        CASHFREE_ENABLED: false,
        CASHFREE_CLIENT_ID: '',
        CASHFREE_CLIENT_SECRET: '',
        CASHFREE_ENVIRONMENT: 'sandbox',
        REACT_APP_G4: '',
        REACT_APP_FBPIXEL: '',
        REACT_APP_AW: '',
        REACT_APP_AW_CONVERSION_ID: '', // Ensure this field is always present
        REACT_APP_TRACKING_USE_OFFER_PRICE: '',
        REACT_APP_DETECTION_MODE: '',
        REACT_APP_OFFER_URL_SUFFIX: '',
      };
      setConfig(defaultConfig);
      console.log('🔄 Set default config due to error');
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggleChange = (key, value) => {
    const variable = envVariables[key];
    const toggleOptions = variable.toggleOptions || { on: 'yes', off: 'no' };
    const newValue = value ? toggleOptions.on : toggleOptions.off;
    
    console.log('Toggle Change:', { key, value, toggleOptions, newValue });
    
    setConfig(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  // Advanced password protection functions
  const handleAdvancedAccess = () => {
    setShowAdvancedPasswordModal(true);
  };

  const verifyAdvancedPassword = () => {
    if (advancedPassword === '1188@@88') {
      setIsAdvancedUnlocked(true);
      setShowAdvancedPasswordModal(false);
      setAdvancedPassword('');
      setSaveMessage('✅ Advanced Settings unlocked successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('❌ Incorrect password for Advanced Settings');
      setAdvancedPassword('');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const closeAdvancedPasswordModal = () => {
    setShowAdvancedPasswordModal(false);
    setAdvancedPassword('');
  };

  const saveConfig = async () => {
    if (!isAuthenticated) {
      setSaveMessage('❌ Authentication required to save configuration');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const result = await advancedApiService.request('/api/env-config/save', {
        method: 'POST',
        body: config, // Send the object directly, let advancedApiService handle JSON.stringify
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (result.success) {
        setSaveMessage('✅ Configuration saved to database successfully!');
        
        // Also offer to download .env file
        setTimeout(() => {
          if (window.confirm('Configuration saved! Would you like to download the .env file?')) {
            downloadEnvFile();
          }
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to save configuration');
      }
    } catch (error) {
      setSaveMessage('❌ Error saving configuration to database. Check the console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (window.confirm('Are you sure you want to reset all values to defaults? This will permanently delete your current configuration from the database.')) {
      setIsLoading(true);
      try {
        const result = await advancedApiService.request('/api/env-config/reset', {
          method: 'POST'
        });
        
        if (result.success) {
          const { _id, __v, configName, createdAt, updatedAt, isActive, ...envData } = result.data;
          setConfig(envData);
          setSaveMessage('✅ Configuration reset to defaults successfully!');
        } else {
          throw new Error(result.message || 'Failed to reset configuration');
        }
      } catch (error) {
        setSaveMessage('❌ Error resetting configuration. Check the console for details.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add new function for downloading .env file
  const downloadEnvFile = async () => {
    try {
      const envContent = await advancedApiService.request('/api/env-config/export', {
        method: 'GET'
      });
      if (envContent) {
        const blob = new Blob([envContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '.env';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSaveMessage('✅ .env file downloaded successfully!');
      } else {
        throw new Error('Failed to download .env file');
      }
    } catch (error) {
      setSaveMessage('❌ Error downloading .env file.');
    }
  };

  const groupedVariables = Object.keys(envVariables).reduce((acc, key) => {
    const section = envVariables[key].section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(key);
    return acc;
  }, {});

  // Map sections for mobile view
  const sectionConfig = {
    Branding: { title: '🏪 Store Settings', icon: '🏪', color: 'bg-blue-500' },
    Theme: { title: '🎨 Colors & Design', icon: '🎨', color: 'bg-purple-500' },
    Payment: { title: '💰 Payment Methods', icon: '💰', color: 'bg-green-500' },
    Features: { title: '⚙️ Store Features', icon: '⚙️', color: 'bg-orange-500' },
    Analytics: { title: '📊 Track Your Business', icon: '📊', color: 'bg-indigo-500' },
    Advanced: { title: '🔧 Advanced Settings', icon: '🔧', color: 'bg-gray-500' }
  };

  const primaryColor = getPrimaryThemeColor();

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isMobile ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gray-50'} flex items-center justify-center ${isMobile ? 'p-4' : ''}`}>
        <div className={`${isMobile ? 'bg-white rounded-xl shadow-lg p-8 text-center max-w-sm w-full' : 'text-center'}`}>
          <div className={`animate-spin rounded-full ${isMobile ? 'h-12 w-12 border-4 border-blue-500 border-t-transparent' : 'h-12 w-12 border-b-2 border-blue-600'} mx-auto mb-4`}></div>
          <p className={`${isMobile ? 'text-gray-900 font-semibold text-lg mb-2' : 'text-gray-600'}`}>
            {isMobile ? 'Loading Your Store Settings' : (isAuthenticated ? 'Loading configuration...' : 'Checking authentication...')}
          </p>
          {isMobile && (
            <p className="text-gray-600 text-sm">Please wait while we fetch your configuration...</p>
          )}
        </div>
      </div>
    );
  }

  // Don't render anything until authentication check is complete
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className={`min-h-screen ${isMobile ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gray-50'} ${isMobile ? '' : 'py-8 px-4'}`}>
      {isMobile ? (
        // Mobile Layout
        <>
          {/* Mobile Header */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => isAdminContext ? navigate('/myadmin') : navigate('/')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
                    <p className="text-sm text-gray-600">Configure your online store</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Info Bar */}
            {user && (
              <div className="px-4 py-2 bg-green-50 border-t">
                <p className="text-sm text-green-800">
                  ✅ Logged in as <span className="font-semibold">{user.username}</span>
                </p>
              </div>
            )}

            {/* Save Message */}
            {saveMessage && (
              <div className={`px-4 py-2 border-t ${saveMessage.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="text-sm font-medium">{saveMessage}</p>
              </div>
            )}
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="bg-white border-b overflow-x-auto">
            <div className="flex space-x-1 px-4 py-2">
              {Object.entries(sectionConfig).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title.replace(/🔍|🏪|🎨|💰|⚙️|📊|🔧\s/, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Content Area */}
          <div className="p-4 pb-24">
            {Object.entries(groupedVariables).map(([sectionKey, keys]) => {
              if (sectionKey !== activeSection) return null;
              const section = sectionConfig[sectionKey];

              return (
                <div key={sectionKey} className="space-y-4">
                  {/* Section Header */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                        <p className="text-gray-600 text-sm">Customize your store settings</p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings Password Protection (Mobile) */}
                  {sectionKey === 'Advanced' && !isAdvancedUnlocked ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">🔒 Protected Settings</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Advanced settings require additional authentication for security purposes.
                      </p>
                      <button
                        onClick={handleAdvancedAccess}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        🔓 Unlock Advanced Settings
                      </button>
                    </div>
                  ) : (
                  <>
                  {/* Fields */}
                  {keys.map(fieldKey => {
                    const field = envVariables[fieldKey];
                    return (
                      <div key={fieldKey} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                            {field.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="block text-lg font-semibold text-gray-900 mb-2">
                              {field.mobileLabel || field.label}
                            </label>
                            <p className="text-sm text-gray-600 mb-4">{field.help}</p>

                            {/* Mobile Input Field */}
                            {field.type === 'toggle' ? (
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => {
                                    const toggleOptions = field.toggleOptions || { on: 'yes', off: 'no' };
                                    const currentValue = config[fieldKey];
                                    const isCurrentlyOn = currentValue === toggleOptions.on;
                                    handleToggleChange(fieldKey, !isCurrentlyOn);
                                  }}
                                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    (() => {
                                      const toggleOptions = field.toggleOptions || { on: 'yes', off: 'no' };
                                      return config[fieldKey] === toggleOptions.on ? 'bg-blue-600' : 'bg-gray-300';
                                    })()
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                      (() => {
                                        const toggleOptions = field.toggleOptions || { on: 'yes', off: 'no' };
                                        return config[fieldKey] === toggleOptions.on ? 'translate-x-7' : 'translate-x-1';
                                      })()
                                    }`}
                                  />
                                </button>
                                <span className={`text-lg font-medium ${
                                  (() => {
                                    const toggleOptions = field.toggleOptions || { on: 'yes', off: 'no' };
                                    return config[fieldKey] === toggleOptions.on ? 'text-green-600' : 'text-gray-500';
                                  })()
                                }`}>
                                  {(() => {
                                    const toggleOptions = field.toggleOptions || { on: 'yes', off: 'no' };
                                    return config[fieldKey] === toggleOptions.on ? 'Enabled' : 'Disabled';
                                  })()}
                                </span>
                              </div>
                            ) : field.type === 'color' ? (
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={config[fieldKey] || '#000000'}
                                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                  className="h-12 w-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={config[fieldKey] || ''}
                                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                  placeholder="#000000"
                                  className="flex-1 h-12 px-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            ) : field.type === 'select' ? (
                              <select
                                value={config[fieldKey] || '0'}
                                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                className="w-full h-12 px-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                              >
                                {field.options.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                value={config[fieldKey] || ''}
                                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full h-12 px-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fixed Bottom Save Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
            <button
              onClick={saveConfig}
              disabled={isSaving}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        // Desktop Layout
        <div className="max-w-6xl mx-auto">
          {/* Desktop Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🔐 Environment Configuration</h1>
                <p className="text-gray-600 mt-2">Secure configuration management</p>
                {user && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Logged in as: <strong>{user.username}</strong> | 
                    Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => isAdminContext ? navigate('/myadmin') : navigate('/')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Back to {isAdminContext ? 'Admin Dashboard' : 'Home'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {saveMessage}
            </div>
          )}

          {/* Desktop Configuration Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {Object.entries(groupedVariables).map(([section, keys]) => (
              <div key={section} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  📋 {section}
                </h2>
                
                {section === 'Advanced' && !isAdvancedUnlocked ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">🔒 Protected Settings</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Advanced settings require additional authentication for security purposes.
                      </p>
                      <button
                        onClick={handleAdvancedAccess}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🔓 Unlock Advanced Settings
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.map(key => {
                      const variable = envVariables[key];
                      const value = config[key] || '';
                      
                      return (
                        <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {variable.label}
                          <span className="text-xs text-gray-500 ml-2">({key})</span>
                        </label>
                        
                        {variable.type === 'toggle' ? (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleToggleChange(key, value !== (variable.toggleOptions?.on || 'yes'))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                value === (variable.toggleOptions?.on || 'yes') ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value === (variable.toggleOptions?.on || 'yes') ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-600">
                              {value === (variable.toggleOptions?.on || 'yes') ? 
                                (variable.toggleOptions?.on || 'Yes') : 
                                (variable.toggleOptions?.off || 'No')
                              }
                            </span>
                          </div>
                        ) : variable.type === 'select' ? (
                          <select
                            value={value}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {variable.options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : variable.type === 'color' ? (
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={value || '#000000'}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              placeholder="#000000"
                              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            placeholder={`Enter ${variable.label.toLowerCase()}`}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                onClick={resetToDefaults}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                🔄 Reset to Defaults
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={downloadEnvFile}
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                >
                  📥 Download .env
                </button>
                
                <button
                  onClick={loadCurrentConfig}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  🔄 Reload from DB
                </button>
                
                <button
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving to DB...
                    </span>
                  ) : (
                    '💾 Save to Database'
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Database Storage:</strong> All configuration changes are now saved to the database and persist across application restarts. You can also download the .env file for manual deployment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings Password Modal */}
      {showAdvancedPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🔒 Advanced Settings Access</h3>
              <p className="text-sm text-gray-600">
                Please enter the password to access advanced security settings
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={advancedPassword}
                onChange={(e) => setAdvancedPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verifyAdvancedPassword()}
                placeholder="Enter advanced settings password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeAdvancedPasswordModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyAdvancedPassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔓 Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvConfigPage;
