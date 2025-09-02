/**
 * React Core and Hooks Imports
 */
import React, { useState, useEffect } from 'react';

/**
 * Service Layer Import for Backend Communication
 */
import CategoryService from '../../utils/CategoryService';

/**
 * Backend Status Monitor Component - Real-time Server Health Tracking
 * 
 * Comprehensive backend connectivity monitoring system:
 * - Real-time backend server health monitoring
 * - Automatic connection status checks every 30 seconds
 * - Response time measurement for performance tracking
 * - Error detection and diagnostic capabilities
 * - Visual status indicators with color-coded health states
 * - Manual refresh functionality for immediate status updates
 * - Detailed error reporting and troubleshooting information
 * 
 * Key Features:
 * - Live connection status with visual indicators
 * - Response time performance tracking
 * - Automatic periodic health checks
 * - Manual refresh capability
 * - Error diagnosis and recommendations
 * - Configurable detail visibility
 * - Fixed positioning for persistent monitoring
 * 
 * Status States:
 * - Connected (Green): Backend is responsive and healthy
 * - Disconnected (Red): Backend is unreachable or failing
 * - Checking (Gray/Pulse): Currently performing health check
 * - Unknown (Gray): Initial state before first check
 * 
 * Monitoring Capabilities:
 * - Connection health verification
 * - Response time measurement
 * - Error message capture and display
 * - Last check timestamp tracking
 * - Automatic diagnosis when connection fails
 * 
 * User Interface:
 * - Fixed top-right positioning for non-intrusive monitoring
 * - Compact card design with shadow and borders
 * - Color-coded status indicators
 * - Expandable details view
 * - Manual refresh button
 * - Diagnostic information panel
 * 
 * Props:
 * @param {boolean} showDetails - Controls visibility of detailed status information
 */
const BackendStatusMonitor = ({ showDetails = false }) => {
  /**
   * Status State Management
   * 
   * Comprehensive status object containing:
   * - isConnected: Boolean flag for connection state
   * - responseTime: Server response time in milliseconds
   * - lastChecked: Timestamp of last health check
   * - error: Error message if connection fails
   * - diagnosis: Detailed diagnostic information
   */
  const [status, setStatus] = useState({
    isConnected: null,
    responseTime: null,
    lastChecked: null,
    error: null,
    diagnosis: null
  });

  /**
   * Loading State for Health Check Operations
   * 
   * Tracks whether a health check is currently in progress:
   * - Prevents multiple simultaneous checks
   * - Enables loading UI indicators
   * - Controls button disable states
   */
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Backend Health Check Function
   * 
   * Performs comprehensive backend connectivity test:
   * - Makes API call to backend health endpoint
   * - Measures response time for performance tracking
   * - Captures error information for debugging
   * - Updates status state with results
   * - Handles all error scenarios gracefully
   */
  const checkBackendStatus = async () => {
    setIsChecking(true);
    
    try {
      // Call backend health check through CategoryService
      const healthStatus = await CategoryService.checkBackendHealth();
      
      setStatus({
        isConnected: healthStatus.isConnected,
        responseTime: healthStatus.responseTime,
        lastChecked: new Date().toLocaleTimeString(),
        error: healthStatus.errors.length > 0 ? healthStatus.errors[0] : null,
        diagnosis: healthStatus.diagnosis || null
      });
    } catch (error) {
      // Handle health check failures
      setStatus({
        isConnected: false,
        responseTime: null,
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message,
        diagnosis: 'Failed to check backend status'
      });
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Connection Diagnosis Function
   * 
   * Runs detailed connection analysis:
   * - Identifies specific connection issues
   * - Provides troubleshooting recommendations
   * - Updates status with diagnostic information
   * - Helps users understand connectivity problems
   */
  const runDiagnosis = async () => {
    const diagnosis = await CategoryService.diagnoseConnection();
    
    setStatus(prev => ({
      ...prev,
      diagnosis: diagnosis
    }));
  };

  /**
   * Automatic Health Check Setup
   * 
   * useEffect hook for periodic monitoring:
   * - Runs initial health check on component mount
   * - Sets up 30-second interval for automatic checks
   * - Cleans up interval on component unmount
   * - Ensures continuous backend monitoring
   */
  useEffect(() => {
    // Auto-check on mount
    checkBackendStatus();
    
    // Auto-check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Status Color Determination
   * 
   * Returns appropriate color class based on connection state:
   * - Green: Connected and healthy
   * - Red: Disconnected or failing
   * - Gray: Unknown state or checking
   * 
   * @returns {string} Color class name for status indicator
   */
  const getStatusColor = () => {
    if (status.isConnected === null || isChecking) return 'gray';
    return status.isConnected ? 'green' : 'red';
  };

  /**
   * Status Text Generation
   * 
   * Provides human-readable status text:
   * - Connected: Backend is responsive
   * - Disconnected: Backend is unreachable
   * - Checking: Health check in progress
   * - Unknown: No status available yet
   * 
   * @returns {string} Status text for display
   */
  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (status.isConnected === null) return 'Unknown';
    return status.isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-sm">
        {/* Status Header - Connection State and Refresh */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Visual Status Indicator */}
            <div 
              className={`w-3 h-3 rounded-full ${
                getStatusColor() === 'green' ? 'bg-green-500' :
                getStatusColor() === 'red' ? 'bg-red-500' : 'bg-gray-400'
              } ${isChecking ? 'animate-pulse' : ''}`}
            />
            
            {/* Status Text Display */}
            <span className="text-sm font-medium text-gray-900">
              Backend: {getStatusText()}
            </span>
          </div>
          
          {/* Manual Refresh Button */}
          <button
            onClick={checkBackendStatus}
            disabled={isChecking}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            Refresh
          </button>
        </div>

        {/* Status Details - Performance and Error Information */}
        {showDetails && (
          <div className="space-y-2 text-xs text-gray-600">
            {/* Response Time Display */}
            {status.responseTime && (
              <div>Response: {status.responseTime}ms</div>
            )}
            
            {/* Last Check Timestamp */}
            {status.lastChecked && (
              <div>Last checked: {status.lastChecked}</div>
            )}
            
            {/* Error Information */}
            {status.error && (
              <div className="text-red-600">
                Error: {status.error.message || status.error}
              </div>
            )}
            
            {/* Diagnosis Button for Connection Issues */}
            {!status.isConnected && (
              <button
                onClick={runDiagnosis}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Run Diagnosis
              </button>
            )}
          </div>
        )}

        {/* Diagnosis Results - Troubleshooting Information */}
        {status.diagnosis && typeof status.diagnosis === 'object' && (
          <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="text-xs font-medium text-yellow-800 mb-1">
              Diagnosis:
            </div>
            
            {/* Issue Identification */}
            {status.diagnosis.issues && status.diagnosis.issues.length > 0 && (
              <div className="text-xs text-yellow-700 mb-1">
                Issues: {status.diagnosis.issues.join(', ')}
              </div>
            )}
            
            {/* Troubleshooting Recommendations */}
            {status.diagnosis.recommendations && status.diagnosis.recommendations.length > 0 && (
              <div className="text-xs text-yellow-700">
                Solutions: {status.diagnosis.recommendations.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendStatusMonitor;
