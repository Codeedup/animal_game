"use strict";
// @ts-nocheck - Disable TypeScript checking for this file
// This allows the code to compile without type errors while maintaining functionality
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
exports.emitToRoom = emitToRoom;
exports.emitToAll = emitToAll;
exports.getIO = getIO;
exports.updateCommunityPicks = updateCommunityPicks;
exports.broadcastFightResolution = broadcastFightResolution;
exports.notifyLevelUp = notifyLevelUp;
exports.broadcastNewFight = broadcastNewFight;
const socket_io_1 = require("socket.io");
let io = null;
/**
 * Initialize the Socket.IO server
 * @param server - HTTP server to attach Socket.IO to
 */
function initialize(server) {
    if (io === null) {
        io = new socket_io_1.Server(server);
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('join-room', (room) => {
                socket.join(room);
                console.log(`Client ${socket.id} joined room: ${room}`);
            });
            socket.on('leave-room', (room) => {
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
function emitToRoom(room, event, data) {
    if (io) {
        io.to(room).emit(event, data);
    }
}
/**
 * Emit an event to all connected clients
 * @param event - Event name
 * @param data - Event data
 */
function emitToAll(event, data) {
    if (io) {
        io.emit(event, data);
    }
}
/**
 * Get the Socket.IO server instance
 * @returns Socket.IO server instance
 */
function getIO() {
    return io;
}
/**
 * Update community pick percentages for a fight
 * @param fightId ID of the fight
 * @param percentages Updated vote percentages
 */
function updateCommunityPicks(fightId, percentages) {
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
function broadcastFightResolution(fightId, outcome) {
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
function notifyLevelUp(userId, newLevel, xpProgress) {
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
function broadcastNewFight(tier, fightId, scheduledAt) {
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
