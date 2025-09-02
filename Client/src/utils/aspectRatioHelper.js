/**
 * Aspect Ratio Management Utility
 * 
 * This utility provides consistent aspect ratio configuration and handling
 * for product images across the e-commerce application. It implements the
 * production-ready approach for standardizing product image aspect ratios
 * per category using pure CSS with Tailwind utilities.
 * 
 * Features:
 * - Per-category aspect ratio configuration
 * - Tailwind CSS class mapping for common ratios
 * - Fallback handling for unknown categories
 * - Support for both numeric and string-based ratios
 * - Performance optimized with minimal padding approach
 */

/**
 * Default Category Aspect Ratio Configuration
 * 
 * Defines optimal aspect ratios for different product categories based on
 * typical image dimensions and user experience best practices.
 * 
 * Ratios are defined as width/height (e.g., 0.8 = 4:5 portrait)
 */
export const CATEGORY_ASPECT_RATIOS = {
  // Fashion & Apparel - Portrait orientation for full-length display
  'kurtis': { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' },
  'sarees': { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' },
  'dresses': { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' },
  'tops': { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' },
  'ethnic-wear': { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' },
  'western-wear': { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' },
  
  // Accessories - Square for uniform grid display
  'jewelry': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  'bags': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  'shoes': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  'accessories': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  
  // Electronics - Landscape for device displays
  'electronics': { aspectRatio: 1.333, fitMode: 'contain', tailwindClass: 'aspect-[4/3]' },
  'gadgets': { aspectRatio: 1.333, fitMode: 'contain', tailwindClass: 'aspect-[4/3]' },
  'mobile': { aspectRatio: 0.75, fitMode: 'contain', tailwindClass: 'aspect-[3/4]' },
  
  // Home & Living - Square for versatility
  'home-decor': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  'kitchen': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  'furniture': { aspectRatio: 1.333, fitMode: 'contain', tailwindClass: 'aspect-[4/3]' },
  
  // Beauty & Personal Care - Portrait for product shots
  'beauty': { aspectRatio: 0.75, fitMode: 'contain', tailwindClass: 'aspect-[3/4]' },
  'skincare': { aspectRatio: 0.75, fitMode: 'contain', tailwindClass: 'aspect-[3/4]' },
  'cosmetics': { aspectRatio: 0.75, fitMode: 'contain', tailwindClass: 'aspect-[3/4]' },
  
  // Sports & Fitness - Square for equipment
  'sports': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  'fitness': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  
  // Books & Media - Portrait for book covers
  'books': { aspectRatio: 0.667, fitMode: 'contain', tailwindClass: 'aspect-[2/3]' },
  'media': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' },
  
  // Default fallback for unknown categories
  'default': { aspectRatio: 1, fitMode: 'contain', tailwindClass: 'aspect-square' }
};

/**
 * Standard Aspect Ratio to Tailwind Class Mapping
 * 
 * Maps common numeric aspect ratios to their corresponding Tailwind CSS classes.
 * This allows for consistent styling without inline styles.
 */
export const ASPECT_RATIO_CLASSES = [
  { ratio: 1, class: 'aspect-square', description: '1:1 Square' },
  { ratio: 0.8, class: 'aspect-[4/5]', description: '4:5 Portrait' },
  { ratio: 0.75, class: 'aspect-[3/4]', description: '3:4 Portrait' },
  { ratio: 0.667, class: 'aspect-[2/3]', description: '2:3 Portrait' },
  { ratio: 1.333, class: 'aspect-[4/3]', description: '4:3 Landscape' },
  { ratio: 1.5, class: 'aspect-[3/2]', description: '3:2 Landscape' },
  { ratio: 1.778, class: 'aspect-video', description: '16:9 Video' }
];

/**
 * Get Category Configuration
 * 
 * Retrieves the aspect ratio configuration for a given category.
 * Supports both category objects and category name strings.
 * 
 * @param {Object|string} category - Category object with name/id or category name string
 * @returns {Object} Configuration object with aspectRatio, fitMode, and tailwindClass
 * 
 * @example
 * // Using category object
 * const config = getCategoryConfig({ name: 'kurtis' });
 * // Returns: { aspectRatio: 0.8, fitMode: 'contain', tailwindClass: 'aspect-[4/5]' }
 * 
 * // Using category string
 * const config = getCategoryConfig('electronics');
 * // Returns: { aspectRatio: 1.333, fitMode: 'contain', tailwindClass: 'aspect-[4/3]' }
 */
export const getCategoryConfig = (category) => {
  if (!category) {
    return CATEGORY_ASPECT_RATIOS.default;
  }
  
  // Handle category object with name property
  const categoryName = typeof category === 'object' 
    ? (category.name || category.categoryName || category.id || '').toLowerCase()
    : category.toLowerCase();
  
  // Normalize category name by removing special characters and spaces
  const normalizedName = categoryName
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Try exact match first
  if (CATEGORY_ASPECT_RATIOS[normalizedName]) {
    return CATEGORY_ASPECT_RATIOS[normalizedName];
  }
  
  // Try partial matches for flexibility
  const partialMatch = Object.keys(CATEGORY_ASPECT_RATIOS).find(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  );
  
  if (partialMatch) {
    return CATEGORY_ASPECT_RATIOS[partialMatch];
  }
  
  // Return default configuration
  return CATEGORY_ASPECT_RATIOS.default;
};

/**
 * Get Tailwind Aspect Ratio Class
 * 
 * Converts a numeric aspect ratio to the nearest Tailwind CSS class.
 * This function snaps to the closest predefined ratio to avoid arbitrary values.
 * 
 * @param {number} aspectRatio - Numeric aspect ratio (width/height)
 * @returns {string} Tailwind CSS class for the aspect ratio
 * 
 * @example
 * getAspectRatioClass(0.8); // Returns: 'aspect-[4/5]'
 * getAspectRatioClass(1.0); // Returns: 'aspect-square'
 * getAspectRatioClass(1.333); // Returns: 'aspect-[4/3]'
 */
export const getAspectRatioClass = (aspectRatio) => {
  if (typeof aspectRatio !== 'number' || aspectRatio <= 0) {
    return 'aspect-square';
  }
  
  // Find the closest matching ratio
  let bestMatch = ASPECT_RATIO_CLASSES[0];
  let smallestDifference = Math.abs(bestMatch.ratio - aspectRatio);
  
  for (const candidate of ASPECT_RATIO_CLASSES) {
    const difference = Math.abs(candidate.ratio - aspectRatio);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestMatch = candidate;
    }
  }
  
  return bestMatch.class;
};

/**
 * Get CSS Aspect Ratio Style
 * 
 * Returns inline CSS style object for aspect ratio when Tailwind classes
 * are not sufficient or when dynamic ratios are needed.
 * 
 * @param {number} aspectRatio - Numeric aspect ratio (width/height)
 * @returns {Object} CSS style object with aspectRatio property
 * 
 * @example
 * getAspectRatioStyle(0.8); // Returns: { aspectRatio: '0.8' }
 * getAspectRatioStyle(1.5); // Returns: { aspectRatio: '1.5' }
 */
export const getAspectRatioStyle = (aspectRatio) => {
  if (typeof aspectRatio !== 'number' || aspectRatio <= 0) {
    return { aspectRatio: '1' };
  }
  
  return { aspectRatio: String(aspectRatio) };
};

/**
 * Get Object Fit Class
 * 
 * Returns the appropriate Tailwind CSS object-fit class based on fit mode.
 * 
 * @param {string} fitMode - 'contain' for minimal padding, 'cover' for full coverage
 * @returns {string} Tailwind CSS object-fit class
 * 
 * @example
 * getObjectFitClass('contain'); // Returns: 'object-contain'
 * getObjectFitClass('cover'); // Returns: 'object-cover'
 */
export const getObjectFitClass = (fitMode = 'contain') => {
  const fitClasses = {
    'contain': 'object-contain',
    'cover': 'object-cover',
    'fill': 'object-fill',
    'scale-down': 'object-scale-down',
    'none': 'object-none'
  };
  
  return fitClasses[fitMode] || 'object-contain';
};

/**
 * Product Image Configuration Hook
 * 
 * Utility function to get complete image configuration for a product
 * based on its category. Returns all necessary classes and styles.
 * 
 * @param {Object} product - Product object with category information
 * @param {Object} options - Override options for aspect ratio or fit mode
 * @returns {Object} Complete configuration object
 * 
 * @example
 * const config = getProductImageConfig(product, { fitMode: 'cover' });
 * // Returns: {
 * //   aspectRatio: 0.8,
 * //   tailwindClass: 'aspect-[4/5]',
 * //   objectFitClass: 'object-cover',
 * //   containerStyle: { aspectRatio: '0.8' },
 * //   fitMode: 'cover'
 * // }
 */
export const getProductImageConfig = (product, options = {}) => {
  const categoryConfig = getCategoryConfig(product?.category);
  const finalConfig = { ...categoryConfig, ...options };
  
  return {
    aspectRatio: finalConfig.aspectRatio,
    tailwindClass: finalConfig.tailwindClass,
    objectFitClass: getObjectFitClass(finalConfig.fitMode),
    containerStyle: getAspectRatioStyle(finalConfig.aspectRatio),
    fitMode: finalConfig.fitMode,
    description: `${finalConfig.aspectRatio} ratio with ${finalConfig.fitMode} fit`
  };
};

/**
 * Admin Configuration Helper
 * 
 * Helper function for admin interfaces to manage category aspect ratios.
 * Provides validation and formatting for aspect ratio inputs.
 * 
 * @param {string} categoryName - Name of the category
 * @param {number} aspectRatio - New aspect ratio value
 * @param {string} fitMode - Fit mode ('contain' or 'cover')
 * @returns {Object} Validation result and formatted configuration
 */
export const validateCategoryConfig = (categoryName, aspectRatio, fitMode = 'contain') => {
  const errors = [];
  
  if (!categoryName || typeof categoryName !== 'string') {
    errors.push('Category name is required and must be a string');
  }
  
  if (!aspectRatio || typeof aspectRatio !== 'number' || aspectRatio <= 0) {
    errors.push('Aspect ratio must be a positive number');
  }
  
  if (!['contain', 'cover', 'fill', 'scale-down', 'none'].includes(fitMode)) {
    errors.push('Fit mode must be one of: contain, cover, fill, scale-down, none');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    config: errors.length === 0 ? {
      aspectRatio,
      fitMode,
      tailwindClass: getAspectRatioClass(aspectRatio)
    } : null
  };
};

/**
 * Performance Optimization: Memoized Configuration
 * 
 * For applications with many products, this provides a memoized version
 * of configuration lookup to improve performance.
 */
const configCache = new Map();

export const getCachedCategoryConfig = (category) => {
  const cacheKey = typeof category === 'object' 
    ? (category.name || category.id || 'default')
    : category;
  
  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }
  
  const config = getCategoryConfig(category);
  configCache.set(cacheKey, config);
  
  // Clear cache if it gets too large (simple LRU simulation)
  if (configCache.size > 100) {
    const firstKey = configCache.keys().next().value;
    configCache.delete(firstKey);
  }
  
  return config;
};

const aspectRatioHelper = {
  CATEGORY_ASPECT_RATIOS,
  ASPECT_RATIO_CLASSES,
  getCategoryConfig,
  getAspectRatioClass,
  getAspectRatioStyle,
  getObjectFitClass,
  getProductImageConfig,
  validateCategoryConfig,
  getCachedCategoryConfig
};

export default aspectRatioHelper;
