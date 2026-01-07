/**
 * Shadow Sync - Background Service Worker
 * Handles authentication bridge and message passing between content scripts and popup
 */

// Configuration
const CONFIG = {
    // Creator Hub app URL (for auth token retrieval)
    hubUrl: 'http://localhost:5173',

    // Supabase configuration (fetched from storage or popup)
    supabaseUrl: null,
    supabaseKey: null
};

// Current auth state
let authState = {
    isAuthenticated: false,
    userId: null,
    accessToken: null
};

/**
 * Initialize extension on install/update
 */
chrome.runtime.onInstalled.addListener(async () => {
    console.log('🚀 Shadow Sync extension installed');

    // Load saved configuration
    const stored = await chrome.storage.local.get(['supabaseUrl', 'supabaseKey', 'accessToken']);
    if (stored.supabaseUrl) CONFIG.supabaseUrl = stored.supabaseUrl;
    if (stored.supabaseKey) CONFIG.supabaseKey = stored.supabaseKey;
    if (stored.accessToken) {
        authState.accessToken = stored.accessToken;
        authState.isAuthenticated = true;
    }
});

/**
 * Message handler for communication with content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Message received:', message.type);

    switch (message.type) {
        case 'GET_AUTH_STATE':
            sendResponse({ success: true, data: authState });
            break;

        case 'SET_AUTH_TOKEN':
            handleSetAuthToken(message.payload)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep channel open for async response

        case 'UPLOAD_MEDIA':
            handleUploadMedia(message.payload)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;

        case 'SAVE_INSPIRATION':
            handleSaveInspiration(message.payload)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;

        case 'GET_CONFIG':
            sendResponse({ success: true, data: CONFIG });
            break;

        case 'SET_CONFIG':
            handleSetConfig(message.payload)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;

        default:
            sendResponse({ success: false, error: 'Unknown message type' });
    }
});

/**
 * Set authentication token (called from popup after login)
 */
async function handleSetAuthToken(payload) {
    const { accessToken, userId } = payload;

    authState = {
        isAuthenticated: true,
        userId,
        accessToken
    };

    // Persist to storage
    await chrome.storage.local.set({ accessToken, userId });

    console.log('✅ Auth token saved');
    return { success: true };
}

/**
 * Set Supabase configuration
 */
async function handleSetConfig(payload) {
    const { supabaseUrl, supabaseKey } = payload;

    CONFIG.supabaseUrl = supabaseUrl;
    CONFIG.supabaseKey = supabaseKey;

    // Persist to storage
    await chrome.storage.local.set({ supabaseUrl, supabaseKey });

    console.log('✅ Config saved');
    return { success: true };
}

/**
 * Upload media blob to Supabase Storage
 */
async function handleUploadMedia(payload) {
    const { blob, filename, contentType } = payload;

    if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
        throw new Error('Supabase not configured. Please configure in popup.');
    }

    if (!authState.accessToken) {
        throw new Error('Not authenticated. Please login via popup.');
    }

    // Convert base64 to blob
    const binaryData = base64ToBlob(blob, contentType);

    // Generate unique filename
    const ext = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `${authState.userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload to Supabase Storage
    const uploadUrl = `${CONFIG.supabaseUrl}/storage/v1/object/inspiration-assets/${uniqueFilename}`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'apikey': CONFIG.supabaseKey,
            'Content-Type': contentType
        },
        body: binaryData
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
    }

    // Get public URL
    const publicUrl = `${CONFIG.supabaseUrl}/storage/v1/object/public/inspiration-assets/${uniqueFilename}`;

    console.log('✅ Media uploaded:', publicUrl);
    return {
        success: true,
        data: {
            path: uniqueFilename,
            url: publicUrl
        }
    };
}

/**
 * Save inspiration item to database
 */
async function handleSaveInspiration(payload) {
    const {
        type,
        title,
        assetPath,
        assetUrl,
        thumbnailPath,
        thumbnailUrl,
        originalUrl,
        sourcePlatform,
        sourceCreator
    } = payload;

    if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
        throw new Error('Supabase not configured');
    }

    if (!authState.accessToken) {
        throw new Error('Not authenticated');
    }

    // Insert into database
    const insertUrl = `${CONFIG.supabaseUrl}/rest/v1/inspiration_items`;

    const response = await fetch(insertUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'apikey': CONFIG.supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            type,
            title: title || 'Untitled',
            asset_path: assetPath,
            asset_url: assetUrl,
            thumbnail_path: thumbnailPath || null,
            thumbnail_url: thumbnailUrl || null,
            original_url: originalUrl,
            source_platform: sourcePlatform,
            source_creator: sourceCreator,
            saved: false,
            created_by: authState.userId
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Save failed: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Inspiration saved:', data);

    return { success: true, data: data[0] };
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64, contentType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}

/**
 * Fetch auth token from Creator Hub (if open)
 */
async function fetchAuthFromHub() {
    try {
        const tabs = await chrome.tabs.query({ url: `${CONFIG.hubUrl}/*` });

        if (tabs.length === 0) {
            console.log('Creator Hub not open, cannot fetch auth');
            return null;
        }

        // Execute script in the Hub tab to get auth token
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                // Get Supabase session from localStorage
                const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
                for (const key of keys) {
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
                return null;
            }
        });

        if (results?.[0]?.result) {
            await handleSetAuthToken(results[0].result);
            return results[0].result;
        }

        return null;
    } catch (error) {
        console.error('Error fetching auth from Hub:', error);
        return null;
    }
}

// Export for testing
self.fetchAuthFromHub = fetchAuthFromHub;
