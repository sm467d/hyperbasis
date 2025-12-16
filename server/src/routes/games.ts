import { Router } from 'express';
import { gameOps, tileOps, db } from '../db.js';

export const gamesRouter = Router();

// List all games for a user
gamesRouter.get('/', (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  const games = gameOps.findByUser(userId);
  res.json({ games });
});

// Get a specific game with owned tiles
gamesRouter.get('/:id', (req, res) => {
  const gameId = Number(req.params.id);
  const game = gameOps.findById(gameId) as Record<string, unknown> | undefined;

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const ownedTiles = tileOps.getTileIds(gameId);

  res.json({
    game: {
      ...game,
      ownedTiles,
      research: {
        state: JSON.parse((game.research_state as string) || '{}'),
        points: game.research_points
      },
      time: {
        date: {
          year: game.time_year,
          month: game.time_month,
          day: game.time_day
        },
        totalDays: game.time_total_days,
        speed: game.time_speed,
        paused: Boolean(game.time_paused)
      }
    }
  });
});

// Create a new game
gamesRouter.post('/', (req, res) => {
  const { userId, companyName, capital, difficulty, region } = req.body;

  if (!userId || !companyName) {
    return res.status(400).json({ error: 'userId and companyName required' });
  }

  try {
    const result = gameOps.create(
      userId,
      companyName,
      capital || 10000000,
      difficulty || 'normal',
      region || 'north-america'
    );

    res.json({
      success: true,
      gameId: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Save/update game state
gamesRouter.put('/:id', (req, res) => {
  const gameId = Number(req.params.id);
  const { capital, research, time } = req.body;

  const updateData: Record<string, unknown> = {};

  if (capital !== undefined) {
    updateData.capital = capital;
  }

  if (research) {
    if (research.state !== undefined) {
      updateData.research_state = JSON.stringify(research.state);
    }
    if (research.points !== undefined) {
      updateData.research_points = research.points;
    }
  }

  if (time) {
    if (time.date) {
      updateData.time_year = time.date.year;
      updateData.time_month = time.date.month;
      updateData.time_day = time.date.day;
    }
    if (time.totalDays !== undefined) {
      updateData.time_total_days = time.totalDays;
    }
    if (time.speed !== undefined) {
      updateData.time_speed = time.speed;
    }
    if (time.paused !== undefined) {
      updateData.time_paused = time.paused ? 1 : 0;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No update data provided' });
  }

  try {
    gameOps.update(gameId, updateData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Delete a game
gamesRouter.delete('/:id', (req, res) => {
  const gameId = Number(req.params.id);

  try {
    gameOps.delete(gameId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

// Buy land tiles
gamesRouter.post('/:id/buy-land', (req, res) => {
  const gameId = Number(req.params.id);
  const { tiles, metro } = req.body;

  if (!tiles || !Array.isArray(tiles) || tiles.length === 0) {
    return res.status(400).json({ error: 'tiles array required' });
  }

  if (!metro) {
    return res.status(400).json({ error: 'metro required' });
  }

  // Get current game state
  const game = gameOps.findById(gameId) as { capital: number } | undefined;
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Calculate total cost
  const totalCost = tiles.reduce((sum: number, t: { price: number }) => sum + t.price, 0);

  if (totalCost > game.capital) {
    return res.status(400).json({ error: 'Insufficient capital' });
  }

  // Check for already owned tiles
  const existingTiles = tileOps.getTileIds(gameId);
  const duplicates = tiles.filter((t: { id: string }) => existingTiles.includes(t.id));
  if (duplicates.length > 0) {
    return res.status(400).json({ error: 'Some tiles are already owned', duplicates });
  }

  // Transaction: deduct capital and add tiles
  const transaction = db.transaction(() => {
    // Deduct capital
    gameOps.update(gameId, { capital: game.capital - totalCost });

    // Add tiles
    const tileData = tiles.map((t: { id: string; region: string; price: number }) => ({
      tile_id: t.id,
      metro,
      region: t.region,
      price: t.price
    }));
    tileOps.buyTiles(gameId, tileData);
  });

  try {
    transaction();
    res.json({
      success: true,
      newCapital: game.capital - totalCost,
      tilesAdded: tiles.length
    });
  } catch (err) {
    console.error('Buy land error:', err);
    res.status(500).json({ error: 'Failed to purchase tiles' });
  }
});
