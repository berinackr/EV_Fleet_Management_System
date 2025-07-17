const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema({
  nodeId: { type: String, required: true, unique: true },
  routeId: { type: String },
  vehicleId: { type: String },
  status: { type: String, default: 'On the Way' }, // pending | completed
  location: {
    latitude: Number,
    longitude: Number,
    elevation: Number,
  },
  readyTime: Number,
  dueDate: Number,
  arrivalTime: Number,
  serviceTime: Number,
});

module.exports = mongoose.model('OrderStatus', OrderStatusSchema, "OrderStatus");