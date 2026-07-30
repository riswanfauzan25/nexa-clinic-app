# Nexa Clinic - Mini Clinic Information System 🏥

Aplikasi Sistem Informasi Klinik Pratama berbasis web terintegrasi untuk membantu proses administrasi pelayanan pasien, pendaftaran, pengelolaan antrean, hingga pencatatan pemeriksaan dokter (SOAP).

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Axios, Lucide React, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Driver `mysql2/promise`) |
| **Authentication** | JSON Web Token (JWT) & Bcrypt Password Hashing |
| **Version Control** | Git |

---

## 🚀 Cara Instalasi & Jalankan Aplikasi

### 1. Prasyarat System
- **Node.js**: v18.x atau versi terbaru.
- **Database Server**: MySQL (Laragon / XAMPP / Native MySQL Server).

---

### 2. Migrasi Database (`database.sql`)
1. Buka MySQL Client / phpMyAdmin / HeidiSQL.
2. Impor file **`database.sql`** yang berada di root project.
3. Database `db_nexa_clinic` beserta 10 tabel dan data awal (*seed data*) akan otomatis terbuat.

---

### 3. Setup & Jalankan Backend (Node.js / Express.js)

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install dependensi backend:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *Isi konfigurasi `.env` yang disesuaikan:*
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_nexa_clinic
   JWT_SECRET=nexaclinic_jwt_secret_key_2026_super_secret
   JWT_EXPIRES_IN=1d
   ```
4. Jalankan backend server:
   ```bash
   # Mode Development (Auto Reload dengan Nodemon)
   npm run dev

   # Mode Production
   npm start
   ```
   *Server backend akan berjalan di `http://localhost:5000`*

---

### 4. Setup & Jalankan Frontend (React.js)

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Install dependensi frontend:
   ```bash
   npm install
   ```
3. Jalankan server lokal React:
   ```bash
   npm run dev
   ```
   *Aplikasi frontend akan berjalan di `http://localhost:3000`*

---

## 🔑 Akun Login Pengujian (Default Test Accounts)

Password untuk seluruh akun pengujian adalah: **`password123`**

| Role / Hak Akses | Username | Password | Keterangan Izin |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `password123` | Akses penuh ke seluruh modul & dashboard statistik |
| **Dokter** | `dokter` | `password123` | Akses modul pemeriksaan SOAP, tindakan medis, & resep obat |
| **Petugas Pendaftaran** | `pendaftaran` | `password123` | Akses master pasien, pendaftaran kunjungan, & panggil antrean |

---

## 📁 Struktur Project

```text
nexa-clinic-app/
├── backend/
│   ├── config/
│   │   └── database.js      # Koneksi database MySQL Pool
│   ├── controllers/
│   │   └── authController.js# Controller Login, Logout, Me
│   ├── middleware/
│   │   └── auth.js          # JWT Verification & Role Authorization
│   ├── routes/
│   │   └── authRoutes.js    # Routing REST API Auth
│   ├── utils/
│   │   └── response.js      # Helper standar JSON response API
│   ├── .env
│   ├── .env.example
│   ├── index.js             # Entrypoint server Express.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js     # Axios instance & JWT Interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global State Authentication
│   │   ├── pages/
│   │   │   └── LoginPage.jsx   # UI Halaman Login Modern
│   │   ├── App.jsx          # Entrypoint komponen React
│   │   ├── index.css        # Styling dasar & Tailwind import
│   │   └── main.jsx
│   ├── vite.config.js       # Konfigurasi Vite & Proxy API
│   └── package.json
├── .gitignore               # Git ignore rule
├── database.sql             # Schema Database & Initial Seed Data
├── ERD.md                   # Diagram ERD dalam format Mermaid
└── README.md                # Dokumentasi & Petunjuk Penggunaan
```

---

## 📋 Asumsi & Alur Bisnis Sistem

1. **Auto-Generate Nomor Rekam Medis**: Format `RM-YYYYMMDD-XXX` terbuat otomatis saat membuat pasien baru.
2. **Auto-Generate Nomor Antrean**: Format `A001`, `A002` terbuat otomatis saat pasien didaftarkan ke poli.
3. **Standar Pemeriksaan SOAP**: Dokter menginput *Subjective* (Keluhan), *Objective* (Tanda Vital), *Assessment* (Diagnosa), dan *Plan* (Terapi, Tindakan, & Resep Obat).
