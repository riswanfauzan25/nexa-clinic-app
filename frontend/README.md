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
- **Role-Based Dashboard**: Tampilan khusus untuk Dokter, Petugas Pendaftaran, & Administrator.
- **Modul Master Data Pasien**: Tabel responsive, pencarian real-time, server-side pagination, Modal Detail Pasien (kalkulasi umur otomatis), & Modal Form CRUD.
- **Modul Kelola Pengguna (User Management)**: Modal form dengan Checklist Matriks RBAC Granular (View, Create, Edit, Delete per modul).
