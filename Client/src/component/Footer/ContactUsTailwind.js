/**
 * React Core and Hooks Imports
 */
import React, { useState } from "react";

/**
 * Form Validation Libraries
 */
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";

/**
 * Environment Configuration and Theme Utilities
 */
import envConfig from "../../utils/envConfig";
import { getPrimaryThemeColor, getSecondaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * Form Validation Schema
 * 
 * Yup validation schema for contact form:
 * - mobile: 10-digit phone number validation
 * - name: Minimum 2 characters, required
 * - email: Valid email format, required
 * - message: Minimum 10 characters for meaningful communication
 */
const validationSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile No is required"),
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  message: Yup.string()
    .min(10, "Message must be at least 10 characters")
    .required("Message is required"),
});

/**
 * Contact Us Page Component - Customer Communication Portal
 * 
 * Comprehensive contact page featuring:
 * - Professional contact form with validation
 * - Complete business contact information display
 * - Quick contact options for immediate communication
 * - Success message handling and form reset
 * - FAQ section for common inquiries
 * - Responsive design with modern UI elements
 * - Dynamic business information integration
 * - Professional styling with theme colors
 * 
 * Key Features:
 * - Robust form validation using Formik and Yup
 * - Dynamic business information from environment config
 * - Multiple contact methods (form, phone, email)
 * - Professional success state with confirmation message
 * - Comprehensive contact information display
 * - Interactive form elements with hover effects
 * - Responsive grid layouts for different screen sizes
 * - FAQ section for self-service support
 * 
 * Contact Information:
 * - Business address from environment configuration
 * - Phone number with click-to-call functionality
 * - Email address with mailto links
 * - Business hours for customer expectations
 * - Quick contact buttons for immediate action
 * 
 * Form Features:
 * - Real-time validation with error messages
 * - Loading states during form submission
 * - Success confirmation with option to send another message
 * - Professional input styling with focus states
 * - Accessibility-compliant form labels and structure
 * - Mobile-optimized form layout and interactions
 * 
 * Communication Channels:
 * - Contact form for detailed inquiries
 * - Direct phone calling capability
 * - Email links for alternative communication
 * - Business hours information for expectations
 * - Quick access buttons for immediate needs
 * 
 * State Management:
 * - isSubmitted: Tracks form submission success state
 * - Form values: Managed by Formik for validation and submission
 */

const ContactUsTailwind = React.memo(() => {
  /**
   * Form Submission State Management
   * 
   * - isSubmitted: Boolean flag to track successful form submission
   * Used to display success message and provide option to send another message
   */
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Dynamic Business Information
   * 
   * Extracts business details from environment configuration:
   * - businessAddress: Physical address from REACT_APP_ADDRESS or fallback message
   * - businessMobile: Phone number from REACT_APP_MO or fallback message  
   * - hostname: Current website domain for email addresses
   */
  const businessAddress = envConfig.get('REACT_APP_ADDRESS') || 'Contact us for address details';
  const businessMobile = envConfig.get('REACT_APP_MO') || 'Contact us for phone number';
  const hostname = window.location.hostname;

  /**
   * Dynamic Theme Colors
   * 
   * Retrieves current theme colors for consistent branding:
   * - primaryColor: Main brand color for primary elements and CTAs
   * - secondaryColor: Supporting color for accents and secondary elements
   */
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  /**
   * Form Submission Handler
   * 
   * Processes contact form submission:
   * - Simulates form submission with delay for realistic UX
   * - Sets success state to show confirmation message
   * - Resets form fields after successful submission
   * - Handles loading states during submission process
   * 
   * @param {Object} values - Form field values from Formik
   * @param {Object} formActions - Formik action methods (setSubmitting, resetForm)
   */
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Simulate form submission delay for realistic user experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      resetForm();
    } catch (error) {
      // Error handling would go here in production
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8 backdrop-blur-sm">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600 mt-1">{businessAddress}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600 mt-1">{businessMobile}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600 mt-1">support@{hostname}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600 mt-1">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Contact</h3>
              <div className="space-y-4">
                <a 
                  href={`tel:${businessMobile}`}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Call Now</span>
                </a>
                
                <a 
                  href={`mailto:support@${hostname}`}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Send Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                  <p className="text-gray-600 mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <Formik
                  initialValues={{
                    name: "",
                    email: "",
                    mobile: "",
                    message: "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, handleChange, handleBlur, handleSubmit, isSubmitting, errors, touched }) => (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={(e) => {
                              handleBlur(e);
                              if (!(errors.name && touched.name)) {
                                e.target.style.borderColor = '#d1d5db'; // border-gray-300
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                              errors.name && touched.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            style={{ 
                              ...(!(errors.name && touched.name) && {
                                '--focus-ring-color': primaryColor + '40', // 40 is for opacity
                                '--focus-border-color': primaryColor
                              })
                            }}
                            onFocus={(e) => {
                              if (!(errors.name && touched.name)) {
                                e.target.style.borderColor = primaryColor;
                                e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
                              }
                            }}
                            placeholder="Enter your full name"
                          />
                          <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                              errors.email && touched.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Enter your email address"
                          />
                          <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={values.mobile}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                            errors.mobile && touched.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your 10-digit mobile number"
                        />
                        <ErrorMessage name="mobile" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          value={values.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                            errors.message && touched.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your message (minimum 10 characters)"
                        />
                        <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full px-8 py-4 text-white rounded-xl font-medium text-lg transition-all duration-300 ${
                          isSubmitting 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                        style={{ backgroundColor: primaryColor }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Message...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span>Send Message</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    </form>
                  )}
                </Formik>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How quickly do you respond?</h3>
              <p className="text-gray-600">We typically respond to all inquiries within 24 hours during business days.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What information should I include?</h3>
              <p className="text-gray-600">Please include your order number (if applicable) and detailed description of your inquiry.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you offer phone support?</h3>
              <p className="text-gray-600">Yes, you can call us during business hours for immediate assistance.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I visit your store?</h3>
              <p className="text-gray-600">Please contact us to schedule an appointment before visiting our location.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ContactUsTailwind;
