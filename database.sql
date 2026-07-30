-- ========================================================
-- DATABASE SCHEMA: Mini Clinic Information System (Nexa Clinic)
-- Rencana & Relasi Database (Master & Transaksional)
-- ========================================================

CREATE DATABASE IF NOT EXISTS db_nexa_clinic;
USE db_nexa_clinic;

-- --------------------------------------------------------
-- KELOMPOK 1: TABEL MASTER
-- --------------------------------------------------------

-- 1. Tabel Users (Administrator, Dokter, Petugas Pendaftaran)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Administrator', 'Dokter', 'Petugas Pendaftaran') NOT NULL,
    permissions TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Master Pasien
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_number VARCHAR(20) NOT NULL UNIQUE,
    nik VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Laki-laki', 'Perempuan') NOT NULL,
    birth_date DATE NOT NULL,
    phone_number VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel Master Poli
CREATE TABLE IF NOT EXISTS polyclinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabel Master Obat
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Tabel Master Tindakan Medis
CREATE TABLE IF NOT EXISTS procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- KELOMPOK 2: TABEL TRANSAKSIONAL (PELAYANAN & REKAM MEDIS)
-- --------------------------------------------------------

-- 6. Tabel Pendaftaran Kunjungan Pasien
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    polyclinic_id INT NOT NULL,
    doctor_id INT NOT NULL,
    registration_date DATE NOT NULL,
    complaint TEXT,
    status ENUM('Waiting', 'In Examination', 'Completed', 'Cancelled') DEFAULT 'Waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (polyclinic_id) REFERENCES polyclinics(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Tabel Antrean (Queue)
CREATE TABLE IF NOT EXISTS queues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL UNIQUE,
    queue_number VARCHAR(10) NOT NULL,
    status ENUM('Waiting', 'Calling', 'Serving', 'Completed', 'Skipped') DEFAULT 'Waiting',
    called_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- 8. Tabel Rekam Medis Dokter (SOAP)
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    patient_id INT NOT NULL,
    subjective TEXT NOT NULL,
    blood_pressure VARCHAR(20),
    body_temperature DECIMAL(4,2),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 9. Tabel Patient Procedures (Input Tindakan Medis Pasien)
CREATE TABLE IF NOT EXISTS patient_procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    procedure_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (procedure_id) REFERENCES procedures(id) ON DELETE CASCADE
);

-- 10. Tabel Patient Prescriptions (Resep Obat Pasien)
CREATE TABLE IF NOT EXISTS patient_prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    instructions TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- SEED INITIAL DATA (AKUN DEFAULT & MASTER DATA INITIAL)
-- Password untuk semua akun bawaan: 'password123' (bcrypted)
-- --------------------------------------------------------

INSERT INTO users (name, username, password, role, permissions) VALUES
('Administrator Utama', 'admin', '$2b$10$JHo7bp0mlAxGB998IjKNWudYtmc5DYRVTWCLjQo2jeykmC5qAgyfK', 'Administrator', '{"patients":["view","create","edit","delete"],"polyclinics":["view","create","edit","delete"],"procedures":["view","create","edit","delete"],"medicines":["view","create","edit","delete"],"registrations":["view","create","edit","delete"],"queues":["view","call","edit"],"medical-records":["view","create","edit"]}'),
('Dr. Budi Santoso, Sp.PD', 'dokter', '$2b$10$JHo7bp0mlAxGB998IjKNWudYtmc5DYRVTWCLjQo2jeykmC5qAgyfK', 'Dokter', '{"patients":["view"],"polyclinics":[],"procedures":[],"medicines":[],"registrations":["view"],"queues":["view","call","edit"],"medical-records":["view","create","edit"]}'),
('Siti Rahma (Pendaftaran)', 'pendaftaran', '$2b$10$JHo7bp0mlAxGB998IjKNWudYtmc5DYRVTWCLjQo2jeykmC5qAgyfK', 'Petugas Pendaftaran', '{"patients":["view","create","edit","delete"],"polyclinics":[],"procedures":[],"medicines":[],"registrations":["view","create","edit","delete"],"queues":["view","call","edit"],"medical-records":[]}')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO polyclinics (name, description) VALUES
('Poli Umum', 'Pelayanan kesehatan umum dan pemeriksaan awal'),
('Poli Gigi', 'Pelayanan kesehatan gigi dan mulut'),
('Poli Anak', 'Pelayanan kesehatan khusus anak')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO medicines (code, name, unit) VALUES
('OBT-001', 'Paracetamol 500mg', 'Tablet'),
('OBT-002', 'Amoxicillin 500mg', 'Kaplet'),
('OBT-003', 'OBH Batuk & Flu', 'Botol'),
('OBT-004', 'Vitamin C 500mg', 'Tablet')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO procedures (code, name) VALUES
('TDK-001', 'Konsultasi & Pemeriksaan Umum'),
('TDK-002', 'Pembersihan Karang Gigi (Scaling)'),
('TDK-003', 'Injeksi / Suntik Vitamin'),
('TDK-004', 'Rawat Luka Ringan')
ON DUPLICATE KEY UPDATE id=id;
