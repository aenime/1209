/**
 * React Core Import
 */
import React from "react";

/**
 * Environment Configuration Utility
 */
import envConfig from "../../utils/envConfig";

/**
 * Dynamic Theme Color Utilities
 */
import { getPrimaryThemeColor, getSecondaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * Privacy Policy Page Component - Comprehensive Data Protection Information
 * 
 * Professional privacy policy page featuring:
 * - Complete data collection and usage transparency
 * - User rights and data protection information
 * - GDPR and privacy regulation compliance
 * - Dynamic business information integration
 * - Responsive design with mobile-first approach
 * - Interactive sections with visual icons
 * - Contact information for privacy inquiries
 * - Security measures and cookie policy
 * 
 * Key Features:
 * - Comprehensive privacy information covering all data practices
 * - Dynamic business name and contact integration
 * - Responsive design optimized for all screen sizes
 * - Visual hierarchy with icons and color-coded sections
 * - Clear explanation of user rights and data handling
 * - Professional styling with theme color integration
 * - Mobile-optimized typography and spacing
 * - Contact information for privacy officer and general inquiries
 * 
 * Content Sections:
 * - Introduction: Privacy policy overview and scope
 * - Information Collection: Types of data collected (personal, transaction, technical)
 * - Usage: How collected information is used
 * - Sharing: When and with whom information is shared
 * - User Rights: Data access, correction, deletion, portability
 * - Security: Data protection measures and encryption
 * - Cookies: Tracking technology usage and management
 * - Contact: Privacy officer and general contact information
 * 
 * Compliance Features:
 * - GDPR compliance with user rights explanation
 * - Clear data collection purpose statements
 * - Explicit consent and sharing policies
 * - Security measure documentation
 * - Contact information for data protection inquiries
 * - Regular update timestamps and versioning
 * 
 * Dynamic Content:
 * - Business name from environment configuration
 * - Website hostname detection
 * - Contact details from environment variables
 * - Responsive design breakpoints
 * - Theme color integration throughout
 * 
 * Responsive Design:
 * - Mobile-first approach with progressive enhancement
 * - Flexible grid layouts for different screen sizes
 * - Optimized typography scaling (text-xs to text-xl)
 * - Touch-friendly interactive elements
 * - Proper spacing and padding for readability
 */

const PrivacyPolicyTailwind = React.memo(() => {
  /**
   * Dynamic Business Information
   * 
   * Extracts business details from environment configuration:
   * - businessName: Company name from REACT_APP_FAM or hostname fallback
   * - hostname: Current website domain for contact emails and references
   */
  const businessName = envConfig.get('REACT_APP_FAM') || window.location.hostname;
  const hostname = window.location.hostname;

  /**
   * Dynamic Theme Colors
   * 
   * Retrieves current theme colors for consistent branding:
   * - primaryColor: Main brand color for headers and key elements
   * - secondaryColor: Supporting color for accents and highlights
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
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed px-1 sm:px-2">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="mt-2 sm:mt-4 md:mt-6 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium">Last updated: March 15, 2022</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          <div className="p-3 sm:p-6 md:p-8 lg:p-12 space-y-4 sm:space-y-8 md:space-y-12">
            
            {/* Introduction */}
            <section className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4 md:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">Introduction</h2>
              </div>
              <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-l-4" style={{ backgroundColor: `${primaryColor}15`, borderLeftColor: primaryColor }}>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-2 sm:mb-3 md:mb-4">
                  This Privacy Policy describes how <span className="font-semibold text-blue-700">{businessName}</span> ("we," "our," or "us") collects, uses, shares, and protects your personal information when you use our website <span className="font-semibold text-blue-700">{hostname}</span> and related services.
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                  By using our platform, you agree to the collection and use of information in accordance with this policy. We are committed to protecting your privacy and ensuring the security of your personal data.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4 md:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              
              <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 md:mb-4" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Personal Information</h3>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Name and contact details</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Email address and phone number</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Shipping and billing addresses</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Account credentials</li>
                  </ul>
                </div>
                
                <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border" style={{ backgroundColor: `${secondaryColor}10`, borderColor: `${secondaryColor}30` }}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 md:mb-4" style={{ backgroundColor: secondaryColor }}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Transaction Information</h3>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: secondaryColor }}></span>Purchase history and preferences</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: secondaryColor }}></span>Payment information (securely processed)</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: secondaryColor }}></span>Order and delivery details</li>
                  </ul>
                </div>
                
                <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border sm:col-span-2 lg:col-span-1" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 md:mb-4" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Technical Information</h3>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>IP address and device information</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Browser type and version</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Cookies and usage data</li>
                    <li className="flex items-center"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0" style={{ backgroundColor: primaryColor }}></span>Website interaction patterns</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4 md:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              
              <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-orange-200">
                  <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                    <span className="text-xl sm:text-2xl md:text-3xl mr-2 sm:mr-3">🛒</span>
                    <h4 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Order Processing</h4>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">Process and fulfill your orders, handle payments, and provide customer support.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200">
                  <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                    <span className="text-xl sm:text-2xl md:text-3xl mr-2 sm:mr-3">📧</span>
                    <h4 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Communication</h4>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">Send order updates, promotional offers, and important account information.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-purple-200">
                  <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                    <span className="text-xl sm:text-2xl md:text-3xl mr-2 sm:mr-3">🔍</span>
                    <h4 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Personalization</h4>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">Customize your shopping experience and recommend relevant products.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-green-200">
                  <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                    <span className="text-xl sm:text-2xl md:text-3xl mr-2 sm:mr-3">🛡️</span>
                    <h4 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900">Security</h4>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">Protect against fraud, unauthorized access, and ensure platform security.</p>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-l-4 border-indigo-500">
                <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">We may share your information with:</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-indigo-500 rounded-full flex items-center justify-center mt-0.5 sm:mt-1 shrink-0">
                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm md:text-base text-gray-900">Service Providers:</strong>
                      <span className="text-xs sm:text-sm md:text-base text-gray-700"> Third-party vendors who assist with payment processing, shipping, and technical services</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-indigo-500 rounded-full flex items-center justify-center mt-0.5 sm:mt-1 shrink-0">
                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm md:text-base text-gray-900">Legal Requirements:</strong>
                      <span className="text-xs sm:text-sm md:text-base text-gray-700"> When required by law, court order, or government regulations</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-indigo-500 rounded-full flex items-center justify-center mt-0.5 sm:mt-1 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <strong className="text-gray-900">Business Transfers:</strong>
                      <span className="text-gray-700"> In case of merger, acquisition, or sale of our business assets</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <strong className="text-gray-900">Consent:</strong>
                      <span className="text-gray-700"> With your explicit consent for specific purposes</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-white rounded-lg p-4 border-2 border-red-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <strong className="text-red-700">We do not sell your personal information to third parties for marketing purposes.</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Your Rights</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Access</h4>
                  <p className="text-gray-700 text-sm">Request copies of your personal data</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Correction</h4>
                  <p className="text-gray-700 text-sm">Update or correct inaccurate information</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-red-200">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Deletion</h4>
                  <p className="text-gray-700 text-sm">Request deletion of your personal data</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Portability</h4>
                  <p className="text-gray-700 text-sm">Request transfer of your data</p>
                </div>
              </div>
            </section>

            {/* Additional Sections */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Data Security */}
              <section className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-red-200">
                  <p className="text-gray-700 mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Encryption of sensitive data during transmission</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Secure storage systems with access controls</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Regular security assessments and updates</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Employee training on data protection practices</li>
                  </ul>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Cookies & Tracking</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-yellow-200">
                  <p className="text-gray-700">
                    We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences. You can manage cookie settings through your browser preferences.
                  </p>
                </div>
              </section>
            </div>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-6 md:p-8 border border-gray-200">
              <div className="text-center mb-3 sm:mb-6 md:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 text-white" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Contact Us</h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 px-1 sm:px-2">If you have questions about this Privacy Policy or want to exercise your rights, contact us:</p>
              </div>
              
              <div className="grid gap-3 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg">
                  <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Grievance Officer</h3>
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Name:</span> <span className="break-words text-xs sm:text-sm">{businessName}</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Role:</span> <span className="text-xs sm:text-sm">Proprietor</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Email:</span> <span className="break-words text-xs sm:text-sm">support@{hostname}</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Phone:</span> <span className="break-words text-xs sm:text-sm">{envConfig.get('REACT_APP_MO') || 'Contact us for phone number'}</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Hours:</span> <span className="text-xs sm:text-sm">Monday - Friday (9:00 AM - 6:00 PM)</span></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg">
                  <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">General Contact</h3>
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Email:</span> <span className="break-words text-xs sm:text-sm">privacy@{hostname}</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Address:</span> <span className="break-words text-xs sm:text-sm">{envConfig.get('REACT_APP_ADDRESS') || 'Contact us for address details'}</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Business:</span> <span className="break-words text-xs sm:text-sm">{businessName}</span></div>
                    <div className="flex items-start"><span className="font-medium w-12 sm:w-16 md:w-20 flex-shrink-0 text-xs sm:text-sm">Response:</span> <span className="text-xs sm:text-sm">Within 48 hours</span></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
});

PrivacyPolicyTailwind.displayName = 'PrivacyPolicyTailwind';

export default PrivacyPolicyTailwind;
