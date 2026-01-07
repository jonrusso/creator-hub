// Mock Boards Data
export const PRODUCTION_ITEMS = [
    {
        id: 1,
        title: 'AI Brand Showcase - Runway',
        stage: 'scripting',
        assignee: 'Designer',
        dueDate: '2026-01-10',
        format: 'Short Form',
        description: 'Create a 30s showcase of the new Runway features focusing on Gen-2 updates.',
        checklists: [
            { id: 'c1', label: 'Script Draft', checked: true },
            { id: 'c2', label: 'Asset Collection', checked: false }
        ]
    },
    {
        id: 2,
        title: 'Higgsfield Tutorial - Identity Synthesis',
        stage: 'production',
        assignee: 'Editor',
        dueDate: '2026-01-12',
        format: 'Long Form',
        description: 'Deep dive tutorial following the new workflow.',
        checklists: [
            { id: 'qa1', label: 'Color grading matches brand palette', checked: true },
            { id: 'qa2', label: 'Audio levels normalized', checked: true },
            { id: 'qa3', label: 'Branding placement verified', checked: false }
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

export const TEAM_MEMBERS = ['Admin', 'Editor', 'Designer', 'Sarah', 'Mike'];

// Mock API functions
export const boardsService = {
    getProduction: () => Promise.resolve(PRODUCTION_ITEMS),
    getInspiration: () => Promise.resolve(INSPIRATION_ITEMS),
    createProduction: (item) => Promise.resolve({ ...item, id: Date.now() }),
    updateProduction: (id, data) => Promise.resolve({ ...PRODUCTION_ITEMS.find(i => i.id === id), ...data }),
    deleteProduction: (id) => Promise.resolve({ success: true }),
    saveInspiration: (item) => Promise.resolve({ ...item, saved: true })
};
