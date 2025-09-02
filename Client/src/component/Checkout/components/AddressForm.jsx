import React, { useState } from "react";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import pincodeService from '../../../utils/pincodeService';
import { getPrimaryThemeColor, getSecondaryThemeColor } from '../../../utils/themeColorsSimple';

// Dynamic color scheme from database
const keyColor = getPrimaryThemeColor();
const secondaryColor = getSecondaryThemeColor();

const defaultAddressValues = {
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
    .max(100, "Address line 2 must not exceed 100 characters"),
  city: Yup.string()
    .trim()
    .min(2, "City name must be at least 2 characters")
    .max(50, "City name must not exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "City name should only contain letters")
    .required("City is required"),
  state: Yup.string().required("State is required"),
});

const AddressForm = ({ initialAddress = {}, onSubmit, formRef }) => {
  const [focusedField, setFocusedField] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);
  const [landmarkSuggestions, setLandmarkSuggestions] = useState([]);
  const [showLandmarkSuggestions, setShowLandmarkSuggestions] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const initialValues = {
    ...defaultAddressValues,
    ...initialAddress,
  };

  // Pincode lookup function
  const handlePincodeChange = async (pincode, setFieldValue) => {
    setPincodeError(null);
    setLandmarkSuggestions([]);
    setShowLandmarkSuggestions(false);

    if (pincode && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      
      try {
        const locationData = await pincodeService.getLocationWithFallback(pincode);
        
        if (locationData && locationData.isValid) {
          setFieldValue('city', locationData.city);
          setFieldValue('state', locationData.state);
          setIsAutoFilled(true);
          
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
        setPincodeError('Unable to verify pincode, but you can continue');
      } finally {
        setPincodeLoading(false);
      }
    } else if (pincode && pincode.length > 0) {
      setFieldValue('city', '');
      setFieldValue('state', '');
      setLandmarkSuggestions([]);
      setShowLandmarkSuggestions(false);
      setIsAutoFilled(false);
    } else {
      setFieldValue('city', '');
      setFieldValue('state', '');
      setLandmarkSuggestions([]);
      setShowLandmarkSuggestions(false);
      setIsAutoFilled(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Shipping Details</h2>
      </div>
      
      <div className="px-4 sm:px-6 py-6">
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          enableReinitialize
          onSubmit={onSubmit}
          innerRef={formRef}
        >
          {({ values, getFieldProps, errors, touched, setFieldValue }) => (
            <form className="space-y-4 sm:space-y-5">
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
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFieldValue('pincode', value);
                    handlePincodeChange(value, setFieldValue);
                  }}
                  onKeyPress={(e) => {
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
              </div>

              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  className="w-full px-2 sm:px-3 pt-3 sm:pt-4 pb-2 sm:pb-3 border border-gray-300 rounded-md text-sm transition-all duration-200 resize-none peer placeholder-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddressForm;
