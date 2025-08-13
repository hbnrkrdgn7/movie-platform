// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register (Kayıt)
router.post("/register", async (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;

  console.log("Kayıt isteği:", { first_name, last_name, username, email, password: password ? "***" : "BOŞ" });

  try {
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Şifre hash'lendi, veritabanına kaydediliyor...");

    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, username, email, password) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [first_name, last_name, username, email, hashedPassword]
    );

    const user = newUser.rows[0];
    console.log("Yeni kullanıcı oluşturuldu:", { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email });

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email
      },
    });
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      const detail = error.detail || '';
      if (detail.includes('(email)')) {
        return res.status(409).json({ message: 'Email kullanımda' });
      }
      if (detail.includes('(username)')) {
        return res.status(409).json({ message: 'Kullanıcı adı kullanımda' });
      }
      return res.status(409).json({ message: 'Benzersiz alan ihlali' });
    }
    console.error('Kayıt hatası:', error);
    console.error('Hata detayı:', error.message);
    res.status(500).send("Kayıt sırasında hata oluştu.");
  }
});

// Login (Giriş) - Email/şifre ile
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login isteği:", { email, password: password ? "***" : "BOŞ" });

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    console.log("Veritabanından kullanıcı:", user.rows[0] ? "BULUNDU" : "BULUNAMADI");

    if (user.rows.length === 0) {
      console.log("Email bulunamadı:", email);
      return res.status(400).json({ message: "Email bulunamadı." });
    }

    if (!password) {
      console.log("Şifre eksik");
      return res.status(400).json({ message: "Şifre gerekli." });
    }

    if (!user.rows[0].password) {
      console.log("Kullanıcıda şifre yok");
      return res.status(400).json({ message: "Bu kullanıcı için şifre tanımlanmamış." });
    }

    console.log("Şifre karşılaştırılıyor...");
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      console.log("Şifre yanlış");
      return res.status(400).json({ message: "Şifre yanlış." });
    }

    console.log("Giriş başarılı, token oluşturuluyor...");

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ 
      token, 
      user: {
        id: user.rows[0].id,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
        username: user.rows[0].username,
        email: user.rows[0].email
      }
    });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).send("Giriş sırasında hata oluştu.");
  }
});

module.exports = router;
