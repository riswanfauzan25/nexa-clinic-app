# Nexa Clinic - Integrated Hospital & Clinic Information System 🏥

Aplikasi Sistem Informasi Klinik Pratama berbasis web terintegrasi untuk membantu proses administrasi pelayanan pasien, otorisasi hak akses (RBAC Granular), pendaftaran kunjungan, pengelolaan antrean, hingga pencatatan pemeriksaan rekam medis dokter (SOAP).

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Axios, Lucide React, React Context |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Driver `mysql2/promise`) |
| **Authentication** | JSON Web Token (JWT) & Bcrypt Password Hashing |
| **Security & RBAC** | Dynamic Granular Permission Checklist System (Spatie Style) |
| **Version Control** | Git |

---

## 🌟 Fitur Utama & Proses Bisnis Sistem

1. **Keamanan & Otorisasi RBAC Granular**:
   - Sistem login JWT terenkripsi dengan hashing password `bcrypt`.
   - **Matriks Hak Akses Checklist**: Pengaturan izin spesifik per modul & aksi (`view`, `create`, `edit`, `delete`) untuk seluruh modul master dan transaksi.
   - Pengecekan otorisasi berlapis di Backend (Middleware `authorizeRoles`) dan Frontend (`hasPermission`).

2. **Top Navbar & Dynamic Accordion Submenu Sidebar**:
   - **Accordion Submenu Navigation**: Navigasi terkelompok (*Otorisasi System*, *Master Data*, *Pelayanan Klinik*) dengan panah expand/collapse yang ringkas dan tidak kepanjangan.
   - **Auto-Filter RBAC**: Submenu dan kelompok menu otomatis disembunyikan jika user tidak memiliki izin akses.
   - Profile Dropdown Box (Nama, Username, Badge Role, & Dialog Konfirmasi Logout).

3. **Modul Kelola Pengguna (User Management)**:
   - Manajemen akun pegawai, dokter, dan petugas pendaftaran.
   - Pengaturan checklist hak akses modular per aksi.
   - Pencarian real-time, pagination, modal form CRUD, & alert notifikasi sukses.

4. **Katalog Master Data Lengkap (4 Modul Master)**:
   - **Master Data Pasien**: Auto-generate Nomor Rekam Medis (`RM-YYYYMMDD-001`), validasi NIK 16 digit, Modal Detail Pasien + kalkulasi umur otomatis dari tanggal lahir.
   - **Master Data Poliklinik (`polyclinics`)**: Katalog layanan spesialisasi poli (Poli Umum, Poli Gigi, Poli Anak) yang terhubung ke loket pendaftaran.
   - **Master Data Tindakan Medis (`procedures`)**: Katalog kode tindakan medis (`TDK-001`) yang terhubung ke pemeriksaan Dokter (SOAP).
   - **Master Data Obat-obatan (`medicines`)**: Katalog kode obat (`OBT-001`) beserta satuan kemasan (Tablet, Kaplet, Botol, Salep) yang terhubung ke Resep Dokter.

5. **Modul Transaksional Pelayanan Klinik (Proses Bisnis Terintegrasi)**:
   - **Pendaftaran Kunjungan Pasien (`registrations`)**: Mendaftarkan pasien berobat, memilih poli & dokter jaga, auto-generate nomor kunjungan (`REG-YYYYMMDD-001`).
   - **Kelola Antrean Real-Time (`queues`)**: Penerbitan nomor antrean otomatis (`A001`), pemanggilan antrean loket/ruang dokter (`Waiting` ➔ `Calling` ➔ `Serving` ➔ `Completed`).
   - **Pemeriksaan Dokter & SOAP (`medical_records`)**: Pencatatan data Subjektif, Objektif, Assessment, & Plan.
   - **Input Tindakan Medis (`patient_procedures`)**: Mencatat rincian tindakan medis yang dilakukan dokter kepada pasien.
   - **Input Resep Obat (`patient_prescriptions`)**: Mencatat rincian obat, dosis, dan aturan minum pasien.

---

## 📬 Dokumentasi REST API (Postman Collection)

File Postman Collection tersedia di root folder proyek: **`postman_collection.json`**

### Cara Import ke Postman:
1. Buka aplikasi **Postman** di komputer Anda.
2. Klik tombol **`Import`** di pojok kiri atas.
3. Pilih tab **`File`** ➔ Klik **`Choose Files`**.
4. Pilih file **`postman_collection.json`** dari folder root proyek ini.
5. Klik **`Import`** — Collection akan langsung muncul di sidebar Postman.

### Cara Penggunaan:
1. Jalankan backend server terlebih dahulu: `cd backend && npm run dev`
2. Buka folder **`🔐 Auth - Autentikasi`** ➔ Jalankan request **`Login`**
3. Token JWT akan **otomatis tersimpan** ke variabel `{{token}}` (via Postman Test Script)
4. Semua endpoint lain akan otomatis menggunakan token tersebut via `Authorization: Bearer {{token}}`

### Daftar Endpoint API yang Tersedia:

| Kelompok | Endpoint | Method | Auth |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/login` | POST | ❌ |
| **Auth** | `/api/me` | GET | ✅ |
| **Auth** | `/api/logout` | POST | ✅ |
| **Dashboard** | `/api/dashboard/summary` | GET | ✅ |
| **Patients** | `/api/patients` | GET, POST | ✅ |
| **Patients** | `/api/patients/:id` | GET, PUT, DELETE | ✅ |
| **Polyclinics** | `/api/polyclinics` | GET, POST | ✅ |
| **Polyclinics** | `/api/polyclinics/:id` | GET, PUT, DELETE | ✅ |
| **Procedures** | `/api/procedures` | GET, POST | ✅ |
| **Procedures** | `/api/procedures/:id` | GET, PUT, DELETE | ✅ |
| **Medicines** | `/api/medicines` | GET, POST | ✅ |
| **Medicines** | `/api/medicines/:id` | GET, PUT, DELETE | ✅ |
| **Users** | `/api/users` | GET, POST | ✅ Admin |
| **Users** | `/api/users/:id` | PUT, DELETE | ✅ Admin |

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

## 🗄️ Struktur Database & Cara Migrasi (`database.sql`)

### Struktur 10 Tabel Database MySQL:

```text
db_nexa_clinic
├── 🟢 KELOMPOK MASTER DATA
│   ├── 1. users                  (Akun pegawai, password bcrypt, & permissions JSON)
│   ├── 2. patients               (Data identitas pasien & No. Rekam Medis / NIK)
│   ├── 3. polyclinics            (Data master poliklinik klinik)
│   ├── 4. medicines              (Data master obat-obatan & satuan kemasan)
│   └── 5. procedures             (Data master kode tindakan medis)
│
└── 🔵 KELOMPOK TRANSAKSIONAL PELAYANAN
    ├── 6. registrations          (Data pendaftaran kunjungan pasien ke poli & dokter)
    ├── 7. queues                 (Data nomor urut antrean & status pemanggilan A001)
    ├── 8. medical_records        (Data rekam medis pemeriksaan Dokter / SOAP)
    ├── 9. patient_procedures     (Data relasi tindakan medis yang diberikan ke pasien)
    └── 10. patient_prescriptions (Data relasi resep obat & dosis yang diberikan ke pasien)
```

### Cara Migrasi Database:

1. Buka Client MySQL (phpMyAdmin / Laragon MySQL / HeidiSQL / MySQL CLI).
2. Buat database baru (opsional) atau langsung impor file **`database.sql`** yang tersedia di root folder project:
   ```bash
   mysql -u root -p < database.sql
   ```
3. Script **`database.sql`** akan secara otomatis membuat 10 tabel di atas beserta data sampel awal (*seed data*) untuk pengujian.

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
| **Administrator** | `admin` | `password123` | Full access seluruh modul master, kelola pengguna, & RBAC |
| **Dokter** | `dokter` | `password123` | Akses modul pemeriksaan SOAP, antrean, & resep obat |
| **Petugas Pendaftaran** | `pendaftaran` | `password123` | Akses master pasien, pendaftaran kunjungan, & antrean |

---

## 📁 Struktur Project (Atomic Component Architecture)

```text
nexa-clinic-app/
├── backend/
│   ├── config/
│   │   └── database.js         # Pool Koneksi MySQL Driver (Process.env)
│   ├── controllers/
│   │   ├── authController.js   # Controller Login, Logout, & Me
│   │   ├── dashboardController.js # Controller Statistics & Summary
│   │   ├── masterController.js # Controller CRUD Poliklinik, Procedures, & Medicines
│   │   ├── patientController.js # Controller CRUD Master Pasien
│   │   └── userController.js    # Controller CRUD Pengguna & RBAC
│   ├── middleware/
│   │   └── auth.js             # Verifikasi JWT & Otorisasi Roles
│   ├── routes/
│   │   ├── authRoutes.js       # API Routes Authentication
│   │   ├── dashboardRoutes.js  # API Routes Dashboard
│   │   ├── masterRoutes.js     # API Routes Master Data (Poli, Procedures, Medicines)
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
│   │   │   └── Sidebar.jsx     # Accordion Submenu Navigation filtered by RBAC
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global Auth & hasPermission Helper
│   │   ├── pages/              # Domain-Driven Modular Pages & Components
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── medicines/
│   │   │   │   └── MedicinesPage.jsx # CRUD Master Obat-obatan
│   │   │   ├── patients/
│   │   │   │   ├── PatientsPage.jsx
│   │   │   │   └── components/ (PatientTable, FormModal, DetailModal, DeleteModal)
│   │   │   ├── polyclinics/
│   │   │   │   └── PolyclinicsPage.jsx # CRUD Master Poliklinik
│   │   │   ├── procedures/
│   │   │   │   └── ProceduresPage.jsx # CRUD Master Tindakan Medis
│   │   │   └── users/
│   │   │       ├── UserManagementPage.jsx
│   │   │       └── components/ (UserTable, UserFormModal, UserDeleteModal)
│   │   ├── App.jsx             # Entrypoint Komponen React
│   │   ├── index.css           # Custom Styling & Tailwind Imports
│   │   └── main.jsx
│   ├── vite.config.js          # Vite Config & API Proxy
│   └── package.json
├── .env.example                # Template Environment Variable Root
├── .gitignore                  # Menutup file .env agar tidak masuk git
├── database.sql                # Schema Database 10 Tabel & Seed Data
├── ERD.md                      # Diagram ERD (Format Mermaid)
└── README.md                   # Dokumentasi Resmi Aplikasi
```
