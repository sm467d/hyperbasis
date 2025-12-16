import type { ResearchTreeData, ResearchState, ReliabilityFactors, ReliabilityChoices, SLAInfo } from './types';

// Research costs use exponential scaling to force specialization tradeoffs
// Multipliers from L1: L2=2.5x, L3=6.5x, L4=16x, L5=40x
// Total ~10,000 RP to unlock everything
// At 50% R&D budget ($5M/mo = 25 RP/mo): ~33 years
// At 80% R&D budget ($8M/mo = 40 RP/mo): ~21 years
// This incentivizes picking a focus rather than researching everything

export const ResearchTree: ResearchTreeData = {
  infrastructure: {
    name: 'Infrastructure',
    subcategories: {
      power: {
        name: 'Power Density',
        levels: [
          { level: 1, name: '5 kW/rack', cost: 15, kw: 5 },
          { level: 2, name: '10 kW/rack', cost: 40, kw: 10 },
          { level: 3, name: '20 kW/rack', cost: 100, kw: 20 },
          { level: 4, name: '50 kW/rack', cost: 250, kw: 50 },
          { level: 5, name: '100 kW/rack', cost: 600, kw: 100 }
        ]
      },
      cooling: {
        name: 'Cooling',
        levels: [
          { level: 1, name: 'Air (CRAC)', cost: 15, pue: 1.8 },
          { level: 2, name: 'Hot/Cold Aisle', cost: 40, pue: 1.5 },
          { level: 3, name: 'Rear-Door Liquid', cost: 100, pue: 1.3 },
          { level: 4, name: 'Direct-to-Chip', cost: 250, pue: 1.15 },
          { level: 5, name: 'Immersion', cost: 600, pue: 1.05 }
        ]
      },
      network: {
        name: 'Networking',
        levels: [
          { level: 1, name: '10 GbE', cost: 15, speed: 10 },
          { level: 2, name: '25 GbE', cost: 40, speed: 25 },
          { level: 3, name: '100 GbE', cost: 100, speed: 100 },
          { level: 4, name: '400 GbE', cost: 250, speed: 400 },
          { level: 5, name: 'AI Fabric', cost: 600, speed: 800, aiReady: true }
        ]
      }
    }
  },
  hardware: {
    name: 'Hardware',
    subcategories: {
      storage: {
        name: 'Storage',
        levels: [
          { level: 1, name: 'HDD Arrays', cost: 10 },
          { level: 2, name: 'Hybrid Storage', cost: 30 },
          { level: 3, name: 'SSD Arrays', cost: 75 },
          { level: 4, name: 'NVMe Flash', cost: 200 },
          { level: 5, name: 'SCM/Optane', cost: 500 }
        ]
      },
      compute: {
        name: 'Compute',
        levels: [
          { level: 1, name: 'Basic Servers', cost: 15 },
          { level: 2, name: 'Mid-Range', cost: 40 },
          { level: 3, name: 'High-Core', cost: 100 },
          { level: 4, name: 'Multi-Socket', cost: 250 },
          { level: 5, name: 'Custom Silicon', cost: 600 }
        ]
      },
      hpc: {
        name: 'HPC',
        levels: [
          { level: 1, name: 'Basic Cluster', cost: 25 },
          { level: 2, name: 'InfiniBand', cost: 65 },
          { level: 3, name: 'Low-Latency', cost: 160 },
          { level: 4, name: 'Tightly Coupled', cost: 400 },
          { level: 5, name: 'Exascale Ready', cost: 1000 }
        ]
      },
      gpu: {
        name: 'GPU',
        levels: [
          { level: 1, name: 'Entry GPU', cost: 30 },
          { level: 2, name: 'Data Center GPU', cost: 80 },
          { level: 3, name: 'Multi-GPU Nodes', cost: 200 },
          { level: 4, name: 'GPU Clusters', cost: 500 },
          { level: 5, name: 'AI Supercompute', cost: 1200 }
        ]
      }
    }
  },
  operations: {
    name: 'Operations',
    subcategories: {
      ops: {
        name: 'Operations',
        levels: [
          { level: 1, name: 'Manual Ops', cost: 10, opexMult: 1.0, recoveryMult: 1.0 },
          { level: 2, name: 'Basic DCIM', cost: 30, opexMult: 0.9, recoveryMult: 0.8 },
          { level: 3, name: 'Automated Alerts', cost: 75, opexMult: 0.8, recoveryMult: 0.6 },
          { level: 4, name: 'Predictive Maintenance', cost: 200, opexMult: 0.7, recoveryMult: 0.4 },
          { level: 5, name: 'Lights-Out', cost: 500, opexMult: 0.5, recoveryMult: 0.2 }
        ]
      }
    }
  },
  market: {
    name: 'Market Research',
    subcategories: {
      forecasting: {
        name: 'Demand Forecasting',
        levels: [
          { level: 1, name: 'Basic', cost: 10, accuracy: 0.5 },
          { level: 2, name: 'Trend Analysis', cost: 25, accuracy: 0.65 },
          { level: 3, name: 'Market Models', cost: 65, accuracy: 0.75 },
          { level: 4, name: 'Predictive Analytics', cost: 175, accuracy: 0.85 },
          { level: 5, name: 'AI Forecasting', cost: 450, accuracy: 0.95 }
        ]
      }
    }
  }
};

export const Reliability = {
  factors: {
    powerRedundancy: {
      name: 'Power Redundancy',
      options: [
        { id: 'n', name: 'N', score: 20 },
        { id: 'n1', name: 'N+1', score: 50 },
        { id: '2n', name: '2N', score: 80 },
        { id: '2n1', name: '2N+1', score: 95 }
      ]
    },
    coolingRedundancy: {
      name: 'Cooling Redundancy',
      options: [
        { id: 'n', name: 'N', score: 25 },
        { id: 'n1', name: 'N+1', score: 60 },
        { id: '2n', name: '2N', score: 90 }
      ]
    },
    networkPaths: {
      name: 'Network Paths',
      options: [
        { id: 'single', name: 'Single Path', score: 30 },
        { id: 'dual', name: 'Dual Path', score: 65 },
        { id: 'diverse', name: 'Diverse Entry', score: 90 }
      ]
    },
    backupPower: {
      name: 'Backup Power',
      options: [
        { id: 'none', name: 'None', score: 10 },
        { id: 'battery', name: 'Battery Only', score: 40 },
        { id: 'battgen', name: 'Battery + Generator', score: 85 }
      ]
    },
    distribution: {
      name: 'Distribution',
      options: [
        { id: 'single', name: 'Single Site', score: 30 },
        { id: 'multiaz', name: 'Multi-AZ', score: 70 },
        { id: 'multiregion', name: 'Multi-Region', score: 95 }
      ]
    }
  } as ReliabilityFactors,

  calculate(choices: ReliabilityChoices, opsLevel?: number): number {
    let total = 0;
    let count = 0;

    for (const [factorId, choice] of Object.entries(choices)) {
      const factor = this.factors[factorId];
      if (factor) {
        const option = factor.options.find(o => o.id === choice);
        if (option) {
          total += option.score;
          count++;
        }
      }
    }

    let score = count > 0 ? total / count : 0;

    if (opsLevel) {
      score = Math.min(100, score + (opsLevel * 2));
    }

    return Math.round(score);
  },

  getMaxSLA(score: number): SLAInfo {
    if (score >= 95) return { sla: '99.999%', tier: 'Tier IV+', customers: 'Mission-Critical' };
    if (score >= 85) return { sla: '99.99%', tier: 'Tier IV', customers: 'Finance, Healthcare' };
    if (score >= 70) return { sla: '99.95%', tier: 'Tier III', customers: 'Enterprise' };
    if (score >= 50) return { sla: '99.9%', tier: 'Tier II', customers: 'SMB, Standard' };
    return { sla: '99.5%', tier: 'Tier I', customers: 'Budget, Dev/Test' };
  },

  getIncidentChance(score: number): number {
    const base = 0.05;
    const reduction = score / 100;
    return base * (1 - reduction * 0.9);
  }
};

export const Research = {
  state: {} as { [key: string]: number },
  points: 0,
  container: null as HTMLElement | null,
  pointsDisplay: null as HTMLElement | null,

  init(): void {
    this.container = document.getElementById('research-tree');
    this.pointsDisplay = document.getElementById('research-points');
    this.render();
  },

  getLevel(branchId: string, subId: string): number {
    const key = `${branchId}.${subId}`;
    return this.state[key] || 0;
  },

  setLevel(branchId: string, subId: string, level: number): void {
    const key = `${branchId}.${subId}`;
    this.state[key] = level;
  },

  canUnlock(branchId: string, subId: string, level: number): boolean {
    const branch = ResearchTree[branchId];
    if (!branch) return false;

    const sub = branch.subcategories[subId];
    if (!sub) return false;

    const levelData = sub.levels.find(l => l.level === level);
    if (!levelData) return false;

    const currentLevel = this.getLevel(branchId, subId);

    // Already owned
    if (level <= currentLevel) return false;

    // Must unlock in order (level 1 first, then 2, etc.)
    if (level !== currentLevel + 1) return false;

    return this.points >= levelData.cost;
  },

  unlock(branchId: string, subId: string, level: number): boolean {
    if (!this.canUnlock(branchId, subId, level)) return false;

    const branch = ResearchTree[branchId];
    const sub = branch.subcategories[subId];
    const levelData = sub.levels.find(l => l.level === level);

    if (!levelData) return false;

    this.points -= levelData.cost;
    this.setLevel(branchId, subId, level);
    this.render();
    return true;
  },

  render(): void {
    if (!this.container) return;

    this.container.innerHTML = '';

    for (const [branchId, branch] of Object.entries(ResearchTree)) {
      const branchEl = document.createElement('div');
      branchEl.className = 'research-branch';

      const header = document.createElement('div');
      header.className = 'branch-header';
      header.textContent = branch.name;
      branchEl.appendChild(header);

      const subsEl = document.createElement('div');
      subsEl.className = 'branch-subs';

      for (const [subId, sub] of Object.entries(branch.subcategories)) {
        const subEl = document.createElement('div');
        subEl.className = 'research-sub';

        const subHeader = document.createElement('div');
        subHeader.className = 'sub-header';
        subHeader.textContent = sub.name;
        subEl.appendChild(subHeader);

        const levelsEl = document.createElement('div');
        levelsEl.className = 'sub-levels';

        const currentLevel = this.getLevel(branchId, subId);

        sub.levels.forEach((levelData) => {
          const levelEl = document.createElement('div');
          levelEl.className = 'research-level';

          const isOwned = levelData.level <= currentLevel;
          const canUnlock = this.canUnlock(branchId, subId, levelData.level);
          const isNext = levelData.level === currentLevel + 1;

          if (isOwned) {
            levelEl.classList.add('unlocked');
          } else if (canUnlock) {
            levelEl.classList.add('available');
          } else if (isNext) {
            levelEl.classList.add('next');
          } else {
            levelEl.classList.add('locked');
          }

          levelEl.innerHTML = `
            <div class="level-num">L${levelData.level}</div>
            <div class="level-name">${levelData.name}</div>
            <div class="level-cost">${isOwned ? '✓' : levelData.cost + ' RP'}</div>
          `;

          if (canUnlock) {
            levelEl.addEventListener('click', () => this.unlock(branchId, subId, levelData.level));
          }

          levelsEl.appendChild(levelEl);
        });

        subEl.appendChild(levelsEl);
        subsEl.appendChild(subEl);
      }

      branchEl.appendChild(subsEl);
      this.container.appendChild(branchEl);
    }

    this.updatePointsDisplay();
  },

  updatePointsDisplay(): void {
    if (this.pointsDisplay) {
      // Show 1 decimal for smooth incrementing visual
      this.pointsDisplay.textContent = this.points.toFixed(1);
    }
  },

  addPoints(amount: number): void {
    this.points += amount;
    this.updatePointsDisplay();
  },

  getState(): ResearchState {
    return { state: this.state, points: this.points };
  },

  loadState(data: ResearchState): void {
    this.state = data.state || {};
    this.points = data.points || 0;
    this.render();
  }
};
