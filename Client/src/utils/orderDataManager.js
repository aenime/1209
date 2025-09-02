import storageService from '../services/storageService';
/**
 * Order Data Manager Utility
 * Manages order data storage and retrieval for payment flows
 */

/**
 * Store order data in multiple locations for reliable retrieval
 * @param {Object} orderData - Order data to store
 */
export const storeOrderData = (orderData) => {
  
  try {
    const storageData = {
      order_id: orderData.order_id,
      cf_order_id: orderData.cf_order_id,
      payment_session_id: orderData.payment_session_id,
      order_amount: orderData.order_amount,
      customer_details: orderData.customer_details,
      created_at: new Date().toISOString(),
      environment: orderData.environment,
      stored_by: 'orderDataManager'
    };

    // Store in multiple localStorage keys for maximum reliability
    const storageKeys = [
      'currentOrderData',
      'currentOrder',
      'pendingPaymentOrder'
    ];

    storageKeys.forEach(key => {
      storageService.set(key, storageData);
    });

    // Store simple order ID in multiple formats
    const idKeys = [
      'current_order_id',
      'orderId',
      'order_id',
      'prePaymentOrderId'
    ];

    idKeys.forEach(key => {
      storageService.set(key, orderData.order_id);
    });

    // Store additional identifiers
    if (orderData.cf_order_id) {
      localStorage.setItem('cf_order_id', orderData.cf_order_id);
    }
    if (orderData.payment_session_id) {
      localStorage.setItem('payment_session_id', orderData.payment_session_id);
    }

    // Also store in sessionStorage for backup
    sessionStorage.setItem('activePaymentSession', JSON.stringify(storageData));

    // Order data stored successfully with redundant storage approach

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Retrieve order data from storage
 * @returns {Object|null} - Retrieved order data or null if not found
 */
export const getOrderData = () => {
  
  try {
    // Try to get from different storage sources
    const storageSources = [
      { key: 'pendingPaymentOrder', storage: localStorage },
      { key: 'currentOrderData', storage: localStorage },
      { key: 'currentOrder', storage: localStorage },
      { key: 'activePaymentSession', storage: sessionStorage }
    ];

    for (const source of storageSources) {
      let value;
      if (source.storage === storageService) {
        value = source.storage.get(source.key);
        if (value && value.order_id) {
          return value;
        }
      } else {
        value = source.storage.getItem(source.key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.order_id) {
              return parsed;
            }
          } catch (error) {
            // Ignore parse errors
          }
        }
      }
    }

    // Fallback: try to get order ID from simple storage
    const simpleKeys = ['prePaymentOrderId', 'current_order_id', 'orderId', 'order_id'];
    for (const key of simpleKeys) {
      const value = storageService.get(key);
      if (value) {
        return { order_id: value, source: 'simple_storage' };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Clean up order data from storage
 * @param {boolean} keepBasicOrderId - Whether to keep basic order ID for thank you page
 */
export const cleanupOrderData = (keepBasicOrderId = false) => {
  
  try {
    // Get order ID before cleanup if we need to keep it
    let orderIdToKeep = null;
    if (keepBasicOrderId) {
      const orderData = getOrderData();
      orderIdToKeep = orderData?.order_id;
    }

    // Clean up all order-related storage
    const keysToClean = [
      'currentOrderData',
      'currentOrder',
      'pendingPaymentOrder',
      'prePaymentOrderId',
      'current_order_id',
      'payment_session_id',
      'cf_order_id'
    ];

    if (!keepBasicOrderId) {
      keysToClean.push('orderId', 'order_id');
    }

    let cleanedCount = 0;
    keysToClean.forEach(key => {
      if (storageService.get(key)) {
        storageService.remove(key);
        cleanedCount++;
      }
    });

    // Clean sessionStorage
    if (sessionStorage.getItem('activePaymentSession')) {
      sessionStorage.removeItem('activePaymentSession');
      cleanedCount++;
    }

    // Restore basic order ID if needed
    if (keepBasicOrderId && orderIdToKeep) {
      storageService.set('orderId', orderIdToKeep);
    }

    // Storage cleanup completed successfully

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if order data exists in storage
 * @returns {boolean} - True if order data exists
 */
export const hasOrderData = () => {
  const orderData = getOrderData();
  return !!orderData?.order_id;
};

/**
 * Get order ID only (lightweight check)
 * @returns {string|null} - Order ID or null if not found
 */
export const getOrderId = () => {
  // Quick check for order ID
  const simpleKeys = ['orderId', 'order_id', 'current_order_id', 'prePaymentOrderId'];
  
  for (const key of simpleKeys) {
    const value = storageService.get(key);
    if (value) {
      return value;
    }
  }

  // Fallback to full order data
  const orderData = getOrderData();
  return orderData?.order_id || null;
};

/**
 * Validate order data completeness
 * @param {Object} orderData - Order data to validate
 * @returns {Object} - Validation result
 */
export const validateOrderData = (orderData) => {
  try {
    // Try to get from different storage sources
    const storageSources = [
      { key: 'pendingPaymentOrder', storage: storageService },
      { key: 'currentOrderData', storage: storageService },
      { key: 'currentOrder', storage: storageService },
      { key: 'activePaymentSession', storage: sessionStorage }
    ];

    for (const source of storageSources) {
      let value;
      if (source.storage === storageService) {
        value = source.storage.get(source.key);
        if (value && value.order_id) {
          return value;
        }
      } else {
        value = source.storage.getItem(source.key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed && parsed.order_id) {
              return parsed;
            }
          } catch (error) {
            // Ignore parse errors
          }
        }
      }
    }

    // Fallback: try to get order ID from simple storage
    const simpleKeys = ['prePaymentOrderId', 'current_order_id', 'orderId', 'order_id'];
    for (const key of simpleKeys) {
      const value = storageService.get(key);
      if (value) {
        return { order_id: value, source: 'simple_storage' };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
