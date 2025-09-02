/**
 * Offer Manager Utility - Simplified Version
 * Provides basic offer system functionality
 */

import { getBrandName } from './envConfig';

/**
 * Get payment options based on current context
 * @param {Object} context - Payment context
 * @returns {Array} Available payment options
 */
export const getPaymentOptions = (context = {}) => {
  // Basic payment options - can be expanded based on requirements
  const baseOptions = [
    { id: 'cashfree', name: 'Cashfree Payment Gateway', enabled: true },
    { id: 'card', name: 'Credit/Debit Card', enabled: true },
    { id: 'netbanking', name: 'Net Banking', enabled: true }
  ];

  // Add COD if available in context
  if (context.isCodAvailable) {
    baseOptions.push({ id: 'cod', name: 'Cash on Delivery', enabled: true });
  }

  return baseOptions;
};

/**
 * Generate structured data for products (SEO)
 * @param {Object} product - Product data
 * @returns {Object} Structured data for SEO
 */
export const generateProductStructuredData = (product) => {
  if (!product) return {};

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name || product.title || 'Product',
    "description": product.description || product.shortDescription || 'Product description',
    "sku": product.sku || product.id || 'SKU',
    "brand": {
      "@type": "Brand",
      "name": getBrandName()
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price || product.offerPrice || 0,
      "availability": "https://schema.org/InStock"
    }
  };
};

const offerManagerUtils = {
  getPaymentOptions,
  generateProductStructuredData
};

export default offerManagerUtils;
