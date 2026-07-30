const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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