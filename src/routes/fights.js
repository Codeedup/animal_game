const express = require('express');
const router = express.Router();
const Fight = require('../models/Fight');
const AnimalSquad = require('../models/AnimalSquad');

// GET /fights/next - Get next available fight based on tier
router.get('/next', async (req, res) => {
  try {
    const { tier = 'normal' } = req.query;
    const now = new Date();

    // Find an unresolved fight in the requested tier that hasn't expired
    const fight = await Fight.findOne({
      tier,
      expires_at: { $gt: now },
      resolved: false
    }).sort({ scheduled_at: 1 }).limit(1);

    if (!fight) {
      return res.status(404).json({ error: 'No available fights found' });
    }

    // Get animal squad details
    const sideA = await AnimalSquad.findOne({ squad_id: fight.side_a_id });
    const sideB = await AnimalSquad.findOne({ squad_id: fight.side_b_id });

    if (!sideA || !sideB) {
      return res.status(404).json({ error: 'Animal squad data not found' });
    }

    // Prepare response with both sides' data
    const response = {
      fight_id: fight.fight_id,
      tier: fight.tier,
      scheduled_at: fight.scheduled_at,
      expires_at: fight.expires_at,
      sides: {
        a: {
          id: sideA.squad_id,
          name: sideA.name,
          pack_size: sideA.pack_size,
          biome: sideA.biome,
          poster_image_url: sideA.poster_image_url
        },
        b: {
          id: sideB.squad_id,
          name: sideB.name,
          pack_size: sideB.pack_size,
          biome: sideB.biome,
          poster_image_url: sideB.poster_image_url
        }
      }
    };

    // Add community picks for hourly, daily, weekly tiers
    if (['hourly', 'daily', 'weekly'].includes(fight.tier)) {
      const totalVotes = fight.votes_side_a + fight.votes_side_b;
      if (totalVotes > 0) {
        response.community_picks = {
          side_a_percentage: Math.round((fight.votes_side_a / totalVotes) * 100),
          side_b_percentage: Math.round((fight.votes_side_b / totalVotes) * 100)
        };
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching next fight:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /fights/:id - Get specific fight details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const fight = await Fight.findOne({ fight_id: id });
    if (!fight) {
      return res.status(404).json({ error: 'Fight not found' });
    }

    // Get animal squad details
    const sideA = await AnimalSquad.findOne({ squad_id: fight.side_a_id });
    const sideB = await AnimalSquad.findOne({ squad_id: fight.side_b_id });

    if (!sideA || !sideB) {
      return res.status(404).json({ error: 'Animal squad data not found' });
    }

    // Prepare response with both sides' data and fight details
    const response = {
      fight_id: fight.fight_id,
      tier: fight.tier,
      scheduled_at: fight.scheduled_at,
      expires_at: fight.expires_at,
      sides: {
        a: {
          id: sideA.squad_id,
          name: sideA.name,
          pack_size: sideA.pack_size,
          biome: sideA.biome,
          poster_image_url: sideA.poster_image_url
        },
        b: {
          id: sideB.squad_id,
          name: sideB.name,
          pack_size: sideB.pack_size,
          biome: sideB.biome,
          poster_image_url: sideB.poster_image_url
        }
      },
      resolved: fight.resolved
    };

    // Add vote percentages and winner if fight is resolved
    if (fight.resolved) {
      const totalVotes = fight.votes_side_a + fight.votes_side_b;
      response.winner_id = fight.winner_id;
      response.commentary_txt = fight.commentary_txt;
      
      if (totalVotes > 0) {
        response.vote_results = {
          side_a_percentage: Math.round((fight.votes_side_a / totalVotes) * 100),
          side_b_percentage: Math.round((fight.votes_side_b / totalVotes) * 100),
          total_votes: totalVotes
        };
      }
    } else if (['hourly', 'daily', 'weekly'].includes(fight.tier)) {
      // Add community picks for non-resolved special tier fights
      const totalVotes = fight.votes_side_a + fight.votes_side_b;
      if (totalVotes > 0) {
        response.community_picks = {
          side_a_percentage: Math.round((fight.votes_side_a / totalVotes) * 100),
          side_b_percentage: Math.round((fight.votes_side_b / totalVotes) * 100)
        };
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching fight details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 