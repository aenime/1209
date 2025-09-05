
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUI } from "../../contexts/UIContext";
import { useCart } from "../../contexts/CartContext";
import envConfig from "../../utils/envConfig";
import trackingManager from "../../utils/trackingManager";
// REMOVED: import { logPurchase } from "../../utils/enhancedTrackingIntegration";
import { getTrackingPrice, getTrackingTotal, cleanNaNAmounts, getPriceConfig } from "../../utils/priceHelper";

import { getOrGenerateTransactionId } from "../../utils/transactionIdGenerator";
import LogoText from "../LogoText";
import { getPrimaryThemeColor, getSecondaryThemeColor } from "../../utils/themeColorsSimple";
import { 
  CheckCircleIcon, 
  TruckIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  LockClosedIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/solid';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { unlockCart } = useUI();
  const { handleSetCartProducts, totalPrice } = useCart();
  // Add tracking status ref to ensure tracking only happens once per component instance
  const trackingComplete = useRef(false);
  const [hasTracked, setHasTracked] = useState(false);

  // Get payment data from URL parameters (from Cashfree redirect)
  const paymentData = {
    orderId: searchParams.get('order_id'),
    cfOrderId: searchParams.get('cf_order_id'),
    paymentStatus: searchParams.get('payment_status'),
    amount: searchParams.get('amount'),
    currency: searchParams.get('currency'),
    verified: searchParams.get('verified') === 'true',
    timestamp: searchParams.get('timestamp'),
    // Additional parameters for fallback cases
    referenceId: searchParams.get('reference_id'),
    merchantOrderId: searchParams.get('merchant_order_id'),
    paymentSessionId: searchParams.get('payment_session_id'),
    txnId: searchParams.get('txn_id'),
    isUnverified: searchParams.get('verified') === 'false' // Explicit unverified flag
  };

  const [paymentInfo, setPaymentInfo] = useState(paymentData);

  // Get dynamic colors
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();
  
  // Check if Cashfree is enabled from admin environment config
  const [isCashfreeEnabled, setIsCashfreeEnabled] = useState(false);
  
  useEffect(() => {
    // Check Cashfree status from admin environment config
    // When admin > env has Cashfree enabled, payment status shows as "confirmed"
    const cashfreeEnabled = envConfig.get('CASHFREE_ENABLED');
    setIsCashfreeEnabled(cashfreeEnabled === true || cashfreeEnabled === 'true');
  }, []);
  
  // Clean up any NaN values before initializing
  useEffect(() => {
    cleanNaNAmounts(['totalPrice', 'cartTotalPrice']);
  }, []);
  
  // Store display amount in state to prevent NaN after localStorage cleanup
  const [displayAmount] = useState(() => {
    // Clean any NaN values in localStorage first
    cleanNaNAmounts(['totalPrice', 'cartTotalPrice', 'paymentAmount']);
    
    // Get amounts from all possible sources
    const contextPrice = typeof totalPrice === 'number' ? totalPrice : 0;
    const paymentAmount = parseFloat(localStorage.getItem("paymentAmount") || 0);
    const localStoragePrice = parseFloat(localStorage.getItem("cartTotalPrice") || 0);
    const savedTotalPrice = parseFloat(localStorage.getItem("totalPrice") || 0);
    
    // Log all available amounts for debugging
    
    // Priority: paymentAmount > context > saved totalPrice > localStorage cartTotalPrice > fallback to 0
    if (paymentAmount > 0) {
      return paymentAmount;
    } else if (contextPrice > 0) {
      return contextPrice;
    } else if (savedTotalPrice > 0) {
      return savedTotalPrice;
    } else if (localStoragePrice > 0) {
      return localStoragePrice;
    } else {
      return 0;
    }
  });
  
  const generateOrderID = () => {
    const min = 1000000000;
    const max = 9999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  const getOrderIDForOrderId = useCallback((orderIdValue) => {
    const orderData = JSON.parse(localStorage.getItem("orderData")) || {};
    if (orderData[orderIdValue]) {
      return orderData[orderIdValue];
    } else {
      const newOrderId = generateOrderID();
      orderData[orderIdValue] = newOrderId;
      localStorage.setItem("orderData", JSON.stringify(orderData));
      return newOrderId;
    }
  }, []);
  
  const [orderIdValue] = useState(() => {
    // Get transaction ID from localStorage (stored during checkout)
    const storedOrderId = localStorage.getItem("orderId");
    
    return storedOrderId || "";
  });
  
  const [, setDisplayOrderId] = useState(() => {
    const savedOrderId = localStorage.getItem("orderId");
    return savedOrderId ? getOrderIDForOrderId(savedOrderId) : null;
  });

  const orderNumber = localStorage.getItem("orderId");
  
  // Get payment method from local storage
  const [paymentMethod] = useState(() => {
    return localStorage.getItem("paymentMethod") || "PhonePe";
  });
  
  // Generate unique transaction ID based on order ID, payment method and amount
  const [transactionId, setTransactionId] = useState(() => {
    // First check if this transaction was already tracked in sessionStorage
    // This ensures consistent transaction IDs even on page refresh
    const existingTransactionId = getOrGenerateTransactionId(orderNumber, paymentMethod, displayAmount);
    
    return existingTransactionId;
  });

  useEffect(() => {
    if (orderIdValue && !trackingComplete.current && !hasTracked) {
      const newOrderId = getOrderIDForOrderId(orderIdValue);
      setDisplayOrderId(newOrderId);
      localStorage.setItem("orderId", orderIdValue);
      
      // Store the stable displayAmount in localStorage for backup
      localStorage.setItem("totalPrice", displayAmount.toString());

      // Check if purchase was already tracked for this transaction
      const trackedTransactions = sessionStorage.getItem('tracked_purchases') || '{}';
      let trackedTransactionsObj = {};
      
      try {
        trackedTransactionsObj = JSON.parse(trackedTransactions);
      } catch (e) {
        
      }
      
      const transactionKey = transactionId || orderIdValue;
      
      // Enhanced duplicate check: only skip if previously tracked AND tracking scripts are ready
      const wasAlreadyTracked = trackedTransactionsObj[transactionKey];
      const status = trackingManager.getStatus();
      const trackingScriptsReady = status.googleAnalytics && status.facebookPixel;
      
      if (wasAlreadyTracked && trackingScriptsReady) {
        setHasTracked(true);
        trackingComplete.current = true;
        return;
      } else if (wasAlreadyTracked && !trackingScriptsReady) {
        // Tracking scripts still loading, will retry
      }

      // Track purchase conversion with new tracking manager
      if (displayAmount) {
        // Get cart products for detailed tracking - try multiple sources
        let cartProducts = [];
        
        // Try to get from stored checkout data first
        const checkoutProducts = localStorage.getItem("checkoutProducts");
        if (checkoutProducts) {
          try {
            cartProducts = JSON.parse(checkoutProducts);
          } catch (e) {
            
          }
        }
        
        // Fallback to cart products if checkout products not found
        if (!cartProducts.length) {
          const storedCartProducts = localStorage.getItem("cartProducts");
          if (storedCartProducts) {
            try {
              cartProducts = JSON.parse(storedCartProducts);
            } catch (e) {
              
            }
          }
        }
        
        // Format items for tracking with proper price selection
        const items = cartProducts.map((product, index) => ({
          item_id: product._id || product.id || `item_${index}`,
          item_name: product.name || product.title || 'Unknown Product',
          category: product.category || 'General',
          quantity: product.quantity || 1,
          price: getTrackingPrice(product)
        }));

        // Use the transaction ID that was stored during checkout process
        const actualTransactionId = orderIdValue || localStorage.getItem("orderId");
        
        if (!actualTransactionId) {
          return;
        }
        
        // Get total value based on configuration
        const totalMRP = parseFloat(localStorage.getItem("cartTotalMRP") || 0);
        const trackingValue = getTrackingTotal(displayAmount, totalMRP, cartProducts);
        
        // Track purchase with direct tracking manager (enhanced tracking removed due to import issues)
        try {
          trackingManager.trackPurchase({
            transaction_id: transactionId || actualTransactionId,
            value: trackingValue,
            currency: 'INR',
            items: items,
            tax: 0,
            shipping: 0
          });
        } catch (error) {
        }
        
        // Mark this transaction as tracked
        trackedTransactionsObj[transactionKey] = {
          timestamp: Date.now(),
          value: trackingValue,
          displayAmount: displayAmount
        };
        sessionStorage.setItem('tracked_purchases', JSON.stringify(trackedTransactionsObj));
        
        // Mark as tracked in multiple ways to ensure no duplicate firing
        trackingComplete.current = true;
        setHasTracked(true);
        
        
      }
    }
    
    // Don't clear cart data immediately - keep it for 15 minutes unless user interacts
    // Removed immediate cart cleanup
  // We intentionally omit most dependencies to ensure this effect runs exactly once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdValue]);

  // Complete localStorage cleanup function
  const clearAllLocalData = useCallback(() => {
    // Clear cart data
    localStorage.removeItem("cartProducts");
    localStorage.removeItem("slectedData");
    localStorage.removeItem("address");
    localStorage.removeItem("cartTotalPrice");
    localStorage.removeItem("cartTotalMRP");
    localStorage.removeItem("cartTotalDiscount");
    localStorage.removeItem("cartTotalExtraDiscount");
    
    // Clear payment data
    localStorage.removeItem("orderId");
    localStorage.removeItem("totalPrice");
    localStorage.removeItem("orderData");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("selectedPaymentOption");
    localStorage.removeItem("customerInfo");
    localStorage.removeItem("deliveryAddress");
    localStorage.removeItem("orderStatus");
    
    // Clear transaction ID data
    localStorage.removeItem("transactionId");
    localStorage.removeItem("transactionIdData");
    
    // Clear cart in context
    handleSetCartProducts([]);
    
    
  }, [handleSetCartProducts]);

  // 15-minute automatic cleanup timer (only if no user activity)
  useEffect(() => {
    const cleanupTimer = setTimeout(() => {
      clearAllLocalData();
      
    }, 900000); // 15 minutes = 900,000 milliseconds

    // Cleanup timer if component unmounts before 15 minutes
    return () => {
      clearTimeout(cleanupTimer);
    };
  }, [clearAllLocalData]); // Include clearAllLocalData in dependencies
  
  // Effect to ensure the transaction ID is regenerated if any of its inputs change
  useEffect(() => {
    // Generate or retrieve a transaction ID whenever order ID, payment method or amount changes
    const refreshedTransactionId = getOrGenerateTransactionId(orderNumber, paymentMethod, displayAmount);
    if (refreshedTransactionId !== transactionId) {
      setTransactionId(refreshedTransactionId);
      
    }
  }, [orderNumber, paymentMethod, displayAmount, transactionId]);

  // Handle back navigation and clear data
  useEffect(() => {
    const handleBackNavigation = (event) => {
      event.preventDefault();
      // Clear all data when user tries to go back
      clearAllLocalData();
      navigate("/ThankYou", { replace: true });
    };

    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [navigate, clearAllLocalData]);

  const handleContinueShopping = () => {
    // Clear all data when user continues shopping
    clearAllLocalData();
    navigate('/');
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date, time };
  };

  const getShippingEstimate = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If order received before 3 PM, ship today by 4 PM
    if (currentHour < 15) {
      return "Today by 4:00 PM";
    } 
    // If order received after 3 PM, ship tomorrow at 9 AM
    else {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `Tomorrow at 9:00 AM`;
    }
  };

  const { date, time } = getCurrentDateTime();
  const shippingEstimate = getShippingEstimate();
  const logo = envConfig.get('REACT_APP_LOGO');

  // Flag to track if cart unlocking was performed in this component instance
  const cartUnlocked = useRef(false);
  
  // Unlock cart when thank you page loads - with enhanced protection against duplicate unlocking
  useEffect(() => {
    // Skip if we've already unlocked in this component instance
    if (cartUnlocked.current) {
      return;
    }
    
    // Check session storage to see if we've already unlocked globally (across refreshes)
    const globallyUnlocked = sessionStorage.getItem('thank_you_cart_unlocked');
    
    // Only proceed if we haven't unlocked globally
    if (!globallyUnlocked) {
      // Mark as unlocked globally to prevent repeated unlocking
      sessionStorage.setItem('thank_you_cart_unlocked', 'true');
      
      // Mark as unlocked in this component instance
      cartUnlocked.current = true;
      
      // Clean up cart lock
      unlockCart();
      
      // Clean up localStorage to prevent previous order data from affecting new orders
      localStorage.removeItem("cartProducts");
      localStorage.removeItem("paymentAmount");
      localStorage.removeItem("cartTotalPrice");
    } else if (!cartUnlocked.current) {
      // Only log this once per component instance, even if the effect runs multiple times
      cartUnlocked.current = true;
    }
  }, [unlockCart]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Payment Header - Dynamic based on Cashfree status and verification */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            {isCashfreeEnabled && paymentData.verified ? (
              // Cashfree enabled + verified payment - show confirmed state with green
              <>
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                <div className="relative rounded-full p-6 shadow-lg bg-green-500">
                  <CheckCircleIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-20"></div>
              </>
            ) : isCashfreeEnabled && paymentData.isUnverified ? (
              // Cashfree enabled but unverified payment - show warning state with orange
              <>
                <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse"></div>
                <div className="relative rounded-full p-6 shadow-lg bg-orange-500">
                  <CheckCircleIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-orange-300 rounded-full animate-ping opacity-20"></div>
              </>
            ) : isCashfreeEnabled ? (
              // Cashfree enabled - show confirmed state with green
              <>
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                <div className="relative rounded-full p-6 shadow-lg bg-green-500">
                  <CheckCircleIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-20"></div>
              </>
            ) : (
              // Cashfree disabled - show pending state with yellow
              <>
                <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse"></div>
                <div className="relative rounded-full p-6 shadow-lg" style={{ backgroundColor: primaryColor }}>
                  <CheckCircleIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-20"></div>
              </>
            )}
          </div>
          
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
            isCashfreeEnabled && paymentData.verified 
              ? 'text-green-800' 
              : isCashfreeEnabled && paymentData.isUnverified
                ? 'text-orange-800'
                : isCashfreeEnabled 
                  ? 'text-green-800'
                  : 'text-gray-900'
          }`}>
            {isCashfreeEnabled && paymentData.verified 
              ? 'Payment Confirmed' 
              : isCashfreeEnabled && paymentData.isUnverified
                ? 'Payment Received (Unverified)'
                : isCashfreeEnabled
                  ? 'Payment Confirmed'
                  : 'Payment Confirmation is Pending'}
          </h1>
          <p className="text-lg text-gray-600 mb-4">Your order has been confirmed</p>
          
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${
            isCashfreeEnabled && paymentData.verified
              ? 'bg-green-50 text-green-800'
              : isCashfreeEnabled && paymentData.isUnverified
                ? 'bg-orange-50 text-orange-800'
                : isCashfreeEnabled 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-yellow-50 text-yellow-800'
          }`}>
            <span className="mr-1">₹</span>
            <span>{displayAmount}</span>
          </div>
        </div>

        {/* Unverified Payment Warning */}
        {paymentData.isUnverified && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6 mb-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 text-2xl">⚠️</span>
              </div>
              <div>
                <h4 className="font-bold text-orange-800 mb-3 text-lg">Payment Status Notice</h4>
                <p className="text-orange-700 font-medium leading-relaxed mb-2">
                  Your payment was successful, but we couldn't verify all the details automatically. 
                </p>
                <p className="text-orange-700 leading-relaxed">
                  Your order has been confirmed and will be processed normally. If you have any concerns, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 text-white" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white">Transaction Details</h3>
              <span className={`text-white px-3 py-1 rounded-full text-xs font-medium ${
                isCashfreeEnabled && paymentData.verified
                  ? 'bg-green-600' 
                  : isCashfreeEnabled && paymentData.isUnverified
                    ? 'bg-orange-600'
                    : isCashfreeEnabled
                      ? 'bg-green-600'
                      : ''
              }`} style={{ backgroundColor: (isCashfreeEnabled && !paymentData.verified && !paymentData.isUnverified) || !isCashfreeEnabled ? secondaryColor : undefined }}>
                {isCashfreeEnabled && paymentData.verified
                  ? 'Verified' 
                  : isCashfreeEnabled && paymentData.isUnverified
                    ? 'Unverified'
                    : isCashfreeEnabled
                      ? 'Confirmed'
                      : 'Pending'}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Order ID - Single row layout */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">🆔</span>
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Order ID</span>
              </div>
              <span className="font-mono text-sm sm:text-base md:text-lg bg-gray-50 px-2 sm:px-3 py-1 rounded-md break-all flex-shrink">
                {orderNumber}
              </span>
            </div>
            
            {/* Transaction ID - Single row layout */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">🔐</span>
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Transaction ID</span>
              </div>
              <span className="font-mono text-sm sm:text-base md:text-lg bg-indigo-50 px-2 sm:px-3 py-1 rounded-md text-indigo-700 select-all break-all flex-shrink">
                {transactionId}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">💰</span>
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Amount Paid</span>
              </div>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-600">₹{displayAmount}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">📅</span>
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Date & Time</span>
              </div>
              <div className="text-right flex-shrink">
                <div className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">{date}</div>
                <div className="text-sm sm:text-base md:text-lg text-gray-500">{time}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">💳</span>
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Payment Method</span>
              </div>
              <span className="font-semibold text-gray-900 capitalize text-sm sm:text-base md:text-lg flex-shrink">{paymentMethod}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-lg md:text-xl">🏪</span>
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Merchant</span>
              </div>
              <span className="font-semibold text-gray-900 break-all text-sm sm:text-base md:text-lg flex-shrink min-w-0">{window.location.hostname}</span>
            </div>
            
            <div className="flex items-center justify-between py-3" style={{ gap: '15px' }}>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
                  isCashfreeEnabled && paymentData.verified
                    ? 'bg-green-50' 
                    : isCashfreeEnabled && paymentData.isUnverified
                      ? 'bg-orange-50'
                      : isCashfreeEnabled
                        ? 'bg-green-50'
                        : 'bg-yellow-50'
                }`}>
                  <CheckCircleIcon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                    isCashfreeEnabled && paymentData.verified
                      ? 'text-green-500' 
                      : isCashfreeEnabled && paymentData.isUnverified
                        ? 'text-orange-500'
                        : isCashfreeEnabled
                          ? 'text-green-500'
                          : 'text-yellow-500'
                  }`} />
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl">Status</span>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base md:text-lg font-medium flex-shrink ${
                isCashfreeEnabled && paymentData.verified
                  ? 'bg-green-100 text-green-800'
                  : isCashfreeEnabled && paymentData.isUnverified
                    ? 'bg-orange-100 text-orange-800'
                    : isCashfreeEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isCashfreeEnabled && paymentData.verified
                  ? 'Payment verified and confirmed'
                  : isCashfreeEnabled && paymentData.isUnverified
                    ? 'Payment received (unverified)'
                    : isCashfreeEnabled
                      ? 'Payment confirmed'
                      : 'Payment confirmation pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Status Card */}
        <div className="bg-green-50 rounded-2xl shadow-lg border border-green-200 mb-6 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <TruckIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-green-900">Order Confirmed</h4>
              <p className="text-green-700">We're preparing your order for delivery</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Timeline Item 1 */}
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-px h-8 bg-green-200 mt-1"></div>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Payment Received</span>
                  <div className="text-sm text-green-600 font-medium">Completed</div>
                </div>
                <span className="text-sm text-gray-500">Just now</span>
              </div>
            </div>
            
            {/* Timeline Item 2 */}
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-px h-8 bg-gray-200 mt-1"></div>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Order Processing</span>
                  <div className="text-sm text-blue-600 font-medium">In progress</div>
                </div>
                <span className="text-sm text-gray-500">In progress</span>
              </div>
            </div>
            
            {/* Timeline Item 3 */}
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Ready to Ship</span>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <span className="text-sm text-yellow-600 font-medium">{shippingEstimate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice Card - More Highlighted */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6 shadow-md animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <div>
              <h4 className="font-bold text-red-800 mb-3 text-lg uppercase tracking-wide">IMPORTANT NOTICE</h4>
              <p className="text-red-700 font-medium leading-relaxed">
                Please keep your UPI app open until the payment is completely processed. If the payment fails, your order will be automatically cancelled.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button 
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
            onClick={handleContinueShopping}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>
          
          <a 
            href={`mailto:support@${window.location.hostname}?subject=Order Inquiry - ${orderNumber}`}
            onClick={() => {
              // Clear all data when user contacts support
              clearAllLocalData();
            }}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Contact Support</span>
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <LockClosedIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Secure Payment</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TruckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Quality Assured</span>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Secured by SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
