/**
 * React Core Imports
 */
import React, { useState, useEffect, useRef } from 'react';

/**
 * Optimized Image Component - Advanced Image Loading System
 * 
 * High-performance image component featuring:
 * - Intersection Observer-based lazy loading for performance
 * - Progressive loading with customizable placeholders
 * - Comprehensive error handling with fallback images
 * - WebP format support with automatic fallbacks
 * - Smooth loading states and transitions
 * - Accessibility-compliant image handling
 * - Memory-efficient observer management
 * - Configurable loading thresholds
 * 
 * Key Features:
 * - Lazy Loading: Images load only when entering viewport
 * - WebP Support: Automatically uses WebP when available, falls back to original
 * - Error Recovery: Graceful fallback to alternative images on load failures
 * - Performance Optimization: Intersection Observer prevents unnecessary loads
 * - Loading States: Visual feedback during image loading process
 * - Memory Management: Proper cleanup of observers and event listeners
 * - Responsive Images: Support for different sizes and aspect ratios
 * 
 * Loading Strategy:
 * 1. Component mounts with placeholder (if provided)
 * 2. Intersection Observer detects when image enters viewport
 * 3. Triggers image loading with WebP preference
 * 4. Shows loading state during fetch
 * 5. Displays image with smooth transition
 * 6. Handles errors with fallback image
 * 
 * Performance Benefits:
 * - Reduces initial page load time
 * - Saves bandwidth on images not viewed
 * - Improves Core Web Vitals scores
 * - Prevents layout shift with aspect ratio preservation
 * 
 * Props:
 * - src: Primary image source URL
 * - alt: Accessibility description
 * - placeholder: Image to show before loading
 * - fallback: Image to show on error
 * - loading: "lazy" or "eager" loading strategy
 * - threshold: Intersection observer threshold (0-1)
 * - webpSupport: Enable WebP format detection
 * - aspectRatio: CSS aspect ratio for layout stability
 * - onLoad/onError: Callback functions for load events
 */
const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  placeholder,
  fallback,
  className = '',
  loading = "lazy",
  sizes = "100vw",
  threshold = 0.1,
  webpSupport = true,
  aspectRatio,
  onLoad,
  onError,
  ...props
}) => {
  /**
   * Component State Management
   * 
   * Manages image loading lifecycle:
   * - isLoaded: Image successfully loaded and displayed
   * - hasError: Error occurred during loading
   * - shouldLoad: Permission to start loading (lazy loading gate)
   * - currentSrc: Currently selected image source (WebP or fallback)
   */
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(loading !== 'lazy');
  const [currentSrc, setCurrentSrc] = useState(null);

  /**
   * Component References
   * 
   * - imgRef: Reference to img element for observer attachment
   * - observerRef: Reference to IntersectionObserver for cleanup
   */
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  /**
   * Intersection Observer for Lazy Loading
   * 
   * Sets up viewport detection for lazy-loaded images:
   * - Creates observer with configurable threshold
   * - Triggers loading when image enters viewport
   * - Automatically disconnects after first intersection
   * - Provides proper cleanup on component unmount
   * 
   * Performance Optimization:
   * - Only observes when lazy loading is enabled
   * - Single-use observer (disconnects after first trigger)
   * - Memory-efficient cleanup prevents leaks
   */
  useEffect(() => {
    if (loading !== 'lazy' || shouldLoad) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, threshold, shouldLoad]);

  /**
   * WebP Support Detection and Source Preparation
   * 
   * Handles image format optimization:
   * - Detects WebP support in browser
   * - Creates WebP version URLs for supported formats
   * - Tests WebP availability before switching
   * - Falls back to original format if WebP fails
   * - Optimizes bandwidth usage with modern formats
   */
  useEffect(() => {
    if (!shouldLoad || !src) return;

    const prepareImageSrc = () => {
      if (webpSupport && src.match(/\.(jpg|jpeg|png)$/i)) {
        // Try WebP first, fallback to original if not supported
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Test if WebP version exists
        const testImg = new Image();
        testImg.onload = () => setCurrentSrc(webpSrc);
        testImg.onerror = () => setCurrentSrc(src);
        testImg.src = webpSrc;
      } else {
        setCurrentSrc(src);
      }
    };

    prepareImageSrc();
  }, [src, shouldLoad, webpSupport]);

  // Handle image load success
  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  // Handle image load error
  const handleError = (e) => {
    setHasError(true);
    if (fallback) {
      setCurrentSrc(fallback);
      setHasError(false);
    }
    if (onError) onError(e);
  };

  // Generate container classes
  const containerClasses = [
    'relative overflow-hidden',
    aspectRatio && `aspect-${aspectRatio}`,
    className
  ].filter(Boolean).join(' ');

  // Generate image classes
  const imageClasses = [
    'transition-opacity duration-300 ease-in-out',
    isLoaded ? 'opacity-100' : 'opacity-0',
    'w-full h-full object-cover'
  ].join(' ');

  // Placeholder component
  const PlaceholderComponent = () => (
    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
      {placeholder || (
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-sm">Failed to load image</p>
      </div>
    </div>
  );

  return (
    <div ref={imgRef} className={containerClasses}>
      {/* Placeholder shown while loading */}
      {(!isLoaded && !hasError) && <PlaceholderComponent />}
      
      {/* Error state */}
      {hasError && !fallback && <ErrorComponent />}
      
      {/* Main image */}
      {shouldLoad && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={imageClasses}
          {...props}
        />
      )}
      
      {/* Loading indicator for critical images */}
      {loading === 'eager' && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
