import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'hyperbasis.db');

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      capital REAL NOT NULL,
      difficulty TEXT NOT NULL,
      region TEXT NOT NULL,
      research_state TEXT DEFAULT '{}',
      research_points INTEGER DEFAULT 100,
      time_year INTEGER DEFAULT 2010,
      time_month INTEGER DEFAULT 1,
      time_day INTEGER DEFAULT 1,
      time_total_days INTEGER DEFAULT 0,
      time_speed INTEGER DEFAULT 1,
      time_paused INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS owned_tiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      tile_id TEXT NOT NULL,
      metro TEXT NOT NULL,
      region TEXT NOT NULL,
      price REAL NOT NULL,
      purchased_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      UNIQUE(game_id, tile_id)
    );

    CREATE INDEX IF NOT EXISTS idx_games_user ON games(user_id);
    CREATE INDEX IF NOT EXISTS idx_tiles_game ON owned_tiles(game_id);
  `);

  console.log('Database initialized');
}

// User operations
export const userOps = {
  create(username: string, password: string) {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    return stmt.run(username, password);
  },

  findByUsername(username: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as { id: number; username: string; password: string } | undefined;
  }
};

// Game operations
export const gameOps = {
  create(userId: number, companyName: string, capital: number, difficulty: string, region: string) {
    const stmt = db.prepare(`
      INSERT INTO games (user_id, company_name, capital, difficulty, region)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, companyName, capital, difficulty, region);
  },

  findByUser(userId: number) {
    const stmt = db.prepare(`
      SELECT g.*, COUNT(t.id) as tile_count
      FROM games g
      LEFT JOIN owned_tiles t ON g.id = t.game_id
      WHERE g.user_id = ?
      GROUP BY g.id
      ORDER BY g.updated_at DESC
    `);
    return stmt.all(userId);
  },

  findById(gameId: number) {
    const stmt = db.prepare('SELECT * FROM games WHERE id = ?');
    return stmt.get(gameId);
  },

  update(gameId: number, data: {
    capital?: number;
    research_state?: string;
    research_points?: number;
    time_year?: number;
    time_month?: number;
    time_day?: number;
    time_total_days?: number;
    time_speed?: number;
    time_paused?: number;
  }) {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`UPDATE games SET ${fields}, updated_at = strftime('%s', 'now') WHERE id = ?`);
    return stmt.run(...values, gameId);
  },

  delete(gameId: number) {
    const stmt = db.prepare('DELETE FROM games WHERE id = ?');
    return stmt.run(gameId);
  }
};

// Tile operations
export const tileOps = {
  getByGame(gameId: number) {
    const stmt = db.prepare('SELECT * FROM owned_tiles WHERE game_id = ?');
    return stmt.all(gameId);
  },

  buyTiles(gameId: number, tiles: { tile_id: string; metro: string; region: string; price: number }[]) {
    const insertStmt = db.prepare(`
      INSERT INTO owned_tiles (game_id, tile_id, metro, region, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((tiles: typeof tiles) => {
      for (const tile of tiles) {
        insertStmt.run(gameId, tile.tile_id, tile.metro, tile.region, tile.price);
      }
    });

    return transaction(tiles);
  },

  getTileIds(gameId: number): string[] {
    const stmt = db.prepare('SELECT tile_id FROM owned_tiles WHERE game_id = ?');
    const rows = stmt.all(gameId) as { tile_id: string }[];
    return rows.map(r => r.tile_id);
  }
};
