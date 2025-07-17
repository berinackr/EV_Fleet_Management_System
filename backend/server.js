const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const extract = require('extract-zip');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Explicitly set path to .env
const { Alert, pool, getConnection } = require('./db'); // Import getConnection too
const Performance = require('./models/performance'); // Add this line

// Import route handlers with clear logging
console.log('Loading route handlers...');

// Import and validate each route handler
const vehicleRoutes = require('./routes/vehicles');
const routeRoutes = require('./routes/route');
const customerRoutes = require('./routes/customers');
const performanceRoutes = require('./routes/performance');
const chatboxRoutes = require('./routes/chatbox');

// Log loaded routes immediately after require
console.log('Routes loaded (Types):', {
    vehicles: typeof vehicleRoutes,
    route: typeof routeRoutes,
    customers: typeof customerRoutes,
    performance: typeof performanceRoutes,
    chatbox: typeof chatboxRoutes // Log the type here
});

require('./socket_listener'); // 📡 WebSocket entegrasyonu

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/output', express.static(path.join(__dirname, '../frontend/public/output')));

// Log environment variables for debugging
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB with explicit URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB Atlas bağlantısı başarılı!");
  // Create sample data if collections are empty
  const Customer = require('./models/customer');
  Customer.createSampleData();
  
  // Initialize Performance sample data
  const Performance = require('./models/performance');
  Performance.createSampleData()
    .then(() => console.log("Performance sample data initialized"))
    .catch(err => console.error("Error initializing performance data:", err));
})
.catch(err => {
  console.error("MongoDB bağlantı hatası:", err);
  // Don't exit the process to allow the server to start even if DB connection fails
});

// Middleware
app.use(cors());

// Add extra logging right after CORS
app.use((req, res, next) => {
  console.log(`>>> Request passed CORS: ${req.method} ${req.url}`);
  next();
});


// Request logger middleware
app.use((req, res, next) => {
  console.log(`Request logger: ${req.method} ${req.url}`); // Renamed log for clarity
  next();
});

// Register specific API routes BEFORE general ones
console.log('Registering specific API routes...');

function registerRoute(path, route, name) {
  if (typeof route === 'function') {
    app.use(path, route);
    console.log(`✅ Registered ${name} at ${path}`);
  } else {
    console.error(`❌ ${name} is not a valid Express router. Type: ${typeof route}`);
  }
}

const PerformanceSchema = new mongoose.Schema({
  vehicle_id: { type: String, required: true, unique: true },
  route_id: { type: String },
  timestamp: { type: Date },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  avg_vehicle_speed: { type: Number },
  segment_length: { type: Number },
  avg_acceleration: { type: Number },
  avg_total_mass: { type: Number },
  slope: { type: Number },
  distance_traveled_km: { type: Number },
  status: { type: String },
  soc: { type: Number },
  remaining_energy: { type: Number, default: null },
  is_model_called: { type: Boolean, default: false },
});


const VehicleEnergySchema = new mongoose.Schema({
  vehicle_id: { type: String, required: true, unique: true },
  remaining_energy: { type: Number, default: null },
  nonlinear_energy: { type: Number, default: null }, // Ortalama tüketim için
  segment_count: { type: Number, default: 0 }, // Segment sayısı
});

const VehicleEnergy = mongoose.model('VehicleEnergy', VehicleEnergySchema, "vehicleEnergy");

const { parseAndSaveCustomersFromXML } = require('./utils/parseRoute4Plan');


app.post('/api/customers/import-from-xml', async (req, res) => {
  try {
    const xmlFilePath = path.join(__dirname, '../frontend/public/output/RML/Route4Plan.xml');
    await parseAndSaveCustomersFromXML(xmlFilePath);
    res.json({ success: true, message: 'Customers imported from XML.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import customers from XML.' });
  }
});



app.get('/api/charging-stations', async (req, res) => {
  try {
    const stations = await mongoose.connection.db.collection('ChargingStations').find().toArray();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch charging stations' });
  }
});





const OrderStatus = require('./models/orderStatus'); // Model dosya adını kontrol et

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await OrderStatus.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/vehicles/:vehicleId/customers', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const customers = await OrderStatus.find({ vehicleId });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers for vehicle' });
  }
});

app.patch('/api/customers/:nodeId/delivered', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const updated = await OrderStatus.findOneAndUpdate(
      { nodeId },
      { $set: { status: 'Delivered' } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

const PerformanceData2 = mongoose.model('PerformanceData2', PerformanceSchema, "anlikPerformansRota");

// Son 100 metre segment analizi
app.get('/api/vehicles/:vehicleId/full-segment', async (req, res) => {
  const vehicleId = req.params.vehicleId;

  try {
    console.log('server.js: /api/vehicles/:vehicleId/full-segment endpoint hit');

    const conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT * FROM vehicle_tracking_fiware 
      WHERE vehicle_id = ? 
      ORDER BY timestamp ASC
    `, [vehicleId]);
    conn.release();

    if (rows.length < 2) {
      return res.status(404).json({ error: "Yeterli veri yok." });
    }

    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371000;
      const toRad = (deg) => deg * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    let cumulativeDistance = 0;
    let totalSpeed = 0;
    let totalAcceleration = 0;
    let totalLoad = 0;
    let countAcceleration = 0;
    let selectedRows = [rows[rows.length - 1]];

    for (let i = rows.length - 1; i > 0; i--) {
      const curr = rows[i];
      const prev = rows[i - 1];

      if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
        const distance = haversine(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
        cumulativeDistance += distance;
      }

      selectedRows.push(prev);

      if (cumulativeDistance >= 100) break;
    }

    selectedRows.reverse();

    for (let i = 1; i < selectedRows.length; i++) {
      const prev = selectedRows[i - 1];
      const curr = selectedRows[i];

      totalSpeed += curr.speed ?? 0;

      if (prev.timestamp && curr.timestamp && prev.speed != null && curr.speed != null) {
        const timeDiffSeconds = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;
        if (timeDiffSeconds > 0) {
          const speedDiff = curr.speed - prev.speed;
          const acceleration = speedDiff / timeDiffSeconds;
          totalAcceleration += acceleration;
          countAcceleration++;
        }
      }

      if (curr.vehicle_load_kg != null) {
        totalLoad += curr.vehicle_load_kg;
      }
    }

    const segmentLength = selectedRows.length;
    const avgSpeed = totalSpeed / segmentLength;
    const avgAcceleration = countAcceleration > 0 ? totalAcceleration / countAcceleration : 0;
    const avgLoad = segmentLength > 0 ? totalLoad / segmentLength : 0;

    const startAlt = selectedRows[0].altitude;
    const endAlt = selectedRows[selectedRows.length - 1].altitude;
    const startLat = selectedRows[0].latitude;
    const startLon = selectedRows[0].longitude;
    const endLat = selectedRows[selectedRows.length - 1].latitude;
    const endLon = selectedRows[selectedRows.length - 1].longitude;
    const segDistance = haversine(startLat, startLon, endLat, endLon);
    const slope = segDistance > 0 ? ((endAlt - startAlt) / segDistance) * 100 : 0;

    const mongoDoc = {
      vehicle_id: vehicleId,
      avg_vehicle_speed: parseFloat(avgSpeed.toFixed(2)),
      segment_length: parseFloat(cumulativeDistance.toFixed(2)),
      avg_acceleration: parseFloat(avgAcceleration.toFixed(4)),
      avg_total_mass: parseFloat(avgLoad.toFixed(2)),
      slope: parseFloat(slope.toFixed(4)),
      distance_traveled_km: parseFloat((cumulativeDistance / 1000).toFixed(4)),
      timestamp: new Date(),
      location: {
        lat: endLat,
        lon: endLon,
      },
      route_id: selectedRows[selectedRows.length - 1].route_id ?? "",
      status: selectedRows[selectedRows.length - 1].status ?? "moving",
    };

    await PerformanceData2.updateOne(
      { vehicle_id: vehicleId },
      { $set: mongoDoc },
      { upsert: true }
    );

    console.log('MongoDB kaydı yapıldı veya güncellendi:', mongoDoc);
    res.json(mongoDoc);

  } catch (error) {
    console.error('Error in /api/vehicles/:vehicleId/full-segment:', error);
    res.status(500).json({ error: 'Veri alınırken hata oluştu', details: error.message });
  }
});

app.get('/api/performance', async (req, res) => {
  try {
    const routes = await PerformanceData2.find({});
    res.json(routes);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

app.post('/api/performance/predict', async (req, res) => {
  try {
    const { vehicle_id, avg_vehicle_speed, segment_length, avg_Acceleration, avg_Total_Mass, slope, soc } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: "vehicle_id is required" });
    }

    let vehicleEnergyDoc = await VehicleEnergy.findOne({ vehicle_id });
    let remainingEnergy = vehicleEnergyDoc?.remaining_energy ?? null;

    if (remainingEnergy == null) {
      if (soc != null) {
        const battery_capacity = 15.6; // kWh
        remainingEnergy = (soc / 100) * battery_capacity * 1000; // Wh
        await VehicleEnergy.updateOne(
          { vehicle_id },
          { $set: { remaining_energy: remainingEnergy } },
          { upsert: true }
        );
        console.log(`SOC ile hesaplanan remaining_energy: vehicle_id=${vehicle_id}, remaining_energy=${remainingEnergy}`);
      } else {
        return res.status(400).json({ error: "SOC verisi mevcut değil." });
      }
    }

    if (remainingEnergy == null) {
      return res.status(400).json({ error: "SOC üzerinden kalan enerji hesaplanamadı." });
    }



    // Flask ML modeline gönderilecek input
    const mlInput = {
      avg_vehicle_speed,
      segment_length,
      avg_Acceleration,
      avg_Total_Mass,
      slope,
      soc,
    };

    console.log("Verilen input:", mlInput); // Flask modeline gönderilen veri

    const response = await fetch('http://localhost:5002/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlInput),
    });


    const prediction = await response.json();
    console.log("Model Response:", prediction);

    if (typeof prediction.prediction !== "number") {
      return res.status(400).json({ error: "Geçersiz prediction sonucu", prediction });
    }


    const predicted_consumption = prediction.prediction;
    const newRemainingEnergy = 1000 - predicted_consumption;

    // VehicleEnergy koleksiyonunu güncelle
    await VehicleEnergy.updateOne(
      { vehicle_id },
      { $set: { remaining_energy: newRemainingEnergy } },
      { upsert: true }
    );

    console.log(`Tahmin sonucu güncellendi: vehicle_id=${vehicle_id}, yeni enerji=${newRemainingEnergy}`);

    res.json({
      prediction: predicted_consumption,
      updated_remaining_energy: newRemainingEnergy,
      shap_values: prediction.shap_values || [],
      remaining_range: prediction.remaining_range || null,
    });
  } catch (error) {
    console.error('Error in ML prediction:', error);
    res.status(500).json({ error: 'Tahmin yapılırken hata oluştu', details: error.message });
  }
});

app.get('/api/vehicles/:vehicleId/energy', async (req, res) => {
  const { vehicleId } = req.params;

  try {
    const vehicleEnergyDoc = await VehicleEnergy.findOne({ vehicle_id: vehicleId });
    if (!vehicleEnergyDoc) {
      return res.status(404).json({ error: "Vehicle energy data not found" });
    }

    res.json({
      remaining_energy: vehicleEnergyDoc.remaining_energy,
      nonlinear_energy: vehicleEnergyDoc.nonlinear_energy,
      segment_count: vehicleEnergyDoc.segment_count,
    });
  } catch (error) {
    console.error("Error fetching vehicle energy data:", error);
    res.status(500).json({ error: "Failed to fetch vehicle energy data" });
  }
});

app.patch('/api/vehicles/:vehicleId/energy', async (req, res) => {
  const { vehicleId } = req.params;
  const { remaining_energy, nonlinear_energy, segment_count } = req.body;

  try {
    await VehicleEnergy.updateOne(
      { vehicle_id: vehicleId },
      { $set: { remaining_energy, nonlinear_energy, segment_count } },
      { upsert: true }
    );
    res.json({ message: "Vehicle energy data updated successfully" });
  } catch (error) {
    console.error("Error updating vehicle energy data:", error);
    res.status(500).json({ error: "Failed to update vehicle energy data" });
  }
});

registerRoute('/api/vehicles', vehicleRoutes, 'vehicleRoutes');
registerRoute('/api/performance', performanceRoutes, 'performanceRoutes');
registerRoute('/api/customers', customerRoutes, 'customerRoutes');
registerRoute('/api/chatbox', chatboxRoutes, 'chatboxRoutes');
registerRoute('/api', routeRoutes, 'routeRoutes');

// **Tüm Uyarıları Getir**
app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find(); // MongoDB'den tüm uyarıları çek
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Veriler alınırken hata oluştu." });
  }
});

// **Yeni Uyarı Ekle**
app.post("/api/alerts", async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ error: "Uyarı eklenirken hata oluştu." });
  }
});

// **Uyarıyı Çözümle**
app.patch("/api/alerts/:id", async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Değerleri güvenli bir şekilde güncelle
      { new: true, runValidators: true } // Yeni veriyi döndür ve doğrulama yap
    );

    if (!updatedAlert) {
      return res.status(404).json({ error: "Uyarı bulunamadı" });
    }

    res.json(updatedAlert);
  } catch (error) {
    console.error("Uyarı güncelleme hatası:", error);
    res.status(400).json({ error: "Uyarı güncellenirken hata oluştu." });
  }
});

app.put("/api/alerts/:id/resolve", async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id, 
      { $set: { resolved: true } }, 
      { new: true, runValidators: true }
    );
      
    if (!updatedAlert) {
      return res.status(404).json({ error: "Uyarı bulunamadı" });
    }
      
    res.json(updatedAlert);
  } catch (error) {
    console.error("Uyarı çözümleme hatası:", error);
    res.status(500).json({ error: "Güncelleme sırasında hata oluştu." });
  }
});

// **Uyarıyı Sil**
app.delete("/api/alerts/:id", async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Uyarı silindi" });
  } catch (error) {
    res.status(400).json({ error: "Uyarı silinirken hata oluştu." });
  }
});

// New endpoint to fetch customers - CHANGED PATH to /api/customers-test
app.get('/api/customers-test', async (req, res) => {
  console.log('--- Request received for /api/customers-test ---');
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected for /customers-test');
      return res.status(503).json({ error: 'Database not connected' });
    }
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    const collection = mongoose.connection.db.collection('route4plans');
    console.log('Accessing route4plans collection...');
    const document = await collection.findOne({});
    console.log('Document fetched:', !!document);

    if (!document || !document.Routes || !Array.isArray(document.Routes)) {
      console.warn('No route data found or invalid format in route4plans for /customers-test');
      return res.status(404).json({ error: 'No route data found or invalid format in DB' });
    }

    const customers = document.Routes.flatMap(route => route.Nodes || [])
      .filter(node => node?.$?.NodeType === "Customer")
      .map(node => {
        const location = node.Location || {};
        const serviceInfo = node.ServiceInformation || {};
        const loadInfo = node.LoadInformation || {};
        return {
          id: node.$?.NodeId || `cust-${Math.random().toString(16).slice(2)}`,
          name: node.$?.NodeId || "Unknown Customer",
          address: `Lat: ${location.Latitude || '-'}, Lng: ${location.Longitude || '-'}`,
          demand: Number(loadInfo.Weight || 0),
          timeWindow: (serviceInfo.ReadyTime !== undefined && serviceInfo.DueDate !== undefined)
                      ? `${serviceInfo.ReadyTime}-${serviceInfo.DueDate}`
                      : "-",
          orderDate: "2024-04-10",
          status: "Requested"
        };
      });
    console.log(`Processed ${customers.length} customers for /customers-test`);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers from DB (/customers-test):", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Info4Task içinde (Matristeki yeri olan) No bilgisini xml'e girebilmek için Info4Environment içinden fetch et, id'ye göre eşle ve döndür
app.get('/api/matrix-positions', async (req, res) => {
  try {
    console.log('Fetching matrix positions from Info4Environment...');

    const collection = mongoose.connection.db.collection('Info4Environment');
    const doc = await collection.findOne({});

    const nodes = doc?.Info4Environment?.Graph?.Node;

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return res.status(404).json({ error: 'No matrix position data found' });
    }

    // Create a map of customer names to their matrix positions
    const positionMap = {};

    nodes.forEach(node => {
      const name = String(node?.['@Name']).trim();
      const no = String(node?.['@No']).trim();

      if (name && no) {
        positionMap[name] = no;
      } else {
        console.warn('Geçersiz node verisi atlandı:', node);
      }
    });

    console.log('✅ Matrix positions:', positionMap);
    res.json(positionMap);

  } catch (error) {
    console.error('❌ Error fetching matrix positions:', error);
    res.status(500).json({ error: 'Failed to fetch matrix positions' });
  }
});

// Add direct query fallback endpoint for troubleshooting
app.get('/api/direct-query/vehicle-locations', async (req, res) => {
  console.log('Direct query fallback endpoint accessed');
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT 
        vehicle_id,
        route_id,
        latitude,
        longitude,
        altitude,
        range_km,
        speed,
        slope,
        soc,
        soc_estimation,
        vehicle_load_kg,
        timestamp as last_updated
      FROM vehicle_tracking_fiware
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    console.log(`Direct query returned ${rows.length} rows`);
    res.json(rows);
  } catch (error) {
    console.error('Direct query error:', error);
    res.status(500).json({ 
      error: 'Database query failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (conn) conn.release();
  }
});

// Add a simplified vehicle data endpoint that combines chatbox and footer needs
app.get('/api/live-vehicle-data', async (req, res) => {
  console.log('Live vehicle data endpoint accessed');
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT 
        vehicle_id,
        route_id,
        latitude,
        longitude,
        altitude,
        range_km,
        speed,
        slope,
        soc as state_of_charge,
        soc_estimation,
        vehicle_load_kg,
        timestamp as last_updated
      FROM vehicle_tracking_fiware
      WHERE (vehicle_id, timestamp) IN (
        SELECT vehicle_id, MAX(timestamp)
        FROM vehicle_tracking_fiware
        GROUP BY vehicle_id
      )
      ORDER BY vehicle_id
    `;
    const rows = await conn.query(query);
    console.log(`Live vehicle data: found ${rows.length} vehicles`);
    res.json(rows);
  } catch (error) {
    console.error('Live vehicle data error:', error);
    res.status(500).json({ 
      error: 'Database query failed',
      message: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

// Add a direct fallback endpoint for footer vehicles data
app.get('/api/direct-vehicles-data', async (req, res) => {
  console.log('Direct vehicles data fallback endpoint accessed');
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT 
        vehicle_id,
        route_id,
        latitude,
        longitude,
        altitude,
        range_km,
        speed,
        slope,
        soc as state_of_charge,
        soc_estimation,
        vehicle_load_kg,
        timestamp as last_updated
      FROM vehicle_tracking_fiware
      WHERE (vehicle_id, timestamp) IN (
        SELECT vehicle_id, MAX(timestamp)
        FROM vehicle_tracking_fiware
        GROUP BY vehicle_id
      )
      ORDER BY vehicle_id
    `;
    const rows = await conn.query(query);
    console.log(`Direct vehicles data: found ${rows.length} vehicles`);
    res.json(rows);
  } catch (error) {
    console.error('Direct vehicles data error:', error);
    res.status(500).json({ 
      error: 'Database query failed',
      message: error.message
    });
  } finally {
    if (conn) conn.release();
  }
});

// Register route handlers in correct order - most specific first
console.log('Registering specific API routes...');

// API-specific routes
if (typeof vehicleRoutes === 'function') {
    app.use('/api/vehicles', vehicleRoutes);
}

if (typeof performanceRoutes === 'function') {
    app.use('/api/performance', performanceRoutes);
}

if (typeof customerRoutes === 'function') {
    app.use('/api/customers', customerRoutes);
}

if (typeof chatboxRoutes === 'function') {
    app.use('/api/chatbox', chatboxRoutes);
    console.log('✅ Registered chatbox routes');
} else {
    console.error('❌ ChatBox routes is not a valid middleware');
}

if (typeof routeRoutes === 'function') {
    app.use('/api', routeRoutes);
}

// Add a debug endpoint to verify server is running
app.get('/api/ping', (req, res) => {
  console.log('Ping endpoint accessed');
  res.json({ status: 'ok', message: 'Server is running' });
});

// General routes last - only register if it's a valid middleware
if (typeof routeRoutes === 'function') {
  app.use('/api', routeRoutes);
  console.log('Registered general routes at /api');
} else {
  console.warn('Route routes is not a valid middleware function');
}

// Add a test endpoint for verification
app.get('/api/test', (req, res) => {
  console.log('Test API endpoint accessed');
  res.json({ status: 'API is working' });
});

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "../frontend/public/output");
console.log("Output directory:", outputDir);
fs.mkdirSync(outputDir, { recursive: true });

const taskDir = path.join(__dirname, "../frontend/public/xml_dataset/Info4Task");
app.post('/clear-task', (req, res) => {
  console.log('Attempting to clear task directory at:', taskDir);

  try {
    // Ensure directory exists (creates if not)
    fs.ensureDirSync(taskDir);

    // Empty the directory
    fs.emptyDirSync(taskDir);
    console.log('Task directory cleared successfully');
    res.status(200).json({ message: 'Task directory cleared successfully' });
  } catch (error) {
    console.error('Error clearing task directory:', error, error.stack);
    res.status(500).json({ error: `Failed to clear task directory: ${error.message}` });
  }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // saveFiles.js kullandığı outputDir'i kullanalım
    cb(null, outputDir);
  },
  filename: function (req, file, cb) {
    // Orijinal dosya adını koruyalım
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/save-xml-info4task', async (req, res) => {
  const xmlContent = req.body.xmlContent;
  const xmlDir = path.join(__dirname, '../frontend/public/xml_dataset/Info4Task');
  const filePath = path.join(xmlDir, 'Task.xml');

  try {
    // Ensure directory exists
    fs.mkdirSync(xmlDir, { recursive: true });

    // Save XML file
    fs.writeFileSync(filePath, xmlContent, 'utf8');
    console.log('XML file saved successfully:', filePath);

    res.status(200).json({ 
      success: true,
      message: 'XML file saved successfully',
      path: filePath 
    });
  } catch (error) {
    console.error('Error saving XML file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save XML file',
      details: error.message 
    });
  }
});

// Endpoint to clear output directory
app.post('/clear-output', (req, res) => {
  console.log('Attempting to clear output directory at:', outputDir);
  
  try {
    // Ensure directory exists (creates if not)
    fs.ensureDirSync(outputDir);
    
    // Empty the directory
    fs.emptyDirSync(outputDir);
    console.log('Output directory cleared successfully');
    res.status(200).json({ message: 'Output directory cleared successfully' });
  } catch (error) {
    console.error('Error clearing output directory:', error, error.stack);
    res.status(500).json({ error: `Failed to clear output directory: ${error.message}` });
  }
});

// Endpoint to save a single file - saveFiles.js'den alındı
app.post('/save-file', upload.single('file'), (req, res) => {
  console.log("Received file:", req.file);
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  res.json({
    success: true,
    path: `/output/${req.file.filename}`,
    filename: req.file.filename,
  });
});

// Endpoint to save multiple files - saveFiles.js'den alındı
app.post('/save-files', upload.array('files'), (req, res) => {
  console.log("Received files:", req.files);
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded");
  }
  const savedFiles = req.files.map((file) => ({
    path: `/output/${file.filename}`,
    filename: file.filename,
  }));
  res.json({ success: true, files: savedFiles });
});

// Endpoint to save and extract zip file - saveFiles.js'den alındı
app.post('/save-zip', upload.single('zipFile'), async (req, res) => {
  console.log("Received zip file:", req.file);
  
  if (!req.file) {
    return res.status(400).send("No zip file uploaded");
  }
  
  const zipPath = req.file.path;
  try {
    // Extract zip file
    await extract(zipPath, { dir: outputDir });
    
    // Optionally delete the zip file after extraction
    // fs.unlinkSync(zipPath);
    
    res.json({
      success: true,
      zipPath: `/output/${req.file.filename}`,
      extractedTo: "/output/",
    });
  } catch (err) {
    console.error("Error extracting zip:", err);
    res.status(500).send("Error extracting zip file");
  }
});

// Endpoint to list files in output directory
// Endpoint to list files in output directory
app.get('/list-extracted-files', (req, res) => {
  const outputDir = path.resolve(__dirname, '../frontend/public/output');
  
  console.log('Listing files in:', outputDir);
  
  try {
    // Function to recursively list all files in a directory
    const listFilesRecursively = (dir, baseDir = '') => {
      let results = [];
      if (!fs.existsSync(dir)) {
        return results;
      }
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.join(baseDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Recursively list files in subdirectories
          results = results.concat(listFilesRecursively(filePath, relativePath));
        } else {
          // Add file path relative to output directory
          results.push('/output/' + relativePath.replace(/\\/g, '/'));
        }
      }
      
      return results;
    };
    
    const fileList = listFilesRecursively(outputDir);
    console.log('Found files:', fileList);
    
    res.json({ files: fileList });
  } catch (error) {
    console.error('Error listing files in output directory:', error);
    res.status(500).json({ error: 'Failed to list files in output directory' });
  }
});

// Endpoint to check if a specific file exists (useful for debugging)
app.get('/check-file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'No file path provided' });
  }

  // Normalize the path to prevent directory traversal attacks
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(__dirname, '../frontend/public', normalizedPath);

  console.log('Checking if file exists:', fullPath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    res.json({
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size: stats.size,
      lastModified: stats.mtime
    });
  } else {
    res.json({ exists: false });
  }
});

// Special route to handle Route4Vehicle.json directly
app.get('/get-route4vehicle', (req, res) => {
  const route4VehiclePath = path.join(__dirname, '../frontend/public/output/RML/newesoguv32-c05-ds1_Route4Vehicle.json');
  
  console.log('Attempting to read Route4Vehicle.json from:', route4VehiclePath);
  
  if (fs.existsSync(route4VehiclePath)) {
    try {
      const fileContent = fs.readFileSync(route4VehiclePath, 'utf8');
      res.json(JSON.parse(fileContent));
    } catch (error) {
      console.error('Error reading Route4Vehicle.json:', error);
      res.status(500).json({ error: `Failed to read Route4Vehicle.json: ${error.message}` });
    }
  } else {
    console.log('Route4Vehicle.json not found');
    res.status(404).json({ error: 'Route4Vehicle.json not found' });
  }
});

// Add a direct simple endpoint for customers
app.get('/api/direct-customers', async (req, res) => {
  console.log('Fetching orders and user details...');
  try {
    // const users = await mongoose.connection.db.collection('Users').find().toArray();
    // const depots = await mongoose.connection.db.collection('Depot').find().toArray();
    // const chargingStations = await mongoose.connection.db.collection('ChargingStations').find().toArray();
    // const orders = await mongoose.connection.db.collection('Orders').find().toArray();

    const ordersCollection = mongoose.connection.db.collection('Orders');
    const usersCollection = mongoose.connection.db.collection('Users');
    
    // Fetch all orders
    const orders = await ordersCollection.find().toArray();
    console.log(`Found ${orders.length} orders`);
    console.log(`Found ${orders.length} orders in the database`);
    
    // Create a map of user_id to user details for efficient lookup
    const userIds = orders.map(order => order.customer_id);
    const users = await usersCollection.find({ user_id: { $in: userIds } }).toArray();
    const userMap = new Map(users.map(user => [user.user_id, user]));
    
    // Format orders with user details
    const formattedOrders = orders.map(order => {
      const user = userMap.get(order.customer_id);
      
      return {
        id: order._id,
        orderId: order.order_id,
        customerId: order.customer_id,
        taskId: order.task_id,
        // Customer details from Users collection
        name: user?.full_name || 'Unknown Customer',
        email: user?.email,
        phone: user?.phone_number,
        address: order.location?.address || user?.address || 'Unknown Address',
        // Order details
        timeWindow: `${order.ready_time || '00:00'}-${order.due_date || '00:00'}`,
        readyTime: order.ready_time,
        dueDate: order.due_date,
        serviceTime: order.service_time,
        // Product details
        product: order.request?.product_name,
        productId: order.request?.product_id,
        quantity: order.request?.quantity || 0,
        demand: order.request?.demand || 0,
        notes: order.request?.notes || '',
        // Order status and tracking
        status: order.status?.toLowerCase() || 'unknown',
        priority: order.priority_level || 0,
        price: order.total_price || 0,
        assignedVehicle: order.assigned_vehicle,
        assignedRouteId: order.assigned_route_id,
        // Location
        latitude: order.location?.latitude || user?.latitude,
        longitude: order.location?.longitude || user?.longitude,
        // Metadata
        type: 'order',
        isOrder: true,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        // Additional user info
        userDetails: user ? {
          profilePicture: user.profile_picture,
          role: user.role,
          isActive: user.is_active
        } : null
      };
    });

    // Add some useful statistics for debugging
    const statusCounts = formattedOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    console.log('Orders by status:', statusCounts);
    res.json(formattedOrders);
    
  } catch (error) {
    console.error('Error fetching orders and user details:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Helper function for time conversion
function secondsToHHMM(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Add debug endpoints
app.get('/debug/mongo-status', (req, res) => {
  const status = {
    readyState: mongoose.connection.readyState,
    connected: mongoose.connection.readyState === 1,
    dbName: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections),
    models: Object.keys(mongoose.models)
  };
  console.log('MongoDB debug status:', status);
  res.json(status);
});


// Add a proxy endpoint to handle CORS issues for prediction API
app.post('/api/proxy/predict', async (req, res) => {
  console.log('Proxying prediction request to ML server');
  try {
    const response = await fetch('http://localhost:5002/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy prediction request',
      details: error.message
    });
  }
});

// Add a debug endpoint to check registered routes
app.get('/api/debug/routes', (req, res) => {
  // Collect all registered routes
  const routes = [];
  
  // Function to extract routes from a router
  const extractRoutes = (router) => {
    if (!router || !router.stack) return [];
    
    return router.stack
      .filter(layer => layer.route)
      .map(layer => {
        const methods = Object.keys(layer.route.methods)
          .filter(method => layer.route.methods[method])
          .map(method => method.toUpperCase());
        
        return {
          path: layer.route.path,
          methods: methods,
          middleware: layer.route.stack.length
        };
      });
  };
  
  // Collect routes from main app
  app._router.stack
    .filter(layer => layer.route)
    .forEach(layer => {
      routes.push({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
          .filter(method => layer.route.methods[method])
          .map(method => method.toUpperCase())
      });
    });
  
  // Identify middleware that might contain routers
  app._router.stack
    .filter(layer => layer.name === 'router')
    .forEach(layer => {
      let basePath = '';
      if (layer.regexp) {
        // Try to extract the base path
        const match = layer.regexp.toString().match(/^\/\^(.*?)\/\?/);
        if (match && match[1]) {
          basePath = match[1].replace(/\\\//g, '/');
        }
      }
      
      if (layer.handle && layer.handle.stack) {
        const routerRoutes = extractRoutes(layer.handle);
        routerRoutes.forEach(route => {
          routes.push({
            path: `${basePath}${route.path}`,
            methods: route.methods
          });
        });
      }
    });
  
  // Return all collected routes
  res.json({
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// Catch-all 404 handler - MUST BE THE LAST MIDDLEWARE
app.use((req, res, next) => {
  console.log(`!!! Reached final 404 handler for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});