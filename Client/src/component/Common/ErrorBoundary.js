/**
 * React Component Class Import
 */
import React, { Component } from 'react';

/**
 * Error Boundary Component - React Error Handling System
 * 
 * Comprehensive error boundary for graceful error handling:
 * - Catches JavaScript errors anywhere in the child component tree
 * - Prevents entire application crashes from component errors
 * - Displays user-friendly error messages instead of white screens
 * - Logs error information for debugging and monitoring
 * - Provides fallback UI that maintains application usability
 * - Follows React error boundary best practices
 * 
 * Key Features:
 * - Automatic error detection using React lifecycle methods
 * - Graceful fallback UI with accessibility considerations
 * - Prevents error propagation to parent components
 * - Maintains application stability during component failures
 * - User-friendly error presentation with clear visual hierarchy
 * - ARIA accessibility attributes for screen readers
 * 
 * Error Handling Strategy:
 * - getDerivedStateFromError: Updates state to render fallback UI
 * - componentDidCatch: Logs error details for debugging
 * - Fallback UI: Clean, accessible error message display
 * - Containment: Prevents errors from breaking entire application
 * 
 * Design Principles:
 * - Fail gracefully with informative error messages
 * - Maintain visual consistency with application design
 * - Provide accessibility-compliant error states
 * - Log errors for development and production monitoring
 * 
 * Usage:
 * Wrap any component tree that might throw errors:
 * <ErrorBoundary>
 *   <ComponentThatMightThrow />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  /**
   * Constructor - Initialize Error State
   * 
   * Sets up the component with initial state:
   * - hasError: Boolean flag to track error state
   * - Inherits props from parent component
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Error State Derivation - React Lifecycle Method
   * 
   * Static method called when child component throws error:
   * - Updates component state to trigger fallback UI
   * - Returns new state object with error flag
   * - Enables React to re-render with error UI
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object with hasError: true
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Error Logging - React Lifecycle Method
   * 
   * Called after an error is caught by the boundary:
   * - Logs error details for debugging purposes
   * - Can be extended to send errors to monitoring services
   * - Provides error context for development troubleshooting
   * 
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - React component stack trace
   */
  componentDidCatch(error, errorInfo) {
    // Log error for debugging (can be extended with error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * Render Method - Error UI or Children
   * 
   * Conditionally renders error UI or normal children:
   * - Shows fallback UI when error state is true
   * - Renders children normally when no errors
   * - Provides accessible error message with proper ARIA attributes
   * - Uses consistent styling with application design system
   */
  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg text-red-700" 
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
