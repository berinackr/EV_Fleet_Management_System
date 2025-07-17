const mqtt = require("mqtt");
const { pool } = require('./db');
const mongoose = require('mongoose');
const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const brokerUrl = "mqtt://159.146.83.30:18883";
const topic = "json/secret/+/attrs";
const client = mqtt.connect(brokerUrl);

const Route = mongoose.models.Route || mongoose.model('Route', new mongoose.Schema({}, { strict: false }), 'routes');

const SOCKET_SERVER = 'http://192.168.8.108:8035';
const socket = io(SOCKET_SERVER);

// Sayaçlar:
let mqttMessageCount = 0;
let websocketMessageCount = 0;
let dbInsertCount = 0;
let skippedCount = 0;
let errorCount = 0;

// CSV dosyası
const reportFile = path.join(__dirname, 'log_report.csv');

// Başlangıçta dosya yoksa başlık ekle
if (!fs.existsSync(reportFile)) {
    const header = 'timestamp,mqtt_messages,websocket_messages,db_inserts,skipped,errors,success_rate\n';
    fs.writeFileSync(reportFile, header, 'utf8');
}

socket.on('connect', () => {
    console.log('WebSocket sunucusuna bağlanıldı:', socket.id);
});

socket.on('routes', async (data) => {
    try {
        if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
            console.warn('Eksik veya hatalı rota verisi.');
            return;
        }

        const validRoutes = data.routes.filter(route => route.id && route.start_point && route.end_point);
        for (const route of validRoutes) {
            await Route.updateOne({ id: route.id }, route, { upsert: true });
        }
    } catch (error) {
        errorCount++;
    }
});

const vehicleIds = ['musoshi001', 'musoshi003', 'musoshi004', 'musoshi005', 'musoshi006', 'musoshi007', 'musoshi008'];

vehicleIds.forEach((vehicleId) => {
    socket.on(vehicleId, async (data) => {
        websocketMessageCount++;
        await insertVehicleData(vehicleId, data);
    });
});

client.on("connect", () => {
    console.log("MQTT broker bağlantısı başarılı.");
    client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
            console.error("Abone olunurken hata:", err);
        } else {
            console.log(`Dinleniyor: ${topic}`);
        }
    });
});

client.on("message", async (topic, message) => {
    try {
        mqttMessageCount++;

        const raw = message.toString().trim();
        const jsonStart = raw.indexOf("{");
        if (jsonStart === -1) {
            skippedCount++;
            return;
        }

        const cleanJson = raw.slice(jsonStart);
        const data = JSON.parse(cleanJson);

        if (!data.latitude || !data.longitude) {
            skippedCount++;
            return;
        }

        const parts = topic.split('/');
        const vehicleId = parts[2];

        await insertVehicleData(vehicleId, data);

    } catch (error) {
        errorCount++;
    }
});

socket.on('connect_error', (err) => {
    console.error('WebSocket bağlantı hatası:', err);
});

socket.on('disconnect', () => {
    console.log('WebSocket bağlantısı kesildi');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Yakalanmayan hata:', reason);
});

// Veritabanına kayıt fonksiyonu:
async function insertVehicleData(vehicleId, data) {
    const speed = data.vehicle_speed ?? data.speed ?? null;
    const soc = data.SoC ?? data.state_of_charge ?? data.charging_status ?? null;

    const query = `
        INSERT INTO vehicle_tracking_fiware 
        (vehicle_id, route_id, latitude, longitude, altitude, range_km, speed, slope, soc, soc_estimation, vehicle_load_kg, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
            route_id = VALUES(route_id),
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            altitude = VALUES(altitude),
            range_km = VALUES(range_km),
            speed = VALUES(speed),
            slope = VALUES(slope),
            soc = VALUES(soc),
            soc_estimation = VALUES(soc_estimation),
            vehicle_load_kg = VALUES(vehicle_load_kg),
            timestamp = NOW()
    `;

    const values = [
        vehicleId,
        data.route_id ?? null,
        data.latitude ? parseFloat(data.latitude) : null,
        data.longitude ? parseFloat(data.longitude) : null,
        data.altitude ? parseFloat(data.altitude) : null,
        data.range ? parseFloat(data.range) : null,
        speed ? parseFloat(speed) : null,
        data.slope ? parseFloat(data.slope) : null,
        soc ? parseFloat(soc) : null,
        data.soc_estimation ? parseFloat(data.soc_estimation) : null,
        data.current_load_kg ? parseFloat(data.current_load_kg) : null
    ];

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(query, values);
        dbInsertCount++;
    } catch (error) {
        errorCount++;
    } finally {
        if (conn) conn.release();
    }
}

// 🔄 Düzenli olarak raporla (her 30 saniyede bir)
setInterval(() => {
    const now = new Date().toISOString();
    console.log('\n📊 [Durum Özeti]');
    console.log(`MQTT toplam mesaj:       ${mqttMessageCount}`);
    console.log(`WebSocket toplam mesaj:  ${websocketMessageCount}`);
    console.log(`Veritabanına kaydedilen: ${dbInsertCount}`);
    console.log(`Eksik/veri hatası:       ${skippedCount}`);
    console.log(`Genel hata:              ${errorCount}`);

    const totalMessages = mqttMessageCount + websocketMessageCount;
    let successRate = 0;
    if (totalMessages > 0) {
        successRate = ((dbInsertCount / totalMessages) * 100).toFixed(2);
        console.log(`Başarı oranı:            %${successRate}`);
    } else {
        console.log(`Başarı oranı:            %0`);
    }
    console.log('-------------------------------\n');

    // 📈 CSV'ye kaydet
    const logLine = `${now},${mqttMessageCount},${websocketMessageCount},${dbInsertCount},${skippedCount},${errorCount},${successRate}\n`;
    fs.appendFile(reportFile, logLine, (err) => {
        if (err) {
            console.error('❌ CSV log yazma hatası:', err.message);
        }
    });
}, 30000);
