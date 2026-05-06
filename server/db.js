const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'marketplace.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
    initializeSchema();
  }
});

function initializeSchema() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      trust_score INTEGER DEFAULT 100,
      hostel TEXT
    )`);

    // Items Table
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER,
      title TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      location TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(seller_id) REFERENCES users(id)
    )`);

    // Messages Table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      item_id INTEGER,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(receiver_id) REFERENCES users(id),
      FOREIGN KEY(item_id) REFERENCES items(id)
    )`);

    // Ratings Table
    db.run(`CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rater_id INTEGER,
      rated_id INTEGER,
      score INTEGER,
      comment TEXT,
      FOREIGN KEY(rater_id) REFERENCES users(id),
      FOREIGN KEY(rated_id) REFERENCES users(id)
    )`);

    // Wishlist Table
    db.run(`CREATE TABLE IF NOT EXISTS wishlist (
      user_id INTEGER,
      item_id INTEGER,
      PRIMARY KEY(user_id, item_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(item_id) REFERENCES items(id)
    )`);
  });
}

module.exports = db;
