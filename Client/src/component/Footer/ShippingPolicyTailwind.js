/**
 * React Core and Hooks Imports
 */
import React, { useState } from 'react';

/**
 * Heroicons Icon Components for UI Elements
 */
import { 
  TruckIcon, 
  ClockIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * Dynamic Theme Color Utility
 */
import { getPrimaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * Shipping Policy Page Component - Comprehensive Delivery Information
 * 
 * Professional shipping policy page featuring:
 * - Complete delivery coverage information across India
 * - Multiple shipping options with detailed descriptions
 * - Interactive delivery process visualization
 * - Transparent shipping charges and pricing
 * - FAQ section for shipping-related inquiries
 * - Contact information for shipping support
 * - Responsive design with modern UI elements
 * - Dynamic theme color integration
 * 
 * Key Features:
 * - Pan-India delivery coverage with extensive pin code reach
 * - Multiple delivery options (Standard, Express, Same Day)
 * - Interactive shipping zone selection with detailed information
 * - Step-by-step delivery process visualization
 * - Clear pricing structure with free shipping thresholds
 * - Comprehensive FAQ section with accordion functionality
 * - Professional contact section for shipping support
 * - Mobile-optimized responsive design
 * 
 * Delivery Options:
 * - Standard Delivery: 3-7 business days, nationwide coverage
 * - Express Delivery: 1-3 business days, major cities
 * - Same Day Delivery: Within 24 hours, select locations
 * 
 * Content Sections:
 * - Hero: Page introduction with shipping focus
 * - Coverage: Pan-India delivery information
 * - Options: Interactive delivery method selection
 * - Process: Step-by-step delivery journey visualization
 * - Charges: Transparent pricing with free shipping details
 * - FAQ: Common shipping questions and answers
 * - Contact: Support information for shipping inquiries
 * 
 * Interactive Features:
 * - Clickable shipping zone cards with active states
 * - Accordion-style FAQ items with expand/collapse
 * - Hover effects on interactive elements
 * - Responsive touch-friendly design
 * - Smooth transitions and animations
 * 
 * State Management:
 * - activeZone: Tracks selected shipping option
 * - openFAQ: Controls expanded FAQ item
 */

const ShippingPolicyTailwind = () => {
  /**
   * State Management for Interactive Elements
   * 
   * - activeZone: Tracks which shipping zone/option is currently selected (0-2)
   * - openFAQ: Controls which FAQ item is currently expanded (null = all closed)
   */
  const [activeZone, setActiveZone] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);

  /**
   * Website Information
   * 
   * - hostname: Current website domain for contact references
   */
  const hostname = window.location.hostname;

  /**
   * Dynamic Theme Color
   * 
   * Retrieves primary theme color for consistent branding:
   * - primaryColor: Main brand color for headers and primary elements
   */
  const primaryColor = getPrimaryThemeColor();

  /**
   * Shipping Zones Data Structure
   * 
   * Defines available delivery options with comprehensive details:
   * - title: Delivery service name
   * - icon: React icon component for visual representation
   * - time: Expected delivery timeframe
   * - coverage: Geographic coverage area
   * - cost: Pricing information
   * - description: Detailed service explanation
   * - features: List of included benefits and services
   */
  const shippingZones = [
    {
      title: "Standard Delivery",
      icon: <TruckIcon className="w-8 h-8" />,
      time: "3-7 Business Days",
      coverage: "All over India",
      cost: "Free above ₹499",
      description: "Our standard delivery service covers all major cities and towns across India with reliable courier partners.",
      features: ["Real-time tracking", "SMS & Email updates", "Secure packaging", "Insurance covered"]
    },
    {
      title: "Express Delivery", 
      icon: <ClockIcon className="w-8 h-8" />,
      time: "1-3 Business Days",
      coverage: "Major cities",
      cost: "₹99 - ₹199",
      description: "Fast delivery service available in metro cities and major urban areas for urgent orders.",
      features: ["Priority processing", "Faster transit", "Premium tracking", "Emergency support"]
    },
    {
      title: "Same Day Delivery",
      icon: <MapPinIcon className="w-8 h-8" />,
      time: "Within 24 hours",
      coverage: "Select locations",
      cost: "₹149 - ₹299",
      description: "Ultra-fast delivery service available in select metropolitan areas for immediate needs.",
      features: ["Same day dispatch", "Live tracking", "Premium packaging", "Dedicated support"]
    }
  ];

  /**
   * Delivery Process Steps
   * 
   * Step-by-step breakdown of order fulfillment:
   * - step: Sequential step number
   * - title: Process stage name
   * - description: Detailed explanation of the step
   * - time: Expected duration for this step
   */
  const deliverySteps = [
    {
      step: "1",
      title: "Order Processing",
      description: "Orders are verified and prepared for shipment within 1-2 business days",
      time: "1-2 days"
    },
    {
      step: "2", 
      title: "Packaging & Dispatch",
      description: "Items are securely packaged and handed over to our delivery partners",
      time: "Same day"
    },
    {
      step: "3",
      title: "In Transit",
      description: "Your order is on its way to you with real-time tracking updates",
      time: "1-5 days"
    },
    {
      step: "4",
      title: "Delivered",
      description: "Your order arrives at your doorstep with confirmation",
      time: "Final step"
    }
  ];

  /**
   * Shipping FAQ Data
   * 
   * Common customer questions about shipping:
   * - question: Customer inquiry
   * - answer: Comprehensive response with relevant details
   */
  const shippingFAQs = [
    {
      question: "What are your shipping charges?",
      answer: "We offer free shipping on orders above ₹499. For orders below ₹499, standard shipping charges of ₹49 apply. Express delivery charges vary based on location and urgency."
    },
    {
      question: "Do you deliver internationally?",
      answer: "Currently, we only deliver within India. We are working on expanding our services to international markets in the near future."
    },
    {
      question: "Can I change my delivery address after placing an order?",
      answer: "You can change your delivery address within 2 hours of placing the order. After that, please contact our customer support team for assistance."
    },
    {
      question: "What if I'm not available during delivery?",
      answer: "Our delivery partners will attempt delivery 2-3 times. If unsuccessful, the package will be held at the local facility for 7 days before being returned to us."
    },
    {
      question: "Do you provide delivery tracking?",
      answer: "Yes, once your order is shipped, you'll receive a tracking number via SMS and email. You can track your order in real-time through our website or the courier partner's portal."
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative text-white py-8 sm:py-12 md:py-20" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-full mb-3 sm:mb-4 md:mb-6">
            <TruckIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in">
            Shipping Policy
          </h1>
          <p className="text-sm sm:text-lg md:text-xl opacity-90 max-w-3xl mx-auto px-2">
            We aim to provide efficient delivery services across India with reliable shipping partners
          </p>
          <div className="mt-3 sm:mt-4 md:mt-6 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 bg-white/20 rounded-full text-xs sm:text-sm font-semibold">
            <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Last updated: January 12, 2023
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        {/* Delivery Coverage */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Delivery Coverage</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              At <strong>{hostname}</strong>, we provide nationwide shipping services across India. We partner with reliable courier services to ensure your orders reach you safely and on time.
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="p-2 sm:p-3 md:p-4 bg-gray-50 rounded-full">
                <GlobeAltIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Pan-India Delivery</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto px-2">
                We deliver to over 25,000+ pin codes across India, covering all major cities, towns, and rural areas. Our extensive delivery network ensures that no matter where you are, your order will reach you safely.
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Zones */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Delivery Options</h2>
            <p className="text-gray-600">Choose the delivery option that best suits your needs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {shippingZones.map((zone, index) => (
              <div 
                key={index}
                className={`bg-white rounded-3xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  activeZone === index 
                    ? 'border-blue-500 shadow-blue-500/20' 
                    : 'border-gray-100 hover:border-blue-300'
                }`}
                onClick={() => setActiveZone(index)}
              >
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 ${
                    activeZone === index 
                      ? 'text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`} style={{ backgroundColor: activeZone === index ? primaryColor : undefined }}>
                    {zone.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{zone.title}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <ClockIcon className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-gray-800">{zone.time}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-gray-800">{zone.coverage}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CurrencyRupeeIcon className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-gray-800">{zone.cost}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                    {zone.description}
                  </p>

                  <div className="space-y-2">
                    {zone.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Process */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How Delivery Works</h2>
            <p className="text-gray-600">Your order journey from our warehouse to your doorstep</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gray-200">
                <div className="h-full w-full bg-gray-50"></div>
              </div>

              <div className="grid lg:grid-cols-4 gap-8">
                {deliverySteps.map((step, index) => (
                  <div key={index} className="text-center relative">
                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center w-12 h-12 font-bold text-lg rounded-full mb-6 relative z-10 text-white" style={{ backgroundColor: primaryColor }}>
                      {step.step}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>
                    
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {step.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Charges */}
        <div className="mb-16">
          <div className="rounded-3xl p-8 text-white" style={{ backgroundColor: primaryColor }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <CurrencyRupeeIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Shipping Charges</h2>
              <p className="text-xl opacity-90">Transparent pricing with no hidden costs</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4">Free Shipping</h3>
                <div className="text-3xl font-bold mb-2">₹0</div>
                <p className="opacity-90 mb-4">On orders above ₹499</p>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Standard delivery (3-7 days)</li>
                  <li>• All over India</li>
                  <li>• Tracking included</li>
                  <li>• Insurance covered</li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4">Standard Shipping</h3>
                <div className="text-3xl font-bold mb-2">₹49</div>
                <p className="opacity-90 mb-4">On orders below ₹499</p>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Standard delivery (3-7 days)</li>
                  <li>• All over India</li>
                  <li>• Tracking included</li>
                  <li>• Secure packaging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping FAQs */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Shipping FAQs</h2>
            <p className="text-gray-600">Common questions about our shipping and delivery services</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {shippingFAQs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
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
                  <div className="px-8 pb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-white" style={{ backgroundColor: primaryColor }}>
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help with Your Order?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our customer support team is here to assist you with any shipping-related questions or concerns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="/contact-us"
                className="inline-flex items-center justify-center px-8 py-3 font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Contact Support
              </a>
              <a
                href="/order-tracking"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <TruckIcon className="w-5 h-5 mr-2" />
                Track Order
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <span>Customer Support: Available 24/7</span>
              </div>
              <div className="flex items-center justify-center">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                <span>Email: shipping@{hostname}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyTailwind;
