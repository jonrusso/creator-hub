// Mock Boards Data
// Stage statuses: 'not_started' | 'in_progress' | 'review' | 'approved'
export const STAGE_STATUSES = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    APPROVED: 'approved'
};

// Project Templates for quick card creation
export const PROJECT_TEMPLATES = [
    {
        id: 'hero-video',
        name: 'Hero Video',
        description: 'Short-form brand showcase (15-60s)',
        checklists: [
            { label: 'Script Draft' },
            { label: 'Storyboard' },
            { label: 'Asset Collection' },
            { label: 'First Cut' },
            { label: 'Color Grade' },
            { label: 'Sound Design' },
            { label: 'Final Review' }
        ],
        technicalLevel: 4,
        estimatedDays: 7
    },
    {
        id: 'tutorial',
        name: 'Tutorial',
        description: 'Educational long-form content',
        checklists: [
            { label: 'Topic Research' },
            { label: 'Script & Outline' },
            { label: 'Screen Recording' },
            { label: 'Voiceover' },
            { label: 'Editing' },
            { label: 'Captions/Subtitles' },
            { label: 'Thumbnail' }
        ],
        technicalLevel: 3,
        estimatedDays: 10
    },
    {
        id: 'bts',
        name: 'Behind The Scenes',
        description: 'Quick BTS content',
        checklists: [
            { label: 'Raw Footage Review' },
            { label: 'Highlight Selection' },
            { label: 'Quick Edit' },
            { label: 'Music Sync' }
        ],
        technicalLevel: 2,
        estimatedDays: 3
    },
    {
        id: 'client-project',
        name: 'Client Project',
        description: 'Full client delivery package',
        checklists: [
            { label: 'Client Brief' },
            { label: 'Concept Approval' },
            { label: 'Script Draft' },
            { label: 'Storyboard' },
            { label: 'Production' },
            { label: 'First Cut Review' },
            { label: 'Client Revisions' },
            { label: 'Final Delivery' },
            { label: 'Deliverables Package' }
        ],
        technicalLevel: 5,
        estimatedDays: 14
    }
];

export const PRODUCTION_ITEMS = [
    // Standalone project (no parent)
    {
        id: 1,
        title: 'AI Brand Showcase - Runway',
        stage: 'scripting',
        assignee: 'Alex',
        collaborators: ['Sarah', 'Jordan'],
        startDate: '2026-01-08',
        dueDate: '2026-01-15',
        format: 'hero-video',
        client: 'TechBrand',
        urgency: 'high',
        description: 'Create a 30s showcase of the new Runway features focusing on Gen-2 updates.',
        checklists: [
            { id: 'c1', label: 'Script Draft', checked: true },
            { id: 'c2', label: 'Asset Collection', checked: false },
            { id: 'c3', label: 'Storyboard', checked: false },
            { id: 'c4', label: 'First Cut', checked: false },
            { id: 'c5', label: 'Color Grade', checked: false }
        ],
        stageStatus: 'in_progress',
        reviewer: 'Keanu',
        stageVersion: 1,
        stageHistory: [],
        assetCount: 8,
        technicalLevel: 4,
        dependencies: [],
        timeSpent: 180,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format',
        activity: [
            { id: 'act-1', type: 'comment', author: 'Keanu', timestamp: '2026-01-08T09:00:00Z', content: 'Lets focus on the Gen-2 motion features for the intro 🎬' },
            { id: 'act-2', type: 'status_change', author: 'Alex', timestamp: '2026-01-08T10:30:00Z', from: 'not_started', to: 'in_progress' },
            { id: 'act-3', type: 'comment', author: 'Alex', timestamp: '2026-01-08T14:00:00Z', content: 'Script draft is ready for review! Added the key talking points.' }
        ]
    },

    // === HIGGSFIELD PROJECT - Multiple Deliverables ===
    // Deliverable 1: Hero Video (main client delivery)
    {
        id: 2,
        title: 'Hero Edit',
        parentProject: 'Higgsfield Identity Synthesis',
        projectId: 'higgsfield-2026',
        stage: 'production',
        assignee: 'Jordan',
        collaborators: ['Alex'],
        startDate: '2026-01-10',
        dueDate: '2026-01-18',
        format: 'hero-video',
        client: 'Higgsfield',
        urgency: 'high',
        description: 'Main 60s hero video showcasing Identity Synthesis feature for client delivery.',
        checklists: [
            { id: 'h1', label: 'Hero shots captured', checked: true },
            { id: 'h2', label: 'VFX compositing', checked: true },
            { id: 'h3', label: 'Color grade', checked: false },
            { id: 'h4', label: 'Audio mix', checked: false }
        ],
        stageStatus: 'review',
        reviewer: 'Keanu',
        stageVersion: 3,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-09', finalVersion: 2 }
        ],
        assetCount: 12,
        technicalLevel: 5,
        dependencies: [],
        timeSpent: 420,
        thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format',
        activity: [
            { id: 'act-1', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-09T16:00:00Z', from: 'scripting', to: 'production' },
            { id: 'act-2', type: 'comment', author: 'Jordan', timestamp: '2026-01-10T11:00:00Z', content: 'Started on the edit. The B-roll looks incredible!' },
            { id: 'act-3', type: 'comment', author: 'Sarah', timestamp: '2026-01-10T15:30:00Z', content: 'Color grading is 🔥 Nice work!' },
            { id: 'act-4', type: 'status_change', author: 'Jordan', timestamp: '2026-01-11T09:00:00Z', from: 'in_progress', to: 'review' }
        ]
    },
    // Deliverable 2: BTS Short
    {
        id: 3,
        title: 'BTS Compilation',
        parentProject: 'Higgsfield Identity Synthesis',
        projectId: 'higgsfield-2026',
        stage: 'scripting',
        assignee: 'Sarah',
        collaborators: [],
        startDate: '2026-01-12',
        dueDate: '2026-01-20',
        format: 'bts-short',
        client: 'Higgsfield',
        urgency: 'low',
        description: 'Behind-the-scenes compilation from the Higgsfield shoot.',
        checklists: [
            { id: 'b1', label: 'Select BTS footage', checked: false },
            { id: 'b2', label: 'Rough cut', checked: false },
            { id: 'b3', label: 'Add music', checked: false }
        ],
        stageStatus: 'not_started',
        reviewer: 'Keanu',
        stageVersion: 1,
        stageHistory: [],
        assetCount: 5,
        technicalLevel: 2,
        dependencies: ['higgsfield-hero'], // Wait for hero footage
        timeSpent: 0,
        thumbnail: null,
        activity: [
            { id: 'act-1', type: 'comment', author: 'Keanu', timestamp: '2026-01-12T09:00:00Z', content: 'We can start this once Jordan finishes the hero edit footage selection.' }
        ]
    },
    // Deliverable 3: YouTube Long-form
    {
        id: 4,
        title: 'YouTube Tutorial',
        parentProject: 'Higgsfield Identity Synthesis',
        projectId: 'higgsfield-2026',
        stage: 'scripting',
        assignee: 'Alex',
        collaborators: ['Keanu'],
        startDate: '2026-01-14',
        dueDate: '2026-01-25',
        format: 'long-form',
        client: null, // Internal content
        urgency: 'medium',
        description: 'Deep-dive tutorial on how we created the Higgsfield identity synthesis effect.',
        checklists: [
            { id: 'yt1', label: 'Script outline', checked: true },
            { id: 'yt2', label: 'Screen recordings', checked: false },
            { id: 'yt3', label: 'Voiceover', checked: false },
            { id: 'yt4', label: 'Edit & polish', checked: false }
        ],
        stageStatus: 'in_progress',
        reviewer: 'Keanu',
        stageVersion: 1,
        stageHistory: [],
        assetCount: 8,
        technicalLevel: 3,
        dependencies: [],
        timeSpent: 60,
        thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&auto=format',
        activity: [
            { id: 'act-1', type: 'comment', author: 'Alex', timestamp: '2026-01-14T10:00:00Z', content: 'Started outlining the tutorial structure. Going to cover the full workflow.' },
            { id: 'act-2', type: 'status_change', author: 'Alex', timestamp: '2026-01-14T14:00:00Z', from: 'not_started', to: 'in_progress' }
        ]
    },

    // === STANDALONE PROJECT ===
    {
        id: 5,
        title: 'BTS - Studio Session',
        stage: 'qa',
        assignee: 'Sarah',
        collaborators: [],
        startDate: '2026-01-13',
        dueDate: '2026-01-14',
        format: 'bts-short',
        client: null,
        urgency: 'low',
        description: 'Quick behind-the-scenes of the studio setup process.',
        checklists: [
            { id: 'bts1', label: 'Select highlights', checked: true },
            { id: 'bts2', label: 'Quick edit', checked: false }
        ],
        stageStatus: 'not_started',
        reviewer: 'Keanu',
        stageVersion: 1,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-10', finalVersion: 1 },
            { stage: 'production', approvedBy: 'Keanu', date: '2026-01-11', finalVersion: 2 }
        ],
        assetCount: 2,
        technicalLevel: 1,
        dependencies: [],
        timeSpent: 90,
        thumbnail: null,
        activity: [
            { id: 'act-1', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-10T10:00:00Z', from: 'scripting', to: 'production' },
            { id: 'act-2', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-11T14:00:00Z', from: 'production', to: 'qa' },
            { id: 'act-3', type: 'comment', author: 'Keanu', timestamp: '2026-01-11T14:05:00Z', content: 'Great work on this! Ready for final QA checks.' }
        ]
    },

    // === COMPLETED PROJECT - Done Stage ===
    {
        id: 6,
        title: 'Sora Launch Announcement',
        stage: 'done',
        assignee: 'Jordan',
        collaborators: ['Alex', 'Sarah'],
        startDate: '2026-01-01',
        dueDate: '2026-01-07',
        format: 'hero-video',
        client: 'OpenAI',
        urgency: 'critical',
        description: 'Official announcement video for Sora public launch. 45s hero with cinematic AI-generated sequences.',
        checklists: [
            { id: 's1', label: 'Script ready-to-go', checked: true },
            { id: 's2', label: 'Concept (references/PDF)', checked: true },
            { id: 's3', label: 'Videoshoot (record dailies)', checked: true },
            { id: 's4', label: 'Rough cut', checked: true },
            { id: 's5', label: 'Color correction & grading', checked: true },
            { id: 's6', label: 'Add SFX', checked: true },
            { id: 's7', label: 'Final export', checked: true }
        ],
        stageStatus: 'approved',
        reviewer: 'Keanu',
        stageVersion: 1,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-02', finalVersion: 1 },
            { stage: 'production', approvedBy: 'Keanu', date: '2026-01-05', finalVersion: 3 },
            { stage: 'qa', approvedBy: 'Keanu', date: '2026-01-07', finalVersion: 1 }
        ],
        assetCount: 15,
        technicalLevel: 5,
        dependencies: [],
        timeSpent: 960,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format',
        activity: [
            { id: 'act-1', type: 'comment', author: 'Keanu', timestamp: '2026-01-01T08:00:00Z', content: 'This is our biggest client! Lets make it perfect 🚀' },
            { id: 'act-2', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-02T18:00:00Z', from: 'scripting', to: 'production' },
            { id: 'act-3', type: 'revision_request', author: 'Keanu', timestamp: '2026-01-04T10:00:00Z', stage: 'production', fromVersion: 1, toVersion: 2 },
            { id: 'act-4', type: 'revision_request', author: 'Keanu', timestamp: '2026-01-04T16:00:00Z', stage: 'production', fromVersion: 2, toVersion: 3 },
            { id: 'act-5', type: 'comment', author: 'Jordan', timestamp: '2026-01-05T09:00:00Z', content: 'V3 is locked! Color grade is chef\'s kiss 👨‍🍳' },
            { id: 'act-6', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-05T12:00:00Z', from: 'production', to: 'qa' },
            { id: 'act-7', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-07T17:00:00Z', from: 'qa', to: 'done' }
        ]
    },

    // === VFX-Heavy Project with AI Generation ===
    {
        id: 7,
        title: 'Kling AI Showreel',
        parentProject: 'Kling Campaign Q1',
        projectId: 'kling-q1-2026',
        stage: 'production',
        assignee: 'Alex',
        collaborators: ['Jordan'],
        startDate: '2026-01-12',
        dueDate: '2026-01-22',
        format: 'hero-video',
        client: 'Kling AI',
        urgency: 'high',
        description: 'Showreel demonstrating Kling 1.5 capabilities - motion, consistency, and lip sync features.',
        checklists: [
            { id: 'k1', label: 'Script ready-to-go', checked: true },
            { id: 'k2', label: 'AI video generation', checked: true },
            { id: 'k3', label: 'Rough cut', checked: true },
            { id: 'k4', label: 'Planning video (timestamps)', checked: false },
            { id: 'k5', label: 'Color correction & grading', checked: false },
            { id: 'k6', label: 'Add SFX', checked: false },
            { id: 'k7', label: 'Final export', checked: false }
        ],
        stageStatus: 'in_progress',
        reviewer: 'Keanu',
        stageVersion: 2,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-13', finalVersion: 1 }
        ],
        assetCount: 20,
        technicalLevel: 5,
        dependencies: [],
        timeSpent: 300,
        thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format',
        activity: [
            { id: 'act-1', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-13T14:00:00Z', from: 'scripting', to: 'production' },
            { id: 'act-2', type: 'comment', author: 'Alex', timestamp: '2026-01-14T10:00:00Z', content: 'Generated 50+ clips with Kling. Selecting the best ones now.' },
            { id: 'act-3', type: 'revision_request', author: 'Keanu', timestamp: '2026-01-15T11:00:00Z', stage: 'production', fromVersion: 1, toVersion: 2 },
            { id: 'act-4', type: 'comment', author: 'Keanu', timestamp: '2026-01-15T11:05:00Z', content: 'Need more dynamic camera movements. V1 felt too static.' }
        ]
    },

    // === Internal Tutorial - QA Stage ===
    {
        id: 8,
        title: 'Color Grading Masterclass',
        stage: 'qa',
        assignee: 'Sarah',
        collaborators: ['Keanu'],
        startDate: '2026-01-05',
        dueDate: '2026-01-12',
        format: 'long-form',
        client: null,
        urgency: 'medium',
        description: '25-minute deep dive into our color grading workflow. DaVinci Resolve + LUTs.',
        checklists: [
            { id: 'cg1', label: 'Script ready-to-go', checked: true },
            { id: 'cg2', label: 'Screen recordings', checked: true },
            { id: 'cg3', label: 'Voiceover', checked: true },
            { id: 'cg4', label: 'B-rolls', checked: true },
            { id: 'cg5', label: 'Add soundtrack', checked: true },
            { id: 'cg6', label: 'Final export', checked: false }
        ],
        stageStatus: 'in_progress',
        reviewer: 'Keanu',
        stageVersion: 1,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-06', finalVersion: 2 },
            { stage: 'production', approvedBy: 'Keanu', date: '2026-01-10', finalVersion: 1 }
        ],
        assetCount: 6,
        technicalLevel: 3,
        dependencies: [],
        timeSpent: 480,
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format',
        activity: [
            { id: 'act-1', type: 'comment', author: 'Sarah', timestamp: '2026-01-05T09:00:00Z', content: 'This will be great for onboarding new editors!' },
            { id: 'act-2', type: 'stage_change', author: 'Keanu', timestamp: '2026-01-10T16:00:00Z', from: 'production', to: 'qa' },
            { id: 'act-3', type: 'comment', author: 'Keanu', timestamp: '2026-01-11T10:00:00Z', content: 'Watching through now. Quality is excellent!' }
        ]
    }
];

export const INSPIRATION_ITEMS = [
    {
        id: 1,
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format',
        videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
        title: 'Cinematic Night Scene',
        creator: 'Keanu Visuals',
        source: 'Instagram',
        saved: false
    },
    {
        id: 2,
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format',
        title: 'Neon Aesthetic Study',
        creator: 'Community',
        source: 'Pinterest',
        saved: true
    },
    { id: 3, type: 'image', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format', title: 'Abstract Fluid', creator: 'Artist X', source: 'Behance', saved: false },
    { id: 4, type: 'video', thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format', videoUrl: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4', title: 'Lighting Reference', creator: 'Studio A', source: 'Instagram', saved: false },
    { id: 5, type: 'image', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format', title: 'Retro Tech', creator: 'Designer Y', source: 'Pinterest', saved: true }
];

export const TEAM_MEMBERS = ['Keanu', 'Sarah', 'Mike', 'Alex', 'Jordan'];

// Mock API functions
export const boardsService = {
    getProduction: () => Promise.resolve(PRODUCTION_ITEMS),
    getInspiration: () => Promise.resolve(INSPIRATION_ITEMS),
    createProduction: (item) => Promise.resolve({ ...item, id: Date.now() }),
    updateProduction: (id, data) => Promise.resolve({ ...PRODUCTION_ITEMS.find(i => i.id === id), ...data }),
    deleteProduction: (id) => Promise.resolve({ success: true }),
    saveInspiration: (item) => Promise.resolve({ ...item, saved: true })
};
