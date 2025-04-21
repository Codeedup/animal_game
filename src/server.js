const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const fightRoutes = require('./routes/fights');
const voteRoutes = require('./routes/votes');
const userRoutes = require('./routes/users');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/fights', fightRoutes);
app.use('/vote', voteRoutes);
app.use('/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'who_will_win? API running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 