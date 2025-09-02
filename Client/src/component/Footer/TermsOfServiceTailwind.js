/**
 * React Core Import
 */
import React from "react";

/**
 * Environment Configuration Utility
 */
import envConfig from "../../utils/envConfig";

/**
 * Dynamic Theme Color Utility
 */
import { getPrimaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * Terms of Service Page Component - Legal Terms and Conditions
 * 
 * Comprehensive legal document page featuring:
 * - Complete terms and conditions for platform usage
 * - User account requirements and responsibilities
 * - Platform usage guidelines and prohibited activities
 * - Order processing and payment terms
 * - Shipping and delivery policies
 * - Intellectual property protection
 * - Liability limitations and legal disclaimers
 * - Contact information for legal inquiries
 * - Responsive design with professional styling
 * - Dynamic business information integration
 * 
 * Key Features:
 * - Professional legal document presentation
 * - Comprehensive coverage of platform usage terms
 * - User-friendly visual design with icons and sections
 * - Responsive layout optimized for all devices
 * - Dynamic business name and contact integration
 * - Clear section organization with visual hierarchy
 * - Interactive elements with gradient styling
 * - Mobile-optimized typography and spacing
 * 
 * Content Sections:
 * - Introduction: Legal framework and document scope
 * - Acceptance: Terms agreement and user acknowledgment
 * - Account: Registration requirements and user responsibilities
 * - Platform Use: Permitted activities and prohibited actions
 * - Orders: Purchase process and payment terms
 * - Shipping: Delivery policies and timeframes
 * - Intellectual Property: Content ownership and usage rights
 * - Liability: Legal limitations and disclaimers
 * - Contact: Legal inquiry and support information
 * 
 * Legal Compliance:
 * - Information Technology Act 2000 compliance
 * - Electronic records and digital signatures framework
 * - Intermediary guidelines and regulations
 * - Terms publication requirements
 * - User consent and agreement mechanisms
 * - Platform liability limitations
 * 
 * Visual Design:
 * - Gradient color schemes for visual appeal
 * - Icon-based section headers for easy navigation
 * - Card-based layout for content organization
 * - Professional typography with proper hierarchy
 * - Color-coded sections for different topics
 * - Interactive elements with hover effects
 * 
 * Responsive Features:
 * - Mobile-first responsive design
 * - Flexible grid layouts for different screen sizes
 * - Optimized text sizing (text-xs to text-3xl)
 * - Touch-friendly interactive elements
 * - Proper spacing and padding for readability
 */

const TermsOfServiceTailwind = () => {
  /**
   * Dynamic Business Information
   * 
   * Extracts business details from environment configuration:
   * - businessName: Company name from REACT_APP_FAM or hostname fallback
   * - hostname: Current website domain for legal references
   * - address: Business address from environment or placeholder
   */
  const businessName = envConfig.get('REACT_APP_FAM') || window.location.hostname;
  const hostname = window.location.hostname;
  const address = envConfig.get('REACT_APP_ADDRESS') || '';
  
  /**
   * Dynamic Theme Color Integration
   * 
   * Retrieves primary theme color for consistent branding:
   * - primaryColor: Main brand color for headers and key elements
   */
  const primaryColor = getPrimaryThemeColor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 py-2 sm:py-4 md:py-8 px-2 sm:px-3 md:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden mb-3 sm:mb-6 md:mb-8">
          <div className="px-3 py-4 sm:px-6 sm:py-8 md:px-8 md:py-12 text-center text-white">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/20 rounded-full mb-2 sm:mb-4 md:mb-6 backdrop-blur-sm">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed px-1 sm:px-2">
              Please read these terms and conditions carefully before using our platform.
            </p>
            <div className="mt-2 sm:mt-4 md:mt-6 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium">Last updated: August 7, 2023</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          <div className="p-3 sm:p-6 md:p-8 lg:p-12 space-y-4 sm:space-y-8 md:space-y-12">

            {/* Introduction */}
            <section className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4 md:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">Introduction</h2>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-l-4 border-blue-500">
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-2 sm:mb-3 md:mb-4">
                  This document is an electronic record in terms of the Information Technology Act, 2000 and rules thereunder as applicable and the amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000. This electronic record is generated by a computer system and does not require any physical or digital signatures.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  This document is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2011, which require publishing the rules and regulations, privacy policy, and Terms of Use for access or usage of domain name <span className="font-semibold text-blue-700">{hostname}</span> ("Website"), including the related mobile site and mobile application (hereinafter referred to as "Platform").
                </p>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section className="space-y-3 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-green-500">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
                  By accessing and using this Platform, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this Platform's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
                <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-green-200">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <strong className="text-sm sm:text-base text-green-700">By using our Platform, you confirm that you have read, understood, and agree to these terms.</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* User Account and Registration */}
            <section className="space-y-3 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">User Account & Registration</h2>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </span>
                    Account Requirements
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>Must be 18 years or older</li>
                    <li className="flex items-start"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>Provide accurate and complete information</li>
                    <li className="flex items-start"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>Maintain account security</li>
                    <li className="flex items-start"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>One account per person</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                    </span>
                    Responsibilities
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></span>Keep login credentials secure</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></span>Report unauthorized access immediately</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></span>Update information when necessary</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></span>Comply with all applicable laws</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use of Platform */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Use of Platform</h2>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Permitted Uses</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🛒</span>
                      <span className="font-semibold text-gray-900">Shopping</span>
                    </div>
                    <p className="text-gray-700 text-sm">Browse and purchase products</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">👤</span>
                      <span className="font-semibold text-gray-900">Account Management</span>
                    </div>
                    <p className="text-gray-700 text-sm">Manage your profile and orders</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🔍</span>
                      <span className="font-semibold text-gray-900">Product Search</span>
                    </div>
                    <p className="text-gray-700 text-sm">Search and compare products</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Activities</h3>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>Violating any applicable laws or regulations</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>Transmitting malicious code or viruses</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>Attempting to gain unauthorized access</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>Using the platform for fraudulent purposes</li>
                    <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>Interfering with platform operations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Orders and Payments */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Orders & Payments</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Process</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                      <span className="text-gray-700">Add items to cart</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                      <span className="text-gray-700">Proceed to checkout</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                      <span className="text-gray-700">Complete payment</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
                      <span className="text-gray-700">Order confirmation</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>All prices include applicable taxes</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Payment required at time of order</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Secure payment processing</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Multiple payment options available</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Shipping and Delivery */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Shipping & Delivery</h2>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-l-4 border-orange-500">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Delivery Areas</h4>
                    <p className="text-gray-700 text-sm">We deliver to all major cities and towns</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Delivery Time</h4>
                    <p className="text-gray-700 text-sm">3-7 business days for standard delivery</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Safe Delivery</h4>
                    <p className="text-gray-700 text-sm">Secure packaging and tracking included</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Intellectual Property</h2>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-l-4 border-purple-500">
                <p className="text-gray-700 leading-relaxed mb-4">
                  All content on this Platform, including but not limited to text, graphics, logos, images, audio clips, video clips, data compilations, and software, is the property of <span className="font-semibold text-purple-700">{businessName}</span> or its content suppliers and is protected by applicable copyright and other intellectual property laws.
                </p>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2">You may not:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Reproduce, distribute, or publicly display any content</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Modify or create derivative works</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Use content for commercial purposes without permission</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Limitation of Liability</h2>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border-l-4 border-red-500">
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the fullest extent permitted by applicable law, {businessName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <strong className="text-red-700">Important Notice:</strong>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Our total liability to you for any damages shall not exceed the amount you paid for the specific product or service that is the subject of the claim.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Questions About These Terms?</h2>
                <p className="text-gray-600">Contact us if you need clarification on any of these terms and conditions.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                  <div>
                    <div className="flex items-center mb-2"><span className="font-medium w-20">Business:</span> {businessName}</div>
                    <div className="flex items-center mb-2"><span className="font-medium w-20">Email:</span> legal@{hostname}</div>
                    <div className="flex items-center mb-2"><span className="font-medium w-20">Website:</span> {hostname}</div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2"><span className="font-medium w-20">Address:</span> {address || 'Contact us for address details'}</div>
                    <div className="flex items-center mb-2"><span className="font-medium w-20">Support:</span> support@{hostname}</div>
                    <div className="flex items-center mb-2"><span className="font-medium w-20">Response:</span> Within 24-48 hours</div>
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

export default TermsOfServiceTailwind;
