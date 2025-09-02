/**
 * React Core and Hooks Imports
 */
import React, { useState } from 'react';

/**
 * Heroicons Icon Components for UI Elements
 */
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { 
  TruckIcon, 
  ArrowPathIcon, 
  XMarkIcon, 
  CreditCardIcon, 
  ScaleIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/solid';

/**
 * Dynamic Theme Color Utilities
 */
import { getPrimaryThemeColor, getSecondaryThemeColor } from '../../utils/themeColorsSimple';

/**
 * FAQ Page Component - Frequently Asked Questions and Customer Support
 * 
 * Comprehensive customer support page featuring:
 * - Categorized FAQ sections for easy navigation
 * - Interactive accordion-style question and answer display
 * - Newsletter subscription functionality
 * - Direct contact support options
 * - Responsive design with modern UI elements
 * - Dynamic theme color integration
 * - Professional styling with hover effects
 * - Mobile-optimized layout and interactions
 * 
 * Key Features:
 * - Visual category organization with icons and descriptions
 * - Expandable FAQ items with smooth animations
 * - Newsletter subscription form with validation
 * - Multiple contact methods for customer support
 * - Professional hero section with clear messaging
 * - Responsive grid layouts for different screen sizes
 * - Interactive elements with hover effects and transitions
 * - Brand-consistent color scheme throughout
 * 
 * Content Sections:
 * - Hero: Page introduction and purpose statement
 * - Categories: Visual FAQ category navigation with icons
 * - FAQ: Interactive question and answer accordion
 * - Newsletter: Email subscription for updates and deals
 * - Support: Direct contact options for additional help
 * 
 * FAQ Categories:
 * - Shipping, Order Tracking & Delivery: Logistics and fulfillment
 * - Return and Exchange: Product return policies and procedures
 * - Cancellation and Modification: Order change and cancellation
 * - Payments: Payment methods, security, and billing
 * - Sizing Help: Size guides and fitting assistance
 * 
 * Interactive Features:
 * - Accordion-style FAQ items with expand/collapse functionality
 * - Newsletter subscription form with email validation
 * - Hover effects on category cards and buttons
 * - Smooth transitions and animations throughout
 * - Responsive touch-friendly interactions
 * 
 * Customer Support:
 * - Common questions with detailed answers
 * - Category-based organization for quick navigation
 * - Direct contact options for complex inquiries
 * - Email support integration
 * - Professional customer service messaging
 * 
 * State Management:
 * - openFAQ: Tracks currently expanded FAQ item
 * - email: Manages newsletter subscription email input
 */

const FAQTailwind = React.memo(() => {
  /**
   * State Management for Interactive Elements
   * 
   * - openFAQ: Controls which FAQ item is currently expanded (null = all closed)
   * - email: Manages newsletter subscription email input value
   */
  const [openFAQ, setOpenFAQ] = useState(null);
  const [email, setEmail] = useState('');

  /**
   * Dynamic Theme Colors
   * 
   * Retrieves current theme colors for consistent branding:
   * - primaryColor: Main brand color for headers and primary elements
   * - secondaryColor: Supporting color for accents and secondary elements
   */
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  /**
   * FAQ Toggle Handler
   * 
   * Manages accordion functionality for FAQ items:
   * - If clicking the same FAQ that's open, close it (set to null)
   * - If clicking a different FAQ, open that one (set to its index)
   * 
   * @param {number} index - Index of the FAQ item to toggle
   */
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  /**
   * Newsletter Subscription Handler
   * 
   * Processes newsletter subscription form submission:
   * - Prevents default form submission
   * - Handles newsletter subscription logic (placeholder)
   * - Clears email input field
   * - Shows confirmation message to user
   * 
   * @param {Event} e - Form submission event
   */
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    
    setEmail('');
    alert('Thank you for subscribing to our newsletter!');
  };

  /**
   * FAQ Categories Data Structure
   * 
   * Defines visual categories for FAQ organization:
   * - icon: React component for category representation
   * - title: Category name and description
   * - description: Explanatory text for category content
   */
  const faqCategories = [
    {
      icon: <TruckIcon className="w-8 h-8 sm:w-12 sm:h-12" style={{ color: secondaryColor }} />,
      title: "Shipping, Order Tracking & Delivery",
      description: "Everything about shipping times, tracking orders, and delivery information"
    },
    {
      icon: <ArrowPathIcon className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />,
      title: "Return And Exchange",
      description: "Learn about our return policy and how to exchange items"
    },
    {
      icon: <XMarkIcon className="w-8 h-8 sm:w-12 sm:h-12 text-red-500" />,
      title: "Cancellation And Modification",
      description: "How to cancel or modify your orders before shipment"
    },
    {
      icon: <CreditCardIcon className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500" />,
      title: "Payments",
      description: "Payment methods, security, and billing information"
    },
    {
      icon: <ScaleIcon className="w-8 h-8 sm:w-12 sm:h-12 text-orange-500" />,
      title: "Sizing Help",
      description: "Find the perfect fit with our sizing guides and charts"
    }
  ];

  /**
   * Frequently Asked Questions Data
   * 
   * Common customer questions with detailed answers:
   * - question: Customer inquiry text
   * - answer: Comprehensive response with relevant information
   * Covers shipping, tracking, returns, payments, and sizing
   */
  const frequentQuestions = [
    {
      question: "What are your shipping charges?",
      answer: "We offer free shipping on orders above ₹499. For orders below ₹499, shipping charges of ₹49 apply. Express delivery options are available in select cities."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track your order in the 'My Orders' section of your account."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 7 days of delivery. Items must be unused, in original packaging, and with all tags attached. Refunds are processed within 5-7 business days."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Orders can be modified or cancelled within 2 hours of placement. After that, please contact our customer support team for assistance."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, net banking through Cashfree payment gateway, and digital wallets. We also offer Cash on Delivery for eligible orders."
    },
    {
      question: "How do I choose the right size?",
      answer: "Each product page includes a detailed size chart. You can also refer to our comprehensive sizing guide or contact our support team for personalized assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero Section */}
      <div className="relative text-white py-20" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Frequently Asked Questions
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more
          </p>
        </div>
      </div>

      {/* FAQ Categories Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Browse by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a category below to find relevant information quickly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {faqCategories.map((category, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-blue-500 transition-all duration-300">
                  <div className="group-hover:text-white transition-colors duration-300">
                    {category.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 leading-tight">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Most Asked Questions</h2>
            <p className="text-gray-600">Quick answers to our most common inquiries</p>
          </div>

          <div className="space-y-4">
            {frequentQuestions.map((faq, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 py-5 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="rounded-3xl p-12 text-center text-white" style={{ backgroundColor: secondaryColor }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full">
                <EnvelopeIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="text-xl opacity-90 mb-8">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-6 py-4 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50"
                  style={{ color: secondaryColor }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our customer support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact-us"
                className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
              >
                Contact Support
              </a>
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center justify-center px-8 py-3 border-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = primaryColor;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = primaryColor;
                }}
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FAQTailwind.displayName = 'FAQTailwind';

export default FAQTailwind;
