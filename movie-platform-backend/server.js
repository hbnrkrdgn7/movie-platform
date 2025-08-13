require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');
const usersRouter = require('./routes/users');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Routers
app.use('/auth', authRouter);
app.use('/favorites', favoritesRouter);
app.use('/users', usersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('HATA DETAYI:', err);
  console.error('HATA STACK:', err.stack);
  console.error('HATA MESAJI:', err.message);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
