import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import { authRouter } from './routes/auth.js';
import { gamesRouter } from './routes/games.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
