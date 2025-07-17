// routes/chatbox.js

const express = require('express');
const router = express.Router();
const { getVehiclesStatus } = require('../models/chatbox');

console.log('✅ ChatBox Route: Model-based implementation loaded');

router.get('/test', (req, res) => {
  console.log('ChatBox test endpoint accessed');
  res.json({ message: 'ChatBox route is working', timestamp: new Date().toISOString() });
});

router.get('/vehicles-status', async (req, res) => {
    console.log('🚗 ChatBox Route: /vehicles-status endpoint accessed');
    try {
        const vehicles = await getVehiclesStatus();
        console.log(`✅ ChatBox: Successfully fetched ${vehicles.length} vehicles`);
        res.json(vehicles);
    } catch (error) {
        console.error('❌ ChatBox Error:', error);
        res.status(500).json({
            error: 'Failed to fetch vehicles status',
            details: error.message
        });
    }
});

module.exports = router;