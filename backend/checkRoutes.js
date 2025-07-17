/**
 * This file helps diagnose issues with Express routes
 */
const express = require('express');

// Try to load the route files
console.log('Checking routes...');

// Check chatbox routes
try {
  const chatboxRoutes = require('./routes/chatbox');
  console.log('ChatBox routes loaded successfully');
  console.log('ChatBox routes type:', typeof chatboxRoutes);
  console.log('ChatBox routes is Router?', chatboxRoutes instanceof express.Router);
  console.log('ChatBox routes is function?', typeof chatboxRoutes === 'function');
  
  if (chatboxRoutes.stack && Array.isArray(chatboxRoutes.stack)) {
    console.log('ChatBox routes contains:', chatboxRoutes.stack.length, 'handlers');
    chatboxRoutes.stack.forEach((layer, i) => {
      console.log(`- Route ${i}:`, layer.route?.path || '[middleware]');
    });
  } else {
    console.log('ChatBox routes does not have a stack property');
  }
} catch (err) {
  console.error('Error loading ChatBox routes:', err);
}

// Footer routes check removed

console.log('\nRoute checking completed');
