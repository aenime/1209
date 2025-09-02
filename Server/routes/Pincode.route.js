const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');

// Cache for pincode data to avoid repeated API calls
const pincodeCache = new Map();

// Get location details for a pincode
router.get('/:pincode', async (req, res) => {
  const { pincode } = req.params;
  
  // Validate pincode format
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid pincode format. Must be 6 digits.'
    });
  }

  try {
    // Check cache first
    if (pincodeCache.has(pincode)) {
      const cachedData = pincodeCache.get(pincode);
      return res.json({
        success: true,
        locationData: cachedData,
        source: 'cache'
      });
    }

    // Try to fetch from external API
    const locationData = await fetchPincodeData(pincode);
    
    if (locationData && locationData.isValid) {
      // Cache the result
      pincodeCache.set(pincode, locationData);
      
      return res.json({
        success: true,
        locationData: locationData,
        source: 'api'
      });
    } else {
      // Return fallback data for common pincodes
      const fallbackData = getFallbackData(pincode);
      if (fallbackData) {
        pincodeCache.set(pincode, fallbackData);
        return res.json({
          success: true,
          locationData: fallbackData,
          source: 'fallback'
        });
      }
      
      return res.status(404).json({
        success: false,
        error: 'Pincode not found'
      });
    }
  } catch (error) {
    console.error('Pincode lookup error:', error);
    
    // Try fallback data
    const fallbackData = getFallbackData(pincode);
    if (fallbackData) {
      return res.json({
        success: true,
        locationData: fallbackData,
        source: 'fallback'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Fetch pincode data from external API
async function fetchPincodeData(pincode) {
  return new Promise((resolve, reject) => {
    const url = `https://api.postalpincode.in/pincode/${pincode}`;
    
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (jsonData && jsonData[0] && jsonData[0].Status === 'Success' && 
              jsonData[0].PostOffice && jsonData[0].PostOffice.length > 0) {
            
            const postOffices = jsonData[0].PostOffice;
            const primaryPostOffice = postOffices[0];
            
            // Extract landmarks
            const landmarks = postOffices
              .map(office => office.Name)
              .filter(name => name && name.trim() !== '')
              .slice(0, 5);
            
            // Extract areas
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
            
            resolve(locationData);
          } else {
            resolve({ pincode, isValid: false });
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Fallback data for common pincodes
function getFallbackData(pincode) {
  const commonPincodes = {
    '110001': { city: 'New Delhi', state: 'Delhi', isValid: true, landmarks: ['Connaught Place', 'India Gate'], areas: [] },
    '110002': { city: 'New Delhi', state: 'Delhi', isValid: true, landmarks: ['Daryaganj', 'Red Fort'], areas: [] },
    '110003': { city: 'New Delhi', state: 'Delhi', isValid: true, landmarks: ['Kashmere Gate', 'ISBT'], areas: [] },
    '400001': { city: 'Mumbai', state: 'Maharashtra', isValid: true, landmarks: ['Fort', 'CST'], areas: [] },
    '400002': { city: 'Mumbai', state: 'Maharashtra', isValid: true, landmarks: ['Kalbadevi', 'Crawford Market'], areas: [] },
    '400003': { city: 'Mumbai', state: 'Maharashtra', isValid: true, landmarks: ['Masjid Bunder', 'Mohammad Ali Road'], areas: [] },
    '560001': { city: 'Bangalore', state: 'Karnataka', isValid: true, landmarks: ['MG Road', 'Brigade Road'], areas: [] },
    '560002': { city: 'Bangalore', state: 'Karnataka', isValid: true, landmarks: ['Shivajinagar', 'Commercial Street'], areas: [] },
    '560003': { city: 'Bangalore', state: 'Karnataka', isValid: true, landmarks: ['Gandhinagar', 'Majestic'], areas: [] },
    '600001': { city: 'Chennai', state: 'Tamil Nadu', isValid: true, landmarks: ['Anna Salai', 'Marina Beach'], areas: [] },
    '600002': { city: 'Chennai', state: 'Tamil Nadu', isValid: true, landmarks: ['Mylapore', 'Kapaleeshwarar Temple'], areas: [] },
    '600003': { city: 'Chennai', state: 'Tamil Nadu', isValid: true, landmarks: ['Triplicane', 'Chepauk'], areas: [] },
    '700001': { city: 'Kolkata', state: 'West Bengal', isValid: true, landmarks: ['Park Street', 'Victoria Memorial'], areas: [] },
    '700002': { city: 'Kolkata', state: 'West Bengal', isValid: true, landmarks: ['Burrabazar', 'Howrah Bridge'], areas: [] },
    '700003': { city: 'Kolkata', state: 'West Bengal', isValid: true, landmarks: ['Bowbazar', 'Central Avenue'], areas: [] },
    '411001': { city: 'Pune', state: 'Maharashtra', isValid: true, landmarks: ['Shivajinagar', 'FC Road'], areas: [] },
    '411002': { city: 'Pune', state: 'Maharashtra', isValid: true, landmarks: ['Camp', 'MG Road'], areas: [] },
    '411003': { city: 'Pune', state: 'Maharashtra', isValid: true, landmarks: ['Ganj Peth', 'Laxmi Road'], areas: [] },
    '500001': { city: 'Hyderabad', state: 'Telangana', isValid: true, landmarks: ['Abids', 'Nampally'], areas: [] },
    '500002': { city: 'Hyderabad', state: 'Telangana', isValid: true, landmarks: ['Sultan Bazar', 'Koti'], areas: [] },
    '500003': { city: 'Hyderabad', state: 'Telangana', isValid: true, landmarks: ['Secunderabad', 'Paradise'], areas: [] },
    '302001': { city: 'Jaipur', state: 'Rajasthan', isValid: true, landmarks: ['MI Road', 'Pink City'], areas: [] },
    '302002': { city: 'Jaipur', state: 'Rajasthan', isValid: true, landmarks: ['Johari Bazar', 'Hawa Mahal'], areas: [] },
    '302003': { city: 'Jaipur', state: 'Rajasthan', isValid: true, landmarks: ['Civil Lines', 'SMS Stadium'], areas: [] },
  };

  const fallbackData = commonPincodes[pincode];
  if (fallbackData) {
    return {
      ...fallbackData,
      pincode: pincode,
      country: 'India',
      postOfficeName: fallbackData.landmarks[0] || 'Main Post Office'
    };
  }

  // Generic data based on pincode pattern
  const stateMapping = {
    '1': 'Delhi',
    '2': 'Haryana', 
    '3': 'Punjab',
    '4': 'Maharashtra',
    '5': 'Karnataka',
    '6': 'Tamil Nadu',
    '7': 'West Bengal',
    '8': 'Odisha',
    '9': 'Kerala'
  };

  const firstDigit = pincode.charAt(0);
  const state = stateMapping[firstDigit] || 'Unknown';
  
  return {
    city: 'Unknown',
    state: state,
    country: 'India',
    landmarks: [],
    areas: [],
    postOfficeName: 'Post Office',
    pincode: pincode,
    isValid: true
  };
}

module.exports = router;
