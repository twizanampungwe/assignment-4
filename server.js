require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend from the same server (one deployment)
app.use(express.static(path.join(__dirname, 'frontend')));

const FIELDS = ['destination', 'country', 'category', 'best_season', 'avg_cost_usd', 'rating', 'description'];

function validate(body) {
  if (!body.destination || !body.destination.trim()) return 'destination is required';
  if (!body.country || !body.country.trim()) return 'country is required';
  if (body.rating != null && body.rating !== '' && (body.rating < 0 || body.rating > 5))
    return 'rating must be between 0 and 5';
  return null;
}
const values = (b) => FIELDS.map((f) => (b[f] === '' ? null : b[f] ?? null));

// GET all
app.get('/api/destinations', (req, res) => {
  res.json(db.prepare('SELECT * FROM destinations ORDER BY id DESC').all());
});

// GET one
app.get('/api/destinations/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM destinations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Destination not found' });
  res.json(row);
});

// POST create
app.post('/api/destinations', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const info = db
    .prepare(`INSERT INTO destinations (${FIELDS.join(',')}) VALUES (${FIELDS.map(() => '?').join(',')})`)
    .run(...values(req.body));
  res.status(201).json(db.prepare('SELECT * FROM destinations WHERE id = ?').get(info.lastInsertRowid));
});

// PUT update
app.put('/api/destinations/:id', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const info = db
    .prepare(`UPDATE destinations SET ${FIELDS.map((f) => f + ' = ?').join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(...values(req.body), req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Destination not found' });
  res.json(db.prepare('SELECT * FROM destinations WHERE id = ?').get(req.params.id));
});

// DELETE
app.delete('/api/destinations/:id', (req, res) => {
  const info = db.prepare('DELETE FROM destinations WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Destination not found' });
  res.json({ message: 'Destination deleted', id: Number(req.params.id) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
