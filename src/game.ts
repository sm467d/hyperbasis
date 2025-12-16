import type { GameConfig as GameConfigType } from './types';
import { SaveManager } from './auth';
import { Research } from './research';
import { Metro, MetroData, setGameRef } from './metro';
import { GameTime } from './time';
import { session } from './api';
import { Economy, setEconomyGameRef } from './economy';
import { Designs } from './designs';
import { CampusManager } from './campus';
import { CampusView, setCampusGameRef } from './campusView';

// UI reference (set via setUI to avoid circular dependency)
let uiRef: {
  showMainMenu: () => void;
  updateLoadGameBtn: () => void;
} | null = null;

export function setUIRef(ui: typeof uiRef): void {
  uiRef = ui;
}

export const GameConfig = {
  selectedRegion: 'north-america',
  selectedDifficulty: 'normal',

  configScreen: null as HTMLElement | null,
  startBtn: null as HTMLElement | null,
  backBtn: null as HTMLElement | null,
  companyNameInput: null as HTMLInputElement | null,
  capitalInput: null as HTMLInputElement | null,
  difficultyOptions: null as NodeListOf<HTMLElement> | null,

  init(): void {
    this.configScreen = document.getElementById('game-config');
    this.startBtn = document.getElementById('config-start-btn');
    this.backBtn = document.getElementById('config-back-btn');
    this.companyNameInput = document.getElementById('company-name') as HTMLInputElement;
    this.capitalInput = document.getElementById('starting-capital') as HTMLInputElement;
    this.difficultyOptions = document.querySelectorAll('.difficulty-option');

    this.bindEvents();
  },

  bindEvents(): void {
    this.difficultyOptions?.forEach(opt => {
      opt.addEventListener('click', () => this.selectDifficulty(opt));
    });

    this.backBtn?.addEventListener('click', () => {
      this.hide();
      uiRef?.showMainMenu();
    });

    this.startBtn?.addEventListener('click', () => this.startGame());
  },

  selectDifficulty(opt: HTMLElement): void {
    this.difficultyOptions?.forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    this.selectedDifficulty = opt.dataset.difficulty || 'normal';
  },

  show(): void {
    this.configScreen?.classList.add('active');
    this.reset();
  },

  hide(): void {
    this.configScreen?.classList.remove('active');
  },

  reset(): void {
    this.selectedRegion = 'north-america';
    this.selectedDifficulty = 'normal';
    if (this.companyNameInput) this.companyNameInput.value = '';
    if (this.capitalInput) this.capitalInput.value = '10000000';

    this.difficultyOptions?.forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.difficulty === 'normal');
    });
  },

  getConfig(): GameConfigType {
    return {
      companyName: this.companyNameInput?.value.trim() || 'Unnamed Corp',
      startingCapital: parseInt(this.capitalInput?.value || '10000000') || 10000000,
      region: this.selectedRegion,
      difficulty: this.selectedDifficulty
    };
  },

  async startGame(): Promise<void> {
    const config = this.getConfig();
    if (this.startBtn) {
      this.startBtn.textContent = 'Starting...';
      (this.startBtn as HTMLButtonElement).disabled = true;
    }
    this.hide();
    try {
      await Game.start(config);
    } catch (err) {
      console.error('Failed to start game:', err);
      alert('Failed to start game. Make sure the server is running.');
      this.show();
    } finally {
      if (this.startBtn) {
        this.startBtn.textContent = 'Start Game';
        (this.startBtn as HTMLButtonElement).disabled = false;
      }
    }
  }
};

export const Game = {
  config: null as GameConfigType | null,
  capital: 0,
  ownedTiles: [] as string[],
  currentView: 'na-map' as 'na-map' | 'metro' | 'campus',

  gameScreen: null as HTMLElement | null,
  companyNameEl: null as HTMLElement | null,
  capitalEl: null as HTMLElement | null,
  menuBtn: null as HTMLElement | null,
  mapTiles: null as NodeListOf<HTMLElement> | null,
  viewNaMap: null as HTMLElement | null,
  viewMetro: null as HTMLElement | null,
  sidebarBtns: null as NodeListOf<HTMLElement> | null,
  tabPanels: null as NodeListOf<HTMLElement> | null,
  themeToggle: null as HTMLElement | null,

  autosaveInterval: null as number | null,

  init(): void {
    this.gameScreen = document.getElementById('game-screen');
    this.companyNameEl = document.getElementById('game-company-name');
    this.capitalEl = document.getElementById('game-capital');
    this.menuBtn = document.getElementById('game-menu-btn');
    this.mapTiles = document.querySelectorAll('.map-tile.metro');

    this.viewNaMap = document.getElementById('view-na-map');
    this.viewMetro = document.getElementById('view-metro');

    this.sidebarBtns = document.querySelectorAll('.game-sidebar .sidebar-btn');
    this.tabPanels = document.querySelectorAll('.game-main .tab-panel');
    this.themeToggle = document.getElementById('theme-toggle');

    // Set up cross-module references
    setGameRef(this);
    setEconomyGameRef(this);
    setCampusGameRef(this);

    // Initialize campus view
    CampusView.init();

    this.bindEvents();
    this.loadTheme();
  },

  bindEvents(): void {
    this.menuBtn?.addEventListener('click', () => this.returnToMenu());

    this.mapTiles?.forEach(tile => {
      tile.addEventListener('click', () => this.selectMetro(tile.dataset.metro || ''));
    });

    this.sidebarBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab || ''));
    });

    // Theme toggle
    this.themeToggle?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('theme-btn')) {
        const theme = target.dataset.theme;
        this.setTheme(theme || 'dark');
      }
    });
  },

  loadTheme(): void {
    const savedTheme = localStorage.getItem('hyperbasis-theme') || 'dark';
    this.setTheme(savedTheme);
  },

  setTheme(theme: string): void {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('hyperbasis-theme', theme);

    // Update toggle buttons
    this.themeToggle?.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.theme === theme);
    });
  },

  startAutosave(): void {
    // Autosave every 5 seconds
    this.autosaveInterval = window.setInterval(() => this.autosave(), 5000);
  },

  stopAutosave(): void {
    if (this.autosaveInterval !== null) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  },

  async autosave(): Promise<void> {
    if (!this.config) return;
    await this.save(true);
  },

  switchTab(tabName: string): void {
    this.sidebarBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    this.tabPanels?.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });

    if (tabName !== 'home') {
      Metro.clearSelection();
      Metro.setMode('pan');
    }
  },

  async start(config: GameConfigType): Promise<void> {
    this.config = config;
    this.capital = config.startingCapital;
    this.ownedTiles = [];

    // Create game in backend
    const gameId = await SaveManager.createGame(
      config.companyName,
      config.startingCapital,
      config.difficulty,
      config.region
    );

    if (!gameId) {
      console.error('Failed to create game');
      uiRef?.showMainMenu();
      return;
    }

    if (this.companyNameEl) this.companyNameEl.textContent = config.companyName;
    this.updateCapitalDisplay();
    this.showView('na-map');
    this.switchTab('home');

    Research.state = {};
    Research.points = 100;
    Research.init();

    // Initialize economy
    Economy.reset();
    Economy.init();

    // Initialize designs
    Designs.spcnDesigns = [];
    Designs.rackDesigns = [];
    Designs.init();

    // Initialize campuses
    CampusManager.reset();

    // Initialize and start time
    GameTime.reset();
    GameTime.init();
    GameTime.start();

    // Start autosave
    this.startAutosave();

    this.gameScreen?.classList.add('active');
  },

  load(save: {
    id: number;
    companyName: string;
    capital: number;
    ownedTiles: string[];
    difficulty: string;
    region: string;
    research: { state: { [key: string]: number }; points: number };
    time: {
      date: { year: number; month: number; day: number };
      totalDays: number;
      speed: number;
      paused: boolean;
    };
    economy?: { monthlyRevenue: number; researchBudget: number };
    designs?: { spcn: any[]; rack: any[] };
    campuses?: any[];
  }): void {
    this.config = {
      companyName: save.companyName,
      startingCapital: save.capital,
      difficulty: save.difficulty,
      region: save.region
    };
    this.capital = save.capital;
    this.ownedTiles = save.ownedTiles || [];

    // Set current game ID for future saves
    session.setCurrentGameId(save.id);

    if (this.companyNameEl) this.companyNameEl.textContent = save.companyName;
    this.updateCapitalDisplay();
    this.showView('na-map');
    this.switchTab('home');

    // Initialize research and load state
    Research.init();
    Research.loadState(save.research || { state: {}, points: 100 });

    // Initialize economy
    Economy.init();
    if (save.economy) {
      Economy.loadState(save.economy);
    } else {
      Economy.reset();
    }

    // Initialize designs
    Designs.init();
    if (save.designs) {
      Designs.loadState(save.designs);
    }

    // Initialize campuses
    CampusManager.reset();
    if (save.campuses) {
      CampusManager.loadState(save.campuses);
    }

    // Load time state
    GameTime.init();
    if (save.time) {
      GameTime.loadState(save.time);
    } else {
      GameTime.reset();
      GameTime.start();
    }

    // Start autosave
    this.startAutosave();

    this.gameScreen?.classList.add('active');
  },

  async save(silent: boolean = false): Promise<void> {
    if (!this.config) return;

    const gameState = {
      companyName: this.config.companyName,
      capital: this.capital,
      ownedTiles: this.ownedTiles,
      difficulty: this.config.difficulty,
      region: this.config.region,
      research: Research.getState(),
      time: GameTime.getState(),
      economy: Economy.getState(),
      designs: Designs.getState(),
      campuses: CampusManager.getState()
    };

    const success = await SaveManager.saveGame(gameState);
    if (success && !silent) {
      uiRef?.updateLoadGameBtn();
    }
  },

  updateCapitalDisplay(): void {
    if (this.capitalEl) {
      this.capitalEl.textContent = '$' + Math.floor(this.capital).toLocaleString();
    }
  },

  showView(view: 'na-map' | 'metro' | 'campus'): void {
    this.currentView = view;
    this.viewNaMap?.classList.toggle('active', view === 'na-map');
    this.viewMetro?.classList.toggle('active', view === 'metro');
    document.getElementById('view-campus')?.classList.toggle('active', view === 'campus');
  },

  showCampus(campusId: string): void {
    this.showView('campus');
    CampusView.open(campusId);
  },

  selectMetro(metroId: string): void {
    if (MetroData[metroId]) {
      Metro.show(metroId);
      this.showView('metro');
    } else {
      console.log('Metro not yet available:', metroId);
    }
  },

  returnToMenu(): void {
    GameTime.pause();
    this.stopAutosave();
    session.clearCurrentGameId();
    this.gameScreen?.classList.remove('active');
    uiRef?.showMainMenu();
  },

  showMap(): void {
    this.showView('na-map');
  }
};
