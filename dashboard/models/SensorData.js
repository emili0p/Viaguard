const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  deviceId: String,
  acceleration: {
    x: Number,
    y: Number,
    z: Number
  },
  gyroscope: {
    x: Number,
    y: Number,
    z: Number
  },
  magnitude: Number,
  activity: String,
  vibrationLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  batteryLevel: Number
});

// Índice para búsquedas eficientes
sensorDataSchema.index({ timestamp: -1 });
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);