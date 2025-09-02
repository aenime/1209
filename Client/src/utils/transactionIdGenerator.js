/**
 * Transaction ID Generator Utility
 * Generates and manages unique transaction IDs based on order ID, payment method, and amount
 * Stores the generated IDs in local storage with a 15-minute expiration
 */

/**
 * Generates a unique transaction ID based on order ID, payment method, and amount
 * @param {string} orderId - The order ID
 * @param {string} paymentMethod - The payment method used
 * @param {number|string} amount - The transaction amount
 * @returns {string} - A unique transaction ID
 */
export const generateTransactionId = (orderId, paymentMethod, amount) => {
  if (!orderId) {
    return null;
  }

  // Add a timestamp component for uniqueness
  const timestamp = new Date().getTime();
  
  // Add a random component to ensure uniqueness
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Combine everything to create a unique ID
  const transactionId = `TXN-${orderId}-${randomPart}-${timestamp.toString().slice(-6)}`;
  
  return transactionId;
};

/**
 * Stores a transaction ID in local storage with a 15-minute expiration
 * @param {string} transactionId - The transaction ID to store
 * @param {string} orderId - The associated order ID
 * @param {string} paymentMethod - The payment method used
 * @param {number|string} amount - The transaction amount
 */
export const storeTransactionId = (transactionId, orderId, paymentMethod, amount) => {
  if (!transactionId || !orderId) {
    return;
  }

  try {
    // Create storage object with metadata and expiration
    const storageObject = {
      id: transactionId,
      orderId,
      paymentMethod: paymentMethod || 'unknown',
      amount: amount || '0',
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + (15 * 60 * 1000) // 15 minutes
    };
    
    // Store in localStorage
    localStorage.setItem('transactionIdData', JSON.stringify(storageObject));
    localStorage.setItem('transactionId', transactionId);
    
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Retrieves the stored transaction ID from local storage
 * Validates it against the provided parameters and checks if it's expired
 * @param {string} orderId - The order ID to validate against
 * @param {string} paymentMethod - The payment method to validate
 * @param {number|string} amount - The transaction amount to validate
 * @returns {string|null} - The stored transaction ID if valid, null otherwise
 */
export const getStoredTransactionId = (orderId, paymentMethod, amount) => {
  try {
    // Check for basic transaction ID
    const transactionId = localStorage.getItem('transactionId');
    
    // Check for detailed transaction data
    const transactionDataString = localStorage.getItem('transactionIdData');
    if (!transactionDataString) {
      return null;
    }
    
    const transactionData = JSON.parse(transactionDataString);
    
    // Check if expired
    const currentTime = new Date().getTime();
    if (currentTime > transactionData.expiresAt) {
      
      clearTransactionId(); // Clean up expired data
      return null;
    }
    
    // Verify the transaction data if orderId is provided
    if (orderId && transactionData.orderId !== orderId) {
      
      return null;
    }
    
    return transactionId;
  } catch (error) {
    return null;
  }
};

/**
 * Removes transaction ID data from local storage
 */
export const clearTransactionId = () => {
  localStorage.removeItem('transactionId');
  localStorage.removeItem('transactionIdData');
};

/**
 * Gets or generates a transaction ID based on order ID, payment method, and amount
 * @param {string} orderId - The order ID
 * @param {string} paymentMethod - The payment method used
 * @param {number|string} amount - The transaction amount
 * @returns {string} - A transaction ID (either stored or newly generated)
 */
export const getOrGenerateTransactionId = (orderId, paymentMethod, amount) => {
  if (!orderId) {
    
    return null;
  }
  
  // First, check if this order was already tracked in the current session
  // This ensures we use the same transaction ID even if the page is refreshed
  const trackedId = getTrackedTransactionId(orderId);
  if (trackedId) {
    
    return trackedId;
  }
  
  // Next, try to get existing transaction ID from localStorage
  const existingId = getStoredTransactionId(orderId, paymentMethod, amount);
  if (existingId) {
    return existingId;
  }
  
  // Generate a new one if not found or expired
  const newTransactionId = generateTransactionId(orderId, paymentMethod, amount);
  
  // Store the new ID
  storeTransactionId(newTransactionId, orderId, paymentMethod, amount);
  
  
  return newTransactionId;
};

/**
 * Gets transaction ID from sessionStorage tracked purchases
 * This ensures we use a consistent transaction ID even when the page is refreshed
 * @param {string} orderId - The order ID to check
 * @returns {string|null} - Existing transaction ID or null
 */
export const getTrackedTransactionId = (orderId) => {
  if (!orderId) return null;
  
  try {
    // Check tracked purchases in sessionStorage
    const trackedTransactions = sessionStorage.getItem('tracked_purchases') || '{}';
    const trackedTransactionsObj = JSON.parse(trackedTransactions);
    
    // If we have a transaction ID for this order ID, use it
    if (trackedTransactionsObj[orderId]) {
      
      return orderId;
    }
    
    // Check if any transaction key contains this order ID
    for (const key in trackedTransactionsObj) {
      if (key.includes(orderId)) {
        
        return key;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

const transactionIdGenerator = {
  generateTransactionId,
  storeTransactionId,
  getStoredTransactionId,
  clearTransactionId,
  getOrGenerateTransactionId,
  getTrackedTransactionId
};

export default transactionIdGenerator;
