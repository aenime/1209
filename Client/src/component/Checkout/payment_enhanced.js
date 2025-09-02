/**
 * React Core and Navigation Imports
 */
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Context Hooks
 */
import { useCart } from "../../contexts/CartContext";
import { useUI } from "../../contexts/UIContext";
import { useOffer } from "../../contexts/OfferContext";

/**
 * Environment Configuration
 */
import { getOfferUrlSuffix } from "../../utils/envConfig";

/**
 * Payment Method Components
 */

/**
 * Services
 */

/**
 * Assets
 */
import safePaymentIcon from "../../assets/image/safe-payment-icon.svg";

/**
 * Enhanced Payment Component - Complete E-Commerce Payment System
 * 
 * Comprehensive payment interface featuring:
 * - Multiple payment methods (UPI, QR Code, Cash on Delivery)
 * - Offer-aware pricing with dynamic calculations
 * - Real-time payment processing status
 * - Session timeout management with countdown timers
 * - Payment security indicators and trust badges
 * - Dynamic payment method availability based on offers
 * - Error handling and retry mechanisms
 * - Mobile-optimized payment flows
 * 
 * Key Features:
 * - Automatic payment amount calculation from cart
 * - Buy 2 Get 1 Free offer integration
 * - Payment method filtering based on offer eligibility
 * - Real-time countdown timers for session management
 * - Payment status tracking with visual feedback
 * - Error handling with user-friendly messages
 * - Secure payment processing with validation
 * - Responsive design for all devices
 * 
 * Payment Flow:
 * 1. Initialize payment amount from checkout
 * 2. Calculate final pricing with offers applied
 * 3. Display available payment methods
 * 4. Process payment through selected method
 * 5. Handle payment confirmation and redirection
 * 6. Manage session timeouts and errors
 */
const PaymentEnhanced = () => {
  /**
   * Context Data and State Management
   */
  const {
    totalPrice,
    setTotalPrice,
    totalExtraDiscount
  } = useCart();
  
  const {
    isPaymentPageLoading,
    address,
    unlockCart
  } = useUI();
  
  const { isEligibleForOffers, isCodAvailable, isLoading } = useOffer();
  
  /**
   * Navigation Hook
   */
  const navigate = useNavigate();

  /**
   * Payment Method and UI State
   * 
   * Manages payment interface state:
   * - selectedPayment: Currently selected payment method (COD)
   * - Payment processing states and error handling
   * - Timer states for session management
   */
  const [selectedPayment, setSelectedPayment] = useState("online");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes session timeout
  const [paymentError, setPaymentError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  /**
   * Payment Amount State Management
   * 
   * Tracks payment calculations:
   * - finalAmount: Final payment amount after all discounts
   * - calculatedMRP: Maximum Retail Price before discounts
   * - calculatedDiscount: Total discount amount applied
   * 
   * These values are calculated from cart data and offer eligibility
   */
  const [finalAmount, setFinalAmount] = useState(0);
  const [calculatedMRP, setCalculatedMRP] = useState(0);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);

  /**
   * Payment Initialization Effect
   * 
   * Initializes payment amount from checkout page:
   * - Retrieves payment data from localStorage
   * - Cleans up conflicting data to prevent confusion
   * - Sets up initial payment state
   * - Prepares payment interface for user interaction
   */
  // 🔥 ENHANCED: Single Source of Truth for Payment Amounts
  const synchronizePaymentAmounts = useCallback((amount) => {
    console.log(`💰 SYNCHRONIZING all payment amounts to: ₹${amount}`);
    
    // Update all storage locations with the same amount
    localStorage.setItem("paymentAmount", amount.toString());
    localStorage.setItem("cartTotalPrice", amount.toString());
    
    // Update AuthContext
    setTotalPrice(amount);
    
    // Update component state
    setFinalAmount(amount);
    setCalculatedMRP(amount);
    setCalculatedDiscount(0);
    
    console.log("✅ Payment amount synchronization completed");
    return amount;
  }, [setTotalPrice]);

  useEffect(() => {
    console.log("🔄 Starting payment amount initialization...");
    
    // Clean conflicting keys to prevent data pollution
    const conflictingKeys = ['totalPrice'];
    conflictingKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        localStorage.removeItem(key);
        console.log(`🧹 Removed conflicting key: ${key}`);
      }
    });
    
    // Method 1: Calculate real amount from cart products (most reliable)
    let realAmount = 0;
    try {
      const cartProducts = JSON.parse(localStorage.getItem('cartProducts') || '[]');
      if (cartProducts.length > 0) {
        realAmount = cartProducts.reduce((total, product) => {
          const price = product.salePrice || product.discount || product.price || 0;
          const quantity = product.quantity || 1;
          return total + (price * quantity);
        }, 0);
        console.log(`💰 Calculated real amount from cart products: ₹${realAmount}`);
      }
    } catch (error) {
      console.warn("⚠️ Could not calculate from cart products:", error);
    }
    
    // Method 2: Use stored payment amounts as fallback
    if (realAmount === 0) {
      const paymentAmount = parseFloat(localStorage.getItem("paymentAmount") || 0);
      const cartTotalPrice = parseFloat(localStorage.getItem("cartTotalPrice") || 0);
      const contextAmount = typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0;
      
      realAmount = Math.max(paymentAmount, cartTotalPrice, contextAmount);
      console.log(`💰 Using fallback amount: ₹${realAmount}`);
    }
    
    // Validate final amount
    if (realAmount > 0) {
      // Synchronize all sources to the real amount
      synchronizePaymentAmounts(realAmount);
      console.log(`✅ Payment initialization completed with amount: ₹${realAmount}`);
    } else {
      console.error("❌ No valid payment amount found - redirecting to cart");
      navigate('/cart');
    }
    
  }, [totalPrice, totalExtraDiscount, isEligibleForOffers, synchronizePaymentAmounts, navigate]);

  // Enhanced COD logic with refresh protection
  const codEnabled = useMemo(() => {
    // During initial load/refresh, be conservative and disable COD if in doubt
    if (isCodAvailable === undefined || isCodAvailable === null) {
      // Check if we're in offer mode by checking URL or other indicators
      const path = window.location.pathname.toLowerCase();
      const offerSuffix = getOfferUrlSuffix?.() || '';
      
      // If offer suffix exists and current URL has it, disable COD
      if (offerSuffix && offerSuffix.trim() !== '') {
        const isOfferUrl = path.includes(offerSuffix.trim()) || 
                          window.location.search.includes(offerSuffix.trim());
        if (isOfferUrl) {
          return false; // Disable COD for offer URLs during refresh
        }
      }
      
      // For non-offer URLs or when no suffix configured, check if eligible for offers
      // If eligible for offers (offer mode), disable COD
      if (isEligibleForOffers) {
        return false;
      }
      
      // Default to false during uncertain state to be safe
      return false;
    }
    
    return isCodAvailable;
  }, [isCodAvailable, isEligibleForOffers]);
  
  // Redirect to cart page if payment amount is 0
  useEffect(() => {
    // Check multiple payment sources to allow any valid payment
    const paymentAmountFromLS = parseFloat(localStorage.getItem("paymentAmount") || 0);
    const cartTotalPriceFromLS = parseFloat(localStorage.getItem("cartTotalPrice") || 0);
    const contextAmount = typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0;
    
    // Check window.cartAmounts
    const windowCartAmount = window.cartAmounts?.totalPrice || 0;
    
    // Use ANY valid payment amount to avoid unnecessary redirection
    const hasValidAmount = paymentAmountFromLS > 0 || 
                          cartTotalPriceFromLS > 0 || 
                          contextAmount > 0 || 
                          windowCartAmount > 0 ||
                          finalAmount > 0;

    if (!hasValidAmount) {
      navigate('/cart');
    }
  }, [navigate, totalPrice, finalAmount]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setPaymentError("Payment session expired. Please try again.");
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate order ID
  const generateOrderID = () => {
    const min = 1000000000;
    const max = 9999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Available payment options based on configuration
  const getAvailablePaymentOptions = useCallback(() => {
    const options = [];
    
    // Always include online payment option
    options.push('online');
    
    if (codEnabled) {
      options.push('cod');
    }
    
    return options;
  }, [codEnabled]);

  // 🔥 ENHANCED: COD Payment with Amount Validation
  const processCODPayment = () => {
    if (!address || !address.mobile) {
      setPaymentError("Please add a delivery address for Cash on Delivery");
      return;
    }

    // Validate final amount before processing
    if (!finalAmount || finalAmount <= 0) {
      setPaymentError("Invalid payment amount. Please refresh and try again.");
      return;
    }

    console.log(`💰 Processing COD payment for validated amount: ₹${finalAmount}`);

    const orderId = generateOrderID();
    localStorage.setItem("orderId", orderId);
    localStorage.setItem("paymentMethod", "COD");
    
    // Use synchronized amount for all storage
    synchronizePaymentAmounts(finalAmount);

    navigate("/ThankYou");
  };

  // 🔥 NEW: Online Payment with Cashfree Integration
  const processOnlinePayment = async () => {
    if (!address || !address.mobile) {
      setPaymentError("Please add a delivery address for online payment");
      return;
    }

    // Validate final amount before processing
    if (!finalAmount || finalAmount <= 0) {
      setPaymentError("Invalid payment amount. Please refresh and try again.");
      return;
    }

    try {
      // Set loading state for instant feedback
      setIsProcessingPayment(true);
      setPaymentError("");
      
      console.log('🚀 Starting Cashfree payment process...');
      
      // Store payment method and amount
      localStorage.setItem("paymentMethod", "online");
      synchronizePaymentAmounts(finalAmount);

      // Create order with enhanced Cashfree API v4
      const orderData = {
        amount: finalAmount,
        order_currency: 'INR',
        order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer: {
          customer_name: `${address.firstName || 'Customer'} ${address.lastName || ''}`.trim(),
          customer_email: address.email || `customer${Date.now()}@example.com`,
          customer_phone: address.mobile || '9999999999',
          customer_id: `CUST_${Date.now()}`
        },
        orderNote: `Payment for e-commerce order - ${finalAmount} INR`,
        cart_details: {
          cart_id: `cart_${Date.now()}`,
          cart_total: finalAmount,
          cart_items: [
            {
              item_id: "item_001",
              item_name: "E-commerce Order",
              item_description: "Complete order from e-commerce store",
              item_price: finalAmount,
              item_quantity: 1,
              item_currency: "INR"
            }
          ]
        },
        order_tags: {
          source: 'web',
          platform: 'react',
          timestamp: new Date().toISOString()
        }
      };

      console.log('📝 Creating order with data:', orderData);

      // Call enhanced backend API to create Cashfree order
      const response = await fetch('/api/payment-enhanced/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('📨 Order creation response:', result);

      if (!response.ok || !result.success) {
        // Handle different types of errors
        let errorMessage = 'Order creation failed';
        
        if (result.error) {
          if (typeof result.error === 'object') {
            errorMessage = result.error.message || result.error.details || JSON.stringify(result.error);
          } else {
            errorMessage = result.error;
          }
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        console.error('❌ Detailed API Error:', result);
        throw new Error(errorMessage);
      }

      const { data: orderResponse } = result;
      
      if (!orderResponse.payment_session_id) {
        throw new Error('Payment session ID not received from server');
      }

      console.log('✅ Order created successfully:', orderResponse.order_id);
      console.log('🔑 Payment Session ID:', orderResponse.payment_session_id);
      console.log('🌍 Environment:', orderResponse.environment);

      // Store order data for cleanup later
      localStorage.setItem('currentOrderData', JSON.stringify(orderResponse));

      // Check if Cashfree SDK is available
      console.log('🔍 Checking Cashfree SDK availability...');
      console.log('window.Cashfree:', typeof window.Cashfree);
      
      if (typeof window.Cashfree === 'undefined') {
        console.error('❌ Cashfree SDK not loaded! Falling back to server redirect.');
      }

      // Try Cashfree SDK first, fallback to server redirect
      if (window.Cashfree && typeof window.Cashfree === 'function') {
        try {
          console.log('🔄 Attempting Cashfree SDK checkout...');
          console.log('📋 Checkout params:', {
            paymentSessionId: orderResponse.payment_session_id.substring(0, 20) + '...',
            mode: orderResponse.environment === 'production' ? 'production' : 'sandbox'
          });
          
          // Correct SDK v4 syntax (function call, not constructor)
          const cashfree = window.Cashfree({
            mode: orderResponse.environment === 'production' ? 'production' : 'sandbox'
          });

          console.log('✅ Cashfree instance created, initiating checkout...');

          // Use the correct checkout method
          await cashfree.checkout({
            paymentSessionId: orderResponse.payment_session_id,
            redirectTarget: "_self"
          });

          console.log('✅ Cashfree SDK checkout initiated successfully');
          return; // SDK handling the flow

        } catch (sdkError) {
          console.error('❌ Cashfree SDK Error Details:', sdkError);
          console.warn('⚠️ SDK failed, falling back to server redirect');
        }
      } else {
        console.warn('⚠️ Cashfree SDK not available, using server redirect');
      }

      // Fallback: Use server-side redirect
      console.log('🔄 Using server-side redirect fallback...');
      console.log('🌐 Redirecting to:', `/api/payment-enhanced/checkout/${orderResponse.order_id}`);
      
      // Try multiple fallback approaches
      try {
        // Method 1: Direct window.location redirect
        console.log('🔄 Attempting Method 1: Direct redirect...');
        window.location.href = `/api/payment-enhanced/checkout/${orderResponse.order_id}`;
      } catch (redirectError) {
        console.error('❌ Direct redirect failed:', redirectError);
        
        // Method 2: Use window.open as fallback
        console.log('🔄 Attempting Method 2: Window.open...');
        window.open(`/api/payment-enhanced/checkout/${orderResponse.order_id}`, '_self');
      }

    } catch (error) {
      console.error('❌ Online payment error:', error);
      setIsProcessingPayment(false);
      setPaymentError(`Payment failed: ${error.message}`);
    }
  };

  // Main payment processing logic
  const handlePay = async () => {
    
    setPaymentError("");
    
    if (selectedPayment === "cod" && (!address || !address.mobile)) {
      setPaymentError("Please add a delivery address for Cash on Delivery");
      return;
    }

    try {
      switch (selectedPayment) {
        case "online":
          await processOnlinePayment();
          break;
        case "cod":
          processCODPayment();
          break;
        default:
          setPaymentError("Invalid payment method selected");
      }
    } catch (error) {
      setPaymentError("Payment failed. Please try again.");
    }
  };

  // Backup payment data to localStorage when payment page loads
  useEffect(() => {
    // Only backup if we have a valid payment amount
    if (finalAmount <= 0) {
      return;
    }
    
    // Generate and backup order ID immediately when page loads
    const existingOrderId = localStorage.getItem("orderId");
    if (!existingOrderId) {
      const newOrderId = generateOrderID();
      localStorage.setItem("orderId", newOrderId);
    }
    
    // Backup payment amount only if it's valid
    localStorage.setItem("paymentAmount", finalAmount.toString());
    
    // Optional: Backup timestamp when user reached payment page
    localStorage.setItem("paymentPageTimestamp", Date.now().toString());
  }, [finalAmount]);

  // Auto-select first available payment method
  useEffect(() => {
    const availableOptions = getAvailablePaymentOptions();
    if (availableOptions.length > 0 && !selectedPayment) {
      setSelectedPayment(availableOptions[0]);
    }
  }, [selectedPayment, getAvailablePaymentOptions]);

  // Debug: Track when finalAmount changes
  useEffect(() => {
    if (finalAmount > 0) {
      
      
      
      
      // Debug timestamp removed for cleaner console
      
      // Check what triggered the change
      const paymentAmountLS = localStorage.getItem("paymentAmount");
      
      if (parseFloat(paymentAmountLS) !== finalAmount) {
        
        
      }
    }
  }, [finalAmount, calculatedMRP, calculatedDiscount]);

  // Create a ref to track if we've already unlocked the cart
  const paymentPageUnlockRef = useRef(false);
  
  // Unlock cart when navigating away from payment page or when component unmounts
  useEffect(() => {
    return () => {
      // Don't unlock if navigating to thank you page
      if (window.location.pathname.includes('/thank-you')) {
        return;
      }
      
      // Skip if we've already unlocked in this component instance
      if (paymentPageUnlockRef.current) {
        return;
      }
      
      // Check if we've already unlocked globally
      const globallyUnlocked = sessionStorage.getItem('thank_you_cart_unlocked');
      if (!globallyUnlocked) {
        unlockCart();
        paymentPageUnlockRef.current = true;
        
      } else {
        
      }
    };
  }, [unlockCart]);

  // Debug: Log when component mounts to see initial state - recompile trigger
  useEffect(() => {
    
    
    // Debug timestamp removed for cleaner console
    
    // Show all relevant localStorage values before cleanup
    const relevantKeys = ['paymentAmount', 'cartProducts', 'cartTotalPrice', 'totalPrice'];
    
    relevantKeys.forEach(key => {
      localStorage.getItem(key);
    });
    
    // Clean up conflicting keys (but keep cartTotalPrice as we sync it properly now)
    const conflictingKeys = ['totalPrice']; // Removed 'cartTotalPrice' from cleanup
    let removedAny = false;
    conflictingKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        
        localStorage.removeItem(key);
        removedAny = true;
      }
    });
    
    if (removedAny) {
      
      relevantKeys.forEach(key => {
        localStorage.getItem(key);
      });
    }
  }, []);

  // Don't render payment options until offer context is ready
  if (isLoading || isCodAvailable === undefined || isCodAvailable === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full mb-4 animate-spin"></div>
        <p className="text-slate-700 text-lg font-medium">Loading payment options...</p>
        <p className="mt-2 text-slate-500 text-sm">Please wait while we configure your payment methods...</p>
      </div>
    );
  }

  if (isPaymentPageLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full mb-4 animate-spin"></div>
        <p className="text-slate-700 text-lg font-medium">
          {'Processing your payment...'}
        </p>
        <p className="mt-2 text-slate-500 text-sm">
          {'Please wait while we redirect you...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto bg-white min-h-screen shadow-sm pb-28 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-700 to-indigo-800 border-b border-blue-600 sticky top-0 z-30 shadow-md">
        <div className="flex items-center">
          <svg className="w-7 h-7 text-white mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h1 className="text-2xl font-bold text-white">Secure Payment</h1>
        </div>
        <div className={`text-sm font-bold px-4 py-2.5 rounded-full font-mono flex items-center gap-2 ${
          timeLeft < 300 
            ? 'text-red-100 bg-red-700/60 border border-red-500 shadow-inner' 
            : 'text-white bg-blue-600/50 border border-blue-400/50 shadow-inner'
        }`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15,1H9V3H15M11,14H13V8H11M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20Z"/>
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Bank-Grade Security Banner - Enhanced */}
      <div className="pt-4 pb-1 px-4">
        <div className="flex flex-col bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl border border-blue-500 mb-6 shadow-lg overflow-hidden relative">
          {/* Security badge icons in the background */}
          <div className="absolute right-0 top-0 opacity-10">
            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
          </div>

          {/* Security content */}
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-white rounded-full shadow-md">
              <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">🔐 Bank-Grade Security</h3>
              <p className="text-blue-100">Your payment information is protected with 256-bit SSL encryption</p>
            </div>
          </div>
          
          {/* Security badges */}
          <div className="flex items-center justify-between mt-4 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2m0,18c-3.94,0 -7-3.06 -7-7s3.06-7 7-7s7,3.06 7,7s-3.06,7 -7,7m-1-10h2v5h-2v-5zm0-7h2v2h-2v-2z"/>
              </svg>
              <span className="text-xs text-white font-medium">RBI Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A9,9 0 0,0 3,11V22L6,19L9,22L12,19L15,22L18,19L21,22V11A9,9 0 0,0 12,2M12,4A7,7 0 0,1 19,11V17.5L18,16.5L15,19.5L12,16.5L9,19.5L6,16.5L5,17.5V11A7,7 0 0,1 12,4M12,6.5A2.5,2.5 0 0,0 9.5,9A2.5,2.5 0 0,0 12,11.5A2.5,2.5 0 0,0 14.5,9A2.5,2.5 0 0,0 12,6.5M12,8A1,1 0 0,1 13,9A1,1 0 0,1 12,10A1,1 0 0,1 11,9A1,1 0 0,1 12,8Z"/>
              </svg>
              <span className="text-xs text-white font-medium">PCI DSS Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
              <span className="text-xs text-white font-medium">Secure Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-5 mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Choose Payment Method</h3>
        
        {/* Online Payment Option */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20,8H4V6H20M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M11,17H13V16H14A1,1 0 0,0 15,15V12A1,1 0 0,0 14,11H11V10H15V8H13V7H11V8H10A1,1 0 0,0 9,9V12A1,1 0 0,0 10,13H13V14H9V16H11V17Z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Pay Online</h4>
                <p className="text-sm text-slate-600">UPI • Cards • Net Banking</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 transition-all ${
              selectedPayment === 'online' 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedPayment === 'online' && (
                <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-blue-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-bold">₹</span>
              </div>
              <span className="font-semibold text-slate-800">Amount to Pay</span>
            </div>
            <span className="text-xl font-bold text-blue-600">₹{finalAmount}</span>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">UPI</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">Debit Card</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">Credit Card</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">Net Banking</span>
          </div>
          
          <button
            onClick={() => setSelectedPayment('online')}
            className={`w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all ${
              selectedPayment === 'online'
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {selectedPayment === 'online' ? 'Selected' : 'Select Online Payment'}
          </button>
        </div>
        
        {/* COD Payment Option */}
        {codEnabled && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20,18H4V6H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M11,17H13V16H14A1,1 0 0,0 15,15V12A1,1 0 0,0 14,11H11V10H15V8H13V7H11V8H10A1,1 0 0,0 9,9V12A1,1 0 0,0 10,13H13V14H9V16H11V17Z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Cash on Delivery</h4>
                  <p className="text-sm text-slate-600">Pay when your order arrives</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                selectedPayment === 'cod' 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300'
              }`}>
                {selectedPayment === 'cod' && (
                  <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                )}
              </div>
            </div>
            
            {/* Payment Details */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Payment Method</span>
                <span className="text-slate-800 font-semibold">Cash on Delivery</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Order Amount</span>
                <span className="text-slate-800 font-semibold">₹{finalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">COD Charges</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">FREE</span>
                  <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                    ₹0
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 text-lg font-bold border-t-2 border-gray-300 mt-3 pt-3 bg-white rounded-xl px-4 shadow-sm">
                <span className="text-slate-800">Total Payable</span>
                <span className="text-green-600">₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {/* COD Information */}
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-green-800 font-medium mb-1">Secure Cash Payment</p>
                  <p className="text-xs text-green-700">
                    Pay ₹{finalAmount} in cash to our delivery partner when your order arrives at your doorstep. No advance payment required.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => setSelectedPayment('cod')}
              className={`w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all ${
                selectedPayment === 'cod'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {selectedPayment === 'cod' ? 'Selected' : 'Select Cash on Delivery'}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Trust Seals Section */}
      <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl p-6 mx-4 mb-6 shadow-md border border-blue-200">
        <div className="relative">
          {/* Shield icon removed as requested */}
          
          <h4 className="text-center font-bold text-slate-800 mb-6 text-xl flex items-center justify-center">
            <span className="bg-blue-600 p-1.5 rounded-md text-white mr-2 shadow">🔒</span>
            Secure & Trusted Payments
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center gap-3 p-4 bg-white border border-blue-100 rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <img src={safePaymentIcon} alt="Safe Payment" className="w-8 h-8" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">SSL Secured</span>
                <span className="text-xs text-slate-500">256-bit encryption</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 p-4 bg-white border border-green-100 rounded-xl transition-all duration-200 hover:border-green-300 hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9"/>
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">RBI Approved</span>
                <span className="text-xs text-slate-500">Regulated payments</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 p-4 bg-white border border-blue-100 rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">NPCI Partner</span>
                <span className="text-xs text-slate-500">Instant transfers</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-6 bg-white rounded-full px-4 py-2 shadow-sm border border-blue-100 mx-auto w-max">
            <div className="flex items-center gap-3 divide-x divide-gray-300">
              <span className="text-xs text-blue-600 font-medium">NPCI Verified</span>
              <span className="text-xs text-green-600 font-medium pl-3">256-bit SSL</span>
              <span className="text-xs text-purple-600 font-medium pl-3">PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mx-5 mb-4">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7Z"/>
          </svg>
          <span className="text-sm">{paymentError}</span>
        </div>
      )}

      {/* Bottom Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-[420px] mx-auto">
          <button 
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform shadow-lg ${
              isProcessingPayment 
                ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                : selectedPayment === 'cod' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105'
            } text-white`}
            onClick={handlePay}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a7.646 7.646 0 100 15.292" />
                </svg>
                <span>{selectedPayment === 'cod' ? 'Processing Order...' : 'Payment...'}</span>
              </div>
            ) : selectedPayment === 'cod' ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Place Order - ₹{finalAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Pay Now - ₹{finalAmount.toFixed(2)}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentEnhanced;