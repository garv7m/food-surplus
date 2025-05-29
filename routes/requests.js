const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { db } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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

// Email setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create request
router.post('/', auth, (req, res) => {
  const { donation_id } = req.body;
  
  db.run(
    'INSERT INTO requests (donation_id, receiver_id) VALUES (?, ?)',
    [donation_id, req.user.userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, message: 'Request sent' });
    }
  );
});

// Get requests received by donor
router.get('/received', auth, (req, res) => {
  db.all(`
    SELECT r.*, d.food_type, d.quantity, u.name as receiver_name, u.email as receiver_email, u.phone as receiver_phone
    FROM requests r 
    JOIN donations d ON r.donation_id = d.id 
    JOIN users u ON r.receiver_id = u.id 
    WHERE d.donor_id = ? ORDER BY r.created_at DESC
  `, [req.user.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get requests sent by receiver
router.get('/sent', auth, (req, res) => {
  db.all(`
    SELECT r.*, d.food_type, d.quantity, d.address, u.name as donor_name, u.phone as donor_phone
    FROM requests r 
    JOIN donations d ON r.donation_id = d.id 
    JOIN users u ON d.donor_id = u.id 
    WHERE r.receiver_id = ? ORDER BY r.created_at DESC
  `, [req.user.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Accept/reject request
router.put('/:id/accept', auth, (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const otp = status === 'accepted' ? generateOTP() : null;
  
  db.run(
    'UPDATE requests SET status = ?, otp = ? WHERE id = ?',
    [status, otp, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      if (status === 'accepted') {
        // Get request details for email
        db.get(`
          SELECT r.*, d.food_type, d.quantity, d.address, 
                 u1.name as receiver_name, u1.email as receiver_email,
                 u2.name as donor_name, u2.email as donor_email
          FROM requests r 
          JOIN donations d ON r.donation_id = d.id 
          JOIN users u1 ON r.receiver_id = u1.id 
          JOIN users u2 ON d.donor_id = u2.id 
          WHERE r.id = ?
        `, [req.params.id], (err, request) => {
          if (!err && request) {
            // Send emails
            const emailContent = `
              Pickup Confirmation
              
              Food: ${request.food_type}
              Quantity: ${request.quantity}
              Pickup Address: ${request.address}
              
              Verification OTP: ${otp}
              
              Please use this OTP during pickup.
            `;
            
            // Email to receiver
            transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: request.receiver_email,
              subject: 'Food Pickup Confirmed',
              text: emailContent
            });
            
            // Email to donor
            transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: request.donor_email,
              subject: 'Food Pickup Confirmed',
              text: emailContent
            });
          }
        });
        
        // Update donation status to reserved
        db.run('UPDATE donations SET status = "reserved" WHERE id = ?', [req.body.donation_id]);
      }
      
      res.json({ message: 'Request updated' });
    }
  );
});

module.exports = router;