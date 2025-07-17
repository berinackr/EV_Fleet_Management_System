const express = require('express');
const Performance = require('../models/performance');

const router = express.Router();

// Enhanced logging middleware
router.use((req, res, next) => {
  console.log(`>>> Performance Route: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  next();
});

// GET /api/performance
router.get('/', async (req, res) => {
  try {
    console.log('Fetching performance data...');
    const filter = req.query.route_id ? { route_id: req.query.route_id } : {};
    const limit = parseInt(req.query.limit) || 100;

    // Verify MongoDB connection
    if (!Performance.db.readyState) {
      console.error('MongoDB not connected');
      return res.status(503).json({ error: 'Database connection not available' });
    }

    const performances = await Performance.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    console.log(`Found ${performances.length} performance records`);
    res.json(performances);
  } catch (error) {
    console.error('Performance data fetch error:', error);
    res.status(500).json({ 
      error: "Performance verileri alınırken hata oluştu.",
      details: error.message 
    });
  }
});

// POST /api/performance
router.post('/', async (req, res) => {
  try {
    console.log('Creating new performance record:', req.body);
    const newPerformance = new Performance(req.body);
    const saved = await newPerformance.save();
    console.log('Performance record created:', saved._id);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Performance data creation error:', error);
    res.status(400).json({ 
      error: "Performance verisi eklenirken hata oluştu.",
      details: error.message 
    });
  }
});

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    modelExists: !!Performance,
    dbState: Performance.db.readyState,
    routerWorking: true
  });
});

/**
 * Get performance by ID
 * @route GET /api/performance/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ error: 'Performance not found' });
    }
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

// Make sure to export the router as a function (middleware)
module.exports = router;
