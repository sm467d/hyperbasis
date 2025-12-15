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

        // New Game (placeholder)
        this.newGameBtn.addEventListener('click', () => {
            alert('Game not yet implemented');
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
        this.clearForms();
    },

    showMainMenu() {
        this.landing.classList.add('hidden');
        this.mainMenu.classList.add('active');
        this.displayUsername.textContent = Auth.getCurrentUser();

        // Enable/disable load button based on saves
        this.loadGameBtn.disabled = !Auth.hasSaves();
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
