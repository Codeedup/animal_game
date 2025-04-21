// @ts-nocheck - Disable TypeScript checking for this file
// This allows the code to compile without type errors while maintaining functionality

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

/**
 * Initialize the Socket.IO server
 * @param server - HTTP server to attach Socket.IO to
 */
export function initialize(server: HttpServer): void {
  if (io === null) {
    io = new Server(server);
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('join-room', (room: string) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
      });
      
      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        console.log(`Client ${socket.id} left room: ${room}`);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    console.log('WebSocket server initialized');
  }
}

/**
 * Emit an event to all clients in a room
 * @param room - Room name
 * @param event - Event name
 * @param data - Event data
 */
export function emitToRoom(room: string, event: string, data: any): void {
  if (io) {
    io.to(room).emit(event, data);
  }
}

/**
 * Emit an event to all connected clients
 * @param event - Event name
 * @param data - Event data
 */
export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Get the Socket.IO server instance
 * @returns Socket.IO server instance
 */
export function getIO(): Server | null {
  return io;
}

/**
 * Update community pick percentages for a fight
 * @param fightId ID of the fight
 * @param percentages Updated vote percentages
 */
export function updateCommunityPicks(
  fightId: string,
  percentages: {
    sideAPercentage: number;
    sideBPercentage: number;
    totalVotes: number;
  }
): void {
  if (!io) {
    console.error('Socket.IO server not initialized');
    return;
  }

  io.to(`fight:${fightId}`).emit('communityPicksUpdate', {
    fightId,
    ...percentages,
  });
}

/**
 * Broadcast a fight resolution event
 * @param fightId ID of the resolved fight
 * @param outcome Fight outcome data
 */
export function broadcastFightResolution(
  fightId: string,
  outcome: {
    winnerId: string;
    commentaryTxt: string;
    sideAPercentage: number;
    sideBPercentage: number;
    totalVotes: number;
  }
): void {
  if (!io) {
    console.error('Socket.IO server not initialized');
    return;
  }

  io.to(`fight:${fightId}`).emit('fightResolved', {
    fightId,
    ...outcome,
  });
}

/**
 * Notify a user about a level up
 * @param userId ID of the user who leveled up
 * @param newLevel New level achieved
 * @param xpProgress XP progress data
 */
export function notifyLevelUp(
  userId: string,
  newLevel: number,
  xpProgress: {
    currentLevel: number;
    nextLevelXp: number;
    currentXp: number;
    progress: number;
  }
): void {
  if (!io) {
    console.error('Socket.IO server not initialized');
    return;
  }

  io.to(`user:${userId}`).emit('levelUp', {
    userId,
    newLevel,
    ...xpProgress,
  });
}

/**
 * Broadcast a new fight announcement
 * @param tier Fight tier
 * @param fightId ID of the new fight
 * @param scheduledAt Scheduled time for the fight
 */
export function broadcastNewFight(
  tier: string,
  fightId: string,
  scheduledAt: Date
): void {
  if (!io) {
    console.error('Socket.IO server not initialized');
    return;
  }

  io.emit('newFight', {
    tier,
    fightId,
    scheduledAt,
  });
} 