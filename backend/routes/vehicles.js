const express = require('express');
const { getVehicleLocations } = require('../models/vehicle');  // Mevcut model
const { getFiwareVehicleLocations } = require('../models/vehicleFiware'); // Yeni model

const router = express.Router();

// Mevcut araç konum verileri (if exists)
router.get('/locations', async (req, res) => {
    try {
        const vehicles = await getVehicleLocations();
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicle locations:', error.message);
        res.status(500).json({ error: 'Failed to fetch vehicle locations.' });
    }
});

// FIWARE araç konum verileri - fix the route path
router.get('/locations/fiware', async (req, res) => {
    try {
        console.log('FIWARE vehicles API endpoint accessed');
        const fiwareVehicles = await getFiwareVehicleLocations();
        res.status(200).json(fiwareVehicles);
    } catch (error) {
        console.error('Error fetching FIWARE vehicle locations:', error.message);
        res.status(500).json({ error: 'Failed to fetch FIWARE vehicle locations.' });
    }
});

module.exports = router;