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

    init() {
        this.gameScreen = document.getElementById('game-screen');
        this.companyNameEl = document.getElementById('game-company-name');
        this.capitalEl = document.getElementById('game-capital');
        this.menuBtn = document.getElementById('game-menu-btn');
        this.mapTiles = document.querySelectorAll('.map-tile.metro');

        this.bindEvents();
    },

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.returnToMenu());

        this.mapTiles.forEach(tile => {
            tile.addEventListener('click', () => this.selectMetro(tile.dataset.metro));
        });
    },

    start(config) {
        this.config = config;
        this.capital = config.startingCapital;
        this.ownedTiles = [];

        this.companyNameEl.textContent = config.companyName;
        this.updateCapitalDisplay();

        this.gameScreen.classList.add('active');
    },

    updateCapitalDisplay() {
        this.capitalEl.textContent = '$' + this.capital.toLocaleString();
    },

    selectMetro(metroId) {
        if (MetroData[metroId]) {
            this.gameScreen.classList.remove('active');
            Metro.show(metroId);
        } else {
            console.log('Metro not yet available:', metroId);
        }
    },

    returnToMenu() {
        this.gameScreen.classList.remove('active');
        UI.showMainMenu();
    },

    showMap() {
        this.gameScreen.classList.add('active');
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
        this.detailScreen = document.getElementById('metro-detail');
        this.titleEl = document.getElementById('metro-title');
        this.capitalEl = document.getElementById('metro-capital');
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

        this.titleEl.textContent = data.name;
        this.updateCapitalDisplay();
        this.clearSelection();

        // Reset view
        this.panX = 100;
        this.panY = 50;
        this.zoom = 1;
        this.updateTransform();
        this.setMode('pan');

        this.renderGrid(data);
        this.renderLabels(data.labels);

        this.detailScreen.classList.add('active');
    },

    hide() {
        this.detailScreen.classList.remove('active');
    },

    goBack() {
        this.hide();
        Game.showMap();
    },

    updateCapitalDisplay() {
        this.capitalEl.textContent = '$' + Game.capital.toLocaleString();
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

        // Initialize game config, game, and metro
        GameConfig.init();
        Game.init();
        Metro.init();
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

        // Load Game (placeholder)
        this.loadGameBtn.addEventListener('click', () => {
            alert('No saves available');
        });
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
        this.loadGameBtn.disabled = !Auth.hasSaves();
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
