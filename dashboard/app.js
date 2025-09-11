const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Data = require('./models/data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/dashboardDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Rutas
app.get('/', async (req, res) => {
  try {
    // Obtener datos de diferentes métricas
    const temperatureData = await Data.find({ metric: 'temperature' }).sort({ timestamp: -1 }).limit(50);
    const salesData = await Data.find({ metric: 'sales' }).sort({ timestamp: -1 }).limit(50);
    const usersData = await Data.find({ metric: 'users' }).sort({ timestamp: -1 }).limit(50);

    res.render('dashboard', {
      temperatureData,
      salesData,
      usersData
    });
  } catch (error) {
    res.status(500).send('Error al cargar los datos');
  }
});

// API para datos en tiempo real
app.get('/api/data/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const data = await Data.find({ metric }).sort({ timestamp: -1 }).limit(20);
    res.json(data.reverse()); // Reverse para orden cronológico
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Insertar datos de ejemplo (para testing)
app.post('/api/seed', async (req, res) => {
  try {
    // Datos de ejemplo
    const sampleData = [
      { value: Math.random() * 100, category: 'A', metric: 'temperature' },
      { value: Math.random() * 500, category: 'B', metric: 'sales' },
      { value: Math.random() * 1000, category: 'C', metric: 'users' }
    ];

    await Data.insertMany(sampleData);
    res.json({ message: 'Datos insertados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar datos' });
  }
});

app.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
});