/**
 * React hooks and context imports
 */
import { createContext, useContext, useState, useEffect } from "react";

/**
 * HTTP client and API configuration
 */
import axios from "axios";
import API_BASE_URL from "../config/api";

/**
 * Storage service for data persistence
 */
import storageService from '../services/storageService';

/**
 * UI Context for global user interface state management
 */
const UIContextProvide = createContext();

/**
 * Custom hook to access UI context
 * @returns {Object} UI context value with all UI methods and state
 */
const useUI = () => useContext(UIContextProvide);

/**
 * UI Context Provider Component
 * 
 * Manages global UI state throughout the application including:
 * - Checkout step progression
 * - User address management with persistence
 * - Payment page loading states
 * - Homepage slider images and logo
 * - Address visibility toggles
 * - Add new item modal states
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 */
const UIContext = ({ children }) => {
  /**
   * UI State Variables
   */
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(() => storageService.getAddress());
  const [hideAddress, setHideAddress] = useState(false);
  const [isPaymentPageLoading, setIsPaymentPageLoading] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [logo, setLogo] = useState("");
  const [addNewItem, setAddNewItem] = useState(false);

  /**
   * Toggle Add New Item Modal
   * 
   * Controls the visibility of add new item modal in admin interfaces
   * 
   * @param {boolean} add - Whether to show or hide the modal
   */
  const handleAddNewItem = (add) => {
    setAddNewItem(add);
  };

  /**
   * Cart Unlock Function (Legacy)
   * 
   * Empty function maintained for backward compatibility.
   * Cart locking functionality has been removed from the application.
   */
  const unlockCart = () => {
    // No-op function - cart locking functionality removed
  };

  /**
   * Fetch Homepage Slider Data
   * 
   * Retrieves slider images and logo from the backend API for homepage display.
   * Includes error handling and data validation to ensure reliable UI rendering.
   * Filters out invalid images and handles cases where no data exists.
   */
  const handleSliderData = async () => {
    const url = `${API_BASE_URL}/api/slider/get`;
    
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const sliderData = response?.data?.data;
      
      // Handle case when no slider data exists in database
      if (!sliderData) {
        setSliderImages([]);
        setLogo(null);
        return;
      }
      
      // Ensure slideImages is always an array for safe iteration
      const slideImages = Array.isArray(sliderData.slideImages) ? sliderData.slideImages : [];
      
      // Filter out empty, null, or invalid image URLs
      const validSlideImages = slideImages.filter(img => img && typeof img === 'string' && img.trim() !== '');
      
      setSliderImages(validSlideImages);
      setLogo(sliderData.logo || null);
      
    } catch (error) {
      // Silently handle API failures to prevent UI breakage
      setSliderImages([]);
      setLogo(null);
    }
  };

  /**
   * Initialize slider data on component mount
   */
  useEffect(() => {
    handleSliderData();
  }, []);

  /**
   * Persist address data when it changes
   * 
   * Automatically saves user address to localStorage when address is updated
   * and contains a valid mobile number (indicating it's a complete address)
   */
  useEffect(() => {
    if (address && address.mobile) {
      storageService.setAddress(address);
    }
  }, [address]);

  /**
   * UI Context Provider Value
   * 
   * Provides UI-related state and methods to child components:
   * - step: Current checkout step (1, 2, 3, etc.)
   * - setStep: Function to update checkout step
   * - address: User's saved address information
   * - setAddress: Function to update user address
   * - hideAddress: Boolean to control address visibility
   * - setHideAddress: Function to toggle address visibility
   * - isPaymentPageLoading: Loading state for payment page
   * - setIsPaymentPageLoading: Function to control payment loading
   * - sliderImages: Array of homepage slider images
   * - logo: Application logo URL
   * - addNewItem: Add new item modal state
   * - handleAddNewItem: Function to toggle add item modal
   * - unlockCart: Legacy function for cart unlocking
   */
  return (
    <UIContextProvide.Provider
      value={{
        step,
        setStep,
        address,
        setAddress,
        hideAddress,
        setHideAddress,
        isPaymentPageLoading,
        setIsPaymentPageLoading,
        sliderImages,
        logo,
        addNewItem,
        handleAddNewItem,
        unlockCart,
      }}
    >
      {children}
    </UIContextProvide.Provider>
  );
};

export { useUI, UIContext };
