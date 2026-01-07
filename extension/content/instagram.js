/**
 * Shadow Sync - Instagram Content Script
 * Injects "Save to Hub" buttons on Instagram posts and handles media extraction
 */

// Configuration
const BUTTON_CLASS = 'shadow-sync-btn';
const PROCESSED_ATTR = 'data-shadow-sync-processed';

/**
 * Initialize content script
 */
function init() {
    console.log('🔮 Shadow Sync: Instagram content script loaded');

    // Initial scan
    setTimeout(scanForPosts, 1000);

    // Watch for new posts (infinite scroll, navigation)
    const observer = new MutationObserver(debounce(scanForPosts, 500));
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Scan page for Instagram posts and inject save buttons
 */
function scanForPosts() {
    // Find all article elements (Instagram posts)
    const posts = document.querySelectorAll('article:not([' + PROCESSED_ATTR + '])');

    posts.forEach(post => {
        post.setAttribute(PROCESSED_ATTR, 'true');
        injectSaveButton(post);
    });

    // Also check for single post view (modal or /p/ page)
    const singlePostContainer = document.querySelector('[role="dialog"] article, main article');
    if (singlePostContainer && !singlePostContainer.hasAttribute(PROCESSED_ATTR)) {
        singlePostContainer.setAttribute(PROCESSED_ATTR, 'true');
        injectSaveButton(singlePostContainer);
    }
}

/**
 * Inject "Save to Hub" button into a post
 */
function injectSaveButton(postElement) {
    // Find the action bar (like, comment, share, save buttons)
    const actionBar = postElement.querySelector('section');
    if (!actionBar) return;

    // Check if button already exists
    if (actionBar.querySelector('.' + BUTTON_CLASS)) return;

    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.className = BUTTON_CLASS;
    saveBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Hub</span>
    `;
    saveBtn.title = 'Save to Creator Hub';

    // Handle click
    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleSavePost(postElement, saveBtn);
    });

    // Insert button
    actionBar.appendChild(saveBtn);
}

/**
 * Handle saving a post
 */
async function handleSavePost(postElement, button) {
    // Update button state
    button.classList.add('loading');
    button.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
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

        // Extract post data
        const postData = await extractPostData(postElement);

        if (!postData.mediaUrl) {
            throw new Error('Could not find media in this post');
        }

        // Download media as blob
        const mediaBlob = await downloadMedia(postData.mediaUrl);

        // Upload to Supabase Storage
        const uploadResult = await chrome.runtime.sendMessage({
            type: 'UPLOAD_MEDIA',
            payload: {
                blob: mediaBlob.base64,
                filename: `instagram_${Date.now()}.${mediaBlob.extension}`,
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
                type: postData.type,
                title: postData.caption?.slice(0, 100) || 'Instagram Post',
                assetPath: uploadResult.data.path,
                assetUrl: uploadResult.data.url,
                thumbnailPath: postData.type === 'video' ? uploadResult.data.path : null,
                thumbnailUrl: postData.type === 'video' ? uploadResult.data.url : null,
                originalUrl: postData.postUrl,
                sourcePlatform: 'instagram',
                sourceCreator: postData.username
            }
        });

        if (!saveResult.success) {
            throw new Error(saveResult.error);
        }

        // Success state
        button.classList.remove('loading');
        button.classList.add('success');
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Saved!</span>
        `;

        // Reset after delay
        setTimeout(() => {
            button.classList.remove('success');
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Hub</span>
            `;
        }, 2000);

    } catch (error) {
        console.error('Shadow Sync error:', error);

        // Error state
        button.classList.remove('loading');
        button.classList.add('error');
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>${error.message.slice(0, 20)}...</span>
        `;

        // Reset after delay
        setTimeout(() => {
            button.classList.remove('error');
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Hub</span>
            `;
        }, 3000);
    }
}

/**
 * Extract post data from DOM
 */
async function extractPostData(postElement) {
    const data = {
        type: 'image',
        mediaUrl: null,
        postUrl: window.location.href,
        username: null,
        caption: null
    };

    // Try to get username
    const usernameLink = postElement.querySelector('header a[href^="/"]');
    if (usernameLink) {
        data.username = usernameLink.getAttribute('href').replace(/\//g, '');
    }

    // Try to get caption
    const captionElement = postElement.querySelector('h1, span[class*="Caption"]');
    if (captionElement) {
        data.caption = captionElement.textContent;
    }

    // Check for video first
    const video = postElement.querySelector('video');
    if (video) {
        data.type = 'video';
        // Try to get video source
        data.mediaUrl = video.src || video.querySelector('source')?.src;

        // If no direct source, try to find it in page data
        if (!data.mediaUrl) {
            data.mediaUrl = await extractVideoUrl(postElement);
        }
    }

    // If no video, look for image
    if (!data.mediaUrl) {
        const img = postElement.querySelector('img[srcset], img[src*="instagram"]');
        if (img) {
            data.type = 'image';
            // Get highest resolution from srcset
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
                data.mediaUrl = img.src;
            }
        }
    }

    // Get post URL for single post view
    const postLink = postElement.querySelector('a[href*="/p/"], a[href*="/reel/"]');
    if (postLink) {
        data.postUrl = 'https://www.instagram.com' + postLink.getAttribute('href');
    }

    return data;
}

/**
 * Extract video URL from Instagram's embedded data
 */
async function extractVideoUrl(postElement) {
    // Try to find video URL in window.__additionalDataLoaded or window._sharedData
    try {
        // Method 1: Check for video_url in React props
        const videoContainer = postElement.querySelector('[data-video-url]');
        if (videoContainer) {
            return videoContainer.getAttribute('data-video-url');
        }

        // Method 2: Parse from script tags
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const json = JSON.parse(script.textContent);
                if (json.video?.contentUrl) {
                    return json.video.contentUrl;
                }
            } catch (e) { }
        }

        // Method 3: Look in global data
        if (window._sharedData?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media?.video_url) {
            return window._sharedData.entry_data.PostPage[0].graphql.shortcode_media.video_url;
        }

    } catch (error) {
        console.error('Error extracting video URL:', error);
    }

    return null;
}

/**
 * Download media from URL as base64
 */
async function downloadMedia(url) {
    try {
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Accept': 'image/*, video/*'
            }
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
