import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getButtonStyles } from '../../utils/themeColorsSimple';
import priceHelper from '../../utils/priceHelper';
import { useOffer } from '../../contexts/OfferContext';

const DynamicActionButtons = ({ 
  product, 
  selectedSize = "M",
  className = "",
  showUrgencyIndicators = true 
}) => {
  const { handleSetCartProducts, addOrUpdateCartProduct, cartProducts } = useCart();
  const navigate = useNavigate();
  
  // Offer system integration - hide fake urgency in non-offer view
  const { isEligibleForOffers } = useOffer();
  
  const [isVisible, setIsVisible] = useState(false); // Start hidden until main buttons are out of view
  const [urgencyLevel, setUrgencyLevel] = useState('medium');
  
  const buttonsRef = useRef(null);
  const productDetailsRef = useRef(null);

  // Detect when main action buttons are visible based on scroll position
  useEffect(() => {
    let timeoutId = null;
    
    const handleScroll = () => {
      // Debounce scroll events for better performance
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        // Find the main action buttons container
        const mainButtonsContainer = document.querySelector('[data-main-action-buttons]');
        
        if (!mainButtonsContainer) {
          // Fallback: show sticky buttons if main container not found
          setIsVisible(true);
          return;
        }
        
        // Get the position of the main buttons container
        const rect = mainButtonsContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Check if main buttons are visible on screen
        // Add some margin (100px) so sticky buttons hide before main buttons are fully visible
        const isMainButtonsVisible = rect.bottom > 100 && rect.top < windowHeight - 100;
        
        // Show sticky buttons only when main buttons are NOT visible
        setIsVisible(!isMainButtonsVisible);
      }, 50); // 50ms debounce
    };

    // Initial check after a small delay to ensure DOM is ready
    const initialTimeoutId = setTimeout(handleScroll, 100);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Dynamic urgency level based on time
  useEffect(() => {
    const urgencyTimer = setInterval(() => {
      const hour = new Date().getHours();
      if (hour >= 22 || hour <= 6) {
        setUrgencyLevel('high'); // Night time urgency
      } else if (hour >= 18) {
        setUrgencyLevel('medium'); // Evening
      } else {
        setUrgencyLevel('low'); // Day time
      }
    }, 60000); // Check every minute

    return () => clearInterval(urgencyTimer);
  }, []);

  const handleAddToCart = () => {
    const existingProduct = cartProducts?.find((item) => item._id === product._id);
    const productQuantity = product.quantity || 1; // Use quantity from product prop
    
    // Debug info removed for cleaner console
    
    if (!existingProduct) {
      // Add new product with selected quantity
      if (addOrUpdateCartProduct) {
        addOrUpdateCartProduct(product, productQuantity, selectedSize);
      } else {
        handleSetCartProducts([
          ...(cartProducts || []),
          { ...product, quantity: productQuantity, selectSize: selectedSize }
        ]);
      }
    } else {
      // Product exists, update quantity and navigate to cart
      if (addOrUpdateCartProduct) {
        addOrUpdateCartProduct(product, productQuantity, selectedSize);
      }
      navigate("/cart");
    }
  };

  const handleBuyNow = () => {
    // Add product to cart if not already present, or update quantity if exists
    const existingProduct = cartProducts?.find((item) => item._id === product._id);
    const productQuantity = product.quantity || 1; // Use quantity from product prop
    
    // Debug info removed for cleaner console
    
    // Always update cart with selected quantity
    if (addOrUpdateCartProduct) {
      addOrUpdateCartProduct(product, productQuantity, selectedSize);
    } else {
      if (!existingProduct) {
        handleSetCartProducts([
          ...(cartProducts || []),
          { ...product, quantity: productQuantity, selectSize: selectedSize }
        ]);
      }
    }
    
    // Set payment amount for this product with quantity
    const finalPrice = (product.discount || product.price || 0) * productQuantity;
    priceHelper.setPaymentAmount(finalPrice);
    
    // Redirect directly to address page
    navigate('/address');
  };

  const isInCart = cartProducts?.find((item) => item._id === product._id);
  
  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'high':
        return {
          addToCart: `bg-blue-600 shadow-lg`,
          container: 'shadow-2xl border-red-200'
        };
      case 'medium':
        return {
          addToCart: `bg-blue-500`,
          container: 'shadow-xl border-orange-200'
        };
      default:
        return {
          addToCart: `bg-blue-400`,
          container: 'shadow-lg border-blue-200'
        };
    }
  };

  const styles = getUrgencyStyles();

  return (
    <>
      {/* Hidden div to detect when product details go out of view */}
      <div ref={productDetailsRef} className="absolute top-0 w-1 h-1 pointer-events-none"></div>
      
      <div 
        ref={buttonsRef}
        className={`
          transition-all duration-300 ease-in-out
          fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t ${styles.container}
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          ${className}
        `}
      >
        {/* Narrow Red News Line - Only show for eligible users */}
        {isEligibleForOffers && (
          <div className="bg-red-600 text-white py-1.5 px-4 text-center overflow-hidden relative">
            <div className="flex whitespace-nowrap animate-marquee-slide">
              <span className="mx-8 flex-shrink-0 text-xs font-medium">
                🔥 FLASH SALE: Buy 3 Get Cheapest FREE + Extra 10% OFF
              </span>
              <span className="mx-8 flex-shrink-0 text-xs font-medium">
                ⚡ LIMITED TIME: Free Delivery on All Orders Today
              </span>
              <span className="mx-8 flex-shrink-0 text-xs font-medium">
                🎯 EXCLUSIVE DEAL: Same Day Delivery Available
              </span>
              <span className="mx-8 flex-shrink-0 text-xs font-medium">
                🔥 FLASH SALE: Buy 3 Get Cheapest FREE + Extra 10% OFF
              </span>
              <span className="mx-8 flex-shrink-0 text-xs font-medium">
                ⚡ LIMITED TIME: Free Delivery on All Orders Today
              </span>
              <span className="mx-8 flex-shrink-0 text-xs font-medium">
                🎯 EXCLUSIVE DEAL: Same Day Delivery Available
              </span>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-2">
          
         
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              style={getButtonStyles(false)}
              className={`
                flex-1 h-12 rounded-xl font-semibold text-white
                flex items-center justify-center space-x-2
                transform transition-all duration-200
                hover:scale-105 active:scale-95 hover:shadow-lg
                text-sm
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 4H2m5 9l-1 4a1 1 0 001 1h10a1 1 0 001-1l1-4M7 13h10" />
              </svg>
              <span>{isInCart ? "GO TO CART" : "ADD TO CART"}</span>
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className={`
                flex-1 h-12 rounded-xl font-semibold text-white
                flex items-center justify-center space-x-2
                transform transition-all duration-200
                hover:scale-105 active:scale-95 hover:shadow-lg
                text-sm
                bg-gradient-to-r from-green-700 to-green-800
                hover:from-Green-300 hover:to-green-600
                shadow-lg
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>BUY NOW</span>
            </button>
          </div>

          

        </div>
      </div>
    </>
  );
};

export default DynamicActionButtons;
