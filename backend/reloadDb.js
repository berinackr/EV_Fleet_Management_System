// This is a utility script to reload the db module and ensure getConnection is available

// Clear the require cache for the db module
delete require.cache[require.resolve('./db')];

// Re-export all items from db
const dbModule = require('./db');
module.exports = dbModule;