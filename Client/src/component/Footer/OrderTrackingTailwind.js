import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
import { getPrimaryThemeColor, getSecondaryThemeColor } from "../../utils/themeColorsSimple";

/**
 * OrderTrackingTailwind Component
 * 
 * A comprehensive order tracking system that allows customers to search for and monitor
 * their order status using phone number or email address along with order ID.
 * Provides real-time order progress visualization and customer service integration.
 * 
 * Key Features:
 * - Dual search methods: Phone number or email-based order lookup
 * - Real-time order status tracking with visual progress indicators
 * - Comprehensive order information display (items, amounts, dates)
 * - Interactive step-by-step delivery progress visualization
 * - Error handling with user-friendly validation messages
 * - Responsive design optimized for all devices
 * - Customer support integration for assistance
 * - Professional UI with dynamic theming
 * 
 * Search Functionality:
 * - Phone Number Search: 10-digit phone number validation
 * - Email Search: Email format validation with @ symbol requirement
 * - Order ID Search: Minimum 6-character order ID validation
 * - Form validation with real-time error feedback
 * - Loading states during search operations
 * 
 * Order Display Features:
 * - Order information summary (date, amount, delivery estimate)
 * - Contact information verification
 * - Visual progress tracking with 4-step delivery process
 * - Animated progress indicators with color-coded states
 * - Current step highlighting with pulse animation
 * - Back navigation to search for additional orders
 * 
 * Customer Experience:
 * - Professional appearance builds trust and reliability
 * - Clear search instructions reduce user confusion
 * - Visual progress tracking provides transparency
 * - Multiple contact methods for customer support
 * - Help documentation and FAQ integration
 * 
 * @returns {JSX.Element} Interactive order tracking interface with search and display functionality
 */
const OrderTrackingTailwind = React.memo(() => {
  /**
   * Search State Management
   * 
   * - searchMethod: Determines search approach ('phone' or 'email')
   * - phoneNumber: Customer's phone number for order lookup
   * - email: Customer's email address for order lookup
   * - orderId: Order identification number for verification
   */
  const [searchMethod, setSearchMethod] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');

  /**
   * Operation State Management
   * 
   * - isSearching: Controls loading state during order lookup
   * - orderDetails: Stores retrieved order information
   * - error: Manages validation and search error messages
   */
  const [isSearching, setIsSearching] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  /**
   * Navigation Hook
   * 
   * Provides programmatic navigation for customer support links
   */
  const navigate = useNavigate();

  /**
   * Dynamic Theme Colors
   * 
   * Applies consistent branding throughout the tracking interface:
   * - primaryColor: Main brand color for buttons and primary elements
   * - secondaryColor: Complementary color for variety and visual hierarchy
   */
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  /**
   * Order Search Handler
   * 
   * Processes order lookup requests with comprehensive validation:
   * - Validates phone number format (10 digits minimum)
   * - Validates email format (must contain @ symbol)
   * - Validates order ID format (6 characters minimum)
   * - Simulates API call with loading state management
   * - Generates mock order details for demonstration
   * - Handles errors with user-friendly messages
   * 
   * @param {Event} e - Form submission event
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);

    try {
      // Phone Number Validation
      if (searchMethod === 'phone' && (!phoneNumber || phoneNumber.length < 10)) {
        setError('Please enter a valid 10-digit phone number');
        setIsSearching(false);
        return;
      }
      
      // Email Validation
      if (searchMethod === 'email' && (!email || !email.includes('@'))) {
        setError('Please enter a valid email address');
        setIsSearching(false);
        return;
      }

      // Order ID Validation
      if (!orderId || orderId.length < 6) {
        setError('Please enter a valid order ID');
        setIsSearching(false);
        return;
      }

      // Simulate API Call with Realistic Delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      /**
       * Mock Order Details Generation
       * 
       * Creates realistic order information for demonstration:
       * - orderId: Customer-provided order identifier
       * - status: Current order status (processing, shipped, delivered)
       * - customerPhone/customerEmail: Contact information based on search method
       * - orderDate: Date when order was placed
       * - estimatedDelivery: Expected delivery date (5 days from now)
       * - currentStep: Progress indicator (0-3 for 4-step process)
       * - items: List of ordered products with quantities and prices
       * - totalAmount: Order total including all items
       */
      const mockOrderDetails = {
        orderId: orderId,
        status: 'processing',
        customerPhone: searchMethod === 'phone' ? phoneNumber : undefined,
        customerEmail: searchMethod === 'email' ? email : undefined,
        orderDate: new Date().toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        currentStep: 2,
        items: [
          { name: 'Product 1', quantity: 1, price: '₹999' },
          { name: 'Product 2', quantity: 2, price: '₹1,998' }
        ],
        totalAmount: '₹2,997'
      };

      setOrderDetails(mockOrderDetails);
    } catch (err) {
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Search Reset Handler
   * 
   * Clears all search data and returns to search form:
   * - Resets order details display
   * - Clears phone number and email inputs
   * - Clears order ID input
   * - Resets error messages
   */
  const resetSearch = () => {
    setOrderDetails(null);
    setPhoneNumber('');
    setEmail('');
    setOrderId('');
    setError('');
  };

  /**
   * Order Progress Steps Configuration
   * 
   * Defines the 4-step delivery process with visual indicators:
   * - Order Placed: Initial order confirmation
   * - Payment Confirmed: Payment processing completion
   * - Order Processing: Preparation and packaging phase
   * - Shipped: Order in transit to customer
   * 
   * Each step includes:
   * - title: Step name for customer display
   * - description: Detailed explanation of the step
   * - icon: Heroicon component for visual representation
   * - completed: Boolean indicating if step is finished
   * - active: Boolean indicating if step is currently in progress
   */
  const orderSteps = [
    {
      title: "Order Placed",
      description: "Your order has been successfully placed",
      icon: <CheckCircleIcon className="w-6 h-6" />,
      completed: true
    },
    {
      title: "Payment Confirmed", 
      description: "Payment confirmation is complete",
      icon: <CheckCircleIcon className="w-6 h-6" />,
      completed: true
    },
    {
      title: "Order Processing",
      description: "We're preparing your order for shipment",
      icon: <ClockIcon className="w-6 h-6" />,
      completed: false,
      active: true
    },
    {
      title: "Shipped",
      description: "Your order is on its way to you",
      icon: <TruckIcon className="w-6 h-6" />,
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {!orderDetails ? (
        // Search Form Section
        <>
          {/* Hero Section */}
          <div className="relative text-white py-20" style={{ backgroundColor: primaryColor }}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Track Your Order
              </h1>
              <p className="text-xl opacity-90 mb-2">
                Enter your details to get real-time order updates
              </p>
              <p className="text-lg opacity-80">
                We'll show you exactly where your order is
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Find Your Order
              </h2>
              
              {/* Search Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to search?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSearchMethod('phone')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      searchMethod === 'phone'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <PhoneIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Phone Number</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMethod('email')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      searchMethod === 'email'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <EnvelopeIcon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Email Address</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                {/* Contact Information Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {searchMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                  </label>
                  {searchMethod === 'phone' ? (
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your 10-digit phone number"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Order ID Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your order ID (e.g., #ORD123456)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      <span>Track My Order</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-700 text-sm">
                    <p className="font-medium mb-1">Need help finding your order?</p>
                    <p>Your order ID was sent to you via email or SMS when you placed your order. It usually starts with #ORD followed by numbers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Help */}
            <div className="text-center mt-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Can't find your order?</h4>
                <p className="text-gray-600 mb-4">
                  Our customer support team is here to help you track your order.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/contact-us')}
                    className="inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg hover:shadow-lg transition-colors duration-300 text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => navigate('/faqs')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  >
                    View FAQs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Order Details Section
        <>
          {/* Header with Back Button */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <button
                onClick={resetSearch}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Search Another Order
              </button>
            </div>
          </div>

          {/* Order Found Header */}
          <div className="relative text-white py-16" style={{ backgroundColor: secondaryColor }}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Order Found!
              </h1>
              <p className="text-xl opacity-90 mb-2">
                Here are the details for your order
              </p>
              <p className="text-lg opacity-80">
                Order ID: #{orderDetails.orderId}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="max-w-4xl mx-auto px-4 py-16">
            {/* Order Info Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">{orderDetails.orderDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg">{orderDetails.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Delivery:</span>
                      <span className="font-medium">{orderDetails.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {orderDetails.customerPhone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <span>{orderDetails.customerPhone}</span>
                      </div>
                    )}
                    {orderDetails.customerEmail && (
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span>{orderDetails.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Progress Tracking */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Order Progress</h3>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                <div 
                  className="absolute left-8 top-8 w-0.5 bg-gray-50 transition-all duration-1000"
                  style={{ height: `${(orderDetails.currentStep / (orderSteps.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                <div className="space-y-8">
                  {orderSteps.map((step, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* Step Icon */}
                      <div className={`
                        relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500
                        ${index < orderDetails.currentStep
                          ? 'bg-green-500 border-green-500 text-white' 
                          : index === orderDetails.currentStep
                            ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                            : 'bg-gray-200 border-gray-200 text-gray-400'
                        }
                      `}>
                        {step.icon}
                      </div>

                      {/* Step Content */}
                      <div className="ml-6 flex-1">
                        <h4 className={`
                          text-lg font-semibold transition-colors duration-300
                          ${index <= orderDetails.currentStep ? 'text-gray-800' : 'text-gray-400'}
                        `}>
                          {step.title}
                        </h4>
                        <p className={`
                          text-sm transition-colors duration-300
                          ${index <= orderDetails.currentStep ? 'text-gray-600' : 'text-gray-400'}
                        `}>
                          {step.description}
                        </p>
                        {index === orderDetails.currentStep && (
                          <div className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            In Progress...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="text-center">
              <button
                onClick={resetSearch}
                className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                Track Another Order
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

OrderTrackingTailwind.displayName = 'OrderTrackingTailwind';

export default OrderTrackingTailwind;
