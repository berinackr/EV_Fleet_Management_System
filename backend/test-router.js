// Simple script to test if router exports correctly
const customerRoutes = require('./routes/customers');

console.log('customerRoutes type:', typeof customerRoutes);
console.log('customerRoutes is router?', customerRoutes && customerRoutes.stack ? true : false);
console.log('customerRoutes details:', customerRoutes);
