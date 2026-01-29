// Mock Workflows Database - Enhanced with Create Interface Support

// Workflow Categories (Updated - removed Brand Guidelines, added After Effects)
export const WORKFLOW_CATEGORIES = [
    { id: 'ai-generation', label: 'AI Generation', icon: '🤖', color: 'bg-violet-500/20 text-violet-400' },
    { id: 'premiere-pro', label: 'Premiere Pro', icon: '🎬', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'after-effects', label: 'After Effects', icon: '✨', color: 'bg-pink-500/20 text-pink-400' },
    { id: 'delivery', label: 'Client Delivery', icon: '📦', color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'equipment', label: 'Equipment', icon: '📷', color: 'bg-amber-500/20 text-amber-400' },
];

export const WORKFLOWS_DB = [
    {
        id: 'wf-001',
        title: 'Higgsfield x ChatGPT Face Fidelity',
        description: 'Process for creating face-accurate AI videos using Higgsfield and ChatGPT refinement.',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format',
        category: 'ai-generation',
        estimatedTime: 30,
        difficulty: 'intermediate',
        status: 'published',
        author: 'Keanu',
        lastUpdated: '2026-01-06',
        sections: [
            {
                id: 's1',
                title: 'Overview',
                type: 'text',
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
                prompt: 'Ultra-cinematic nighttime film still featuring the subject. The subject must exactly match the identity of the provided reference image — same facial structure, jawline, nose, lips. DETAILS: Ultra realistic, visible skin texture, 8k resolution.'
            },
            {
                id: 's4',
                title: 'Configure Higgsfield Settings',
                type: 'step',
                isRequired: true,
                content: 'Apply these exact settings: Motion Strength: 7, Face Fidelity: High, Duration: 4s'
            },
            {
                id: 's5',
                title: 'Quality Check',
                type: 'step',
                isRequired: true,
                content: 'Review output for: Face consistency, motion artifacts, lighting coherence. Re-generate if score < 8/10.'
            }
        ]
    },
    {
        id: 'wf-002',
        title: 'Runway Gen-3 Alpha Motion',
        description: 'Create professional AI video clips with controlled camera movement and subject motion.',
        coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format',
        category: 'ai-generation',
        estimatedTime: 25,
        difficulty: 'intermediate',
        status: 'published',
        author: 'Keanu',
        lastUpdated: '2026-01-08',
        sections: [
            {
                id: 's1',
                title: 'Select Source Image',
                type: 'step',
                isRequired: true,
                content: 'Choose a high-resolution image (minimum 1080p). Ensure the subject has clear edges for better motion tracking.'
            },
            {
                id: 's2',
                title: 'Write Motion Prompt',
                type: 'step',
                isRequired: true,
                content: 'Describe the desired motion: camera movement (dolly, pan, zoom) + subject action. Be specific but concise.',
                prompt: 'Slow dolly in, subject turns head slightly to camera, subtle wind in hair, cinematic lighting'
            },
            {
                id: 's3',
                title: 'Apply Motion Brush (Optional)',
                type: 'step',
                isRequired: false,
                content: 'Use Motion Brush to paint specific areas for isolated movement. Keep brush strokes precise.'
            },
            {
                id: 's4',
                title: 'Generate and Iterate',
                type: 'step',
                isRequired: true,
                content: 'Generate 3-4 variations. Compare and select the best. Use the seed for consistency in future generations.'
            }
        ]
    },
    {
        id: 'wf-003',
        title: 'After Effects Speed Ramp',
        description: 'Professional speed ramping technique for dynamic transitions and impact moments.',
        coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format',
        category: 'after-effects',
        estimatedTime: 20,
        difficulty: 'beginner',
        status: 'published',
        author: 'Keanu',
        lastUpdated: '2026-01-09',
        sections: [
            {
                id: 's1',
                title: 'Import Footage',
                type: 'step',
                isRequired: true,
                content: 'Import your clip to After Effects. Right-click → Time → Enable Time Remapping.'
            },
            {
                id: 's2',
                title: 'Set Keyframes',
                type: 'step',
                isRequired: true,
                content: 'Place keyframes at speed change points. First keyframe = start of slow-mo, second = end.'
            },
            {
                id: 's3',
                title: 'Adjust Speed Graph',
                type: 'step',
                isRequired: true,
                content: 'Open Graph Editor (keyboard: Shift+F3). Convert to Easy Ease (F9). Adjust bezier handles for smooth ramp.'
            },
            {
                id: 's4',
                title: 'Frame Blending',
                type: 'step',
                isRequired: true,
                content: 'Enable Pixel Motion or Frame Mix for smoother slow-mo. Layer → Frame Blending → Pixel Motion.'
            },
            {
                id: 's5',
                title: 'Audio Sync',
                type: 'step',
                isRequired: false,
                content: 'Add whoosh sound effect at ramp point. Use audio keyframes to sync with visual speed change.'
            }
        ]
    },
    {
        id: 'wf-004',
        title: 'Premiere Pro Project Setup',
        description: 'Standard project structure and settings for all Keanu Visuals productions.',
        coverImage: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format',
        category: 'premiere-pro',
        estimatedTime: 15,
        difficulty: 'beginner',
        status: 'published',
        author: 'Keanu',
        lastUpdated: '2026-01-07',
        sections: [
            {
                id: 's1',
                title: 'Create Project',
                type: 'step',
                isRequired: true,
                content: 'File → New Project. Name: [CLIENT]_[PROJECT]_[DATE]. Location: /Projects/[Year]/[Client]/'
            },
            {
                id: 's2',
                title: 'Folder Structure',
                type: 'step',
                isRequired: true,
                content: 'Create bins: 01_Footage, 02_Audio, 03_Graphics, 04_Exports, 05_Assets. Always maintain this structure.'
            },
            {
                id: 's3',
                title: 'Sequence Settings',
                type: 'step',
                isRequired: true,
                content: 'Most projects: 4K 3840x2160, 24fps. Shorts: 1080x1920, 30fps. Match source footage when possible.'
            },
            {
                id: 's4',
                title: 'Import Media',
                type: 'step',
                isRequired: true,
                content: 'Ingest all footage. Rename clips descriptively. Add markers for key moments during review.'
            }
        ]
    },
    {
        id: 'wf-005',
        title: 'Client Delivery Checklist',
        description: 'Standard operating procedure for all client deliveries.',
        coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format',
        category: 'delivery',
        estimatedTime: 15,
        difficulty: 'beginner',
        status: 'published',
        author: 'Keanu',
        lastUpdated: '2026-01-08',
        sections: [
            {
                id: 's1',
                title: 'Export Settings',
                type: 'step',
                isRequired: true,
                content: 'H.264, 1080p minimum, 20 Mbps bitrate. 4K if client specified. Always include audio track.'
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
                title: 'Upload to Drive',
                type: 'step',
                isRequired: true,
                content: 'Upload to: /Clients/[ClientName]/[ProjectName]/Deliveries/. Set sharing to "Anyone with link".'
            },
            {
                id: 's4',
                title: 'Notify Client',
                type: 'step',
                isRequired: true,
                content: 'Send delivery email with download link. Include revision notes if applicable.'
            }
        ]
    },
    {
        id: 'wf-006',
        title: 'After Effects Compositing Basics',
        description: 'Layer compositing techniques for combining AI footage with live action.',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format',
        category: 'after-effects',
        estimatedTime: 35,
        difficulty: 'intermediate',
        status: 'pending_approval',
        author: 'Jordan',
        lastUpdated: '2026-01-09',
        sections: [
            {
                id: 's1',
                title: 'Import Assets',
                type: 'step',
                isRequired: true,
                content: 'Import all layers: AI footage, live action plate, any masks or mattes.'
            },
            {
                id: 's2',
                title: 'Layer Order',
                type: 'step',
                isRequired: true,
                content: 'Background at bottom, subject layers above, effects and adjustments at top.'
            },
            {
                id: 's3',
                title: 'Blend Modes',
                type: 'step',
                isRequired: true,
                content: 'Experiment with Screen, Multiply, and Add modes. Use masks to blend edges.'
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
