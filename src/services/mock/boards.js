// Mock Boards Data
// Stage statuses: 'not_started' | 'in_progress' | 'review' | 'approved'
export const STAGE_STATUSES = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    APPROVED: 'approved'
};

export const PRODUCTION_ITEMS = [
    {
        id: 1,
        title: 'AI Brand Showcase - Runway',
        stage: 'scripting',
        assignee: 'Alex',
        startDate: '2026-01-08',
        dueDate: '2026-01-15',
        format: 'hero-video',
        client: 'TechBrand',
        urgency: 'high',
        description: 'Create a 30s showcase of the new Runway features focusing on Gen-2 updates.',
        checklists: [
            { id: 'c1', label: 'Script Draft', checked: true },
            { id: 'c2', label: 'Asset Collection', checked: false }
        ],
        // Pipeline fields
        stageStatus: 'in_progress',
        reviewer: 'Keanu',
        revision: 1,
        stageHistory: []
    },
    {
        id: 2,
        title: 'Higgsfield Tutorial - Identity Synthesis',
        stage: 'production',
        assignee: 'Jordan',
        startDate: '2026-01-10',
        dueDate: '2026-01-18',
        format: 'long-form',
        client: null,
        urgency: 'medium',
        description: 'Deep dive tutorial following the new workflow.',
        checklists: [
            { id: 'qa1', label: 'Color grading matches brand palette', checked: true },
            { id: 'qa2', label: 'Audio levels normalized', checked: true },
            { id: 'qa3', label: 'Branding placement verified', checked: false }
        ],
        // Pipeline fields
        stageStatus: 'review',
        reviewer: 'Keanu',
        revision: 2,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-09', revision: 1 }
        ]
    },
    {
        id: 3,
        title: 'BTS - Studio Session',
        stage: 'qa',
        assignee: 'Sarah',
        startDate: '2026-01-12',
        dueDate: '2026-01-14',
        format: 'bts-short',
        client: null,
        urgency: 'low',
        description: 'Quick behind-the-scenes of the studio setup process.',
        checklists: [],
        // Pipeline fields
        stageStatus: 'not_started',
        reviewer: 'Keanu',
        revision: 1,
        stageHistory: [
            { stage: 'scripting', approvedBy: 'Keanu', date: '2026-01-10', revision: 1 },
            { stage: 'production', approvedBy: 'Keanu', date: '2026-01-11', revision: 2 }
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
