/**
 * React Core and Navigation Imports
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Context Hooks
 */
import { useCart } from '../../contexts/CartContext';

/**
 * Utility Functions
 */
import { getButtonStyles } from '../../utils/themeColorsSimple';
import { logAddToCart } from '../../utils/enhancedTrackingIntegration';
import { getTrackingPrice } from '../../utils/priceHelper';

/**
 * Add to Cart Button Component - Dynamic E-Commerce Action Button
 * 
 * Versatile cart interaction button featuring:
 * - Multiple visual variants (primary, secondary, card, minimal, gradient)
 * - Responsive sizing options (small, medium, large)
 * - Visual feedback with click animations
 * - Smart cart state detection and handling
 * - Enhanced analytics tracking integration
 * - Customizable appearance with theme integration
 * - Accessibility-compliant interactions
 * 
 * Key Features:
 * - Dual functionality: Add to cart OR navigate to cart if already added
 * - Visual click feedback with color transitions (1.5 second animation)
 * - Comprehensive event tracking for analytics
 * - Theme-aware styling with dynamic color schemes
 * - Product quantity and size management
 * - Error handling for tracking failures
 * - Event propagation control for nested usage
 * 
 * Business Logic:
 * - Checks if product already exists in cart
 * - Adds new product with default size 'M' and quantity 1
 * - Navigates to cart page if product already added
 * - Tracks all add-to-cart events for business analytics
 * - Prevents duplicate tracking calls for data accuracy
 * 
 * Props:
 * - product: Product object to add to cart
 * - variant: Visual style variant
 * - size: Button size option
 * - className: Additional CSS classes
 * - showIcon/showText: Control icon and text visibility
 * - onClick: Custom click handler
 * - isInCart: Override cart state detection
 */
const AddToCartButton = ({
  product,
  variant = 'primary', // primary, secondary, card, minimal, gradient
  size = 'medium', // small, medium, large
  className = '',
  showIcon = true,
  showText = true,
  onClick,
  isInCart = false,
  ...props
}) => {
  /**
   * Context and Navigation Hooks
   */
  const { cartProducts, handleSetCartProducts } = useCart();
  const navigate = useNavigate();

  /**
   * Component State for Visual Feedback
   * 
   * Manages click animation state:
   * - isClicked: Controls green color feedback animation
   * - Provides visual confirmation of successful cart addition
   */
  const [isClicked, setIsClicked] = useState(false);
  
  /**
   * Main Click Handler with Enhanced Logic
   * 
   * Handles complete add-to-cart workflow:
   * 1. Prevents event bubbling for nested usage
   * 2. Triggers visual feedback animation
   * 3. Checks existing cart state
   * 4. Either adds product or navigates to cart
   * 5. Tracks analytics events with comprehensive data
   * 6. Handles default product attributes (size, quantity)
   * 
   * Animation Timing:
   * - 1.5 second duration for optimal user feedback
   * - Green color transition for positive confirmation
   * 
   * Analytics Integration:
   * - Tracks product details, pricing, and user actions
   * - Prevents duplicate tracking calls
   * - Includes error handling for tracking failures
   */
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger visual feedback animation with green color
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1500); // 1.5 seconds for optimal feedback
    
    const existingProduct = cartProducts?.find((o) => o._id === product._id);
    
    if (!existingProduct) {
      // Add new product to cart with default attributes
      handleSetCartProducts([
        ...(cartProducts || []),
        { ...product, quantity: 1, selectSize: product.selectSize || 'M' },
      ]);
      
      // Enhanced analytics tracking for business intelligence
      const trackingPrice = getTrackingPrice(product);
      
      // Comprehensive event tracking (prevents duplicate calls)
      logAddToCart({
        product_id: product._id || product.id,
        product_name: product.name || product.title,
        category: product.category || 'General',
        value: trackingPrice,
        currency: 'INR',
        quantity: 1
      }).catch(error => {
        // logAddToCart handles internal tracking, no fallback needed
        console.warn('Add to cart tracking failed:', error);
      });
      
    } else {
      // Product already in cart - navigate to cart page
      navigate("/cart");
    }
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  const isProductInCart = isInCart || cartProducts?.find((o) => o._id === product._id);
  const buttonText = isProductInCart ? "GO TO CART" : "ADD TO CART";

  // Size variants
  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[36px] touch-target',
    medium: 'px-4 py-2.5 text-base min-h-[44px]',
    large: 'px-5 py-3 text-lg min-h-[48px]'
  };

  // Icon size variants
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };
  
  // Variant styles
  const getVariantClasses = () => {
    const baseClasses = `
      relative
      font-semibold
      transition-all
      duration-300
      transform
      active:scale-95
      focus:outline-none
      focus:ring-1
      focus:ring-offset-0
      disabled:opacity-50
      disabled:cursor-not-allowed
      select-none
      ${sizeClasses[size]}
    `;

    switch (variant) {
      case 'primary':
        return `${baseClasses} 
          text-white
          shadow-lg hover:shadow-xl
          border-0
          group overflow-hidden
          before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-300
          hover:before:opacity-10
        `;
        
      case 'secondary':
        return `${baseClasses}
          bg-white border-2 border-gray-300
          hover:border-blue-500 hover:bg-blue-50
          text-gray-800 hover:text-blue-600
          shadow-md hover:shadow-lg
          focus:ring-blue-500
        `;
        
      case 'card':
        return `${baseClasses}
          text-white
          shadow-sm hover:shadow-md
          border-0
          group
          active:scale-[0.98]
        `;
        
      case 'minimal':
        return `${baseClasses}
          bg-gray-100 hover:bg-gray-200
          text-gray-800
          border border-gray-300
          focus:ring-gray-500
        `;
        
      case 'gradient':
        return `${baseClasses}
          bg-pink-500
          hover:bg-pink-600
          text-white
          shadow-lg hover:shadow-2xl
          border-0
          focus:ring-pink-500
        `;
        
      default:
        return baseClasses;
    }
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    
    if (isProductInCart) {
      return (
        <svg className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-110 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      );
    }
    
    return (
      <svg className={`${iconSizes[size]} transition-transform duration-300 group-hover:rotate-12 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L7 13m0 0L3 3m4 10v6a1 1 0 001 1h12a1 1 0 001-1v-6M7 13h10" />
      </svg>
    );
  };

  return (
    <button
      className={`${getVariantClasses()} ${className} touch-manipulation`}
      onClick={handleClick}
      style={(variant === 'primary' || variant === 'card') ? getButtonStyles(isClicked || isProductInCart) : undefined}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5 w-full">
        {renderIcon()}
        {showText && <span className="truncate">{buttonText}</span>}
      </span>
      
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
      </div>
    </button>
  );
};

// Specialized variants for different use cases
export const PrimaryAddToCartButton = (props) => (
  <AddToCartButton variant="primary" {...props} />
);

export const SecondaryAddToCartButton = (props) => (
  <AddToCartButton variant="secondary" {...props} />
);

export const CardAddToCartButton = (props) => (
  <AddToCartButton variant="card" size="small" {...props} />
);

export const MinimalAddToCartButton = (props) => (
  <AddToCartButton variant="minimal" {...props} />
);

export const GradientAddToCartButton = (props) => (
  <AddToCartButton variant="gradient" {...props} />
);

export default AddToCartButton;
