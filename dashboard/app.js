const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const SensorData = require('./models/SensorData');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/sensorDashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Rutas principales
app.get('/', async (req, res) => {
  try {
    // Obtener datos de los últimos 30 minutos
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const sensorData = await SensorData.find({
      timestamp: { $gte: thirtyMinutesAgo }
    }).sort({ timestamp: 1 }).limit(200);

    // Datos para cada eje
    const accelerationData = sensorData.map(item => ({
      x: item.acceleration.x,
      y: item.acceleration.y,
      z: item.acceleration.z,
      timestamp: item.timestamp,
      magnitude: item.magnitude
    }));

    const gyroscopeData = sensorData.map(item => ({
      x: item.gyroscope.x,
      y: item.gyroscope.y,
      z: item.gyroscope.z,
      timestamp: item.timestamp
    }));

    // Estadísticas
    const stats = {
      totalReadings: sensorData.length,
      lastUpdate: sensorData.length > 0 ? sensorData[sensorData.length - 1].timestamp : new Date(),
      avgMagnitude: sensorData.reduce((sum, item) => sum + item.magnitude, 0) / sensorData.length || 0,
      maxMagnitude: Math.max(...sensorData.map(item => item.magnitude), 0)
    };

    res.render('dashboard', {
      accelerationData: JSON.stringify(accelerationData),
      gyroscopeData: JSON.stringify(gyroscopeData),
      stats
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar los datos del sensor');
  }
});

// API para datos en tiempo real
app.get('/api/sensor-data', async (req, res) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const data = await SensorData.find({
      timestamp: { $gte: thirtyMinutesAgo }
    }).sort({ timestamp: 1 }).limit(50);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para recibir datos del acelerómetro (desde tu app móvil)
app.post('/api/sensor-data', async (req, res) => {
  try {
    const {
      deviceId,
      acceleration,
      gyroscope,
      magnitude,
      activity,
      vibrationLevel,
      location,
      batteryLevel
    } = req.body;

    const sensorData = new SensorData({
      deviceId: deviceId || 'default-device',
      acceleration: acceleration || { x: 0, y: 0, z: 0 },
      gyroscope: gyroscope || { x: 0, y: 0, z: 0 },
      magnitude: magnitude || 0,
      activity: activity || 'unknown',
      vibrationLevel: vibrationLevel || 'low',
      location: location || { latitude: 0, longitude: 0 },
      batteryLevel: batteryLevel || 100
    });

    await sensorData.save();
    res.json({ success: true, message: 'Datos guardados correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generar datos de prueba
app.post('/api/generate-test-data', async (req, res) => {
  try {
    const testData = [];
    const now = new Date();
    
    // Generar 50 puntos de datos de prueba
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - (49 - i) * 1000); // 1 segundo entre puntos
      
      testData.push({
        deviceId: 'test-device-001',
        acceleration: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20 + 9.8 // gravedad en z
        },
        gyroscope: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10
        },
        magnitude: Math.random() * 25,
        activity: ['walking', 'running', 'stationary', 'driving'][Math.floor(Math.random() * 4)],
        vibrationLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        location: {
          latitude: 19.4326 + (Math.random() - 0.5) * 0.01,
          longitude: -99.1332 + (Math.random() - 0.5) * 0.01
        },
        batteryLevel: 80 + Math.random() * 20,
        timestamp: timestamp
      });
    }

    await SensorData.insertMany(testData);
    res.json({ success: true, message: 'Datos de prueba generados', count: testData.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const stats = await SensorData.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: null,
          avgMagnitude: { $avg: '$magnitude' },
          maxMagnitude: { $max: '$magnitude' },
          minMagnitude: { $min: '$magnitude' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || { avgMagnitude: 0, maxMagnitude: 0, minMagnitude: 0, count: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard del acelerómetro running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET  / → Dashboard principal`);
  console.log(`   - GET  /api/sensor-data → Datos del sensor`);
  console.log(`   - POST /api/sensor-data → Enviar datos del sensor`);
  console.log(`   - POST /api/generate-test-data → Generar datos de prueba`);
});

// Endpoint para limpiar datos (agregar en app.js)
app.delete('/api/clear-data', async (req, res) => {
  try {
    await SensorData.deleteMany({});
    res.json({ success: true, message: 'Todos los datos han sido eliminados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});