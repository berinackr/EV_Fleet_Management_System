const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Helper function to convert seconds to HH:MM format
const secondsToHHMM = (seconds) => {
  if (!seconds || isNaN(seconds)) return "-";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Get customers from MongoDB customer collection (standard approach)
router.get('/', async (req, res) => {
  console.log('GET /api/customers route handler accessed');
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Add new customer
router.post('/', async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ error: 'Failed to create customer' });
  }
});

module.exports = router;
