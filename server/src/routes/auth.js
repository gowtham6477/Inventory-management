const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();



router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    
    const newUser = new User({
      name,
      email,
      passwordHash: password,
      role: role || 'customer'
    });
    await newUser.save();

    
    const payload = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    };

    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    
    res.status(201).json({
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error during signup' });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    
    res.json({
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;