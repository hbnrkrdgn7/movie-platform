// routers/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Firebase UID ile giriş yap (Google için)
router.post("/firebase-login", async (req, res) => {
  const { firebase_uid, email, display_name } = req.body;

  try {
    // Önce bu Firebase UID ile kullanıcı var mı kontrol et
    let user = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [firebase_uid]
    );

    if (user.rows.length === 0) {
      // Kullanıcı yoksa yeni kullanıcı oluştur
      let firstName = "";
      let lastName = "";
      
      if (display_name && display_name.trim()) {
        const nameParts = display_name.trim().split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      } else if (email) {
        // Email'den kullanıcı adı oluştur
        const emailName = email.split("@")[0];
        if (emailName.includes(".")) {
          const emailParts = emailName.split(".");
          firstName = emailParts[0] || "";
          lastName = emailParts.slice(1).join(" ") || "";
        } else {
          firstName = emailName;
          lastName = "";
        }
      }
      
      const username = email ? email.split("@")[0] : `user_${Date.now()}`;

      console.log("Yeni kullanıcı oluşturuluyor:", { firstName, lastName, email, firebase_uid });

      const newUser = await pool.query(
        "INSERT INTO users (first_name, last_name, username, email, firebase_uid) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [firstName, lastName, username, email, firebase_uid]
      );
      user = newUser;
    } else {
      // Kullanıcı var ama isim bilgileri eksikse güncelle
      if (!user.rows[0].first_name || !user.rows[0].last_name) {
        let firstName = user.rows[0].first_name || "";
        let lastName = user.rows[0].last_name || "";
        
        if (display_name && (!firstName || !lastName)) {
          const nameParts = display_name.trim().split(" ");
          firstName = nameParts[0] || firstName;
          lastName = nameParts.slice(1).join(" ") || lastName;
          
          console.log("Kullanıcı isim bilgileri güncelleniyor:", { firstName, lastName });
          
          // Veritabanında güncelle
          await pool.query(
            "UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3",
            [firstName, lastName, user.rows[0].id]
          );
          
          // Güncellenmiş kullanıcı bilgilerini al
          user = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [user.rows[0].id]
          );
        }
      }
    }

    console.log("Kullanıcı bilgileri:", user.rows[0]);

    // JWT token oluştur
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ 
      token, 
      user: {
        id: user.rows[0].id,
        first_name: user.rows[0].first_name || "",
        last_name: user.rows[0].last_name || "",
        username: user.rows[0].username,
        email: user.rows[0].email,
        firebase_uid: user.rows[0].firebase_uid
      }
    });
  } catch (error) {
    console.error('Firebase login hatası:', error);
    res.status(500).send("Firebase giriş sırasında hata oluştu.");
  }
});

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
      // hangi alan çakıştı?
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

    // Password kontrolü ekle
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

    // Token oluştur
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
