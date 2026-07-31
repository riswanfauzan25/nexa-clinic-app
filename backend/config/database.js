const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

let dbPool;

// Jika berjalan di Vercel (Online), gunakan PostgreSQL Supabase
if (process.env.VERCEL) {
    console.log('Menggunakan database PostgreSQL (Supabase) untuk Vercel');
    dbPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    // Jika berjalan di Laptop (Lokal), tetap gunakan MySQL
    console.log('Menggunakan database MySQL Lokal');
    dbPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nexa_clinic',
    });
}

module.exports = dbPool;