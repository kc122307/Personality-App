const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Register User
router.post('/signup', async (req, res) => {
  console.log('✅ Signup API Hit:', req.body); // Debugging
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    user = await User.create({ username, email, password });

    // Generate JWT token
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, user: { id: user._id, username, email } });
  } catch (err) {
    console.error('🔥 Signup Error:', err.message);
    res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Match passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token, user: { id: user._id, username: user.username, email } });
  } catch (err) {
    console.error('🔥 Login Error:', err.message);
    res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

// Get Current User
router.get('/me', protect, async (req, res) => {
  try {
    // Fetch user by ID from JWT token
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('🔥 Get Current User Error:', err.message);
    res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

module.exports = router;
