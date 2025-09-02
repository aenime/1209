import { useEffect, useRef, useState, useMemo } from "react";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useCart } from "../../contexts/CartContext";
import { useUI } from "../../contexts/UIContext";
import { useNavigate } from "react-router-dom";

import trackingManager from '../../utils/trackingManager';
import { logBeginCheckout } from '../../utils/enhancedTrackingIntegration';
import { setPaymentAmount } from '../../utils/priceHelper';
import pincodeService from '../../utils/pincodeService';
import { getPrimaryThemeColor, getSecondaryThemeColor } from '../../utils/themeColorsSimple';
import PaymentRouter from '../../utils/paymentRouter';

// Import offer system for checkout
import { useOffer } from "../../contexts/OfferContext";

// Dynamic color scheme from database
const keyColor = getPrimaryThemeColor();
const secondaryColor = getSecondaryThemeColor();

// Initialize monitoring systems (disabled for cleaner console)

// Realistic fake email generator for orders
const generateRealisticEmail = () => {
  const realisticEmails = [
    'rajesh.kumar@gmail.com',
    'priya.sharma@yahoo.com',
    'amit.patel@hotmail.com',
    'sneha.singh@gmail.com',
    'vikash.gupta@yahoo.in',
    'anjali.mehta@outlook.com',
    'rohit.agarwal@gmail.com',
    'kavita.joshi@rediffmail.com',
    'suresh.yadav@gmail.com',
    'meera.nair@yahoo.co.in',
    'arjun.reddy@gmail.com',
    'pooja.krishnan@hotmail.com',
    'manoj.tiwari@gmail.com',
    'deepika.rao@yahoo.com',
    'sanjay.verma@outlook.com',
    'ritu.bansal@gmail.com',
    'kiran.jain@rediffmail.com',
    'sachin.pandey@yahoo.in',
    'shweta.mishra@gmail.com',
    'naveen.kumar@hotmail.com',
    'sunita.devi@gmail.com',
    'rahul.chopra@yahoo.com',
    'nisha.agarwal@outlook.com',
    'vivek.singh@gmail.com',
    'neha.kapoor@rediffmail.com'
  ];
  
  const randomIndex = Math.floor(Math.random() * realisticEmails.length);
  return realisticEmails[randomIndex];
};

const defaultLensSettingValue = {
  firstName: "",
  lastName: "",
  mobile: "",
  pincode: "",
  address1: "",
  address2: "",
  landmark: "",
  city: "Mumbai",
  state: "Maharashtra",
  addressType: "home",
};

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name must not exceed 30 characters")
    .matches(/^[a-zA-Z\s]+$/, "First name should only contain letters")
    .test('no-mock-data', 'Please enter your real first name', function(value) {
      if (!value) return true;
      const mockNames = ['test', 'dummy', 'sample', 'user', 'customer'];
      return !mockNames.some(mock => value.toLowerCase().includes(mock));
    })
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .min(1, "Last name must be at least 1 character")
    .max(30, "Last name must not exceed 30 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last name should only contain letters")
    .test('no-mock-data', 'Please enter your real last name', function(value) {
      if (!value) return true;
      const mockNames = ['test', 'dummy', 'sample', 'user', 'customer', 'doe'];
      return !mockNames.some(mock => value.toLowerCase().includes(mock));
    })
    .required("Last name is required"),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
    .test('no-mock-phone', 'Please enter your real mobile number', function(value) {
      if (!value) return true;
      const mockPhones = ['9999999999', '1234567890', '0000000000'];
      return !mockPhones.includes(value);
    })
    .required("Mobile number is required"),
  pincode: Yup.string()
    .required("Pincode is required")
    .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .test('not-empty', 'Pincode cannot be blank', value => value && value.trim() !== '')
    .test('numeric-only', 'Pincode must contain only numbers', value => !value || /^\d+$/.test(value)),
  address1: Yup.string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(100, "Address must not exceed 100 characters")
    .test('no-mock-address', 'Please enter your real address', function(value) {
      if (!value) return true;
      const mockAddresses = ['test address', 'dummy address', 'sample address'];
      return !mockAddresses.some(mock => value.toLowerCase().includes(mock));
    })
    .required("Address line 1 is required"),
  address2: Yup.string()
    .trim()
    .max(100, "Address line 2 must not exceed 100 characters"), // Optional - no required validation
  city: Yup.string()
    .trim()
    .min(2, "City name must be at least 2 characters")
    .max(50, "City name must not exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "City name should only contain letters")
    .required("City is required"),
  state: Yup.string().required("State is required"),
});

const Checkout = () => {
  const {
    selectedProduct,
    totalPrice,
    totalMRP,
    totalDiscount,
    totalExtraDiscount,
    cartProducts
  } = useCart();
  
  const {
    setStep,
    address,
    setAddress,
    hideAddress,
    setHideAddress
  } = useUI();
  
  const navigate = useNavigate();
  const formikRef = useRef(null);

  // Offer system integration for checkout
  const { isEligibleForOffers, isCodAvailable } = useOffer();

  // Use CartContext totals directly - no separate checkout calculation needed
  // AuthContext is the single source of truth for all pricing
  const checkoutTotals = useMemo(() => {
    const totals = {
      originalTotal: totalMRP || 0,
      offerTotal: totalPrice || 0,
      finalTotal: totalPrice || 0
    };
    
    return totals;
  }, [totalMRP, totalPrice]);
  
  // Debug: checkout totals - removed for cleaner console

  const [initialValues, setInitialValues] = useState({
    ...defaultLensSettingValue,
    ...address,
  });

  // Add focus state tracking for floating labels
  const [focusedField, setFocusedField] = useState(null);

  // Add pincode lookup state
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);

  // Real user data quality checker
  const validateRealUserData = (values) => {
    const qualityIssues = [];
    const warnings = [];
    let qualityScore = 0;

    // Check for placeholder/mock data patterns
    const mockPatterns = {
      names: ['test', 'dummy', 'sample', 'user', 'customer', 'admin'],
      phones: ['9999999999', '1234567890', '0000000000'],
      addresses: ['test address', 'dummy address', 'sample address']
    };

    // Validate first name
    if (values.firstName) {
      const isMockName = mockPatterns.names.some(mock => 
        values.firstName.toLowerCase().includes(mock)
      );
      if (isMockName) {
        qualityIssues.push('First name appears to be placeholder text');
      } else {
        qualityScore += 20;
      }
    }

    // Validate last name
    if (values.lastName) {
      const isMockName = mockPatterns.names.some(mock => 
        values.lastName.toLowerCase().includes(mock)
      );
      if (isMockName) {
        qualityIssues.push('Last name appears to be placeholder text');
      } else {
        qualityScore += 20;
      }
    }

    // Validate phone
    if (values.mobile) {
      const isMockPhone = mockPatterns.phones.includes(values.mobile);
      if (isMockPhone) {
        qualityIssues.push('Phone number appears to be a test number');
      } else {
        qualityScore += 25; // Increased from 20 to 25 since we removed email validation
      }
    }

    // Validate address
    if (values.address1) {
      const isMockAddress = mockPatterns.addresses.some(mock => 
        values.address1.toLowerCase().includes(mock)
      );
      if (isMockAddress) {
        qualityIssues.push('Address appears to be placeholder text');
      } else {
        qualityScore += 20;
      }
    }

    const result = {
      qualityScore,
      qualityIssues,
      warnings,
      isHighQuality: qualityScore >= 80,
      isMediumQuality: qualityScore >= 60,
      dataSource: qualityScore >= 80 ? 'high_quality_real_data' : 
                  qualityScore >= 60 ? 'medium_quality_data' : 
                  qualityScore >= 40 ? 'low_quality_data' : 'mostly_placeholder_data'
    };

    // Log data quality for debugging (disabled for cleaner console)
    // if (Object.keys(values).length > 4) { 
    // }

    return result;
  };
  const [landmarkSuggestions, setLandmarkSuggestions] = useState([]);
  const [showLandmarkSuggestions, setShowLandmarkSuggestions] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    setInitialValues({ ...defaultLensSettingValue, ...address });
  }, [address]);

  useEffect(() => {
    if (hideAddress) {
      window.scrollTo(0, 0);
    }
  }, [hideAddress]);

  // Track checkout initiation when component mounts
  useEffect(() => {
    // Use either locked cart data or the current product selection
    let products;
    
    // Use current products selection 
    products = selectedProduct;
    
    if (products && products.length > 0) {
      // Check if this exact event was already tracked recently
      const lastTrackedTime = sessionStorage.getItem('last_checkout_time');
      const now = Date.now();
      
      // Only track if more than 5 seconds have passed since last checkout tracking
      if (!lastTrackedTime || (now - parseInt(lastTrackedTime)) > 5000) {
        const items = products.map((product, index) => ({
          item_id: product.id?.toString() || `item_${index}`,
          item_name: product.name || 'Unknown Product',
          item_category: product.category || 'Uncategorized',
          price: parseFloat(product.price) || 0,
          quantity: parseInt(product.quantity) || 1
        }));

        const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Use enhanced tracking with auto-initialization
        logBeginCheckout({
          value: totalValue,
          currency: 'INR',
          items: items
        }).catch(error => {
          // Fallback to direct tracking manager call
          trackingManager.trackInitiateCheckout({
            value: totalValue,
            currency: 'INR',
            items: items
          });
        });

        // Store the current tracking time
        sessionStorage.setItem('last_checkout_time', now.toString());
      }
    }
  }, [selectedProduct, cartProducts, totalMRP, totalPrice, totalDiscount, totalExtraDiscount, isEligibleForOffers]);

  const handleAddress = (values) => {
    // Validate real user data quality
    const dataQuality = validateRealUserData(values);
    
    // Check if we have all required fields
    const requiredFields = ['firstName', 'lastName', 'mobile', 'pincode', 'address1', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !values[field] || values[field].trim() === '');
    
    if (missingFields.length > 0) {
      return;
    }
    
    // Store address in both state and localStorage for persistence
    setAddress(values);
    localStorage.setItem("checkoutAddress", JSON.stringify(values));
    
    // Store data quality information for backend
    localStorage.setItem("checkoutDataQuality", JSON.stringify({
      qualityScore: dataQuality.qualityScore,
      dataSource: dataQuality.dataSource,
      isHighQuality: dataQuality.isHighQuality,
      timestamp: new Date().toISOString()
    }));
    
    // Store address in both state and localStorage for persistence
    setAddress(values);
    localStorage.setItem("checkoutAddress", JSON.stringify(values));
    
    // Generate and store transaction ID early in the process
    const existingOrderId = localStorage.getItem("orderId");
    if (!existingOrderId) {
      const generateOrderID = () => {
        const min = 1000000000;
        const max = 9999999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };
      
      const newOrderId = generateOrderID();
      localStorage.setItem("orderId", newOrderId);
    }
    
    // Use AuthContext totalPrice directly as the payment amount
    const finalPaymentAmount = totalPrice || 0;
    
    const success = setPaymentAmount(finalPaymentAmount, 'checkout-address');
    
    if (!success) {
      localStorage.setItem("cartTotalPrice", finalPaymentAmount);
    }
    
    // Store pricing details
    const mrpToStore = isEligibleForOffers ? checkoutTotals.originalTotal : (totalMRP || 0);
    const discountToStore = isEligibleForOffers ? (checkoutTotals.originalTotal - checkoutTotals.offerTotal) : (totalDiscount || 0);
    const extraDiscountToStore = totalExtraDiscount || 0;
    
    localStorage.setItem("cartTotalMRP", mrpToStore);
    localStorage.setItem("cartTotalDiscount", discountToStore);
    localStorage.setItem("cartTotalExtraDiscount", extraDiscountToStore);
    
    // Store selected products for tracking
    localStorage.setItem("checkoutProducts", JSON.stringify(selectedProduct || []));
    
    setHideAddress(true);
    setStep(3);
  };

  // Pincode lookup function
  const handlePincodeChange = async (pincode, setFieldValue) => {
    // Reset previous errors and suggestions
    setPincodeError(null);
    setLandmarkSuggestions([]);
    setShowLandmarkSuggestions(false);

    // Only proceed if pincode is 6 digits
    if (pincode && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      
      try {
        const locationData = await pincodeService.getLocationWithFallback(pincode);
        
        if (locationData && locationData.isValid) {
          // Auto-fill city and state
          setFieldValue('city', locationData.city);
          setFieldValue('state', locationData.state);
          
          // Mark as auto-filled to make fields read-only
          setIsAutoFilled(true);
          
          // Set landmark suggestions
          if (locationData.landmarks && locationData.landmarks.length > 0) {
            const suggestions = [
              ...locationData.landmarks,
              ...(locationData.areas || [])
            ].filter(item => item && item.trim() !== '');
            
            setLandmarkSuggestions(suggestions);
            setShowLandmarkSuggestions(true);
          }
        } else {
          setPincodeError('Invalid pincode or location not found');
        }
      } catch (error) {
        console.warn('Pincode lookup failed:', error);
        // Don't show error to user immediately, the service will provide fallback data
        setPincodeError('Unable to verify pincode, but you can continue');
      } finally {
        setPincodeLoading(false);
      }
    } else if (pincode && pincode.length > 0) {
      // Clear city and state if pincode is incomplete
      setFieldValue('city', '');
      setFieldValue('state', '');
      setLandmarkSuggestions([]);
      setShowLandmarkSuggestions(false);
      setIsAutoFilled(false); // Reset auto-fill state
    } else {
      // Clear everything if pincode is empty
      setFieldValue('city', '');
      setFieldValue('state', '');
      setLandmarkSuggestions([]);
      setShowLandmarkSuggestions(false);
      setIsAutoFilled(false); // Reset auto-fill state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideAddress ? (
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          enableReinitialize
          onSubmit={handleAddress}
          innerRef={formikRef}
        >
          {({ values, getFieldProps, errors, touched, setFieldValue }) => {
            return (
              <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <div className="flex items-center">
                        <button 
                          onClick={() => window.history.back()}
                          className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Add shipping address</h1>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Container - Mobile-Optimized Professional Design */}
                <div className="max-w-md mx-auto px-2 sm:px-4 py-3 sm:py-6 pb-24">{/* Added bottom padding for sticky button */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    
                    
                    <div className="px-3 sm:px-6 py-4 sm:py-6">
                      <form className="space-y-4 sm:space-y-5">
                        {/* Contact Information Section */}
                        <div className="space-y-4 sm:space-y-5">
                         
                          
                          {/* Phone Number */}
                          <div className="relative">
                            <div className="flex">
                              <div className="flex items-center px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm text-gray-600">
                                +91
                              </div>
                              <input
                                id="mobile"
                                type="tel"
                                name="mobile"
                                autoComplete="tel"
                                maxLength="10"
                                className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-r-md text-sm transition-all duration-200 peer placeholder-transparent ${
                                  errors.mobile && touched.mobile
                                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-2 focus:ring-opacity-50'
                                }`}
                                style={{
                                  '--tw-ring-color': secondaryColor,
                                  borderColor: errors.mobile && touched.mobile ? '' : (values.mobile || focusedField === 'mobile' ? keyColor : ''),
                                }}
                                placeholder="Phone number"
                                onFocus={() => setFocusedField('mobile')}
                                onBlur={() => setFocusedField(null)}
                                {...getFieldProps("mobile")}
                              />
                            </div>
                            <label 
                              htmlFor="mobile"
                              className={`absolute left-12 sm:left-14 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                values.mobile || focusedField === 'mobile'
                                  ? '-top-2 text-xs font-medium' 
                                  : 'top-3 sm:top-3.5 text-sm'
                              }`}
                              style={{
                                color: values.mobile || focusedField === 'mobile' ? keyColor : ''
                              }}
                            >
                              Phone number <span className="text-red-500">*</span>
                            </label>
                            <ErrorMessage
                              component="div"
                              name="mobile"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>
                        </div>

                        {/* Delivery Section */}
                        <div className="space-y-4 sm:space-y-5">
                          {/* Pincode Field */}
                          <div className="relative">
                            <input
                              id="pincode"
                              type="text"
                              name="pincode"
                              autoComplete="postal-code"
                              maxLength="6"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 peer placeholder-transparent ${
                                errors.pincode && touched.pincode
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                  : pincodeLoading
                                  ? 'focus:ring-2 focus:ring-opacity-50'
                                  : 'border-gray-300 focus:ring-2 focus:ring-opacity-50'
                              }`}
                              style={{
                                '--tw-ring-color': secondaryColor,
                                borderColor: errors.pincode && touched.pincode ? '' : 
                                           pincodeLoading ? keyColor :
                                           (values.pincode || focusedField === 'pincode' ? keyColor : ''),
                              }}
                              placeholder="Pincode"
                              onFocus={() => setFocusedField('pincode')}
                              onBlur={() => setFocusedField(null)}
                              onChange={(e) => {
                                // Only allow numeric input
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFieldValue('pincode', value);
                                handlePincodeChange(value, setFieldValue);
                              }}
                              onKeyPress={(e) => {
                                // Prevent non-numeric characters from being typed
                                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              value={values.pincode}
                            />
                            {pincodeLoading && (
                              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                                <div 
                                  className="animate-spin rounded-full h-4 w-4 border-b-2"
                                  style={{ borderBottomColor: keyColor }}
                                ></div>
                              </div>
                            )}
                            <label 
                              htmlFor="pincode"
                              className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                values.pincode || focusedField === 'pincode'
                                  ? '-top-2 text-xs font-medium' 
                                  : 'top-2.5 sm:top-3 text-sm'
                              }`}
                              style={{
                                color: values.pincode || focusedField === 'pincode' ? keyColor : ''
                              }}
                            >
                              Pincode <span className="text-red-500">*</span>
                            </label>
                            <ErrorMessage
                              component="div"
                              name="pincode"
                              className="text-red-600 text-xs mt-1"
                            />
                            {pincodeError && (
                              <div className="text-orange-600 text-xs mt-1">
                                {pincodeError}
                              </div>
                            )}
                            {!pincodeError && values.pincode && values.pincode.length > 0 && values.pincode.length < 6 && (
                              <div className="text-xs mt-1" style={{ color: keyColor }}>
                                Enter exactly 6 digits ({values.pincode.length}/6)
                              </div>
                            )}
                            {!pincodeError && !values.pincode && (
                              <div className="text-gray-500 text-xs mt-1">
                                Enter 6-digit numeric pincode (numbers only)
                              </div>
                            )}
                          </div>

                          {/* Name Fields Row */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="relative">
                              <input
                                id="firstName"
                                type="text"
                                name="firstName"
                                autoComplete="given-name"
                                maxLength="60"
                                className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 peer placeholder-transparent ${
                                  errors.firstName && touched.firstName
                                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-2 focus:ring-opacity-50'
                                }`}
                                style={{
                                  '--tw-ring-color': secondaryColor,
                                  borderColor: errors.firstName && touched.firstName ? '' : (values.firstName || focusedField === 'firstName' ? keyColor : ''),
                                }}
                                placeholder="First name"
                                onFocus={() => setFocusedField('firstName')}
                                onBlur={() => setFocusedField(null)}
                                {...getFieldProps("firstName")}
                              />
                              <label 
                                htmlFor="firstName"
                                className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                  values.firstName || focusedField === 'firstName'
                                    ? '-top-2 text-xs font-medium' 
                                    : 'top-2.5 sm:top-3 text-sm'
                                }`}
                                style={{
                                  color: values.firstName || focusedField === 'firstName' ? keyColor : ''
                                }}
                              >
                                First name <span className="text-red-500">*</span>
                              </label>
                              <ErrorMessage
                                component="div"
                                name="firstName"
                                className="text-red-600 text-xs mt-1"
                              />
                            </div>

                            <div className="relative">
                              <input
                                id="lastName"
                                type="text"
                                name="lastName"
                                autoComplete="family-name"
                                maxLength="60"
                                className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 peer placeholder-transparent ${
                                  errors.lastName && touched.lastName
                                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-2 focus:ring-opacity-50'
                                }`}
                                style={{
                                  '--tw-ring-color': secondaryColor,
                                  borderColor: errors.lastName && touched.lastName ? '' : (values.lastName || focusedField === 'lastName' ? keyColor : ''),
                                }}
                                placeholder="Last name"
                                onFocus={() => setFocusedField('lastName')}
                                onBlur={() => setFocusedField(null)}
                                {...getFieldProps("lastName")}
                              />
                              <label 
                                htmlFor="lastName"
                                className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                  values.lastName || focusedField === 'lastName'
                                    ? '-top-2 text-xs font-medium' 
                                    : 'top-2.5 sm:top-3 text-sm'
                                }`}
                                style={{
                                  color: values.lastName || focusedField === 'lastName' ? keyColor : ''
                                }}
                              >
                                Last name <span className="text-red-500">*</span>
                              </label>
                              <ErrorMessage
                                component="div"
                                name="lastName"
                                className="text-red-600 text-xs mt-1"
                              />
                            </div>
                          </div>

                          {/* Address Line 1 */}
                          <div className="relative">
                            <textarea
                              id="address1"
                              name="address1"
                              autoComplete="address-line1"
                              maxLength="255"
                              rows="2"
                              className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 resize-none peer placeholder-transparent ${
                                errors.address1 && touched.address1
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                  : 'border-gray-300 focus:ring-2 focus:ring-opacity-50'
                              }`}
                              style={{
                                '--tw-ring-color': secondaryColor,
                                borderColor: errors.address1 && touched.address1 ? '' : (values.address1 || focusedField === 'address1' ? keyColor : ''),
                              }}
                              placeholder="Flat, house number, floor, building"
                              onFocus={() => setFocusedField('address1')}
                              onBlur={() => setFocusedField(null)}
                              {...getFieldProps("address1")}
                            />
                            <label 
                              htmlFor="address1"
                              className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                values.address1 || focusedField === 'address1'
                                  ? '-top-2 text-xs font-medium' 
                                  : 'top-3 sm:top-4 text-sm'
                              }`}
                              style={{
                                color: values.address1 || focusedField === 'address1' ? keyColor : ''
                              }}
                            >
                              Address <span className="text-red-500">*</span>
                            </label>
                            <ErrorMessage
                              component="div"
                              name="address1"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>

                          {/* Address Line 2 */}
                          <div className="relative">
                            <textarea
                              id="address2"
                              name="address2"
                              autoComplete="address-line2"
                              maxLength="170"
                              rows="2"
                              className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 resize-none peer placeholder-transparent ${
                                errors.address2 && touched.address2
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                              }`}
                              placeholder="Area, street, sector, village"
                              onFocus={() => setFocusedField('address2')}
                              onBlur={() => setFocusedField(null)}
                              {...getFieldProps("address2")}
                            />
                            <label 
                              htmlFor="address2"
                              className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                values.address2 || focusedField === 'address2'
                                  ? '-top-2 text-xs font-medium text-blue-600' 
                                  : 'top-3 sm:top-4 text-sm'
                              }`}
                            >
                              Apartment, suite, etc. (optional)
                            </label>
                            <ErrorMessage
                              component="div"
                              name="address2"
                              className="text-red-600 text-xs mt-1"
                            />
                          </div>

                          {/* City and State Row */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="relative">
                              <input
                                id="city"
                                type="text"
                                name="city"
                                autoComplete="address-level2"
                                maxLength="100"
                                disabled={isAutoFilled}
                                className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 peer placeholder-transparent ${
                                  errors.city && touched.city
                                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : isAutoFilled
                                    ? 'border-green-300 bg-green-50 text-gray-700 cursor-not-allowed'
                                    : values.city && !focusedField
                                    ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-green-50'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                }`}
                                placeholder="City"
                                onFocus={() => !isAutoFilled && setFocusedField('city')}
                                onBlur={() => setFocusedField(null)}
                                {...getFieldProps("city")}
                              />
                              {values.city && !focusedField && (
                                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                              <label 
                                htmlFor="city"
                                className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                  values.city || focusedField === 'city'
                                    ? '-top-2 text-xs font-medium text-blue-600' 
                                    : 'top-2.5 sm:top-3 text-sm'
                                }`}
                              >
                                City <span className="text-red-500">*</span>
                              </label>
                              <ErrorMessage
                                component="div"
                                name="city"
                                className="text-red-600 text-xs mt-1"
                              />
                              {isAutoFilled && (
                                <div className="text-xs text-green-600 mt-1 flex items-center">
                                  <span className="mr-1">🔒</span>
                                  Auto-filled from pincode
                                </div>
                              )}
                            </div>

                            <div className="relative">
                              <input
                                id="state"
                                type="text"
                                name="state"
                                autoComplete="address-level1"
                                disabled={isAutoFilled}
                                className={`w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border rounded-md text-sm transition-all duration-200 peer placeholder-transparent ${
                                  errors.state && touched.state
                                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : isAutoFilled
                                    ? 'border-green-300 bg-green-50 text-gray-700 cursor-not-allowed'
                                    : values.state && !focusedField
                                    ? 'border-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-green-50'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                }`}
                                placeholder="State"
                                onFocus={() => !isAutoFilled && setFocusedField('state')}
                                onBlur={() => setFocusedField(null)}
                                {...getFieldProps("state")}
                              />
                              {values.state && !focusedField && (
                                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                              <label 
                                htmlFor="state"
                                className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                  values.state || focusedField === 'state'
                                    ? '-top-2 text-xs font-medium text-blue-600' 
                                    : 'top-2.5 sm:top-3 text-sm'
                                }`}
                              >
                                State <span className="text-red-500">*</span>
                              </label>
                              <ErrorMessage
                                component="div"
                                name="state"
                                className="text-red-600 text-xs mt-1"
                              />
                              {isAutoFilled && (
                                <div className="text-xs text-green-600 mt-1 flex items-center">
                                  <span className="mr-1">🔒</span>
                                  Auto-filled from pincode
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Landmark (Optional) */}
                          <div className="relative">
                            <input
                              id="landmark"
                              type="text"
                              name="landmark"
                              maxLength="50"
                              className="w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 peer placeholder-transparent"
                              placeholder="Landmark"
                              onFocus={() => {
                                setFocusedField('landmark');
                                if (landmarkSuggestions.length > 0) {
                                  setShowLandmarkSuggestions(true);
                                }
                              }}
                              onBlur={() => {
                                setFocusedField(null);
                                // Delay hiding suggestions to allow clicking
                                setTimeout(() => setShowLandmarkSuggestions(false), 200);
                              }}
                              {...getFieldProps("landmark")}
                            />
                            <label 
                              htmlFor="landmark"
                              className={`absolute left-2 sm:left-3 px-1 text-gray-600 transition-all duration-200 pointer-events-none bg-white ${
                                values.landmark || focusedField === 'landmark'
                                  ? '-top-2 text-xs font-medium text-blue-600' 
                                  : 'top-2.5 sm:top-3 text-sm'
                              }`}
                            >
                              Landmark (optional)
                            </label>
                            
                            {/* Landmark Suggestions Dropdown */}
                            {showLandmarkSuggestions && landmarkSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                <div className="p-1 sm:p-2">
                                  <div className="text-xs text-gray-500 mb-1 sm:mb-2 font-medium px-1">Suggested landmarks:</div>
                                  {landmarkSuggestions.map((suggestion, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      className="w-full text-left px-2 sm:px-3 py-1 sm:py-2 text-sm text-gray-700 rounded transition-colors duration-150 hover:bg-opacity-10"
                                      style={{
                                        '--hover-bg': keyColor,
                                        '--hover-text': keyColor,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = `${keyColor}1a`;
                                        e.target.style.color = keyColor;
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '';
                                        e.target.style.color = '';
                                      }}
                                      onClick={() => {
                                        setFieldValue('landmark', suggestion);
                                        setShowLandmarkSuggestions(false);
                                      }}
                                    >
                                      📍 {suggestion}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Landmark Info */}
                          {landmarkSuggestions.length > 0 && !showLandmarkSuggestions && (
                            <div className="text-xs text-blue-600 mt-1">
                              💡 Tap the landmark field to see {landmarkSuggestions.length} suggestions for this area
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 sm:pt-6 pb-0">
                          {/* Spacer for sticky button */}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Bottom padding */}
                <div className="h-4 sm:h-6"></div>

                {/* Sticky Bottom Button for Address Form */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                  <div className="max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (formikRef?.current) {
                          const formik = formikRef.current;
                          
                          // Manually trigger validation first
                          formik.validateForm().then(errors => {
                            if (Object.keys(errors).length === 0) {
                              formik.submitForm();
                            } else {
                              // Scroll to first error
                              const firstErrorField = Object.keys(errors)[0];
                              const element = document.getElementById(firstErrorField);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                element.focus();
                              }
                            }
                          });
                        }
                      }}
                      className="w-full text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                      style={{
                        backgroundColor: keyColor,
                        '--tw-ring-color': secondaryColor,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = `${keyColor}dd`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = keyColor;
                      }}
                    >
                      <span>Continue to Shipping</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        </Formik>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Shopify-style Header for Address Review */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button 
                    onClick={() => setHideAddress(false)}
                    className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h1 className="text-lg font-semibold text-gray-900">Review order</h1>
                </div>
                <div className="text-sm text-gray-500">
                  Step 2 of 3
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">{/* Added bottom padding for sticky button */}
            {/* Shipping Address Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Shipping address</h2>
                <button
                  onClick={() => setHideAddress(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
              </div>
              
              <div className="px-6 py-6">
                <div className="text-gray-900">
                  <div className="font-medium text-base mb-2">
                    {address?.firstName} {address?.lastName}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{address?.address1}</div>
                    {address?.address2 && <div>{address?.address2}</div>}
                    <div>{address?.city}, {address?.state} {address?.pincode}</div>
                    <div>India</div>
                    <div className="pt-2">{address?.mobile}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Shipping method</h2>
              </div>
              
              <div className="px-6 py-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Standard Shipping</div>
                      <div className="text-sm text-gray-600">5-8 business days</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">FREE</div>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
              </div>
              
              <div className="px-6 py-6 space-y-4">
                {/* Items */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({selectedProduct?.length || 0} item{selectedProduct?.length !== 1 ? 's' : ''})
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{checkoutTotals.originalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Discount - only show for eligible users */}
                {isEligibleForOffers && checkoutTotals.originalTotal > checkoutTotals.offerTotal && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -₹{(checkoutTotals.originalTotal - checkoutTotals.offerTotal).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{checkoutTotals.finalTotal.toLocaleString()}
                    </span>
                  </div>
                  {/* Savings badge - only for eligible users */}
                  {isEligibleForOffers && checkoutTotals.originalTotal > checkoutTotals.offerTotal && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        You saved ₹{(checkoutTotals.originalTotal - checkoutTotals.offerTotal).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-6 pb-20">
              {/* Spacer for sticky button */}
            </div>
          </div>

          {/* Sticky Bottom Button for Review Section */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-md mx-auto">
              <button
                onClick={async () => {
                  setStep(3);
                  
                  // Debug: Check total price value
                  console.log("🔍 Checkout - Total price before navigation:", totalPrice);
                  console.log("🔍 Checkout - Address data:", address);
                  
                  // Validate total price
                  if (!totalPrice || totalPrice <= 0) {
                    console.error("❌ Checkout - Invalid total price, cannot proceed to payment");
                    alert("Invalid order total. Please refresh and try again.");
                    return;
                  }
                  
                  // Build order details with real customer data from current address
                  const realOrderDetails = {
                    total: totalPrice || 0,
                    customerId: address?.mobile ? `customer_${address.mobile.slice(-4)}_${Date.now()}` : `guest_${Date.now()}`,
                    customerName: address?.firstName && address?.lastName ? 
                                 `${address.firstName} ${address.lastName}` : 'Customer',
                    customerEmail: generateRealisticEmail(), // Generate realistic fake email
                    customerPhone: address?.mobile || `91${Date.now().toString().slice(-8)}`,
                    shippingAddress: address
                  };
                  
                  console.log("🔍 Checkout - Built order details:", realOrderDetails);

                  // Use our updated PaymentRouter which stores data securely
                  await PaymentRouter.handleCheckoutNavigation(navigate, realOrderDetails, {
                    isEligibleForOffers: isEligibleForOffers,
                    isCodAvailable: isCodAvailable
                  });
                }}
                className="w-full bg-black text-white px-8 py-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center space-x-2"
              >
                <span>Continue to Shipping</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
