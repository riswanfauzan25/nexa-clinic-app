const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); 

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const polyclinicRoutes = require('./routes/polyclinicRoutes');
const procedureRoutes = require('./routes/procedureRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const queueRoutes = require('./routes/queueRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes API Clean Modular Mapping
app.use('/api', authRoutes);                       // /api/login, /api/logout, /api/me
app.use('/api/patients', patientRoutes);             // /api/patients (CRUD Master Pasien)
app.use('/api/polyclinics', polyclinicRoutes);       // /api/polyclinics (CRUD Master Poliklinik)
app.use('/api/procedures', procedureRoutes);         // /api/procedures (CRUD Master Tindakan Medis)
app.use('/api/medicines', medicineRoutes);           // /api/medicines (CRUD Master Obat-obatan)
app.use('/api/doctors', doctorRoutes);               // /api/doctors (Daftar Dokter Jaga)
app.use('/api/dashboard', dashboardRoutes);         // /api/dashboard/summary
app.use('/api/users', userRoutes);                 // /api/users (CRUD User & RBAC - Admin Only)
app.use('/api/registrations', registrationRoutes); // /api/registrations (Pendaftaran Kunjungan)
app.use('/api/queues', queueRoutes);               // /api/queues (Kelola & Panggil Antrean)
app.use('/api/medical-records', medicalRecordRoutes); // /api/medical-records (Rekam Medis SOAP)

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