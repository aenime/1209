import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import StorageService from '../../services/storageService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetData, setResetData] = useState({
    masterPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // OPTIMIZED: Check localStorage first to avoid unnecessary API calls and 401 errors
  const checkAuthentication = useCallback(async () => {
    try {
      // Check if user just logged out - if so, skip auth check entirely
      const justLoggedOut = sessionStorage.getItem('justLoggedOut');
      if (justLoggedOut) {
        sessionStorage.removeItem('justLoggedOut'); // Clear the flag
        return; // Skip auth check to avoid 401 error after logout
      }

      // First check localStorage - if no local session, skip API call
      const localAuth = StorageService.getItem('adminLoggedIn');
      if (!localAuth) {
        // No local session, stay on login page (avoids 401 error)
        return;
      }

      // Only make API call if localStorage suggests user might be logged in
      const result = await apiService.request('/api/env-auth/validate', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (result) {
        // Confirmed authenticated, update session and redirect
        StorageService.setItem('adminLoggedIn', 'true');
        StorageService.setItem('adminLastLogin', new Date().toISOString());
        navigate('/myadmin');
      }
    } catch (error) {
      // If API call fails, clear localStorage and stay on login
      StorageService.removeItem('adminLoggedIn');
      StorageService.removeItem('adminLastLogin');
    }
  }, [navigate]);

  // Debounced version to prevent rapid calls
  const debouncedAuthCheck = useCallback(() => {
    const timeoutId = setTimeout(checkAuthentication, 500);
    return () => clearTimeout(timeoutId);
  }, [checkAuthentication]);

  // Check if already authenticated with debouncing
  useEffect(() => {
    const cleanup = debouncedAuthCheck();
    return cleanup;
  }, [debouncedAuthCheck]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiService.request('/api/env-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: formData
      });
      
      if (result && result.success) {
        // Set admin login status
        StorageService.setItem('adminLoggedIn', 'true');
        StorageService.setItem('adminLastLogin', new Date().toISOString());
        navigate('/myadmin');
      } else {
        if (result.code === 'ACCOUNT_LOCKED') {
          setError('Account is temporarily locked. Please try again later or reset your password.');
        } else if (result.code === 'INVALID_CREDENTIALS') {
          setError('Invalid username or password. Please check your credentials.');
        } else if (result.code === 'VALIDATION_ERROR') {
          setError('Password must be at least 8 characters long.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      // Handle different error types from apiService
      if (error.message.includes('429')) {
        setError('Too many login attempts. Please try again in 15 minutes or use the password reset option.');
      } else {
        setError('Connection error. Please check your internet and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    setShowForgotPassword(true);
    setResetError('');
  };

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (resetError) setResetError('');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!resetData.masterPassword || !resetData.newPassword || !resetData.confirmPassword) {
      setResetError('Please fill all fields');
      return;
    }
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetError('New passwords do not match');
      return;
    }
    
    if (resetData.newPassword.length < 6) {
      setResetError('New password must be at least 6 characters');
      return;
    }
    
    setResetLoading(true);
    setResetError('');
    
    try {
      const result = await apiService.request('/api/env-auth/master-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          masterPassword: resetData.masterPassword,
          newPassword: resetData.newPassword
        }
      });
      
      if (result.success) {
        alert('✅ Password reset successfully! You can now login with your new password.');
        setShowForgotPassword(false);
        setResetData({ masterPassword: '', newPassword: '', confirmPassword: '' });
        setFormData(prev => ({ ...prev, username: 'admin', password: '' }));
      } else {
        setResetError(result.error || 'Password reset failed');
      }
    } catch (error) {
      setResetError('Connection error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Login to access admin panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
              <p className="text-gray-600">Login to access the admin dashboard, manage products, and configure settings.</p>
            </div>

            {!showForgotPassword ? (
              /* Login Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    'Access Admin Dashboard'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            ) : (
              /* Password Reset Form */
              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Password</h3>
                  <p className="text-sm text-gray-600">Enter your master password and new password</p>
                </div>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-800 text-sm">{resetError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Master Password
                  </label>
                  <input
                    type="password"
                    name="masterPassword"
                    value={resetData.masterPassword}
                    onChange={handleResetInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter master password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={resetData.newPassword}
                    onChange={handleResetInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={resetData.confirmPassword}
                    onChange={handleResetInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm font-medium mb-1">Security Notice</p>
                <p className="text-blue-700 text-sm">
                  This admin area provides full access to your store's data. Only authorized personnel should have access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
