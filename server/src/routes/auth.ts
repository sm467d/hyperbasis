import { Router } from 'express';
import { userOps } from '../db.js';

export const authRouter = Router();

authRouter.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const existing = userOps.findByUsername(username);
  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  try {
    const result = userOps.create(username, password);
    res.json({
      success: true,
      user: { id: result.lastInsertRowid, username }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = userOps.findByUsername(username);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  if (user.password !== password) {
    return res.status(400).json({ error: 'Incorrect password' });
  }

  res.json({
    success: true,
    user: { id: user.id, username: user.username }
  });
});
