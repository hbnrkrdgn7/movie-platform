// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'movie_app_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Tablo yapısını kontrol et ve gerekirse güncelle
pool.on('connect', async () => {
  try {
    // users tablosuna firebase_uid kolonu ekle (eğer yoksa)
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE
    `);
    
    // user_favorites tablosunu oluştur (eğer yoksa)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER NOT NULL,
        movie_title VARCHAR(255) NOT NULL,
        movie_poster TEXT,
        movie_overview TEXT,
        movie_release_date VARCHAR(50),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id)
      )
    `);
    
    console.log('Veritabanı tabloları hazır');
  } catch (error) {
    console.error('Tablo yapısı kontrol edilirken hata:', error);
  }
});

module.exports = pool;
