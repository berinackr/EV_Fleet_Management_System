/**
 * Mapping of customer IDs to readable addresses
 * Used to provide human-friendly address information instead of raw coordinates
 */

const customerAddressMap = {
  // Sample provided mappings
  "22A": "Atatürk Caddesi No: 12, Orhangazi, Eskişehir",
  "13": "Kurtuluş Mahallesi, Çarşı Sokak, Eskişehir", 
  "45": "İstasyon Meydanı, Odunpazarı, Eskişehir",
  "24": "İçmeler Mahallesi, AVM Sokak No:5, Tepebaşı",
  "34": "TGB Kampüsü, Teknoloji Geliştirme Bölgesi",
  "113": "Bilim Müzesi Caddesi, No:1, Tepebaşı",
  "119": "Spor Kompleksi, Yenibağlar, Eskişehir",
  
  // Additional mappings for other IDs
  "26": "Üniversite Kampüsü, Meşelik, Eskişehir",
  "31": "Kütüphane Caddesi No:5, Odunpazarı, Eskişehir",
  "14": "Konferans Merkezi, Merkez, Eskişehir",
  
  // Numeric IDs
  "10": "Merkez Meydan No:1, Eskişehir",
  "11": "Alışveriş Caddesi No:15, Tepebaşı",
  "12": "Hastane Bulvarı No:30, Odunpazarı",
  "15": "Kütüphane Sokak No:8, Merkez",
  "16": "Kampüs Caddesi, Üniversite Bölgesi",
  "17": "Teknoloji Parkı, AR-GE Binası No:5",
  "18": "Stadyum Bulvarı, Spor Kompleksi",
  "19": "Havaalanı Caddesi No:1, Dış Bölge",
  "20": "İstasyon Caddesi No:5, Merkez",
  
  // Depot IDs
  "cs5": "Ana Depo, Organize Sanayi Bölgesi No:12",
  "cs10": "Kuzey Depo, Sanayi Mahallesi 5. Sokak",
  "cs15": "Güney Depo, Tepebaşı Sanayi Sitesi",

  // Direct coordinate mappings (from UI display - as seen in the prompt)
  "39.75075840001727, 30.48876465362253": "İçmeler Mahallesi, AVM Sokak No:5, Tepebaşı", // City Mall
  "39.75073912772263, 30.489428025110282": "Atatürk Caddesi No: 12, Orhangazi, Eskişehir", // Central Hospital
  "39.75298331855789, 30.48744815284683": "TGB Kampüsü, Teknoloji Geliştirme Bölgesi", // Tech Park
  "39.753632440087195, 30.489956322270203": "Üniversite Kampüsü, Meşelik, Eskişehir", // University
  "39.750766906930814, 30.486305858422877": "İstasyon Meydanı, Odunpazarı, Eskişehir", // Train Station
  "39.752940711050194, 30.48307218165666": "Kütüphane Caddesi No:5, Odunpazarı, Eskişehir", // Main Library
  "39.75296835298104, 30.48642990735077": "Spor Kompleksi, Yenibağlar, Eskişehir", // Sports Complex
  "39.75308993647627, 30.493415230335774": "Bilim Müzesi Caddesi, No:1, Tepebaşı", // Science Museum
  "39.75071222428621, 30.491328732190222": "Kurtuluş Mahallesi, Çarşı Sokak, Eskişehir", // Downtown Market
  "39.75043628839028, 30.49134030075124": "Konferans Merkezi, Merkez, Eskişehir" // Conference Center
};

/**
 * Get a readable address for a customer ID
 * @param {string} id - The customer ID
 * @returns {string} A human-readable address
 */
const getCustomerAddress = (id) => {
  // For debugging - log the ID we're trying to map
  console.log(`Trying to map address for ID: "${id}"`);
  
  // First try direct lookup in our map
  if (customerAddressMap[id]) {
    console.log(`Found direct address mapping for ID: "${id}"`);
    return customerAddressMap[id];
  }
  
  // Check if the ID looks like coordinates (for data that comes directly with lat/long instead of ID)
  if (typeof id === 'string' && (id.includes(',') || id.includes('.'))) {
    console.log(`ID "${id}" looks like coordinates, checking direct coordinate mapping`);
    
    // Try some common coordinate formats
    // 1. Try direct format: "lat, lng"
    if (customerAddressMap[id]) {
      console.log(`Found coordinate mapping for: "${id}"`);
      return customerAddressMap[id];
    }
    
    // 2. Try alternative formats or normalization
    // Remove spaces, try again
    const normalizedCoord = id.replace(/\s+/g, '');
    if (customerAddressMap[normalizedCoord]) {
      console.log(`Found coordinate mapping after normalization: "${normalizedCoord}"`);
      return customerAddressMap[normalizedCoord];
    }
    
    // If it looks like coordinates but no direct match, return a formatted address placeholder
    console.log(`No mapping found for coordinates: "${id}"`);
    return `Eskişehir, Türkiye (${id})`;
  }

  // Default fallback for unknown IDs
  console.log(`No address mapping found for ID: "${id}"`);
  return `Address for ${id}`;
};

module.exports = {
  customerAddressMap,
  getCustomerAddress
};
