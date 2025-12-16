import { Auth, SaveManager } from './auth';
import { GameConfig, Game, setUIRef } from './game';
import { Metro } from './metro';

export const LoadScreen = {
  screen: null as HTMLElement | null,
  savesList: null as HTMLElement | null,
  backBtn: null as HTMLElement | null,

  init(): void {
    this.screen = document.getElementById('load-screen');
    this.savesList = document.getElementById('saves-list');
    this.backBtn = document.getElementById('load-back-btn');

    this.bindEvents();
  },

  bindEvents(): void {
    this.backBtn?.addEventListener('click', () => this.hide());
  },

  show(): void {
    this.renderSaves();
    this.screen?.classList.add('active');
  },

  hide(showMenu: boolean = true): void {
    this.screen?.classList.remove('active');
    if (showMenu) {
      UI.showMainMenu();
    }
  },

  async renderSaves(): Promise<void> {
    if (!this.savesList) return;

    this.savesList.innerHTML = '<div class="loading">Loading saves...</div>';

    const saves = await SaveManager.getSaves();
    console.log('Loaded saves:', saves);

    if (saves.length === 0) {
      this.savesList.innerHTML = '<div class="no-saves">No saved games</div>';
      return;
    }

    this.savesList.innerHTML = '';
    const sortedSaves = [...saves].sort((a, b) => b.savedAt - a.savedAt);

    sortedSaves.forEach(save => {
      const item = document.createElement('div');
      item.className = 'save-item';

      const date = new Date(save.savedAt);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="save-info">
          <div class="save-name">${save.companyName}</div>
          <div class="save-details">${save.difficulty} · ${save.ownedTiles.length} tiles · ${dateStr}</div>
        </div>
        <div class="save-capital">$${Math.floor(save.capital).toLocaleString()}</div>
        <button class="save-delete" data-id="${save.id}">Delete</button>
      `;

      item.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('save-delete')) {
          await this.loadSave(save.id);
        }
      });

      const deleteBtn = item.querySelector('.save-delete');
      deleteBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.deleteSave(save.id);
      });

      this.savesList!.appendChild(item);
    });
  },

  async loadSave(gameId: number): Promise<void> {
    console.log('Loading game:', gameId);
    const save = await SaveManager.loadGame(gameId);
    console.log('Loaded save data:', save);
    if (save) {
      this.hide(false);  // Don't show main menu, we're loading a game
      Game.load(save);
    } else {
      console.error('Failed to load save');
    }
  },

  async deleteSave(saveId: number): Promise<void> {
    if (confirm('Delete this save?')) {
      await SaveManager.deleteSave(saveId);
      await this.renderSaves();
      await UI.updateLoadGameBtn();
    }
  }
};

export const UI = {
  landing: null as HTMLElement | null,
  mainMenu: null as HTMLElement | null,
  loginForm: null as HTMLFormElement | null,
  signupForm: null as HTMLFormElement | null,
  tabs: null as NodeListOf<HTMLElement> | null,
  logoutBtn: null as HTMLElement | null,
  displayUsername: null as HTMLElement | null,
  loadGameBtn: null as HTMLButtonElement | null,
  newGameBtn: null as HTMLElement | null,

  init(): void {
    this.landing = document.getElementById('landing');
    this.mainMenu = document.getElementById('main-menu');
    this.loginForm = document.getElementById('login-form') as HTMLFormElement;
    this.signupForm = document.getElementById('signup-form') as HTMLFormElement;
    this.tabs = document.querySelectorAll('.auth-tab');
    this.logoutBtn = document.getElementById('logout-btn');
    this.displayUsername = document.getElementById('display-username');
    this.loadGameBtn = document.getElementById('load-game-btn') as HTMLButtonElement;
    this.newGameBtn = document.getElementById('new-game-btn');

    // Set up cross-module reference
    setUIRef(this);

    this.bindEvents();
    this.checkSession();

    GameConfig.init();
    Game.init();
    Metro.init();
    LoadScreen.init();
  },

  bindEvents(): void {
    this.tabs?.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab || ''));
    });

    this.loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (document.getElementById('login-username') as HTMLInputElement).value;
      const password = (document.getElementById('login-password') as HTMLInputElement).value;
      await this.handleLogin(username, password);
    });

    this.signupForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (document.getElementById('signup-username') as HTMLInputElement).value;
      const password = (document.getElementById('signup-password') as HTMLInputElement).value;
      const confirm = (document.getElementById('signup-confirm') as HTMLInputElement).value;
      await this.handleSignup(username, password, confirm);
    });

    this.logoutBtn?.addEventListener('click', () => this.handleLogout());

    this.newGameBtn?.addEventListener('click', () => {
      this.hideMainMenu();
      GameConfig.show();
    });

    this.loadGameBtn?.addEventListener('click', () => {
      this.hideMainMenu();
      LoadScreen.show();
    });
  },

  async updateLoadGameBtn(): Promise<void> {
    if (this.loadGameBtn) {
      const hasSaves = await SaveManager.hasSaves();
      this.loadGameBtn.disabled = !hasSaves;
    }
  },

  switchTab(tab: string): void {
    this.tabs?.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

    this.loginForm?.classList.remove('active');
    this.signupForm?.classList.remove('active');

    if (tab === 'login') {
      this.loginForm?.classList.add('active');
    } else {
      this.signupForm?.classList.add('active');
    }

    this.clearErrors();
  },

  async handleLogin(username: string, password: string): Promise<void> {
    const result = await Auth.login(username, password);
    if (result.success) {
      await this.showMainMenu();
    } else {
      this.showError('login-error', result.error || 'Login failed');
    }
  },

  async handleSignup(username: string, password: string, confirm: string): Promise<void> {
    if (password !== confirm) {
      this.showError('signup-error', 'Passwords do not match');
      return;
    }

    const result = await Auth.signup(username, password);
    if (result.success) {
      await this.showMainMenu();
    } else {
      this.showError('signup-error', result.error || 'Signup failed');
    }
  },

  handleLogout(): void {
    Auth.logout();
    this.showLanding();
  },

  showError(elementId: string, message: string): void {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.add('show');
    }
  },

  clearErrors(): void {
    document.querySelectorAll('.error').forEach(el => {
      el.classList.remove('show');
      el.textContent = '';
    });
  },

  checkSession(): void {
    if (Auth.isLoggedIn()) {
      this.showMainMenu();
    } else {
      this.showLanding();
    }
  },

  showLanding(): void {
    this.landing?.classList.remove('hidden');
    this.mainMenu?.classList.remove('active');
    this.mainMenu?.classList.remove('hidden');
    GameConfig.hide();
    this.clearForms();
  },

  async showMainMenu(): Promise<void> {
    this.landing?.classList.add('hidden');
    this.mainMenu?.classList.remove('hidden');
    this.mainMenu?.classList.add('active');
    if (this.displayUsername) {
      this.displayUsername.textContent = Auth.getCurrentUser() || '';
    }
    await this.updateLoadGameBtn();
  },

  hideMainMenu(): void {
    this.mainMenu?.classList.add('hidden');
    this.mainMenu?.classList.remove('active');
  },

  clearForms(): void {
    this.loginForm?.reset();
    this.signupForm?.reset();
    this.clearErrors();
  }
};
