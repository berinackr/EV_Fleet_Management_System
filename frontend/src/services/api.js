/**
 * Central API service for managing backend requests
 * Using relative paths with the proxy configuration (in package.json)
 */

// Base URLs for different services
const API_BASE_URL = 'http://localhost:3001/api';
const EXTERNAL_PREDICT_URL = 'http://localhost:5002';
const DIRECT_API_URL = 'http://localhost:3001/api'; // Direct access for debugging
const ALNS_API_URL = 'http://localhost:8005'; // Updated ALNS service URL (changed from 8002 to 8004)

// API endpoints
export const ENDPOINTS = {
  // Fleet monitoring
  ALERTS: `${API_BASE_URL}/alerts`,
  PERFORMANCE: `${API_BASE_URL}/performance`,
  VEHICLES: `${API_BASE_URL}/sumo/vehicles/all`,
  START_SIMULATION: `${API_BASE_URL}/start-simulation`,
  STOP_SIMULATION: `${API_BASE_URL}/stop-simulation`,
  SIMULATION_STATUS: `${API_BASE_URL}/simulation-status`,
  
  // Customers
  CUSTOMERS: `${API_BASE_URL}/customers`,
  CUSTOMERS_FROM_ROUTES: `${API_BASE_URL}/customers/from-route4plans`,
  
  // For direct access (bypassing proxy)
  DIRECT_CUSTOMERS: `${DIRECT_API_URL}/customers`,
  DIRECT_CUSTOMERS_FROM_ROUTES: `${DIRECT_API_URL}/customers/from-route4plans`,
  
  // External services
  ENERGY_PREDICT: `${EXTERNAL_PREDICT_URL}/predict`,

  // ALNS service
  START_ALNS: `${ALNS_API_URL}/start_alns`,
};

// Helper function for common fetch options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// GET request helper
export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error);
    throw error;
  }
};

// POST request helper
export const postData = async (endpoint, data) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API post error for ${endpoint}:`, error);
    throw error;
  }
};

// File upload helper (for multipart/form-data)
export const uploadFiles = async (endpoint, files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('input_files', file);
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    // For blob responses (like zip files)
    if (response.headers.get('Content-Type') === 'application/zip') {
      return await response.blob();
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API upload error for ${endpoint}:`, error);
    throw error;
  }
};

// Create a named API service object to avoid anonymous default export
const apiService = {
  ENDPOINTS,
  fetchData,
  postData,
  uploadFiles,
};

export default apiService;
