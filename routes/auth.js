const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// File upload setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, type, address, city, state } = req.body;
  if (!name || !email || !password || !phone || !type || !address || !city || !state) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (user) return res.status(400).json({ error: 'User already exists' });

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password_hash, phone, type, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, type, address, city, state],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, message: 'Registration successful' });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const bcrypt = require('bcrypt');
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, type: user.type, address: user.address, city: user.city, state: user.state } });
  });
});

// Create donation
router.post('/', auth, upload.single('photo'), (req, res) => {
  const { food_type, quantity, shelf_life, address, city, state } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  db.run(
    `INSERT INTO donations (donor_id, food_type, quantity, shelf_life, photo_url, address, city, state) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.userId, food_type, quantity, shelf_life, photo_url, address, city, state],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, message: 'Donation created' });
    }
  );
});

// Get all available donations (for receivers)
router.get('/', (req, res) => {
  const { city, state } = req.query;
  let query = `
    SELECT d.*, u.name as donor_name, u.phone as donor_phone 
    FROM donations d 
    JOIN users u ON d.donor_id = u.id 
    WHERE d.status = 'available'
  `;
  const params = [];
  
  if (city) {
    query += ' AND d.city = ?';
    params.push(city);
  }
  if (state) {
    query += ' AND d.state = ?';
    params.push(state);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get donor's donations
router.get('/my', auth, (req, res) => {
  db.all(
    'SELECT * FROM donations WHERE donor_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// Update donation status
router.put('/:id/status', auth, (req, res) => {
  const { status } = req.body;
  
  db.run(
    'UPDATE donations SET status = ? WHERE id = ? AND donor_id = ?',
    [status, req.params.id, req.user.userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Status updated' });
    }
  );
});

module.exports = router;