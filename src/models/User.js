const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  device_id: {
    type: String,
    required: true
  },
  oauth_provider: {
    type: String,
    enum: [null, 'apple', 'google', 'github'],
    default: null
  },
  oauth_id: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: null
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  notifications: {
    hourly_live: { type: Boolean, default: false },
    daily_live: { type: Boolean, default: false },
    weekly_live: { type: Boolean, default: false },
    level_up: { type: Boolean, default: true },
    store_sale: { type: Boolean, default: false }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  premium: {
    type: Boolean,
    default: false
  },
  cosmetics: {
    avatar_frame: { type: String, default: 'default' },
    victory_emote: { type: String, default: 'default' },
    color_theme: { type: String, default: 'default' }
  }
});

module.exports = mongoose.model('User', UserSchema); 