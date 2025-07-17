// models/chatbox.js

const { pool } = require('../db');

/**
 * Retrieves the latest status of all vehicles sorted by charge ascending
 * Used specifically for ChatBox UI components
 *
 * @returns {Promise<Array>} List of vehicle status objects
 */
async function getVehiclesStatus() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT 
                vehicle_id,
                latitude,
                longitude,
                speed,
                soc AS state_of_charge,
                timestamp AS last_updated
            FROM vehicle_tracking_fiware
            WHERE (vehicle_id, timestamp) IN (
                SELECT vehicle_id, MAX(timestamp)
                FROM vehicle_tracking_fiware
                GROUP BY vehicle_id
            )
            ORDER BY soc ASC;
        `;

        const rows = await conn.query(query);
        return rows;
    } catch (error) {
        console.error('ChatBox Database query failed:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { getVehiclesStatus };
