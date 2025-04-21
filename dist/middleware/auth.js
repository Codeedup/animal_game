"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateDevice = authenticateDevice;
exports.authenticateOAuth = authenticateOAuth;
exports.authenticateAdmin = authenticateAdmin;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
/**
 * Authenticate a device ID
 * Used for all basic user authentication
 */
async function authenticateDevice(req, res, next) {
    try {
        // Check for device ID in headers
        const deviceId = req.headers['x-device-id'];
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
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}
/**
 * Authenticate a user with OAuth credentials
 * Used for social features and more advanced capabilities
 */
async function authenticateOAuth(req, res, next) {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
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
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
    catch (error) {
        console.error('OAuth authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}
/**
 * Authenticate as an admin
 * For administrative tasks like uploading fights
 */
async function authenticateAdmin(req, res, next) {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
            // Check if admin
            if (!decoded.isAdmin) {
                res.status(403).json({ error: 'Admin privileges required' });
                return;
            }
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
    catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}
