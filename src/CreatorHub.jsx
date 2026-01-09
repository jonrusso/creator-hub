import React, { useState, useRef, useEffect } from 'react';
import {
    Menu, X, Workflow, LayoutDashboard, Image as ImageIcon,
    Copy, Check, ChevronRight, ChevronLeft, Bookmark,
    User, LogOut, PlayCircle, CheckSquare, Square,
    Plus, Search, Grid, List as ListIcon, Video, ArrowLeft,
    Settings, MoreVertical, ExternalLink, Edit2, Trash2,
    Eye, FileText, Youtube, Upload, Link as LinkIcon, Users
} from 'lucide-react';
import { Logo, GlassCard, Input, Button } from './components/common';
import { AuthenticationLayer } from './components/auth';
import TeamModule from './components/TeamModule';
import { ProductionBoard, TimelineView } from './components/boards';
import { WORKFLOWS_DB, PRODUCTION_ITEMS, INSPIRATION_ITEMS, TEAM_MEMBERS } from './services/mock';
import { supabase, isSupabaseConfigured } from './services/supabase/client';


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
                            <img src={section.url} alt={section.caption} className="w-full h-full object-contain" />
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
                        className="group rounded-2xl p-4 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                        style={{
                            background: 'rgba(15, 15, 15, 0.3)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(255, 155, 76, 0.4)';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 155, 76, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        {workflow.status === 'pending_approval' && <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Pending Approval</div>}

                        <div className="flex items-start justify-between mb-3 mt-1">
                            <div className="p-2 rounded-lg bg-cyan-blue border border-white-smoke/5 group-hover:border-orange-brand/20 transition-colors">
                                <FileText className="w-5 h-5 text-orange-brand" />
                            </div>
                        </div>
                        <h3 className="text-white-smoke font-heading text-lg font-bold mb-2 group-hover:text-orange-brand transition-colors">{workflow.title}</h3>
                        <p className="text-white-smoke/60 text-xs mb-4 line-clamp-2">{workflow.description}</p>
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
    const [productionView, setProductionView] = useState('kanban'); // 'kanban' | 'timeline'
    const [productionItems, setProductionItems] = useState(PRODUCTION_ITEMS);
    const [selectedCardForTimeline, setSelectedCardForTimeline] = useState(null);

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
        <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-white-smoke font-heading text-3xl font-bold">Boards</h1>

                    {/* Kanban/Timeline Toggle - Only for Production */}
                    {activeTab === 'production' && (
                        <div className="bg-onyx p-1 rounded-lg flex border border-white-smoke/5">
                            <button
                                onClick={() => setProductionView('kanban')}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${productionView === 'kanban' ? 'bg-orange-brand/20 text-orange-brand' : 'text-white-smoke/40 hover:text-white-smoke/60'}`}
                            >
                                Kanban
                            </button>
                            <button
                                onClick={() => setProductionView('timeline')}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${productionView === 'timeline' ? 'bg-orange-brand/20 text-orange-brand' : 'text-white-smoke/40 hover:text-white-smoke/60'}`}
                            >
                                Timeline
                            </button>
                        </div>
                    )}
                </div>

                {/* Production / Inspiration Tabs - Below Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('production')}
                        className={`relative px-4 py-2 text-sm font-medium transition-all ${activeTab === 'production'
                                ? 'text-orange-brand'
                                : 'text-white-smoke/40 hover:text-white-smoke/60'
                            }`}
                    >
                        Production
                        {activeTab === 'production' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-brand rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('inspiration')}
                        className={`relative px-4 py-2 text-sm font-medium transition-all ${activeTab === 'inspiration'
                                ? 'text-violet-brand'
                                : 'text-white-smoke/40 hover:text-white-smoke/60'
                            }`}
                    >
                        Inspiration
                        {activeTab === 'inspiration' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-brand rounded-full" />
                        )}
                    </button>
                    <div className="flex-1 h-px bg-white-smoke/10" />
                </div>
            </div>
            <div className="flex-1 min-h-0">
                {activeTab === 'production' ? (
                    productionView === 'kanban' ? (
                        <ProductionBoard
                            initialItems={productionItems}
                            teamMembers={TEAM_MEMBERS}
                            onUpdate={setProductionItems}
                        />
                    ) : (
                        <TimelineView
                            items={productionItems}
                            onCardClick={(card) => {
                                setSelectedCardForTimeline(card);
                                setProductionView('kanban');
                            }}
                            onUpdateCard={(updatedCard) => {
                                setProductionItems(items =>
                                    items.map(i => i.id === updatedCard.id ? updatedCard : i)
                                );
                            }}
                        />
                    )
                ) : (
                    <InspirationView />
                )}
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

    // Logout handler
    const handleLogout = async () => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        }
        setUserRole(null);
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) return <AuthenticationLayer onLogin={(role) => { setUserRole(role); setIsAuthenticated(true); }} />;

    return (
        <div className="min-h-screen bg-cyan-blue flex font-body text-white-smoke overflow-hidden text-sm md:text-base relative">


            <aside className="w-64 flex flex-col fixed h-full z-20" style={{
                background: 'rgba(15, 15, 15, 0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)'
            }}>
                {/* Sidebar Header - Enhanced */}
                <div className="p-6 border-b border-white-smoke/5">
                    {/* Centered Logo */}
                    <div className="flex justify-center mb-5">
                        <div className="w-16 h-16 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-brand/10 to-violet-brand/10 blur-xl rounded-full"></div>
                            <img src="/logo.png" alt="Creators Hub" className="w-full h-full object-contain relative z-10" />
                        </div>
                    </div>

                    {/* Stylized Branding */}
                    <div className="text-center space-y-3">
                        <h2 className="font-heading font-bold text-lg tracking-[0.15em] uppercase">
                            Creators <span className="text-orange-brand">Hub</span>
                        </h2>

                        {/* Role Badge */}
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-brand/10 to-violet-brand/10 border border-orange-brand/20 rounded-full">
                                <User className="w-3 h-3 text-orange-brand" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white-smoke">{userRole}</span>
                            </div>
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
                    <button onClick={() => setActiveModule('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeModule === 'team' ? 'bg-white-smoke/5 text-orange-brand border border-orange-brand/20' : 'text-white-smoke/60 hover:text-white-smoke'}`}>
                        <Users className="w-5 h-5" /> <span className="font-medium">Team</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-white-smoke/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white-smoke/40 hover:text-red-400 transition-all">
                        <LogOut className="w-5 h-5" /> <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8 h-screen overflow-hidden">
                <div className="h-full overflow-y-auto pr-2">
                    {activeModule === 'workflows' && <WorkflowsModule userRole={userRole} />}
                    {activeModule === 'boards' && <BoardsModule userRole={userRole} />}
                    {activeModule === 'team' && <TeamModule userRole={userRole} />}
                </div>
            </main>
        </div>
    );
};

export default CreatorHub;
