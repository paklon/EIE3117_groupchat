// routes/groups.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ensureAuth } = require('../middleware/auth');
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Multer for message image uploads
const msgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'messages');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'msg_' + Date.now() + ext);
  },
});
const uploadMsg = multer({ storage: msgStorage });

// Dashboard: list joined groups
router.get('/dashboard', ensureAuth, async (req, res) => {
  const userId = req.session.user.id;
  const myGroups = await Group.find({ members: userId }).sort({ createdAt: -1 });
  res.render('dashboard', { myGroups });
});

// List all groups
router.get('/groups', ensureAuth, async (req, res) => {
  const groups = await Group.find().sort({ createdAt: -1 });
  res.render('groups', { groups });
});

// List my groups
router.get('/groups/mine', ensureAuth, async (req, res) => {
  const userId = req.session.user.id;
  const groups = await Group.find({ members: userId }).sort({ createdAt: -1 });
  res.render('mygroups', { groups });
});

// Create group
router.get('/groups/create', ensureAuth, (req, res) => {
  res.render('group_create', { error: null });
});

router.post('/groups/create', ensureAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.render('group_create', { error: 'Title is required' });
    }
    const userId = req.session.user.id;
    const group = new Group({
      title,
      description,
      owner: userId,
      members: [userId],
    });
    await group.save();
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    console.error(err);
    res.render('group_create', { error: 'Server error' });
  }
});

// Join group
router.get('/groups/:id/join', ensureAuth, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.user.id;
  const group = await Group.findById(groupId);
  if (!group) return res.redirect('/groups');

  if (!group.members.some((m) => m.toString() === userId)) {
    group.members.push(userId);
    await group.save();
  }
  res.redirect(`/groups/${groupId}`);
});

// Leave group
router.get('/groups/:id/leave', ensureAuth, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.user.id;
  const group = await Group.findById(groupId);
  if (!group) return res.redirect('/groups');

  group.members = group.members.filter((m) => m.toString() !== userId);
  await group.save();
  res.redirect('/dashboard');
});

// Group detail (view and send messages)
router.get('/groups/:id', ensureAuth, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.user.id;

  const group = await Group.findById(groupId).populate('members');
  if (!group) return res.redirect('/groups');

  const isMember = group.members.some((m) => m._id.toString() === userId);
  if (!isMember) {
    return res.redirect('/groups');
  }

  const messages = await Message.find({ group: groupId })
    .populate('sender')
    .sort({ createdAt: 1 });

  res.render('group_detail', {
    group,
    members: group.members,
    messages,
    error: null,
  });
});

router.post('/groups/:id/message', ensureAuth, uploadMsg.single('image'), async (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.user.id;
  const { text } = req.body;

  const group = await Group.findById(groupId).populate('members');
  if (!group) return res.redirect('/groups');

  const isMember = group.members.some((m) => m._id.toString() === userId);
  if (!isMember) return res.redirect('/groups');

  const imagePath = req.file ? `/uploads/messages/${req.file.filename}` : null;
  if (!text && !imagePath) {
    const messages = await Message.find({ group: groupId })
      .populate('sender')
      .sort({ createdAt: 1 });
    return res.render('group_detail', {
      group,
      members: group.members,
      messages,
      error: 'Message cannot be empty',
    });
  }

  const msg = new Message({
    group: groupId,
    sender: userId,
    text: text || '',
    imagePath,
  });
  await msg.save();

  res.redirect(`/groups/${groupId}`);
});

// Manual refresh: return JSON list of messages
router.get('/groups/:id/refresh', ensureAuth, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.user.id;

  const group = await Group.findById(groupId).populate('members');
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const isMember = group.members.some((m) => m._id.toString() === userId);
  if (!isMember) return res.status(403).json({ error: 'Not a member' });

  const messages = await Message.find({ group: groupId })
    .populate('sender')
    .sort({ createdAt: 1 });

  const data = messages.map((m) => ({
    sender: m.sender.nickname || m.sender.loginId,
    text: m.text,
    imagePath: m.imagePath || '',
    createdAt: m.createdAt,
  }));
  res.json({ messages: data });
});

module.exports = router;
