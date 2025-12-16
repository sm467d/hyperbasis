import type { Tile, RegionDef, MapLabel, MetroMapData, TileEntry } from './types';
import { gamesApi, session } from './api';

// Game reference (set via setGame to avoid circular dependency)
let gameRef: {
  ownedTiles: string[];
  capital: number;
  updateCapitalDisplay: () => void;
  showMap: () => void;
} | null = null;

export function setGameRef(game: typeof gameRef): void {
  gameRef = game;
}

export const MetroMapGen = {
  generateNoVA(): MetroMapData {
    const cols = 200;
    const rows = 80;
    const grid: (Tile | null)[] = [];

    // Doubled x coords and radius, halved prices (1 tile = 1 edge DC footprint)
    const regions: RegionDef[] = [
      { name: 'Leesburg', cx: 32, cy: 8, radius: 16, available: true, priceBase: 400000 },
      { name: 'Purcellville', cx: 12, cy: 6, radius: 12, available: true, priceBase: 300000 },
      { name: 'Ashburn', cx: 60, cy: 16, radius: 24, available: true, priceBase: 1000000 },
      { name: 'Sterling', cx: 88, cy: 18, radius: 16, available: true, priceBase: 750000 },
      { name: 'Dulles', cx: 72, cy: 26, radius: 20, available: true, priceBase: 1100000 },
      { name: 'Herndon', cx: 104, cy: 22, radius: 12, available: true, priceBase: 700000 },
      { name: 'Reston', cx: 120, cy: 24, radius: 16, available: true, priceBase: 800000 },
      { name: 'Chantilly', cx: 80, cy: 36, radius: 16, available: true, priceBase: 650000 },
      { name: 'Centreville', cx: 64, cy: 40, radius: 16, available: true, priceBase: 500000 },
      { name: 'Gainesville', cx: 32, cy: 36, radius: 16, available: true, priceBase: 375000 },
      { name: 'Haymarket', cx: 16, cy: 40, radius: 12, available: true, priceBase: 325000 },
      { name: 'Manassas', cx: 48, cy: 48, radius: 20, available: true, priceBase: 550000 },
      { name: 'Warrenton', cx: 16, cy: 60, radius: 16, available: true, priceBase: 275000 },
      { name: 'Woodbridge', cx: 128, cy: 60, radius: 16, available: true, priceBase: 350000 },
      { name: 'Stafford', cx: 112, cy: 72, radius: 16, available: true, priceBase: 225000 },
      // Tysons is now available (premium pricing)
      { name: 'Tysons', cx: 140, cy: 28, radius: 16, available: true, priceBase: 1750000 },
      // Unavailable urban areas
      { name: 'McLean', cx: 160, cy: 24, radius: 12, available: false, priceBase: 0 },
      { name: 'Vienna', cx: 136, cy: 36, radius: 12, available: false, priceBase: 0 },
      { name: 'Fairfax', cx: 120, cy: 40, radius: 16, available: false, priceBase: 0 },
      { name: 'Falls Church', cx: 160, cy: 32, radius: 8, available: false, priceBase: 0 },
      { name: 'Arlington', cx: 176, cy: 28, radius: 16, available: false, priceBase: 0 },
      { name: 'Alexandria', cx: 176, cy: 44, radius: 16, available: false, priceBase: 0 },
      { name: 'Springfield', cx: 144, cy: 52, radius: 12, available: false, priceBase: 0 },
      { name: 'Burke', cx: 128, cy: 48, radius: 8, available: false, priceBase: 0 },
      { name: 'Annandale', cx: 152, cy: 40, radius: 8, available: false, priceBase: 0 },
    ];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let tile: Tile | null = null;

        for (const region of regions) {
          const dist = Math.sqrt(Math.pow(x - region.cx, 2) + Math.pow(y - region.cy, 2));
          if (dist <= region.radius) {
            const variation = (Math.random() - 0.5) * 0.4;
            const price = Math.round(region.priceBase * (1 + variation) / 10000) * 10000;
            tile = {
              id: `nova-${x}-${y}`,
              region: region.name,
              available: region.available,
              price: region.available ? price : 0
            };
            break;
          }
        }

        grid.push(tile);
      }
    }

    const labels: MapLabel[] = regions.map(r => ({
      name: r.name,
      x: r.cx * 15,
      y: r.cy * 29,
      major: ['Ashburn', 'Dulles', 'Tysons', 'Arlington', 'Manassas'].includes(r.name)
    }));

    return { name: 'Northern Virginia', cols, rows, grid, labels };
  }
};

export const MetroData: { [key: string]: MetroMapData } = {
  'nova': MetroMapGen.generateNoVA()
};

export const Metro = {
  currentMetro: null as string | null,
  mode: 'pan' as 'pan' | 'select',

  // Pan/zoom state
  panX: 0,
  panY: 0,
  zoom: 1,
  isPanning: false,
  lastMouseX: 0,
  lastMouseY: 0,

  // Selection state
  isSelecting: false,
  selectedTiles: [] as Tile[],
  tileElements: {} as { [key: string]: TileEntry },

  // DOM elements
  metroContent: null as HTMLElement | null,
  mapViewport: null as HTMLElement | null,
  mapWorld: null as HTMLElement | null,
  landGrid: null as HTMLElement | null,
  regionLabels: null as HTMLElement | null,
  backBtn: null as HTMLElement | null,
  selectionInfo: null as HTMLElement | null,
  selectionCount: null as HTMLElement | null,
  selectionTotal: null as HTMLElement | null,
  cancelBtn: null as HTMLElement | null,
  buyBtn: null as HTMLButtonElement | null,
  coordsDisplay: null as HTMLElement | null,
  modePan: null as HTMLElement | null,
  modeSelect: null as HTMLElement | null,
  zoomIn: null as HTMLElement | null,
  zoomOut: null as HTMLElement | null,

  init(): void {
    this.metroContent = document.getElementById('metro-content');
    this.mapViewport = document.getElementById('map-viewport');
    this.mapWorld = document.getElementById('map-world');
    this.landGrid = document.getElementById('land-grid');
    this.regionLabels = document.getElementById('region-labels');
    this.backBtn = document.getElementById('metro-back-btn');
    this.selectionInfo = document.getElementById('selection-info');
    this.selectionCount = document.getElementById('selection-count');
    this.selectionTotal = document.getElementById('selection-total');
    this.cancelBtn = document.getElementById('selection-cancel');
    this.buyBtn = document.getElementById('selection-buy') as HTMLButtonElement;
    this.coordsDisplay = document.getElementById('coords-display');
    this.modePan = document.getElementById('mode-pan');
    this.modeSelect = document.getElementById('mode-select');
    this.zoomIn = document.getElementById('zoom-in');
    this.zoomOut = document.getElementById('zoom-out');

    this.bindEvents();
  },

  bindEvents(): void {
    this.backBtn?.addEventListener('click', () => this.goBack());
    this.cancelBtn?.addEventListener('click', () => this.clearSelection());
    this.buyBtn?.addEventListener('click', () => this.buySelected());

    this.modePan?.addEventListener('click', () => this.setMode('pan'));
    this.modeSelect?.addEventListener('click', () => this.setMode('select'));

    this.zoomIn?.addEventListener('click', () => this.setZoom(this.zoom * 1.25));
    this.zoomOut?.addEventListener('click', () => this.setZoom(this.zoom / 1.25));

    this.mapViewport?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.setZoom(this.zoom * delta);
    });

    this.mapViewport?.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', () => this.onMouseUp());

    this.mapViewport?.addEventListener('mousemove', (e) => this.updateCoords(e));
  },

  setMode(mode: 'pan' | 'select'): void {
    this.mode = mode;
    this.modePan?.classList.toggle('active', mode === 'pan');
    this.modeSelect?.classList.toggle('active', mode === 'select');
    this.metroContent?.classList.toggle('selecting', mode === 'select');

    if (mode === 'pan') {
      this.clearSelection();
    }
  },

  setZoom(newZoom: number): void {
    this.zoom = Math.max(0.5, Math.min(3, newZoom));
    this.updateTransform();
  },

  updateTransform(): void {
    if (this.mapWorld) {
      this.mapWorld.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
  },

  onMouseDown(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('.map-controls') || target.closest('.mode-toggle') || target.closest('.selection-info')) return;

    if (this.mode === 'pan') {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.metroContent?.classList.add('dragging');
    } else if (this.mode === 'select') {
      this.isSelecting = true;
      const tile = target.closest('.land-tile.available') as HTMLElement;
      if (tile && tile.dataset.tileId) {
        const entry = this.tileElements[tile.dataset.tileId];
        if (entry) {
          this.toggleTileSelection(entry.tile, entry.el);
        }
      }
    }
  },

  onMouseMove(e: MouseEvent): void {
    if (this.isPanning) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.panX += dx;
      this.panY += dy;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.updateTransform();
    } else if (this.isSelecting && this.mode === 'select') {
      const tile = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (tile && tile.classList.contains('land-tile') && tile.classList.contains('available') && tile.dataset.tileId) {
        const entry = this.tileElements[tile.dataset.tileId];
        if (entry && !this.selectedTiles.find(t => t.id === entry.tile.id)) {
          this.addTileToSelection(entry.tile, entry.el);
        }
      }
    }
  },

  onMouseUp(): void {
    this.isPanning = false;
    this.isSelecting = false;
    this.metroContent?.classList.remove('dragging');
  },

  updateCoords(e: MouseEvent): void {
    if (!this.mapViewport || !this.coordsDisplay) return;
    const rect = this.mapViewport.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - this.panX) / this.zoom / 29);
    const y = Math.floor((e.clientY - rect.top - this.panY) / this.zoom / 29);
    this.coordsDisplay.textContent = `${x}, ${y}`;
  },

  show(metroId: string): void {
    this.currentMetro = metroId;
    const data = MetroData[metroId];

    this.clearSelection();

    this.panX = 100;
    this.panY = 50;
    this.zoom = 1;
    this.updateTransform();
    this.setMode('pan');

    this.renderGrid(data);
    this.renderLabels(data.labels);
  },

  goBack(): void {
    gameRef?.showMap();
  },

  renderGrid(data: MetroMapData): void {
    if (!this.landGrid) return;

    this.landGrid.innerHTML = '';
    this.landGrid.style.gridTemplateColumns = `repeat(${data.cols}, 28px)`;
    this.tileElements = {};

    data.grid.forEach((tile) => {
      const el = document.createElement('div');
      el.className = 'land-tile';

      if (tile) {
        const isOwned = gameRef?.ownedTiles.includes(tile.id) ?? false;

        if (isOwned) {
          el.classList.add('owned');
        } else if (tile.available) {
          el.classList.add('available');
          el.dataset.tileId = tile.id;
          this.tileElements[tile.id] = { el, tile };
        } else {
          el.classList.add('unavailable');
        }
      }

      this.landGrid!.appendChild(el);
    });
  },

  renderLabels(labels: MapLabel[]): void {
    if (!this.regionLabels) return;

    this.regionLabels.innerHTML = '';

    labels.forEach(label => {
      const el = document.createElement('div');
      el.className = 'region-label' + (label.major ? ' major' : '');
      el.textContent = label.name;
      el.style.left = label.x + 'px';
      el.style.top = label.y + 'px';
      this.regionLabels!.appendChild(el);
    });
  },

  toggleTileSelection(tile: Tile, el: HTMLElement): void {
    const index = this.selectedTiles.findIndex(t => t.id === tile.id);
    if (index === -1) {
      this.selectedTiles.push(tile);
      el.classList.add('selecting');
    } else {
      this.selectedTiles.splice(index, 1);
      el.classList.remove('selecting');
    }
    this.updateSelectionUI();
  },

  addTileToSelection(tile: Tile, el: HTMLElement): void {
    if (!this.selectedTiles.find(t => t.id === tile.id)) {
      this.selectedTiles.push(tile);
      el.classList.add('selecting');
      this.updateSelectionUI();
    }
  },

  clearSelection(): void {
    this.selectedTiles.forEach(tile => {
      const entry = this.tileElements[tile.id];
      if (entry) entry.el.classList.remove('selecting');
    });
    this.selectedTiles = [];
    this.updateSelectionUI();
  },

  updateSelectionUI(): void {
    const count = this.selectedTiles.length;
    const total = this.selectedTiles.reduce((sum, t) => sum + t.price, 0);

    if (this.selectionCount) this.selectionCount.textContent = String(count);
    if (this.selectionTotal) this.selectionTotal.textContent = '$' + Math.floor(total).toLocaleString();

    if (count > 0) {
      this.selectionInfo?.classList.add('active');
      if (this.buyBtn) {
        this.buyBtn.disabled = total > (gameRef?.capital ?? 0);
      }
    } else {
      this.selectionInfo?.classList.remove('active');
    }
  },

  async buySelected(): Promise<void> {
    if (!gameRef || !this.currentMetro) return;

    const gameId = session.getCurrentGameId();
    if (!gameId) {
      console.error('No game ID found');
      return;
    }

    const total = this.selectedTiles.reduce((sum, t) => sum + t.price, 0);

    if (total > gameRef.capital) {
      return;
    }

    // Prepare tiles for API
    const tiles = this.selectedTiles.map(tile => ({
      id: tile.id,
      region: tile.region,
      price: tile.price
    }));

    try {
      const result = await gamesApi.buyLand(gameId, this.currentMetro, tiles);

      // Update local state
      gameRef.capital = result.newCapital;
      this.selectedTiles.forEach(tile => {
        gameRef!.ownedTiles.push(tile.id);
      });

      gameRef.updateCapitalDisplay();
      this.selectedTiles = [];

      if (this.currentMetro) {
        this.renderGrid(MetroData[this.currentMetro]);
        this.renderLabels(MetroData[this.currentMetro].labels);
      }
      this.updateSelectionUI();
    } catch (err) {
      console.error('Failed to buy land:', err);
    }
  }
};
