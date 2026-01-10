// Mock Workflows Database - Enhanced with Categories and Step System

// Workflow Categories
export const WORKFLOW_CATEGORIES = [
    { id: 'ai-generation', label: 'AI Generation', icon: '🤖', color: 'bg-violet-500/20 text-violet-400' },
    { id: 'post-production', label: 'Post-Production', icon: '🎬', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'delivery', label: 'Client Delivery', icon: '📦', color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'brand', label: 'Brand Guidelines', icon: '🎨', color: 'bg-pink-500/20 text-pink-400' },
    { id: 'equipment', label: 'Equipment', icon: '📷', color: 'bg-amber-500/20 text-amber-400' },
];

// Master Prompt Example
const MASTER_PROMPT = `Ultra-cinematic nighttime film still featuring the subject standing outside a small convenience store illuminated by neon signage and fluorescent interior lights. The subject must exactly match the identity of the provided reference image — same facial structure, jawline, nose, lips. DETAILS: Ultra realistic, visible skin texture, sweat, detailed hair strands, 8k resolution.`;

export const WORKFLOWS_DB = [
    {
        id: 'wf-001',
        title: 'Higgsfield x ChatGPT Face Fidelity',
        description: 'Process for creating face-accurate AI videos using Higgsfield and ChatGPT refinement.',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format',
        category: 'ai-generation',
        estimatedTime: 30, // minutes
        difficulty: 'intermediate', // beginner | intermediate | advanced
        status: 'published',
        author: 'Admin',
        lastUpdated: '2026-01-06',
        sections: [
            {
                id: 's1',
                title: 'Overview',
                type: 'text',
                isRequired: false,
                content: 'This workflow details the exact steps to maintain facial fidelity across AI video generations using Higgsfield\'s latest model.'
            },
            {
                id: 's2',
                title: 'Prepare Identity Reference',
                type: 'step',
                isRequired: true,
                content: 'Upload a front-facing photo with even lighting. Minimum 4K resolution recommended for best results.',
                media: {
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format',
                    caption: 'Ideal reference: Front facing, even lighting, 4K resolution.'
                }
            },
            {
                id: 's3',
                title: 'Generate Master Prompt',
                type: 'step',
                isRequired: true,
                content: 'Use the ChatGPT template below and customize for your specific scene requirements.',
                prompt: MASTER_PROMPT
            },
            {
                id: 's4',
                title: 'Configure Higgsfield Settings',
                type: 'step',
                isRequired: true,
                content: 'Apply these exact settings: Motion Strength: 7, Face Fidelity: High, Duration: 4s',
                media: {
                    type: 'video',
                    platform: 'youtube',
                    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    caption: 'Watch the step-by-step configuration guide.'
                }
            },
            {
                id: 's5',
                title: 'Quality Check',
                type: 'step',
                isRequired: true,
                content: 'Review output for: Face consistency, motion artifacts, lighting coherence. Re-generate if score < 8/10.'
            },
            {
                id: 's6',
                title: 'Export & Delivery',
                type: 'step',
                isRequired: true,
                content: 'Export at 1080p minimum. Upload to Drive folder following naming convention: [CLIENT]_[PROJECT]_[VERSION]'
            }
        ]
    },
    {
        id: 'wf-002',
        title: 'Runway Gen-2 Motion Brush',
        description: 'Advanced motion control workflow for specific element animation.',
        coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format',
        category: 'ai-generation',
        estimatedTime: 20,
        difficulty: 'advanced',
        status: 'pending_approval',
        author: 'Sarah (Editor)',
        lastUpdated: '2025-12-28',
        sections: [
            {
                id: 's1',
                title: 'Motion Brush Basics',
                type: 'step',
                isRequired: true,
                content: 'Using motion brush to isolate subject movement while keeping background static.'
            },
            {
                id: 's2',
                title: 'Layer Selection',
                type: 'step',
                isRequired: true,
                content: 'Select the element layer you want to animate. Use precise brush strokes for best results.'
            },
            {
                id: 's3',
                title: 'Motion Direction',
                type: 'step',
                isRequired: true,
                content: 'Define motion vectors for the selected area. Start with subtle motions and increase gradually.'
            }
        ]
    },
    {
        id: 'wf-003',
        title: 'Color Grading - Keanu Style',
        description: 'Official color grading workflow for all Keanu Visuals projects.',
        coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format',
        category: 'post-production',
        estimatedTime: 45,
        difficulty: 'intermediate',
        status: 'published',
        author: 'Admin',
        lastUpdated: '2026-01-03',
        sections: [
            {
                id: 's1',
                title: 'Base Correction',
                type: 'step',
                isRequired: true,
                content: 'Apply base color correction: Exposure 0, Contrast +10, Highlights -15, Shadows +20'
            },
            {
                id: 's2',
                title: 'Keanu LUT Application',
                type: 'step',
                isRequired: true,
                content: 'Apply Keanu_Master_v3.cube LUT at 65% intensity. Never exceed 80%.'
            },
            {
                id: 's3',
                title: 'Skin Tone Protection',
                type: 'step',
                isRequired: true,
                content: 'Use qualifier to isolate skin tones. Reduce saturation by 10% and add subtle orange shift.'
            },
            {
                id: 's4',
                title: 'Final Polish',
                type: 'step',
                isRequired: true,
                content: 'Add film grain (strength 5), subtle vignette, and final contrast adjustment.'
            }
        ]
    },
    {
        id: 'wf-004',
        title: 'Client Delivery Checklist',
        description: 'Standard operating procedure for all client deliveries.',
        coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format',
        category: 'delivery',
        estimatedTime: 15,
        difficulty: 'beginner',
        status: 'published',
        author: 'Admin',
        lastUpdated: '2026-01-08',
        sections: [
            {
                id: 's1',
                title: 'Export Settings',
                type: 'step',
                isRequired: true,
                content: 'H.264, 1080p minimum, 20 Mbps bitrate. 4K if client specified.'
            },
            {
                id: 's2',
                title: 'File Naming',
                type: 'step',
                isRequired: true,
                content: 'Format: [CLIENT]_[PROJECT]_[TYPE]_[VERSION]_[DATE].mp4\nExample: Higgsfield_Tutorial_HeroVideo_V2_20260110.mp4'
            },
            {
                id: 's3',
                title: 'Folder Structure',
                type: 'step',
                isRequired: true,
                content: 'Upload to: /Clients/[ClientName]/[ProjectName]/Deliveries/'
            },
            {
                id: 's4',
                title: 'Notify Client',
                type: 'step',
                isRequired: true,
                content: 'Send delivery email with download link. Use template from Notion.'
            }
        ]
    },
    {
        id: 'wf-005',
        title: 'BTS Vertical Short SOP',
        description: 'Standard workflow for creating behind-the-scenes vertical content.',
        coverImage: 'https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?w=800&auto=format',
        category: 'post-production',
        estimatedTime: 25,
        difficulty: 'beginner',
        status: 'published',
        author: 'Jordan (Designer)',
        lastUpdated: '2026-01-05',
        sections: [
            {
                id: 's1',
                title: 'Import & Organize',
                type: 'step',
                isRequired: true,
                content: 'Import all BTS footage. Create bins: A-Roll, B-Roll, Audio, Graphics'
            },
            {
                id: 's2',
                title: 'Sequence Settings',
                type: 'step',
                isRequired: true,
                content: '1080x1920 (9:16), 30fps, Square Pixels. Never deviate from this.'
            },
            {
                id: 's3',
                title: 'Edit Structure',
                type: 'step',
                isRequired: true,
                content: 'Hook (0-3s) → Context (3-10s) → Main Content → CTA (last 3s)'
            },
            {
                id: 's4',
                title: 'Audio & Captions',
                type: 'step',
                isRequired: true,
                content: 'Add trending audio from library. Generate auto-captions and style them.'
            }
        ]
    }
];

// Mock API functions
export const workflowsService = {
    getAll: () => Promise.resolve(WORKFLOWS_DB),
    getById: (id) => Promise.resolve(WORKFLOWS_DB.find(w => w.id === id)),
    getByCategory: (category) => Promise.resolve(WORKFLOWS_DB.filter(w => w.category === category)),
    getCategories: () => Promise.resolve(WORKFLOW_CATEGORIES),
    search: (query) => Promise.resolve(WORKFLOWS_DB.filter(w =>
        w.title.toLowerCase().includes(query.toLowerCase()) ||
        w.description.toLowerCase().includes(query.toLowerCase())
    )),
    create: (workflow) => Promise.resolve({ ...workflow, id: `wf-${Date.now()}` }),
    update: (id, data) => Promise.resolve({ ...WORKFLOWS_DB.find(w => w.id === id), ...data }),
    delete: (id) => Promise.resolve({ success: true }),
    submitForApproval: (id) => Promise.resolve({ ...WORKFLOWS_DB.find(w => w.id === id), status: 'pending_approval' }),
    approve: (id) => Promise.resolve({ ...WORKFLOWS_DB.find(w => w.id === id), status: 'published' })
};
