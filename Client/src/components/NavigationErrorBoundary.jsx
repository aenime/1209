/**
 * Navigation Error Boundary
 * 
 * Catches navigation throttling errors and other Facebook Pixel related issues
 * Provides fallback UI and prevents app crashes
 */

import React from 'react';

class NavigationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a navigation throttling error
    const isNavigationError = error.message?.includes('Throttling navigation') ||
                              error.message?.includes('IPC flooding') ||
                              error.stack?.includes('fbevents.js') ||
                              error.stack?.includes('hooks.tsx');
    
    if (isNavigationError) {
      console.warn('🛡️ Navigation throttling error caught and handled:', error.message);
      return { hasError: true };
    }
    
    return null;
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.group('🔍 Navigation Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Auto-recover from navigation throttling errors
    if (error.message?.includes('Throttling navigation') ||
        error.message?.includes('IPC flooding')) {
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for navigation errors
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Navigation Protection Active
            </h2>
            <p className="text-gray-600 mb-4">
              Preventing browser throttling. The page will resume automatically.
            </p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NavigationErrorBoundary;
