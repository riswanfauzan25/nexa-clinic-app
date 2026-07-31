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
- **Modul Master Data (Pasien, Poli, Tindakan, Obat)**: Sub-komponen modular (`Table`, `FormModal`, `DetailModal`, `DeleteModal`), server-side pagination, dan kalkulasi otomatis.
- **Modul Kelola Pengguna (User Management)**: Modal form dengan Checklist Matriks RBAC Granular (View, Create, Edit, Delete per modul).
- **Modul Pendaftaran Pasien (`registrations`)**: Form pendaftaran ke Poli & Dokter Jaga, jenis pembayaran, auto-generate no kunjungan, validasi cegah pendaftaran ganda aktif, Modal Detail Pendaftaran, cetak tiket antrean, & Export PDF.
- **Modul Kelola & Panggil Antrean (`queues`)**: Kontrol status antrean real-time (`Menunggu` ➔ `Dipanggil` ➔ `Melayani` ➔ `Selesai` / `Lewat`), audio panggil suara mengeja lengkap (`A 0 0 1`), tombol panggil lagi antrean dilewati, & Modal Lewati Kustom.
- **Display TV Monitor Ruang Tunggu (`/queue-display`)**: Tampilan Layar TV Monitor antrean publik real-time bertema terang (*Light Mode*) yang simpel dan jelas.
