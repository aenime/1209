// Main Tracking Manager - Refactored Modular Version
// Now uses separate managers for each tracking platform
// Maintains backward compatibility with existing API

import TrackingOrchestrator from './tracking/TrackingOrchestrator';

// Create singleton instance of the orchestrator
const trackingManager = new TrackingOrchestrator();

// Expose tracking manager globally for debugging in development
if (typeof window !== 'undefined') {
  window.trackingManager = trackingManager;
}

// Export the orchestrator instance with the same API
export default trackingManager;
