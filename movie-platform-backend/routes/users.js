const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

// Public: Check username availability
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'username parametresi gerekli' });
  try {
    const result = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kontrol sırasında hata oluştu.');
  }
});

// All /users routes require auth
router.use(auth);

// Get current user info
router.get('/me', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, username, email FROM users WHERE id = $1',
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kullanıcı bilgisi alınamadı.');
  }
});

// Update current user's username
router.patch('/me', async (req, res) => {
  const userId = req.user.id;
  const { username } = req.body;
  if (!username || !username.trim()) return res.status(400).json({ message: 'Geçersiz kullanıcı adı' });
  try {
    // Check uniqueness
    const exists = await pool.query('SELECT id FROM users WHERE username = $1 AND id <> $2', [username, userId]);
    if (exists.rows.length > 0) return res.status(409).json({ message: 'Kullanıcı adı kullanımda' });

    const result = await pool.query('UPDATE users SET username = $1 WHERE id = $2 RETURNING id, first_name, last_name, username, email', [username.trim(), userId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kullanıcı adı güncellenemedi.');
  }
});

// Update current user's firebase_uid
router.patch('/:userId/firebase-uid', async (req, res) => {
  const { userId } = req.params;
  const { firebase_uid } = req.body;
  
  if (!firebase_uid) return res.status(400).json({ message: 'Firebase UID gerekli' });
  
  try {
    const result = await pool.query(
      'UPDATE users SET firebase_uid = $1 WHERE id = $2 RETURNING id, first_name, last_name, username, email, firebase_uid', 
      [firebase_uid, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Firebase UID güncellenemedi.');
  }
});

module.exports = router;




