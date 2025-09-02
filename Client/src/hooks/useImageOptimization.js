import { useState, useEffect, useRef } from 'react';

/**
 * useLazyLoading - Custom hook for intersection observer based lazy loading
 * @param {number} threshold - Intersection threshold (0-1)
 * @param {string} rootMargin - Root margin for intersection observer
 * @param {boolean} triggerOnce - Whether to trigger only once
 * @returns {[function, boolean]} - [setRef, isVisible]
 */
export const useLazyLoading = (
  threshold = 0.1, 
  rootMargin = '50px',
  triggerOnce = true
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [element, threshold, rootMargin, triggerOnce]);

  return [setElement, isVisible];
};

/**
 * useImagePreloader - Hook to preload images
 * @param {string[]} imageSrcs - Array of image URLs to preload
 * @returns {boolean} - Whether all images are loaded
 */
export const useImagePreloader = (imageSrcs) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (!imageSrcs?.length) {
      setImagesLoaded(true);
      return;
    }

    let loadCount = 0;

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadCount++;
          setLoadedCount(loadCount);
          resolve(src);
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    const loadAllImages = async () => {
      try {
        await Promise.all(imageSrcs.map(loadImage));
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
        setImagesLoaded(true); // Continue even if some images fail
      }
    };

    loadAllImages();
  }, [imageSrcs]);

  return { imagesLoaded, loadedCount, totalImages: imageSrcs?.length || 0 };
};

/**
 * useWebPSupport - Hook to detect WebP support
 * @returns {boolean} - Whether WebP is supported
 */
export const useWebPSupport = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      setIsSupported(dataURL.indexOf('data:image/webp') === 0);
      setIsChecked(true);
    };

    if (!isChecked) {
      checkWebPSupport();
    }
  }, [isChecked]);

  return { isSupported, isChecked };
};

/**
 * useImageDimensions - Hook to get image dimensions
 * @param {string} src - Image source URL
 * @returns {object} - {width, height, isLoading, error}
 */
export const useImageDimensions = (src) => {
  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src]);

  return { ...dimensions, isLoading, error };
};

const imageOptimizationHooks = {
  useLazyLoading,
  useImagePreloader,
  useWebPSupport,
  useImageDimensions
};

export default imageOptimizationHooks;
