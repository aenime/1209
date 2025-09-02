/**
 * Payment Utilities Index
 * 
 * This file exports all payment-related utilities for easy importing.
 * Use this file to import any payment-related utilities in your components.
 */

import { 
  setPaymentAmount, 
  getPaymentAmount, 
  cleanNaNAmounts 
} from './priceHelper';

import paymentTestUtils from './paymentTestUtils';

// Re-export payment-related functions
export {
  setPaymentAmount,
  getPaymentAmount,
  cleanNaNAmounts,
  paymentTestUtils
};

/**
 * Payment Utilities
 * 
 * A collection of utilities for working with payment amounts
 */
const paymentUtils = {
  setAmount: setPaymentAmount,
  getAmount: getPaymentAmount,
  cleanNaN: cleanNaNAmounts,
  test: paymentTestUtils
};

export default paymentUtils;
