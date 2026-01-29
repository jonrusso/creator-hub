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
import { WORKFLOWS_DB, WORKFLOW_CATEGORIES, PRODUCTION_ITEMS, INSPIRATION_ITEMS, TEAM_MEMBERS } from './services/mock';
import { supabase, isSupabaseConfigured } from './services/supabase/client';

// ==================== WORKFLOWS MODULE (V4: Categories, Search, Visual Upgrade) ====================
const WorkflowsModule = ({ userRole }) => {
    const [view, setView] = useState('list'); // list | detail
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [activeTab, setActiveTab] = useState('library'); // library | approvals
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [db, setDb] = useState(WORKFLOWS_DB);

    const isAdmin = userRole === 'admin';

    // Create new workflow and navigate to edit mode
    const handleCreateWorkflow = () => {
        const newWorkflow = {
            id: `wf-${Date.now()}`,
            title: '',
            description: '',
            category: WORKFLOW_CATEGORIES[0].id,
            coverImage: '',
            estimatedTime: 15,
            difficulty: 'beginner',
            status: 'draft', // Draft until saved
            author: isAdmin ? 'Keanu' : 'Team Member',
            lastUpdated: new Date().toISOString().split('T')[0],
            sections: [],
            isNew: true // Flag for new workflow
        };
        setSelectedWorkflow(newWorkflow);
        setView('detail');
    };

    // Difficulty badge colors
    const getDifficultyStyle = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-emerald-500/20 text-emerald-400';
            case 'intermediate': return 'bg-amber-500/20 text-amber-400';
            case 'advanced': return 'bg-red-500/20 text-red-400';
            default: return 'bg-white-smoke/10 text-white-smoke/60';
        }
    };

    // Get category info
    const getCategoryInfo = (categoryId) => {
        return WORKFLOW_CATEGORIES.find(c => c.id === categoryId) || { label: 'Uncategorized', icon: '📄', color: 'bg-white-smoke/10 text-white-smoke/60' };
    };

    // Count required steps
    const getStepCount = (workflow) => {
        return workflow.sections?.filter(s => s.type === 'step' && s.isRequired).length || 0;
    };

    // Workflow Detail (Enhanced Doc View - Supports New Workflow Creation)
    const WorkflowDetail = ({ workflow, onBack }) => {
        const [isEditing, setIsEditing] = useState(workflow.isNew || false);
        const [localSections, setLocalSections] = useState(workflow.sections || []);
        const [localMeta, setLocalMeta] = useState({
            title: workflow.title || '',
            description: workflow.description || '',
            category: workflow.category || WORKFLOW_CATEGORIES[0].id,
            estimatedTime: workflow.estimatedTime || 15,
            difficulty: workflow.difficulty || 'beginner',
            coverImage: workflow.coverImage || ''
        });
        const category = getCategoryInfo(localMeta.category);
        const totalSteps = localSections.filter(s => s.type === 'step' && s.isRequired).length;
        const isPending = workflow.status === 'pending_approval';
        const isNew = workflow.isNew || false;

        const handleSave = () => {
            if (!localMeta.title.trim()) {
                alert('Please enter a title for your workflow');
                return;
            }
            const savedWorkflow = {
                ...workflow,
                ...localMeta,
                sections: localSections,
                status: isNew ? (isAdmin ? 'published' : 'pending_approval') : workflow.status,
                isNew: false
            };
            if (isNew) {
                setDb(prev => [...prev, savedWorkflow]);
                if (!isAdmin) {
                    alert('Workflow submitted for approval! Keanu will review it.');
                }
            } else {
                setDb(prev => prev.map(w => w.id === workflow.id ? savedWorkflow : w));
            }
            setIsEditing(false);
            if (isNew) onBack();
        };

        const addSection = (type) => {
            const newSection = { id: Date.now(), title: 'New Section', type, content: '', isRequired: type === 'step' };
            setLocalSections([...localSections, newSection]);
        };

        // Approve/Reject workflow (admin only)
        const handleApprove = () => {
            setDb(prev => prev.map(w => w.id === workflow.id ? { ...w, status: 'published' } : w));
            onBack();
        };

        const handleReject = () => {
            if (confirm('Are you sure you want to reject this workflow?')) {
                setDb(prev => prev.filter(w => w.id !== workflow.id));
                onBack();
            }
        };

        const renderSection = (section, index) => {
            const isStep = section.type === 'step';

            if (isEditing) {
                return (
                    <div key={section.id} className="bg-cyan-blue/30 p-4 rounded-xl border border-white-smoke/10 mb-4">
                        <input defaultValue={section.title} className="bg-transparent text-lg font-bold text-white-smoke w-full mb-2 outline-none border-b border-white-smoke/10 pb-1" />
                        <textarea defaultValue={section.content} className="w-full bg-black/20 text-white-smoke/80 p-2 rounded h-24 outline-none" />
                    </div>
                );
            }

            return (
                <div key={section.id} className={`mb-6 last:mb-0 ${isStep ? 'pl-4 border-l-2 border-white-smoke/10' : ''}`}>
                    <div className="flex items-start gap-3">
                        {isStep && (
                            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 border-white-smoke/30 flex items-center justify-center">
                                <span className="text-xs text-white-smoke/60">{index}</span>
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-white-smoke font-heading text-lg font-bold mb-2 flex items-center gap-2">
                                {isStep && <span className="text-orange-brand text-sm">Step {index}</span>}
                                {section.title}
                                {section.isRequired && <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">Required</span>}
                            </h3>

                            <p className="text-white-smoke/80 font-body leading-relaxed whitespace-pre-wrap mb-4">
                                {section.content}
                            </p>

                            {/* Prompt block */}
                            {section.prompt && (
                                <div className="bg-cyan-blue p-4 rounded-lg border-l-4 border-orange-brand mb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <code className="text-white-smoke/90 font-mono text-sm">{section.prompt}</code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(section.prompt)}
                                            className="p-2 hover:bg-white-smoke/10 rounded flex-shrink-0"
                                        >
                                            <Copy className="w-4 h-4 text-white-smoke/60" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Media */}
                            {section.media && section.media.type === 'image' && (
                                <div className="rounded-xl overflow-hidden border border-white-smoke/5 bg-black/20 mb-4">
                                    <img src={section.media.url} alt={section.media.caption} className="w-full h-auto object-contain" />
                                    {section.media.caption && <p className="p-3 text-sm text-white-smoke/40 italic">{section.media.caption}</p>}
                                </div>
                            )}

                            {section.media && section.media.type === 'video' && (
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white-smoke/10 mb-4">
                                    <iframe
                                        src={section.media.url}
                                        className="w-full h-full"
                                        title={section.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="max-w-4xl mx-auto animate-fadeIn">
                {/* Hero Header with Cover Image (Editable when creating/editing) */}
                <div className="relative rounded-2xl overflow-hidden mb-8">
                    {(localMeta.coverImage || !isEditing) && (
                        <div className="absolute inset-0">
                            <img src={localMeta.coverImage || 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format'} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/80 to-transparent" />
                        </div>
                    )}
                    <div className={`relative p-8 ${isEditing && !localMeta.coverImage ? 'bg-gradient-to-b from-violet-brand/20 to-onyx' : 'pt-24'}`}>
                        <button onClick={() => { if (isNew && !confirm('Discard this workflow?')) return; onBack(); }} className="flex items-center gap-2 text-white-smoke/60 hover:text-white-smoke transition-colors mb-6">
                            <ArrowLeft className="w-5 h-5" /> {isNew ? 'Cancel' : 'Back to Library'}
                        </button>

                        {isEditing ? (
                            <>
                                {/* Editable Metadata */}
                                <div className="space-y-4 mb-6">
                                    <input
                                        type="text"
                                        value={localMeta.title}
                                        onChange={(e) => setLocalMeta(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Workflow Title *"
                                        className="w-full bg-transparent border-b-2 border-white-smoke/20 focus:border-orange-brand text-4xl md:text-5xl font-heading font-bold text-white-smoke outline-none pb-2 placeholder:text-white-smoke/30"
                                    />
                                    <textarea
                                        value={localMeta.description}
                                        onChange={(e) => setLocalMeta(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of this workflow..."
                                        rows={2}
                                        className="w-full bg-transparent border-b border-white-smoke/10 focus:border-orange-brand/50 text-xl text-white-smoke/80 outline-none resize-none placeholder:text-white-smoke/30"
                                    />
                                </div>

                                {/* Metadata Row */}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <select
                                        value={localMeta.category}
                                        onChange={(e) => setLocalMeta(prev => ({ ...prev, category: e.target.value }))}
                                        className="bg-cyan-blue/30 border border-white-smoke/10 rounded-lg px-3 py-2 text-white-smoke outline-none"
                                    >
                                        {WORKFLOW_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={localMeta.difficulty}
                                        onChange={(e) => setLocalMeta(prev => ({ ...prev, difficulty: e.target.value }))}
                                        className="bg-cyan-blue/30 border border-white-smoke/10 rounded-lg px-3 py-2 text-white-smoke outline-none"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white-smoke/40">⏱️</span>
                                        <input
                                            type="number"
                                            value={localMeta.estimatedTime}
                                            onChange={(e) => setLocalMeta(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                                            className="w-16 bg-cyan-blue/30 border border-white-smoke/10 rounded-lg px-2 py-2 text-white-smoke outline-none text-center"
                                            min={1}
                                        />
                                        <span className="text-white-smoke/40">min</span>
                                    </div>
                                    <input
                                        type="url"
                                        value={localMeta.coverImage}
                                        onChange={(e) => setLocalMeta(prev => ({ ...prev, coverImage: e.target.value }))}
                                        placeholder="Cover image URL (optional)"
                                        className="flex-1 min-w-[200px] bg-cyan-blue/30 border border-white-smoke/10 rounded-lg px-3 py-2 text-white-smoke outline-none placeholder:text-white-smoke/30"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Read-only View */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.color}`}>
                                        {category.icon} {category.label}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${workflow.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {workflow.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white-smoke mb-4">{localMeta.title}</h1>
                                <p className="text-xl text-white-smoke/60 font-light mb-6">{localMeta.description}</p>

                                <div className="flex items-center gap-6 text-sm text-white-smoke/50">
                                    <span>⏱️ {localMeta.estimatedTime} min</span>
                                    <span>📋 {totalSteps} steps</span>
                                    <span className={`px-2 py-0.5 rounded ${getDifficultyStyle(localMeta.difficulty)}`}>
                                        {localMeta.difficulty}
                                    </span>
                                    <span>Updated {workflow.lastUpdated} by {workflow.author}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>


                {/* Admin Approval Actions for Pending Workflows */}
                {isPending && isAdmin && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-yellow-400 font-bold">⏳ Pending Approval</p>
                            <p className="text-yellow-400/60 text-sm">Submitted by {workflow.author}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-bold"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-bold"
                            >
                                Approve & Publish
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-onyx rounded-2xl p-8 border border-white-smoke/5 shadow-2xl">
                    <div className="flex justify-between items-center gap-3 mb-8">
                        {isNew && !isAdmin && (
                            <div className="text-yellow-400 text-sm flex items-center gap-2">
                                ⚠️ This will be submitted for approval
                            </div>
                        )}
                        <div className="flex-1" />
                        {!isEditing && isAdmin && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white-smoke/10 hover:bg-white-smoke/20 text-white-smoke px-4 py-2 rounded-lg transition-all">
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                        )}
                        {isEditing && (
                            <button onClick={handleSave} className="flex items-center gap-2 bg-orange-brand hover:bg-orange-brand/90 text-white-smoke px-4 py-2 rounded-lg transition-all">
                                <Check className="w-4 h-4" /> {isNew ? (isAdmin ? 'Publish Workflow' : 'Submit for Approval') : 'Save Changes'}
                            </button>
                        )}
                    </div>

                    {localSections.length === 0 && isEditing ? (
                        <div className="text-center py-12 text-white-smoke/40">
                            <p className="text-lg mb-2">Start building your workflow</p>
                            <p className="text-sm mb-6">Add steps, text blocks, images, or videos below</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {localSections.map((section, idx) => renderSection(section, idx))}
                        </div>
                    )}

                    {isEditing && (
                        <div className="mt-12 p-8 border-2 border-dashed border-white-smoke/10 rounded-xl text-center">
                            <p className="text-white-smoke/40 text-sm mb-4">Add Content Block</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => addSection('step')} className="flex flex-col items-center gap-2 p-4 bg-orange-brand/20 rounded-lg hover:bg-orange-brand/30 text-orange-brand">
                                    <CheckSquare className="w-6 h-6" />
                                    <span className="text-xs">Step</span>
                                </button>
                                <button onClick={() => addSection('text')} className="flex flex-col items-center gap-2 p-4 bg-white-smoke/5 rounded-lg hover:bg-white-smoke/10">
                                    <FileText className="w-6 h-6" />
                                    <span className="text-xs">Text</span>
                                </button>
                                <button onClick={() => addSection('image')} className="flex flex-col items-center gap-2 p-4 bg-white-smoke/5 rounded-lg hover:bg-white-smoke/10">
                                    <ImageIcon className="w-6 h-6" />
                                    <span className="text-xs">Image</span>
                                </button>
                                <button onClick={() => addSection('video')} className="flex flex-col items-center gap-2 p-4 bg-white-smoke/5 rounded-lg hover:bg-white-smoke/10">
                                    <Video className="w-6 h-6" />
                                    <span className="text-xs">Video</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Filter workflows - pending ONLY visible in Approvals tab (admin only)
    const filteredWorkflows = db.filter(w => {
        // Tab filter
        if (activeTab === 'approvals') return w.status === 'pending_approval';
        // Library tab: NEVER show pending (even for admins - they see it in Approvals)
        if (activeTab === 'library' && w.status === 'pending_approval') return false;

        // Category filter
        if (activeCategory !== 'all' && w.category !== activeCategory) return false;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
                w.title.toLowerCase().includes(query) ||
                w.description.toLowerCase().includes(query) ||
                w.author.toLowerCase().includes(query)
            );
        }

        return true;
    });

    if (view === 'detail' && selectedWorkflow) return <WorkflowDetail workflow={selectedWorkflow} onBack={() => setView('list')} />;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
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

            {/* Search & Category Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-smoke/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workflows..."
                        className="w-full bg-onyx border border-white-smoke/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white-smoke placeholder-white-smoke/30 outline-none focus:border-orange-brand/50"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === 'all'
                            ? 'bg-orange-brand/20 text-orange-brand border border-orange-brand/30'
                            : 'bg-onyx border border-white-smoke/10 text-white-smoke/60 hover:text-white-smoke'
                            }`}
                    >
                        All
                    </button>
                    {WORKFLOW_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat.id
                                ? `${cat.color} border border-current`
                                : 'bg-onyx border border-white-smoke/10 text-white-smoke/60 hover:text-white-smoke'
                                }`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <div className="text-xs text-white-smoke/40">
                {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} found
            </div>

            {/* Workflow Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorkflows.map((workflow) => {
                    const category = getCategoryInfo(workflow.category);
                    const stepCount = getStepCount(workflow);

                    return (
                        <div
                            key={workflow.id}
                            onClick={() => { setSelectedWorkflow(workflow); setView('detail'); }}
                            className="group rounded-2xl overflow-hidden transition-all cursor-pointer relative bg-onyx border border-white-smoke/5 hover:border-orange-brand/30 hover:shadow-lg hover:shadow-orange-brand/10"
                        >
                            {/* Cover Image */}
                            {workflow.coverImage && (
                                <div className="h-32 overflow-hidden relative">
                                    <img
                                        src={workflow.coverImage}
                                        alt=""
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-onyx to-transparent" />
                                </div>
                            )}

                            {/* Status Badge */}
                            {workflow.status === 'pending_approval' && (
                                <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    Pending
                                </div>
                            )}

                            <div className="p-4">
                                {/* Category & Difficulty */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${category.color}`}>
                                        {category.icon} {category.label}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyStyle(workflow.difficulty)}`}>
                                        {workflow.difficulty}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-white-smoke font-heading text-lg font-bold mb-2 group-hover:text-orange-brand transition-colors line-clamp-1">
                                    {workflow.title}
                                </h3>
                                <p className="text-white-smoke/60 text-xs mb-4 line-clamp-2">{workflow.description}</p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-[10px] text-white-smoke/40 pt-3 border-t border-white-smoke/5">
                                    <div className="flex items-center gap-3">
                                        <span>⏱️ {workflow.estimatedTime}m</span>
                                        <span>📋 {stepCount} steps</span>
                                    </div>
                                    <span>by {workflow.author}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Create New Card */}
                <div
                    onClick={handleCreateWorkflow}
                    className="group bg-onyx/40 rounded-2xl p-6 border-2 border-dashed border-white-smoke/5 hover:border-orange-brand/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px] text-white-smoke/40 hover:text-orange-brand"
                >
                    <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="font-heading font-bold text-lg">Create New Workflow</span>
                    {!isAdmin && <span className="text-xs mt-2">Requires admin approval</span>}
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

            {/* Content Area */}
            <div className="flex-1 min-h-0 flex flex-col">
                {/* Kanban/Timeline Toggle - Inside Production content */}
                {activeTab === 'production' && (
                    <div className="flex items-center justify-end mb-3 flex-shrink-0">
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
                    </div>
                )}

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
