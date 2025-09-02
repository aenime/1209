import React, { useState } from "react";
import { 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { getPrimaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * MyAccountTailwind Component
 * 
 * A comprehensive authentication interface providing both login and registration functionality
 * for customer account management. Features secure form handling, validation, and professional
 * user experience design with dynamic theming and responsive layout.
 * 
 * Key Features:
 * - Dual-purpose authentication: Login and signup functionality
 * - Secure password handling with show/hide toggle functionality
 * - Real-time form validation with user-friendly error messages
 * - Professional UI design with consistent branding
 * - Responsive layout optimized for all devices
 * - Loading states for improved user feedback
 * - Terms of service and privacy policy integration
 * - Customer support integration for assistance
 * 
 * Authentication Features:
 * - Login Form: Email and password authentication with remember me option
 * - Signup Form: Full name, email, password, and confirmation with terms agreement
 * - Password Strength: Secure password input with visibility toggle
 * - Form Validation: Real-time validation with descriptive error messages
 * - Security: Password confirmation matching for account creation
 * 
 * User Experience:
 * - Seamless toggle between login and signup modes
 * - Professional appearance builds trust and credibility
 * - Clear instructions and helpful error messages
 * - Forgot password functionality for account recovery
 * - Customer support integration for assistance
 * - Legal compliance with terms and privacy policy links
 * 
 * Form Management:
 * - Controlled inputs with state management
 * - Real-time validation feedback
 * - Loading states during form submission
 * - Error handling with user-friendly messages
 * - Form reset functionality for mode switching
 * 
 * @returns {JSX.Element} Complete authentication interface with login and signup functionality
 */
const MyAccountTailwind = React.memo(() => {
  /**
   * UI State Management
   * 
   * - isLogin: Controls display mode (true for login, false for signup)
   * - showPassword: Toggles main password field visibility
   * - showConfirmPassword: Toggles password confirmation field visibility
   * - error: Manages error state for validation messages
   * - loading: Controls loading state during form submission
   */
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Dynamic Theme Color
   * 
   * Retrieves primary theme color for consistent branding throughout the interface
   */
  const primaryColor = getPrimaryThemeColor();

  /**
   * Login Form State
   * 
   * Manages user credentials for authentication:
   * - email: User's email address for login
   * - password: User's password for authentication
   */
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  /**
   * Signup Form State
   * 
   * Manages new user registration information:
   * - name: User's full name for account creation
   * - email: User's email address for account setup
   * - password: User's chosen password for account security
   * - confirmPassword: Password confirmation for validation
   */
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  /**
   * Login Form Submission Handler
   * 
   * Processes user login attempts with validation and error handling:
   * - Prevents default form submission
   * - Sets loading state for user feedback
   * - Simulates API authentication call
   * - Handles authentication errors with user-friendly messages
   * - Manages loading state completion
   * 
   * @param {Event} e - Form submission event
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // Simulate API authentication call with realistic delay
    setTimeout(() => {
      setError(true); // Simulates authentication failure for demonstration
      setLoading(false);
    }, 1000);
  };

  /**
   * Signup Form Submission Handler
   * 
   * Processes new user registration with validation and account creation:
   * - Validates password confirmation matching
   * - Sets error state for password mismatch
   * - Manages loading state during account creation
   * - Simulates API account creation call
   * - Provides success feedback to user
   * 
   * @param {Event} e - Form submission event
   */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Password Confirmation Validation
    if (signupForm.password !== signupForm.confirmPassword) {
      setError(true);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    // Simulate API account creation call
    setTimeout(() => {
      setLoading(false);
      alert('Account created successfully!');
    }, 1000);
  };

  /**
   * Login Form Input Change Handler
   * 
   * Updates login form state and clears errors on user input:
   * - Updates specific form field based on input name
   * - Clears error state when user makes changes
   * - Provides real-time form state management
   * 
   * @param {Event} e - Input change event
   */
  const handleLoginInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
    if (error) setError(false);
  };

  /**
   * Signup Form Input Change Handler
   * 
   * Updates signup form state and clears errors on user input:
   * - Updates specific form field based on input name
   * - Clears error state when user makes changes
   * - Provides real-time form state management
   * 
   * @param {Event} e - Input change event
   */
  const handleSignupInputChange = (e) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value
    });
    if (error) setError(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative text-white py-16" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            My Account
          </h1>
          <p className="text-xl opacity-90">
            {isLogin ? 'Welcome back! Please sign in to your account' : 'Create a new account to get started'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-16">
        {/* Auth Toggle */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mb-8 border border-gray-100">
          <div className="flex">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(false);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isLogin 
                  ? 'text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={isLogin ? { backgroundColor: primaryColor } : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(false);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                !isLogin 
                  ? 'text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={!isLogin ? { backgroundColor: primaryColor } : {}}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {isLogin ? (
            // Login Form
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to access your account</p>
              </div>

              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">
                    Invalid email or password. Please try again.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginInputChange}
                      placeholder="Enter your email address"
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginInputChange}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            // Signup Form
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">Join us today and start your journey</p>
              </div>

              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">
                    Passwords do not match. Please check and try again.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={signupForm.name}
                      onChange={handleSignupInputChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={signupForm.email}
                      onChange={handleSignupInputChange}
                      placeholder="Enter your email address"
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signupForm.password}
                      onChange={handleSignupInputChange}
                      placeholder="Create a password"
                      required
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={signupForm.confirmPassword}
                      onChange={handleSignupInputChange}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <input type="checkbox" required className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="/termsofservice" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a> and <a href="/privacypolicy" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Having trouble accessing your account? Our support team is here to help.
            </p>
            <a
              href="/contact-us"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

MyAccountTailwind.displayName = 'MyAccountTailwind';

export default MyAccountTailwind;
