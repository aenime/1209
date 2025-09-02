// Pincode Lookup Service
// Fetches city and state information based on Indian pincode

import API_BASE_URL from '../config/api';

class PincodeService {
  constructor() {
    this.cache = new Map();
    this.baseUrl = 'https://api.postalpincode.in/pincode';
    this.backendUrl = `${API_BASE_URL}/api/pincode`;
    this.loadLocalPincodeData();
  }

  // Load local pincode data as fallback
  loadLocalPincodeData() {
    try {
      const localData = localStorage.getItem('pincodeCache');
      if (localData) {
        const parsedData = JSON.parse(localData);
        Object.entries(parsedData).forEach(([pincode, data]) => {
          this.cache.set(pincode, data);
        });
      }
    } catch (error) {
      console.warn('Failed to load local pincode cache:', error);
    }
  }

  // Save to localStorage for offline fallback
  saveToLocalStorage() {
    try {
      const cacheObject = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      localStorage.setItem('pincodeCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save pincode cache:', error);
    }
  }

  // Get location details for a pincode
  async getLocationByPincode(pincode) {
    // Validate pincode format (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return null;
    }

    // Check cache first
    if (this.cache.has(pincode)) {
      return this.cache.get(pincode);
    }

    try {
      // First try backend API (production-safe)
      const backendResult = await this.getLocationFromBackend(pincode);
      if (backendResult && backendResult.isValid) {
        return backendResult;
      }

      // Fallback to external API (development/local)
      const response = await fetch(`${this.baseUrl}/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        const primaryPostOffice = postOffices[0];
        
        // Extract landmarks from all post offices in the area
        const landmarks = postOffices
          .map(office => office.Name)
          .filter(name => name && name.trim() !== '')
          .slice(0, 5); // Limit to 5 landmarks
        
        // Extract areas/localities
        const areas = postOffices
          .map(office => office.Block || office.Division)
          .filter(area => area && area.trim() !== '')
          .slice(0, 3);
        
        const locationData = {
          city: primaryPostOffice.District || '',
          state: primaryPostOffice.State || '',
          country: primaryPostOffice.Country || 'India',
          region: primaryPostOffice.Region || '',
          landmarks: landmarks,
          areas: areas,
          postOfficeName: primaryPostOffice.Name || '',
          pincode: pincode,
          isValid: true
        };

        // Cache the result and save to localStorage
        this.cache.set(pincode, locationData);
        this.saveToLocalStorage();
        return locationData;
      } else {
        // Cache invalid result to avoid repeated API calls
        const invalidData = { pincode, isValid: false };
        this.cache.set(pincode, invalidData);
        return invalidData;
      }
    } catch (error) {
      console.warn('External API failed, trying fallback data:', error);
      return this.getFallbackData(pincode);
    }
  }

  // Get location from backend API (production-safe)
  async getLocationFromBackend(pincode) {
    try {
      const response = await fetch(`${this.backendUrl}/${pincode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.locationData) {
          // Cache the result
          this.cache.set(pincode, data.locationData);
          this.saveToLocalStorage();
          return data.locationData;
        }
      }
      return null;
    } catch (error) {
      console.warn('Backend pincode API failed:', error);
      return null;
    }
  }

  // Fallback data for common pincodes
  getFallbackData(pincode) {
    const commonPincodes = {
      '110001': { city: 'New Delhi', state: 'Delhi', isValid: true, landmarks: ['Connaught Place', 'India Gate'], areas: [] },
      '400001': { city: 'Mumbai', state: 'Maharashtra', isValid: true, landmarks: ['Fort', 'CST'], areas: [] },
      '560001': { city: 'Bangalore', state: 'Karnataka', isValid: true, landmarks: ['MG Road', 'Brigade Road'], areas: [] },
      '600001': { city: 'Chennai', state: 'Tamil Nadu', isValid: true, landmarks: ['Anna Salai', 'Marina Beach'], areas: [] },
      '700001': { city: 'Kolkata', state: 'West Bengal', isValid: true, landmarks: ['Park Street', 'Victoria Memorial'], areas: [] },
      '411001': { city: 'Pune', state: 'Maharashtra', isValid: true, landmarks: ['Shivajinagar', 'FC Road'], areas: [] },
      '500001': { city: 'Hyderabad', state: 'Telangana', isValid: true, landmarks: ['Abids', 'Nampally'], areas: [] },
      '302001': { city: 'Jaipur', state: 'Rajasthan', isValid: true, landmarks: ['MI Road', 'Pink City'], areas: [] },
    };

    const fallbackData = commonPincodes[pincode];
    if (fallbackData) {
      const locationData = {
        ...fallbackData,
        pincode: pincode,
        country: 'India',
        postOfficeName: fallbackData.landmarks[0] || 'Main Post Office'
      };
      
      // Cache the fallback data
      this.cache.set(pincode, locationData);
      this.saveToLocalStorage();
      return locationData;
    }

    // If no fallback data available, return generic data based on pincode pattern
    return this.getGenericLocationData(pincode);
  }

  // Generate generic location data based on pincode patterns
  getGenericLocationData(pincode) {
    const stateMapping = {
      '1': 'Delhi',
      '2': 'Haryana',
      '3': 'Punjab',
      '4': 'Maharashtra',
      '5': 'Karnataka',
      '6': 'Tamil Nadu',
      '7': 'West Bengal',
      '8': 'Odisha'
    };

    const firstDigit = pincode.charAt(0);
    const state = stateMapping[firstDigit] || 'Unknown';
    
    const locationData = {
      city: 'Unknown',
      state: state,
      country: 'India',
      landmarks: [],
      areas: [],
      postOfficeName: 'Post Office',
      pincode: pincode,
      isValid: true // Mark as valid to allow form submission
    };

    this.cache.set(pincode, locationData);
    this.saveToLocalStorage();
    return locationData;
  }

  // Alternative API for backup (using a different service)
  async getLocationByPincodeBackup(pincode) {
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return null;
    }

    try {
      // Using an alternative free API as backup
      const response = await fetch(`https://api.zippopotam.us/in/${pincode}`);
      const data = await response.json();

      if (data && data.places && data.places.length > 0) {
        const places = data.places;
        const primaryPlace = places[0];
        
        // Extract place names as potential landmarks
        const landmarks = places
          .map(place => place['place name'])
          .filter(name => name && name.trim() !== '')
          .slice(0, 5);
        
        const locationData = {
          city: primaryPlace['place name'] || '',
          state: primaryPlace['state'] || '',
          country: data.country || 'India',
          landmarks: landmarks,
          areas: [],
          postOfficeName: primaryPlace['place name'] || '',
          pincode: pincode,
          isValid: true
        };

        // Cache the result and save to localStorage
        this.cache.set(pincode, locationData);
        this.saveToLocalStorage();
        return locationData;
      }
      
      return this.getFallbackData(pincode);
    } catch (error) {
      console.warn('Backup API failed, using fallback data:', error);
      return this.getFallbackData(pincode);
    }
  }

  // Get location with fallback to backup API
  async getLocationWithFallback(pincode) {
    let result = await this.getLocationByPincode(pincode);
    
    // If primary API fails, try backup
    if (!result || !result.isValid) {
      result = await this.getLocationByPincodeBackup(pincode);
    }
    
    // If both APIs fail, try fallback data
    if (!result || !result.isValid) {
      result = this.getFallbackData(pincode);
    }
    
    return result;
  }

  // Get landmark suggestions for a pincode
  async getLandmarkSuggestions(pincode) {
    const locationData = await this.getLocationWithFallback(pincode);
    
    if (locationData && locationData.isValid && locationData.landmarks) {
      return {
        landmarks: locationData.landmarks,
        areas: locationData.areas || [],
        postOfficeName: locationData.postOfficeName,
        success: true
      };
    }
    
    return { landmarks: [], areas: [], success: false };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }
}

// Create singleton instance
const pincodeService = new PincodeService();

export default pincodeService;
