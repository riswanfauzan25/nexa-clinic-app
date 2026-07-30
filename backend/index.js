const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); 

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes API
app.use('/api', authRoutes);               // melayani /api/login, /api/logout, /api/me
app.use('/api/patients', patientRoutes);     // melayani CRUD /api/patients
app.use('/api/dashboard', dashboardRoutes); // melayani /api/dashboard/summary
app.use('/api/users', userRoutes);         // melayani CRUD /api/users (Admin Only)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Server Backend Nexa Clinic Berjalan!"
  });
});

// Menyalakan server sekaligus tes koneksi database
app.listen(PORT, async () => {
  console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
  try {
    await db.query('SELECT 1'); // Mengetes "ping" ke database
    console.log('Berhasil terhubung ke database MySQL!');
  } catch (error) {
    console.log('Gagal terhubung ke database:', error.message);
  }
});