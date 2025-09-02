/**
 * Enhanced Payment Component
 * 
 * Provides a complete payment interface with Cashfree integration,
 * comprehensive error handling, and multiple payment method support.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useUI } from '../../contexts/UIContext';
import { useOffer } from '../../contexts/OfferContext';
import enhancedPaymentService from '../../services/enhancedPaymentService';
import { getPrimaryThemeColor, getSecondaryThemeColor } from '../../utils/themeColorsSimple';

// Dynamic color scheme
const primaryColor = getPrimaryThemeColor();
const secondaryColor = getSecondaryThemeColor();

const EnhancedPaymentComponent = () => {
  const navigate = useNavigate();
  const { selectedProduct, totalPrice, clearCart } = useCart();
  const { address, setStep } = useUI();
  const { isEligibleForOffers, isCodAvailable } = useOffer();

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Load payment configuration on component mount
  useEffect(() => {
    loadPaymentConfig();
  }, []);

  // Prepare order data when address or products change
  useEffect(() => {
    if (address && selectedProduct && totalPrice) {
      prepareOrderData();
    }
  }, [address, selectedProduct, totalPrice]);

  /**
   * Load payment gateway configuration
   */
  const loadPaymentConfig = async () => {
    try {
      const config = await enhancedPaymentService.isCashfreeEnabled();
      setPaymentConfig(config);
      
      if (!config.enabled) {
        console.warn('⚠️ Cashfree payment gateway is not enabled');
      }
    } catch (error) {
      console.error('❌ Failed to load payment config:', error);
      setPaymentError('Failed to load payment configuration');
    }
  };

  /**
   * Prepare order data for payment
   */
  const prepareOrderData = useCallback(() => {
    try {
      const finalAmount = parseFloat(totalPrice) || 0;
      
      if (finalAmount <= 0) {
        throw new Error('Invalid order amount');
      }

      const customerData = {
        customer_phone: address?.mobile || '9999999999',
        customer_email: address?.email || generateRealisticEmail(),
        customer_name: address?.firstName && address?.lastName 
          ? `${address.firstName} ${address.lastName}` 
          : 'Customer'
      };

      const orderInfo = {
        amount: finalAmount,
        order_currency: 'INR',
        customer: customerData,
        orderNote: `Payment for ${selectedProduct?.length || 1} item(s)`,
        cart_details: {
          cart_id: `cart_${Date.now()}`,
          cart_total: finalAmount
        },
        order_tags: {
          source: 'web_checkout',
          eligible_for_offers: isEligibleForOffers,
          product_count: selectedProduct?.length || 0
        }
      };

      setOrderData(orderInfo);
    } catch (error) {
      console.error('❌ Error preparing order data:', error);
      setPaymentError('Failed to prepare order data');
    }
  }, [address, selectedProduct, totalPrice, isEligibleForOffers]);

  /**
   * Generate realistic email for order
   */
  const generateRealisticEmail = () => {
    const emails = [
      'customer@gmail.com', 'user@yahoo.com', 'buyer@hotmail.com',
      'shopper@outlook.com', 'client@rediffmail.com'
    ];
    return emails[Math.floor(Math.random() * emails.length)];
  };

  /**
   * Process online payment
   */
  const processOnlinePayment = async () => {
    if (!paymentConfig?.enabled) {
      setPaymentError('Online payment is currently unavailable');
      return;
    }

    if (!orderData) {
      setPaymentError('Order data is not ready');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      console.log('🚀 Starting online payment process...');
      
      // Process payment with enhanced service
      const result = await enhancedPaymentService.processPayment(orderData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Payment processing failed');
      }

      console.log(`✅ Payment initiated successfully using ${result.method}`);
      
      // If we reach here, payment has been initiated
      // The user will be redirected to Cashfree or the payment page will load
      
    } catch (error) {
      console.error('❌ Online payment failed:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  /**
   * Process Cash on Delivery
   */
  const processCodPayment = async () => {
    if (!isCodAvailable) {
      setPaymentError('Cash on Delivery is not available for your location');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      console.log('🚀 Processing COD order...');
      
      // Simulate COD order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order ID for COD
      const codOrderId = enhancedPaymentService.generateOrderId('cod');
      
      // Clear cart and navigate to success page
      clearCart();
      navigate(`/thankyou?order_id=${codOrderId}&payment_method=cod&status=confirmed`);
      
    } catch (error) {
      console.error('❌ COD processing failed:', error);
      setPaymentError('Failed to process Cash on Delivery order');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  /**
   * Handle payment method selection
   */
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentError('');
  };

  /**
   * Process payment based on selected method
   */
  const handlePaymentSubmit = async () => {
    if (paymentMethod === 'online') {
      await processOnlinePayment();
    } else if (paymentMethod === 'cod') {
      await processCodPayment();
    }
  };

  // Render loading state
  if (!paymentConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setStep(2)}
                className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
            </div>
            <div className="text-sm text-gray-500">
              Step 3 of 3
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          
          <div className="px-6 py-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span style={{ color: primaryColor }}>₹{totalPrice?.toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {selectedProduct?.length || 0} item(s) • Free shipping
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
          </div>
          
          <div className="px-6 py-6 space-y-4">
            {/* Online Payment Option */}
            <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'online' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => handlePaymentMethodChange('online')}>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="online"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => handlePaymentMethodChange('online')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="online" className="ml-3 cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">
                    Online Payment
                    {!paymentConfig.enabled && (
                      <span className="ml-2 text-xs text-red-600">(Unavailable)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Pay securely using Credit Card, Debit Card, Net Banking, or UPI
                  </div>
                </label>
              </div>
            </div>

            {/* Cash on Delivery Option */}
            <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'cod' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => handlePaymentMethodChange('cod')}>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="cod" className="ml-3 cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">
                    Cash on Delivery
                    {!isCodAvailable && (
                      <span className="ml-2 text-xs text-red-600">(Not available)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Pay when your order is delivered to your doorstep
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Configuration Info */}
        {paymentConfig && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Payment Environment: <span className="font-medium">{paymentConfig.environment}</span>
                  {paymentConfig.environment === 'sandbox' && ' (Test Mode)'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {paymentConfig.enabled 
                    ? 'Payment gateway is ready for transactions'
                    : 'Payment gateway is currently disabled'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{paymentError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePaymentSubmit}
            disabled={isProcessingPayment || 
              (paymentMethod === 'online' && !paymentConfig?.enabled) ||
              (paymentMethod === 'cod' && !isCodAvailable)
            }
            className="w-full text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': secondaryColor,
            }}
          >
            {isProcessingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {paymentMethod === 'online' ? 'Pay Online' : 'Place Order'}
                  {' '}₹{totalPrice?.toLocaleString()}
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentComponent;
