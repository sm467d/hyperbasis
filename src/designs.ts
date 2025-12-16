// Design System - SPCN (DC Infrastructure) and Rack Configurations
import { Research } from './research';

// ============================================
// SPCN Design Options (gated by research)
// ============================================

export const CoolingOptions = [
  { id: 'air', name: 'Air (CRAC)', pue: 1.8, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 1 } },
  { id: 'hotcold', name: 'Hot/Cold Aisle', pue: 1.5, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 2 } },
  { id: 'liquid', name: 'Rear-Door Liquid', pue: 1.3, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 3 } },
  { id: 'direct', name: 'Direct-to-Chip', pue: 1.15, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 4 } },
  { id: 'immersion', name: 'Immersion', pue: 1.05, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 5 } },
];

export const PowerDensityOptions = [
  { id: '5kw', name: '5 kW/rack', kw: 5, researchRequired: { branch: 'infrastructure', sub: 'power', level: 1 } },
  { id: '10kw', name: '10 kW/rack', kw: 10, researchRequired: { branch: 'infrastructure', sub: 'power', level: 2 } },
  { id: '20kw', name: '20 kW/rack', kw: 20, researchRequired: { branch: 'infrastructure', sub: 'power', level: 3 } },
  { id: '50kw', name: '50 kW/rack', kw: 50, researchRequired: { branch: 'infrastructure', sub: 'power', level: 4 } },
  { id: '100kw', name: '100 kW/rack', kw: 100, researchRequired: { branch: 'infrastructure', sub: 'power', level: 5 } },
];

export const NetworkOptions = [
  { id: '10g', name: '10 GbE', speed: 10, researchRequired: { branch: 'infrastructure', sub: 'network', level: 1 } },
  { id: '25g', name: '25 GbE', speed: 25, researchRequired: { branch: 'infrastructure', sub: 'network', level: 2 } },
  { id: '100g', name: '100 GbE', speed: 100, researchRequired: { branch: 'infrastructure', sub: 'network', level: 3 } },
  { id: '400g', name: '400 GbE', speed: 400, researchRequired: { branch: 'infrastructure', sub: 'network', level: 4 } },
  { id: 'fabric', name: 'AI Fabric', speed: 800, researchRequired: { branch: 'infrastructure', sub: 'network', level: 5 } },
];

// Power redundancy - not research gated, just affects cost and reliability
export const PowerRedundancyOptions = [
  { id: 'n', name: 'N', costMult: 1.0, reliability: 20 },
  { id: 'n1', name: 'N+1', costMult: 1.3, reliability: 50 },
  { id: '2n', name: '2N', costMult: 1.8, reliability: 80 },
  { id: '2n1', name: '2N+1', costMult: 2.2, reliability: 95 },
];

// DC Size options - footprint in tiles
export const DCSizeOptions = [
  { id: '1x1', name: '1×1 (Edge)', tiles: 1, racksPerTile: 50 },
  { id: '2x2', name: '2×2 (Standard)', tiles: 4, racksPerTile: 80 },
  { id: '4x4', name: '4×4 (Regional)', tiles: 16, racksPerTile: 120 },
  { id: '8x8', name: '8×8 (Hyperscaler)', tiles: 64, racksPerTile: 160 },
];

// ============================================
// Rack Type Options (gated by research)
// ============================================

export const RackTypeOptions = [
  {
    id: 'storage',
    name: 'Storage',
    tiers: [
      { id: 'hdd', name: 'HDD Arrays', kwPerNode: 0.15, revenuePerNode: 100, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 1 } },
      { id: 'hybrid', name: 'Hybrid Storage', kwPerNode: 0.2, revenuePerNode: 175, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 2 } },
      { id: 'ssd', name: 'SSD Arrays', kwPerNode: 0.25, revenuePerNode: 300, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 3 } },
      { id: 'nvme', name: 'NVMe Flash', kwPerNode: 0.3, revenuePerNode: 500, minNodes: 8, maxNodes: 36, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 4 } },
      { id: 'scm', name: 'SCM/Optane', kwPerNode: 0.35, revenuePerNode: 750, minNodes: 8, maxNodes: 36, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 5 } },
    ]
  },
  {
    id: 'compute',
    name: 'Compute',
    tiers: [
      { id: 'basic', name: 'Basic Servers', kwPerNode: 0.3, revenuePerNode: 150, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'compute', level: 1 } },
      { id: 'midrange', name: 'Mid-Range', kwPerNode: 0.5, revenuePerNode: 250, minNodes: 10, maxNodes: 42, defaultNodes: 16, researchRequired: { branch: 'hardware', sub: 'compute', level: 2 } },
      { id: 'highcore', name: 'High-Core', kwPerNode: 0.8, revenuePerNode: 400, minNodes: 8, maxNodes: 32, defaultNodes: 15, researchRequired: { branch: 'hardware', sub: 'compute', level: 3 } },
      { id: 'multisocket', name: 'Multi-Socket', kwPerNode: 1.2, revenuePerNode: 600, minNodes: 6, maxNodes: 20, defaultNodes: 15, researchRequired: { branch: 'hardware', sub: 'compute', level: 4 } },
      { id: 'custom', name: 'Custom Silicon', kwPerNode: 1.5, revenuePerNode: 1000, minNodes: 6, maxNodes: 20, defaultNodes: 16, researchRequired: { branch: 'hardware', sub: 'compute', level: 5 } },
    ]
  },
  {
    id: 'gpu',
    name: 'GPU',
    tiers: [
      { id: 'entry', name: 'Entry GPU', kwPerNode: 1.5, revenuePerNode: 1000, minNodes: 4, maxNodes: 16, defaultNodes: 8, researchRequired: { branch: 'hardware', sub: 'gpu', level: 1 } },
      { id: 'datacenter', name: 'Data Center GPU', kwPerNode: 2.5, revenuePerNode: 2250, minNodes: 4, maxNodes: 12, defaultNodes: 8, researchRequired: { branch: 'hardware', sub: 'gpu', level: 2 } },
      { id: 'multigpu', name: 'Multi-GPU Nodes', kwPerNode: 5, revenuePerNode: 5000, minNodes: 2, maxNodes: 8, defaultNodes: 7, researchRequired: { branch: 'hardware', sub: 'gpu', level: 3 } },
      { id: 'cluster', name: 'GPU Clusters', kwPerNode: 8, revenuePerNode: 10000, minNodes: 2, maxNodes: 8, defaultNodes: 6, researchRequired: { branch: 'hardware', sub: 'gpu', level: 4 } },
      { id: 'supercompute', name: 'AI Supercompute', kwPerNode: 12, revenuePerNode: 20000, minNodes: 2, maxNodes: 8, defaultNodes: 6, researchRequired: { branch: 'hardware', sub: 'gpu', level: 5 } },
    ]
  },
  {
    id: 'hpc',
    name: 'HPC',
    tiers: [
      { id: 'basic', name: 'Basic Cluster', kwPerNode: 1.0, revenuePerNode: 700, minNodes: 8, maxNodes: 20, defaultNodes: 15, researchRequired: { branch: 'hardware', sub: 'hpc', level: 1 } },
      { id: 'infiniband', name: 'InfiniBand', kwPerNode: 1.5, revenuePerNode: 1300, minNodes: 6, maxNodes: 16, defaultNodes: 12, researchRequired: { branch: 'hardware', sub: 'hpc', level: 2 } },
      { id: 'lowlatency', name: 'Low-Latency', kwPerNode: 2.5, revenuePerNode: 2500, minNodes: 4, maxNodes: 14, defaultNodes: 12, researchRequired: { branch: 'hardware', sub: 'hpc', level: 3 } },
      { id: 'coupled', name: 'Tightly Coupled', kwPerNode: 4, revenuePerNode: 4500, minNodes: 4, maxNodes: 12, defaultNodes: 11, researchRequired: { branch: 'hardware', sub: 'hpc', level: 4 } },
      { id: 'exascale', name: 'Exascale Ready', kwPerNode: 6, revenuePerNode: 8000, minNodes: 4, maxNodes: 12, defaultNodes: 11, researchRequired: { branch: 'hardware', sub: 'hpc', level: 5 } },
    ]
  },
];

// ============================================
// Design Types
// ============================================

export interface SPCNDesign {
  id: string;
  name: string;
  cooling: string;      // CoolingOption id
  powerDensity: string; // PowerDensityOption id
  network: string;      // NetworkOption id
  redundancy: string;   // PowerRedundancyOption id
  size: string;         // DCSizeOption id (footprint)
  // Calculated fields
  tiles: number;        // Total tiles footprint
  totalMW: number;      // Total MW capacity
  totalRacks: number;   // Total rack capacity
  buildCost: number;    // Total build cost
  pue: number;
  reliability: number;
}

export interface RackDesign {
  id: string;
  name: string;
  type: string;         // RackTypeOption id
  tier: string;         // Tier id within the type
  nodeCount: number;    // Number of nodes in the rack
  // Calculated fields
  kwPerRack: number;
  revenuePerRack: number;
}

// ============================================
// Design Manager
// ============================================

export const Designs = {
  spcnDesigns: [] as SPCNDesign[],
  rackDesigns: [] as RackDesign[],

  // DOM elements
  container: null as HTMLElement | null,
  spcnList: null as HTMLElement | null,
  rackList: null as HTMLElement | null,

  init(): void {
    this.container = document.getElementById('design-container');
    this.spcnList = document.getElementById('spcn-design-list');
    this.rackList = document.getElementById('rack-design-list');

    this.bindEvents();
    this.render();
  },

  bindEvents(): void {
    document.getElementById('new-spcn-btn')?.addEventListener('click', () => this.showSPCNForm());
    document.getElementById('new-rack-btn')?.addEventListener('click', () => this.showRackForm());

    // Form submissions
    document.getElementById('spcn-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSPCNDesign();
    });
    document.getElementById('rack-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRackDesign();
    });

    // Cancel buttons (both X button and Cancel button)
    document.getElementById('spcn-cancel')?.addEventListener('click', () => this.hideSPCNForm());
    document.getElementById('spcn-cancel-2')?.addEventListener('click', () => this.hideSPCNForm());
    document.getElementById('rack-cancel')?.addEventListener('click', () => this.hideRackForm());
    document.getElementById('rack-cancel-2')?.addEventListener('click', () => this.hideRackForm());

    // Click outside modal to close
    document.getElementById('spcn-form-container')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideSPCNForm();
    });
    document.getElementById('rack-form-container')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideRackForm();
    });

    // Live calculation updates
    document.getElementById('spcn-cooling')?.addEventListener('change', () => this.updateSPCNCalc());
    document.getElementById('spcn-power')?.addEventListener('change', () => this.updateSPCNCalc());
    document.getElementById('spcn-network')?.addEventListener('change', () => this.updateSPCNCalc());
    document.getElementById('spcn-redundancy')?.addEventListener('change', () => this.updateSPCNCalc());
    document.getElementById('spcn-size')?.addEventListener('change', () => this.updateSPCNCalc());

    document.getElementById('rack-type')?.addEventListener('change', () => this.updateRackTiers());
    document.getElementById('rack-tier')?.addEventListener('change', () => this.updateRackNodeSlider());
    document.getElementById('rack-nodes')?.addEventListener('input', () => this.updateRackCalc());
  },

  // Check if research requirement is met
  isResearched(req: { branch: string; sub: string; level: number }): boolean {
    return Research.getLevel(req.branch, req.sub) >= req.level;
  },

  // Populate SPCN form dropdowns with research gating
  populateSPCNOptions(): void {
    const coolingSelect = document.getElementById('spcn-cooling') as HTMLSelectElement;
    const powerSelect = document.getElementById('spcn-power') as HTMLSelectElement;
    const networkSelect = document.getElementById('spcn-network') as HTMLSelectElement;
    const redundancySelect = document.getElementById('spcn-redundancy') as HTMLSelectElement;

    if (coolingSelect) {
      coolingSelect.innerHTML = '<option value="">Select cooling...</option>';
      CoolingOptions.forEach(opt => {
        const researched = this.isResearched(opt.researchRequired);
        coolingSelect.innerHTML += `<option value="${opt.id}" ${!researched ? 'disabled' : ''}>${opt.name}${!researched ? ' (Not Researched)' : ''}</option>`;
      });
    }

    if (powerSelect) {
      powerSelect.innerHTML = '<option value="">Select power density...</option>';
      PowerDensityOptions.forEach(opt => {
        const researched = this.isResearched(opt.researchRequired);
        powerSelect.innerHTML += `<option value="${opt.id}" ${!researched ? 'disabled' : ''}>${opt.name}${!researched ? ' (Not Researched)' : ''}</option>`;
      });
    }

    if (networkSelect) {
      networkSelect.innerHTML = '<option value="">Select network...</option>';
      NetworkOptions.forEach(opt => {
        const researched = this.isResearched(opt.researchRequired);
        networkSelect.innerHTML += `<option value="${opt.id}" ${!researched ? 'disabled' : ''}>${opt.name}${!researched ? ' (Not Researched)' : ''}</option>`;
      });
    }

    if (redundancySelect) {
      redundancySelect.innerHTML = '';
      PowerRedundancyOptions.forEach(opt => {
        redundancySelect.innerHTML += `<option value="${opt.id}">${opt.name}</option>`;
      });
    }

    const sizeSelect = document.getElementById('spcn-size') as HTMLSelectElement;
    if (sizeSelect) {
      sizeSelect.innerHTML = '<option value="">Select size...</option>';
      DCSizeOptions.forEach(opt => {
        sizeSelect.innerHTML += `<option value="${opt.id}">${opt.name}</option>`;
      });
    }
  },

  // Populate rack type dropdown
  populateRackTypes(): void {
    const typeSelect = document.getElementById('rack-type') as HTMLSelectElement;
    if (typeSelect) {
      typeSelect.innerHTML = '<option value="">Select type...</option>';
      RackTypeOptions.forEach(type => {
        // Check if at least one tier is researched
        const hasResearchedTier = type.tiers.some(t => this.isResearched(t.researchRequired));
        typeSelect.innerHTML += `<option value="${type.id}" ${!hasResearchedTier ? 'disabled' : ''}>${type.name}${!hasResearchedTier ? ' (Not Researched)' : ''}</option>`;
      });
    }
  },

  // Update rack tiers based on selected type
  updateRackTiers(): void {
    const typeSelect = document.getElementById('rack-type') as HTMLSelectElement;
    const tierSelect = document.getElementById('rack-tier') as HTMLSelectElement;

    if (!typeSelect || !tierSelect) return;

    const selectedType = RackTypeOptions.find(t => t.id === typeSelect.value);
    tierSelect.innerHTML = '<option value="">Select tier...</option>';

    if (selectedType) {
      selectedType.tiers.forEach(tier => {
        const researched = this.isResearched(tier.researchRequired);
        tierSelect.innerHTML += `<option value="${tier.id}" ${!researched ? 'disabled' : ''}>${tier.name}${!researched ? ' (Not Researched)' : ''}</option>`;
      });
    }

    // Hide node slider until tier is selected
    const nodesGroup = document.getElementById('rack-nodes-group');
    if (nodesGroup) nodesGroup.style.display = 'none';

    this.updateRackCalc();
  },

  // Update node slider based on selected tier
  updateRackNodeSlider(): void {
    const typeSelect = document.getElementById('rack-type') as HTMLSelectElement;
    const tierSelect = document.getElementById('rack-tier') as HTMLSelectElement;
    const nodesSlider = document.getElementById('rack-nodes') as HTMLInputElement;
    const nodesValue = document.getElementById('rack-nodes-value');
    const nodesGroup = document.getElementById('rack-nodes-group');

    if (!typeSelect || !tierSelect || !nodesSlider || !nodesGroup) return;

    const selectedType = RackTypeOptions.find(t => t.id === typeSelect.value);
    const selectedTier = selectedType?.tiers.find(t => t.id === tierSelect.value);

    if (selectedTier) {
      // Show and configure the slider
      nodesGroup.style.display = 'block';
      nodesSlider.min = String(selectedTier.minNodes);
      nodesSlider.max = String(selectedTier.maxNodes);
      nodesSlider.value = String(selectedTier.defaultNodes);
      if (nodesValue) nodesValue.textContent = String(selectedTier.defaultNodes);
    } else {
      nodesGroup.style.display = 'none';
    }

    this.updateRackCalc();
  },

  // Calculate and display SPCN stats
  updateSPCNCalc(): void {
    const cooling = CoolingOptions.find(c => c.id === (document.getElementById('spcn-cooling') as HTMLSelectElement)?.value);
    const power = PowerDensityOptions.find(p => p.id === (document.getElementById('spcn-power') as HTMLSelectElement)?.value);
    const network = NetworkOptions.find(n => n.id === (document.getElementById('spcn-network') as HTMLSelectElement)?.value);
    const redundancy = PowerRedundancyOptions.find(r => r.id === (document.getElementById('spcn-redundancy') as HTMLSelectElement)?.value);
    const size = DCSizeOptions.find(s => s.id === (document.getElementById('spcn-size') as HTMLSelectElement)?.value);

    const calcEl = document.getElementById('spcn-calc');
    if (!calcEl) return;

    if (!cooling || !power || !network || !redundancy || !size) {
      calcEl.innerHTML = '<div class="calc-placeholder">Select all options to see calculations</div>';
      return;
    }

    // Calculate totals based on DC size
    const totalRacks = size.tiles * size.racksPerTile;
    const totalMW = (power.kw * totalRacks) / 1000;

    // Build cost: base $20M per tile, scales with options
    const baseCostPerTile = 20_000_000;
    const coolingMult = 1 + (CoolingOptions.indexOf(cooling) * 0.15);
    const powerMult = 1 + (PowerDensityOptions.indexOf(power) * 0.2);
    const buildCostPerTile = baseCostPerTile * coolingMult * powerMult * redundancy.costMult;
    const totalBuildCost = buildCostPerTile * size.tiles;

    // Convert reliability to SLA
    const sla = redundancy.reliability >= 95 ? '99.999%' :
                redundancy.reliability >= 85 ? '99.99%' :
                redundancy.reliability >= 70 ? '99.95%' :
                redundancy.reliability >= 50 ? '99.9%' : '99.5%';

    calcEl.innerHTML = `
      <div class="calc-row">
        <span class="calc-label">Footprint</span>
        <span class="calc-value">${size.tiles} tiles</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">Total Capacity</span>
        <span class="calc-value">${totalMW.toFixed(1)} MW</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">Rack Capacity</span>
        <span class="calc-value">${totalRacks.toLocaleString()} racks</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">Build Cost</span>
        <span class="calc-value">$${(totalBuildCost / 1_000_000).toFixed(0)}M</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">PUE</span>
        <span class="calc-value">${cooling.pue.toFixed(2)}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">SLA</span>
        <span class="calc-value">${sla}</span>
      </div>
    `;
  },

  // Calculate and display rack stats
  updateRackCalc(): void {
    const typeSelect = document.getElementById('rack-type') as HTMLSelectElement;
    const tierSelect = document.getElementById('rack-tier') as HTMLSelectElement;
    const nodesSlider = document.getElementById('rack-nodes') as HTMLInputElement;
    const nodesValue = document.getElementById('rack-nodes-value');
    const calcEl = document.getElementById('rack-calc');

    if (!calcEl) return;

    const selectedType = RackTypeOptions.find(t => t.id === typeSelect?.value);
    const selectedTier = selectedType?.tiers.find(t => t.id === tierSelect?.value);

    if (!selectedTier) {
      calcEl.innerHTML = '<div class="calc-placeholder">Select type and tier to see calculations</div>';
      return;
    }

    const nodeCount = nodesSlider ? Number(nodesSlider.value) : selectedTier.defaultNodes;
    if (nodesValue) nodesValue.textContent = String(nodeCount);

    const totalKw = selectedTier.kwPerNode * nodeCount;
    const totalRevenue = selectedTier.revenuePerNode * nodeCount;

    calcEl.innerHTML = `
      <div class="calc-row">
        <span class="calc-label">Nodes</span>
        <span class="calc-value">${nodeCount} nodes</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">Power Draw</span>
        <span class="calc-value">${totalKw.toFixed(1)} kW/rack</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">Revenue Potential</span>
        <span class="calc-value">$${totalRevenue.toLocaleString()}/mo</span>
      </div>
    `;
  },

  showSPCNForm(): void {
    this.populateSPCNOptions();
    this.updateSPCNCalc();
    document.getElementById('spcn-form-container')?.classList.add('active');
    (document.getElementById('spcn-name') as HTMLInputElement).value = '';
  },

  hideSPCNForm(): void {
    document.getElementById('spcn-form-container')?.classList.remove('active');
  },

  showRackForm(): void {
    this.populateRackTypes();
    this.updateRackCalc();
    document.getElementById('rack-form-container')?.classList.add('active');
    (document.getElementById('rack-name') as HTMLInputElement).value = '';
  },

  hideRackForm(): void {
    document.getElementById('rack-form-container')?.classList.remove('active');
  },

  saveSPCNDesign(): void {
    const name = (document.getElementById('spcn-name') as HTMLInputElement)?.value.trim();
    const cooling = (document.getElementById('spcn-cooling') as HTMLSelectElement)?.value;
    const power = (document.getElementById('spcn-power') as HTMLSelectElement)?.value;
    const network = (document.getElementById('spcn-network') as HTMLSelectElement)?.value;
    const redundancy = (document.getElementById('spcn-redundancy') as HTMLSelectElement)?.value;
    const sizeId = (document.getElementById('spcn-size') as HTMLSelectElement)?.value;

    if (!name || !cooling || !power || !network || !redundancy || !sizeId) return;

    const coolingOpt = CoolingOptions.find(c => c.id === cooling)!;
    const powerOpt = PowerDensityOptions.find(p => p.id === power)!;
    const redundancyOpt = PowerRedundancyOptions.find(r => r.id === redundancy)!;
    const sizeOpt = DCSizeOptions.find(s => s.id === sizeId)!;

    // Calculate totals based on DC size
    const totalRacks = sizeOpt.tiles * sizeOpt.racksPerTile;
    const totalMW = (powerOpt.kw * totalRacks) / 1000;

    const baseCostPerTile = 20_000_000;
    const coolingMult = 1 + (CoolingOptions.indexOf(coolingOpt) * 0.15);
    const powerMult = 1 + (PowerDensityOptions.indexOf(powerOpt) * 0.2);
    const buildCostPerTile = baseCostPerTile * coolingMult * powerMult * redundancyOpt.costMult;
    const totalBuildCost = buildCostPerTile * sizeOpt.tiles;

    const design: SPCNDesign = {
      id: crypto.randomUUID(),
      name,
      cooling,
      powerDensity: power,
      network,
      redundancy,
      size: sizeId,
      tiles: sizeOpt.tiles,
      totalMW,
      totalRacks,
      buildCost: totalBuildCost,
      pue: coolingOpt.pue,
      reliability: redundancyOpt.reliability,
    };

    this.spcnDesigns.push(design);
    this.hideSPCNForm();
    this.render();
  },

  saveRackDesign(): void {
    const name = (document.getElementById('rack-name') as HTMLInputElement)?.value.trim();
    const type = (document.getElementById('rack-type') as HTMLSelectElement)?.value;
    const tier = (document.getElementById('rack-tier') as HTMLSelectElement)?.value;
    const nodesSlider = document.getElementById('rack-nodes') as HTMLInputElement;

    if (!name || !type || !tier) return;

    const typeOpt = RackTypeOptions.find(t => t.id === type)!;
    const tierOpt = typeOpt.tiers.find(t => t.id === tier)!;
    const nodeCount = nodesSlider ? Number(nodesSlider.value) : tierOpt.defaultNodes;

    const design: RackDesign = {
      id: crypto.randomUUID(),
      name,
      type,
      tier,
      nodeCount,
      kwPerRack: tierOpt.kwPerNode * nodeCount,
      revenuePerRack: tierOpt.revenuePerNode * nodeCount,
    };

    this.rackDesigns.push(design);
    this.hideRackForm();
    this.render();
  },

  deleteSPCNDesign(id: string): void {
    this.spcnDesigns = this.spcnDesigns.filter(d => d.id !== id);
    this.render();
  },

  deleteRackDesign(id: string): void {
    this.rackDesigns = this.rackDesigns.filter(d => d.id !== id);
    this.render();
  },

  render(): void {
    this.renderSPCNList();
    this.renderRackList();
  },

  renderSPCNList(): void {
    if (!this.spcnList) return;

    if (this.spcnDesigns.length === 0) {
      this.spcnList.innerHTML = '<div class="no-designs">No DC designs yet</div>';
      return;
    }

    this.spcnList.innerHTML = this.spcnDesigns.map(d => {
      const cooling = CoolingOptions.find(c => c.id === d.cooling);
      const power = PowerDensityOptions.find(p => p.id === d.powerDensity);
      const size = DCSizeOptions.find(s => s.id === d.size);

      return `
        <div class="design-card" data-id="${d.id}">
          <div class="design-header">
            <span class="design-name">${d.name}</span>
            <button class="design-delete" onclick="window.Designs.deleteSPCNDesign('${d.id}')">&times;</button>
          </div>
          <div class="design-specs">
            <div class="spec"><span class="spec-label">Size</span><span class="spec-value">${size?.name || d.tiles + ' tiles'}</span></div>
            <div class="spec"><span class="spec-label">Cooling</span><span class="spec-value">${cooling?.name}</span></div>
            <div class="spec"><span class="spec-label">Power</span><span class="spec-value">${power?.name}</span></div>
          </div>
          <div class="design-stats">
            <div class="stat"><span class="stat-value">${d.totalMW?.toFixed(1) || '0'}</span><span class="stat-label">MW</span></div>
            <div class="stat"><span class="stat-value">${d.totalRacks?.toLocaleString() || '0'}</span><span class="stat-label">racks</span></div>
            <div class="stat"><span class="stat-value">$${((d.buildCost || 0) / 1_000_000).toFixed(0)}M</span><span class="stat-label">cost</span></div>
            <div class="stat"><span class="stat-value">${d.pue.toFixed(2)}</span><span class="stat-label">PUE</span></div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderRackList(): void {
    if (!this.rackList) return;

    if (this.rackDesigns.length === 0) {
      this.rackList.innerHTML = '<div class="no-designs">No rack designs yet</div>';
      return;
    }

    this.rackList.innerHTML = this.rackDesigns.map(d => {
      const type = RackTypeOptions.find(t => t.id === d.type);
      const tier = type?.tiers.find(t => t.id === d.tier);

      return `
        <div class="design-card" data-id="${d.id}">
          <div class="design-header">
            <span class="design-name">${d.name}</span>
            <button class="design-delete" onclick="window.Designs.deleteRackDesign('${d.id}')">&times;</button>
          </div>
          <div class="design-specs">
            <div class="spec"><span class="spec-label">Type</span><span class="spec-value">${type?.name}</span></div>
            <div class="spec"><span class="spec-label">Tier</span><span class="spec-value">${tier?.name}</span></div>
            <div class="spec"><span class="spec-label">Nodes</span><span class="spec-value">${d.nodeCount || 0}</span></div>
          </div>
          <div class="design-stats">
            <div class="stat"><span class="stat-value">${d.kwPerRack.toFixed(1)}</span><span class="stat-label">kW/rack</span></div>
            <div class="stat"><span class="stat-value">$${(d.revenuePerRack / 1000).toFixed(0)}K</span><span class="stat-label">/mo</span></div>
          </div>
        </div>
      `;
    }).join('');
  },

  // State management for save/load
  getState(): { spcn: SPCNDesign[]; rack: RackDesign[] } {
    return {
      spcn: this.spcnDesigns,
      rack: this.rackDesigns,
    };
  },

  loadState(state: { spcn?: SPCNDesign[]; rack?: RackDesign[] }): void {
    this.spcnDesigns = state.spcn || [];
    this.rackDesigns = state.rack || [];
    this.render();
  },
};

// Expose to window for onclick handlers
(window as any).Designs = Designs;
