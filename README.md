# who_will_win?

A mobile & web game where players vote on which of two animal squads would win a hypothetical battle.

## Core Features

- Players vote on animal squads in hypothetical battles
- Different tiers of fights (normal, hourly, daily, weekly)
- XP rewards for voting (+25 XP if correct, +5 XP if wrong)
- Underdog bonus for backing the less popular side
- Progressive level-up system
- Real-time updates with WebSockets
- Redis caching for performance

## Technology Stack

- **Backend**: Node.js with Express (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Real-time**: Socket.IO for WebSockets
- **Testing**: Jest

## Game Mechanics

### Core Loop
1. Client calls GET /fights/:tier/next to fetch an open fight (tier = normal | hourly | daily | weekly).
2. UI shows two sides (name, pack size, biome, AI poster) and a countdown if scheduled.
3. Player taps a side → POST /vote.
4. Server records the vote, awards XP immediately:
   - +25 XP if correct (after fight resolves)
   - +5 XP if wrong
   - **Underdog bonus:** if ≤35% of players picked that side, award +50% XP.
5. Level-up curve: `xp_needed = 100 * level^1.4`.

### Odds Visibility
- Normal fights: **no odds shown**.
- Hourly / Daily / Weekly: show public "community pick split" (updated each minute).
- All tiers reveal exact split after resolution.

### Tiers & Rotation (UTC schedule)
- Hourly: 4 fights / day at 00, 06, 12, 18 UTC
- Daily: 2 fights / day at 03, 15 UTC
- Weekly: 1 fight / Friday 20 UTC
- Normal: unlimited, always open

## API Endpoints

- GET /fights/:tier/next - Get next available fight by tier
- POST /vote - Cast a vote on a fight
- GET /profile - Get user profile with XP progress
- GET /leaderboard/global - Get global leaderboard
- GET /leaderboard/friends - Get friends leaderboard
- POST /admin/fights/upload - Upload batch of fights (admin only)

## Setting Up Development Environment

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- Redis 6+

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/who_will_win?.git
   cd who_will_win?
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```
   cp .env.example .env
   ```

4. Set up the database
   ```
   npm run migrate
   ```

5. Generate Prisma client
   ```
   npm run generate
   ```

6. Start the development server
   ```
   npm run dev
   ```

### Testing
Run unit tests:
```
npm test
```

## WebSocket Events

- `communityPicksUpdate` - Real-time updates on community pick percentages
- `fightResolved` - Notification when a fight resolves
- `levelUp` - Notification when a user levels up
- `newFight` - Announcement when a new fight becomes available

## Deployment

The application can be deployed as a standard Node.js application with dependencies:
- PostgreSQL database
- Redis cache

## License

This project is proprietary software.