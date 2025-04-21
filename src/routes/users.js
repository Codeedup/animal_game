const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// POST /users/register - Register a new user (anonymous or OAuth)
router.post('/register', async (req, res) => {
  try {
    const { device_id, oauth_provider, oauth_id, username } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Check if user already exists with this device_id
    const existingUser = await User.findOne({ device_id });
    if (existingUser) {
      return res.json({
        user_id: existingUser.user_id,
        level: existingUser.level,
        xp: existingUser.xp,
        username: existingUser.username,
        premium: existingUser.premium,
        cosmetics: existingUser.cosmetics
      });
    }

    // Create new user
    const newUser = new User({
      user_id: uuidv4(),
      device_id,
      oauth_provider: oauth_provider || null,
      oauth_id: oauth_id || null,
      username: username || null
    });

    await newUser.save();

    res.status(201).json({
      user_id: newUser.user_id,
      level: newUser.level,
      xp: newUser.xp,
      username: newUser.username,
      premium: newUser.premium,
      cosmetics: newUser.cosmetics
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ user_id: id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user_id: user.user_id,
      level: user.level,
      xp: user.xp,
      username: user.username,
      cosmetics: user.cosmetics,
      premium: user.premium
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /users/:id/notifications - Update notification preferences
router.patch('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    const { notifications } = req.body;

    if (!notifications) {
      return res.status(400).json({ error: 'Notification settings required' });
    }

    const user = await User.findOne({ user_id: id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update only the specified notification settings
    const updatedNotifications = { ...user.notifications };
    
    if (notifications.hourly_live !== undefined) {
      updatedNotifications.hourly_live = notifications.hourly_live;
    }
    if (notifications.daily_live !== undefined) {
      updatedNotifications.daily_live = notifications.daily_live;
    }
    if (notifications.weekly_live !== undefined) {
      updatedNotifications.weekly_live = notifications.weekly_live;
    }
    if (notifications.level_up !== undefined) {
      updatedNotifications.level_up = notifications.level_up;
    }
    if (notifications.store_sale !== undefined) {
      updatedNotifications.store_sale = notifications.store_sale;
    }

    await User.updateOne(
      { user_id: id },
      { $set: { notifications: updatedNotifications } }
    );

    res.json({
      user_id: id,
      notifications: updatedNotifications
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /users/:id/cosmetics - Update user cosmetics
router.patch('/:id/cosmetics', async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar_frame, victory_emote, color_theme } = req.body;

    const user = await User.findOne({ user_id: id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update only the specified cosmetics
    const updatedCosmetics = { ...user.cosmetics };
    
    if (avatar_frame !== undefined) {
      updatedCosmetics.avatar_frame = avatar_frame;
    }
    if (victory_emote !== undefined) {
      updatedCosmetics.victory_emote = victory_emote;
    }
    if (color_theme !== undefined) {
      updatedCosmetics.color_theme = color_theme;
    }

    await User.updateOne(
      { user_id: id },
      { $set: { cosmetics: updatedCosmetics } }
    );

    res.json({
      user_id: id,
      cosmetics: updatedCosmetics
    });
  } catch (error) {
    console.error('Error updating cosmetics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /users/:id/oauth - Link OAuth account to device ID
router.post('/:id/oauth', async (req, res) => {
  try {
    const { id } = req.params;
    const { oauth_provider, oauth_id, username } = req.body;

    if (!oauth_provider || !oauth_id) {
      return res.status(400).json({ error: 'OAuth provider and ID are required' });
    }

    // Check if user exists
    const user = await User.findOne({ user_id: id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OAuth ID is already linked to another account
    const existingOAuth = await User.findOne({ oauth_id, oauth_provider });
    if (existingOAuth && existingOAuth.user_id !== id) {
      return res.status(400).json({ error: 'OAuth account already linked to another user' });
    }

    // Update user with OAuth info
    await User.updateOne(
      { user_id: id },
      { 
        $set: { 
          oauth_provider,
          oauth_id,
          username: username || user.username
        }
      }
    );

    res.json({
      user_id: id,
      oauth_provider,
      username: username || user.username
    });
  } catch (error) {
    console.error('Error linking OAuth account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 