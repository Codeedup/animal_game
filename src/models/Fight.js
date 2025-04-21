const mongoose = require('mongoose');

const FightSchema = new mongoose.Schema({
  fight_id: {
    type: String,
    required: true,
    unique: true
  },
  side_a_id: {
    type: String,
    required: true
  },
  side_b_id: {
    type: String,
    required: true
  },
  winner_id: {
    type: String,
    required: true
  },
  commentary_txt: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    enum: ['normal', 'hourly', 'daily', 'weekly'],
    required: true
  },
  scheduled_at: {
    type: Date,
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  votes_side_a: {
    type: Number,
    default: 0
  },
  votes_side_b: {
    type: Number,
    default: 0
  },
  resolved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Fight', FightSchema); 