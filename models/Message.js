const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  imagePath: { type: String }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
