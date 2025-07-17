const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  address: String,
  demand: Number,
  timeWindow: String,
  orderDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  status: {
    type: String,
    enum: ['Requested', 'On the way', 'Delivered', 'Cancelled'],
    default: 'Requested'
  },
  brand: String,
  notes: String
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

// Create a function to add sample data if the collection is empty
Customer.createSampleData = async function() {
  try {
    const count = await this.countDocuments();
    if (count === 0) {
      console.log('Creating sample customer data...');
      const sampleCustomers = [
        {
          name: "Sample Customer 1",
          address: "123 Main St, Sample City",
          demand: 15,
          timeWindow: "08:00-18:00",
          orderDate: "2024-04-10",
          status: "Requested",
          brand: "SampleBrand",
          notes: "Sample customer for demonstration"
        },
        {
          name: "Sample Customer 2",
          address: "456 Oak Ave, Example Town",
          demand: 25,
          timeWindow: "09:00-17:00",
          orderDate: "2024-04-10",
          status: "On the way",
          brand: "ExampleBrand",
          notes: "Another sample customer"
        }
      ];
      
      await this.insertMany(sampleCustomers);
      console.log('Sample customer data created successfully!');
    }
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Export the model
module.exports = Customer;
