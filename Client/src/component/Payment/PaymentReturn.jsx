import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [orderDetails, setOrderDetails] = useState(null);

  const verifyPayment = useCallback(async (orderId) => {
    try {
      console.log(`🔍 Verifying payment for order: ${orderId}`);

      // Call backend API to verify payment status with Cashfree
      const response = await fetch(`/api/payment/verify/${orderId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      console.log('🔄 Payment verification result:', result);
      
      if (result.success && result.status === 'PAID') {
        setStatus('success');
        setOrderDetails(result.order);
        
        // Build comprehensive thank you URL with all available data
        const thankYouParams = new URLSearchParams({
          order_id: orderId,
          payment_status: 'success',
          verified: 'true',
          timestamp: new Date().toISOString()
        });
        
        // Add additional parameters if available
        const cf_order_id = searchParams.get('cf_order_id');
        const payment_session_id = searchParams.get('payment_session_id');
        
        if (cf_order_id) {
          thankYouParams.append('cf_order_id', cf_order_id);
        }
        if (payment_session_id) {
          thankYouParams.append('payment_session_id', payment_session_id);
        }
        if (result.order?.order_amount) {
          thankYouParams.append('amount', result.order.order_amount);
        }
        if (result.order?.order_currency) {
          thankYouParams.append('currency', result.order.order_currency);
        }
        
        // Instant redirect to thank you page
        const thankYouUrl = `/thankyou?${thankYouParams.toString()}`;
        console.log(`✅ Payment successful! Redirecting to: ${thankYouUrl}`);
        navigate(thankYouUrl, { 
          state: { 
            orderDetails: result.order,
            paymentMethod: 'cashfree'
          },
          replace: true 
        });
      } else {
        setStatus('failed');
        setOrderDetails(result.order);
        
        // Build comprehensive failure URL with error context
        const cartParams = new URLSearchParams({
          error: 'payment_failed',
          order_id: orderId,
          payment_status: result.status || 'unknown',
          timestamp: new Date().toISOString()
        });
        
        const cf_order_id = searchParams.get('cf_order_id');
        if (cf_order_id) {
          cartParams.append('cf_order_id', cf_order_id);
        }
        
        // Instant redirect to cart with error details
        const cartUrl = `/cart?${cartParams.toString()}`;
        console.log(`❌ Payment failed! Redirecting to: ${cartUrl}`);
        navigate(cartUrl, { 
          state: { 
            error: 'Payment failed. Please try again.',
            orderDetails: result.order 
          },
          replace: true 
        });
      }
    } catch (error) {
      console.error('💥 Payment verification error:', error);
      setStatus('error');
      
      // Build error URL
      const errorParams = new URLSearchParams({
        error: 'verification_failed',
        order_id: orderId,
        timestamp: new Date().toISOString()
      });
      
      // Instant redirect to cart after error
      const cartUrl = `/cart?${errorParams.toString()}`;
      console.log(`🚨 Verification error! Redirecting to: ${cartUrl}`);
      navigate(cartUrl, { 
        state: { 
          error: 'Payment verification failed. Please try again.',
          debugInfo: error.message
        },
        replace: true 
      });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    // Extract order ID from URL parameters
    const orderId = searchParams.get('order_id') || 
                   searchParams.get('orderId') || 
                   searchParams.get('ORDER_ID');

    console.log('🔄 Payment return page loaded with params:', Object.fromEntries(searchParams));
    console.log('📋 Extracted order ID:', orderId);

    if (orderId) {
      // Start verification immediately
      verifyPayment(orderId);
    } else {
      console.error('❌ No order ID found in payment return');
      setStatus('error');
      
      // Debug info for troubleshooting
      const debugInfo = {
        allParams: Object.fromEntries(searchParams),
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      // Instant redirect to cart if no order_id
      const noOrderUrl = '/cart?error=no_order_id&source=payment_return&timestamp=' + new Date().toISOString();
      console.log(`🚨 No order ID found! Redirecting to: ${noOrderUrl}`);
      navigate(noOrderUrl, { 
        state: { 
          error: 'Payment verification failed. No order ID found.',
          debugInfo: debugInfo
        },
        replace: true 
      });
    }
  }, [searchParams, verifyPayment, navigate]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/thankyou', { 
        state: { 
          orderDetails,
          paymentMethod: 'cashfree'
        } 
      });
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment status...</p>
          </>
        )}

        {/* These will rarely be seen due to instant redirect */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Redirecting to order confirmation...</p>
            <button 
              onClick={handleContinue}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">Redirecting back to cart...</p>
            <button 
              onClick={handleContinue}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L1.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">Redirecting back to cart...</p>
            <button 
              onClick={handleContinue}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Cart
            </button>
          </>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-left text-xs">
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(Object.fromEntries(searchParams), null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;
