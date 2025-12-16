// Design System - SPCN (DC Infrastructure) and Rack Configurations
import { Research, ResearchTree } from './research';

// ============================================
// Regional Electricity System
// ============================================

export interface RegionalPower {
  id: string;
  name: string;
  baseRate: number;        // $/kWh base rate
  totalCapacityMW: number; // Total MW available in region
  usedCapacityMW: number;  // MW currently in use
}

// Regional power data - rates and capacity
export const RegionalPowerData: { [key: string]: RegionalPower } = {
  nova: { id: 'nova', name: 'Northern Virginia', baseRate: 0.065, totalCapacityMW: 5000, usedCapacityMW: 0 },
  dallas: { id: 'dallas', name: 'Dallas', baseRate: 0.055, totalCapacityMW: 3000, usedCapacityMW: 0 },
  chicago: { id: 'chicago', name: 'Chicago', baseRate: 0.070, totalCapacityMW: 2500, usedCapacityMW: 0 },
  phoenix: { id: 'phoenix', name: 'Phoenix', baseRate: 0.058, totalCapacityMW: 2000, usedCapacityMW: 0 },
  seattle: { id: 'seattle', name: 'Seattle', baseRate: 0.048, totalCapacityMW: 1500, usedCapacityMW: 0 },
  atlanta: { id: 'atlanta', name: 'Atlanta', baseRate: 0.062, totalCapacityMW: 1800, usedCapacityMW: 0 },
};

// Calculate effective electricity rate based on supply/demand
export function getEffectiveRate(regionId: string): number {
  const region = RegionalPowerData[regionId];
  if (!region) return 0.06; // Default rate

  const utilization = region.usedCapacityMW / region.totalCapacityMW;
  // Rate increases as utilization goes up (supply/demand)
  // At 0% utilization: base rate
  // At 50% utilization: 1.1x base rate
  // At 80% utilization: 1.4x base rate
  // At 100% utilization: 2x base rate
  const demandMultiplier = 1 + (utilization * utilization);
  return region.baseRate * demandMultiplier;
}

// ============================================
// SPCN Design Options (gated by research)
// ============================================

// Cooling options with cost multipliers
// costPerKW = cost to install cooling infrastructure per kW of IT load
// Real-world: $500-2,000/kW depending on technology
export const CoolingOptions = [
  { id: 'air', name: 'Air (CRAC)', pue: 1.8, costPerKW: 500, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 1 } },
  { id: 'hotcold', name: 'Hot/Cold Aisle', pue: 1.5, costPerKW: 700, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 2 } },
  { id: 'liquid', name: 'Rear-Door Liquid', pue: 1.3, costPerKW: 1000, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 3 } },
  { id: 'direct', name: 'Direct-to-Chip', pue: 1.15, costPerKW: 1500, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 4 } },
  { id: 'immersion', name: 'Immersion', pue: 1.05, costPerKW: 2200, researchRequired: { branch: 'infrastructure', sub: 'cooling', level: 5 } },
];

// Power density options with infrastructure cost per kW
// Real-world: $800-1,500/kW for UPS, switchgear, PDUs
// Higher density requires more robust infrastructure
export const PowerDensityOptions = [
  { id: '5kw', name: '5 kW/rack', kw: 5, costPerKW: 800, researchRequired: { branch: 'infrastructure', sub: 'power', level: 1 } },
  { id: '10kw', name: '10 kW/rack', kw: 10, costPerKW: 1000, researchRequired: { branch: 'infrastructure', sub: 'power', level: 2 } },
  { id: '20kw', name: '20 kW/rack', kw: 20, costPerKW: 1200, researchRequired: { branch: 'infrastructure', sub: 'power', level: 3 } },
  { id: '50kw', name: '50 kW/rack', kw: 50, costPerKW: 1400, researchRequired: { branch: 'infrastructure', sub: 'power', level: 4 } },
  { id: '100kw', name: '100 kW/rack', kw: 100, costPerKW: 1600, researchRequired: { branch: 'infrastructure', sub: 'power', level: 5 } },
];

// Network options with cost per rack
// Real-world: $2-10K/rack depending on speed/density
export const NetworkOptions = [
  { id: '10g', name: '10 GbE', speed: 10, costPerRack: 2000, researchRequired: { branch: 'infrastructure', sub: 'network', level: 1 } },
  { id: '25g', name: '25 GbE', speed: 25, costPerRack: 3500, researchRequired: { branch: 'infrastructure', sub: 'network', level: 2 } },
  { id: '100g', name: '100 GbE', speed: 100, costPerRack: 5500, researchRequired: { branch: 'infrastructure', sub: 'network', level: 3 } },
  { id: '400g', name: '400 GbE', speed: 400, costPerRack: 8000, researchRequired: { branch: 'infrastructure', sub: 'network', level: 4 } },
  { id: 'fabric', name: 'AI Fabric', speed: 800, costPerRack: 12000, researchRequired: { branch: 'infrastructure', sub: 'network', level: 5 } },
];

// Power redundancy - not research gated, just affects cost and reliability
export const PowerRedundancyOptions = [
  { id: 'n', name: 'N', costMult: 1.0, reliability: 20 },
  { id: 'n1', name: 'N+1', costMult: 1.3, reliability: 50 },
  { id: '2n', name: '2N', costMult: 1.8, reliability: 80 },
  { id: '2n1', name: '2N+1', costMult: 2.2, reliability: 95 },
];

// DC Size options - footprint in tiles
// 50 racks per tile uniformly across all sizes
export const DCSizeOptions = [
  { id: '1x1', name: '1×1 (Edge)', tiles: 1, racksPerTile: 50 },
  { id: '2x2', name: '2×2 (Standard)', tiles: 4, racksPerTile: 50 },
  { id: '4x4', name: '4×4 (Regional)', tiles: 16, racksPerTile: 50 },
  { id: '8x8', name: '8×8 (Hyperscaler)', tiles: 64, racksPerTile: 50 },
];

// ============================================
// Rack Type Options (gated by research)
// costPerNode = hardware CapEx per node
// maintenancePct = annual maintenance as % of hardware cost (typically 10-15%)
// ============================================

export const RackTypeOptions = [
  {
    id: 'storage',
    name: 'Storage',
    tiers: [
      { id: 'hdd', name: 'HDD Arrays', kwPerNode: 0.15, revenuePerNode: 100, costPerNode: 800, maintenancePct: 0.12, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 1 } },
      { id: 'hybrid', name: 'Hybrid Storage', kwPerNode: 0.2, revenuePerNode: 175, costPerNode: 1500, maintenancePct: 0.12, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 2 } },
      { id: 'ssd', name: 'SSD Arrays', kwPerNode: 0.25, revenuePerNode: 300, costPerNode: 3000, maintenancePct: 0.10, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 3 } },
      { id: 'nvme', name: 'NVMe Flash', kwPerNode: 0.3, revenuePerNode: 500, costPerNode: 6000, maintenancePct: 0.10, minNodes: 8, maxNodes: 36, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 4 } },
      { id: 'scm', name: 'SCM/Optane', kwPerNode: 0.35, revenuePerNode: 750, costPerNode: 12000, maintenancePct: 0.10, minNodes: 8, maxNodes: 36, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'storage', level: 5 } },
    ]
  },
  {
    id: 'compute',
    name: 'Compute',
    tiers: [
      { id: 'basic', name: 'Basic Servers', kwPerNode: 0.3, revenuePerNode: 150, costPerNode: 2500, maintenancePct: 0.12, minNodes: 10, maxNodes: 42, defaultNodes: 20, researchRequired: { branch: 'hardware', sub: 'compute', level: 1 } },
      { id: 'midrange', name: 'Mid-Range', kwPerNode: 0.5, revenuePerNode: 250, costPerNode: 5000, maintenancePct: 0.12, minNodes: 10, maxNodes: 42, defaultNodes: 16, researchRequired: { branch: 'hardware', sub: 'compute', level: 2 } },
      { id: 'highcore', name: 'High-Core', kwPerNode: 0.8, revenuePerNode: 400, costPerNode: 10000, maintenancePct: 0.10, minNodes: 8, maxNodes: 32, defaultNodes: 15, researchRequired: { branch: 'hardware', sub: 'compute', level: 3 } },
      { id: 'multisocket', name: 'Multi-Socket', kwPerNode: 1.2, revenuePerNode: 600, costPerNode: 20000, maintenancePct: 0.10, minNodes: 6, maxNodes: 20, defaultNodes: 15, researchRequired: { branch: 'hardware', sub: 'compute', level: 4 } },
      { id: 'custom', name: 'Custom Silicon', kwPerNode: 1.5, revenuePerNode: 1000, costPerNode: 40000, maintenancePct: 0.08, minNodes: 6, maxNodes: 20, defaultNodes: 16, researchRequired: { branch: 'hardware', sub: 'compute', level: 5 } },
    ]
  },
  {
    id: 'gpu',
    name: 'GPU',
    tiers: [
      { id: 'entry', name: 'Entry GPU', kwPerNode: 1.5, revenuePerNode: 1000, costPerNode: 8000, maintenancePct: 0.12, minNodes: 4, maxNodes: 16, defaultNodes: 8, researchRequired: { branch: 'hardware', sub: 'gpu', level: 1 } },
      { id: 'datacenter', name: 'Data Center GPU', kwPerNode: 2.5, revenuePerNode: 2250, costPerNode: 20000, maintenancePct: 0.12, minNodes: 4, maxNodes: 12, defaultNodes: 8, researchRequired: { branch: 'hardware', sub: 'gpu', level: 2 } },
      { id: 'multigpu', name: 'Multi-GPU Nodes', kwPerNode: 5, revenuePerNode: 5000, costPerNode: 65000, maintenancePct: 0.10, minNodes: 2, maxNodes: 8, defaultNodes: 7, researchRequired: { branch: 'hardware', sub: 'gpu', level: 3 } },
      { id: 'cluster', name: 'GPU Clusters', kwPerNode: 8, revenuePerNode: 10000, costPerNode: 180000, maintenancePct: 0.10, minNodes: 2, maxNodes: 8, defaultNodes: 6, researchRequired: { branch: 'hardware', sub: 'gpu', level: 4 } },
      { id: 'supercompute', name: 'AI Supercompute', kwPerNode: 12, revenuePerNode: 20000, costPerNode: 350000, maintenancePct: 0.08, minNodes: 2, maxNodes: 8, defaultNodes: 6, researchRequired: { branch: 'hardware', sub: 'gpu', level: 5 } },
    ]
  },
  {
    id: 'hpc',
    name: 'HPC',
    tiers: [
      { id: 'basic', name: 'Basic Cluster', kwPerNode: 1.0, revenuePerNode: 700, costPerNode: 5000, maintenancePct: 0.12, minNodes: 8, maxNodes: 20, defaultNodes: 15, researchRequired: { branch: 'hardware', sub: 'hpc', level: 1 } },
      { id: 'infiniband', name: 'InfiniBand', kwPerNode: 1.5, revenuePerNode: 1300, costPerNode: 12000, maintenancePct: 0.12, minNodes: 6, maxNodes: 16, defaultNodes: 12, researchRequired: { branch: 'hardware', sub: 'hpc', level: 2 } },
      { id: 'lowlatency', name: 'Low-Latency', kwPerNode: 2.5, revenuePerNode: 2500, costPerNode: 25000, maintenancePct: 0.10, minNodes: 4, maxNodes: 14, defaultNodes: 12, researchRequired: { branch: 'hardware', sub: 'hpc', level: 3 } },
      { id: 'coupled', name: 'Tightly Coupled', kwPerNode: 4, revenuePerNode: 4500, costPerNode: 45000, maintenancePct: 0.10, minNodes: 4, maxNodes: 12, defaultNodes: 11, researchRequired: { branch: 'hardware', sub: 'hpc', level: 4 } },
      { id: 'exascale', name: 'Exascale Ready', kwPerNode: 6, revenuePerNode: 8000, costPerNode: 80000, maintenancePct: 0.08, minNodes: 4, maxNodes: 12, defaultNodes: 11, researchRequired: { branch: 'hardware', sub: 'hpc', level: 5 } },
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
  buildCost: number;    // Total build cost (CapEx)
  pue: number;
  reliability: number;
  // CapEx breakdown
  capexShell: number;      // Building shell cost
  capexPower: number;      // Power infrastructure cost
  capexCooling: number;    // Cooling infrastructure cost
  capexNetwork: number;    // Network infrastructure cost
  // OpEx (monthly, calculated at runtime based on region)
  opexBase: number;        // Base monthly OpEx (maintenance + staff) before power
  maintenancePerRack: number; // $/rack/month for maintenance
  staffCostBase: number;   // Base staff cost before ops research multiplier
}

// ============================================
// CapEx/OpEx Calculation Functions
// ============================================

// Shell cost per tile (building structure, foundation, site work)
// Real-world: ~$1-2M per MW, with ~0.5-1 MW per tile depending on density
// Using $1.5M per tile as baseline
const SHELL_COST_PER_TILE = 1_500_000; // $1.5M per tile

// Staff cost scaling
// Real-world: ~20-40 staff for a 10MW facility at ~$80-120K/year each = $2-4M/year
// For 16-tile facility (~10MW), monthly staff should be ~$200-350K
// Formula: base × tiles (linear scaling with some efficiency at scale)
const BASE_STAFF_COST_PER_TILE = 15_000; // $15K base per tile per month

// Maintenance cost per rack per month (parts, repairs, consumables)
const BASE_MAINTENANCE_PER_RACK = 75; // $75/rack/month

/**
 * Calculate complete CapEx breakdown for a DC design
 */
export function calculateCapEx(
  tiles: number,
  totalMW: number,
  totalRacks: number,
  cooling: typeof CoolingOptions[0],
  power: typeof PowerDensityOptions[0],
  network: typeof NetworkOptions[0],
  redundancy: typeof PowerRedundancyOptions[0]
): {
  shell: number;
  powerInfra: number;
  coolingInfra: number;
  networkInfra: number;
  total: number;
} {
  // Shell: $5M per tile
  const shell = tiles * SHELL_COST_PER_TILE;

  // Power infrastructure: costPerKW × total kW × redundancy multiplier
  const totalKW = totalMW * 1000;
  const powerInfra = power.costPerKW * totalKW * redundancy.costMult;

  // Cooling infrastructure: costPerKW × total kW (cooling scales with IT load)
  const coolingInfra = cooling.costPerKW * totalKW;

  // Network infrastructure: costPerRack × total racks
  const networkInfra = network.costPerRack * totalRacks;

  // Total CapEx
  const total = shell + powerInfra + coolingInfra + networkInfra;

  return { shell, powerInfra, coolingInfra, networkInfra, total };
}

/**
 * Calculate monthly OpEx for a DC
 * Note: Power cost is calculated at runtime based on actual utilization and regional rates
 */
export function calculateOpEx(
  totalMW: number,
  totalRacks: number,
  tiles: number,
  pue: number,
  regionId: string
): {
  powerCost: number;      // Monthly power cost
  maintenance: number;    // Monthly maintenance cost
  staff: number;          // Monthly staff cost (before ops research multiplier)
  total: number;          // Total monthly OpEx
  opsMultiplier: number;  // Operations research multiplier applied
} {
  // Get operations research level for multiplier
  const opsLevel = Research.getLevel('operations', 'ops');
  const opsData = ResearchTree.operations?.subcategories?.ops?.levels?.find(l => l.level === opsLevel);
  const opsMultiplier = opsData?.opexMult ?? 1.0;

  // Power cost: MW × PUE × 720 hours × $/kWh × 1000 (convert MW to kW)
  const effectiveRate = getEffectiveRate(regionId);
  const powerCost = totalMW * pue * 720 * effectiveRate * 1000;

  // Maintenance: $75/rack/month base
  const maintenance = totalRacks * BASE_MAINTENANCE_PER_RACK;

  // Staff cost: linear scaling with mild economies of scale at larger sizes
  // Modified by operations research multiplier (0.5x at max level = lights-out ops)
  const scaleFactor = 1 - (Math.log10(tiles + 1) * 0.1); // ~0.9x at 16 tiles, ~0.85x at 64 tiles
  const staffBase = BASE_STAFF_COST_PER_TILE * tiles * Math.max(0.7, scaleFactor);
  const staff = staffBase * opsMultiplier;

  // Total OpEx
  const total = powerCost + maintenance + staff;

  return { powerCost, maintenance, staff, total, opsMultiplier };
}

export interface RackDesign {
  id: string;
  name: string;
  type: string;         // RackTypeOption id
  tier: string;         // Tier id within the type
  nodeCount: number;    // Number of nodes in the rack
  // Calculated fields
  kwPerRack: number;
  revenuePerRack: number;   // Monthly revenue potential
  // CapEx (hardware cost)
  capexPerRack: number;     // Hardware cost per rack
  // OpEx (monthly, per rack)
  opexPower: number;        // Power cost per rack (depends on region/PUE at runtime)
  opexMaintenance: number;  // Maintenance/support cost per rack per month
}

/**
 * Calculate rack OpEx (power cost depends on region and DC PUE)
 */
export function calculateRackOpEx(
  kwPerRack: number,
  pue: number,
  regionId: string
): number {
  const effectiveRate = getEffectiveRate(regionId);
  // kW × PUE × 720 hours × $/kWh
  return kwPerRack * pue * 720 * effectiveRate;
}

// ============================================
// Design Manager
// ============================================

export const Designs = {
  spcnDesigns: [] as SPCNDesign[],
  rackDesigns: [] as RackDesign[],
  initialized: false,

  // Current view state
  currentView: 'list' as 'list' | 'dc' | 'rack',

  // DOM elements
  container: null as HTMLElement | null,
  spcnList: null as HTMLElement | null,
  rackList: null as HTMLElement | null,

  init(): void {
    this.container = document.getElementById('design-container');
    this.spcnList = document.getElementById('spcn-design-list');
    this.rackList = document.getElementById('rack-design-list');

    // Only bind events once to prevent duplicate handlers
    if (!this.initialized) {
      this.bindEvents();
      this.initialized = true;
    }
    this.render();
  },

  bindEvents(): void {
    // New design buttons
    document.getElementById('new-spcn-btn')?.addEventListener('click', () => this.showDCDesignView());
    document.getElementById('new-rack-btn')?.addEventListener('click', () => this.showRackDesignView());

    // Back buttons
    document.getElementById('dc-design-back')?.addEventListener('click', () => this.showListView());
    document.getElementById('rack-design-back')?.addEventListener('click', () => this.showListView());

    // Form submissions
    document.getElementById('spcn-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSPCNDesign();
    });
    document.getElementById('rack-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRackDesign();
    });

    // Cancel buttons
    document.getElementById('spcn-cancel')?.addEventListener('click', () => this.showListView());
    document.getElementById('rack-cancel')?.addEventListener('click', () => this.showListView());

    // Node count +/- buttons
    document.getElementById('nodes-decrease')?.addEventListener('click', () => this.adjustNodeCount(-1));
    document.getElementById('nodes-increase')?.addEventListener('click', () => this.adjustNodeCount(1));
    document.getElementById('rack-nodes')?.addEventListener('change', () => this.updateRackCalc());
  },

  // View switching
  showListView(): void {
    this.currentView = 'list';
    document.getElementById('design-list-view')?.classList.add('active');
    document.getElementById('design-dc-view')?.classList.remove('active');
    document.getElementById('design-rack-view')?.classList.remove('active');
  },

  showDCDesignView(): void {
    this.currentView = 'dc';
    document.getElementById('design-list-view')?.classList.remove('active');
    document.getElementById('design-dc-view')?.classList.add('active');
    document.getElementById('design-rack-view')?.classList.remove('active');

    // Reset form
    (document.getElementById('spcn-name') as HTMLInputElement).value = '';
    (document.getElementById('spcn-size') as HTMLInputElement).value = '';
    (document.getElementById('spcn-power') as HTMLInputElement).value = '';
    (document.getElementById('spcn-cooling') as HTMLInputElement).value = '';
    (document.getElementById('spcn-network') as HTMLInputElement).value = '';
    (document.getElementById('spcn-redundancy') as HTMLInputElement).value = '';

    this.populateSPCNOptions();
    this.updateSPCNCalc();
  },

  showRackDesignView(): void {
    this.currentView = 'rack';
    document.getElementById('design-list-view')?.classList.remove('active');
    document.getElementById('design-dc-view')?.classList.remove('active');
    document.getElementById('design-rack-view')?.classList.add('active');

    // Reset form
    (document.getElementById('rack-name') as HTMLInputElement).value = '';
    (document.getElementById('rack-type') as HTMLInputElement).value = '';
    (document.getElementById('rack-tier') as HTMLInputElement).value = '';

    this.populateRackTypes();
    document.getElementById('rack-tier-section')!.style.display = 'none';
    document.getElementById('rack-nodes-section')!.style.display = 'none';
    this.updateRackCalc();
  },

  // Check if research requirement is met
  isResearched(req: { branch: string; sub: string; level: number }): boolean {
    return Research.getLevel(req.branch, req.sub) >= req.level;
  },

  // Populate SPCN option cards
  populateSPCNOptions(): void {
    // Size options
    const sizeContainer = document.getElementById('spcn-size-options');
    if (sizeContainer) {
      sizeContainer.innerHTML = DCSizeOptions.map(opt => `
        <div class="option-card" data-value="${opt.id}" data-field="spcn-size">
          <div class="option-card-name">${opt.name}</div>
          <div class="option-card-detail">${opt.tiles} tile${opt.tiles > 1 ? 's' : ''} · ${opt.racksPerTile * opt.tiles} racks</div>
        </div>
      `).join('');
      this.bindOptionCards(sizeContainer, 'spcn-size');
    }

    // Power options
    const powerContainer = document.getElementById('spcn-power-options');
    if (powerContainer) {
      powerContainer.innerHTML = PowerDensityOptions.map(opt => {
        const researched = this.isResearched(opt.researchRequired);
        return `
          <div class="option-card ${!researched ? 'disabled' : ''}" data-value="${opt.id}" data-field="spcn-power">
            <div class="option-card-name">${opt.name}</div>
            <div class="option-card-detail">$${(opt.costPerKW / 1000).toFixed(1)}K/kW</div>
            ${!researched ? '<div class="option-card-locked">Not Researched</div>' : ''}
          </div>
        `;
      }).join('');
      this.bindOptionCards(powerContainer, 'spcn-power');
    }

    // Cooling options
    const coolingContainer = document.getElementById('spcn-cooling-options');
    if (coolingContainer) {
      coolingContainer.innerHTML = CoolingOptions.map(opt => {
        const researched = this.isResearched(opt.researchRequired);
        return `
          <div class="option-card ${!researched ? 'disabled' : ''}" data-value="${opt.id}" data-field="spcn-cooling">
            <div class="option-card-name">${opt.name}</div>
            <div class="option-card-detail">PUE ${opt.pue}</div>
            ${!researched ? '<div class="option-card-locked">Not Researched</div>' : ''}
          </div>
        `;
      }).join('');
      this.bindOptionCards(coolingContainer, 'spcn-cooling');
    }

    // Network options
    const networkContainer = document.getElementById('spcn-network-options');
    if (networkContainer) {
      networkContainer.innerHTML = NetworkOptions.map(opt => {
        const researched = this.isResearched(opt.researchRequired);
        return `
          <div class="option-card ${!researched ? 'disabled' : ''}" data-value="${opt.id}" data-field="spcn-network">
            <div class="option-card-name">${opt.name}</div>
            <div class="option-card-detail">${opt.speed} Gbps</div>
            ${!researched ? '<div class="option-card-locked">Not Researched</div>' : ''}
          </div>
        `;
      }).join('');
      this.bindOptionCards(networkContainer, 'spcn-network');
    }

    // Redundancy options
    const redundancyContainer = document.getElementById('spcn-redundancy-options');
    if (redundancyContainer) {
      redundancyContainer.innerHTML = PowerRedundancyOptions.map(opt => `
        <div class="option-card" data-value="${opt.id}" data-field="spcn-redundancy">
          <div class="option-card-name">${opt.name}</div>
          <div class="option-card-detail">${opt.costMult}x cost · ${opt.reliability}% reliability</div>
        </div>
      `).join('');
      this.bindOptionCards(redundancyContainer, 'spcn-redundancy');
    }
  },

  // Bind click events to option cards
  bindOptionCards(container: HTMLElement, fieldId: string): void {
    container.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('disabled')) return;

        // Deselect all in this group
        container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));

        // Select this one
        card.classList.add('selected');

        // Update hidden input
        const value = (card as HTMLElement).dataset.value || '';
        (document.getElementById(fieldId) as HTMLInputElement).value = value;

        // Update calculations
        if (fieldId.startsWith('spcn')) {
          this.updateSPCNCalc();
        } else if (fieldId === 'rack-type') {
          this.updateRackTiers();
        } else if (fieldId === 'rack-tier') {
          this.updateRackNodeSection();
        }
      });
    });
  },

  // Populate rack type option cards
  populateRackTypes(): void {
    const typeContainer = document.getElementById('rack-type-options');
    if (typeContainer) {
      typeContainer.innerHTML = RackTypeOptions.map(type => {
        const hasResearchedTier = type.tiers.some(t => this.isResearched(t.researchRequired));
        const tierCount = type.tiers.filter(t => this.isResearched(t.researchRequired)).length;
        return `
          <div class="option-card ${!hasResearchedTier ? 'disabled' : ''}" data-value="${type.id}" data-field="rack-type">
            <div class="option-card-name">${type.name}</div>
            <div class="option-card-detail">${tierCount} tier${tierCount !== 1 ? 's' : ''} available</div>
            ${!hasResearchedTier ? '<div class="option-card-locked">Not Researched</div>' : ''}
          </div>
        `;
      }).join('');
      this.bindOptionCards(typeContainer, 'rack-type');
    }
  },

  // Update rack tiers based on selected type
  updateRackTiers(): void {
    const typeValue = (document.getElementById('rack-type') as HTMLInputElement)?.value;
    const tierSection = document.getElementById('rack-tier-section');
    const tierContainer = document.getElementById('rack-tier-options');

    if (!tierSection || !tierContainer) return;

    const selectedType = RackTypeOptions.find(t => t.id === typeValue);

    if (selectedType) {
      tierSection.style.display = 'block';
      tierContainer.innerHTML = selectedType.tiers.map(tier => {
        const researched = this.isResearched(tier.researchRequired);
        const fmt = (n: number) => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
        return `
          <div class="option-card ${!researched ? 'disabled' : ''}" data-value="${tier.id}" data-field="rack-tier">
            <div class="option-card-name">${tier.name}</div>
            <div class="option-card-detail">${tier.kwPerNode} kW/node · ${fmt(tier.costPerNode)}/node</div>
            ${!researched ? '<div class="option-card-locked">Not Researched</div>' : ''}
          </div>
        `;
      }).join('');
      this.bindOptionCards(tierContainer, 'rack-tier');
    } else {
      tierSection.style.display = 'none';
    }

    // Reset tier selection and hide nodes
    (document.getElementById('rack-tier') as HTMLInputElement).value = '';
    document.getElementById('rack-nodes-section')!.style.display = 'none';

    this.updateRackCalc();
  },

  // Update node count section based on selected tier
  updateRackNodeSection(): void {
    const typeValue = (document.getElementById('rack-type') as HTMLInputElement)?.value;
    const tierValue = (document.getElementById('rack-tier') as HTMLInputElement)?.value;
    const nodesSection = document.getElementById('rack-nodes-section');
    const nodesInput = document.getElementById('rack-nodes') as HTMLInputElement;
    const rangeHint = document.getElementById('node-range-hint');

    if (!nodesSection || !nodesInput) return;

    const selectedType = RackTypeOptions.find(t => t.id === typeValue);
    const selectedTier = selectedType?.tiers.find(t => t.id === tierValue);

    if (selectedTier) {
      nodesSection.style.display = 'block';
      nodesInput.min = String(selectedTier.minNodes);
      nodesInput.max = String(selectedTier.maxNodes);
      nodesInput.value = String(selectedTier.defaultNodes);
      if (rangeHint) {
        rangeHint.textContent = `Range: ${selectedTier.minNodes} - ${selectedTier.maxNodes} nodes`;
      }
    } else {
      nodesSection.style.display = 'none';
    }

    this.updateRackCalc();
  },

  // Adjust node count with +/- buttons
  adjustNodeCount(delta: number): void {
    const nodesInput = document.getElementById('rack-nodes') as HTMLInputElement;
    if (!nodesInput) return;

    const min = parseInt(nodesInput.min) || 1;
    const max = parseInt(nodesInput.max) || 42;
    const current = parseInt(nodesInput.value) || min;
    const newValue = Math.max(min, Math.min(max, current + delta));

    nodesInput.value = String(newValue);
    this.updateRackCalc();
  },

  // Calculate and display SPCN stats
  updateSPCNCalc(): void {
    const cooling = CoolingOptions.find(c => c.id === (document.getElementById('spcn-cooling') as HTMLInputElement)?.value);
    const power = PowerDensityOptions.find(p => p.id === (document.getElementById('spcn-power') as HTMLInputElement)?.value);
    const network = NetworkOptions.find(n => n.id === (document.getElementById('spcn-network') as HTMLInputElement)?.value);
    const redundancy = PowerRedundancyOptions.find(r => r.id === (document.getElementById('spcn-redundancy') as HTMLInputElement)?.value);
    const size = DCSizeOptions.find(s => s.id === (document.getElementById('spcn-size') as HTMLInputElement)?.value);

    const calcEl = document.getElementById('spcn-calc');
    if (!calcEl) return;

    if (!cooling || !power || !network || !redundancy || !size) {
      calcEl.innerHTML = '<div class="calc-placeholder">Select all options to see calculations</div>';
      return;
    }

    // Calculate totals based on DC size
    const totalRacks = size.tiles * size.racksPerTile;
    const totalMW = (power.kw * totalRacks) / 1000;

    // Calculate CapEx using new formula
    const capex = calculateCapEx(size.tiles, totalMW, totalRacks, cooling, power, network, redundancy);

    // Calculate OpEx (using nova as default region for preview)
    const opex = calculateOpEx(totalMW, totalRacks, size.tiles, cooling.pue, 'nova');

    // Convert reliability to SLA
    const sla = redundancy.reliability >= 95 ? '99.999%' :
                redundancy.reliability >= 85 ? '99.99%' :
                redundancy.reliability >= 70 ? '99.95%' :
                redundancy.reliability >= 50 ? '99.9%' : '99.5%';

    // Format currency helper
    const fmt = (n: number) => {
      if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
      return `$${n.toFixed(0)}`;
    };

    calcEl.innerHTML = `
      <div class="calc-section">
        <div class="calc-section-header">Capacity</div>
        <div class="calc-row">
          <span class="calc-label">Footprint</span>
          <span class="calc-value">${size.tiles} tiles</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Power Capacity</span>
          <span class="calc-value">${totalMW.toFixed(1)} MW</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Rack Capacity</span>
          <span class="calc-value">${totalRacks.toLocaleString()} racks</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">PUE</span>
          <span class="calc-value">${cooling.pue.toFixed(2)}</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">SLA</span>
          <span class="calc-value">${sla}</span>
        </div>
      </div>

      <div class="calc-section">
        <div class="calc-section-header">CapEx (Build Cost)</div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Shell</span>
          <span class="calc-value">${fmt(capex.shell)}</span>
        </div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Power Infra</span>
          <span class="calc-value">${fmt(capex.powerInfra)}</span>
        </div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Cooling Infra</span>
          <span class="calc-value">${fmt(capex.coolingInfra)}</span>
        </div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Network Infra</span>
          <span class="calc-value">${fmt(capex.networkInfra)}</span>
        </div>
        <div class="calc-row calc-total">
          <span class="calc-label">Total CapEx</span>
          <span class="calc-value">${fmt(capex.total)}</span>
        </div>
      </div>

      <div class="calc-section">
        <div class="calc-section-header">OpEx (Monthly, NoVA rates)</div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Power Cost</span>
          <span class="calc-value">${fmt(opex.powerCost)}/mo</span>
        </div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Maintenance</span>
          <span class="calc-value">${fmt(opex.maintenance)}/mo</span>
        </div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Staff${opex.opsMultiplier < 1 ? ` (×${opex.opsMultiplier.toFixed(1)})` : ''}</span>
          <span class="calc-value">${fmt(opex.staff)}/mo</span>
        </div>
        <div class="calc-row calc-total">
          <span class="calc-label">Total OpEx</span>
          <span class="calc-value">${fmt(opex.total)}/mo</span>
        </div>
      </div>
    `;
  },

  // Calculate and display rack stats
  updateRackCalc(): void {
    const typeInput = document.getElementById('rack-type') as HTMLInputElement;
    const tierInput = document.getElementById('rack-tier') as HTMLInputElement;
    const nodesInput = document.getElementById('rack-nodes') as HTMLInputElement;
    const calcEl = document.getElementById('rack-calc');

    if (!calcEl) return;

    const selectedType = RackTypeOptions.find(t => t.id === typeInput?.value);
    const selectedTier = selectedType?.tiers.find(t => t.id === tierInput?.value);

    if (!selectedTier) {
      calcEl.innerHTML = '<div class="calc-placeholder">Select type and tier to see calculations</div>';
      return;
    }

    const nodeCount = nodesInput ? Number(nodesInput.value) : selectedTier.defaultNodes;

    const totalKw = selectedTier.kwPerNode * nodeCount;
    const totalRevenue = selectedTier.revenuePerNode * nodeCount;

    // CapEx: hardware cost
    const capex = selectedTier.costPerNode * nodeCount;

    // OpEx: power (assuming PUE 1.5, NoVA rates for preview) + maintenance
    const pue = 1.5; // Assume mid-range PUE for preview
    const powerCost = calculateRackOpEx(totalKw, pue, 'nova');
    const maintenanceCost = (capex * selectedTier.maintenancePct) / 12; // Annual to monthly
    const totalOpex = powerCost + maintenanceCost;

    // Margin calculation
    const margin = totalRevenue - totalOpex;
    const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;

    // Format currency helper
    const fmt = (n: number) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
      return `$${n.toFixed(0)}`;
    };

    calcEl.innerHTML = `
      <div class="calc-section">
        <div class="calc-section-header">Specs</div>
        <div class="calc-row">
          <span class="calc-label">Nodes</span>
          <span class="calc-value">${nodeCount} nodes</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Power Draw</span>
          <span class="calc-value">${totalKw.toFixed(1)} kW/rack</span>
        </div>
      </div>

      <div class="calc-section">
        <div class="calc-section-header">CapEx (per rack)</div>
        <div class="calc-row calc-total">
          <span class="calc-label">Hardware Cost</span>
          <span class="calc-value">${fmt(capex)}</span>
        </div>
      </div>

      <div class="calc-section">
        <div class="calc-section-header">OpEx (Monthly, per rack)</div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Power (PUE 1.5)</span>
          <span class="calc-value">${fmt(powerCost)}/mo</span>
        </div>
        <div class="calc-row calc-sub">
          <span class="calc-label">Maintenance</span>
          <span class="calc-value">${fmt(maintenanceCost)}/mo</span>
        </div>
        <div class="calc-row calc-total">
          <span class="calc-label">Total OpEx</span>
          <span class="calc-value">${fmt(totalOpex)}/mo</span>
        </div>
      </div>

      <div class="calc-section">
        <div class="calc-section-header">Revenue (per rack)</div>
        <div class="calc-row">
          <span class="calc-label">Gross Revenue</span>
          <span class="calc-value">${fmt(totalRevenue)}/mo</span>
        </div>
        <div class="calc-row calc-total">
          <span class="calc-label">Margin</span>
          <span class="calc-value" style="color: ${margin >= 0 ? '#4CAF50' : '#f44336'}">${fmt(margin)}/mo (${marginPct.toFixed(0)}%)</span>
        </div>
      </div>
    `;
  },

  saveSPCNDesign(): void {
    const name = (document.getElementById('spcn-name') as HTMLInputElement)?.value.trim();
    const cooling = (document.getElementById('spcn-cooling') as HTMLInputElement)?.value;
    const power = (document.getElementById('spcn-power') as HTMLInputElement)?.value;
    const network = (document.getElementById('spcn-network') as HTMLInputElement)?.value;
    const redundancy = (document.getElementById('spcn-redundancy') as HTMLInputElement)?.value;
    const sizeId = (document.getElementById('spcn-size') as HTMLInputElement)?.value;

    if (!name || !cooling || !power || !network || !redundancy || !sizeId) return;

    const coolingOpt = CoolingOptions.find(c => c.id === cooling)!;
    const powerOpt = PowerDensityOptions.find(p => p.id === power)!;
    const networkOpt = NetworkOptions.find(n => n.id === network)!;
    const redundancyOpt = PowerRedundancyOptions.find(r => r.id === redundancy)!;
    const sizeOpt = DCSizeOptions.find(s => s.id === sizeId)!;

    // Calculate totals based on DC size
    const totalRacks = sizeOpt.tiles * sizeOpt.racksPerTile;
    const totalMW = (powerOpt.kw * totalRacks) / 1000;

    // Calculate CapEx using new formula
    const capex = calculateCapEx(sizeOpt.tiles, totalMW, totalRacks, coolingOpt, powerOpt, networkOpt, redundancyOpt);

    // Calculate base OpEx (without power, as that depends on region)
    const maintenancePerRack = BASE_MAINTENANCE_PER_RACK;
    const scaleFactor = 1 - (Math.log10(sizeOpt.tiles + 1) * 0.1);
    const staffCostBase = BASE_STAFF_COST_PER_TILE * sizeOpt.tiles * Math.max(0.7, scaleFactor);
    const opexBase = (totalRacks * maintenancePerRack) + staffCostBase;

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
      buildCost: capex.total,
      pue: coolingOpt.pue,
      reliability: redundancyOpt.reliability,
      // CapEx breakdown
      capexShell: capex.shell,
      capexPower: capex.powerInfra,
      capexCooling: capex.coolingInfra,
      capexNetwork: capex.networkInfra,
      // OpEx base values
      opexBase,
      maintenancePerRack,
      staffCostBase,
    };

    this.spcnDesigns.push(design);
    this.showListView();
    this.render();
  },

  saveRackDesign(): void {
    const name = (document.getElementById('rack-name') as HTMLInputElement)?.value.trim();
    const type = (document.getElementById('rack-type') as HTMLInputElement)?.value;
    const tier = (document.getElementById('rack-tier') as HTMLInputElement)?.value;
    const nodesInput = document.getElementById('rack-nodes') as HTMLInputElement;

    if (!name || !type || !tier) return;

    const typeOpt = RackTypeOptions.find(t => t.id === type)!;
    const tierOpt = typeOpt.tiers.find(t => t.id === tier)!;
    const nodeCount = nodesInput ? Number(nodesInput.value) : tierOpt.defaultNodes;

    const kwPerRack = tierOpt.kwPerNode * nodeCount;
    const capexPerRack = tierOpt.costPerNode * nodeCount;
    const maintenancePerMonth = (capexPerRack * tierOpt.maintenancePct) / 12;

    // Power cost preview (using PUE 1.5, NoVA rates - actual cost depends on DC placement)
    const opexPower = calculateRackOpEx(kwPerRack, 1.5, 'nova');

    const design: RackDesign = {
      id: crypto.randomUUID(),
      name,
      type,
      tier,
      nodeCount,
      kwPerRack,
      revenuePerRack: tierOpt.revenuePerNode * nodeCount,
      capexPerRack,
      opexPower,
      opexMaintenance: maintenancePerMonth,
    };

    this.rackDesigns.push(design);
    this.showListView();
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

    // Format currency helper
    const fmt = (n: number) => {
      if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
      return `$${n.toFixed(0)}`;
    };

    this.spcnList.innerHTML = this.spcnDesigns.map(d => {
      const cooling = CoolingOptions.find(c => c.id === d.cooling);
      const power = PowerDensityOptions.find(p => p.id === d.powerDensity);
      const network = NetworkOptions.find(n => n.id === d.network);
      const size = DCSizeOptions.find(s => s.id === d.size);

      // Estimate OpEx for NoVA region
      const opex = calculateOpEx(d.totalMW, d.totalRacks, d.tiles, d.pue, 'nova');

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
            <div class="spec"><span class="spec-label">Network</span><span class="spec-value">${network?.name}</span></div>
          </div>
          <div class="design-stats">
            <div class="stat"><span class="stat-value">${d.totalMW?.toFixed(1) || '0'}</span><span class="stat-label">MW</span></div>
            <div class="stat"><span class="stat-value">${d.totalRacks?.toLocaleString() || '0'}</span><span class="stat-label">racks</span></div>
            <div class="stat"><span class="stat-value">${d.pue.toFixed(2)}</span><span class="stat-label">PUE</span></div>
          </div>
          <div class="design-costs">
            <div class="cost-item">
              <span class="cost-label">CapEx</span>
              <span class="cost-value">${fmt(d.buildCost || 0)}</span>
            </div>
            <div class="cost-item">
              <span class="cost-label">OpEx</span>
              <span class="cost-value">${fmt(opex.total)}/mo</span>
            </div>
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

    // Format currency helper
    const fmt = (n: number) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
      return `$${n.toFixed(0)}`;
    };

    this.rackList.innerHTML = this.rackDesigns.map(d => {
      const type = RackTypeOptions.find(t => t.id === d.type);
      const tier = type?.tiers.find(t => t.id === d.tier);

      // Calculate totals (handle legacy designs without new fields)
      const capex = d.capexPerRack || 0;
      const opexTotal = (d.opexPower || 0) + (d.opexMaintenance || 0);
      const margin = d.revenuePerRack - opexTotal;
      const marginPct = d.revenuePerRack > 0 ? (margin / d.revenuePerRack) * 100 : 0;

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
            <div class="stat"><span class="stat-value">${d.kwPerRack.toFixed(1)}</span><span class="stat-label">kW</span></div>
            <div class="stat"><span class="stat-value">${fmt(d.revenuePerRack)}</span><span class="stat-label">rev/mo</span></div>
            <div class="stat"><span class="stat-value" style="color: ${margin >= 0 ? '#4CAF50' : '#f44336'}">${marginPct.toFixed(0)}%</span><span class="stat-label">margin</span></div>
          </div>
          <div class="design-costs">
            <div class="cost-item">
              <span class="cost-label">CapEx</span>
              <span class="cost-value">${fmt(capex)}</span>
            </div>
            <div class="cost-item">
              <span class="cost-label">OpEx</span>
              <span class="cost-value">${fmt(opexTotal)}/mo</span>
            </div>
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
