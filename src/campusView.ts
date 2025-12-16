// Campus View - UI for managing a campus with new placement flow
import { Campus, CampusManager, Datacenter } from './campus';
import { Designs, DCSizeOptions, SPCNDesign } from './designs';

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
// ============================================

export const DCView = {
  currentCampus: null as Campus | null,
  currentDC: null as Datacenter | null,
  selectedRackDesign: null as any | null,
  rackCount: 1,

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
  placementConfirm: null as HTMLElement | null,
  placementLabel: null as HTMLElement | null,
  placementCost: null as HTMLElement | null,

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
    this.placementConfirm = document.getElementById('rack-placement-confirm');
    this.placementLabel = document.getElementById('rack-placement-label');
    this.placementCost = document.getElementById('rack-placement-cost');

    this.bindEvents();
  },

  bindEvents(): void {
    document.getElementById('dc-back-btn')?.addEventListener('click', () => this.close());
    document.getElementById('confirm-rack-place')?.addEventListener('click', () => this.confirmPlacement());
    document.getElementById('cancel-rack-place')?.addEventListener('click', () => this.cancelPlacement());
    document.getElementById('goto-design-tab-2')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
      CampusView.close();
      gameRef?.switchTab('design');
    });
  },

  open(campus: Campus, dc: Datacenter): void {
    this.currentCampus = campus;
    this.currentDC = dc;
    this.selectedRackDesign = null;
    this.rackCount = 1;
    this.hidePlacementConfirm();

    this.render();
    this.view?.classList.add('active');
  },

  close(): void {
    this.view?.classList.remove('active');
    this.currentDC = null;
    gameRef?.showView('campus');
  },

  render(): void {
    if (!this.currentDC) return;

    const design = Designs.spcnDesigns.find(d => d.id === this.currentDC!.designId);
    const totalRacks = design?.totalRacks || 0;
    const totalMW = design?.totalMW || 0;

    // Calculate used racks and MW
    let usedRacks = 0;
    let usedMW = 0;
    for (const installed of this.currentDC.installedRacks) {
      const rackDesign = Designs.rackDesigns.find(r => r.id === installed.designId);
      if (rackDesign) {
        usedRacks += installed.count;
        usedMW += (rackDesign.kwPerRack * installed.count) / 1000;
      }
    }

    // Update header
    if (this.titleEl) this.titleEl.textContent = this.currentDC.name;
    if (this.racksUsedEl) this.racksUsedEl.textContent = String(usedRacks);
    if (this.racksTotalEl) this.racksTotalEl.textContent = String(totalRacks);
    if (this.mwUsedEl) this.mwUsedEl.textContent = usedMW.toFixed(1);
    if (this.mwTotalEl) this.mwTotalEl.textContent = totalMW.toFixed(1);

    this.renderGrid(usedRacks, totalRacks);
    this.renderDesignPicker();
    this.renderRackList();
  },

  renderGrid(usedRacks: number, totalRacks: number): void {
    if (!this.grid || !this.currentDC) return;

    // Create a visual representation of rack slots
    // Use a grid of 10 columns
    const cols = 10;

    this.grid.innerHTML = '';
    this.grid.style.gridTemplateColumns = `repeat(${cols}, 24px)`;

    for (let i = 0; i < totalRacks; i++) {
      const slot = document.createElement('div');
      slot.className = 'rack-slot';
      if (i < usedRacks) {
        slot.classList.add('rack-filled');
      } else {
        slot.classList.add('rack-empty');
      }
      this.grid.appendChild(slot);
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
      return `
        <div class="design-pick-card ${isSelected ? 'selected' : ''}" data-design-id="${d.id}">
          <div class="design-pick-name">${d.name}</div>
          <div class="design-pick-specs">
            <span>${d.kwPerRack.toFixed(1)} kW</span>
            <span>$${(d.revenuePerRack / 1000).toFixed(0)}K/mo</span>
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

  renderRackList(): void {
    if (!this.rackList || !this.currentDC) return;

    const installed = this.currentDC.installedRacks;
    if (installed.length === 0) {
      this.rackList.innerHTML = '<div class="empty-list">No racks installed yet</div>';
      return;
    }

    this.rackList.innerHTML = installed.map(inst => {
      const design = Designs.rackDesigns.find(d => d.id === inst.designId);
      return `
        <div class="built-item">
          <div class="built-item-name">${design?.name || 'Unknown'}</div>
          <div class="built-item-specs">
            <span>x${inst.count}</span>
            <span>${((design?.kwPerRack || 0) * inst.count / 1000).toFixed(2)} MW</span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectDesign(designId: string | null): void {
    if (designId) {
      this.selectedRackDesign = Designs.rackDesigns.find(d => d.id === designId) || null;
      if (this.selectedRackDesign) {
        this.showPlacementConfirm();
      }
    } else {
      this.selectedRackDesign = null;
      this.hidePlacementConfirm();
    }
    this.renderDesignPicker();
  },

  showPlacementConfirm(): void {
    if (!this.placementConfirm || !this.selectedRackDesign || !this.currentDC) return;

    // Calculate available slots
    const design = Designs.spcnDesigns.find(d => d.id === this.currentDC!.designId);
    const totalRacks = design?.totalRacks || 0;
    let usedRacks = 0;
    for (const inst of this.currentDC.installedRacks) {
      usedRacks += inst.count;
    }
    const available = totalRacks - usedRacks;

    if (available <= 0) {
      alert('No rack slots available');
      this.hidePlacementConfirm();
      return;
    }

    // Default to filling all available or 10, whichever is smaller
    this.rackCount = Math.min(available, 10);

    this.updatePlacementInfo();
    this.placementConfirm.classList.add('active');
  },

  updatePlacementInfo(): void {
    if (this.placementLabel) {
      this.placementLabel.textContent = `x${this.rackCount}`;
    }
    // For now, rack installation is free (just takes up slots)
    if (this.placementCost) {
      this.placementCost.textContent = `${(this.selectedRackDesign?.kwPerRack * this.rackCount / 1000).toFixed(2)} MW`;
    }
  },

  hidePlacementConfirm(): void {
    this.placementConfirm?.classList.remove('active');
  },

  confirmPlacement(): void {
    if (!this.currentDC || !this.selectedRackDesign || !this.currentCampus) return;

    // Check MW capacity
    const dcDesign = Designs.spcnDesigns.find(d => d.id === this.currentDC!.designId);
    const totalMW = dcDesign?.totalMW || 0;
    let usedMW = 0;
    for (const inst of this.currentDC.installedRacks) {
      const rd = Designs.rackDesigns.find(r => r.id === inst.designId);
      if (rd) usedMW += (rd.kwPerRack * inst.count) / 1000;
    }
    const newMW = (this.selectedRackDesign.kwPerRack * this.rackCount) / 1000;

    if (usedMW + newMW > totalMW) {
      alert(`Insufficient power capacity. Need ${newMW.toFixed(2)} MW, have ${(totalMW - usedMW).toFixed(2)} MW available.`);
      return;
    }

    // Add racks
    const existing = this.currentDC.installedRacks.find(r => r.designId === this.selectedRackDesign.id);
    if (existing) {
      existing.count += this.rackCount;
    } else {
      this.currentDC.installedRacks.push({
        designId: this.selectedRackDesign.id,
        count: this.rackCount
      });
    }

    this.selectedRackDesign = null;
    this.hidePlacementConfirm();
    this.render();
  },

  cancelPlacement(): void {
    this.selectedRackDesign = null;
    this.hidePlacementConfirm();
    this.renderDesignPicker();
  }
};
