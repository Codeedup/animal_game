const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Fight = require('../models/Fight');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { trackVoteCast, trackLevelUp } = require('../utils/analytics');

// Helper function to calculate XP needed for a given level
const xpNeededForLevel = (level) => {
  return Math.floor(100 * Math.pow(level, 1.4));
};

// Helper function to calculate level based on XP
const calculateLevelFromXP = (xp) => {
  let level = 1;
  while (xpNeededForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
};

// POST /vote - Record a vote for a fight
router.post('/', async (req, res) => {
  try {
    const { fight_id, side_id, user_id } = req.body;

    if (!fight_id || !side_id || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the fight
    const fight = await Fight.findOne({ fight_id });
    if (!fight) {
      return res.status(404).json({ error: 'Fight not found' });
    }

    // Check if fight is still active
    const now = new Date();
    if (now > fight.expires_at || fight.resolved) {
      return res.status(400).json({ error: 'Fight is no longer active' });
    }

    // Validate side_id
    if (side_id !== fight.side_a_id && side_id !== fight.side_b_id) {
      return res.status(400).json({ error: 'Invalid side_id' });
    }

    // Find the user
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already voted on this fight
    const existingVote = await Vote.findOne({ user_id, fight_id });
    if (existingVote) {
      return res.status(400).json({ error: 'User already voted on this fight' });
    }

    // Update vote counts on the fight
    if (side_id === fight.side_a_id) {
      await Fight.updateOne({ fight_id }, { $inc: { votes_side_a: 1 } });
    } else {
      await Fight.updateOne({ fight_id }, { $inc: { votes_side_b: 1 } });
    }

    // Calculate XP award
    let xpAward = 5; // Default for incorrect vote
    let underdogBonus = false;

    // Check for underdog bonus - if chosen side has ≤35% of votes
    const updatedFight = await Fight.findOne({ fight_id });
    const totalVotes = updatedFight.votes_side_a + updatedFight.votes_side_b;
    
    if (totalVotes > 1) { // Need at least 2 votes for percentage to make sense
      let chosenSidePercentage;
      
      if (side_id === fight.side_a_id) {
        chosenSidePercentage = (updatedFight.votes_side_a / totalVotes) * 100;
      } else {
        chosenSidePercentage = (updatedFight.votes_side_b / totalVotes) * 100;
      }
      
      if (chosenSidePercentage <= 35) {
        underdogBonus = true;
      }
    }
    
    // If the vote is for the eventual winner, award 25 XP instead of 5
    if (side_id === fight.winner_id) {
      xpAward = 25;
    }
    
    // Apply 50% bonus for underdogs
    if (underdogBonus) {
      xpAward = Math.floor(xpAward * 1.5);
    }

    // Create the vote record
    const newVote = new Vote({
      vote_id: uuidv4(),
      user_id,
      fight_id,
      selected_side_id: side_id,
      xp_awarded: xpAward,
      underdog_bonus: underdogBonus,
      created_at: now
    });
    
    await newVote.save();
    
    // Update user's XP and check for level up
    const previousLevel = user.level;
    const newXP = user.xp + xpAward;
    const newLevel = calculateLevelFromXP(newXP);
    const leveledUp = newLevel > previousLevel;
    
    await User.updateOne(
      { user_id }, 
      { 
        $set: { 
          xp: newXP,
          level: newLevel
        }
      }
    );
    
    // Track analytics
    trackVoteCast(user_id, fight_id, side_id);
    
    if (leveledUp) {
      trackLevelUp(user_id, newLevel, newXP);
    }
    
    // Prepare response
    const response = {
      success: true,
      xp_awarded: xpAward,
      underdog_bonus: underdogBonus,
      new_xp_total: newXP,
      level: newLevel,
      leveled_up: leveledUp
    };
    
    // If leveled up, include progress info
    if (leveledUp) {
      response.xp_for_next_level = xpNeededForLevel(newLevel + 1);
      response.xp_progress = newXP - xpNeededForLevel(newLevel);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 