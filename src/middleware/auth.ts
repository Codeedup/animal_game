import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authenticate a device ID
 * Used for all basic user authentication
 */
export async function authenticateDevice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for device ID in headers
    const deviceId = req.headers['x-device-id'] as string;
    
    if (!deviceId) {
      res.status(401).json({ error: 'Device ID is required' });
      return;
    }
    
    // Find user by device ID
    const user = await prisma.user.findUnique({
      where: { deviceId }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid device ID' });
      return;
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Authenticate a user with OAuth credentials
 * Used for social features and more advanced capabilities
 */
export async function authenticateOAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }
    
    // Extract JWT token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'JWT token required' });
      return;
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) {
        res.status(401).json({ error: 'Invalid token: User not found' });
        return;
      }
      
      // Check OAuth provider
      if (!user.authProvider || user.authProvider === 'anon') {
        res.status(403).json({ error: 'OAuth authentication required' });
        return;
      }
      
      // Attach user to request
      req.user = user;
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('OAuth authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Authenticate as an admin
 * For administrative tasks like uploading fights
 */
export async function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }
    
    // Extract JWT token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'JWT token required' });
      return;
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { isAdmin: boolean };
      
      // Check if admin
      if (!decoded.isAdmin) {
        res.status(403).json({ error: 'Admin privileges required' });
        return;
      }
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
} 