const { getConnection } = require('../db');

async function getVehicleLocations() {
    const conn = await getConnection();
    try {
        const rows = await conn.query(`
            SELECT 
                vt.vehicle_id, 
                vt.latitude, 
                vt.longitude, 
                vt.speed, 
                vt.state_of_charge, 
                vt.last_updated,
                vt.planned_path, -- Planlanan rota (JSON)
                vt.actual_path   -- Gerçekleşen rota (JSON)
            FROM 
                vehicle_tracking vt
            INNER JOIN (
                SELECT 
                    vehicle_id, 
                    MAX(last_updated) AS max_updated
                FROM 
                    vehicle_tracking
                GROUP BY vehicle_id
            ) latest 
            ON vt.vehicle_id = latest.vehicle_id AND vt.last_updated = latest.max_updated
        `);
        return rows;
    } catch (error) {
        console.error('Database query failed:', error);
        throw new Error('Failed to fetch vehicle locations.');
    } finally {
        conn.release();
    }
}



module.exports = { getVehicleLocations };