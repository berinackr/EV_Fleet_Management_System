/**
 * Utility to map customer IDs to human-readable names
 * This can be expanded as needed to include more mappings
 */

const customerNameMap = {
  // Numeric IDs
  "10": "City Center Store",
  "11": "Shopping Mall",
  "12": "Main Hospital",
  "13": "Downtown Market",
  "14": "Conference Center",
  "15": "Library",
  "16": "University",
  "17": "Tech Park",
  "18": "Sports Stadium",
  "19": "Airport Hub",
  "20": "Central Station",
  
  // Alphanumeric IDs
  "22A": "Central Hospital",
  "24": "City Mall",
  "26": "University Campus",
  "31": "Main Library",
  "34": "Tech Park",
  "45": "Train Station",
  "113": "Science Museum",
  "119": "Sports Complex",
  
  // Depot IDs
  "cs5": "Central Depot",
  "cs10": "Northern Depot",
  "cs15": "Southern Depot"
};

/**
 * Get a human-readable name for a customer ID
 * @param {string} nodeId - The customer ID from the data
 * @returns {string} A human-readable name
 */
const getCustomerName = (nodeId) => {
  return customerNameMap[nodeId] || `Customer ${nodeId}`;
};

module.exports = {
  customerNameMap,
  getCustomerName
};
