const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware: Token kontrolü
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token eksik" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token geçersiz" });
  }
};

// Yorum ekle
router.post("/", authenticate, async (req, res) => {
  const { content } = req.body;
  try {
    const newComment = await pool.query(
      "INSERT INTO comments (user_id, content) VALUES ($1, $2) RETURNING *",
      [req.userId, content]
    );
    res.json(newComment.rows[0]);
  } catch (err) {
    console.error("Yorum ekleme hatası:", err);
    res.status(500).send("Yorum eklenemedi");
  }
});

// Yorumları getir
router.get("/", async (req, res) => {
  try {
    const comments = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       ORDER BY c.created_at DESC`
    );
    res.json(comments.rows);
  } catch (err) {
    console.error("Yorumları getirme hatası:", err);
    res.status(500).send("Yorumlar getirilemedi");
  }
});

module.exports = router;
