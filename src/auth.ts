import type { GameState } from './types';
import { authApi, gamesApi, session, type GameData } from './api';

export const Auth = {
  async signup(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!username || !password) {
      return { success: false, error: 'Username and password required' };
    }
    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    try {
      const result = await authApi.signup(username, password);
      session.set(result.user.id, result.user.username);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Signup failed' };
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!username || !password) {
      return { success: false, error: 'Username and password required' };
    }

    try {
      const result = await authApi.login(username, password);
      session.set(result.user.id, result.user.username);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  },

  logout(): void {
    session.clear();
    session.clearCurrentGameId();
  },

  isLoggedIn(): boolean {
    return session.get() !== null;
  },

  getCurrentUser(): string | null {
    const s = session.get();
    return s ? s.username : null;
  },

  getCurrentUserId(): number | null {
    const s = session.get();
    return s ? s.userId : null;
  },

  async hasSaves(): Promise<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return false;
    try {
      const result = await gamesApi.list(userId);
      return result.games.length > 0;
    } catch {
      return false;
    }
  }
};

// Adapter to convert API GameData to frontend Save format
function gameDataToSave(game: GameData) {
  return {
    id: game.id,
    companyName: game.company_name,
    capital: game.capital,
    ownedTiles: game.ownedTiles || [],
    difficulty: game.difficulty,
    region: game.region,
    research: {
      state: (game.research?.state || {}) as { [key: string]: number },
      points: game.research?.points || 100
    },
    time: game.time || {
      date: { year: 2010, month: 1, day: 1 },
      totalDays: 0,
      speed: 1,
      paused: true
    },
    economy: game.economy || {
      monthlyRevenue: 10000000,
      researchBudget: 5000000
    },
    designs: game.designs || {
      spcn: [],
      rack: []
    },
    campuses: game.campuses || [],
    savedAt: game.updated_at * 1000
  };
}

export const SaveManager = {
  async getSaves() {
    const userId = Auth.getCurrentUserId();
    console.log('getSaves - userId:', userId);
    if (!userId) {
      console.log('getSaves - no userId, returning empty');
      return [];
    }
    try {
      const result = await gamesApi.list(userId);
      console.log('getSaves - API result:', result);
      return result.games.map(gameDataToSave);
    } catch (err) {
      console.error('getSaves - API error:', err);
      return [];
    }
  },

  async saveGame(gameState: GameState & {
    economy?: { monthlyRevenue: number; researchBudget: number };
    designs?: { spcn: unknown[]; rack: unknown[] };
    campuses?: unknown[];
  }): Promise<boolean> {
    const gameId = session.getCurrentGameId();
    if (!gameId) return false;

    try {
      await gamesApi.save(gameId, {
        capital: gameState.capital,
        research: gameState.research,
        time: gameState.time,
        economy: gameState.economy,
        designs: gameState.designs,
        campuses: gameState.campuses
      });
      return true;
    } catch {
      return false;
    }
  },

  async createGame(companyName: string, capital: number, difficulty: string, region: string): Promise<number | null> {
    const userId = Auth.getCurrentUserId();
    if (!userId) {
      console.error('createGame failed: No user logged in');
      return null;
    }

    try {
      const result = await gamesApi.create(userId, companyName, capital, difficulty, region);
      session.setCurrentGameId(result.gameId);
      return result.gameId;
    } catch (err) {
      console.error('createGame API error:', err);
      return null;
    }
  },

  async loadGame(gameId: number) {
    try {
      const result = await gamesApi.get(gameId);
      session.setCurrentGameId(gameId);
      return gameDataToSave(result.game);
    } catch {
      return null;
    }
  },

  async deleteSave(gameId: number): Promise<boolean> {
    try {
      await gamesApi.delete(gameId);
      return true;
    } catch {
      return false;
    }
  },

  async hasSaves(): Promise<boolean> {
    const saves = await this.getSaves();
    return saves.length > 0;
  }
};
