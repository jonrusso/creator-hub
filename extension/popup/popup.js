/**
 * Shadow Sync - Popup JavaScript
 * Handles configuration, authentication, and status display
 */

// DOM Elements
const elements = {
    statusIndicator: document.getElementById('status-indicator'),
    statusText: document.getElementById('status-text'),
    message: document.getElementById('message'),

    // Sections
    configSection: document.getElementById('config-section'),
    loginSection: document.getElementById('login-section'),
    connectedSection: document.getElementById('connected-section'),

    // Config inputs
    supabaseUrl: document.getElementById('supabase-url'),
    supabaseKey: document.getElementById('supabase-key'),
    saveConfigBtn: document.getElementById('save-config-btn'),

    // Login inputs
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    syncAuthBtn: document.getElementById('sync-auth-btn'),

    // Connected buttons
    logoutBtn: document.getElementById('logout-btn'),
    resetConfigBtn: document.getElementById('reset-config-btn')
};

// State
let config = {
    supabaseUrl: null,
    supabaseKey: null
};
let authState = {
    isAuthenticated: false,
    userId: null
};

/**
 * Initialize popup
 */
async function init() {
    // Load saved config
    const stored = await chrome.storage.local.get(['supabaseUrl', 'supabaseKey']);
    config.supabaseUrl = stored.supabaseUrl || null;
    config.supabaseKey = stored.supabaseKey || null;

    // Pre-fill config inputs
    if (config.supabaseUrl) elements.supabaseUrl.value = config.supabaseUrl;
    if (config.supabaseKey) elements.supabaseKey.value = config.supabaseKey;

    // Get auth state from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
    authState = response.data || { isAuthenticated: false };

    // Update UI
    updateUI();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Update UI based on current state
 */
function updateUI() {
    // Hide all sections first
    elements.configSection.classList.remove('active');
    elements.loginSection.classList.remove('active');
    elements.connectedSection.classList.remove('active');

    if (!config.supabaseUrl || !config.supabaseKey) {
        // Not configured
        elements.statusIndicator.classList.remove('connected');
        elements.statusText.innerHTML = '<strong>Not configured</strong>';
        elements.configSection.classList.add('active');
    } else if (!authState.isAuthenticated) {
        // Configured but not logged in
        elements.statusIndicator.classList.remove('connected');
        elements.statusText.innerHTML = 'Configured, <strong>please login</strong>';
        elements.loginSection.classList.add('active');
    } else {
        // Connected
        elements.statusIndicator.classList.add('connected');
        elements.statusText.innerHTML = '<strong>Connected</strong> - Ready to sync';
        elements.connectedSection.classList.add('active');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Save config
    elements.saveConfigBtn.addEventListener('click', handleSaveConfig);

    // Login
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.syncAuthBtn.addEventListener('click', handleSyncAuth);

    // Logout & Reset
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.resetConfigBtn.addEventListener('click', handleResetConfig);

    // Enter key submits forms
    elements.supabaseKey.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSaveConfig();
    });
    elements.password.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

/**
 * Handle save configuration
 */
async function handleSaveConfig() {
    const url = elements.supabaseUrl.value.trim();
    const key = elements.supabaseKey.value.trim();

    if (!url || !key) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // Validate URL format
    if (!url.includes('supabase.co')) {
        showMessage('Invalid Supabase URL', 'error');
        return;
    }

    elements.saveConfigBtn.disabled = true;
    elements.saveConfigBtn.innerHTML = '<span class="loading"><span class="spinner"></span> Saving...</span>';

    try {
        // Save to background
        await chrome.runtime.sendMessage({
            type: 'SET_CONFIG',
            payload: { supabaseUrl: url, supabaseKey: key }
        });

        config.supabaseUrl = url;
        config.supabaseKey = key;

        showMessage('Configuration saved!', 'success');
        updateUI();

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        elements.saveConfigBtn.disabled = false;
        elements.saveConfigBtn.textContent = 'Save Configuration';
    }
}

/**
 * Handle login
 */
async function handleLogin() {
    const email = elements.email.value.trim();
    const password = elements.password.value;

    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    elements.loginBtn.disabled = true;
    elements.loginBtn.innerHTML = '<span class="loading"><span class="spinner"></span> Logging in...</span>';

    try {
        // Call Supabase auth directly
        const authUrl = `${config.supabaseUrl}/auth/v1/token?grant_type=password`;

        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.supabaseKey
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || error.message || 'Login failed');
        }

        const data = await response.json();

        // Save token to background
        await chrome.runtime.sendMessage({
            type: 'SET_AUTH_TOKEN',
            payload: {
                accessToken: data.access_token,
                userId: data.user.id
            }
        });

        authState = {
            isAuthenticated: true,
            userId: data.user.id
        };

        showMessage('Logged in successfully!', 'success');
        updateUI();

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        elements.loginBtn.disabled = false;
        elements.loginBtn.textContent = 'Login';
    }
}

/**
 * Handle sync auth from Creator Hub
 */
async function handleSyncAuth() {
    elements.syncAuthBtn.disabled = true;
    elements.syncAuthBtn.innerHTML = '<span class="loading"><span class="spinner"></span> Syncing...</span>';

    try {
        // Find Creator Hub tab and extract auth
        const tabs = await chrome.tabs.query({ url: '*://localhost:5173/*' });

        if (tabs.length === 0) {
            throw new Error('Please open Creator Hub first');
        }

        // Execute script in Hub tab
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                // Look for Supabase session in localStorage
                const keys = Object.keys(localStorage);
                for (const key of keys) {
                    if (key.includes('supabase') || key.includes('auth')) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key));
                            if (data?.access_token) {
                                return {
                                    accessToken: data.access_token,
                                    userId: data.user?.id
                                };
                            }
                        } catch (e) { }
                    }
                }
                return null;
            }
        });

        if (!results?.[0]?.result) {
            throw new Error('No active session found. Please login to Creator Hub first.');
        }

        const { accessToken, userId } = results[0].result;

        // Save token
        await chrome.runtime.sendMessage({
            type: 'SET_AUTH_TOKEN',
            payload: { accessToken, userId }
        });

        authState = {
            isAuthenticated: true,
            userId
        };

        showMessage('Synced successfully!', 'success');
        updateUI();

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        elements.syncAuthBtn.disabled = false;
        elements.syncAuthBtn.textContent = 'Sync from Creator Hub';
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    await chrome.storage.local.remove(['accessToken', 'userId']);

    authState = {
        isAuthenticated: false,
        userId: null
    };

    showMessage('Logged out', 'success');
    updateUI();
}

/**
 * Handle reset configuration
 */
async function handleResetConfig() {
    await chrome.storage.local.remove(['supabaseUrl', 'supabaseKey', 'accessToken', 'userId']);

    config = { supabaseUrl: null, supabaseKey: null };
    authState = { isAuthenticated: false, userId: null };

    elements.supabaseUrl.value = '';
    elements.supabaseKey.value = '';

    showMessage('Configuration reset', 'success');
    updateUI();
}

/**
 * Show message
 */
function showMessage(text, type) {
    elements.message.textContent = text;
    elements.message.className = `message ${type}`;
    elements.message.classList.remove('hidden');

    // Auto hide after 4 seconds
    setTimeout(() => {
        elements.message.classList.add('hidden');
    }, 4000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
