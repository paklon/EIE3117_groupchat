// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true }, // username
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: { type: String }, // path
  passwordHash: { type: String, required: true },
});

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', UserSchema);
