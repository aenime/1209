import React from "react";
import envConfig from "../../utils/envConfig";
import { getPrimaryThemeColor, getSecondaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * ReturnPolicyTailwind Component
 * 
 * A comprehensive return policy information page that provides customers with detailed information
 * about the return process, eligibility criteria, refund procedures, and contact methods.
 * This component ensures legal compliance and builds customer trust through transparent policies.
 * 
 * Key Features:
 * - Professional return policy presentation with dynamic theming
 * - Clear 3-day return window explanation with visual emphasis
 * - Step-by-step return process visualization (4-step process)
 * - Detailed eligibility criteria for returnable vs non-returnable items
 * - Comprehensive refund information with processing timelines
 * - Multiple contact methods for customer support
 * - Responsive design optimized for all devices
 * - Business information integration from environment configuration
 * 
 * Business Logic:
 * - Dynamic business name and contact information from envConfig
 * - Branded color scheme integration for consistent user experience
 * - Professional layout with sections for easy navigation
 * - Clear return window policy (3 days) with visual indicators
 * - Contact information dynamically populated from configuration
 * 
 * Customer Experience:
 * - Professional appearance builds trust and confidence
 * - Clear information reduces customer service inquiries
 * - Step-by-step process makes returns easy to understand
 * - Multiple contact options provide flexibility for customer support
 * - Responsive design ensures accessibility across all devices
 * 
 * @returns {JSX.Element} Fully responsive return policy information page
 */
const ReturnPolicyTailwind = () => {
  /**
   * Business Configuration
   * 
   * Retrieves business information from environment configuration:
   * - businessName: Company name for branding and legal identification
   * - hostname: Current domain for email generation and references
   * - address: Business address for return shipping information
   */
  const businessName = envConfig.get('REACT_APP_FAM') || window.location.hostname;
  const hostname = window.location.hostname;
  const address = envConfig.get('REACT_APP_ADDRESS') || '';

  /**
   * Dynamic Theme Colors
   * 
   * Applies consistent branding throughout the return policy page:
   * - primaryColor: Main brand color for headers, buttons, and emphasis
   * - secondaryColor: Complementary color for variety and visual hierarchy
   */
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-8 px-2 sm:px-3 md:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden mb-3 sm:mb-6 md:mb-8" style={{ backgroundColor: primaryColor }}>
          <div className="px-3 py-4 sm:px-6 sm:py-8 md:px-8 md:py-12 text-center text-white">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/20 rounded-full mb-2 sm:mb-4 md:mb-6 backdrop-blur-sm">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-2 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-6 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
              Return Policy
            </h1>
            <p className="text-xs sm:text-sm md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed px-1 sm:px-2">
              We want you to be completely satisfied with your purchase. Learn about our hassle-free return process.
            </p>
            <div className="mt-2 sm:mt-4 md:mt-6 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium">Last updated: November 22, 2022</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          <div className="p-3 sm:p-6 md:p-8 lg:p-12 space-y-4 sm:space-y-8 md:space-y-12">

            {/* Return Window */}
            <section className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4 md:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">Return Window</h2>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-6 md:p-8 border-l-4 border-emerald-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Days Return Policy</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto px-2">
                    You have <span className="font-semibold text-emerald-700">3 days</span> after receiving your item to request a return. This policy ensures that you have sufficient time to inspect your purchase and request a return if needed.
                  </p>
                </div>
              </div>
            </section>

            {/* Return Process */}
            <section className="space-y-3 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Return Process</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center" style={{ borderColor: primaryColor, borderWidth: '2px' }}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                    <span className="text-lg sm:text-2xl font-bold text-white">1</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Contact Us</h4>
                  <p className="text-xs sm:text-sm text-gray-700">Reach out within 3 days of delivery</p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center" style={{ borderColor: secondaryColor, borderWidth: '2px' }}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white" style={{ backgroundColor: secondaryColor }}>
                    <span className="text-lg sm:text-2xl font-bold text-white">2</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Get Approval</h4>
                  <p className="text-xs sm:text-sm text-gray-700">We'll review and approve your return request</p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center" style={{ borderColor: primaryColor, borderWidth: '2px' }}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                    <span className="text-lg sm:text-2xl font-bold text-white">3</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Ship Item</h4>
                  <p className="text-xs sm:text-sm text-gray-700">Pack and send the item back to us</p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center" style={{ borderColor: secondaryColor, borderWidth: '2px' }}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white" style={{ backgroundColor: secondaryColor }}>
                    <span className="text-lg sm:text-2xl font-bold text-white">4</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Get Refund</h4>
                  <p className="text-xs sm:text-sm text-gray-700">Receive your refund after inspection</p>
                </div>
              </div>
            </section>

            {/* Eligibility Criteria */}
            <section className="space-y-3 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Eligibility Criteria</h2>
              </div>
              <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border" style={{ borderColor: primaryColor, borderWidth: '2px' }}>
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 text-white" style={{ backgroundColor: primaryColor }}>
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Returnable Items</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: primaryColor }}></span>
                      Items in original condition and packaging
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: primaryColor }}></span>
                      Unused and unworn products
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: primaryColor }}></span>
                      Items with all original tags and labels
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: primaryColor }}></span>
                      Products without any damage or defects
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border" style={{ borderColor: secondaryColor, borderWidth: '2px' }}>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white" style={{ backgroundColor: secondaryColor }}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Non-Returnable Items</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: secondaryColor }}></span>
                      Perishable food items and consumables
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: secondaryColor }}></span>
                      Personal care and hygiene products
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: secondaryColor }}></span>
                      Items damaged due to misuse
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: secondaryColor }}></span>
                      Custom or personalized products
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Refund Information */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: secondaryColor }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Refund Information</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-l-4" style={{ borderLeftColor: primaryColor }}>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Time</h4>
                    <p className="text-gray-700 text-sm">5-7 business days after we receive the item</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: secondaryColor }}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Refund Method</h4>
                    <p className="text-gray-700 text-sm">Original payment method or store credit</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Full Refund</h4>
                    <p className="text-gray-700 text-sm">100% refund for eligible returns</p>
                  </div>
                </div>
                <div className="mt-6 bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <strong className="text-green-700">Return shipping costs may apply depending on the reason for return.</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Initiate a Return */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: secondaryColor }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">How to Initiate a Return</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border-l-4" style={{ borderColor: primaryColor }}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Methods</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Email</h4>
                          <p className="text-gray-700 text-sm">returns@{hostname}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Phone</h4>
                          <p className="text-gray-700 text-sm">{envConfig.get('REACT_APP_MO') || 'Contact us for phone number'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: secondaryColor }}>
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Support</h4>
                          <p className="text-gray-700 text-sm">support@{hostname}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Information</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primaryColor }}></span>Order number</li>
                      <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primaryColor }}></span>Product details</li>
                      <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primaryColor }}></span>Reason for return</li>
                      <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primaryColor }}></span>Photos (if applicable)</li>
                      <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primaryColor }}></span>Preferred refund method</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200">
              <div className="text-center mb-4 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">Need Help with Returns?</h2>
                <p className="text-sm sm:text-base text-gray-600 px-2">Our customer service team is here to assist you with your return.</p>
              </div>
              
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg max-w-2xl mx-auto">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 text-sm sm:text-base text-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-start"><span className="font-medium w-16 sm:w-20 flex-shrink-0">Business:</span> <span className="break-words">{businessName}</span></div>
                    <div className="flex items-start"><span className="font-medium w-16 sm:w-20 flex-shrink-0">Email:</span> <span className="break-words">returns@{hostname}</span></div>
                    <div className="flex items-start"><span className="font-medium w-16 sm:w-20 flex-shrink-0">Support:</span> <span className="break-words">support@{hostname}</span></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start"><span className="font-medium w-16 sm:w-20 flex-shrink-0">Address:</span> <span className="break-words">{address || 'Contact us for return address'}</span></div>
                    <div className="flex items-start"><span className="font-medium w-16 sm:w-20 flex-shrink-0">Hours:</span> <span>Mon-Fri 9AM-6PM</span></div>
                    <div className="flex items-start"><span className="font-medium w-16 sm:w-20 flex-shrink-0">Response:</span> <span>Within 24 hours</span></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyTailwind;
