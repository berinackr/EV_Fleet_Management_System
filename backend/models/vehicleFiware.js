const mariadb = require('mariadb');
require('dotenv').config();

// Create a dedicated pool for this model
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'remoteuser',
    password: process.env.DB_PASSWORD || 'opevaDB2028',
    database: process.env.DB_NAME || 'fleetmanagementdb',
    connectionLimit: 20,
});

async function getFiwareVehicleLocations() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('✅ Successfully obtained database connection'); // Debugging
        
        const query = `
            SELECT 
                vehicle_id,
                route_id,
                latitude,
                longitude,
                altitude,
                range_km,
                speed,
                slope,
                soc AS state_of_charge,
                soc_estimation,
                vehicle_load_kg,
                timestamp AS last_updated
            FROM vehicle_tracking_fiware
            WHERE (vehicle_id, timestamp) IN (
                SELECT vehicle_id, MAX(timestamp)
                FROM vehicle_tracking_fiware
                GROUP BY vehicle_id
            )
            ORDER BY vehicle_id
        `;
        
        const rows = await conn.query(query);
        return rows;

    } catch (error) {
        console.error('❌ Database query failed:', error);
        throw new Error('Failed to fetch FIWARE vehicle locations.');
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { getFiwareVehicleLocations };
