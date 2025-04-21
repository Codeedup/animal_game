const User = require('../models/User');

/**
 * Authentication middleware for who_will_win? API
 * 
 * Handles two types of authentication:
 * 1. Device ID (anonymous) - basic authentication
 * 2. OAuth (logged in) - for social features
 */

// Verify user exists based on device ID
const authenticateDevice = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    
    if (!deviceId) {
      return res.status(401).json({ error: 'Device ID is required' });
    }
    
    // Find user by device ID
    const user = await User.findOne({ device_id: deviceId });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid device ID' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Verify user is authenticated via OAuth
const authenticateOAuth = async (req, res, next) => {
  try {
    // First check device ID
    const deviceId = req.headers['x-device-id'];
    
    if (!deviceId) {
      return res.status(401).json({ error: 'Device ID is required' });
    }
    
    // Find user by device ID
    const user = await User.findOne({ device_id: deviceId });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid device ID' });
    }
    
    // Check if user has OAuth credentials
    if (!user.oauth_id || !user.oauth_provider) {
      return res.status(403).json({ error: 'OAuth authentication required for this resource' });
    }
    
    // User is authenticated via OAuth
    req.user = user;
    next();
  } catch (error) {
    console.error('OAuth authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  authenticateDevice,
  authenticateOAuth
}; 