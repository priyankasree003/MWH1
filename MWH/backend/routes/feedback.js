const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { token, text, sentiment, score } = req.body;
  // token optional; if provided, decode to get user id (left as future improvement)
  const stmt = db.prepare('INSERT INTO feedback (user_id, text, sentiment, score) VALUES (?, ?, ?, ?)');
  const info = stmt.run(null, text, sentiment || null, score || null);
  res.json({ id: info.lastInsertRowid });
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});

module.exports = router;
