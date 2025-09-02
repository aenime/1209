// Centralized LocalStorage Service for E-Commerce App
class StorageService {
  constructor() {
    this.prefix = 'ecommerce_';
  }

  set(key, value, expiry = null) {
    try {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiry: expiry
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      // Check expiry
      if (parsed.expiry && Date.now() > parsed.expiry) {
        this.remove(key);
        return null;
      }
      return parsed.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  // Alias for backward compatibility
  getItem(key) {
    return this.get(key);
  }

  // Alias for backward compatibility
  setItem(key, value, expiry = null) {
    return this.set(key, value, expiry);
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  // Alias for backward compatibility
  removeItem(key) {
    return this.remove(key);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  // Specific methods
  setCart(cartData) {
    return this.set('cart', cartData, Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  }

  getCart() {
    return this.get('cart') || [];
  }

  setWishlist(wishlistData) {
    return this.set('wishlist', wishlistData);
  }

  getWishlist() {
    return this.get('wishlist') || [];
  }

  setAddress(addressData) {
    return this.set('address', addressData);
  }

  getAddress() {
    return this.get('address') || {};
  }
}

const storageService = new StorageService();
export default storageService;
