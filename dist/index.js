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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const express_rate_limit_1 = require("express-rate-limit");
// Import services
const socketService = __importStar(require("./services/socketService"));
const cronService = __importStar(require("./services/cronService"));
// Import routes
const fightRoutes_1 = __importDefault(require("./routes/fightRoutes"));
const voteRoutes_1 = __importDefault(require("./routes/voteRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
// Initialize Express app
const app = (0, express_1.default)();
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
socketService.initialize(server);
// Configure middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Configure rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// API routes
app.use('/fights', fightRoutes_1.default);
app.use('/vote', voteRoutes_1.default);
app.use('/profile', userRoutes_1.default);
app.use('/leaderboard', leaderboardRoutes_1.default);
app.use('/store', storeRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
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
