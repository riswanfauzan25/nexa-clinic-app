# Nexa Clinic - Integrated Hospital & Clinic Information System 🏥

Aplikasi Sistem Informasi Klinik Pratama berbasis web terintegrasi untuk membantu proses administrasi pelayanan pasien, otorisasi hak akses (RBAC Granular), pendaftaran kunjungan, pengelolaan antrean, pencatatan rekam medis dokter (SOAP), hingga pencetakan resume medis pasien.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Axios, Lucide React, React Context |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Driver `mysql2/promise`) |
| **Authentication** | JSON Web Token (JWT) & Bcrypt Password Hashing |
| **Security & RBAC** | Dynamic Granular Permission Checklist System (Spatie Style) |
| **Error Handling** | React Error Boundary & Global API Interceptor |
| **Version Control** | Git |

---

## 🌟 Fitur Utama & Proses Bisnis Sistem

1. **Keamanan & Otorisasi RBAC Granular**:
   - Sistem login JWT terenkripsi dengan hashing password `bcrypt`.
   - **Matriks Hak Akses Checklist**: Pengaturan izin spesifik per modul & aksi (`view`, `create`, `edit`, `delete`) untuk seluruh modul master dan transaksi.
   - Pengecekan otorisasi berlapis di Backend (Middleware `authorizeRoles`) dan Frontend (`hasPermission`).

2. **Top Navbar & Dynamic Accordion Submenu Sidebar**:
   - **Accordion Submenu Navigation**: Navigasi terkelompok (*Otorisasi System*, *Master Data*, *Pelayanan Klinik*) dengan panah expand/collapse yang ringkas.
   - **Auto-Filter RBAC**: Submenu dan kelompok menu otomatis disembunyikan jika user tidak memiliki izin akses.
   - Profile Dropdown Box (Nama, Username, Badge Role, & Dialog Konfirmasi Logout).

3. **Dashboard Statistik & Filter Laporan Bulanan (Role-Aware)**:
   - **Kartu Statistik Terisolasi per Role**: Statistik kunjungan otomatis menyaring data dokter yang bersangkutan saat login sebagai Dokter DPJP.
   - **Filter Laporan Periode Bulanan**: Pilihan Bulan (Januari - Desember) & Tahun Dinamis (membaca dari database `availableYears`) untuk menampilkan total kunjungan bulanan, antrean terbit, dan breakdown kunjungan per poliklinik.
   - **Tombol Pintas "Hari Ini"**: Mereset filter periode ke bulan & tahun berjalan dengan 1 klik.

4. **Modul Kelola Pengguna (User Management)**:
   - Manajemen akun pegawai, dokter, dan petugas pendaftaran.
   - Pengaturan checklist hak akses modular per aksi.
   - Pencarian real-time, pagination, modal form CRUD, & alert notifikasi sukses.

5. **Katalog Master Data & Arsitektur Controller Terpisah**:
   - **Clean Modular Architecture**: Seluruh router dan controller terpisah 1-to-1 (`polyclinicController`, `procedureController`, `medicineController`, `queueController`, `patientController`, `userController`, `medicalRecordController`).
   - **Master Data Pasien**: Auto-generate Nomor Rekam Medis (`RM-YYYYMMDD-001`), validasi NIK 16 digit, Modal Detail Pasien + kalkulasi umur otomatis dari tanggal lahir.
   - **Master Data Poliklinik (`polyclinics`)**: Katalog layanan spesialisasi poli (Poli Umum, Poli Gigi, Poli Anak) yang terhubung ke pendaftaran & tindakan.
   - **Master Data Tindakan Medis (`procedures`)**: Katalog kode tindakan medis (`TDK-001`) yang terhubung ke poliklinik dan form SOAP Dokter.
   - **Master Data Obat-obatan (`medicines`)**: Katalog kode obat (`OBT-001`) beserta satuan kemasan (Tablet, Kaplet, Botol, Salep) yang terhubung ke Resep Dokter.

6. **Modul Transaksional Pelayanan Klinik (Proses Bisnis Terintegrasi)**:
   - **Pendaftaran Kunjungan Pasien (`registrations`)**: Mendaftarkan pasien berobat, memilih poli & dokter jaga, jenis pembayaran (Umum, BPJS, Asuransi), auto-generate nomor kunjungan (`REG-YYYYMMDD-001`), cetak tiket antrean, validasi pendaftaran ganda aktif, Modal Detail Pendaftaran, dan Export Laporan PDF.
   - **Kelola & Panggil Antrean Pasien (`queues`)**: Penerbitan nomor antrean per poli (`A001`, `B001`), pemanggilan audio suara antrean loket (ejaan huruf & angka), kontrol status (`Menunggu` ➔ `Dipanggil` / `Check In` ➔ `Melayani` / `Pemeriksaan` ➔ `Selesai` / `Lewat`), filter status antrean aktif, panggil lagi antrean dilewati, serta Modal Konfirmasi Lewati Kustom.
   - **Display TV Monitor Antrean (`/queue-display`)**: Tampilan Layar TV Monitor Ruang Tunggu real-time bertema terang (*Light Mode*).
   - **Pemeriksaan Dokter & SOAP (`medical_records`)**: Form 4 seksi (Vital Signs / Objective, SOAP Notes, Input Tindakan Medis terfilter poli + popup ketik manual auto-save ke master, dan Input Resep Obat).
   - **Modal Detail SOAP & Cetak Resume Medis Pasien**: Modal detail rekam medis read-only lengkap dengan tombol **`🖨️ Cetak Resume Medis & Resep`** yang secara otomatis mencetak dokumen resmi bertata letak profesional (`printMedicalRecord.js`).
   - **Modal Riwayat Pasien (`PatientHistoryModal`)**: Menampilkan seluruh riwayat rekam medis terdahulu milik pasien tertentu.

7. **React Error Boundary & Perlindungan Layar Blank**:
   - Dilengkapi dengan `ErrorBoundary.jsx` bertema terang (*Light Theme*) untuk menangkap kesalahan JavaScript rendering dan menyediakan tombol "Muat Ulang Halaman".

---

## 📬 Dokumentasi REST API (Postman Collection)

File Postman Collection resmi tersedia di root folder proyek: **`postman_collection.json`**

### Cara Import ke Postman:
1. Buka aplikasi **Postman** di komputer Anda.
2. Klik tombol **`Import`** di pojok kiri atas.
3. Pilih tab **`File`** ➔ Klik **`Choose Files`**.
4. Pilih file **`postman_collection.json`** dari folder root proyek ini.
5. Klik **`Import`** — Collection **`🩺 Nexa Clinic API Collection`** akan langsung muncul di sidebar Postman.

### Cara Penggunaan:
1. Jalankan backend server terlebih dahulu: `cd backend && npm run dev`
2. Buka folder **`🔐 Auth - Autentikasi`** ➔ Jalankan request **`Login`**
3. Token JWT akan **otomatis tersimpan** ke variabel `{{token}}` (via Postman Test Script).
4. Semua endpoint lain akan otomatis menggunakan token tersebut via `Authorization: Bearer {{token}}`.

| Kelompok | Endpoint | Method | Auth |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/login` | POST | ❌ Public |
| **Auth** | `/api/me` | GET | ✅ Authenticated |
| **Auth** | `/api/logout` | POST | ✅ Authenticated |
| **Dashboard** | `/api/dashboard/summary?month=MM&year=YYYY` | GET | ✅ Authenticated |
| **Users** | `/api/users` | GET, POST, PUT, DELETE | ✅ Admin Only |
| **Doctors** | `/api/doctors` | GET | ✅ Authenticated |
| **Patients** | `/api/patients` | GET, POST, PUT, DELETE | ✅ Authenticated |
| **Polyclinics** | `/api/polyclinics` | GET, POST, PUT, DELETE | ✅ Authenticated |
| **Procedures** | `/api/procedures` | GET, POST, PUT, DELETE | ✅ Admin / Dokter |
| **Medicines** | `/api/medicines` | GET, POST, PUT, DELETE | ✅ Authenticated |
| **Registrations** | `/api/registrations` | GET, POST, DELETE | ✅ Authenticated |
| **Registrations Status** | `/api/registrations/:id/status` | PUT | ✅ Authenticated |
| **Queues** | `/api/queues` | GET | ✅ Authenticated |
| **Queues Call** | `/api/queues/:id/call` | PUT | ✅ Authenticated |
| **Queues Skip** | `/api/queues/:id/skip` | PUT | ✅ Authenticated |
| **Queues Serve** | `/api/queues/:id/serve` | PUT | ✅ Authenticated |
| **Medical Records Ready** | `/api/medical-records/ready` | GET | ✅ Authenticated |
| **Medical Records** | `/api/medical-records` | GET, POST | ✅ Authenticated |
| **Medical Records Detail** | `/api/medical-records/:id` | GET, PUT, DELETE | ✅ Authenticated |

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
│   └── 5. procedures             (Data master kode tindakan medis & relasi polyclinic_id)
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
│   │   ├── authController.js        # Controller Login, Logout, & Me
│   │   ├── dashboardController.js   # Controller Statistics & Summary (Month/Year Filter)
│   │   ├── patientController.js     # Controller CRUD Master Pasien (Role-Aware)
│   │   ├── polyclinicController.js  # Controller CRUD Master Poliklinik
│   │   ├── procedureController.js   # Controller CRUD Master Tindakan Medis (Filter Poli)
│   │   ├── medicineController.js    # Controller CRUD Master Obat-obatan
│   │   ├── registrationController.js # Controller Pendaftaran Kunjungan Pasien
│   │   ├── queueController.js       # Controller Kelola & Panggil Antrean (Role-Aware)
│   │   ├── medicalRecordController.js # Controller Rekam Medis SOAP & Resep Dokter
│   │   └── userController.js        # Controller CRUD Pengguna & RBAC
│   ├── middleware/
│   │   └── auth.js                  # Verifikasi JWT & Otorisasi Roles
│   ├── routes/
│   │   ├── authRoutes.js            # API Routes Authentication
│   │   ├── dashboardRoutes.js       # API Routes Dashboard Summary
│   │   ├── patientRoutes.js         # API Routes Master Pasien
│   │   ├── polyclinicRoutes.js      # API Routes Master Poliklinik
│   │   ├── procedureRoutes.js       # API Routes Master Tindakan Medis
│   │   ├── medicineRoutes.js        # API Routes Master Obat-obatan
│   │   ├── registrationRoutes.js    # API Routes Pendaftaran Kunjungan
│   │   ├── queueRoutes.js           # API Routes Kelola Antrean
│   │   ├── doctorRoutes.js          # API Routes Daftar Dokter Aktif
│   │   ├── medicalRecordRoutes.js   # API Routes Pemeriksaan & Rekam Medis SOAP
│   │   └── userRoutes.js            # API Routes User Management
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
│   │   │   ├── ErrorBoundary.jsx # React Error Boundary (Theme Light)
│   │   │   ├── Navbar.jsx      # Top Header & Profile Dropdown
│   │   │   └── Sidebar.jsx     # Accordion Submenu Navigation filtered by RBAC
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global Auth & hasPermission Helper
│   │   ├── pages/              # Domain-Driven Modular Pages & Components
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx # Dashboard & Month/Year Report Filter
│   │   │   ├── medicines/
│   │   │   │   └── MedicinesPage.jsx # CRUD Master Obat-obatan
│   │   │   ├── patients/
│   │   │   │   ├── PatientsPage.jsx
│   │   │   │   └── components/ (PatientTable, FormModal, DetailModal, DeleteModal)
│   │   │   ├── polyclinics/
│   │   │   │   └── PolyclinicsPage.jsx # CRUD Master Poliklinik
│   │   │   ├── procedures/
│   │   │   │   └── ProceduresPage.jsx # CRUD Master Tindakan Medis
│   │   │   ├── registrations/
│   │   │   │   ├── RegistrationsPage.jsx
│   │   │   │   └── components/ (RegistrationTable, FormModal, DetailModal, TicketModal, DeleteModal, CancelModal)
│   │   │   ├── queues/
│   │   │   │   ├── QueuesPage.jsx      # Kelola & Panggil Antrean Loket
      │   │   │   ├── QueueDisplayPage.jsx # Display TV Monitor Ruang Tunggu
      │   │   │   └── components/ (QueueTable, QueueSkipModal)
│   │   │   ├── medical-records/
│   │   │   │   ├── MedicalRecordsPage.jsx
│   │   │   │   └── components/ (MedicalRecordFormModal, MedicalRecordDetailModal, PatientHistoryModal)
│   │   │   └── users/
│   │   │       ├── UserManagementPage.jsx
│   │   │       └── components/ (UserTable, UserFormModal, UserDeleteModal)
│   │   ├── utils/
│   │   │   └── printMedicalRecord.js # Helper Cetak Resume Medis & Resep Pasien
│   │   ├── App.jsx             # Entrypoint Komponen React & ErrorBoundary
│   │   ├── index.css           # Custom Styling & Light Theme Tailwind
│   │   └── main.jsx
│   ├── vite.config.js          # Vite Config & API Proxy
│   └── package.json
├── .env.example                # Template Environment Variable Root
├── .gitignore                  # Menutup file .env agar tidak masuk git
├── database.sql                # Schema Database 10 Tabel & Seed Data
├── ERD.md                      # Diagram ERD (Format Mermaid)
└── README.md                   # Dokumentasi Resmi Aplikasi
```
