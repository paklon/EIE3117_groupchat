const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'profiles');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'profile_' + Date.now() + ext);
  },
});
const upload = multer({ storage });

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { loginId, nickname, email, password, passwordConfirm } = req.body;
    if (!loginId || !nickname || !email || !password) {
      return res.render('register', { error: 'All fields are required' });
    }
    if (password !== passwordConfirm) {
      return res.render('register', { error: 'Passwords do not match' });
    }

    const existing = await User.findOne({ $or: [{ loginId }, { email }] });
    if (existing) {
      return res.render('register', { error: 'Login ID or email already used' });
    }

    const passwordHash = await User.hashPassword(password);
    const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const user = new User({
      loginId,
      nickname,
      email,
      passwordHash,
      profileImage,
    });
    await user.save();
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('register', { error: 'Server error' });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { loginId, password, rememberMe } = req.body;
    const user = await User.findOne({ loginId });
    if (!user) {
      return res.render('login', { error: 'Invalid login id or password' });
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.render('login', { error: 'Invalid login id or password' });
    }

    req.session.user = {
      id: user._id.toString(),
      loginId: user.loginId,
      nickname: user.nickname,
    };

    if (rememberMe) {
      const twoWeeks = 14 * 24 * 60 * 60 * 1000;
      req.session.cookie.maxAge = twoWeeks;
    } else {
      req.session.cookie.expires = false; 
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
