// Mock Workflows Database
const MASTER_PROMPT = `Ultra-cinematic nighttime film still featuring the subject standing outside a small convenience store illuminated by neon signage and fluorescent interior lights. The subject must exactly match the identity of the provided reference image — same facial structure, jawline, nose, lips. DETAILS: Ultra realistic, visible skin texture, sweat, detailed hair strands, 8k resolution.`;

export const WORKFLOWS_DB = [
    {
        id: 'wf-001',
        title: 'Higgsfield x ChatGPT Face Fidelity',
        description: 'Process for creating face-accurate AI videos using Higgsfield and ChatGPT refinement.',
        status: 'published',
        author: 'Admin',
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
                title: 'Identity Reference',
                type: 'image',
                url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format',
                caption: 'Ideal reference: Front facing, even lighting, 4K resolution.'
            },
            {
                id: 's3',
                title: 'Master Prompt',
                type: 'prompt',
                content: MASTER_PROMPT
            },
            {
                id: 's4',
                title: 'Video Tutorial',
                type: 'video',
                platform: 'youtube',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                caption: 'Watch the step-by-step guide.'
            }
        ]
    },
    {
        id: 'wf-002',
        title: 'Runway Gen-2 Motion Brush',
        description: 'Advanced motion control workflow for specific element animation.',
        status: 'pending_approval',
        author: 'Sarah (Editor)',
        lastUpdated: '2025-12-28',
        sections: [
            { id: 's1', title: 'Concept', type: 'text', content: 'Using motion brush to isolate subject movement.' }
        ]
    }
];

// Mock API functions
export const workflowsService = {
    getAll: () => Promise.resolve(WORKFLOWS_DB),
    getById: (id) => Promise.resolve(WORKFLOWS_DB.find(w => w.id === id)),
    create: (workflow) => Promise.resolve({ ...workflow, id: `wf-${Date.now()}` }),
    update: (id, data) => Promise.resolve({ ...WORKFLOWS_DB.find(w => w.id === id), ...data }),
    delete: (id) => Promise.resolve({ success: true }),
    submitForApproval: (id) => Promise.resolve({ ...WORKFLOWS_DB.find(w => w.id === id), status: 'pending_approval' }),
    approve: (id) => Promise.resolve({ ...WORKFLOWS_DB.find(w => w.id === id), status: 'published' })
};
