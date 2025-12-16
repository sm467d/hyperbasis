import type { Users, Session, Save, GameState } from './types';

export const Auth = {
  getUsers(): Users {
    const users = localStorage.getItem('hyperbasis_users');
    return users ? JSON.parse(users) : {};
  },

  saveUsers(users: Users): void {
    localStorage.setItem('hyperbasis_users', JSON.stringify(users));
  },

  getSession(): Session | null {
    const session = localStorage.getItem('hyperbasis_session');
    return session ? JSON.parse(session) : null;
  },

  saveSession(username: string): void {
    localStorage.setItem('hyperbasis_session', JSON.stringify({
      username,
      loginTime: Date.now()
    }));
  },

  clearSession(): void {
    localStorage.removeItem('hyperbasis_session');
  },

  signup(username: string, password: string): { success: boolean; error?: string } {
    if (!username || !password) {
      return { success: false, error: 'Username and password required' };
    }
    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    const users = this.getUsers();
    if (users[username]) {
      return { success: false, error: 'Username already exists' };
    }

    users[username] = {
      password: password,
      createdAt: Date.now(),
      saves: []
    };

    this.saveUsers(users);
    this.saveSession(username);
    return { success: true };
  },

  login(username: string, password: string): { success: boolean; error?: string } {
    if (!username || !password) {
      return { success: false, error: 'Username and password required' };
    }

    const users = this.getUsers();
    if (!users[username]) {
      return { success: false, error: 'User not found' };
    }
    if (users[username].password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    this.saveSession(username);
    return { success: true };
  },

  logout(): void {
    this.clearSession();
  },

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  },

  getCurrentUser(): string | null {
    const session = this.getSession();
    return session ? session.username : null;
  },

  hasSaves(): boolean {
    const username = this.getCurrentUser();
    if (!username) return false;
    const users = this.getUsers();
    return (users[username]?.saves?.length ?? 0) > 0;
  }
};

export const SaveManager = {
  getSaves(): Save[] {
    const username = Auth.getCurrentUser();
    if (!username) return [];
    const users = Auth.getUsers();
    return users[username]?.saves || [];
  },

  saveGame(gameState: GameState): boolean {
    const username = Auth.getCurrentUser();
    if (!username) return false;

    const users = Auth.getUsers();
    if (!users[username].saves) {
      users[username].saves = [];
    }

    const save: Save = {
      id: Date.now(),
      companyName: gameState.companyName,
      capital: gameState.capital,
      ownedTiles: gameState.ownedTiles,
      difficulty: gameState.difficulty,
      region: gameState.region,
      research: gameState.research,
      time: gameState.time,
      savedAt: Date.now()
    };

    const existingIndex = users[username].saves.findIndex(s => s.companyName === save.companyName);
    if (existingIndex !== -1) {
      users[username].saves[existingIndex] = save;
    } else {
      users[username].saves.push(save);
    }

    Auth.saveUsers(users);
    return true;
  },

  deleteSave(saveId: number): boolean {
    const username = Auth.getCurrentUser();
    if (!username) return false;

    const users = Auth.getUsers();
    if (!users[username].saves) return false;

    users[username].saves = users[username].saves.filter(s => s.id !== saveId);
    Auth.saveUsers(users);
    return true;
  },

  hasSaves(): boolean {
    return this.getSaves().length > 0;
  }
};
