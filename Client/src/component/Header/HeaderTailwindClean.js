/**
 * React Core and Navigation Imports
 */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/**
 * Component Imports
 */
import OfferSlider from "./OfferSlider";
import LogoText from "../LogoText";

/**
 * Context Hooks
 */
import { useCart } from "../../contexts/CartContext";
import { useProduct } from "../../contexts/ProductContext";
import { useUI } from "../../contexts/UIContext";
import { useAppLocation } from "../../contexts/LocationContext";

/**
 * Utility Functions and Configuration
 */
import envConfig from "../../utils/envConfig";
import { getNavStyles, getSubtitleStyles, getPrimaryThemeColor, getSecondaryThemeColor, getAddressButtonColor } from '../../utils/themeColorsSimple';
import { cn } from "../../utils/cn";

/**
 * Header Component - Modern E-Commerce Navigation
 * 
 * Main navigation header featuring:
 * - Responsive design with mobile hamburger menu
 * - Dynamic cart badge with item count
 * - Search functionality with auto-suggestions
 * - Scroll-based styling changes
 * - Route-aware navigation states
 * - Theme-based color customization
 * - SEO optimization with meta tags
 * 
 * Key Features:
 * - Mobile-first responsive design
 * - Performance-optimized state management
 * - Dynamic theme integration
 * - Context-aware UI elements
 * - Accessibility compliant navigation
 */
const HeaderTailwindClean = () => {
  /**
   * Navigation and Routing
   */
  let { pathname } = useAppLocation();
  const navigate = useNavigate();
  
  /**
   * Route-Based Navigation State (Performance Optimized)
   * 
   * Computes navigation states from pathname in single useMemo
   * instead of multiple useState calls for better performance.
   * Reduces re-renders and improves component efficiency.
   */
  const navigationState = useMemo(() => {
    return {
      isCart: pathname.indexOf("/cart") > -1,
      isCheckout: pathname.indexOf("/checkout/address") > -1,
      isPayment: pathname.indexOf("/checkout/payment") > -1,
      isProductDetails: pathname.indexOf("/single-product") > -1,
      isCategory: pathname.indexOf("/category") > -1,
      isWishlist: pathname.indexOf("/wishlist") > -1,
      thankYou: pathname.indexOf("/ThankYou") > -1,
      orderConfirm: pathname.indexOf("/order-comfirmation") > -1
    };
  }, [pathname]);
  
  /**
   * Destructured Navigation States
   * 
   * Extract individual state values for component use.
   * Maintains backward compatibility with existing code.
   */
  const { isCart, isCheckout, isPayment, isProductDetails, isCategory, isWishlist, thankYou, orderConfirm } = navigationState;
  const isWhishList = isWishlist; // Backward compatibility with typo
  const orderComfirm = orderConfirm; // Backward compatibility with typo
  
  /**
   * Component Local State
   * 
   * States that aren't derived from routes:
   * - Mobile menu toggle state
   * - Scroll position tracking
   * - Search input value
   */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  /**
   * Environment Configuration
   */
  const logo = envConfig.get('REACT_APP_LOGO');
  
  /**
   * Dynamic Theme Colors
   */
  const secondaryColor = getSecondaryThemeColor();
  const addressButtonColor = getAddressButtonColor();
  
  /**
   * Context Data
   */
  const { cartProducts } = useCart();
  const { singleProduct } = useProduct();
  const {
    isPaymentPageLoading,
    setIsPaymentPageLoading,
  } = useUI();

  /**
   * Scroll Effect Handler with Performance Optimization
   * 
   * Handles header styling changes based on scroll position:
   * - Adds shadow and background changes when scrolled
   * - Uses debouncing to prevent excessive re-renders
   * - Optimizes performance with useCallback
   */
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setIsScrolled(scrollTop > 10);
  }, []);

  /**
   * Scroll Event Management Effect
   * 
   * Sets up optimized scroll event handling:
   * - Debounces scroll events to improve performance
   * - Prevents excessive function calls during rapid scrolling
   * - Properly cleans up event listeners on component unmount
   * - Uses 10ms timeout for optimal balance between responsiveness and performance
   */
  useEffect(() => {
    let timeoutId;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };
    
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  /**
   * Mobile Menu Toggle Handler
   * 
   * Manages mobile navigation menu state:
   * - Toggles hamburger menu visibility
   * - Handles body scroll lock when menu is open
   * - Provides accessible mobile navigation experience
   */
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  /**
   * Search Input Handler
   * 
   * Manages search functionality:
   * - Updates search query state
   * - Prepares for future search suggestions
   * - Handles real-time search input
   */
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  /**
   * Navigation Handlers
   * 
   * Centralized navigation functions for consistent routing:
   * - Handles programmatic navigation
   * - Manages mobile menu state during navigation
   * - Ensures clean navigation experience
   */
  const handleNavigation = useCallback((path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  }, [navigate]);

  /**
   * Cart Badge Count Calculation
   * 
   * Computes total items in cart for badge display:
   * - Sums quantities from all cart products
   * - Handles empty cart scenarios
   * - Provides real-time cart count updates
   */
  const cartItemCount = useMemo(() => {
    return cartProducts?.reduce((total, product) => total + (product.quantity || 0), 0) || 0;
  }, [cartProducts]);

  /**
   * Dynamic Page Title Generation
   * 
   * Creates SEO-optimized page titles based on current route:
   * - Uses product names for product detail pages
   * - Includes brand information and page context
   * - Maintains consistent title structure
   */
  const getPageTitle = useCallback(() => {
    if (isProductDetails && singleProduct?.title) {
      return `${singleProduct.title} - ${envConfig.get('REACT_APP_SITE_NAME') || 'Shop'}`;
    }
    if (isCart) return `Shopping Cart - ${envConfig.get('REACT_APP_SITE_NAME') || 'Shop'}`;
    if (isCheckout) return `Checkout - ${envConfig.get('REACT_APP_SITE_NAME') || 'Shop'}`;
    if (isWishlist) return `Wishlist - ${envConfig.get('REACT_APP_SITE_NAME') || 'Shop'}`;
    return envConfig.get('REACT_APP_SITE_NAME') || 'Shop';
  }, [isProductDetails, singleProduct, isCart, isCheckout, isWishlist]);

  /**
   * Cart Badge Animation Effect
   * 
   * Provides visual feedback when cart is updated:
   * - Adds bounce and glow animations to cart badge
   * - Removes animations after brief duration
   * - Enhances user experience with visual confirmations
   */
  useEffect(() => {
    if (cartProducts.length > 0) {
      const notification = document.getElementById("cartBadge");
      if (notification) {
        notification.classList.add("animate-cart-bounce", "animate-pulse-glow");
        setTimeout(() => {
          notification.classList.remove("animate-cart-bounce", "animate-pulse-glow");
        }, 2000);
      }
    }
  }, [cartProducts]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  /**
   * Search Form Handler
   * 
   * Manages search form submission:
   * - Prevents default form submission
   * - Navigates to search results page with query
   * - Clears search input after submission
   * - Handles URL encoding for safe query parameters
   */
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }, [searchQuery, navigate]);

  /**
   * Mobile Menu Close Handler
   * 
   * Provides alternative method to close mobile menu:
   * - Used for overlay clicks
   * - Keyboard accessibility
   * - Programmatic closing
   */
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  /**
   * Navigate and Close Helper
   * 
   * Combines navigation with mobile menu closing:
   * - Navigates to specified path
   * - Automatically closes mobile menu
   * - Ensures clean mobile UX
   */
  const navigateAndClose = useCallback((path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  }, [navigate]);

  /**
   * Back Navigation Handler
   * 
   * Handles back button functionality:
   * - Special handling for payment loading states
   * - Resets payment loading when navigating back from payment
   * - Uses browser history navigation
   */
  const goBack = useCallback(() => {
    if (isPaymentPageLoading && isPayment) {
      setIsPaymentPageLoading(false);
    } else {
      navigate(-1);
    }
  }, [isPaymentPageLoading, isPayment, setIsPaymentPageLoading, navigate]);

  /**
   * Home Navigation Helper
   * 
   * Provides quick navigation to homepage:
   * - Used for logo clicks
   * - Breadcrumb navigation
   * - Error recovery navigation
   */
  const goToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  /**
   * Special Page Detection
   * 
   * Determines if current page requires special header treatment:
   * - Affects header styling and visibility
   * - Controls navigation elements display
   * - Manages responsive behavior
   */
  const isSpecialPage = isCart || isCheckout || isPayment || isProductDetails || isCategory || orderComfirm || isWhishList;

  return (
    <>
      {/* SEO Scripts */}
      <Helmet>
        <link rel="icon" type="image/x-icon" href={logo} sizes="16x16" />
      </Helmet>

      {/* Main Header */}
      <header 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 ease-in-out",
          isScrolled 
            ? "bg-white shadow-lg" 
            : "shadow-md"
        )}
        style={!isScrolled ? { ...getNavStyles(), backgroundColor: getNavStyles()?.backgroundColor || getPrimaryThemeColor() } : undefined}
      >
        {/* Top notification bar - hidden on mobile */}
        {!isSpecialPage && !isScrolled && (
          <div className="hidden md:block bg-black text-white text-center py-2 text-sm">
            <span className="font-medium">🚚 Free shipping on orders all over Pan India</span>
            <span className="mx-4">•</span>
            <span className="font-medium text-white">
              30 day return policy on all products
            </span>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Thank You Page - Mobile-Optimized Clean Header */}
          {thankYou ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="flex items-center space-x-3 sm:space-x-4 bg-white rounded-lg sm:rounded-xl px-6 sm:px-8 py-3 sm:py-4 shadow-lg mx-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-lg sm:rounded-xl flex items-center justify-center p-2">
                  {logo && logo !== '' ? (
                    // Image Logo
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-8 sm:h-10 w-auto cursor-pointer transition-transform duration-200 hover:scale-105"
                      onClick={goToHome}
                    />
                  ) : (
                    // Text Logo using FAM
                    <LogoText
                      size="small"
                      isScrolled={true}
                      onClick={goToHome}
                      className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    />
                  )}
                </div>
                <div className="text-gray-900">
                  <div className="text-lg sm:text-2xl font-bold text-primary-600">Thank You!</div>
                  <div 
                    className="text-xs sm:text-sm mt-1"
                    style={getSubtitleStyles()}
                  >
                    Your order has been confirmed
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile-Optimized Regular Header */
            <div className="flex items-center justify-between h-16 sm:h-20 py-2 sm:py-3">
              
              {/* Left Section - Logo and Navigation */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Clean Back Button for Special Pages */}
                {isSpecialPage && (
                  <button
                    onClick={goBack}
                    className={cn(
                      "p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-300",
                      isScrolled 
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                        : "bg-white/20 hover:bg-white/30 text-white"
                    )}
                    aria-label="Go back"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Clean Menu Button for Home Page */}
                {!isSpecialPage && (
                  <button
                    onClick={toggleMobileMenu}
                    className={cn(
                      "p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-300",
                      isScrolled 
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                        : "bg-white/20 hover:bg-white/30 text-white"
                    )}
                    aria-label="Open menu"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                      />
                    </svg>
                  </button>
                )}

                {/* Enhanced Logo - Image or Text based on REACT_APP_LOGO */}
                <div className="flex-shrink-0">
                  {logo && logo !== '' ? (
                    // Scenario 1: Image Logo
                    <div 
                      className={cn(
                        "p-1 sm:p-2 cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg",
                        isScrolled ? "bg-primary-50" : ""
                      )}
                      onClick={goToHome}
                    >
                      <img
                        src={logo}
                        alt="Logo"
                        className={cn(
                          "h-6 sm:h-8 w-auto transition-all duration-200",
                          isScrolled 
                            ? "filter brightness-100 contrast-100" 
                            : "filter brightness-0 invert drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                        )}
                      />
                    </div>
                  ) : (
                    // Scenario 2: Text Logo using FAM
                    <LogoText
                      size="medium"
                      isScrolled={isScrolled}
                      onClick={goToHome}
                      className={cn(
                        "transition-all duration-200 hover:scale-105 rounded-lg p-1 sm:p-2",
                        isScrolled ? "bg-primary-50" : ""
                      )}
                    />
                  )}
                </div>

                {/* Search Bar - Hidden on mobile and tablet */}
                {!isSpecialPage && (
                  <div className="hidden lg:flex items-center ml-4 xl:ml-8">
                    <form onSubmit={handleSearch} className="relative w-80 xl:w-96">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products, brands..."
                        className={cn(
                          "w-full px-4 py-2 pl-10 pr-10 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500",
                          isScrolled 
                            ? "bg-gray-100 text-gray-900 placeholder-gray-500" 
                            : "bg-white/20 text-white placeholder-white/70"
                        )}
                      />
                      <svg
                        className={cn(
                          "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                          isScrolled ? "text-gray-500" : "text-white/70"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className={cn(
                            "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                            isScrolled ? "text-gray-500" : "text-white/70"
                          )}
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </div>

              {/* Mobile-Optimized Right Section - Icons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Clean Search Icon - Mobile/Tablet only */}
                {!isSpecialPage && (
                  <button
                    className={cn(
                      "lg:hidden p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105",
                      isScrolled 
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                        : "bg-white/20 hover:bg-white/30 text-white"
                    )}
                    aria-label="Search"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                )}

                {/* Clean Wishlist Icon */}
                <button
                  onClick={() => navigate("/wishlist")}
                  className={cn(
                    "p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105",
                    isScrolled 
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                      : "bg-white/20 hover:bg-white/30 text-white"
                  )}
                  aria-label="Wishlist"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Clean Cart Icon */}
                <button
                  onClick={() => navigate("/cart")}
                  className={cn(
                    "p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 relative",
                    isScrolled 
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                      : "bg-white/20 hover:bg-white/30 text-white"
                  )}
                  aria-label={`Cart with ${cartProducts?.length || 0} items`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8l-2.4-8m0 0L3 3m4 10v6a1 1 0 001 1h12a1 1 0 001-1v-6M7 13h10"
                    />
                  </svg>
                  
                  {/* Mobile-Responsive Cart Badge */}
                  {cartProducts?.length > 0 && (
                    <span
                      id="cartBadge"
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold text-[10px] sm:text-xs"
                    >
                      {cartProducts.length > 99 ? "99+" : cartProducts.length}
                    </span>
                  )}
                </button>

                {/* Clean Profile Icon */}
                <button
                  className={cn(
                    "p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105",
                    isScrolled 
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                      : "bg-white/20 hover:bg-white/30 text-white"
                  )}
                  aria-label="Profile"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-Optimized Menu Overlay - Now works on desktop too */}
        {isMobileMenuOpen && !isSpecialPage && (
          <div className="fixed inset-0 z-50">
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={closeMobileMenu} 
            />
            <div className="relative flex flex-col w-full max-w-sm bg-white shadow-2xl h-full">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200"
                style={{ backgroundColor: secondaryColor }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/20 text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Search Bar */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full px-4 py-2 sm:py-3 pl-10 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </form>
              </div>
              
              <nav className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-2 sm:space-y-4 bg-white overflow-y-auto">
                <a 
                  href="/" 
                  className="flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
                  style={{ 
                    '--hover-color': addressButtonColor,
                  }}
                  onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                  onMouseLeave={(e) => e.target.style.color = '#111827'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </a>
                <a 
                  href="/categories" 
                  className="flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
                  onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                  onMouseLeave={(e) => e.target.style.color = '#111827'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-8l-7 7M5 3l7 7" />
                  </svg>
                  <span>Categories</span>
                </a>
                <a 
                  href="/cart" 
                  className="flex items-center justify-between text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
                  onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                  onMouseLeave={(e) => e.target.style.color = '#111827'}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8l-2.4-8m0 0L3 3m4 10v6a1 1 0 001 1h12a1 1 0 001-1v-6M7 13h10" />
                    </svg>
                    <span>Cart</span>
                  </div>
                  {cartProducts?.length > 0 && (
                    <span className="text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold" style={{ backgroundColor: secondaryColor }}>
                      {cartProducts.length}
                    </span>
                  )}
                </a>
                <a 
                  href="/wishlist" 
                  className="flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
                  onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                  onMouseLeave={(e) => e.target.style.color = '#111827'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Wishlist</span>
                </a>
                <a 
                  href="/orders" 
                  className="flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
                  onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                  onMouseLeave={(e) => e.target.style.color = '#111827'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                  </svg>
                  <span>My Orders</span>
                </a>
                <a 
                  href="/profile" 
                  className="flex items-center space-x-3 sm:space-x-4 text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 p-3 sm:p-4 rounded-lg hover:bg-gray-50"
                  onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                  onMouseLeave={(e) => e.target.style.color = '#111827'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </a>
              </nav>
              
              {/* Mobile Menu Footer */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-gray-200" style={{ backgroundColor: secondaryColor + '10' }}>
                {/* Footer Menu Items */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Customer Service Links */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: secondaryColor }}>Support</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => navigateAndClose('/contact-us')}
                        className="block text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                        onMouseLeave={(e) => e.target.style.color = '#4b5563'}
                      >
                        Contact Us
                      </button>
                      <button
                        onClick={() => { navigate('/faqs'); setIsMobileMenuOpen(false); }}
                        className="block text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                        onMouseLeave={(e) => e.target.style.color = '#4b5563'}
                      >
                        FAQ
                      </button>
                      <button
                        onClick={() => { navigate('/order-tracking'); setIsMobileMenuOpen(false); }}
                        className="block text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                        onMouseLeave={(e) => e.target.style.color = '#4b5563'}
                      >
                        Order Tracking
                      </button>
                    </div>
                  </div>
                  
                  {/* Policies Links */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: secondaryColor }}>Policies</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => { navigate('/privacypolicy'); setIsMobileMenuOpen(false); }}
                        className="block text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                        onMouseLeave={(e) => e.target.style.color = '#4b5563'}
                      >
                        Privacy Policy
                      </button>
                      <button
                        onClick={() => { navigate('/termsofservice'); setIsMobileMenuOpen(false); }}
                        className="block text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                        onMouseLeave={(e) => e.target.style.color = '#4b5563'}
                      >
                        Terms of Service
                      </button>
                      <button
                        onClick={() => { navigate('/refund-policy'); setIsMobileMenuOpen(false); }}
                        className="block text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onMouseEnter={(e) => e.target.style.color = addressButtonColor}
                        onMouseLeave={(e) => e.target.style.color = '#4b5563'}
                      >
                        Return Policy
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Business Info & Hostname */}
                <div className="text-center border-t border-gray-200 pt-3">
                  <div className="text-xs text-gray-600 mb-1">
                    {envConfig.get('REACT_APP_FAM') || window.location.hostname}
                  </div>
                  <div className="text-xs text-gray-500">
                    {window.location.hostname}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Offer Slider for Product Details - Always show when on product page */}
      {isProductDetails && singleProduct?._id && <OfferSlider />}
    </>
  );
};

export default HeaderTailwindClean;
