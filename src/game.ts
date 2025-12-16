import type { GameConfig as GameConfigType, Save } from './types';
import { SaveManager } from './auth';
import { Research } from './research';
import { Metro, MetroData, setGameRef } from './metro';
import { GameTime } from './time';

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

  startGame(): void {
    const config = this.getConfig();
    this.hide();
    Game.start(config);
  }
};

export const Game = {
  config: null as GameConfigType | null,
  capital: 0,
  ownedTiles: [] as string[],
  currentView: 'na-map' as 'na-map' | 'metro',

  gameScreen: null as HTMLElement | null,
  companyNameEl: null as HTMLElement | null,
  capitalEl: null as HTMLElement | null,
  menuBtn: null as HTMLElement | null,
  saveBtn: null as HTMLElement | null,
  mapTiles: null as NodeListOf<HTMLElement> | null,
  viewNaMap: null as HTMLElement | null,
  viewMetro: null as HTMLElement | null,
  sidebarBtns: null as NodeListOf<HTMLElement> | null,
  tabPanels: null as NodeListOf<HTMLElement> | null,

  init(): void {
    this.gameScreen = document.getElementById('game-screen');
    this.companyNameEl = document.getElementById('game-company-name');
    this.capitalEl = document.getElementById('game-capital');
    this.menuBtn = document.getElementById('game-menu-btn');
    this.saveBtn = document.getElementById('game-save-btn');
    this.mapTiles = document.querySelectorAll('.map-tile.metro');

    this.viewNaMap = document.getElementById('view-na-map');
    this.viewMetro = document.getElementById('view-metro');

    this.sidebarBtns = document.querySelectorAll('.game-sidebar .sidebar-btn');
    this.tabPanels = document.querySelectorAll('.game-main .tab-panel');

    // Set up cross-module reference
    setGameRef(this);

    this.bindEvents();
  },

  bindEvents(): void {
    this.menuBtn?.addEventListener('click', () => this.returnToMenu());
    this.saveBtn?.addEventListener('click', () => this.save());

    this.mapTiles?.forEach(tile => {
      tile.addEventListener('click', () => this.selectMetro(tile.dataset.metro || ''));
    });

    this.sidebarBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab || ''));
    });
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

  start(config: GameConfigType): void {
    this.config = config;
    this.capital = config.startingCapital;
    this.ownedTiles = [];

    if (this.companyNameEl) this.companyNameEl.textContent = config.companyName;
    this.updateCapitalDisplay();
    this.showView('na-map');
    this.switchTab('home');

    Research.state = {};
    Research.points = 100;
    Research.init();

    // Initialize and start time
    GameTime.reset();
    GameTime.init();
    GameTime.start();

    this.gameScreen?.classList.add('active');
  },

  load(save: Save): void {
    this.config = {
      companyName: save.companyName,
      startingCapital: save.capital,
      difficulty: save.difficulty,
      region: save.region
    };
    this.capital = save.capital;
    this.ownedTiles = save.ownedTiles || [];

    if (this.companyNameEl) this.companyNameEl.textContent = save.companyName;
    this.updateCapitalDisplay();
    this.showView('na-map');
    this.switchTab('home');

    Research.loadState(save.research || { state: {}, points: 100 });

    // Load time state
    GameTime.init();
    if (save.time) {
      GameTime.loadState(save.time);
    } else {
      GameTime.reset();
      GameTime.start();
    }

    this.gameScreen?.classList.add('active');
  },

  save(): void {
    if (!this.config) return;

    const gameState = {
      companyName: this.config.companyName,
      capital: this.capital,
      ownedTiles: this.ownedTiles,
      difficulty: this.config.difficulty,
      region: this.config.region,
      research: Research.getState(),
      time: GameTime.getState()
    };

    if (SaveManager.saveGame(gameState)) {
      if (this.saveBtn) {
        this.saveBtn.textContent = 'Saved!';
        setTimeout(() => {
          if (this.saveBtn) this.saveBtn.textContent = 'Save';
        }, 1000);
      }
      uiRef?.updateLoadGameBtn();
    }
  },

  updateCapitalDisplay(): void {
    if (this.capitalEl) {
      this.capitalEl.textContent = '$' + this.capital.toLocaleString();
    }
  },

  showView(view: 'na-map' | 'metro'): void {
    this.currentView = view;
    this.viewNaMap?.classList.toggle('active', view === 'na-map');
    this.viewMetro?.classList.toggle('active', view === 'metro');
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
    this.gameScreen?.classList.remove('active');
    uiRef?.showMainMenu();
  },

  showMap(): void {
    this.showView('na-map');
  }
};
