// Auth System - localStorage based

const Auth = {
    // Get all users from localStorage
    getUsers() {
        const users = localStorage.getItem('infratycoon_users');
        return users ? JSON.parse(users) : {};
    },

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem('infratycoon_users', JSON.stringify(users));
    },

    // Get current session
    getSession() {
        const session = localStorage.getItem('infratycoon_session');
        return session ? JSON.parse(session) : null;
    },

    // Save session
    saveSession(username) {
        localStorage.setItem('infratycoon_session', JSON.stringify({
            username,
            loginTime: Date.now()
        }));
    },

    // Clear session
    clearSession() {
        localStorage.removeItem('infratycoon_session');
    },

    // Sign up
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

        // Store user (in real app, hash the password!)
        users[username] = {
            password: password,
            createdAt: Date.now(),
            gameData: null
        };

        this.saveUsers(users);
        this.saveSession(username);

        return { success: true };
    },

    // Login
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

    // Logout
    logout() {
        this.clearSession();
    },

    // Check if logged in
    isLoggedIn() {
        return this.getSession() !== null;
    },

    // Get current username
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.username : null;
    }
};

// UI Controller
const UI = {
    init() {
        this.landing = document.getElementById('landing');
        this.game = document.getElementById('game');
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.tabs = document.querySelectorAll('.auth-tab');
        this.logoutBtn = document.getElementById('logout-btn');
        this.displayUsername = document.getElementById('display-username');

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

        // Clear errors
        this.clearErrors();
    },

    handleLogin(username, password) {
        const result = Auth.login(username, password);

        if (result.success) {
            this.showGame();
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
            this.showGame();
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
            this.showGame();
        } else {
            this.showLanding();
        }
    },

    showLanding() {
        this.landing.classList.remove('hidden');
        this.game.classList.remove('active');
        this.clearForms();
    },

    showGame() {
        this.landing.classList.add('hidden');
        this.game.classList.add('active');
        this.displayUsername.textContent = Auth.getCurrentUser();
        // Initialize game
        Game.init();
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
