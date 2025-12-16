// API Client for Hyperbasis Backend

const API_BASE = 'http://localhost:3001/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const authApi = {
  async signup(username: string, password: string) {
    return request<{ success: boolean; user: { id: number; username: string } }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async login(username: string, password: string) {
    return request<{ success: boolean; user: { id: number; username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// Games API
export interface GameData {
  id: number;
  user_id: number;
  company_name: string;
  capital: number;
  difficulty: string;
  region: string;
  tile_count?: number;
  created_at: number;
  updated_at: number;
  ownedTiles?: string[];
  research?: {
    state: Record<string, unknown>;
    points: number;
  };
  time?: {
    date: { year: number; month: number; day: number };
    totalDays: number;
    speed: number;
    paused: boolean;
  };
}

export const gamesApi = {
  async list(userId: number) {
    return request<{ games: GameData[] }>(`/games?userId=${userId}`);
  },

  async get(gameId: number) {
    return request<{ game: GameData }>(`/games/${gameId}`);
  },

  async create(userId: number, companyName: string, capital: number, difficulty: string, region: string) {
    return request<{ success: boolean; gameId: number }>('/games', {
      method: 'POST',
      body: JSON.stringify({ userId, companyName, capital, difficulty, region }),
    });
  },

  async save(gameId: number, data: {
    capital?: number;
    research?: { state: Record<string, unknown>; points: number };
    time?: {
      date: { year: number; month: number; day: number };
      totalDays: number;
      speed: number;
      paused: boolean;
    };
  }) {
    return request<{ success: boolean }>(`/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(gameId: number) {
    return request<{ success: boolean }>(`/games/${gameId}`, {
      method: 'DELETE',
    });
  },

  async buyLand(gameId: number, metro: string, tiles: { id: string; region: string; price: number }[]) {
    return request<{ success: boolean; newCapital: number; tilesAdded: number }>(`/games/${gameId}/buy-land`, {
      method: 'POST',
      body: JSON.stringify({ metro, tiles }),
    });
  },
};

// Session management (local storage for session only, data in backend)
export const session = {
  get(): { userId: number; username: string } | null {
    const data = localStorage.getItem('hyperbasis_session');
    return data ? JSON.parse(data) : null;
  },

  set(userId: number, username: string) {
    localStorage.setItem('hyperbasis_session', JSON.stringify({ userId, username }));
  },

  clear() {
    localStorage.removeItem('hyperbasis_session');
  },

  // Current game ID for the session
  getCurrentGameId(): number | null {
    const id = localStorage.getItem('hyperbasis_current_game');
    return id ? Number(id) : null;
  },

  setCurrentGameId(gameId: number) {
    localStorage.setItem('hyperbasis_current_game', String(gameId));
  },

  clearCurrentGameId() {
    localStorage.removeItem('hyperbasis_current_game');
  },
};
