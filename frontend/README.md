# Nexa Clinic Frontend - React.js (Vite) 🎨

Modul Antarmuka Pengguna (Frontend Web Application) untuk **Nexa Clinic System** yang dibangun menggunakan React.js, Tailwind CSS, dan Lucide React.

---

## 🛠️ Teknologi Frontend

- **Framework**: React.js 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (dengan Interceptor JWT Token)
- **Icons**: Lucide React

---

## 🚀 Cara Menjalankan

1. Masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembang (Dev Server):
   ```bash
   npm run dev
   ```
4. Buka browser di URL: `http://localhost:3000`

---

## 🔑 Fitur Utama UI Frontend

- **Authentication System**: Halaman Login modern dengan fitur Eye Toggle Show/Hide Password & Auto-Dismiss Error Alert.
- **Top Header Navbar**: Full-width branding, Dropdown Profile Card, & Modal Konfirmasi Logout.
- **Dynamic Sidebar Menu**: Filter navigasi otomatis berbasis `hasPermission` dan `user.role`.

---

## 📊 Dashboard (Role-Aware Statistics)

- **Role-Based Dashboard**: Kartu statistik (Pasien Hari Ini, Total Antrean, Menunggu, Selesai) otomatis **terisolasi per Dokter** — dokter hanya melihat statistik kunjungan miliknya sendiri. Admin & Petugas Pendaftaran tetap melihat statistik keseluruhan klinik.

---

## 🔒 Isolasi Data Per Role (Doctor-Level Security)

- **Data Pasien Terisolasi**: Saat login sebagai Dokter, daftar Master Data Pasien hanya menampilkan pasien yang **pernah terdaftar ke dokter tersebut** (`doctor_id` matching).
- **Pendaftaran & Antrean Terisolasi**: Dokter hanya dapat melihat data pendaftaran dan antrean milik dokternya sendiri (proteksi berlapis di Backend & Frontend).
- **Filter Poliklinik Tersembunyi untuk Dokter**: Dropdown filter poliklinik pada tabel Pendaftaran & Antrean otomatis disembunyikan bagi role Dokter.

---

## 🔑 RBAC Granular pada Seluruh Modul

- **Tombol Dinamis Berbasis Checklist**: Tombol Tambah, Edit, dan Hapus pada modul **Master Data (Obat, Tindakan Medis, Poliklinik)** kini sepenuhnya dinamis — mengikuti checklist izin (`hasPermission`) yang diatur Admin, bukan lagi terkunci khusus Administrator.
- **Tombol Tiket Antrean**: Tombol cetak **"Tiket"** pada tabel Pendaftaran Pasien **hanya muncul untuk Petugas Pendaftaran & Administrator** — disembunyikan untuk Dokter.
- **Modul Kelola Pengguna (User Management)**: Modal form dengan Checklist Matriks RBAC Granular (View, Create, Edit, Delete per modul).

---

## 📋 Modul Transaksional Pelayanan Klinik

- **Modul Pendaftaran Pasien (`registrations`)**: Form pendaftaran ke Poli & Dokter Jaga, jenis pembayaran, auto-generate no kunjungan, validasi cegah pendaftaran ganda aktif, Modal Detail Pendaftaran, cetak tiket antrean, & Export PDF.
- **Modul Kelola & Panggil Antrean (`queues`)**: Kontrol status antrean real-time (`Menunggu` ➔ `Dipanggil` ➔ `Melayani` ➔ `Selesai` / `Lewat`), audio panggil suara mengeja lengkap (`A 0 0 1`), tombol panggil lagi antrean dilewati, Modal Lewati Kustom, & Array safety guard (tidak pernah blank screen).
- **Modul Pemeriksaan Dokter (`medical-records`)**: Input rekam medis SOAP (Subjective, Objective/Vital Signs, Assessment/Diagnosa, Plan/Terapi), Input Tindakan Medis (filter poli + ketik manual auto-save), Input Resep Obat (seluruh katalog), & Modal Riwayat Pemeriksaan Pasien.
- **Display TV Monitor Ruang Tunggu (`/queue-display`)**: Tampilan Layar TV Monitor antrean publik real-time bertema terang (*Light Mode*) yang simpel dan jelas.

---

## 📁 Struktur Komponen Frontend

```text
src/
├── api/
│   └── axios.js                # Axios Client & Interceptor JWT
├── components/
│   ├── Navbar.jsx              # Top Header & Profile Dropdown
│   └── Sidebar.jsx             # Accordion Submenu Navigation (RBAC-filtered)
├── context/
│   └── AuthContext.jsx         # Global Auth State & hasPermission Helper
├── pages/
│   ├── auth/                   # LoginPage
│   ├── dashboard/              # DashboardPage (Role-Aware Stats)
│   ├── patients/               # PatientsPage + (PatientTable, FormModal, DetailModal, DeleteModal)
│   ├── polyclinics/            # PolyclinicsPage + (PolyclinicTable, FormModal, DeleteModal)
│   ├── procedures/             # ProceduresPage + (ProcedureTable, FormModal, DeleteModal)
│   ├── medicines/              # MedicinesPage + (MedicineTable, FormModal, DeleteModal)
│   ├── registrations/          # RegistrationsPage + (RegistrationTable, FormModal, DetailModal, TicketModal, DeleteModal)
│   ├── queues/                 # QueuesPage, QueueDisplayPage + (QueueTable, QueueSkipModal)
│   ├── medical-records/        # MedicalRecordsPage + (MedicalRecordFormModal, MedicalRecordDetailModal, PatientHistoryModal)
│   └── users/                  # UserManagementPage + (UserTable, UserFormModal, UserDeleteModal)
└── App.jsx                     # Entrypoint & React Router
```

