"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCronJobs = initializeCronJobs;
const client_1 = require("@prisma/client");
const node_cron_1 = require("node-cron");
const fightService = __importStar(require("./fightService"));
const prisma = new client_1.PrismaClient();
// Initialize cron jobs
function initializeCronJobs() {
    // Every 6 hours at the top of the hour (0:00, 6:00, 12:00, 18:00 UTC)
    (0, node_cron_1.schedule)('0 0,6,12,18 * * *', publishHourlyFights);
    // Daily at 3:00 and 15:00 UTC
    (0, node_cron_1.schedule)('0 3,15 * * *', publishDailyFights);
    // Weekly on Friday at 20:00 UTC
    (0, node_cron_1.schedule)('0 20 * * FRI', publishWeeklyFight);
    // Check for fights to resolve every 5 minutes
    (0, node_cron_1.schedule)('*/5 * * * *', checkForFightsToResolve);
    console.log('Cron jobs initialized');
}
/**
 * Publish hourly fights
 */
async function publishHourlyFights() {
    console.log('Publishing hourly fights');
    await pickAndActivateFights('HOURLY', 1);
}
/**
 * Publish daily fights
 */
async function publishDailyFights() {
    console.log('Publishing daily fights');
    await pickAndActivateFights('DAILY', 1);
}
/**
 * Publish weekly fight
 */
async function publishWeeklyFight() {
    console.log('Publishing weekly fight');
    await pickAndActivateFights('WEEKLY', 1);
}
/**
 * Pick and activate fights from the pre-computed pool
 * @param tier Fight tier
 * @param count Number of fights to activate
 */
async function pickAndActivateFights(tier, count) {
    try {
        const now = new Date();
        // Define fight duration based on tier
        const durationHours = {
            'HOURLY': 6, // 6 hours for hourly fights
            'DAILY': 12, // 12 hours for daily fights
            'WEEKLY': 24, // 24 hours for weekly fights
            'NORMAL': 2, // 2 hours for normal fights
        };
        // Calculate expiration time
        const expiresAt = new Date(now.getTime() + durationHours[tier] * 60 * 60 * 1000);
        // Find fights that are scheduled for this tier but not yet activated
        const availableFights = await prisma.fight.findMany({
            where: {
                tier: tier,
                scheduledAt: undefined, // Not yet scheduled
            },
            take: count,
        });
        if (availableFights.length === 0) {
            console.log(`No ${tier} fights available in the pool`);
            return;
        }
        // Activate each fight
        for (const fight of availableFights) {
            await prisma.fight.update({
                where: { id: fight.id },
                data: {
                    scheduledAt: now,
                    expiresAt,
                },
            });
            console.log(`Activated ${tier} fight: ${fight.id}`);
        }
    }
    catch (error) {
        console.error(`Error activating ${tier} fights:`, error);
    }
}
/**
 * Check for fights that have expired and need to be resolved
 */
async function checkForFightsToResolve() {
    try {
        const now = new Date();
        // Find expired fights that haven't been resolved yet
        const expiredFights = await prisma.fight.findMany({
            where: {
                expiresAt: { lt: now },
                resolved: false,
            },
        });
        if (expiredFights.length === 0) {
            return; // No fights to resolve
        }
        console.log(`Found ${expiredFights.length} expired fights to resolve`);
        // Resolve each fight
        for (const fight of expiredFights) {
            try {
                await fightService.resolveFight(fight.id);
                console.log(`Resolved fight: ${fight.id}`);
            }
            catch (error) {
                console.error(`Error resolving fight ${fight.id}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Error checking for fights to resolve:', error);
    }
}
