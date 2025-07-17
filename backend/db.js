const mongoose = require("mongoose");
const mariadb = require("mariadb");
require('dotenv').config();

// Log when the module is loaded
console.log('DB module loading...');

// MariaDB connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST,          // .env'den okunur (örn: 31.141.x.x)
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,          // örnek: remoteuser
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,      // örnek: fleetmanagementdb
  connectionLimit: 20,                // havuz kapasitesi artırıldı
  acquireTimeout: 20000,              // 20 saniye bekler
  waitForConnections: true,           // bağlantı kuyruğu bekler
  queueLimit: 0                       // sınırsız kuyruk (0 = limitsiz)
};

// Log pool configuration for debugging (password maskeli)
console.log('Creating MariaDB pool with config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  user: poolConfig.user,
  database: poolConfig.database,
  password: '******',
});

// Create the MariaDB connection pool
const pool = mariadb.createPool(poolConfig);

// Test the pool connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MariaDB Connection Test Successful');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MariaDB Connection Test Failed:', err);
  });

// MongoDB connection setup (only if URI provided)
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ No MongoDB URI provided. Skipping MongoDB connection.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connection Successful');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
  }
};

// Define Alert schema (timestamps otomatik createdAt / updatedAt ekler)
const AlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
    vehicle_id: { type: String },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create and export the Alert model
const Alert = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);

// Function to get a manual connection from the pool (isteğe bağlı kullanım)
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting MariaDB connection:', error);
    throw error;
  }
};

// Utility: Quick query function (bağlantıyı otomatik alır & bırakır)
const query = async (sql, params) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (error) {
    console.error('❌ MariaDB query error:', error.message);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

console.log('DB module loaded successfully');

module.exports = {
  connectDB,
  Alert,
  pool,
  getConnection,
  query  // kolay kullanım için
};
