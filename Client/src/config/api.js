// API Configuration
// Auto-detects environment and sets appropriate base URL
const getApiBaseUrl = () => {
  // In production, use relative URLs (backend serves frontend)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // In development, connect to backend server on port 5001
  // Frontend runs on 3000 (or 3001), backend on 5001
  return 'http://localhost:5001';
};

const API_BASE_URL = getApiBaseUrl();

// API Base URL logging removed for cleaner console output

export default API_BASE_URL;
export { API_BASE_URL };
