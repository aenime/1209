import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize error handlers before anything else
import './utils/trackingErrorHandler';
import './utils/navigationThrottleManager';

// Performance optimizations
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use concurrent rendering for better performance
// Note: StrictMode disabled to prevent duplicate tracking events in development
root.render(<App />);

// Performance monitoring - disabled in development, enabled in production
if (process.env.NODE_ENV === 'development') {
    // Completely disable Web Vitals logging in development
    // reportWebVitals(); // Commented out to remove console logs
} else {
    // In production, send to analytics endpoint
    reportWebVitals();
}
