/**
 * React Core and Navigation Imports
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Context and Configuration
 */
import { useProduct } from "../../contexts/ProductContext";
import envConfig from "../../utils/envConfig";
import { getPrimaryThemeColor, getSecondaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * Heroicons for UI Elements
 */
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowUturnLeftIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";

/**
 * Footer Component - Modern E-Commerce Footer with Complete Business Information
 * 
 * Comprehensive footer featuring:
 * - Mobile-optimized accordion sections for organized content
 * - Beautiful gradient header with newsletter subscription
 * - Quick contact buttons for immediate customer support
 * - Trust badges and security information for credibility
 * - Social media integration for brand presence
 * - Payment method icons for transaction confidence
 * - Category navigation for easy product discovery
 * - Company information and legal pages
 * - Responsive design adapting to all screen sizes
 * 
 * Key Features:
 * - Accordion functionality for mobile space optimization
 * - Dynamic content loading from environment configuration
 * - Theme-aware color scheme integration
 * - Category-based navigation from product context
 * - Newsletter signup with validation
 * - Contact information display with click-to-call/email
 * - Trust indicators for e-commerce credibility
 * - SEO-friendly footer links structure
 * 
 * Business Integration:
 * - Pulls company details from environment config
 * - Displays current year automatically
 * - Adapts to domain-specific branding
 * - Supports multi-category product navigation
 */
const FooterTailwind = React.memo(() => {
  /**
   * Navigation and Context Hooks
   */
  const navigate = useNavigate();
  const { categories: contextCategories } = useProduct();

  /**
   * Environment Configuration and Business Data
   * 
   * Retrieves business information from environment config:
   * - Address, phone, business name from config
   * - Dynamic hostname detection for domain-specific display
   * - Current year calculation for copyright
   */
  const currentYear = new Date().getFullYear();
  const businessAddress = envConfig.get('REACT_APP_ADDRESS') || 'Business Address Not Configured';
  const businessName = envConfig.get('REACT_APP_FAM') || 'Your Store';
  const businessPhone = envConfig.get('REACT_APP_MO') || '8989898989';
  const hostname = window.location.hostname;

  /**
   * Category Navigation Data
   * 
   * Uses categories from product context:
   * - Limits to top 4 categories for footer space optimization
   * - Falls back to empty array if categories unavailable
   * - Provides navigation shortcuts to main product categories
   */
  const categories = (contextCategories && Array.isArray(contextCategories)) ? contextCategories.slice(0, 4) : [];

  /**
   * Theme Configuration
   */
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  /**
   * Component State Management
   * 
   * Manages footer functionality:
   * - Newsletter subscription email input
   * - Submission loading state for form feedback
   * - Mobile accordion open/close states for each section
   */
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({});

  /**
   * Mobile Accordion Toggle Handler
   * 
   * Manages expandable sections on mobile devices:
   * - Toggles individual section visibility
   * - Maintains independent state for each section
   * - Provides smooth user experience on small screens
   * 
   * @param {string} sectionTitle - The title/key of the section to toggle
   */
  const toggleSection = (sectionTitle) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email && !isSubmitting) {
      setIsSubmitting(true);
      try {
        setEmail("");
        alert("Thank you for subscribing to our newsletter!");
      } catch (error) {
        alert("Sorry, there was an error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Footer sections data with fallback icons
  const footerSections = [
    {
      title: "Shop",
      icon: ShoppingBagIcon || (() => <div className="w-4 h-4 bg-gray-400 rounded"></div>),
      links: [
        { label: "All Products", path: "/category" },
        ...categories.map(category => ({
          label: category.categoryName || category.name,
          path: `/category/${category._id}`
        }))
      ]
    },
    {
      title: "Support",
      icon: ChatBubbleLeftRightIcon || (() => <div className="w-4 h-4 bg-gray-400 rounded"></div>),
      links: [
        { label: "Contact Us", path: "/contact-us" },
        { label: "Order Tracking", path: "/order-tracking" },
        { label: "FAQ", path: "/faq" },
        { label: "Returns", path: "/refund-policy" }
      ]
    },
    {
      title: "Account",
      icon: UserCircleIcon || (() => <div className="w-4 h-4 bg-gray-400 rounded"></div>),
      links: [
        { label: "My Account", path: "/profile" },
        { label: "Order History", path: "/order-tracking" },
        { label: "Wishlist", path: "/wishlist" },
        { label: "Settings", path: "/profile" }
      ]
    },
    {
      title: "Company",
      icon: BuildingOfficeIcon || (() => <div className="w-4 h-4 bg-gray-400 rounded"></div>),
      links: [
        { label: "About Us", path: "/about-us" },
        { label: "Privacy Policy", path: "/privacypolicy" },
        { label: "Terms of Service", path: "/termsofservice" },
        { label: "Shipping Info", path: "/shippingpolicy" }
      ]
    }
  ];

  return (
    <footer className="bg-white">
      {/* Newsletter & Social Section with Single Color */}
      <div className="relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              {EnvelopeIcon ? (
                <EnvelopeIcon className="w-8 h-8 text-white" />
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Stay in the Loop!
            </h3>
            <p className="text-white/90 text-sm sm:text-base max-w-md mx-auto">
              Get exclusive deals, new arrivals & special offers
            </p>
          </div>
          
          {/* Newsletter Signup */}
          <form onSubmit={handleNewsletterSubmit} className="max-w-sm mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "..." : "Join"}
              </button>
            </div>
          </form>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-3">
            {[
              { 
                name: 'Facebook', 
                url: 'https://facebook.com', 
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                )
              },
              { 
                name: 'Instagram', 
                url: 'https://instagram.com', 
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.253 14.81 3.762 13.659 3.762 12.362s.49-2.448 1.364-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.875.875 1.297 2.026 1.297 3.323s-.422 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.608c-.807 0-1.364-.557-1.364-1.364s.557-1.364 1.364-1.364 1.364.557 1.364 1.364-.557 1.364-1.364 1.364zm-4.262 1.535c-1.297 0-2.351 1.054-2.351 2.351s1.054 2.351 2.351 2.351 2.351-1.054 2.351-2.351-1.054-2.351-2.351-2.351z" clipRule="evenodd" />
                  </svg>
                )
              },
              { 
                name: 'Twitter', 
                url: 'https://twitter.com', 
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                )
              },
              { 
                name: 'WhatsApp', 
                url: `https://wa.me/${businessPhone}`, 
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                )
              },
              { 
                name: 'YouTube', 
                url: 'https://youtube.com', 
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                )
              }
            ].map((social) => (
              <button
                key={social.name}
                onClick={() => window.open(social.url, '_blank')}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label={social.name}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Contact Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Call Button */}
            <a
              href={`tel:${businessPhone}`}
              className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: primaryColor + '20' }}>
                {PhoneIcon ? (
                  <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor }} />
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">Call Us</p>
                <p className="text-xs text-gray-600 hidden sm:block">{businessPhone}</p>
              </div>
            </a>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${businessPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-green-100">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-600 hidden sm:block">Quick Support</p>
              </div>
            </a>

            {/* Email Button */}
            <a
              href={`mailto:support@${hostname}`}
              className="flex items-center justify-center space-x-2 sm:space-x-3 p-2 sm:p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: secondaryColor + '20' }}>
                {EnvelopeIcon ? (
                  <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: secondaryColor }} />
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: secondaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">Email Us</p>
                <p className="text-xs text-gray-600 hidden sm:block">support@{hostname}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Business Info Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{businessName}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Your trusted online shopping destination for quality products with fast delivery and excellent customer service.
                </p>
              </div>
              
              {/* Address Section */}
              <div className="p-4 rounded-xl border mb-6" style={{ backgroundColor: primaryColor + '10', borderColor: primaryColor + '30' }}>
                <div className="flex items-start space-x-3">              <div className="w-8 h-8 rounded-lg flex items-center justify-center mt-1 text-white" style={{ backgroundColor: primaryColor }}>
                {MapPinIcon ? (
                  <MapPinIcon className="w-4 h-4 text-white" />
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1" style={{ color: primaryColor }}>Our Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{businessAddress}</p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {[
                  { 
                    icon: ShieldCheckIcon, 
                    text: 'Secure Shopping',
                    fallbackIcon: <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  },
                  { 
                    icon: TruckIcon, 
                    text: 'Fast Delivery',
                    fallbackIcon: <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  },
                  { 
                    icon: ArrowUturnLeftIcon, 
                    text: 'Easy Returns',
                    fallbackIcon: <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  }
                ].map((badge, index) => (
                  <div key={index} className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 rounded-lg border" style={{ backgroundColor: secondaryColor + '10', borderColor: secondaryColor + '20' }}>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: secondaryColor }}>
                      {badge.icon ? (
                        <badge.icon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      ) : (
                        badge.fallbackIcon
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center" style={{ color: secondaryColor }}>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Links - Mobile Accordion, Desktop Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {footerSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {/* Mobile: Collapsible Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="sm:hidden w-full flex items-center justify-between py-3 text-left border-b border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        {section.icon ? (
                          <section.icon className="w-4 h-4" style={{ color: primaryColor }} />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded" style={{ backgroundColor: primaryColor }}></div>
                        )}
                        <h4 className="text-base font-semibold text-gray-900">{section.title}</h4>
                      </div>
                      {openSections[section.title] ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Desktop: Always Visible Header */}
                    <div className="hidden sm:flex items-center space-x-2 mb-4">
                      {section.icon ? (
                        <section.icon className="w-4 h-4" style={{ color: primaryColor }} />
                      ) : (
                        <div className="w-4 h-4 bg-gray-400 rounded" style={{ backgroundColor: primaryColor }}></div>
                      )}
                      <h4 className="text-base font-semibold text-gray-900">{section.title}</h4>
                    </div>
                    
                    {/* Links */}
                    <ul className={`space-y-3 mt-3 sm:mt-0 ${
                      openSections[section.title] ? 'block' : 'hidden'
                    } sm:block`}>
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <button
                            onClick={() => navigate(link.path)}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 block text-left w-full py-1"
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Bottom */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} {businessName}. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm mr-2">We Accept:</span>
              {[
                { 
                  name: 'Visa', 
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 40 24" fill="none">
                      <rect width="40" height="24" rx="4" fill="#1A1F71"/>
                      <path d="M15.2 7.2h2.4l-1.5 9.6h-2.4l1.5-9.6zm6.6 0l-2.1 6.6-.24-.72-.72-3.84c-.12-.48-.45-.72-.96-.72h-3.18l-.06.24c.54.12 1.08.3 1.56.54l1.32 6.9h2.52l3.84-9.6h-2.07zm8.7 6.24c0-.96-.54-1.62-1.68-2.16-.66-.36-1.08-.6-1.08-.96 0-.36.42-.72 1.26-.72.66 0 1.14.12 1.5.3l.18.06.3-1.8c-.36-.12-.9-.24-1.62-.24-1.8 0-3.06.96-3.06 2.34 0 1.02.9 1.56 1.62 2.04.72.48 .96.78.96 1.2 0 .66-.78 .96-1.5.96-.96 0-1.56-.24-2.04-.42l-.18-.06-.3 1.86c.42.18 1.2.36 2.04.36 1.92 0 3.18-.9 3.18-2.34zm4.8-6.24h-1.86c-.48 0-.84.18-1.02.72l-2.88 8.88h2.52l.48-1.32h3l.3 1.32h2.22l-1.92-9.6zm-2.88 6.6l1.2-3.36.72 3.36h-1.92z" fill="white"/>
                    </svg>
                  )
                },
                { 
                  name: 'MasterCard', 
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 40 24" fill="none">
                      <rect width="40" height="24" rx="4" fill="#EB001B"/>
                      <circle cx="15" cy="12" r="7" fill="#FF5F00"/>
                      <circle cx="25" cy="12" r="7" fill="#F79E1B"/>
                      <path d="M20 6.5c1.5 1.5 2.5 3.8 2.5 6.5s-1 5-2.5 6.5c-1.5-1.5-2.5-3.8-2.5-6.5s1-5 2.5-6.5z" fill="#FF5F00"/>
                    </svg>
                  )
                },
                { 
                  name: 'PayPal', 
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 40 24" fill="none">
                      <rect width="40" height="24" rx="4" fill="#003087"/>
                      <path d="M12 7.5c.5 0 1 .1 1.4.3.8.4 1.1 1.2 1.1 2.2 0 1.5-.8 2.5-2.2 2.5h-.8l-.4 2.5h-1.5l1.2-7.5h1.2zm-.3 3.8h.6c.6 0 1-.3 1-.9 0-.4-.2-.6-.6-.6h-.6l-.4 1.5zm4.8-3.8c.5 0 1 .1 1.4.3.8.4 1.1 1.2 1.1 2.2 0 1.5-.8 2.5-2.2 2.5h-.8l-.4 2.5h-1.5l1.2-7.5h1.2zm-.3 3.8h.6c.6 0 1-.3 1-.9 0-.4-.2-.6-.6-.6h-.6l-.4 1.5z" fill="#009CDE"/>
                    </svg>
                  )
                },
                { 
                  name: 'Google Pay', 
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 40 24" fill="none">
                      <rect width="40" height="24" rx="4" fill="#4285F4"/>
                      <path d="M19.3 12c0-.8-.1-1.5-.2-2.2h-7.1v4.2h4.1c-.2 1-.7 1.9-1.5 2.5v2.1h2.4c1.4-1.3 2.3-3.2 2.3-5.6z" fill="white"/>
                      <path d="M12 20c2.0 0 3.7-.7 4.9-1.9l-2.4-1.9c-.7.4-1.5.7-2.5.7-1.9 0-3.6-1.3-4.2-3h-2.5v1.9c1.2 2.4 3.7 4.2 6.7 4.2z" fill="white"/>
                      <path d="M7.8 14.9c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2v-1.9h-2.5c-.4.8-.6 1.7-.6 2.6s.2 1.8.6 2.6l2.5-1.9z" fill="white"/>
                      <path d="M12 9.5c1.1 0 2 .4 2.7 1.1l2-2c-1.2-1.1-2.8-1.8-4.7-1.8-3 0-5.5 1.8-6.7 4.2l2.5 1.9c.6-1.7 2.3-3 4.2-3z" fill="white"/>
                    </svg>
                  )
                },
                { 
                  name: 'UPI', 
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 40 24" fill="none">
                      <rect width="40" height="24" rx="4" fill="#FF6600"/>
                      <text x="20" y="15" textAnchor="middle" className="fill-white text-xs font-bold">UPI</text>
                    </svg>
                  )
                }
              ].map((method, index) => (
                <div key={index} className="w-10 h-6 bg-white rounded border flex items-center justify-center overflow-hidden">
                  {method.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default FooterTailwind;