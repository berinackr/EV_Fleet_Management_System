const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  route_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  avg_energy_consumption_kwh_km: { type: Number, default: 0 },
  estimated_total_energy_kwh: { type: Number, default: 0 },
  range_effect_percent: { type: Number, default: 0 },
  total_distance_km: { type: Number, default: 0 },
  estimated_duration_min: { type: Number, default: 0 },
  speed_kmh: { type: Number, default: 0 },
  stop_count: { type: Number, default: 0 },
  traffic_level: { type: String, default: 'Low' },
  slope_profile: { type: String, default: 'Flat' },
  efficiency_score: { type: Number, default: 80 },
  slope: { type: Number, default: 0 },
  avg_vehicle_speed: { type: Number, default: 0 },
  avg_Acceleration: { type: Number, default: 0 },
  avg_Total_Mass: { type: Number, default: 0 }
});

const Performance = mongoose.model('Performance', performanceSchema);

// Create sample performance data if the collection is empty
Performance.createSampleData = async function() {
  try {
    const count = await Performance.countDocuments();
    
    if (count === 0) {
      console.log('Creating sample performance data...');
      
      const routes = ['route1', 'route2', 'route3'];
      const sampleData = [];
      
      // Reduced sample size for faster initialization during development
      for (let route of routes) {
        // Create 24 data points (one per hour) instead of 288 for faster initialization
        for (let i = 0; i < 24; i++) {
          const timestamp = new Date(Date.now() - (24 - i) * 60 * 60000); // hourly data points
          
          sampleData.push({
            route_id: route,
            timestamp: timestamp,
            avg_energy_consumption_kwh_km: 0.15 + Math.random() * 0.1,
            estimated_total_energy_kwh: 25 + Math.random() * 5,
            range_effect_percent: 10 + Math.random() * 10,
            total_distance_km: 120 + Math.random() * 20,
            estimated_duration_min: 180 + Math.random() * 30,
            speed_kmh: 40 + Math.random() * 20,
            stop_count: Math.floor(5 + Math.random() * 5),
            traffic_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            slope_profile: ['Flat', 'Hilly', 'Mountainous'][Math.floor(Math.random() * 3)],
            efficiency_score: 70 + Math.random() * 30,
            slope: Math.random() * 5,
            avg_vehicle_speed: 40 + Math.random() * 20,
            avg_Acceleration: 1 + Math.random() * 0.5,
            avg_Total_Mass: 1500 + Math.random() * 500
          });
        }
      }
      
      await Performance.insertMany(sampleData);
      console.log(`Created ${sampleData.length} sample performance records`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error creating sample performance data:', error);
    throw error;
  }
};

module.exports = Performance;
