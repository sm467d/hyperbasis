// Campus View - UI for managing a campus with new placement flow
import { Campus, CampusManager, Datacenter } from './campus';
import { Designs, DCSizeOptions, SPCNDesign, RackDesign } from './designs';

// Game reference for navigation
let gameRef: {
  showView: (view: 'na-map' | 'metro' | 'campus' | 'dc') => void;
  switchTab: (tab: string) => void;
  capital: number;
  updateCapitalDisplay: () => void;
} | null = null;

export function setCampusGameRef(game: typeof gameRef): void {
  gameRef = game;
}

export const CampusView = {
  currentCampus: null as Campus | null,
  selectedDesign: null as SPCNDesign | null,
  placementPosition: null as { x: number; y: number } | null,
  hoverPosition: null as { x: number; y: number } | null,

  // DOM elements
  view: null as HTMLElement | null,
  grid: null as HTMLElement | null,
  titleEl: null as HTMLElement | null,
  tilesEl: null as HTMLElement | null,
  dcsEl: null as HTMLElement | null,
  mwEl: null as HTMLElement | null,
  designPicker: null as HTMLElement | null,
  dcList: null as HTMLElement | null,
  placementConfirm: null as HTMLElement | null,
  dcNameInput: null as HTMLInputElement | null,
  placementCost: null as HTMLElement | null,

  init(): void {
    this.view = document.getElementById('view-campus');
    this.grid = document.getElementById('campus-grid');
    this.titleEl = document.getElementById('campus-title');
    this.tilesEl = document.getElementById('campus-tiles');
    this.dcsEl = document.getElementById('campus-dcs');
    this.mwEl = document.getElementById('campus-mw');
    this.designPicker = document.getElementById('dc-design-picker');
    this.dcList = document.getElementById('campus-dc-list');
    this.placementConfirm = document.getElementById('placement-confirm');
    this.dcNameInput = document.getElementById('dc-name') as HTMLInputElement;
    this.placementCost = document.getElementById('placement-cost');

    this.bindEvents();
  },

  bindEvents(): void {
    document.getElementById('campus-back-btn')?.addEventListener('click', () => this.close());
    document.getElementById('confirm-place')?.addEventListener('click', () => this.confirmPlacement());
    document.getElementById('cancel-place')?.addEventListener('click', () => this.cancelPlacement());
    document.getElementById('goto-design-tab')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
      gameRef?.switchTab('design');
    });

    // ESC to cancel placement
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.selectedDesign) {
        this.cancelPlacement();
      }
    });
  },

  open(campusId: string): void {
    const campus = CampusManager.campuses.find(c => c.id === campusId);
    if (!campus) return;

    this.currentCampus = campus;
    this.selectedDesign = null;
    this.placementPosition = null;
    this.hoverPosition = null;
    this.hidePlacementConfirm();

    this.render();
    this.view?.classList.add('active');
  },

  close(): void {
    this.view?.classList.remove('active');
    this.currentCampus = null;
    this.selectedDesign = null;
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
    this.renderDesignPicker();
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
        const dc = this.getDCAtPosition(x, y);
        if (dc) {
          cell.classList.add('dc-occupied');
          if (x === dc.position.x && y === dc.position.y) {
            cell.classList.add('dc-origin');
            cell.innerHTML = `<span class="dc-label">${dc.name}</span>`;
          }
          cell.addEventListener('click', () => this.openDC(dc));
        } else {
          // Empty cell - can place DC here
          cell.addEventListener('click', () => this.onCellClick(x, y));
        }

        cell.addEventListener('mouseenter', () => this.onCellHover(x, y));
        cell.addEventListener('mouseleave', () => this.onCellLeave());

        this.grid.appendChild(cell);
      }
    }
  },

  getDCAtPosition(x: number, y: number): Datacenter | null {
    if (!this.currentCampus) return null;
    for (const dc of this.currentCampus.datacenters) {
      if (x >= dc.position.x && x < dc.position.x + dc.size.w &&
          y >= dc.position.y && y < dc.position.y + dc.size.h) {
        return dc;
      }
    }
    return null;
  },

  renderDesignPicker(): void {
    if (!this.designPicker) return;

    const designs = Designs.spcnDesigns;
    if (designs.length === 0) {
      this.designPicker.innerHTML = '<div class="empty-designs">No DC designs yet. <a href="#" id="goto-design-tab">Create one</a></div>';
      document.getElementById('goto-design-tab')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
        gameRef?.switchTab('design');
      });
      return;
    }

    this.designPicker.innerHTML = designs.map(d => {
      const size = DCSizeOptions.find(s => s.id === d.size);
      const isSelected = this.selectedDesign?.id === d.id;
      return `
        <div class="design-pick-card ${isSelected ? 'selected' : ''}" data-design-id="${d.id}">
          <div class="design-pick-name">${d.name}</div>
          <div class="design-pick-specs">
            <span>${size?.name.split(' ')[0] || d.size}</span>
            <span>${d.totalMW.toFixed(1)} MW</span>
            <span>$${(d.buildCost / 1_000_000).toFixed(0)}M</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind click handlers
    this.designPicker.querySelectorAll('.design-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        const designId = (card as HTMLElement).dataset.designId;
        this.selectDesign(designId || null);
      });
    });
  },

  renderDCList(): void {
    if (!this.dcList || !this.currentCampus) return;

    const dcs = this.currentCampus.datacenters;
    if (dcs.length === 0) {
      this.dcList.innerHTML = '<div class="empty-list">No DCs built yet</div>';
      return;
    }

    this.dcList.innerHTML = dcs.map(dc => {
      const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
      return `
        <div class="built-item" data-dc-id="${dc.id}">
          <div class="built-item-name">${dc.name}</div>
          <div class="built-item-specs">
            <span>${design?.name || 'Unknown'}</span>
            <span>${design?.totalMW.toFixed(1) || 0} MW</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind click handlers to open DC view
    this.dcList.querySelectorAll('.built-item').forEach(item => {
      item.addEventListener('click', () => {
        const dcId = (item as HTMLElement).dataset.dcId;
        const dc = this.currentCampus?.datacenters.find(d => d.id === dcId);
        if (dc) this.openDC(dc);
      });
    });
  },

  selectDesign(designId: string | null): void {
    if (designId) {
      this.selectedDesign = Designs.spcnDesigns.find(d => d.id === designId) || null;
    } else {
      this.selectedDesign = null;
    }
    this.placementPosition = null;
    this.hidePlacementConfirm();
    this.renderDesignPicker();
    this.clearPreview();
  },

  onCellClick(x: number, y: number): void {
    if (!this.selectedDesign || !this.currentCampus) return;

    const size = this.getDesignSize(this.selectedDesign);
    if (!this.isValidPlacement(x, y, size)) return;

    // Set placement position and show confirmation
    this.placementPosition = { x, y };
    this.showPlacementConfirm();
    this.showPreview(x, y, size, true, true);
  },

  onCellHover(x: number, y: number): void {
    if (!this.selectedDesign || this.placementPosition) return;

    this.hoverPosition = { x, y };
    const size = this.getDesignSize(this.selectedDesign);
    const valid = this.isValidPlacement(x, y, size);
    this.showPreview(x, y, size, valid, false);
  },

  onCellLeave(): void {
    if (!this.placementPosition) {
      this.hoverPosition = null;
      this.clearPreview();
    }
  },

  getDesignSize(design: SPCNDesign): { w: number; h: number } {
    const sizeMap: { [key: string]: { w: number; h: number } } = {
      '1x1': { w: 1, h: 1 },
      '2x2': { w: 2, h: 2 },
      '4x4': { w: 4, h: 4 },
      '8x8': { w: 8, h: 8 },
    };
    return sizeMap[design.size] || { w: 1, h: 1 };
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

  showPreview(x: number, y: number, size: { w: number; h: number }, valid: boolean, locked: boolean): void {
    this.clearPreview();
    if (!this.grid || !this.currentCampus) return;

    for (let py = y; py < y + size.h && py < this.currentCampus.height; py++) {
      for (let px = x; px < x + size.w && px < this.currentCampus.width; px++) {
        const cell = this.grid.querySelector(`[data-x="${px}"][data-y="${py}"]`);
        if (cell && !cell.classList.contains('dc-occupied')) {
          if (locked) {
            cell.classList.add('dc-preview-locked');
          } else {
            cell.classList.add(valid ? 'dc-preview-valid' : 'dc-preview-invalid');
          }
        }
      }
    }
  },

  clearPreview(): void {
    if (!this.grid) return;
    this.grid.querySelectorAll('.dc-preview-valid, .dc-preview-invalid, .dc-preview-locked').forEach(cell => {
      cell.classList.remove('dc-preview-valid', 'dc-preview-invalid', 'dc-preview-locked');
    });
  },

  showPlacementConfirm(): void {
    if (!this.placementConfirm || !this.selectedDesign) return;

    const dcNum = (this.currentCampus?.datacenters.length || 0) + 1;
    if (this.dcNameInput) this.dcNameInput.value = `DC-${dcNum}`;
    if (this.placementCost) {
      this.placementCost.textContent = `$${(this.selectedDesign.buildCost / 1_000_000).toFixed(0)}M`;
    }

    this.placementConfirm.classList.add('active');
  },

  hidePlacementConfirm(): void {
    this.placementConfirm?.classList.remove('active');
  },

  confirmPlacement(): void {
    if (!this.currentCampus || !this.selectedDesign || !this.placementPosition) return;

    const name = this.dcNameInput?.value.trim() || 'Unnamed DC';
    const cost = this.selectedDesign.buildCost;

    // Check cost
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

      this.placementPosition = null;
      this.selectedDesign = null;
      this.hidePlacementConfirm();
      this.render();
    } else {
      alert('Failed to build datacenter. Check placement.');
    }
  },

  cancelPlacement(): void {
    this.placementPosition = null;
    this.hidePlacementConfirm();
    this.clearPreview();
    // Keep design selected for another placement attempt
  },

  openDC(dc: Datacenter): void {
    // Open the DC view for rack placement
    DCView.open(this.currentCampus!, dc);
    gameRef?.showView('dc');
  }
};

// ============================================
// DC View - For placing racks inside a DC
// Click-to-place system matching DC placement flow
// ============================================

// Floor constants
const TILES_PER_FLOOR = 100;  // Up to 100 tiles per floor for standard DCs
const RACKS_PER_TILE = 50;    // 50 racks per tile

export const DCView = {
  currentCampus: null as Campus | null,
  currentDC: null as Datacenter | null,
  selectedRackDesign: null as RackDesign | null,
  hoverSlot: null as number | null,
  currentFloor: 1,
  totalFloors: 1,
  racksPerFloor: 50,

  // DOM elements
  view: null as HTMLElement | null,
  grid: null as HTMLElement | null,
  titleEl: null as HTMLElement | null,
  racksUsedEl: null as HTMLElement | null,
  racksTotalEl: null as HTMLElement | null,
  mwUsedEl: null as HTMLElement | null,
  mwTotalEl: null as HTMLElement | null,
  designPicker: null as HTMLElement | null,
  rackList: null as HTMLElement | null,
  floorSelector: null as HTMLElement | null,

  init(): void {
    this.view = document.getElementById('view-dc');
    this.grid = document.getElementById('dc-grid');
    this.titleEl = document.getElementById('dc-title');
    this.racksUsedEl = document.getElementById('dc-racks-used');
    this.racksTotalEl = document.getElementById('dc-racks-total');
    this.mwUsedEl = document.getElementById('dc-mw-used');
    this.mwTotalEl = document.getElementById('dc-mw-total');
    this.designPicker = document.getElementById('rack-design-picker');
    this.rackList = document.getElementById('dc-rack-list');
    this.floorSelector = document.getElementById('dc-floor-selector');

    this.bindEvents();
  },

  // Calculate floor info for a DC
  getFloorInfo(dc: Datacenter): { totalFloors: number; racksPerFloor: number; isEdge: boolean } {
    const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
    const totalRacks = dc.rackSlots?.length || design?.totalRacks || 50;
    const isEdge = design?.size === '1x1';

    if (isEdge) {
      // Edge DC: single floor with all racks (50)
      return { totalFloors: 1, racksPerFloor: totalRacks, isEdge: true };
    }

    // Standard DCs: up to 100 tiles per floor = 5000 racks per floor
    const maxRacksPerFloor = TILES_PER_FLOOR * RACKS_PER_TILE;
    const totalFloors = Math.ceil(totalRacks / maxRacksPerFloor);
    const racksPerFloor = totalFloors === 1 ? totalRacks : maxRacksPerFloor;

    return { totalFloors, racksPerFloor, isEdge: false };
  },

  // Get rack slot range for a specific floor
  getFloorSlotRange(floor: number): { start: number; end: number } {
    if (!this.currentDC) return { start: 0, end: 0 };

    const totalRacks = this.currentDC.rackSlots?.length || 0;
    const { racksPerFloor, isEdge } = this.getFloorInfo(this.currentDC);

    if (isEdge || this.totalFloors === 1) {
      return { start: 0, end: totalRacks };
    }

    const start = (floor - 1) * racksPerFloor;
    const end = Math.min(floor * racksPerFloor, totalRacks);

    return { start, end };
  },

  bindEvents(): void {
    document.getElementById('dc-back-btn')?.addEventListener('click', () => this.close());
    document.getElementById('goto-design-tab-2')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
      CampusView.close();
      gameRef?.switchTab('design');
    });

    // ESC to deselect design
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.selectedRackDesign && this.view?.classList.contains('active')) {
        this.selectedRackDesign = null;
        this.renderDesignPicker();
        this.renderGrid();
      }
    });
  },

  open(campus: Campus, dc: Datacenter): void {
    this.currentCampus = campus;
    this.currentDC = dc;
    this.selectedRackDesign = null;
    this.hoverSlot = null;

    // Initialize floor info
    const floorInfo = this.getFloorInfo(dc);
    this.totalFloors = floorInfo.totalFloors;
    this.racksPerFloor = floorInfo.racksPerFloor;
    this.currentFloor = 1;

    this.render();
    this.view?.classList.add('active');
  },

  close(): void {
    this.view?.classList.remove('active');
    this.currentDC = null;
    this.selectedRackDesign = null;
    gameRef?.showView('campus');
  },

  render(): void {
    if (!this.currentDC) return;

    const stats = CampusManager.getDCStats(this.currentDC);

    // Update header
    if (this.titleEl) this.titleEl.textContent = this.currentDC.name;
    if (this.racksUsedEl) this.racksUsedEl.textContent = String(stats.usedSlots);
    if (this.racksTotalEl) this.racksTotalEl.textContent = String(stats.totalSlots);
    if (this.mwUsedEl) this.mwUsedEl.textContent = stats.usedMW.toFixed(1);
    if (this.mwTotalEl) this.mwTotalEl.textContent = stats.totalMW.toFixed(1);

    this.renderFloorSelector();
    this.renderGrid();
    this.renderDesignPicker();
    this.renderRackList();
  },

  renderFloorSelector(): void {
    if (!this.floorSelector) return;

    // Build floor buttons (show floors in reverse order - top floor first)
    let html = '<div class="floor-label">Floor</div>';

    for (let f = this.totalFloors; f >= 1; f--) {
      const isActive = f === this.currentFloor;
      html += `
        <button class="floor-btn ${isActive ? 'active' : ''}" data-floor="${f}">
          <span class="floor-num">${f}</span>
        </button>
      `;
    }

    this.floorSelector.innerHTML = html;

    // Bind click handlers
    this.floorSelector.querySelectorAll('.floor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const floor = parseInt((btn as HTMLElement).dataset.floor || '1', 10);
        this.selectFloor(floor);
      });
    });
  },

  selectFloor(floor: number): void {
    if (floor < 1 || floor > this.totalFloors) return;
    this.currentFloor = floor;
    this.renderFloorSelector();
    this.renderGrid();
  },

  renderGrid(): void {
    if (!this.grid || !this.currentDC) return;

    const dc = this.currentDC;
    // Safety check for rackSlots
    if (!dc.rackSlots) {
      const design = Designs.spcnDesigns.find(d => d.id === dc.designId);
      dc.rackSlots = new Array(design?.totalRacks || 50).fill(null);
    }

    // Get slot range for current floor
    const { start, end } = this.getFloorSlotRange(this.currentFloor);

    // Use a grid of 10 columns
    const cols = 10;

    this.grid.innerHTML = '';
    this.grid.style.gridTemplateColumns = `repeat(${cols}, 24px)`;

    // Only render slots for the current floor
    for (let i = start; i < end; i++) {
      const slot = document.createElement('div');
      slot.className = 'rack-slot';
      slot.dataset.slot = String(i);

      const designId = dc.rackSlots[i];

      if (designId !== null) {
        // Slot is filled
        slot.classList.add('rack-filled');
        const rackDesign = Designs.rackDesigns.find(r => r.id === designId);
        if (rackDesign) {
          // Color code by rack type
          slot.classList.add(`rack-type-${rackDesign.type}`);
          slot.title = `${rackDesign.name} (${rackDesign.kwPerRack.toFixed(1)} kW)`;
        }
      } else {
        // Slot is empty
        slot.classList.add('rack-empty');

        // If a design is selected, make this slot clickable
        if (this.selectedRackDesign) {
          slot.classList.add('rack-placeable');
          slot.addEventListener('click', () => this.onSlotClick(i));
          slot.addEventListener('mouseenter', () => this.onSlotHover(i));
          slot.addEventListener('mouseleave', () => this.onSlotLeave());
        }
      }

      // Show hover preview
      if (this.hoverSlot === i && this.selectedRackDesign) {
        slot.classList.add('rack-preview');
      }

      this.grid.appendChild(slot);
    }
  },

  onSlotClick(slotIndex: number): void {
    if (!this.selectedRackDesign || !this.currentDC || !this.currentCampus) return;

    // Check MW capacity before placing
    const stats = CampusManager.getDCStats(this.currentDC);
    const newMW = this.selectedRackDesign.kwPerRack / 1000;

    if (stats.usedMW + newMW > stats.totalMW) {
      alert(`Insufficient power capacity. Need ${newMW.toFixed(2)} MW, have ${(stats.totalMW - stats.usedMW).toFixed(2)} MW available.`);
      return;
    }

    // Check if player can afford the rack (CapEx)
    const cost = this.selectedRackDesign.capexPerRack;
    if (gameRef && cost > gameRef.capital) {
      alert(`Insufficient capital. Need $${(cost / 1000).toFixed(0)}K`);
      return;
    }

    // Install the rack
    const success = CampusManager.installRack(
      this.currentCampus.id,
      this.currentDC.id,
      slotIndex,
      this.selectedRackDesign.id
    );

    if (success) {
      // Deduct cost
      if (gameRef) {
        gameRef.capital -= cost;
        gameRef.updateCapitalDisplay();
      }
      this.hoverSlot = null;
      this.render();
    }
  },

  onSlotHover(slotIndex: number): void {
    if (!this.selectedRackDesign) return;
    this.hoverSlot = slotIndex;
    this.renderGrid();
  },

  onSlotLeave(): void {
    if (this.hoverSlot !== null) {
      this.hoverSlot = null;
      this.renderGrid();
    }
  },

  renderDesignPicker(): void {
    if (!this.designPicker) return;

    const designs = Designs.rackDesigns;
    if (designs.length === 0) {
      this.designPicker.innerHTML = '<div class="empty-designs">No rack designs yet. <a href="#" id="goto-design-tab-2">Create one</a></div>';
      document.getElementById('goto-design-tab-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
        CampusView.close();
        gameRef?.switchTab('design');
      });
      return;
    }

    this.designPicker.innerHTML = designs.map(d => {
      const isSelected = this.selectedRackDesign?.id === d.id;
      const costStr = d.capexPerRack >= 1000 ? `$${(d.capexPerRack / 1000).toFixed(0)}K` : `$${d.capexPerRack}`;
      return `
        <div class="design-pick-card ${isSelected ? 'selected' : ''}" data-design-id="${d.id}">
          <div class="design-pick-name">${d.name}</div>
          <div class="design-pick-specs">
            <span>${d.kwPerRack.toFixed(1)} kW</span>
            <span>${costStr}</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind click handlers
    this.designPicker.querySelectorAll('.design-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        const designId = (card as HTMLElement).dataset.designId;
        this.selectDesign(designId || null);
      });
    });
  },

  selectDesign(designId: string | null): void {
    if (designId) {
      const design = Designs.rackDesigns.find(d => d.id === designId);
      // Toggle selection
      if (this.selectedRackDesign?.id === designId) {
        this.selectedRackDesign = null;
      } else {
        this.selectedRackDesign = design || null;
      }
    } else {
      this.selectedRackDesign = null;
    }
    this.hoverSlot = null;
    this.renderDesignPicker();
    this.renderGrid();
  },

  renderRackList(): void {
    if (!this.rackList || !this.currentDC) return;

    // Safety check for rackSlots
    const rackSlots = this.currentDC.rackSlots || [];

    // Count racks by design
    const rackCounts: { [designId: string]: number } = {};
    for (const designId of rackSlots) {
      if (designId !== null) {
        rackCounts[designId] = (rackCounts[designId] || 0) + 1;
      }
    }

    const entries = Object.entries(rackCounts);
    if (entries.length === 0) {
      this.rackList.innerHTML = '<div class="empty-list">No racks installed yet</div>';
      return;
    }

    this.rackList.innerHTML = entries.map(([designId, count]) => {
      const design = Designs.rackDesigns.find(d => d.id === designId);
      return `
        <div class="built-item">
          <div class="built-item-name">${design?.name || 'Unknown'}</div>
          <div class="built-item-specs">
            <span>x${count}</span>
            <span>${((design?.kwPerRack || 0) * count / 1000).toFixed(2)} MW</span>
          </div>
        </div>
      `;
    }).join('');
  }
};
