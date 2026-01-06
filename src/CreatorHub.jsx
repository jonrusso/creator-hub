import React, { useState, useRef, useEffect } from 'react';
import {
    Menu, X, Workflow, LayoutDashboard, Image as ImageIcon,
    Copy, Check, ChevronRight, ChevronLeft, Bookmark,
    User, LogOut, PlayCircle, CheckSquare, Square,
    Plus, Search, Grid, List as ListIcon, Video, ArrowLeft,
    Settings, MoreVertical, ExternalLink, Edit2, Trash2,
    Eye, FileText, Youtube, Upload, Link as LinkIcon
} from 'lucide-react';

// ==================== MOCK DATA ====================
const MASTER_PROMPT = `Ultra-cinematic nighttime film still featuring the subject standing outside a small convenience store illuminated by neon signage and fluorescent interior lights. The subject must exactly match the identity of the provided reference image — same facial structure, jawline, nose, lips. DETAILS: Ultra realistic, visible skin texture, sweat, detailed hair strands, 8k resolution.`;

// Workflows Database (V3: Doc Style + Status)
const WORKFLOWS_DB = [
    {
        id: 'wf-001',
        title: 'Higgsfield x ChatGPT Face Fidelity',
        description: 'Process for creating face-accurate AI videos using Higgsfield and ChatGPT refinement.',
        status: 'published', // published, pending_approval, draft
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
                platform: 'youtube', // youtube, vimeo, drive
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
                caption: 'Watch the step-by-step genericguide.'
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

const PRODUCTION_ITEMS = [
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

const INSPIRATION_ITEMS = [
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

const TEAM_MEMBERS = ['Admin', 'Editor', 'Designer', 'Sarah', 'Mike'];

// ==================== SUB-COMPONENTS ====================

const Logo = ({ variant = 'icon', className = '' }) => {
    if (variant === 'primary') {
        return (
            <div className={`flex flex-col items-center ${className}`}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-brand to-violet-brand flex items-center justify-center mb-3">
                    <span className="text-white-smoke font-heading text-4xl font-bold">C</span>
                </div>
                <h1 className="text-white-smoke font-heading text-2xl font-bold tracking-wide">CREATORS CLUB</h1>
                <p className="text-white-smoke/60 font-body text-sm mt-1">Learn. Share. Connect.</p>
            </div>
        );
    }
    return (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-orange-brand to-violet-brand flex items-center justify-center ${className}`}>
            <span className="text-white-smoke font-heading text-xl font-bold">C</span>
        </div>
    );
};

// ==================== AUTHENTICATION LAYER (V3) ====================
const AuthenticationLayer = ({ onLogin }) => {
    const [view, setView] = useState('login'); // login | signup | admin
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('editor'); // Default selection

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock Auth Logic
        if (view === 'admin') {
            if (password === 'admin123') onLogin('admin');
            else alert('Invalid Admin Password (hint: admin123)');
        } else {
            onLogin(role); // 'editor' or 'designer'
        }
    };

    return (
        <div className="min-h-screen bg-cyan-blue flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Logo variant="primary" className="mb-12" />

                <div className="bg-onyx rounded-2xl p-8 shadow-2xl border border-white-smoke/5 relative overflow-hidden">
                    {/* Admin Toggle (Hidden Corner) */}
                    <button
                        onClick={() => setView('admin')}
                        className="absolute top-2 right-2 p-2 text-white-smoke/10 hover:text-white-smoke/40"
                        title="Admin Login"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <h2 className="text-white-smoke font-heading text-2xl font-semibold mb-2">
                        {view === 'signup' ? 'Join the Club' : view === 'admin' ? 'Admin Access' : 'Welcome Back'}
                    </h2>
                    <p className="text-white-smoke/60 font-body text-sm mb-8">
                        {view === 'signup' ? 'Create your account' : 'Sign in to access Creator Hub'}
                    </p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {view !== 'admin' && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button type="button" onClick={() => setRole('editor')} className={`p-3 rounded-xl border-2 transition-all ${role === 'editor' ? 'border-orange-brand bg-orange-brand/10 text-white-smoke' : 'border-white-smoke/10 bg-white-smoke/5 text-white-smoke/60'}`}>
                                    <FileText className="w-5 h-5 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Editor</span>
                                </button>
                                <button type="button" onClick={() => setRole('designer')} className={`p-3 rounded-xl border-2 transition-all ${role === 'designer' ? 'border-orange-brand bg-orange-brand/10 text-white-smoke' : 'border-white-smoke/10 bg-white-smoke/5 text-white-smoke/60'}`}>
                                    <ImageIcon className="w-5 h-5 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Designer</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white-smoke/60 text-xs mb-1">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-cyan-blue border border-white-smoke/10 rounded-lg p-3 text-white-smoke focus:border-orange-brand outline-none" placeholder="name@keanuvisuals.com" />
                            </div>
                            <div>
                                <label className="block text-white-smoke/60 text-xs mb-1">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-cyan-blue border border-white-smoke/10 rounded-lg p-3 text-white-smoke focus:border-orange-brand outline-none" placeholder="••••••••" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-orange-brand hover:bg-orange-brand/90 text-white-smoke font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-orange-brand/20">
                            {view === 'signup' ? 'Sign Up' : 'Continue'}
                        </button>
                    </form>

                    {view !== 'admin' && (
                        <div className="mt-6 text-center">
                            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-white-smoke/40 text-sm hover:text-white-smoke transition-colors">
                                {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    )}
                    {view === 'admin' && (
                        <div className="mt-6 text-center">
                            <button onClick={() => setView('login')} className="text-white-smoke/40 text-sm hover:text-white-smoke transition-colors">
                                Back to Creator Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== WORKFLOWS MODULE (V3: Doc & Approvals) ====================
const WorkflowsModule = ({ userRole }) => {
    const [view, setView] = useState('list'); // list | detail | draft
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [activeTab, setActiveTab] = useState('library'); // library | approvals
    const [db, setDb] = useState(WORKFLOWS_DB);

    const isAdmin = userRole === 'admin';

    // Workflow Detail (Doc View)
    const WorkflowDetail = ({ workflow, onBack }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [localSections, setLocalSections] = useState(workflow.sections || []);

        const handleSave = () => {
            // Mock save
            setIsEditing(false);
            // In real app, update DB
        };

        const addSection = (type) => {
            const newSection = { id: Date.now(), title: 'New Section', type, content: '' };
            setLocalSections([...localSections, newSection]);
        };

        const renderSection = (section, index) => {
            if (isEditing) {
                return (
                    <div key={section.id} className="bg-cyan-blue/30 p-4 rounded-xl border border-white-smoke/10 mb-4">
                        <input defaultValue={section.title} className="bg-transparent text-lg font-bold text-white-smoke w-full mb-2 outline-none border-b border-white-smoke/10 pb-1" />
                        <textarea defaultValue={section.content} className="w-full bg-black/20 text-white-smoke/80 p-2 rounded h-24 outline-none" />
                    </div>
                );
            }

            return (
                <div key={section.id} className="mb-8 last:mb-0">
                    <h3 className="text-white-smoke font-heading text-xl font-bold mb-3 flex items-center gap-2">
                        {section.title}
                    </h3>

                    {section.type === 'text' && (
                        <p className="text-white-smoke/80 font-body leading-relaxed whitespace-pre-wrap">{section.content}</p>
                    )}

                    {section.type === 'image' && (
                        <div className="rounded-xl overflow-hidden border border-white-smoke/5 bg-black/20">
                            <img src={section.url} alt={section.caption} className="w-full h-auto max-h-[500px] object-contain" />
                            {section.caption && <p className="p-3 text-sm text-white-smoke/40 italic">{section.caption}</p>}
                        </div>
                    )}

                    {section.type === 'prompt' && (
                        <div className="bg-cyan-blue p-5 rounded-lg border-l-4 border-orange-brand">
                            <div className="flex justify-between items-start gap-4">
                                <code className="text-white-smoke/90 font-mono text-sm">{section.content}</code>
                                <button onClick={() => navigator.clipboard.writeText(section.content)} className="p-2 hover:bg-white-smoke/10 rounded">
                                    <Copy className="w-4 h-4 text-white-smoke/60" />
                                </button>
                            </div>
                        </div>
                    )}

                    {section.type === 'video' && (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white-smoke/10">
                            <iframe
                                src={section.url}
                                className="w-full h-full"
                                title={section.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="max-w-4xl mx-auto animate-fadeIn">
                {/* Detail Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-white-smoke/60 hover:text-white-smoke transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Library
                    </button>

                    <div className="flex gap-3">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white-smoke/10 hover:bg-white-smoke/20 text-white-smoke px-4 py-2 rounded-lg transition-all">
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                        )}
                        {isEditing && (
                            <button onClick={handleSave} className="flex items-center gap-2 bg-orange-brand hover:bg-orange-brand/90 text-white-smoke px-4 py-2 rounded-lg transition-all">
                                <Check className="w-4 h-4" /> Save Changes
                            </button>
                        )}
                        {isAdmin && (
                            <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg" title="Delete Workflow">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-onyx rounded-2xl p-8 md:p-12 border border-white-smoke/5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${workflow.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {workflow.status.replace('_', ' ')}
                        </span>
                        <span className="text-white-smoke/40 text-sm">Last updated {workflow.lastUpdated} by {workflow.author}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-white-smoke mb-4">{workflow.title}</h1>
                    <p className="text-xl text-white-smoke/60 font-light mb-12">{workflow.description}</p>

                    <div className="h-px bg-white-smoke/10 w-full mb-12" />

                    <div className="space-y-12">
                        {localSections.map((section, idx) => renderSection(section, idx))}
                    </div>

                    {isEditing && (
                        <div className="mt-12 p-8 border-2 border-dashed border-white-smoke/10 rounded-xl text-center">
                            <p className="text-white-smoke/40 text-sm mb-4">Add Content Block</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => addSection('text')} className="p-3 bg-white-smoke/5 rounded-lg hover:bg-white-smoke/10"><FileText className="w-5 h-5" /></button>
                                <button onClick={() => addSection('image')} className="p-3 bg-white-smoke/5 rounded-lg hover:bg-white-smoke/10"><ImageIcon className="w-5 h-5" /></button>
                                <button onClick={() => addSection('video')} className="p-3 bg-white-smoke/5 rounded-lg hover:bg-white-smoke/10"><Video className="w-5 h-5" /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const filteredWorkflows = db.filter(w => {
        if (activeTab === 'approvals') return w.status === 'pending_approval';
        return w.status === 'published' || w.status === 'draft'; // Show user's drafts (simplified)
    });

    if (view === 'detail' && selectedWorkflow) return <WorkflowDetail workflow={selectedWorkflow} onBack={() => setView('list')} />;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-white-smoke font-heading text-3xl font-bold mb-1">Workflows</h1>
                    <p className="text-white-smoke/60 font-body text-sm">Knowledge Base & Documentation</p>
                </div>
                <div className="flex gap-2 bg-onyx p-1 rounded-lg border border-white-smoke/5">
                    <button onClick={() => setActiveTab('library')} className={`px-4 py-1.5 rounded-md text-sm transition-all ${activeTab === 'library' ? 'bg-white-smoke/10 text-white-smoke' : 'text-white-smoke/40'}`}>Library</button>
                    {isAdmin && (
                        <button onClick={() => setActiveTab('approvals')} className={`px-4 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-orange-brand/20 text-orange-brand' : 'text-white-smoke/40'}`}>
                            Approvals
                            {db.filter(w => w.status === 'pending_approval').length > 0 && <span className="w-2 h-2 rounded-full bg-orange-brand"></span>}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorkflows.map((workflow) => (
                    <div
                        key={workflow.id}
                        onClick={() => { setSelectedWorkflow(workflow); setView('detail'); }}
                        className="group bg-onyx rounded-2xl p-6 border border-white-smoke/5 hover:border-orange-brand/30 transition-all cursor-pointer hover:shadow-xl hover:shadow-orange-brand/5 flex flex-col h-full relative overflow-hidden"
                    >
                        {workflow.status === 'pending_approval' && <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Pending Approval</div>}

                        <div className="flex items-start justify-between mb-4 mt-2">
                            <div className="p-3 rounded-xl bg-cyan-blue border border-white-smoke/5 group-hover:border-orange-brand/20 transition-colors">
                                <FileText className="w-6 h-6 text-orange-brand" />
                            </div>
                        </div>
                        <h3 className="text-white-smoke font-heading text-xl font-bold mb-2 group-hover:text-orange-brand transition-colors">{workflow.title}</h3>
                        <p className="text-white-smoke/60 text-sm mb-6 line-clamp-2">{workflow.description}</p>
                        <div className="mt-auto pt-4 border-t border-white-smoke/5 flex items-center justify-between text-xs text-white-smoke/40">
                            <span>Updated {workflow.lastUpdated}</span>
                            <span>by {workflow.author}</span>
                        </div>
                    </div>
                ))}
                {/* Create New Card */}
                <div className="group bg-onyx/40 rounded-2xl p-6 border-2 border-dashed border-white-smoke/5 hover:border-orange-brand/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px] text-white-smoke/40 hover:text-orange-brand">
                    <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-heading font-bold text-lg">Create New Workflow</span>
                </div>
            </div>
        </div>
    );
};

// ==================== BOARDS MODULE (V3: Trello-style + Inspiration) ====================
const BoardsModule = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('production');

    // Trello-style Production Board
    const ProductionView = () => {
        const [items, setItems] = useState(PRODUCTION_ITEMS);
        const [columns, setColumns] = useState(['scripting', 'production', 'qa']);
        const [selectedCard, setSelectedCard] = useState(null); // For Modal

        // Modal Component
        const CardModal = ({ card, onClose }) => {
            if (!card) return null;
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-onyx w-full max-w-2xl rounded-2xl border border-white-smoke/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white-smoke/5 flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-white-smoke font-heading">{card.title}</h2>
                            <button onClick={onClose}><X className="w-6 h-6 text-white-smoke/40 hover:text-white-smoke" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Description */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">Description</label>
                                <textarea className="w-full bg-cyan-blue/50 p-3 rounded-lg text-white-smoke/80 text-sm outline-none border border-white-smoke/5" rows={3} defaultValue={card.description} />
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">Assignee</label>
                                <div className="flex gap-2">
                                    {TEAM_MEMBERS.map(member => (
                                        <button key={member} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${card.assignee === member ? 'bg-orange-brand text-white-smoke border-orange-brand' : 'border-white-smoke/10 text-white-smoke/40 hover:border-white-smoke/30'}`}>
                                            {member}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Checklists */}
                            <div>
                                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">Checklist</label>
                                <div className="space-y-2">
                                    {card.checklists?.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-white-smoke/5 rounded-lg">
                                            <button className={`${item.checked ? 'text-orange-brand' : 'text-white-smoke/20'}`}>
                                                {item.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                            </button>
                                            <span className={`text-sm ${item.checked ? 'text-white-smoke/40 line-through' : 'text-white-smoke/80'}`}>{item.label}</span>
                                        </div>
                                    ))}
                                    <button className="flex items-center gap-2 text-xs text-orange-brand mt-2 hover:underline"><Plus className="w-3 h-3" /> Add Item</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white-smoke/5 bg-cyan-blue/30 flex justify-end">
                            <button onClick={onClose} className="px-4 py-2 bg-white-smoke/10 text-white-smoke rounded-lg text-sm font-medium hover:bg-white-smoke/20">Close</button>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="animate-fadeIn h-full overflow-x-auto pb-4">
                {/* Columns */}
                <div className="flex gap-6 min-w-max">
                    {columns.map(col => (
                        <div key={col} className="w-80 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="font-heading font-bold text-white-smoke uppercase tracking-wider text-sm">{col}</h3>
                                <span className="text-xs text-white-smoke/40 font-mono bg-white-smoke/5 px-2 py-0.5 rounded-full">{items.filter(i => i.stage === col).length}</span>
                            </div>
                            <div className="space-y-3">
                                {items.filter(i => i.stage === col).map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedCard(item)}
                                        className="bg-onyx p-4 rounded-xl border border-white-smoke/5 hover:border-orange-brand/40 cursor-pointer shadow-sm group transition-all"
                                    >
                                        <h4 className="text-white-smoke font-medium text-sm mb-3 group-hover:text-orange-brand transition-colors">{item.title}</h4>
                                        <div className="flex justify-between items-center">
                                            <div className="text-[10px] px-2 py-0.5 rounded bg-violet-brand/20 text-violet-brand font-bold">{item.format}</div>
                                            {item.assignee && <div className="text-[10px] text-white-smoke/40">@{item.assignee}</div>}
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-2 flex items-center justify-center gap-2 text-white-smoke/20 hover:text-white-smoke/60 hover:bg-white-smoke/5 rounded-xl border border-transparent hover:border-white-smoke/5 border-dashed transition-all">
                                    <Plus className="w-4 h-4" /> Add Card
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Add Column */}
                    <div className="w-80 flex-shrink-0">
                        <button className="w-full h-12 flex items-center justify-center gap-2 bg-white-smoke/5 text-white-smoke/40 rounded-xl hover:bg-white-smoke/10 hover:text-white-smoke transition-all">
                            <Plus className="w-5 h-5" /> Add List
                        </button>
                    </div>
                </div>
                {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
            </div>
        );
    };

    // Inspiration View (Denser Grid + Accounts)
    const InspirationView = () => {
        const [mockConnected, setMockConnected] = useState(false);

        return (
            <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-white-smoke/60 text-sm">Aggregated Feed</p>
                    <button
                        onClick={() => { setMockConnected(true); alert('Simulated: Instagram & Pinterest Connected!'); }}
                        className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mockConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'border-white-smoke/10 text-white-smoke/60 hover:text-white-smoke hover:bg-white-smoke/5'}`}
                    >
                        {mockConnected ? <><Check className="w-3 h-3" /> Accounts Linked</> : <><LinkIcon className="w-3 h-3" /> Connect Accounts</>}
                    </button>
                </div>

                {/* Pinterest Logic Grid (Denser) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {INSPIRATION_ITEMS.map(item => (
                        <div key={item.id} className="group relative bg-onyx rounded-xl overflow-hidden aspect-[9/16] cursor-pointer">
                            {item.type === 'video' ? (
                                <video src={item.videoUrl} muted loop onMouseEnter={e => e.target.play()} onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }} className="w-full h-full object-cover" />
                            ) : (
                                <img src={item.thumbnail} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                                <span className="text-white-smoke text-[10px] font-bold line-clamp-1">{item.title}</span>
                                <div className="bg-orange-brand p-1.5 rounded-full"><Bookmark className="w-3 h-3 text-white-smoke" /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-white-smoke font-heading text-3xl font-bold mb-1">Boards</h1>
                    <p className="text-white-smoke/60 font-body text-sm">Production Pipeline & Inspiration</p>
                </div>
                <div className="bg-onyx p-1 rounded-xl flex border border-white-smoke/5">
                    <button onClick={() => setActiveTab('production')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'production' ? 'bg-white-smoke/10 text-white-smoke' : 'text-white-smoke/60'}`}>Production</button>
                    <button onClick={() => setActiveTab('inspiration')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'inspiration' ? 'bg-violet-brand/20 text-violet-brand shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'text-white-smoke/60'}`}>Inspiration</button>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                {activeTab === 'production' ? <ProductionView /> : <InspirationView />}
            </div>
        </div>
    );
};

// ==================== MAIN APP SHELL ====================
const CreatorHub = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'editor' | 'designer'
    const [activeModule, setActiveModule] = useState('workflows');

    // Permissions Helper
    const canDelete = userRole === 'admin';

    if (!isAuthenticated) return <AuthenticationLayer onLogin={(role) => { setUserRole(role); setIsAuthenticated(true); }} />;

    return (
        <div className="min-h-screen bg-cyan-blue flex font-body text-white-smoke overflow-hidden text-sm md:text-base">
            <aside className="w-64 bg-onyx border-r border-white-smoke/5 flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <Logo variant="icon" />
                    <div className="mt-4">
                        <h2 className="font-heading font-bold tracking-wide">Creator Hub</h2>
                        <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-white-smoke/5 rounded-lg w-fit">
                            <User className="w-3 h-3 text-orange-brand" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">{userRole}</span>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button onClick={() => setActiveModule('workflows')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeModule === 'workflows' ? 'bg-white-smoke/5 text-orange-brand border border-orange-brand/20' : 'text-white-smoke/60 hover:text-white-smoke'}`}>
                        <Workflow className="w-5 h-5" /> <span className="font-medium">Workflows</span>
                    </button>
                    <button onClick={() => setActiveModule('boards')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeModule === 'boards' ? 'bg-white-smoke/5 text-orange-brand border border-orange-brand/20' : 'text-white-smoke/60 hover:text-white-smoke'}`}>
                        <LayoutDashboard className="w-5 h-5" /> <span className="font-medium">Boards</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-white-smoke/5">
                    <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white-smoke/40 hover:text-red-400 transition-all">
                        <LogOut className="w-5 h-5" /> <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8 h-screen overflow-hidden">
                <div className="h-full overflow-y-auto pr-2">
                    {activeModule === 'workflows' && <WorkflowsModule userRole={userRole} />}
                    {activeModule === 'boards' && <BoardsModule userRole={userRole} />}
                </div>
            </main>
        </div>
    );
};

export default CreatorHub;
