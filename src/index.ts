import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from 'express-rate-limit';

// Import services
import * as socketService from './services/socketService';
import * as cronService from './services/cronService';

// Import routes
import fightRoutes from './routes/fightRoutes';
import voteRoutes from './routes/voteRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import storeRoutes from './routes/storeRoutes';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Configure middleware
app.use(cors());
app.use(express.json());

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API routes
app.use('/fights', fightRoutes);
app.use('/vote', voteRoutes);
app.use('/profile', userRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/store', storeRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: process.env.npm_package_version });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize cron jobs
  cronService.initializeCronJobs();
  
  console.log('who_will_win? API ready');
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown); 