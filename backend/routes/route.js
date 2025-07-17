const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// .env dosyasının konumunu açıkça belirterek yükleme
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();

// OPEVA veritabanı için ayrı bir bağlantı oluştur
const OPEVA_MONGODB_URI = process.env.OPEVA_MONGODB_URI || 'mongodb+srv://esogu:jXcnHMMckNd32k7n@cluster0.zggbd.mongodb.net/opeva?retryWrites=true&w=majority';

// Yeni bağlantı oluştur (mongoose.connect yerine createConnection kullan)
const opevaConnection = mongoose.createConnection(OPEVA_MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Bağlantı event'lerini dinle
opevaConnection.on('error', (err) => {
  console.error('❌ OPEVA MongoDB Bağlantı Hatası:', err);
});

opevaConnection.once('open', () => {
  console.log('✅ OPEVA MongoDB Bağlantısı Başarılı!');
});

// Şemayı tanımla
const RouteSchema = new mongoose.Schema({}, { strict: false });

// Modeli yeni bağlantı üzerinden oluştur
const Route = opevaConnection.model('Route', RouteSchema, 'routes');

// 📌 **Tüm rotaları MongoDB'den al**
router.get('/routes', async (req, res) => {
    try {
        const routes = await Route.find({});
        res.status(200).json(routes);
    } catch (error) {
        console.error('❌ MongoDB Hata:', error);
        res.status(500).json({ error: 'Rota verisi alınamadı.' });
    }
});

// 📌 **Belirli bir rota ID'yi al**
router.get('/routes/:routeId', async (req, res) => {
    try {
        const route = await Route.findOne({ id: req.params.routeId });

        if (!route) {
            return res.status(404).json({ error: 'Rota bulunamadı' });
        }

        res.json(route);
    } catch (error) {
        console.error('❌ MongoDB Hata:', error);
        res.status(500).json({ error: 'Rota verisi alınamadı.' });
    }
});

module.exports = router;
