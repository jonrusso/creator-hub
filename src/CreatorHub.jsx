import React, { useState } from 'react';
import {
    Menu, X, Workflow, LayoutDashboard, Image as ImageIcon,
    Copy, Check, ChevronRight, ChevronLeft, Bookmark,
    User, LogOut, PlayCircle, CheckSquare, Square
} from 'lucide-react';

// ==================== MOCK DATA ====================
const MASTER_PROMPT = `Ultra-cinematic nighttime film still featuring the subject standing outside a small convenience store illuminated by neon signage and fluorescent interior lights. The subject must exactly match the identity of the provided reference image — same facial structure, jawline, nose, lips. DETAILS: Ultra realistic, visible skin texture, sweat, detailed hair strands, 8k resolution.`;

const WORKFLOW_STEPS = [
    {
        id: 1,
        title: 'Identity Reference Upload',
        description: 'Upload the reference image that contains the subject identity you want to replicate.',
        status: 'complete'
    },
    {
        id: 2,
        title: 'Prompt Setup',
        description: 'Configure your cinematic prompt for the Higgsfield AI model.',
        status: 'active',
        hasPrompt: true
    },
    {
        id: 3,
        title: 'Model Parameters',
        description: 'Fine-tune generation settings: resolution, guidance scale, and steps.',
        status: 'pending'
    },
    {
        id: 4,
        title: 'Generate & Review',
        description: 'Run the synthesis and review results for quality assurance.',
        status: 'pending'
    }
];

const PRODUCTION_ITEMS = [
    {
        id: 1,
        title: 'AI Brand Showcase - Runway',
        stage: 'scripting',
        assignee: 'Admin',
        dueDate: '2026-01-10',
        format: 'Short Form'
    },
    {
        id: 2,
        title: 'Higgsfield Tutorial - Identity Synthesis',
        stage: 'production',
        assignee: 'Creator',
        dueDate: '2026-01-12',
        format: 'Long Form',
        qaChecklist: [
            { id: 'qa1', label: 'Color grading matches brand palette', checked: true },
            { id: 'qa2', label: 'Audio levels normalized', checked: true },
            { id: 'qa3', label: 'Branding placement verified', checked: false }
        ]
    },
    {
        id: 3,
        title: 'Luma Labs Dream Machine Review',
        stage: 'qa',
        assignee: 'Admin',
        dueDate: '2026-01-08',
        format: 'Short Form',
        qaChecklist: [
            { id: 'qa4', label: 'Final export quality check', checked: true },
            { id: 'qa5', label: 'Thumbnails A/B tested', checked: true },
            { id: 'qa6', label: 'Metadata & SEO optimized', checked: true }
        ]
    },
    {
        id: 4,
        title: 'Instagram Reel - VFX Breakdown',
        stage: 'scripting',
        assignee: 'Creator',
        dueDate: '2026-01-15',
        format: 'Short Form'
    }
];

const INSPIRATION_ITEMS = [
    {
        id: 1,
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format',
        title: 'Cinematic Night Scene',
        creator: 'Keanu Visuals',
        saved: false
    },
    {
        id: 2,
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format',
        title: 'Neon Aesthetic Study',
        creator: 'Community',
        saved: true
    },
    {
        id: 3,
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format',
        title: 'VFX Breakdown Animation',
        creator: 'Keanu Visuals',
        saved: false
    },
    {
        id: 4,
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format',
        title: 'Portrait Lighting Reference',
        creator: 'Community',
        saved: false
    },
    {
        id: 5,
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format',
        title: 'Color Grading Inspiration',
        creator: 'Keanu Visuals',
        saved: true
    },
    {
        id: 6,
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format',
        title: 'Motion Design Elements',
        creator: 'Community',
        saved: false
    }
];

// ==================== SUB-COMPONENTS ====================

// Logo Component (Primary Lockup for Login, Icon-Only for Sidebar)
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

// ==================== AUTHENTICATION LAYER ====================
const AuthenticationLayer = ({ onLogin }) => {
    const [role, setRole] = useState('admin');

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(role);
    };

    return (
        <div className="min-h-screen bg-cyan-blue flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Logo variant="primary" className="mb-12" />

                <div className="bg-onyx rounded-2xl p-8 shadow-2xl border border-white-smoke/5">
                    <h2 className="text-white-smoke font-heading text-2xl font-semibold mb-2">Welcome Back</h2>
                    <p className="text-white-smoke/60 font-body text-sm mb-8">Sign in to access Creator Hub</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-white-smoke font-body text-sm font-medium mb-2">
                                Select Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`p-4 rounded-xl border-2 transition-all ${role === 'admin'
                                            ? 'border-orange-brand bg-orange-brand/10 text-white-smoke'
                                            : 'border-white-smoke/10 bg-white-smoke/5 text-white-smoke/60 hover:border-white-smoke/20'
                                        }`}
                                >
                                    <User className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-body text-sm font-medium">Admin</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('creator')}
                                    className={`p-4 rounded-xl border-2 transition-all ${role === 'creator'
                                            ? 'border-orange-brand bg-orange-brand/10 text-white-smoke'
                                            : 'border-white-smoke/10 bg-white-smoke/5 text-white-smoke/60 hover:border-white-smoke/20'
                                        }`}
                                >
                                    <PlayCircle className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-body text-sm font-medium">Creator</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-brand hover:bg-orange-brand/90 text-white-smoke font-body font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-orange-brand/20"
                        >
                            Continue to Hub
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ==================== MODULE 1: WORKFLOWS ====================
const WorkflowsModule = () => {
    const [currentStep, setCurrentStep] = useState(2);
    const [copied, setCopied] = useState(false);

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(MASTER_PROMPT);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white-smoke font-heading text-3xl font-bold mb-2">Workflows</h1>
                    <p className="text-white-smoke/60 font-body">Higgsfield Identity Synthesis</p>
                </div>
                <div className="flex items-center gap-2 text-white-smoke/40 font-body text-sm">
                    <span>Step {currentStep} of {WORKFLOW_STEPS.length}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-onyx rounded-full h-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-orange-brand to-violet-brand h-full transition-all duration-500"
                    style={{ width: `${(currentStep / WORKFLOW_STEPS.length) * 100}%` }}
                />
            </div>

            {/* Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {WORKFLOW_STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`bg-onyx rounded-xl p-6 border-2 transition-all ${step.status === 'active'
                                ? 'border-orange-brand shadow-lg shadow-orange-brand/10'
                                : step.status === 'complete'
                                    ? 'border-violet-brand/50'
                                    : 'border-white-smoke/5'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'active'
                                        ? 'bg-orange-brand text-white-smoke'
                                        : step.status === 'complete'
                                            ? 'bg-violet-brand text-white-smoke'
                                            : 'bg-white-smoke/10 text-white-smoke/40'
                                    }`}>
                                    {step.status === 'complete' ? <Check className="w-5 h-5" /> : step.id}
                                </div>
                                <div>
                                    <h3 className="text-white-smoke font-heading text-lg font-semibold">{step.title}</h3>
                                </div>
                            </div>
                        </div>

                        <p className="text-white-smoke/60 font-body text-sm mb-4">{step.description}</p>

                        {/* Prompt Setup Block */}
                        {step.hasPrompt && step.status === 'active' && (
                            <div className="mt-4 p-4 bg-cyan-blue/50 rounded-lg border border-orange-brand/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white-smoke font-body text-sm font-semibold">Master Prompt</span>
                                    <button
                                        onClick={handleCopyPrompt}
                                        className="flex items-center gap-2 bg-orange-brand hover:bg-orange-brand/90 text-white-smoke px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-white-smoke/80 font-body text-xs leading-relaxed">
                                    {MASTER_PROMPT}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 bg-white-smoke/5 hover:bg-white-smoke/10 disabled:opacity-30 disabled:cursor-not-allowed text-white-smoke px-4 py-2 rounded-lg transition-all font-body"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={() => setCurrentStep(Math.min(WORKFLOW_STEPS.length, currentStep + 1))}
                    disabled={currentStep === WORKFLOW_STEPS.length}
                    className="flex items-center gap-2 bg-orange-brand hover:bg-orange-brand/90 disabled:opacity-30 disabled:cursor-not-allowed text-white-smoke px-4 py-2 rounded-lg transition-all font-body"
                >
                    Next
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// ==================== MODULE 2: PRODUCTION BOARDS ====================
const ProductionBoards = () => {
    const [view, setView] = useState('kanban');
    const [items, setItems] = useState(PRODUCTION_ITEMS);

    const toggleQAItem = (itemId, qaId) => {
        setItems(items.map(item => {
            if (item.id === itemId && item.qaChecklist) {
                return {
                    ...item,
                    qaChecklist: item.qaChecklist.map(qa =>
                        qa.id === qaId ? { ...qa, checked: !qa.checked } : qa
                    )
                };
            }
            return item;
        }));
    };

    const stages = [
        { id: 'scripting', label: 'Scripting', color: 'violet-brand' },
        { id: 'production', label: 'Production', color: 'orange-brand' },
        { id: 'qa', label: 'QA', color: 'orange-brand' }
    ];

    const renderCard = (item) => (
        <div key={item.id} className="bg-onyx rounded-xl p-4 border border-white-smoke/5 hover:border-orange-brand/30 transition-all">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-white-smoke font-body font-semibold text-sm">{item.title}</h3>
                <span className="text-xs px-2 py-1 rounded bg-violet-brand/20 text-violet-brand font-body">
                    {item.format}
                </span>
            </div>

            <div className="space-y-2 text-xs text-white-smoke/60 font-body">
                <div className="flex items-center justify-between">
                    <span>Assignee:</span>
                    <span className="text-white-smoke">{item.assignee}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Due:</span>
                    <span className="text-orange-brand">{item.dueDate}</span>
                </div>
            </div>

            {item.qaChecklist && (
                <div className="mt-4 pt-4 border-t border-white-smoke/10">
                    <span className="text-white-smoke font-body text-xs font-semibold mb-2 block">QA Checklist</span>
                    <div className="space-y-2">
                        {item.qaChecklist.map(qa => (
                            <label key={qa.id} className="flex items-center gap-2 cursor-pointer group">
                                <button
                                    onClick={() => toggleQAItem(item.id, qa.id)}
                                    className="flex-shrink-0"
                                >
                                    {qa.checked ? (
                                        <CheckSquare className="w-4 h-4 text-orange-brand" />
                                    ) : (
                                        <Square className="w-4 h-4 text-white-smoke/30 group-hover:text-white-smoke/60" />
                                    )}
                                </button>
                                <span className={`text-xs font-body ${qa.checked ? 'text-white-smoke/60 line-through' : 'text-white-smoke/80'}`}>
                                    {qa.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white-smoke font-heading text-3xl font-bold mb-2">Production Boards</h1>
                    <p className="text-white-smoke/60 font-body">Track video assets through production pipeline</p>
                </div>

                <div className="flex items-center gap-2 bg-onyx rounded-lg p-1">
                    <button
                        onClick={() => setView('kanban')}
                        className={`px-4 py-2 rounded-lg transition-all font-body text-sm ${view === 'kanban'
                                ? 'bg-orange-brand text-white-smoke'
                                : 'text-white-smoke/60 hover:text-white-smoke'
                            }`}
                    >
                        Kanban
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg transition-all font-body text-sm ${view === 'list'
                                ? 'bg-orange-brand text-white-smoke'
                                : 'text-white-smoke/60 hover:text-white-smoke'
                            }`}
                    >
                        List
                    </button>
                </div>
            </div>

            {view === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stages.map(stage => (
                        <div key={stage.id} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${stage.color}`} />
                                <h2 className="text-white-smoke font-heading text-lg font-semibold">
                                    {stage.label}
                                </h2>
                                <span className="text-white-smoke/40 font-body text-sm">
                                    ({items.filter(item => item.stage === stage.id).length})
                                </span>
                            </div>
                            <div className="space-y-3">
                                {items
                                    .filter(item => item.stage === stage.id)
                                    .map(renderCard)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="flex-1">
                                {renderCard(item)}
                            </div>
                            <span className="text-white-smoke/60 font-body text-sm capitalize min-w-[100px]">
                                {item.stage}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================== MODULE 3: INSPIRATION BOARDS ====================
const InspirationBoards = () => {
    const [items, setItems] = useState(INSPIRATION_ITEMS);

    const toggleSave = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, saved: !item.saved } : item
        ));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-white-smoke font-heading text-3xl font-bold mb-2">Inspiration Boards</h1>
                <p className="text-white-smoke/60 font-body">Curated visual references and creative inspiration</p>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer"
                    >
                        {/* Image */}
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-white-smoke font-body font-semibold text-sm mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-white-smoke/60 font-body text-xs">
                                            by {item.creator}
                                        </p>
                                    </div>
                                    {item.type === 'video' && (
                                        <PlayCircle className="w-5 h-5 text-white-smoke/80" />
                                    )}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSave(item.id);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${item.saved
                                            ? 'bg-orange-brand text-white-smoke'
                                            : 'bg-white-smoke/10 text-white-smoke hover:bg-orange-brand/80'
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${item.saved ? 'fill-current' : ''}`} />
                                    {item.saved ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==================== MAIN APP ====================
const CreatorHub = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [activeModule, setActiveModule] = useState('workflows');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogin = (role) => {
        setUserRole(role);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setActiveModule('workflows');
    };

    const modules = [
        { id: 'workflows', label: 'Workflows', icon: Workflow },
        { id: 'production', label: 'Production Boards', icon: LayoutDashboard },
        { id: 'inspiration', label: 'Inspiration', icon: ImageIcon }
    ];

    if (!isAuthenticated) {
        return <AuthenticationLayer onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-cyan-blue flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-onyx border-r border-white-smoke/5 transition-all duration-300 flex flex-col`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-white-smoke/5 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <Logo variant="icon" />
                            <div>
                                <p className="text-white-smoke font-heading text-sm font-semibold">Creator Hub</p>
                                <p className="text-white-smoke/60 font-body text-xs capitalize">{userRole}</p>
                            </div>
                        </div>
                    )}
                    {!sidebarOpen && <Logo variant="icon" className="mx-auto" />}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        const isActive = activeModule === module.id;

                        return (
                            <button
                                key={module.id}
                                onClick={() => setActiveModule(module.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body ${isActive
                                        ? 'bg-orange-brand text-white-smoke shadow-lg shadow-orange-brand/20'
                                        : 'text-white-smoke/60 hover:bg-white-smoke/5 hover:text-white-smoke'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="text-sm font-medium">{module.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white-smoke/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white-smoke/60 hover:bg-white-smoke/5 hover:text-white-smoke transition-all font-body"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden mb-6 p-2 bg-onyx rounded-lg text-white-smoke"
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Module Content */}
                    {activeModule === 'workflows' && <WorkflowsModule />}
                    {activeModule === 'production' && <ProductionBoards />}
                    {activeModule === 'inspiration' && <InspirationBoards />}
                </div>
            </main>
        </div>
    );
};

export default CreatorHub;
