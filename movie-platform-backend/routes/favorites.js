// routers/favorites.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

// Tüm favorites endpoint'leri için kimlik doğrulama
router.use(auth);

// Favori ekle
router.post('/', async (req, res) => {
  const userId = req.user.id; // JWT'den
  const { movie_id, movie_title, movie_poster, movie_overview, movie_release_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO user_favorites (user_id, movie_id, movie_title, movie_poster, movie_overview, movie_release_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, movie_id) DO NOTHING
       RETURNING *`,
      [userId, movie_id, movie_title, movie_poster, movie_overview, movie_release_date]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Favori eklenirken hata oluştu.');
  }
});

// Kullanıcının favorilerini getir
router.get('/', async (req, res) => {
  const userId = req.user.id;
  console.log(`Favoriler getiriliyor - User ID: ${userId}`);

  try {
    const favorites = await pool.query(
      'SELECT * FROM user_favorites WHERE user_id = $1 ORDER BY added_at DESC',
      [userId]
    );
    console.log(`Bulunan favori sayısı: ${favorites.rows.length}`);
    console.log('Favoriler:', favorites.rows);
    res.json(favorites.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Favoriler getirilirken hata oluştu.');
  }
});

// Favori sil
router.delete('/:movieId', async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;
  try {
    await pool.query('DELETE FROM user_favorites WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Favori silinirken hata oluştu.');
  }
});

module.exports = router;



