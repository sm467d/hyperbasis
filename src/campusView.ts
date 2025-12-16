// Campus View - UI for managing a campus
import { Campus, CampusManager } from './campus';
import { Designs, DCSizeOptions, SPCNDesign } from './designs';

// Game reference for navigation
let gameRef: {
  showView: (view: 'na-map' | 'metro' | 'campus') => void;
  capital: number;
  updateCapitalDisplay: () => void;
} | null = null;

export function setCampusGameRef(game: typeof gameRef): void {
  gameRef = game;
}

export const CampusView = {
  currentCampus: null as Campus | null,
  placementMode: false,
  selectedDesign: null as SPCNDesign | null,
  placementPosition: null as { x: number; y: number } | null,

  // DOM elements
  view: null as HTMLElement | null,
  grid: null as HTMLElement | null,
  titleEl: null as HTMLElement | null,
  tilesEl: null as HTMLElement | null,
  dcsEl: null as HTMLElement | null,
  mwEl: null as HTMLElement | null,
  dcListEl: null as HTMLElement | null,
  buildModal: null as HTMLElement | null,
  designSelect: null as HTMLSelectElement | null,
  dcNameInput: null as HTMLInputElement | null,
  confirmBtn: null as HTMLButtonElement | null,

  init(): void {
    this.view = document.getElementById('view-campus');
    this.grid = document.getElementById('campus-grid');
    this.titleEl = document.getElementById('campus-title');
    this.tilesEl = document.getElementById('campus-tiles');
    this.dcsEl = document.getElementById('campus-dcs');
    this.mwEl = document.getElementById('campus-mw');
    this.dcListEl = document.getElementById('campus-dc-list');
    this.buildModal = document.getElementById('build-dc-modal');
    this.designSelect = document.getElementById('dc-design') as HTMLSelectElement;
    this.dcNameInput = document.getElementById('dc-name') as HTMLInputElement;
    this.confirmBtn = document.getElementById('confirm-build-dc') as HTMLButtonElement;

    this.bindEvents();
  },

  bindEvents(): void {
    document.getElementById('campus-back-btn')?.addEventListener('click', () => this.close());
    document.getElementById('build-dc-btn')?.addEventListener('click', () => this.openBuildModal());
    document.getElementById('cancel-build-dc')?.addEventListener('click', () => this.closeBuildModal());
    document.getElementById('confirm-build-dc')?.addEventListener('click', () => this.confirmBuild());

    this.designSelect?.addEventListener('change', () => this.onDesignChange());
  },

  open(campusId: string): void {
    const campus = CampusManager.campuses.find(c => c.id === campusId);
    if (!campus) return;

    this.currentCampus = campus;
    this.placementMode = false;
    this.selectedDesign = null;
    this.placementPosition = null;

    this.render();
    this.view?.classList.add('active');
  },

  close(): void {
    this.view?.classList.remove('active');
    this.currentCampus = null;
    gameRef?.showView('metro');
  },

  render(): void {
    if (!this.currentCampus) return;

    const stats = CampusManager.getCampusStats(this.currentCampus);

    // Update header
    if (this.titleEl) this.titleEl.textContent = this.currentCampus.name;
    if (this.tilesEl) this.tilesEl.textContent = String(stats.totalTiles);
    if (this.dcsEl) this.dcsEl.textContent = String(stats.dcCount);
    if (this.mwEl) this.mwEl.textContent = stats.totalMW.toFixed(1);

    this.renderGrid();
    this.renderDCList();
  },

  renderGrid(): void {
    if (!this.grid || !this.currentCampus) return;

    const campus = this.currentCampus;
    this.grid.innerHTML = '';
    this.grid.style.gridTemplateColumns = `repeat(${campus.width}, 40px)`;

    // Create grid cells
    for (let y = 0; y < campus.height; y++) {
      for (let x = 0; x < campus.width; x++) {
        const cell = document.createElement('div');
        cell.className = 'campus-cell';
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);

        // Check if this cell is part of a DC
        for (const dc of campus.datacenters) {
          if (x >= dc.position.x && x < dc.position.x + dc.size.w &&
              y >= dc.position.y && y < dc.position.y + dc.size.h) {
            cell.classList.add('dc');
            if (x === dc.position.x && y === dc.position.y) {
              cell.classList.add('dc-start');
              const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
              cell.title = `${dc.name}\n${design?.name || 'Unknown Design'}`;
            }
          }
        }

        // Click handler for placement mode
        cell.addEventListener('click', () => this.onCellClick(x, y));
        cell.addEventListener('mouseenter', () => this.onCellHover(x, y));

        this.grid.appendChild(cell);
      }
    }
  },

  renderDCList(): void {
    if (!this.dcListEl || !this.currentCampus) return;

    if (this.currentCampus.datacenters.length === 0) {
      this.dcListEl.innerHTML = '<div class="no-dcs">No DCs built yet</div>';
      return;
    }

    this.dcListEl.innerHTML = this.currentCampus.datacenters.map(dc => {
      const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
      const size = DCSizeOptions.find(s => s.id === design?.size);

      return `
        <div class="dc-card" data-dc-id="${dc.id}">
          <div class="dc-card-header">
            <span class="dc-card-name">${dc.name}</span>
            <span class="dc-card-size">${size?.name || 'Unknown'}</span>
          </div>
          <div class="dc-card-stats">
            <div class="dc-card-stat">
              <span class="dc-card-stat-value">${design?.totalMW?.toFixed(1) || 0}</span>
              <span class="dc-card-stat-label">MW</span>
            </div>
            <div class="dc-card-stat">
              <span class="dc-card-stat-value">${design?.totalRacks?.toLocaleString() || 0}</span>
              <span class="dc-card-stat-label">racks</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openBuildModal(): void {
    if (!this.buildModal || !this.designSelect) return;

    // Populate design options
    this.designSelect.innerHTML = '<option value="">Select a design...</option>';
    Designs.spcnDesigns.forEach(design => {
      const size = DCSizeOptions.find(s => s.id === design.size);
      this.designSelect!.innerHTML += `
        <option value="${design.id}">${design.name} (${size?.name})</option>
      `;
    });

    if (this.dcNameInput) {
      const dcNum = (this.currentCampus?.datacenters.length || 0) + 1;
      this.dcNameInput.value = `DC-${dcNum}`;
    }

    this.buildModal.classList.add('active');
  },

  closeBuildModal(): void {
    this.buildModal?.classList.remove('active');
    this.placementMode = false;
    this.selectedDesign = null;
    this.placementPosition = null;
    this.clearPlacementPreview();
  },

  onDesignChange(): void {
    const designId = this.designSelect?.value;
    if (!designId) {
      this.selectedDesign = null;
      this.placementMode = false;
      return;
    }

    this.selectedDesign = Designs.spcnDesigns.find(d => d.id === designId) || null;
    this.placementMode = true;
    this.placementPosition = null;

    if (this.confirmBtn) this.confirmBtn.disabled = true;
  },

  onCellClick(x: number, y: number): void {
    if (!this.placementMode || !this.selectedDesign || !this.currentCampus) return;

    // Get design size
    const sizeMap: { [key: string]: { w: number; h: number } } = {
      '1x1': { w: 1, h: 1 },
      '2x2': { w: 2, h: 2 },
      '4x4': { w: 4, h: 4 },
      '8x8': { w: 8, h: 8 },
    };
    const size = sizeMap[this.selectedDesign.size] || { w: 1, h: 1 };

    // Check if valid placement
    if (!this.isValidPlacement(x, y, size)) return;

    this.placementPosition = { x, y };
    this.showPlacementPreview(x, y, size, true);

    if (this.confirmBtn) this.confirmBtn.disabled = false;
  },

  onCellHover(x: number, y: number): void {
    if (!this.placementMode || !this.selectedDesign) return;

    const sizeMap: { [key: string]: { w: number; h: number } } = {
      '1x1': { w: 1, h: 1 },
      '2x2': { w: 2, h: 2 },
      '4x4': { w: 4, h: 4 },
      '8x8': { w: 8, h: 8 },
    };
    const size = sizeMap[this.selectedDesign.size] || { w: 1, h: 1 };

    const valid = this.isValidPlacement(x, y, size);
    this.showPlacementPreview(x, y, size, valid);
  },

  isValidPlacement(x: number, y: number, size: { w: number; h: number }): boolean {
    if (!this.currentCampus) return false;

    // Check bounds
    if (x + size.w > this.currentCampus.width || y + size.h > this.currentCampus.height) {
      return false;
    }

    // Check overlap with existing DCs
    for (const dc of this.currentCampus.datacenters) {
      if (!(x + size.w <= dc.position.x || dc.position.x + dc.size.w <= x ||
            y + size.h <= dc.position.y || dc.position.y + dc.size.h <= y)) {
        return false;
      }
    }

    return true;
  },

  showPlacementPreview(x: number, y: number, size: { w: number; h: number }, valid: boolean): void {
    this.clearPlacementPreview();

    if (!this.grid) return;

    for (let py = y; py < y + size.h && py < (this.currentCampus?.height || 0); py++) {
      for (let px = x; px < x + size.w && px < (this.currentCampus?.width || 0); px++) {
        const cell = this.grid.querySelector(`[data-x="${px}"][data-y="${py}"]`);
        if (cell) {
          cell.classList.add(valid ? 'dc-placeholder' : 'dc-invalid');
        }
      }
    }
  },

  clearPlacementPreview(): void {
    if (!this.grid) return;
    this.grid.querySelectorAll('.dc-placeholder, .dc-invalid').forEach(cell => {
      cell.classList.remove('dc-placeholder', 'dc-invalid');
    });
  },

  confirmBuild(): void {
    if (!this.currentCampus || !this.selectedDesign || !this.placementPosition) return;

    const name = this.dcNameInput?.value.trim() || 'Unnamed DC';

    // Check cost
    const cost = this.selectedDesign.buildCost;
    if (gameRef && cost > gameRef.capital) {
      alert(`Insufficient capital. Need $${(cost / 1_000_000).toFixed(0)}M`);
      return;
    }

    // Build the DC
    const dc = CampusManager.buildDatacenter(
      this.currentCampus.id,
      this.selectedDesign,
      name,
      this.placementPosition
    );

    if (dc) {
      // Deduct cost
      if (gameRef) {
        gameRef.capital -= cost;
        gameRef.updateCapitalDisplay();
      }

      this.closeBuildModal();
      this.render();
    } else {
      alert('Failed to build datacenter. Check placement.');
    }
  }
};
