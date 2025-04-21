const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  vote_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  fight_id: {
    type: String,
    required: true
  },
  selected_side_id: {
    type: String,
    required: true
  },
  xp_awarded: {
    type: Number,
    required: true
  },
  underdog_bonus: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Composite index to prevent duplicate votes
VoteSchema.index({ user_id: 1, fight_id: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema); 