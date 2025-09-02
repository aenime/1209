/**
 * React and routing imports
 */
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

/**
 * Analytics and tracking utilities
 */
import trackingManager from '../utils/trackingManager';
import { logPageView } from '../utils/enhancedTrackingIntegration';

/**
 * Layout components
 */
import Header from '../component/Header/HeaderTailwindClean';
import Footer from '../component/Footer/FooterTailwind';
import ScrollToTop from './ScrollToTop';
import { LocationProvider } from '../contexts/LocationContext';

/**
 * Main Application Pages - Lazy Loaded for Performance
 * These components are split into separate bundles to reduce initial load time
 */
const HomePage = React.lazy(() => import('../component/Home/HomeTailwind'));
const CategoryPage = React.lazy(() => import('../component/Category/CategoryPageTailwind'));
const SingleProduct = React.lazy(() => import('../component/SingleProduct/SingleProductTailwind'));
const Cart = React.lazy(() => import('../component/Cart'));
const Checkout = React.lazy(() => import('../component/Checkout'));
const Payment = React.lazy(() => import('../component/Checkout/payment_enhanced'));
const Wishlist = React.lazy(() => import('../component/Wishlist'));
const ThankYou = React.lazy(() => import('../component/Thankyou/Thankyou'));

/**
 * Payment Gateway Components - Lazy Loaded
 * Separate payment flow components for Cashfree integration
 */
const PaymentReturn = React.lazy(() => import('../component/Payment/PaymentReturn'));

/**
 * Footer Information Pages - Lazy Loaded
 * Legal and informational pages accessed from footer links
 */
const ContactUs = React.lazy(() => import('../component/Footer/ContactUsTailwind'));
const FAQ = React.lazy(() => import('../component/Footer/FAQTailwind'));
const OrderTracking = React.lazy(() => import('../component/Footer/OrderTrackingTailwind'));
const AboutUs = React.lazy(() => import('../component/Footer/AboutUsTailwind'));
const MyAccount = React.lazy(() => import('../component/Footer/MyAccountTailwind'));
const PrivacyPolicy = React.lazy(() => import('../component/Footer/PrivacyPolicyTailwind'));
const TermsOfService = React.lazy(() => import('../component/Footer/TermsOfServiceTailwind'));
const ReturnPolicy = React.lazy(() => import('../component/Footer/ReturnPolicyTailwind'));
const ShippingPolicy = React.lazy(() => import('../component/Footer/ShippingPolicyTailwind'));

/**
 * Environment Configuration Pages - Lazy Loaded
 * Admin pages for managing app configuration and settings
 */
const EnvConfig = React.lazy(() => import('../component/Env/EnvConfigPage'));

/**
 * Product Management Pages - Lazy Loaded
 */
const Products = React.lazy(() => import('../component/Products'));

/**
 * Admin Dashboard Components - Lazy Loaded
 * Administrative interface for managing the e-commerce platform
 */
const AdminLogin = React.lazy(() => import('../component/MyAdmin/AdminLogin'));
const MyAdmin = React.lazy(() => import('../component/MyAdmin/MyAdmin'));

/**
 * Loading Fallback Component
 * 
 * Displays an animated skeleton grid while components are loading.
 * Provides consistent UX during code splitting transitions.
 */
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1 minimal-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse bg-white p-4 rounded-lg shadow">
            <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Page Tracking Component
 * 
 * Tracks page views for analytics with strict deduplication to prevent
 * multiple events for the same page. Integrates with Google Analytics
 * and Facebook Pixel for comprehensive user behavior tracking.
 */
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    /**
     * Track page view with enhanced deduplication
     * Prevents duplicate analytics events when navigating between pages
     */
    const trackPageView = async () => {
      try {
        const currentPath = location.pathname;
        
        // Check for recent duplicate tracking of same path
        const lastPath = sessionStorage.getItem('lastPagePath');
        const lastTime = parseInt(sessionStorage.getItem('lastPageTime') || '0');
        
        // Skip tracking if same path was tracked within 2 seconds
        if (lastPath === currentPath && Date.now() - lastTime < 2000) {
          return; // Prevents duplicate analytics events
        }
        
        // Ensure environment configuration is ready before tracking
        try {
          const envConfig = (await import('../utils/envConfig')).default;
          await envConfig.ensureLoaded();
        } catch (error) {
          // Continue tracking even if env config fails
        }
        
        // Wait for tracking manager to be ready
        await trackingManager.ensureReady();
        
        // Special tracking for payment flow pages
        if (currentPath === '/cashfree-checkout') {
          // Enhanced tracking for payment flow initiation
          logPageView({
            page_title: document.title,
            page_location: window.location.href,
            page_path: currentPath,
            event_type: 'payment_flow_started',
            payment_method: 'cashfree'
          }).catch(error => {
            // Fallback to basic tracking if enhanced tracking fails
            trackingManager.trackCustomEvent('payment_flow_started', {
              payment_method: 'cashfree',
              page_path: currentPath
            });
          });
        } else if (currentPath === '/payment-return') {
          // Enhanced tracking for payment completion page
          logPageView({
            page_title: document.title,
            page_location: window.location.href,
            page_path: currentPath,
            event_type: 'payment_return_page',
            payment_method: 'cashfree'
          }).catch(error => {
            // Fallback to basic tracking if enhanced tracking fails
            trackingManager.trackCustomEvent('payment_return_page', {
              payment_method: 'cashfree',
              page_path: currentPath
            });
          });
        } else {
          // Standard page view tracking for all other pages
          logPageView({
            page_title: document.title,
            page_location: window.location.href,
            page_path: currentPath
          }).catch(error => {
            // Fallback to basic page view tracking
            trackingManager.trackPageView({
              page_title: document.title,
              page_location: window.location.href,
              page_path: currentPath
            });
          });
        }
        
        // Store tracking metadata to prevent future duplicates
        sessionStorage.setItem('lastPagePath', currentPath);
        sessionStorage.setItem('lastPageTime', Date.now().toString());
        
      } catch (error) {
        // Silent fail - don't break app functionality for tracking issues
      }
    };
    
    // Delay tracking to ensure route is fully settled
    const timeoutId = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]); // Only re-run when pathname changes

  return null;
};

/**
 * Conditional Footer Component
 * 
 * Renders the main footer only on appropriate pages.
 * Excludes footer from:
 * - Thank you pages (clean completion experience)
 * - Environment configuration pages (admin interface)
 * - Admin pages (separate admin interface)
 * - Address and payment pages (streamlined checkout)
 * - Cart page (focused shopping experience)
 * - Payment gateway pages (secure payment flow)
 */
const ConditionalFooter = () => {
  const location = useLocation();
  const isThankYouPage = location.pathname === '/thank-you' || location.pathname === '/thankyou' || location.pathname === '/ThankYou';
  const isAdminPage = location.pathname.startsWith('/myadmin');
  const isAddressPage = location.pathname === '/address' || location.pathname === '/checkout/address';
  const isPaymentPage = location.pathname === '/checkout/payment';
  const isCartPage = location.pathname === '/cart';
  const isCashfreeCheckout = location.pathname === '/cashfree-checkout';
  const isPaymentReturn = location.pathname === '/payment-return';
  
  // Hide footer on specified pages for better UX
  if (isThankYouPage || isAdminPage || isAddressPage || isPaymentPage || isCartPage || isCashfreeCheckout || isPaymentReturn) {
    return null;
  }
  
  return <Footer />;
};

/**
 * Conditional Header Component
 * 
 * Renders the main header only on appropriate pages.
 * Excludes header from:
 * - Thank you pages (clean completion experience)
 * - Environment configuration pages (admin interface)
 * - Admin pages (separate admin interface)
 * - Payment pages (secure payment flow)
 * - Payment gateway pages (focused payment experience)
 */
const ConditionalHeader = () => {
  const location = useLocation();
  const isThankYouPage = location.pathname === '/thank-you' || location.pathname === '/thankyou' || location.pathname === '/ThankYou';
  const isAdminPage = location.pathname.startsWith('/myadmin');
  const isPaymentPage = location.pathname === '/checkout/payment';
  const isCashfreeCheckout = location.pathname === '/cashfree-checkout';
  const isPaymentReturn = location.pathname === '/payment-return';
  
  // Hide header on specified pages for streamlined experience
  if (isThankYouPage || isAdminPage || isPaymentPage || isCashfreeCheckout || isPaymentReturn) {
    return null;
  }
  
  return <Header />;
};

/**
 * Optimized Router Component
 * 
 * Main routing component that manages the entire application navigation.
 * Features:
 * - Code splitting with React.lazy for optimal performance
 * - Conditional header/footer rendering based on route
 * - Page tracking for analytics
 * - Scroll restoration between routes
 * - Location context for components that need route awareness
 * - Suspense boundaries with loading states
 * - Comprehensive route definitions for all app features
 */
const OptimizedRouter = () => {
  return (
    <BrowserRouter>
      <LocationProvider>
        <ScrollToTop />
        <PageTracker />
        <div className="min-h-screen flex flex-col">
          <ConditionalHeader />
          
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Main Application Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/single-product/:id" element={<SingleProduct />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/address" element={<Checkout />} />
                <Route path="/checkout/address" element={<Checkout />} />
                <Route path="/checkout/payment" element={<Payment />} />
                
                {/* Payment Return Route */}
                <Route path="/payment-return" element={<PaymentReturn />} />
                
                {/* User Account and Wishlist Routes */}
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/thankyou" element={<ThankYou />} />
                <Route path="/ThankYou" element={<ThankYou />} />
                
                {/* Footer Information Page Routes */}
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/faqs" element={<FAQ />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/profile" element={<MyAccount />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/refund-policy" element={<ReturnPolicy />} />
                <Route path="/shippingpolicy" element={<ShippingPolicy />} />
                
                {/* Product Management Routes */}
                <Route path="/products" element={<Products />} />
                
                {/* Admin Dashboard Routes */}
                <Route path="/myadmin/login" element={<AdminLogin />} />
                <Route path="/myadmin" element={<MyAdmin />} />
                <Route path="/myadmin/products" element={<Products />} />
                <Route path="/myadmin/env" element={<EnvConfig />} />
                
                {/* Catch-all Route - Redirects to Homepage */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </main>
          
          <ConditionalFooter />
        </div>
      </LocationProvider>
    </BrowserRouter>
  );
};

export default OptimizedRouter;
