# Nexa Clinic - Integrated Hospital & Clinic Information System 🏥

Aplikasi Sistem Informasi Klinik Pratama berbasis web terintegrasi untuk membantu proses administrasi pelayanan pasien, otorisasi hak akses (RBAC Granular), pendaftaran kunjungan, pengelolaan antrean, hingga pencatatan pemeriksaan rekam medis dokter (SOAP).

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Axios, Lucide React, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Driver `mysql2/promise`) |
| **Authentication** | JSON Web Token (JWT) & Bcrypt Password Hashing |
| **Security & RBAC** | Dynamic Granular Permission Checklist System (Spatie Style) |
| **Version Control** | Git |

---

## 🌟 Fitur Utama Sistem

1. **Keamanan & Otorisasi RBAC Granular**:
   - Sistem login JWT terenkripsi dengan hashing password `bcrypt`.
   - **Matriks Hak Akses Checklist**: Pengaturan izin spesifik per modul & aksi (`view`, `create`, `edit`, `delete`).
   - Navigasi Sidebar dan tombol aksi ter-filter secara dinamis & real-time berbasis hak akses aktif.

2. **Top Navbar & Profile Dropdown**:
   - Branding resmi Nexa Clinic.
   - Profile Dropdown Box (Nama, Username, Badge Role, & Logout).
   - Dialog Konfirmasi Logout (*Logout Confirmation Modal*).

3. **Dashboard Operasional Per-Role**:
   - **Tampilan Dokter**: Fokus antrean pasien menunggu, pasien selesai diperiksa, & shortcut SOAP.
   - **Tampilan Petugas Pendaftaran**: Fokus loket pendaftaran kunjungan & pemanggilan antrean.
   - **Tampilan Administrator**: Executive summary 5 metrik utama & Matriks Checklist RBAC.

4. **Modul Kelola Pengguna (User Management)**:
   - Manajemen akun pegawai, dokter, dan petugas pendaftaran.
   - Pengaturan checklist hak akses modular.
   - Pencarian real-time, pagination, modal form CRUD, & alert notifikasi sukses hapus.

5. **Modul Master Data Pasien**:
   - Auto-generate **Nomor Rekam Medis (No. RM)** otomatis: `RM-YYYYMMDD-001`.
   - Validasi NIK 16 digit angka & pencegahan duplikasi NIK di database.
   - Modal Detail Pasien lengkap dengan kalkulasi umur otomatis dari tanggal lahir.
   - Pencarian real-time, pagination, modal form CRUD, & alert notifikasi sukses hapus.

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
| **Administrator** | `admin` | `password123` | Full access seluruh modul, kelola pengguna, & RBAC |
| **Dokter** | `dokter` | `password123` | Akses modul pemeriksaan SOAP, antrean, & resep obat |
| **Petugas Pendaftaran** | `pendaftaran` | `password123` | Akses master pasien, pendaftaran kunjungan, & antrean |

---

## 📁 Struktur Project

```text
nexa-clinic-app/
├── backend/
│   ├── config/
│   │   └── database.js         # Pool Koneksi MySQL Driver
│   ├── controllers/
│   │   ├── authController.js   # Controller Login, Logout, & Me
│   │   ├── dashboardController.js # Controller Statistics & Summary
│   │   ├── patientController.js # Controller CRUD Master Pasien
│   │   └── userController.js    # Controller CRUD Pengguna & RBAC
│   ├── middleware/
│   │   └── auth.js             # Verifikasi JWT & Otorisasi Roles
│   ├── routes/
│   │   ├── authRoutes.js       # API Routes Authentication
│   │   ├── dashboardRoutes.js  # API Routes Dashboard
│   │   ├── patientRoutes.js    # API Routes Patients
│   │   └── userRoutes.js       # API Routes User Management
│   ├── utils/
│   │   └── response.js         # Standard Response JSON Helper
│   ├── .env
│   ├── .env.example
│   ├── index.js                # Entrypoint server Express.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios Client & Interceptor JWT
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Top Header & Profile Dropdown
│   │   │   └── Sidebar.jsx     # Navigation Bar filtered by RBAC
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global Auth & hasPermission Helper
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx # Role-Based Dashboard View
│   │   │   ├── LoginPage.jsx   # UI Login & Alert Auto-Dismiss
│   │   │   ├── PatientsPage.jsx # CRUD Pasien, Detail, & Pagination
│   │   │   └── UserManagementPage.jsx # CRUD User & RBAC Checklist Grid
│   │   ├── App.jsx             # Entrypoint Komponen React
│   │   ├── index.css           # Custom Styling & Tailwind Imports
│   │   └── main.jsx
│   ├── vite.config.js          # Vite Config & API Proxy
│   └── package.json
├── database.sql                # Database Schema & Initial Seed Data
├── ERD.md                      # Diagram ERD (Format Mermaid)
└── README.md                   # Dokumentasi Resmi Aplikasi
```

---

## 📋 Asumsi & Alur Bisnis Sistem

1. **Auto-Generate Nomor Rekam Medis**: Format `RM-YYYYMMDD-001` terbuat otomatis saat pendaftaran pasien baru.
2. **Dynamic Granular Permission System**: Setiap akun pegawai dapat dikustomisasi izinnya (misal: hanya boleh `view` tanpa `edit` atau `delete`).
3. **Penyimpanan Password Aman**: Password tersimpan dalam format terenkripsi Bcrypt di database MySQL (`$2b$10$...`).
