# Nexa Clinic - Integrated Hospital & Clinic Information System 🏥

Aplikasi Sistem Informasi Klinik Pratama berbasis web terintegrasi untuk membantu proses administrasi pelayanan pasien, otorisasi hak akses (RBAC Granular), pendaftaran kunjungan, pengelolaan antrean, hingga pencatatan pemeriksaan rekam medis dokter (SOAP).

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Axios, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Driver `mysql2/promise`) |
| **Authentication** | JSON Web Token (JWT) & Bcrypt Password Hashing |
| **Security & RBAC** | Dynamic Granular Permission Checklist System (Spatie Style) |
| **Version Control** | Git |

---

## 🔒 Ketentuan Keamanan & Environment Variables (`.env`)

Aplikasi ini **100% mematuhi standar keamanan industri**:
- **TIDAK ADA HARDCODE KREDENSIAL SENSITIF**: Seluruh konfigurasi sensitif (koneksi database, password, dan `JWT_SECRET`) dibaca secara ketat melalui file environment **`.env`** dan **TIDAK DI-HARDCODE** di dalam source code maupun repository Git.
- **Wajib File `.env.example`**: Proyek ini menyertakan template **`.env.example`** di root folder dan folder `backend/`.
- **Git Protection**: File `.env` yang berisi password asli diabaikan secara otomatis oleh Git melalui file **`.gitignore`**.

---

## ⚙️ Konfigurasi File `.env`

Sebelum menjalankan aplikasi, buat file **`.env`** di dalam folder `backend/` (atau salin dari `.env.example`):

```env
# Server Port Configuration
PORT=5000

# Database MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_nexa_clinic

# JSON Web Token Secret Key & Expiration
JWT_SECRET=nexaclinic_jwt_secret_key_2026_super_secret
JWT_EXPIRES_IN=1d
```

---

## 🗄️ Cara Melakukan Migrasi Database (`database.sql`)

1. Buka MySQL Client pilihan Anda (phpMyAdmin, Laragon MySQL, HeidiSQL, atau MySQL CLI).
2. Buat database baru (opsional) atau langsung impor file **`database.sql`** yang tersedia di root folder project:
   ```bash
   mysql -u root -p < database.sql
   ```
3. Script **`database.sql`** akan secara otomatis:
   - Membuat database **`db_nexa_clinic`**.
   - Membuat seluruh struktur tabel (`users`, `patients`, `polyclinics`, `registrations`, `queues`, `medical_records`, `medicines`, `prescriptions`, `actions`, `medical_record_actions`).
   - Mengisikan data sampel awal (*seed data*) untuk pengujian.

---

## 🚀 Cara Instalasi & Jalankan Aplikasi

### 1. Prasyarat System
- **Node.js**: Version v18.x atau lebih baru.
- **Database Server**: MySQL (Laragon / XAMPP / Native MySQL Server).

---

### 2. Setup & Jalankan Backend (Node.js / Express.js)

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
4. Jalankan backend server:
   ```bash
   # Mode Development (Auto Reload dengan Nodemon)
   npm run dev

   # Mode Production
   npm start
   ```
   *Backend server akan berjalan di `http://localhost:5000`*

---

### 3. Setup & Jalankan Frontend (React.js)

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
   *Frontend aplikasi akan berjalan di `http://localhost:3000`*

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
│   │   └── database.js         # Pool Koneksi MySQL Driver (Process.env)
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
│   ├── .env.example            # Template Environment Variable Backend
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
│   │   ├── pages/              # Domain-Driven Modular Pages Structure
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── patients/
│   │   │   │   ├── PatientsPage.jsx
│   │   │   │   └── components/ (Table, FormModal, DetailModal, DeleteModal)
│   │   │   └── users/
│   │   │       ├── UserManagementPage.jsx
│   │   │       └── components/ (Table, FormModal, DeleteModal)
│   │   ├── App.jsx             # Entrypoint Komponen React
│   │   ├── index.css           # Custom Styling & Tailwind Imports
│   │   └── main.jsx
│   ├── vite.config.js          # Vite Config & API Proxy
│   └── package.json
├── .env.example                # Template Environment Variable Root
├── .gitignore                  # Menutup file .env agar tidak masuk git
├── database.sql                # Schema Database & Initial Seed Data
├── ERD.md                      # Diagram ERD (Format Mermaid)
└── README.md                   # Dokumentasi Resmi Aplikasi
```
