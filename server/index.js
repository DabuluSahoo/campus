const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  db.run(`INSERT INTO users (email, password, name) VALUES (?, ?, ?)`, [email, password, name], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ id: this.lastID, email, name });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  });
});

// --- Item Routes ---
app.get('/api/items', (req, res) => {
  db.all(`SELECT items.*, users.name as seller_name FROM items JOIN users ON items.seller_id = users.id WHERE status = 'active'`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/items', (req, res) => {
  const { seller_id, title, description, price, category, location, image_url } = req.body;
  db.run(`INSERT INTO items (seller_id, title, description, price, category, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [seller_id, title, description, price, category, location, image_url],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// --- AI Simulation Route ---
app.post('/api/ai/estimate', (req, res) => {
  // Mock AI Logic
  setTimeout(() => {
    res.json({
      suggestion_min: 25,
      suggestion_max: 40,
      confidence: 0.89,
      type: 'Textbook'
    });
  }, 1000);
});

// --- Chat Routes ---
app.get('/api/messages/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.all(`SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY timestamp ASC`, [user_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/messages', (req, res) => {
  const { sender_id, receiver_id, item_id, content } = req.body;
  db.run(`INSERT INTO messages (sender_id, receiver_id, item_id, content) VALUES (?, ?, ?, ?)`,
    [sender_id, receiver_id, item_id, content],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
