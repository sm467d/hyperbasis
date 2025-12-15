// Game State Management

const GameState = {
    // Default new game state
    createNew() {
        return {
            money: 100000,
            power: 0,
            cooling: 0,
            grid: this.createEmptyGrid(10, 10),
            racks: [],
            createdAt: Date.now(),
            lastSaved: null
        };
    },

    // Create empty grid
    createEmptyGrid(width, height) {
        const grid = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push({ type: 'empty', x, y });
            }
            grid.push(row);
        }
        return grid;
    },

    // Save game for current user
    save(username, state) {
        const users = Auth.getUsers();
        if (users[username]) {
            state.lastSaved = Date.now();
            users[username].gameData = state;
            Auth.saveUsers(users);
            return true;
        }
        return false;
    },

    // Load game for current user
    load(username) {
        const users = Auth.getUsers();
        if (users[username] && users[username].gameData) {
            return users[username].gameData;
        }
        return null;
    },

    // Delete save for current user
    deleteSave(username) {
        const users = Auth.getUsers();
        if (users[username]) {
            users[username].gameData = null;
            Auth.saveUsers(users);
            return true;
        }
        return false;
    }
};

// Game Controller
const Game = {
    state: null,
    selectedTool: 'rack',
    gridElement: null,

    init() {
        this.gridElement = document.getElementById('datacenter-grid');
        this.moneyDisplay = document.getElementById('money-display');
        this.powerDisplay = document.getElementById('power-display');
        this.coolingDisplay = document.getElementById('cooling-display');
        this.saveBtn = document.getElementById('save-btn');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.bindEvents();
        this.loadOrCreate();
    },

    bindEvents() {
        this.saveBtn.addEventListener('click', () => this.saveGame());
        this.newGameBtn.addEventListener('click', () => this.confirmNewGame());

        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
        });
    },

    loadOrCreate() {
        const username = Auth.getCurrentUser();
        const savedGame = GameState.load(username);

        if (savedGame) {
            this.state = savedGame;
            this.showMessage('Game loaded');
        } else {
            this.state = GameState.createNew();
            this.showMessage('New game started');
        }

        this.renderGrid();
        this.updateStats();
    },

    saveGame() {
        const username = Auth.getCurrentUser();
        if (GameState.save(username, this.state)) {
            this.showMessage('Game saved');
        }
    },

    confirmNewGame() {
        if (confirm('Start a new game? Current progress will be lost.')) {
            const username = Auth.getCurrentUser();
            GameState.deleteSave(username);
            this.state = GameState.createNew();
            this.renderGrid();
            this.updateStats();
            this.showMessage('New game started');
        }
    },

    selectTool(tool) {
        this.selectedTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    },

    renderGrid() {
        this.gridElement.innerHTML = '';

        for (let y = 0; y < this.state.grid.length; y++) {
            for (let x = 0; x < this.state.grid[y].length; x++) {
                const cell = this.state.grid[y][x];
                const cellEl = document.createElement('div');
                cellEl.className = `grid-cell ${cell.type}`;
                cellEl.dataset.x = x;
                cellEl.dataset.y = y;

                if (cell.type === 'rack') {
                    cellEl.innerHTML = '<span class="rack-icon">▮</span>';
                }

                cellEl.addEventListener('click', () => this.handleCellClick(x, y));
                this.gridElement.appendChild(cellEl);
            }
        }
    },

    handleCellClick(x, y) {
        const cell = this.state.grid[y][x];

        if (this.selectedTool === 'rack') {
            if (cell.type === 'empty') {
                if (this.state.money >= 5000) {
                    this.state.money -= 5000;
                    this.state.grid[y][x] = { type: 'rack', x, y, servers: 0 };
                    this.state.power += 10;
                    this.state.cooling += 5;
                    this.renderGrid();
                    this.updateStats();
                } else {
                    this.showMessage('Not enough money');
                }
            }
        } else if (this.selectedTool === 'delete') {
            if (cell.type === 'rack') {
                this.state.grid[y][x] = { type: 'empty', x, y };
                this.state.money += 2500; // Sell back at half price
                this.state.power -= 10;
                this.state.cooling -= 5;
                this.renderGrid();
                this.updateStats();
            }
        }
    },

    updateStats() {
        this.moneyDisplay.textContent = '$' + this.state.money.toLocaleString();
        this.powerDisplay.textContent = this.state.power + ' kW';
        this.coolingDisplay.textContent = this.state.cooling + ' tons';
    },

    showMessage(msg) {
        const msgEl = document.getElementById('game-message');
        msgEl.textContent = msg;
        msgEl.classList.add('show');
        setTimeout(() => msgEl.classList.remove('show'), 2000);
    }
};
