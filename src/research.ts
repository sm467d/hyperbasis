import type { ResearchTreeData, ResearchState, ReliabilityFactors, ReliabilityChoices, SLAInfo } from './types';

export const ResearchTree: ResearchTreeData = {
  infrastructure: {
    name: 'Infrastructure',
    subcategories: {
      power: {
        name: 'Power Density',
        levels: [
          { level: 1, name: '5 kW/rack', cost: 25, kw: 5 },
          { level: 2, name: '10 kW/rack', cost: 50, kw: 10 },
          { level: 3, name: '20 kW/rack', cost: 150, kw: 20 },
          { level: 4, name: '50 kW/rack', cost: 400, kw: 50 },
          { level: 5, name: '100 kW/rack', cost: 800, kw: 100 }
        ]
      },
      cooling: {
        name: 'Cooling',
        levels: [
          { level: 1, name: 'Air (CRAC)', cost: 25, pue: 1.8 },
          { level: 2, name: 'Hot/Cold Aisle', cost: 75, pue: 1.5 },
          { level: 3, name: 'Rear-Door Liquid', cost: 200, pue: 1.3 },
          { level: 4, name: 'Direct-to-Chip', cost: 450, pue: 1.15 },
          { level: 5, name: 'Immersion', cost: 900, pue: 1.05 }
        ]
      },
      network: {
        name: 'Networking',
        levels: [
          { level: 1, name: '10 GbE', cost: 20, speed: 10 },
          { level: 2, name: '25 GbE', cost: 60, speed: 25 },
          { level: 3, name: '100 GbE', cost: 180, speed: 100 },
          { level: 4, name: '400 GbE', cost: 500, speed: 400 },
          { level: 5, name: 'AI Fabric', cost: 1000, speed: 800, aiReady: true }
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
          { level: 1, name: 'HDD Arrays', cost: 15 },
          { level: 2, name: 'Hybrid Storage', cost: 40 },
          { level: 3, name: 'SSD Arrays', cost: 120 },
          { level: 4, name: 'NVMe Flash', cost: 300 },
          { level: 5, name: 'SCM/Optane', cost: 600 }
        ]
      },
      compute: {
        name: 'Compute',
        levels: [
          { level: 1, name: 'Basic Servers', cost: 20 },
          { level: 2, name: 'Mid-Range', cost: 50 },
          { level: 3, name: 'High-Core', cost: 150 },
          { level: 4, name: 'Multi-Socket', cost: 350 },
          { level: 5, name: 'Custom Silicon', cost: 700 }
        ]
      },
      hpc: {
        name: 'HPC',
        levels: [
          { level: 1, name: 'Basic Cluster', cost: 50 },
          { level: 2, name: 'InfiniBand', cost: 200 },
          { level: 3, name: 'Low-Latency', cost: 400 },
          { level: 4, name: 'Tightly Coupled', cost: 700 },
          { level: 5, name: 'Exascale Ready', cost: 1200 }
        ]
      },
      gpu: {
        name: 'GPU',
        levels: [
          { level: 1, name: 'Entry GPU', cost: 40 },
          { level: 2, name: 'Data Center GPU', cost: 200 },
          { level: 3, name: 'Multi-GPU Nodes', cost: 450 },
          { level: 4, name: 'GPU Clusters', cost: 800 },
          { level: 5, name: 'AI Supercompute', cost: 1500 }
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
          { level: 1, name: 'Manual Ops', cost: 15, opexMult: 1.0, recoveryMult: 1.0 },
          { level: 2, name: 'Basic DCIM', cost: 60, opexMult: 0.9, recoveryMult: 0.8 },
          { level: 3, name: 'Automated Alerts', cost: 150, opexMult: 0.8, recoveryMult: 0.6 },
          { level: 4, name: 'Predictive Maintenance', cost: 350, opexMult: 0.7, recoveryMult: 0.4 },
          { level: 5, name: 'Lights-Out', cost: 700, opexMult: 0.5, recoveryMult: 0.2 }
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
          { level: 2, name: 'Trend Analysis', cost: 40, accuracy: 0.65 },
          { level: 3, name: 'Market Models', cost: 100, accuracy: 0.75 },
          { level: 4, name: 'Predictive Analytics', cost: 250, accuracy: 0.85 },
          { level: 5, name: 'AI Forecasting', cost: 500, accuracy: 0.95 }
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
