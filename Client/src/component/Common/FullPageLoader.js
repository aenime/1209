/**
 * React Core Imports
 */
import React from 'react';

/**
 * Full Page Loading Component - Application-wide Loading UI
 * 
 * Comprehensive full-screen loading component for heavy operations:
 * - Displays centered loading spinner with backdrop overlay
 * - Covers entire viewport with semi-transparent background
 * - Prevents user interaction during critical loading states
 * - Uses high z-index to appear above all other content
 * - Provides consistent loading experience across application
 * - Includes loading message for user feedback
 * 
 * Key Features:
 * - Fixed positioning for full viewport coverage
 * - Semi-transparent background for content visibility
 * - High z-index (9999) to ensure top-level display
 * - Centered spinner and text with proper spacing
 * - Smooth CSS animations using Tailwind utilities
 * - Accessible loading state with descriptive text
 * 
 * Design Elements:
 * - Tailwind CSS animations for smooth spinner rotation
 * - Proper contrast ratios for text visibility
 * - Consistent styling with application theme
 * - Mobile-responsive design for all screen sizes
 * 
 * Usage Scenarios:
 * - Initial application loading
 * - Route transitions with heavy data fetching
 * - File uploads or downloads
 * - API operations requiring user wait
 * - Page-level data synchronization
 * 
 * Performance Considerations:
 * - Uses CSS transforms for GPU-accelerated animations
 * - Minimal DOM impact with simple structure
 * - No unnecessary re-renders (stateless component)
 * - Optimized for smooth animation performance
 * 
 * Accessibility:
 * - Clear loading message for screen readers
 * - High contrast spinner for visibility
 * - Appropriate semantic structure
 */
const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-90 z-[9999]">
      <div className="text-center p-5">
        {/* 
          Custom CSS Spinner with Tailwind Utilities
          - animate-spin: CSS keyframe animation for continuous rotation
          - rounded-full: Perfect circle shape
          - h-12 w-12: Consistent 48px dimensions for visibility
          - border-b-2: Bottom border creates spinning effect
          - border-gray-900: Dark border for clear visibility
          - mx-auto: Horizontal centering
          - mb-3: Bottom margin for text spacing
        */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-3"></div>
        
        {/* Loading Text with Consistent Typography */}
        <p className="text-gray-700">Loading content...</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
