import storageService from '../services/storageService';

export class PaymentRouter {
  static async getPaymentRoute(orderDetails, offerContext = null) {
    try {
      // For Cashfree payments, we no longer route to /cashfree-payment
      // Instead, payment is processed directly from the payment selection page
      console.log("🚀 Direct Cashfree payment processing - no intermediate page");
      return null; // Indicates direct processing
    } catch (error) {
      console.error("❌ Payment routing error:", error);
      throw error;
    }
  }

  static async handleCheckoutNavigation(navigate, orderDetails, offerContext = null) {
    try {
      console.log("🚀 Navigating to payment page with order details");
      
      // Store order data for payment processing
      const orderDataForStorage = {
        total: orderDetails.total,
        customerName: orderDetails.customerName || 'Customer',
        customerEmail: orderDetails.customerEmail || `guest_${Date.now()}@customer.local`,
        customerPhone: orderDetails.customerPhone || `91${Date.now().toString().slice(-8)}`,
        shippingAddress: orderDetails.shippingAddress,
        customerId: orderDetails.customerId,
        isOfferView: offerContext?.isEligibleForOffers || false,
        isCodAvailable: offerContext?.isCodAvailable || false,
        _dataSource: 'checkout_form',
        _createdAt: new Date().toISOString()
      };
      
      console.log("💾 Storing order details for payment:", orderDataForStorage);
      
      // Store in localStorage
      localStorage.setItem("currentOrderDetails", JSON.stringify(orderDataForStorage));
      localStorage.setItem("paymentOrderDetails", JSON.stringify(orderDataForStorage));
      
      // Also store in StorageService as backup
      storageService.set('currentOrderDetails', orderDataForStorage);
      storageService.set('paymentOrderDetails', orderDataForStorage);
      
      // Navigate to payment page
      console.log("🧭 Navigating to payment page");
      navigate('/checkout/payment');
      
    } catch (error) {
      console.error("❌ Payment navigation error:", error);
      
      // Show error message and stay on current page
      alert(`Payment Error: ${error.message}\n\nPlease try again or contact support.`);
    }
  }

  static getReturnUrls() {
    return {
      returnUrl: `${window.location.origin}/payment-return`,
      successUrl: `${window.location.origin}/thankyou`,
      failureUrl: `${window.location.origin}/cart`,
      cancelUrl: `${window.location.origin}/cart`
    };
  }
}

export default PaymentRouter;
