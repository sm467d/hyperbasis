// Auth System - localStorage based

const Auth = {
    getUsers() {
        const users = localStorage.getItem('hyperbasis_users');
        return users ? JSON.parse(users) : {};
    },

    saveUsers(users) {
        localStorage.setItem('hyperbasis_users', JSON.stringify(users));
    },

    getSession() {
        const session = localStorage.getItem('hyperbasis_session');
        return session ? JSON.parse(session) : null;
    },

    saveSession(username) {
        localStorage.setItem('hyperbasis_session', JSON.stringify({
            username,
            loginTime: Date.now()
        }));
    },

    clearSession() {
        localStorage.removeItem('hyperbasis_session');
    },

    signup(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username and password required' };
        }
        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters' };
        }
        if (password.length < 4) {
            return { success: false, error: 'Password must be at least 4 characters' };
        }

        const users = this.getUsers();
        if (users[username]) {
            return { success: false, error: 'Username already exists' };
        }

        users[username] = {
            password: password,
            createdAt: Date.now(),
            saves: []
        };

        this.saveUsers(users);
        this.saveSession(username);
        return { success: true };
    },

    login(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username and password required' };
        }

        const users = this.getUsers();
        if (!users[username]) {
            return { success: false, error: 'User not found' };
        }
        if (users[username].password !== password) {
            return { success: false, error: 'Incorrect password' };
        }

        this.saveSession(username);
        return { success: true };
    },

    logout() {
        this.clearSession();
    },

    isLoggedIn() {
        return this.getSession() !== null;
    },

    getCurrentUser() {
        const session = this.getSession();
        return session ? session.username : null;
    },

    hasSaves() {
        const username = this.getCurrentUser();
        if (!username) return false;
        const users = this.getUsers();
        return users[username]?.saves?.length > 0;
    }
};

// Save Manager
const SaveManager = {
    getSaves() {
        const username = Auth.getCurrentUser();
        if (!username) return [];
        const users = Auth.getUsers();
        return users[username]?.saves || [];
    },

    saveGame(gameState) {
        const username = Auth.getCurrentUser();
        if (!username) return false;

        const users = Auth.getUsers();
        if (!users[username].saves) {
            users[username].saves = [];
        }

        const save = {
            id: Date.now(),
            companyName: gameState.companyName,
            capital: gameState.capital,
            ownedTiles: gameState.ownedTiles,
            difficulty: gameState.difficulty,
            region: gameState.region,
            savedAt: Date.now()
        };

        // Check if save with same company name exists, update it
        const existingIndex = users[username].saves.findIndex(s => s.companyName === save.companyName);
        if (existingIndex !== -1) {
            users[username].saves[existingIndex] = save;
        } else {
            users[username].saves.push(save);
        }

        Auth.saveUsers(users);
        return true;
    },

    deleteSave(saveId) {
        const username = Auth.getCurrentUser();
        if (!username) return false;

        const users = Auth.getUsers();
        if (!users[username].saves) return false;

        users[username].saves = users[username].saves.filter(s => s.id !== saveId);
        Auth.saveUsers(users);
        return true;
    },

    hasSaves() {
        return this.getSaves().length > 0;
    }
};

// Load Screen Controller
const LoadScreen = {
    init() {
        this.screen = document.getElementById('load-screen');
        this.savesList = document.getElementById('saves-list');
        this.backBtn = document.getElementById('load-back-btn');

        this.bindEvents();
    },

    bindEvents() {
        this.backBtn.addEventListener('click', () => this.hide());
    },

    show() {
        this.renderSaves();
        this.screen.classList.add('active');
    },

    hide() {
        this.screen.classList.remove('active');
        UI.showMainMenu();
    },

    renderSaves() {
        const saves = SaveManager.getSaves();
        this.savesList.innerHTML = '';

        if (saves.length === 0) {
            this.savesList.innerHTML = '<div class="no-saves">No saved games</div>';
            return;
        }

        // Sort by most recent
        saves.sort((a, b) => b.savedAt - a.savedAt);

        saves.forEach(save => {
            const item = document.createElement('div');
            item.className = 'save-item';

            const date = new Date(save.savedAt);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            item.innerHTML = `
                <div class="save-info">
                    <div class="save-name">${save.companyName}</div>
                    <div class="save-details">${save.difficulty} · ${save.ownedTiles.length} tiles · ${dateStr}</div>
                </div>
                <div class="save-capital">$${save.capital.toLocaleString()}</div>
                <button class="save-delete" data-id="${save.id}">Delete</button>
            `;

            // Click to load (but not on delete button)
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('save-delete')) {
                    this.loadSave(save);
                }
            });

            // Delete button
            const deleteBtn = item.querySelector('.save-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSave(save.id);
            });

            this.savesList.appendChild(item);
        });
    },

    loadSave(save) {
        this.hide();
        Game.load(save);
    },

    deleteSave(saveId) {
        if (confirm('Delete this save?')) {
            SaveManager.deleteSave(saveId);
            this.renderSaves();
            UI.updateLoadGameBtn();
        }
    }
};

// Game Config Controller
const GameConfig = {
    selectedRegion: 'north-america',
    selectedDifficulty: 'normal',

    init() {
        this.configScreen = document.getElementById('game-config');
        this.startBtn = document.getElementById('config-start-btn');
        this.backBtn = document.getElementById('config-back-btn');
        this.companyNameInput = document.getElementById('company-name');
        this.capitalInput = document.getElementById('starting-capital');
        this.difficultyOptions = document.querySelectorAll('.difficulty-option');

        this.bindEvents();
    },

    bindEvents() {
        // Difficulty single select
        this.difficultyOptions.forEach(opt => {
            opt.addEventListener('click', () => this.selectDifficulty(opt));
        });

        // Back button
        this.backBtn.addEventListener('click', () => {
            this.hide();
            UI.showMainMenu();
        });

        // Start button
        this.startBtn.addEventListener('click', () => this.startGame());
    },

    selectDifficulty(opt) {
        this.difficultyOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedDifficulty = opt.dataset.difficulty;
    },

    show() {
        this.configScreen.classList.add('active');
        this.reset();
    },

    hide() {
        this.configScreen.classList.remove('active');
    },

    reset() {
        this.selectedRegion = 'north-america';
        this.selectedDifficulty = 'normal';
        this.companyNameInput.value = '';
        this.capitalInput.value = 10000000;

        this.difficultyOptions.forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.difficulty === 'normal');
        });
    },

    getConfig() {
        return {
            companyName: this.companyNameInput.value.trim() || 'Unnamed Corp',
            startingCapital: parseInt(this.capitalInput.value) || 10000000,
            region: this.selectedRegion,
            difficulty: this.selectedDifficulty
        };
    },

    startGame() {
        const config = this.getConfig();
        this.hide();
        Game.start(config);
    }
};

// Research Tree Data
const ResearchTree = {
    infrastructure: {
        name: 'Infrastructure',
        subcategories: {
            power: {
                name: 'Power Density',
                levels: [
                    { level: 1, name: '5 kW/rack', cost: 0, unlocked: true, kw: 5 },
                    { level: 2, name: '10 kW/rack', cost: 50, kw: 10 },
                    { level: 3, name: '20 kW/rack', cost: 150, kw: 20 },
                    { level: 4, name: '50 kW/rack', cost: 400, kw: 50 },
                    { level: 5, name: '100 kW/rack', cost: 800, kw: 100 }
                ]
            },
            cooling: {
                name: 'Cooling',
                levels: [
                    { level: 1, name: 'Air (CRAC)', cost: 0, unlocked: true, pue: 1.8 },
                    { level: 2, name: 'Hot/Cold Aisle', cost: 75, pue: 1.5 },
                    { level: 3, name: 'Rear-Door Liquid', cost: 200, pue: 1.3 },
                    { level: 4, name: 'Direct-to-Chip', cost: 450, pue: 1.15 },
                    { level: 5, name: 'Immersion', cost: 900, pue: 1.05 }
                ]
            },
            network: {
                name: 'Networking',
                levels: [
                    { level: 1, name: '10 GbE', cost: 0, unlocked: true, speed: 10 },
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
                    { level: 1, name: 'HDD Arrays', cost: 0, unlocked: true },
                    { level: 2, name: 'Hybrid Storage', cost: 40 },
                    { level: 3, name: 'SSD Arrays', cost: 120 },
                    { level: 4, name: 'NVMe Flash', cost: 300 },
                    { level: 5, name: 'SCM/Optane', cost: 600 }
                ]
            },
            compute: {
                name: 'Compute',
                levels: [
                    { level: 1, name: 'Basic Servers', cost: 0, unlocked: true },
                    { level: 2, name: 'Mid-Range', cost: 50 },
                    { level: 3, name: 'High-Core', cost: 150 },
                    { level: 4, name: 'Multi-Socket', cost: 350 },
                    { level: 5, name: 'Custom Silicon', cost: 700 }
                ]
            },
            hpc: {
                name: 'HPC',
                levels: [
                    { level: 1, name: 'Basic Cluster', cost: 100 },
                    { level: 2, name: 'InfiniBand', cost: 200 },
                    { level: 3, name: 'Low-Latency', cost: 400 },
                    { level: 4, name: 'Tightly Coupled', cost: 700 },
                    { level: 5, name: 'Exascale Ready', cost: 1200 }
                ]
            },
            gpu: {
                name: 'GPU',
                levels: [
                    { level: 1, name: 'Entry GPU', cost: 80 },
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
                    { level: 1, name: 'Manual Ops', cost: 0, unlocked: true, opexMult: 1.0, recoveryMult: 1.0 },
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
                    { level: 1, name: 'Basic', cost: 0, unlocked: true, accuracy: 0.5 },
                    { level: 2, name: 'Trend Analysis', cost: 40, accuracy: 0.65 },
                    { level: 3, name: 'Market Models', cost: 100, accuracy: 0.75 },
                    { level: 4, name: 'Predictive Analytics', cost: 250, accuracy: 0.85 },
                    { level: 5, name: 'AI Forecasting', cost: 500, accuracy: 0.95 }
                ]
            }
        }
    }
};

// Reliability Calculator
const Reliability = {
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
    },

    calculate(choices, opsLevel) {
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

        // Ops level affects recovery time, slight boost to overall reliability
        if (opsLevel) {
            score = Math.min(100, score + (opsLevel * 2));
        }

        return Math.round(score);
    },

    getMaxSLA(score) {
        if (score >= 95) return { sla: '99.999%', tier: 'Tier IV+', customers: 'Mission-Critical' };
        if (score >= 85) return { sla: '99.99%', tier: 'Tier IV', customers: 'Finance, Healthcare' };
        if (score >= 70) return { sla: '99.95%', tier: 'Tier III', customers: 'Enterprise' };
        if (score >= 50) return { sla: '99.9%', tier: 'Tier II', customers: 'SMB, Standard' };
        return { sla: '99.5%', tier: 'Tier I', customers: 'Budget, Dev/Test' };
    },

    getIncidentChance(score) {
        // Base 5% monthly, reduced by reliability
        const base = 0.05;
        const reduction = score / 100;
        return base * (1 - reduction * 0.9); // Max 90% reduction
    }
};

// Research Controller
const Research = {
    state: {}, // { 'infrastructure.power': 1, 'hardware.gpu': 2, etc. }
    points: 0,

    init() {
        this.container = document.getElementById('research-tree');
        this.pointsDisplay = document.getElementById('research-points');
        this.render();
    },

    getLevel(branchId, subId) {
        const key = `${branchId}.${subId}`;
        return this.state[key] || 0;
    },

    setLevel(branchId, subId, level) {
        const key = `${branchId}.${subId}`;
        this.state[key] = level;
    },

    canUnlock(branchId, subId, level) {
        const branch = ResearchTree[branchId];
        if (!branch) return false;

        const sub = branch.subcategories[subId];
        if (!sub) return false;

        const levelData = sub.levels.find(l => l.level === level);
        if (!levelData) return false;

        if (levelData.unlocked) return false;

        const currentLevel = this.getLevel(branchId, subId);
        if (level !== currentLevel + 1) return false; // Must unlock sequentially

        return this.points >= levelData.cost;
    },

    unlock(branchId, subId, level) {
        if (!this.canUnlock(branchId, subId, level)) return false;

        const branch = ResearchTree[branchId];
        const sub = branch.subcategories[subId];
        const levelData = sub.levels.find(l => l.level === level);

        this.points -= levelData.cost;
        this.setLevel(branchId, subId, level);
        this.render();
        return true;
    },

    render() {
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

                    const isUnlocked = levelData.unlocked || levelData.level <= currentLevel;
                    const canUnlock = this.canUnlock(branchId, subId, levelData.level);
                    const isNext = levelData.level === currentLevel + 1;

                    if (isUnlocked) {
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
                        <div class="level-cost">${levelData.unlocked ? '—' : levelData.cost + ' pts'}</div>
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

        if (this.pointsDisplay) {
            this.pointsDisplay.textContent = this.points;
        }
    },

    getState() {
        return { state: this.state, points: this.points };
    },

    loadState(data) {
        this.state = data.state || {};
        this.points = data.points || 0;
        this.render();
    }
};

// Metro Map Generator
const MetroMapGen = {
    generateNoVA() {
        const cols = 50;
        const rows = 40;
        const grid = [];

        // Define regions with their center points and properties
        const regions = [
            { name: 'Leesburg', cx: 8, cy: 4, radius: 4, available: true, priceBase: 800000 },
            { name: 'Purcellville', cx: 3, cy: 3, radius: 3, available: true, priceBase: 600000 },
            { name: 'Ashburn', cx: 15, cy: 8, radius: 6, available: true, priceBase: 2000000 },
            { name: 'Sterling', cx: 22, cy: 9, radius: 4, available: true, priceBase: 1500000 },
            { name: 'Dulles', cx: 18, cy: 13, radius: 5, available: true, priceBase: 2200000 },
            { name: 'Herndon', cx: 26, cy: 11, radius: 3, available: true, priceBase: 1400000 },
            { name: 'Reston', cx: 30, cy: 12, radius: 4, available: true, priceBase: 1600000 },
            { name: 'Chantilly', cx: 20, cy: 18, radius: 4, available: true, priceBase: 1300000 },
            { name: 'Centreville', cx: 16, cy: 20, radius: 4, available: true, priceBase: 1000000 },
            { name: 'Gainesville', cx: 8, cy: 18, radius: 4, available: true, priceBase: 750000 },
            { name: 'Haymarket', cx: 4, cy: 20, radius: 3, available: true, priceBase: 650000 },
            { name: 'Manassas', cx: 12, cy: 24, radius: 5, available: true, priceBase: 1100000 },
            { name: 'Warrenton', cx: 4, cy: 30, radius: 4, available: true, priceBase: 550000 },
            { name: 'Woodbridge', cx: 32, cy: 30, radius: 4, available: true, priceBase: 700000 },
            { name: 'Stafford', cx: 28, cy: 36, radius: 4, available: true, priceBase: 450000 },
            // Unavailable urban areas
            { name: 'Tysons', cx: 35, cy: 14, radius: 4, available: false, priceBase: 0 },
            { name: 'McLean', cx: 40, cy: 12, radius: 3, available: false, priceBase: 0 },
            { name: 'Vienna', cx: 34, cy: 18, radius: 3, available: false, priceBase: 0 },
            { name: 'Fairfax', cx: 30, cy: 20, radius: 4, available: false, priceBase: 0 },
            { name: 'Falls Church', cx: 40, cy: 16, radius: 2, available: false, priceBase: 0 },
            { name: 'Arlington', cx: 44, cy: 14, radius: 4, available: false, priceBase: 0 },
            { name: 'Alexandria', cx: 44, cy: 22, radius: 4, available: false, priceBase: 0 },
            { name: 'Springfield', cx: 36, cy: 26, radius: 3, available: false, priceBase: 0 },
            { name: 'Burke', cx: 32, cy: 24, radius: 2, available: false, priceBase: 0 },
            { name: 'Annandale', cx: 38, cy: 20, radius: 2, available: false, priceBase: 0 },
        ];

        // Generate grid
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let tile = null;

                // Check if point is in any region
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

        // Labels for display
        const labels = regions.map(r => ({
            name: r.name,
            x: r.cx * 29,
            y: r.cy * 29,
            major: ['Ashburn', 'Dulles', 'Tysons', 'Arlington', 'Manassas'].includes(r.name)
        }));

        return { name: 'Northern Virginia', cols, rows, grid, labels };
    }
};

const MetroData = {
    'nova': MetroMapGen.generateNoVA()
};

// Game Controller
const Game = {
    config: null,
    capital: 0,
    ownedTiles: [],
    currentView: 'na-map', // 'na-map' or 'metro'

    init() {
        this.gameScreen = document.getElementById('game-screen');
        this.companyNameEl = document.getElementById('game-company-name');
        this.capitalEl = document.getElementById('game-capital');
        this.menuBtn = document.getElementById('game-menu-btn');
        this.saveBtn = document.getElementById('game-save-btn');
        this.mapTiles = document.querySelectorAll('.map-tile.metro');

        // View panels
        this.viewNaMap = document.getElementById('view-na-map');
        this.viewMetro = document.getElementById('view-metro');

        // Sidebar
        this.sidebarBtns = document.querySelectorAll('.game-sidebar .sidebar-btn');
        this.tabPanels = document.querySelectorAll('.game-main .tab-panel');

        this.bindEvents();
    },

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.returnToMenu());
        this.saveBtn.addEventListener('click', () => this.save());

        this.mapTiles.forEach(tile => {
            tile.addEventListener('click', () => this.selectMetro(tile.dataset.metro));
        });

        // Sidebar tab switching
        this.sidebarBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    },

    switchTab(tabName) {
        // Update sidebar buttons
        this.sidebarBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });

        // Clear metro selection when leaving home
        if (tabName !== 'home') {
            Metro.clearSelection();
            Metro.setMode('pan');
        }
    },

    start(config) {
        this.config = config;
        this.capital = config.startingCapital;
        this.ownedTiles = [];

        this.companyNameEl.textContent = config.companyName;
        this.updateCapitalDisplay();
        this.showView('na-map');
        this.switchTab('home');

        // Initialize research with starting points
        Research.state = {};
        Research.points = 100;
        Research.init();

        this.gameScreen.classList.add('active');
    },

    load(save) {
        this.config = {
            companyName: save.companyName,
            startingCapital: save.capital,
            difficulty: save.difficulty,
            region: save.region
        };
        this.capital = save.capital;
        this.ownedTiles = save.ownedTiles || [];

        this.companyNameEl.textContent = save.companyName;
        this.updateCapitalDisplay();
        this.showView('na-map');
        this.switchTab('home');

        // Load research state
        Research.loadState(save.research || { state: {}, points: 100 });

        this.gameScreen.classList.add('active');
    },

    save() {
        const gameState = {
            companyName: this.config.companyName,
            capital: this.capital,
            ownedTiles: this.ownedTiles,
            difficulty: this.config.difficulty,
            region: this.config.region,
            research: Research.getState()
        };

        if (SaveManager.saveGame(gameState)) {
            this.saveBtn.textContent = 'Saved!';
            setTimeout(() => {
                this.saveBtn.textContent = 'Save';
            }, 1000);
            UI.updateLoadGameBtn();
        }
    },

    updateCapitalDisplay() {
        this.capitalEl.textContent = '$' + this.capital.toLocaleString();
    },

    showView(view) {
        this.currentView = view;
        this.viewNaMap.classList.toggle('active', view === 'na-map');
        this.viewMetro.classList.toggle('active', view === 'metro');
    },

    selectMetro(metroId) {
        if (MetroData[metroId]) {
            Metro.show(metroId);
            this.showView('metro');
        } else {
            console.log('Metro not yet available:', metroId);
        }
    },

    returnToMenu() {
        this.gameScreen.classList.remove('active');
        UI.showMainMenu();
    },

    showMap() {
        this.showView('na-map');
    }
};

// Metro Detail Controller with Pan/Zoom
const Metro = {
    currentMetro: null,
    mode: 'pan', // 'pan' or 'select'

    // Pan/zoom state
    panX: 0,
    panY: 0,
    zoom: 1,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0,

    // Selection state
    isSelecting: false,
    selectedTiles: [],
    tileElements: {},

    init() {
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
        this.buyBtn = document.getElementById('selection-buy');
        this.coordsDisplay = document.getElementById('coords-display');
        this.modePan = document.getElementById('mode-pan');
        this.modeSelect = document.getElementById('mode-select');
        this.zoomIn = document.getElementById('zoom-in');
        this.zoomOut = document.getElementById('zoom-out');

        this.bindEvents();
    },

    bindEvents() {
        this.backBtn.addEventListener('click', () => this.goBack());
        this.cancelBtn.addEventListener('click', () => this.clearSelection());
        this.buyBtn.addEventListener('click', () => this.buySelected());

        // Mode toggle
        this.modePan.addEventListener('click', () => this.setMode('pan'));
        this.modeSelect.addEventListener('click', () => this.setMode('select'));

        // Zoom buttons
        this.zoomIn.addEventListener('click', () => this.setZoom(this.zoom * 1.25));
        this.zoomOut.addEventListener('click', () => this.setZoom(this.zoom / 1.25));

        // Mouse wheel zoom
        this.mapViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.setZoom(this.zoom * delta);
        });

        // Pan/select with mouse
        this.mapViewport.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Coords display
        this.mapViewport.addEventListener('mousemove', (e) => this.updateCoords(e));
    },

    setMode(mode) {
        this.mode = mode;
        this.modePan.classList.toggle('active', mode === 'pan');
        this.modeSelect.classList.toggle('active', mode === 'select');
        this.metroContent.classList.toggle('selecting', mode === 'select');

        // Clear selection when switching to pan
        if (mode === 'pan') {
            this.clearSelection();
        }
    },

    setZoom(newZoom) {
        this.zoom = Math.max(0.5, Math.min(3, newZoom));
        this.updateTransform();
    },

    updateTransform() {
        this.mapWorld.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    },

    onMouseDown(e) {
        if (e.target.closest('.map-controls') || e.target.closest('.mode-toggle') || e.target.closest('.selection-info')) return;

        if (this.mode === 'pan') {
            this.isPanning = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.metroContent.classList.add('dragging');
        } else if (this.mode === 'select') {
            this.isSelecting = true;
            // Check if we clicked on a tile
            const tile = e.target.closest('.land-tile.available');
            if (tile && tile.dataset.tileId) {
                const entry = this.tileElements[tile.dataset.tileId];
                if (entry) {
                    this.toggleTileSelection(entry.tile, entry.el);
                }
            }
        }
    },

    onMouseMove(e) {
        if (this.isPanning) {
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            this.panX += dx;
            this.panY += dy;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.updateTransform();
        } else if (this.isSelecting && this.mode === 'select') {
            // Drag selection
            const tile = document.elementFromPoint(e.clientX, e.clientY);
            if (tile && tile.classList.contains('land-tile') && tile.classList.contains('available') && tile.dataset.tileId) {
                const entry = this.tileElements[tile.dataset.tileId];
                if (entry && !this.selectedTiles.find(t => t.id === entry.tile.id)) {
                    this.addTileToSelection(entry.tile, entry.el);
                }
            }
        }
    },

    onMouseUp(e) {
        this.isPanning = false;
        this.isSelecting = false;
        this.metroContent.classList.remove('dragging');
    },

    updateCoords(e) {
        const rect = this.mapViewport.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - this.panX) / this.zoom / 29);
        const y = Math.floor((e.clientY - rect.top - this.panY) / this.zoom / 29);
        this.coordsDisplay.textContent = `${x}, ${y}`;
    },

    show(metroId) {
        this.currentMetro = metroId;
        const data = MetroData[metroId];

        this.clearSelection();

        // Reset view
        this.panX = 100;
        this.panY = 50;
        this.zoom = 1;
        this.updateTransform();
        this.setMode('pan');

        this.renderGrid(data);
        this.renderLabels(data.labels);
    },

    goBack() {
        Game.showMap();
    },

    renderGrid(data) {
        this.landGrid.innerHTML = '';
        this.landGrid.style.gridTemplateColumns = `repeat(${data.cols}, 28px)`;
        this.tileElements = {};

        data.grid.forEach((tile, index) => {
            const el = document.createElement('div');
            el.className = 'land-tile';

            if (!tile) {
                // Empty tile - no special class
            } else {
                const isOwned = Game.ownedTiles.includes(tile.id);

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

            this.landGrid.appendChild(el);
        });
    },

    renderLabels(labels) {
        this.regionLabels.innerHTML = '';

        labels.forEach(label => {
            const el = document.createElement('div');
            el.className = 'region-label' + (label.major ? ' major' : '');
            el.textContent = label.name;
            el.style.left = label.x + 'px';
            el.style.top = label.y + 'px';
            this.regionLabels.appendChild(el);
        });
    },

    toggleTileSelection(tile, el) {
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

    addTileToSelection(tile, el) {
        if (!this.selectedTiles.find(t => t.id === tile.id)) {
            this.selectedTiles.push(tile);
            el.classList.add('selecting');
            this.updateSelectionUI();
        }
    },

    clearSelection() {
        this.selectedTiles.forEach(tile => {
            const entry = this.tileElements[tile.id];
            if (entry) entry.el.classList.remove('selecting');
        });
        this.selectedTiles = [];
        this.updateSelectionUI();
    },

    updateSelectionUI() {
        const count = this.selectedTiles.length;
        const total = this.selectedTiles.reduce((sum, t) => sum + t.price, 0);

        this.selectionCount.textContent = count;
        this.selectionTotal.textContent = '$' + total.toLocaleString();

        if (count > 0) {
            this.selectionInfo.classList.add('active');
            this.buyBtn.disabled = total > Game.capital;
        } else {
            this.selectionInfo.classList.remove('active');
        }
    },

    buySelected() {
        const total = this.selectedTiles.reduce((sum, t) => sum + t.price, 0);

        if (total <= Game.capital) {
            Game.capital -= total;
            this.selectedTiles.forEach(tile => {
                Game.ownedTiles.push(tile.id);
            });

            Game.updateCapitalDisplay();
            this.updateCapitalDisplay();
            this.selectedTiles = [];
            this.renderGrid(MetroData[this.currentMetro]);
            this.renderLabels(MetroData[this.currentMetro].labels);
            this.updateSelectionUI();
        }
    }
};

// UI Controller
const UI = {
    init() {
        this.landing = document.getElementById('landing');
        this.mainMenu = document.getElementById('main-menu');
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.tabs = document.querySelectorAll('.auth-tab');
        this.logoutBtn = document.getElementById('logout-btn');
        this.displayUsername = document.getElementById('display-username');
        this.loadGameBtn = document.getElementById('load-game-btn');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.bindEvents();
        this.checkSession();

        // Initialize game config, game, metro, and load screen
        GameConfig.init();
        Game.init();
        Metro.init();
        LoadScreen.init();
    },

    bindEvents() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Login form
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            this.handleLogin(username, password);
        });

        // Signup form
        this.signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            this.handleSignup(username, password, confirm);
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // New Game - show config
        this.newGameBtn.addEventListener('click', () => {
            this.hideMainMenu();
            GameConfig.show();
        });

        // Load Game
        this.loadGameBtn.addEventListener('click', () => {
            this.hideMainMenu();
            LoadScreen.show();
        });
    },

    updateLoadGameBtn() {
        this.loadGameBtn.disabled = !SaveManager.hasSaves();
    },

    switchTab(tab) {
        this.tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        this.loginForm.classList.remove('active');
        this.signupForm.classList.remove('active');

        if (tab === 'login') {
            this.loginForm.classList.add('active');
        } else {
            this.signupForm.classList.add('active');
        }

        this.clearErrors();
    },

    handleLogin(username, password) {
        const result = Auth.login(username, password);
        if (result.success) {
            this.showMainMenu();
        } else {
            this.showError('login-error', result.error);
        }
    },

    handleSignup(username, password, confirm) {
        if (password !== confirm) {
            this.showError('signup-error', 'Passwords do not match');
            return;
        }

        const result = Auth.signup(username, password);
        if (result.success) {
            this.showMainMenu();
        } else {
            this.showError('signup-error', result.error);
        }
    },

    handleLogout() {
        Auth.logout();
        this.showLanding();
    },

    showError(elementId, message) {
        const el = document.getElementById(elementId);
        el.textContent = message;
        el.classList.add('show');
    },

    clearErrors() {
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
    },

    checkSession() {
        if (Auth.isLoggedIn()) {
            this.showMainMenu();
        } else {
            this.showLanding();
        }
    },

    showLanding() {
        this.landing.classList.remove('hidden');
        this.mainMenu.classList.remove('active');
        this.mainMenu.classList.remove('hidden');
        GameConfig.hide();
        this.clearForms();
    },

    showMainMenu() {
        this.landing.classList.add('hidden');
        this.mainMenu.classList.remove('hidden');
        this.mainMenu.classList.add('active');
        this.displayUsername.textContent = Auth.getCurrentUser();
        this.loadGameBtn.disabled = !SaveManager.hasSaves();
    },

    hideMainMenu() {
        this.mainMenu.classList.add('hidden');
        this.mainMenu.classList.remove('active');
    },

    clearForms() {
        this.loginForm.reset();
        this.signupForm.reset();
        this.clearErrors();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
