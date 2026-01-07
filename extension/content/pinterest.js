/**
 * Shadow Sync - Pinterest Content Script
 * Injects "Save to Hub" buttons on Pinterest pins and handles media extraction
 */

// Configuration
const BUTTON_CLASS = 'shadow-sync-btn';
const PROCESSED_ATTR = 'data-shadow-sync-processed';

/**
 * Initialize content script
 */
function init() {
    console.log('🔮 Shadow Sync: Pinterest content script loaded');

    // Initial scan
    setTimeout(scanForPins, 1000);

    // Watch for new pins (infinite scroll)
    const observer = new MutationObserver(debounce(scanForPins, 500));
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Scan page for Pinterest pins and inject save buttons
 */
function scanForPins() {
    // Find all pin containers
    const pins = document.querySelectorAll('[data-test-id="pin"]:not([' + PROCESSED_ATTR + ']), [data-test-id="pinWrapper"]:not([' + PROCESSED_ATTR + '])');

    pins.forEach(pin => {
        pin.setAttribute(PROCESSED_ATTR, 'true');
        injectSaveButton(pin);
    });

    // Also check for closeup view (single pin)
    const closeupPin = document.querySelector('[data-test-id="closeup-body"]:not([' + PROCESSED_ATTR + ']), [data-test-id="pin-closeup"]:not([' + PROCESSED_ATTR + '])');
    if (closeupPin) {
        closeupPin.setAttribute(PROCESSED_ATTR, 'true');
        injectCloseupButton(closeupPin);
    }
}

/**
 * Inject save button on grid pin
 */
function injectSaveButton(pinElement) {
    // Find the pin image container
    const imageContainer = pinElement.querySelector('[data-test-id="pinRep"], [data-test-id="non-story-pin-image"]');
    if (!imageContainer) return;

    // Check if button already exists
    if (pinElement.querySelector('.' + BUTTON_CLASS)) return;

    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.className = BUTTON_CLASS;
    saveBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; z-index: 100;';
    saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Hub</span>
    `;
    saveBtn.title = 'Save to Creator Hub';

    // Handle click
    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleSavePin(pinElement, saveBtn);
    });

    // Ensure parent has relative positioning
    const parent = imageContainer.parentElement || pinElement;
    if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }

    parent.appendChild(saveBtn);
}

/**
 * Inject save button on closeup/detail view
 */
function injectCloseupButton(closeupElement) {
    // Find action bar
    const actionArea = closeupElement.querySelector('[data-test-id="pin-action-bar"], [data-test-id="closeup-action-bar"]');
    if (!actionArea) return;

    // Check if button exists
    if (actionArea.querySelector('.' + BUTTON_CLASS)) return;

    // Create floating save button
    const saveBtn = document.createElement('button');
    saveBtn.className = BUTTON_CLASS + ' shadow-sync-floating';
    saveBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Save to Hub</span>
    `;
    saveBtn.title = 'Save to Creator Hub';

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleSavePin(closeupElement, saveBtn);
    });

    document.body.appendChild(saveBtn);
}

/**
 * Handle saving a pin
 */
async function handleSavePin(pinElement, button) {
    // Update button state
    button.classList.add('loading');
    const originalHtml = button.innerHTML;
    button.innerHTML = `
        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
        <span>Saving...</span>
    `;

    try {
        // Check auth state
        const authResponse = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
        if (!authResponse.data.isAuthenticated) {
            throw new Error('Please login via the extension popup first');
        }

        // Extract pin data
        const pinData = await extractPinData(pinElement);

        if (!pinData.mediaUrl) {
            throw new Error('Could not find media in this pin');
        }

        // Download media as blob
        const mediaBlob = await downloadMedia(pinData.mediaUrl);

        // Upload to Supabase Storage
        const uploadResult = await chrome.runtime.sendMessage({
            type: 'UPLOAD_MEDIA',
            payload: {
                blob: mediaBlob.base64,
                filename: `pinterest_${Date.now()}.${mediaBlob.extension}`,
                contentType: mediaBlob.contentType
            }
        });

        if (!uploadResult.success) {
            throw new Error(uploadResult.error);
        }

        // Save inspiration item to database
        const saveResult = await chrome.runtime.sendMessage({
            type: 'SAVE_INSPIRATION',
            payload: {
                type: pinData.type,
                title: pinData.description?.slice(0, 100) || 'Pinterest Pin',
                assetPath: uploadResult.data.path,
                assetUrl: uploadResult.data.url,
                thumbnailPath: null,
                thumbnailUrl: null,
                originalUrl: pinData.pinUrl,
                sourcePlatform: 'pinterest',
                sourceCreator: pinData.pinner
            }
        });

        if (!saveResult.success) {
            throw new Error(saveResult.error);
        }

        // Success state
        button.classList.remove('loading');
        button.classList.add('success');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Saved!</span>
        `;

        // Show toast
        showToast('Saved to Creator Hub!', 'success');

        // Reset after delay
        setTimeout(() => {
            button.classList.remove('success');
            button.innerHTML = originalHtml;
        }, 2000);

    } catch (error) {
        console.error('Shadow Sync error:', error);

        // Error state
        button.classList.remove('loading');
        button.classList.add('error');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>Error</span>
        `;

        showToast(error.message, 'error');

        // Reset after delay
        setTimeout(() => {
            button.classList.remove('error');
            button.innerHTML = originalHtml;
        }, 3000);
    }
}

/**
 * Extract pin data from DOM
 */
async function extractPinData(pinElement) {
    const data = {
        type: 'image',
        mediaUrl: null,
        pinUrl: window.location.href,
        pinner: null,
        description: null
    };

    // Try to get pinner name
    const pinnerElement = pinElement.querySelector('[data-test-id="pinner-name"], [data-test-id="creator-name"]');
    if (pinnerElement) {
        data.pinner = pinnerElement.textContent?.trim();
    }

    // Try to get description
    const descElement = pinElement.querySelector('[data-test-id="pin-description"], [data-test-id="truncated-description"]');
    if (descElement) {
        data.description = descElement.textContent?.trim();
    }

    // Check for video
    const video = pinElement.querySelector('video');
    if (video) {
        data.type = 'video';
        data.mediaUrl = video.src;

        // Look for higher quality source
        const source = video.querySelector('source[type="video/mp4"]');
        if (source) {
            data.mediaUrl = source.src;
        }
    }

    // If no video, look for image
    if (!data.mediaUrl) {
        // Pinterest uses high-res images in srcset or data-src
        const img = pinElement.querySelector('img[src*="pinimg.com"]');
        if (img) {
            data.type = 'image';

            // Try to get highest resolution
            const srcset = img.getAttribute('srcset');
            if (srcset) {
                const sources = srcset.split(',').map(s => s.trim().split(' '));
                const highest = sources.reduce((a, b) => {
                    const aWidth = parseInt(a[1]) || 0;
                    const bWidth = parseInt(b[1]) || 0;
                    return bWidth > aWidth ? b : a;
                });
                data.mediaUrl = highest[0];
            } else {
                // Upgrade to originals if possible
                data.mediaUrl = img.src.replace(/\/\d+x\//, '/originals/');
            }
        }
    }

    // Get pin URL from link
    const pinLink = pinElement.querySelector('a[href*="/pin/"]');
    if (pinLink) {
        data.pinUrl = 'https://www.pinterest.com' + pinLink.getAttribute('href');
    }

    return data;
}

/**
 * Download media from URL as base64
 */
async function downloadMedia(url) {
    try {
        const response = await fetch(url, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const blob = await response.blob();

        // Convert to base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        // Determine extension
        let extension = 'jpg';
        if (contentType.includes('video')) {
            extension = 'mp4';
        } else if (contentType.includes('png')) {
            extension = 'png';
        } else if (contentType.includes('gif')) {
            extension = 'gif';
        } else if (contentType.includes('webp')) {
            extension = 'webp';
        }

        return {
            base64,
            contentType,
            extension
        };

    } catch (error) {
        console.error('Download error:', error);
        throw new Error('Failed to download media');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.shadow-sync-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `shadow-sync-toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Debounce helper
 */
function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
