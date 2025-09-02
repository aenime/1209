/**
 * React hooks and context imports
 */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

/**
 * Utility imports for cart functionality
 */
import { setPaymentAmount } from "../utils/priceHelper";
import { useOffer } from "./OfferContext";
import storageService from '../services/storageService';

/**
 * Cart Context for global shopping cart state management
 */
const CartContextProvide = createContext();

/**
 * Custom hook to access cart context
 * @returns {Object} Cart context value with all cart methods and state
 */
const useCart = () => useContext(CartContextProvide);

/**
 * Cart Context Provider Component
 * 
 * Manages the global shopping cart state including:
 * - Cart products with quantities and sizes
 * - Price calculations with discounts and offers
 * - Product selection for checkout
 * - Cart persistence in localStorage
 * - Cart expiration handling
 * - Buy 2 Get 1 Free offer calculations
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 */
const CartContext = ({ children }) => {
  /**
   * Cart Products State
   * Initialized from localStorage using storageService
   */
  const [cartProducts, setCartProducts] = useState(() => storageService.getCart());
  
  /**
   * Selected Products State for Checkout
   * Tracks which products are selected for purchase
   */
  const [selectedProduct, setSelectedProduct] = useState([]);
  
  /**
   * Price State Variables
   * All initialized from localStorage with fallback to 0
   */
  const [totalPrice, setTotalPrice] = useState(() => {
    const savedPrice = storageService.get('cartTotalPrice');
    return savedPrice ? parseFloat(savedPrice) : 0;
  });
  
  const [totalMRP, setTotalMRP] = useState(() => {
    const savedMRP = storageService.get('cartTotalMRP');
    return savedMRP ? parseFloat(savedMRP) : 0;
  });
  
  const [totalDiscount, setTotalDiscount] = useState(() => {
    const savedDiscount = storageService.get('cartTotalDiscount');
    return savedDiscount ? parseFloat(savedDiscount) : 0;
  });
  
  const [totalExtraDiscount, setTotalExtraDiscount] = useState(() => {
    const savedExtraDiscount = storageService.get('cartTotalExtraDiscount');
    return savedExtraDiscount ? parseFloat(savedExtraDiscount) : 0;
  });

  /**
   * Import offer system for pricing calculations
   */
  const { isEligibleForOffers } = useOffer();

  /**
   * Update cart products and persist to localStorage
   * @param {Array} data - Array of cart product objects
   * @returns {boolean} Success status
   */
  const handleSetCartProducts = (data) => {
    setCartProducts(data);
    storageService.setCart(data);
    return true;
  };

  /**
   * Add new product to cart or update existing product quantity
   * 
   * @param {Object} product - Product object to add/update
   * @param {number} quantity - Quantity to set (default: 1)
   * @param {string} selectedSize - Size selection (default: 'M')
   * @returns {Object} Result object with action type and updated cart
   */
  const addOrUpdateCartProduct = (product, quantity = 1, selectedSize = 'M') => {
    const existingProductIndex = cartProducts.findIndex(item => item._id === product._id);
    
    if (existingProductIndex !== -1) {
      // Update existing product with new quantity and size
      const updatedCart = cartProducts.map((item, index) => {
        if (index === existingProductIndex) {
          const updatedProduct = { 
            ...item, 
            quantity: parseInt(quantity), 
            selectSize: selectedSize 
          };
          return updatedProduct;
        }
        return item;
      });
      handleSetCartProducts(updatedCart);
      return { action: 'updated', cart: updatedCart };
    } else {
      // Add new product to cart
      const newProduct = { 
        ...product, 
        quantity: parseInt(quantity), 
        selectSize: selectedSize 
      };
      const updatedCart = [...cartProducts, newProduct];
      handleSetCartProducts(updatedCart);
      return { action: 'added', cart: updatedCart };
    }
  };

  /**
   * Toggle product selection for checkout
   * 
   * @param {string} id - Product ID to toggle
   */
  const handleSelectProduct = (id) => {
    if (selectedProduct?.find((o) => o._id === id)) {
      // Remove from selection
      const selectedItem = selectedProduct.filter((o) => o._id !== id);
      setSelectedProduct(selectedItem);
      localStorage.setItem("slectedData", JSON.stringify(selectedItem));
    } else {
      // Add to selection
      const item = cartProducts.find((o) => o._id === id);
      setSelectedProduct((prevState) => {
        const seletedData = [...prevState, item];
        localStorage.setItem("slectedData", JSON.stringify(seletedData));
        return seletedData;
      });
    }
  };

  /**
   * Calculate Buy 2 Get 1 Free discount based on product count
   * 
   * For every 3 products in cart, the cheapest product becomes free.
   * This is based on unique products, not quantities.
   * 
   * @param {Array} products - Array of cart products
   * @returns {number} Total discount amount from free products
   */
  const calcProductBasedDiscount = useCallback((products) => {
    if (!products || products.length < 3) {
      return 0; // Need at least 3 products for the offer
    }

    // Count unique products (each product counts as 1, regardless of quantity)
    const productCount = products.length;
    
    // Calculate how many complete groups of 3 products we have
    const completeGroups = Math.floor(productCount / 3);
    
    if (completeGroups === 0) {
      return 0; // No complete groups, no discount
    }

    // Create array of products with their effective prices for comparison
    const productPrices = products.map((product, index) => {
      const effectivePrice = parseFloat(product.discount) || parseFloat(product.price) || 0;
      
      return {
        id: product._id,
        effectivePrice,
        title: product.title || product.name || 'Product',
        index: index + 1
      };
    });

    // Sort products by price (ascending) - cheapest first
    productPrices.sort((a, b) => a.effectivePrice - b.effectivePrice);
    
    // Calculate total discount by making cheapest products free
    let totalDiscount = 0;
    const freeProducts = [];
    
    // For each complete group of 3, make the cheapest product free
    for (let group = 0; group < completeGroups; group++) {
      const cheapestProductIndex = group; // Products are sorted by price
      if (cheapestProductIndex < productPrices.length) {
        const freeProduct = productPrices[cheapestProductIndex];
        totalDiscount += freeProduct.effectivePrice;
        freeProducts.push(freeProduct);
      }
    }

    return totalDiscount;
  }, []);

  /**
   * Memoized cart totals calculation for optimal performance
   * 
   * Calculates all cart-related pricing including:
   * - Total MRP (original prices)
   * - Total discounted price
   * - Regular discount amount
   * - Extra discount from Buy 2 Get 1 Free offer
   * 
   * Only recalculates when cartProducts, offer eligibility, or discount calc changes
   */
  const cartTotals = useMemo(() => {
    // Early return for empty or invalid cart
    if (!cartProducts || !Array.isArray(cartProducts) || cartProducts.length === 0) {
      return { totalPrice: 0, totalMRP: 0, totalDiscount: 0, totalExtraDiscount: 0 };
    }
    
    // Validate that all products have valid price data
    const hasValidProducts = cartProducts.every(p => p && (p.price || p.discount));
    if (!hasValidProducts) {
      return { totalPrice: 0, totalMRP: 0, totalDiscount: 0, totalExtraDiscount: 0 };
    }
    
    let totalPrice = 0;
    let totalMRP = 0;
    let totalDiscount = 0;
    let totalExtraDiscount = 0;

    // STEP 1: Calculate basic totals (MRP, discounted price, regular discount)
    cartProducts.forEach((product, index) => {
      const price = parseFloat(product.price) || 0;        // Original MRP price
      const discount = parseFloat(product.discount) || 0;  // Discounted price
      const quantity = parseInt(product.quantity) || 1;    // Product quantity

      // Calculate total MRP for this product
      const productMRP = price * quantity;
      
      // Use discounted price only if eligible for offers, otherwise use original price
      const effectivePrice = isEligibleForOffers ? discount : price;
      const productDiscountedTotal = effectivePrice * quantity;
      
      // Calculate regular discount (difference between MRP and discounted price)
      const productRegularDiscount = isEligibleForOffers ? (productMRP - productDiscountedTotal) : 0;

      // Add to running totals
      totalMRP += productMRP;
      totalPrice += productDiscountedTotal;  // This will be the base before extra discount
      totalDiscount += productRegularDiscount;
    });

    // STEP 2: Calculate Buy 2 Get 1 Free discount based on PRODUCT COUNT (not quantity)
    // Applied only when eligible for offers
    if (isEligibleForOffers) {
      totalExtraDiscount = calcProductBasedDiscount(cartProducts);
    }
    
    // STEP 3: Apply extra discount to final total (ensure non-negative)
    const finalTotalPrice = Math.max(0, totalPrice - totalExtraDiscount);

    return {
      totalPrice: finalTotalPrice,
      totalMRP,
      totalDiscount,
      totalExtraDiscount
    };
  }, [cartProducts, isEligibleForOffers, calcProductBasedDiscount]);

  /**
   * Update state when cart totals change
   * Syncs the memoized calculations with component state
   */
  useEffect(() => {
    setTotalPrice(cartTotals.totalPrice);
    setTotalMRP(cartTotals.totalMRP);
    setTotalDiscount(cartTotals.totalDiscount);
    setTotalExtraDiscount(cartTotals.totalExtraDiscount);
  }, [cartTotals]);

  /**
   * Save cart data to localStorage and set payment amount
   * 
   * Validates all price values and stores them in localStorage.
   * Also sets the global payment amount for checkout process.
   */
  const saveCartData = useCallback(() => {
    // Validate that all values are valid numbers
    const validTotalPrice = typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0;
    const validTotalMRP = typeof totalMRP === 'number' && !isNaN(totalMRP) ? totalMRP : 0;
    const validTotalDiscount = typeof totalDiscount === 'number' && !isNaN(totalDiscount) ? totalDiscount : 0;
    const validTotalExtraDiscount = typeof totalExtraDiscount === 'number' && !isNaN(totalExtraDiscount) ? totalExtraDiscount : 0;
    
    // Save all cart totals to localStorage
    localStorage.setItem("cartTotalPrice", String(validTotalPrice));
    localStorage.setItem("cartTotalMRP", String(validTotalMRP));
    localStorage.setItem("cartTotalDiscount", String(validTotalDiscount));
    localStorage.setItem("cartTotalExtraDiscount", String(validTotalExtraDiscount));
    
    // Set payment amount for checkout, but only if not already set
    const currentPaymentAmount = parseFloat(localStorage.getItem("paymentAmount") || 0);
    
    if (validTotalPrice > 0 && currentPaymentAmount === 0) {
      // Only set if paymentAmount is not already set (avoid overriding checkout flow)
      const success = setPaymentAmount(validTotalPrice, 'cart-context-save');
      if (!success) {
        console.log("Failed to set payment amount");
      }
    }
    
    // Store globally accessible cart amounts for payment page
    window.cartAmounts = {
      totalPrice: validTotalPrice,
      totalMRP: validTotalMRP,
      totalDiscount: validTotalDiscount,
      totalExtraDiscount: validTotalExtraDiscount
    };
  }, [totalPrice, totalMRP, totalDiscount, totalExtraDiscount]);

  /**
   * Save cart data whenever totals change
   */
  useEffect(() => {
    saveCartData();
  }, [saveCartData]);

  /**
   * Persist cart products to localStorage with expiration
   * Sets 7-minute expiration timer for cart contents
   */
  useEffect(() => {
    if (cartProducts.length > 0) {
      // Store current cart products
      localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
      
      // Set cart expiration time (7 minutes from now)
      const currentTime = new Date().getTime();
      const expirationTime = currentTime + (7 * 60 * 1000);
      localStorage.setItem("cartExpirationTime", expirationTime.toString());
    }
  }, [cartProducts]);

  /**
   * Persist selected products for checkout
   */
  useEffect(() => {
    if (selectedProduct.length > 0) {
      localStorage.setItem("slectedData", JSON.stringify(selectedProduct));
    }
  }, [selectedProduct]);

  /**
   * Initialize cart and selected products from localStorage on mount
   */
  useEffect(() => {
    const storageData = localStorage.getItem("cartProducts");
    const slectedData = localStorage.getItem("slectedData");
    
    if (storageData) {
      setCartProducts(JSON.parse(storageData));
    }
    if (slectedData) {
      setSelectedProduct(JSON.parse(slectedData));
    }
  }, []);

  /**
   * Clear all cart-related data from localStorage and state
   * Used when cart expires or user explicitly clears cart
   */
  const clearCartStorage = useCallback(() => {
    // Remove all cart-related items from localStorage
    localStorage.removeItem("cartProducts");
    localStorage.removeItem("slectedData");
    localStorage.removeItem("cartExpirationTime");
    localStorage.removeItem("cartTotalPrice");
    localStorage.removeItem("cartTotalMRP");
    localStorage.removeItem("cartTotalDiscount");
    localStorage.removeItem("cartTotalExtraDiscount");
    
    // Reset all state variables to initial values
    setCartProducts([]);
    setSelectedProduct([]);
    setTotalPrice(0);
    setTotalMRP(0);
    setTotalDiscount(0);
    setTotalExtraDiscount(0);
  }, []);

  /**
   * Check cart expiration and clear if expired
   * Runs when cart products change to ensure expired carts are cleared
   */
  useEffect(() => {
    function checkCartExpiration() {
      const currentTime = new Date().getTime();
      const expirationTime = localStorage.getItem("cartExpirationTime");
      
      // Clear cart if expiration time has passed
      if (expirationTime && currentTime >= parseInt(expirationTime, 10)) {
        clearCartStorage();
      }
    }
    
    // Only check expiration when there are products in cart
    if (cartProducts.length > 0) {
      checkCartExpiration();
    }
  }, [cartProducts.length, clearCartStorage]);

  /**
   * Cart Context Provider Value
   * 
   * Provides all cart-related state and methods to child components:
   * - cartProducts: Array of products in cart
   * - handleSetCartProducts: Function to update cart products
   * - addOrUpdateCartProduct: Function to add/update products in cart
   * - totalPrice, totalMRP, totalDiscount, totalExtraDiscount: Price calculations
   * - selectedProduct: Products selected for checkout
   * - handleSelectProduct: Function to toggle product selection
   * - clearCartStorage: Function to clear all cart data
   */
  return (
    <CartContextProvide.Provider
      value={{
        cartProducts,
        handleSetCartProducts,
        addOrUpdateCartProduct,
        totalPrice,
        setTotalPrice,
        totalDiscount,
        setTotalDiscount,
        totalMRP,
        setTotalMRP,
        totalExtraDiscount,
        setTotalExtraDiscount,
        selectedProduct,
        handleSelectProduct,
        setSelectedProduct,
        clearCartStorage,
      }}
    >
      {children}
    </CartContextProvide.Provider>
  );
};

export { useCart, CartContext };
