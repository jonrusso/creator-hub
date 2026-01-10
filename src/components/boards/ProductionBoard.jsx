import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus, X, CheckSquare, Square, GripVertical,
    Trash2, Calendar, User as UserIcon, Users, Edit2, Save, Clock, MessageCircle,
    Film, Star, Smartphone, AlertCircle, Tag, Search, Archive, Filter,
    FolderOpen, FileText, ChevronRight, ExternalLink, Sparkles, PartyPopper,
    Hexagon, ArrowUpDown, Link2, ImagePlus
} from 'lucide-react';
import { DatePicker } from '../common';

// Video Format Definitions
const VIDEO_FORMATS = [
    { id: 'long-form', label: 'Long-Form', icon: Film, color: 'bg-blue-500/20 text-blue-400', description: 'YouTube tutorials, BTS, documentaries' },
    { id: 'hero-video', label: 'Hero Video', icon: Star, color: 'bg-amber-500/20 text-amber-400', description: 'Brand advertising & partnerships' },
    { id: 'bts-short', label: 'BTS Short', icon: Smartphone, color: 'bg-pink-500/20 text-pink-400', description: 'Vertical shorts for IG profiles' },
];

// Urgency Levels
const URGENCY_LEVELS = [
    { id: 'critical', label: 'Critical', color: 'bg-red-500', textColor: 'text-red-400', bgColor: 'bg-red-500/20' },
    { id: 'high', label: 'High', color: 'bg-orange-500', textColor: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    { id: 'low', label: 'Low', color: 'bg-green-500', textColor: 'text-green-400', bgColor: 'bg-green-500/20' },
];

// Default Production Checklist Templates
const CHECKLIST_TEMPLATES = {
    // Full production workflow for hero videos and long-form
    full: [
        { id: 'tpl-1', label: 'Script ready-to-go', checked: false },
        { id: 'tpl-2', label: 'Concept (references/PDF)', checked: false },
        { id: 'tpl-3', label: 'Videoshoot (record dailies)', checked: false },
        { id: 'tpl-4', label: 'Log files', checked: false },
        { id: 'tpl-5', label: 'Rough cut', checked: false },
        { id: 'tpl-6', label: 'Screen recording (BTS/inserts)', checked: false },
        { id: 'tpl-7', label: 'B-rolls', checked: false },
        { id: 'tpl-8', label: 'Planning video (timestamps)', checked: false },
        { id: 'tpl-9', label: 'Add soundtrack', checked: false },
        { id: 'tpl-10', label: 'Color correction & grading', checked: false },
        { id: 'tpl-11', label: 'Add SFX', checked: false },
        { id: 'tpl-12', label: 'Final export', checked: false },
    ],
    // Simplified for BTS shorts
    bts: [
        { id: 'tpl-1', label: 'Select BTS footage', checked: false },
        { id: 'tpl-2', label: 'Rough cut', checked: false },
        { id: 'tpl-3', label: 'Add music', checked: false },
        { id: 'tpl-4', label: 'Color grade', checked: false },
        { id: 'tpl-5', label: 'Final export', checked: false },
    ],
    // Optional extras (can be added to any template)
    extras: [
        { id: 'extra-1', label: 'CGI', checked: false },
        { id: 'extra-2', label: '3D elements', checked: false },
        { id: 'extra-3', label: 'AI video generation', checked: false },
        { id: 'extra-4', label: 'AI image generation', checked: false },
    ],
    // Empty for custom
    empty: [],
};

// Get template based on format
const getDefaultChecklist = (format) => {
    switch (format) {
        case 'hero-video':
        case 'long-form':
            return CHECKLIST_TEMPLATES.full.map(item => ({ ...item, id: `${item.id}-${Date.now()}` }));
        case 'bts-short':
            return CHECKLIST_TEMPLATES.bts.map(item => ({ ...item, id: `${item.id}-${Date.now()}` }));
        default:
            return [];
    }
};

// Client Logos - stored in localStorage until Supabase is ready
const CLIENT_LOGOS_KEY = 'creator_hub_client_logos';

// Built-in logos (shipped with app)
const BUILT_IN_LOGOS = {
    'higgsfield': '/logos/higgsfield.jpg',
};

// Get all client logos (built-in + user-uploaded)
const getClientLogos = () => {
    try {
        const stored = localStorage.getItem(CLIENT_LOGOS_KEY);
        const userLogos = stored ? JSON.parse(stored) : {};
        return { ...BUILT_IN_LOGOS, ...userLogos };
    } catch {
        return BUILT_IN_LOGOS;
    }
};

// Save a client logo (base64)
const saveClientLogo = (clientName, base64Data) => {
    try {
        const stored = localStorage.getItem(CLIENT_LOGOS_KEY);
        const userLogos = stored ? JSON.parse(stored) : {};
        userLogos[clientName.toLowerCase()] = base64Data;
        localStorage.setItem(CLIENT_LOGOS_KEY, JSON.stringify(userLogos));
        return true;
    } catch {
        return false;
    }
};

// Get logo for a specific client
const getClientLogo = (clientName) => {
    if (!clientName) return null;
    const logos = getClientLogos();
    return logos[clientName.toLowerCase()] || null;
};

// Pipeline Status Config
const STATUS_CONFIG = {
    not_started: {
        label: 'Not Started',
        color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        icon: '○',
        action: 'Start Work'
    },
    in_progress: {
        label: 'In Progress',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: '◐',
        action: 'Submit for Review'
    },
    review: {
        label: 'In Review',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        icon: '◉',
        action: 'Approve'
    },
    approved: {
        label: 'Approved',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        icon: '●',
        action: null
    }
};

// Complexity Calculation Function
const calculateComplexity = (card) => {
    const weights = {
        duration: 0.1,       // Each day adds 0.1
        deliverables: 0.5,   // Each checklist item adds 0.5
        assetCount: 0.2,     // Each asset adds 0.2
        technicalLevel: 1.5, // Multiplied by 1.5
        teamSize: 0.3,       // Each team member adds 0.3
        dependencies: 0.5    // Each dependency adds 0.5
    };

    // Calculate duration in days
    let duration = 0;
    if (card.startDate && card.dueDate) {
        const start = new Date(card.startDate);
        const end = new Date(card.dueDate);
        duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const teamSize = 1 + (card.collaborators?.length || 0); // Project lead + collaborators

    const score =
        (duration * weights.duration) +
        ((card.checklists?.length || 0) * weights.deliverables) +
        ((card.assetCount || 0) * weights.assetCount) +
        ((card.technicalLevel || 1) * weights.technicalLevel) +
        (teamSize * weights.teamSize) +
        ((card.dependencies?.length || 0) * weights.dependencies);

    return Math.min(10, Math.max(1, Math.round(score)));
};

// Get complexity color based on score - consistent amber for star rating
const getComplexityColor = () => {
    return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
};

// Get complexity label as stars (★) - intuitive, neutral rating
const getComplexityLabel = (score) => {
    if (score <= 3) return '★';
    if (score <= 6) return '★★';
    return '★★★';
};

// Keyboard shortcuts config
const KEYBOARD_SHORTCUTS = {
    'n': 'New card',
    'e': 'Edit card',
    'a': 'Approve',
    '/': 'Focus search',
    'Escape': 'Close modal'
};

// LexoRank-style fractional ordering helper
const generateRank = (before, after) => {
    const MIN = 'a';
    const MAX = 'z';

    if (!before && !after) return 'm';
    if (!before) return String.fromCharCode(after.charCodeAt(0) - 1) || 'a';
    if (!after) return before + 'm';

    let rank = '';
    for (let i = 0; i < Math.max(before.length, after.length) + 1; i++) {
        const prevChar = before[i] || MIN;
        const nextChar = after[i] || MAX;

        if (prevChar === nextChar) {
            rank += prevChar;
            continue;
        }

        const midChar = String.fromCharCode(
            Math.floor((prevChar.charCodeAt(0) + nextChar.charCodeAt(0)) / 2)
        );

        if (midChar !== prevChar && midChar !== nextChar) {
            rank += midChar;
            return rank;
        }

        rank += prevChar;
    }

    return rank + 'm';
};

// Format date for display
const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Check if date is overdue or soon
const getDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return 'normal';
};

// Sortable Card Component - Professional Pipeline Design
const SortableCard = ({ card, onClick, onStatusChange, isAdmin = true }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const dateStatus = getDateStatus(card.dueDate);
    const isDone = card.stage === 'done';
    const stageStatus = card.stageStatus || 'not_started';
    const statusInfo = STATUS_CONFIG[stageStatus] || STATUS_CONFIG.not_started;
    const stageVersion = card.stageVersion || 1;

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!card.dueDate) return null;
        const today = new Date();
        const due = new Date(card.dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff;
    };
    const daysLeft = getDaysRemaining();

    // Handle quick status actions
    const handleAction = (e) => {
        e.stopPropagation();
        if (!onStatusChange) return;

        if (stageStatus === 'not_started') {
            onStatusChange(card.id, 'in_progress');
        } else if (stageStatus === 'in_progress') {
            onStatusChange(card.id, 'review');
        } else if (stageStatus === 'review') {
            onStatusChange(card.id, 'approved');
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-xl border overflow-hidden shadow-sm group transition-all ${isDone
                ? 'bg-emerald-900/20 border-emerald-500/30'
                : 'bg-onyx border-white-smoke/10 hover:border-white-smoke/20'
                } ${isDragging ? 'ring-2 ring-orange-brand' : ''}`}
        >
            {/* Status Header Bar */}
            <div className={`flex items-center justify-between px-3 py-1.5 text-[10px] font-bold ${statusInfo.color} border-b border-current/20`}>
                <div className="flex items-center gap-2">
                    <span>{statusInfo.icon}</span>
                    <span className="uppercase tracking-wider">{statusInfo.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {stageVersion > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[9px] font-bold">
                            V{stageVersion}
                        </span>
                    )}
                    {daysLeft !== null && !isDone && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${daysLeft < 0 ? 'bg-red-500/30 text-red-300' :
                            daysLeft <= 2 ? 'bg-amber-500/30 text-amber-300' :
                                'bg-black/20'
                            }`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                    )}
                </div>
            </div>

            {/* Thumbnail Preview */}
            {card.thumbnail ? (
                <div
                    className="h-20 w-full bg-cover bg-center cursor-pointer"
                    style={{ backgroundImage: `url(${card.thumbnail})` }}
                    onClick={onClick}
                />
            ) : (
                <div
                    className="h-16 w-full cursor-pointer flex items-center justify-center"
                    onClick={onClick}
                    style={{
                        background: card.format === 'hero-video'
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)'
                            : card.format === 'bts-short'
                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)'
                                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)'
                    }}
                >
                    {(() => {
                        const format = VIDEO_FORMATS.find(f => f.id === card.format) || VIDEO_FORMATS[0];
                        const FormatIcon = format.icon;
                        return <FormatIcon className="w-6 h-6 text-white-smoke/20" />;
                    })()}
                </div>
            )}

            {/* Card Content */}
            <div className="p-3">
                <div className="flex items-start gap-2">
                    {/* Drag Handle - Admin Only */}
                    {isAdmin && !isDone && (
                        <button
                            {...attributes}
                            {...listeners}
                            className="mt-0.5 p-0.5 text-white-smoke/15 hover:text-white-smoke/40 cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="w-3.5 h-3.5" />
                        </button>
                    )}

                    <div className="flex-1 min-w-0" onClick={onClick}>
                        {/* Parent Project Badge (for multi-deliverable) */}
                        {card.parentProject && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium flex items-center gap-1">
                                    <FolderOpen className="w-2.5 h-2.5" />
                                    {card.parentProject}
                                </span>
                            </div>
                        )}

                        {/* Client & Format Row */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            {card.client && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                                    {card.client}
                                </span>
                            )}
                            {(() => {
                                const format = VIDEO_FORMATS.find(f => f.id === card.format) || VIDEO_FORMATS[0];
                                const FormatIcon = format.icon;
                                return (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 font-medium ${format.color}`}>
                                        <FormatIcon className="w-2.5 h-2.5" />
                                        {format.label}
                                    </span>
                                );
                            })()}
                        </div>

                        {/* Title */}
                        <h4 className="text-white-smoke font-medium text-sm mb-2 leading-tight cursor-pointer hover:text-orange-brand transition-colors truncate">
                            {card.title}
                        </h4>

                        {/* Progress & Assignee Row */}
                        <div className="flex items-center justify-between gap-2">
                            {/* Checklist Progress */}
                            {card.checklists && card.checklists.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-1">
                                    <div className="flex-1 h-1 bg-white-smoke/10 rounded-full overflow-hidden max-w-[80px]">
                                        <div
                                            className="h-full bg-orange-brand rounded-full transition-all"
                                            style={{
                                                width: `${(card.checklists.filter(c => c.checked).length / card.checklists.length) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-white-smoke/40">
                                        {Math.round((card.checklists.filter(c => c.checked).length / card.checklists.length) * 100)}%
                                    </span>
                                </div>
                            )}

                            {/* Assignee */}
                            {card.assignee && (
                                <div className="text-[9px] text-white-smoke/50 flex items-center gap-1">
                                    <UserIcon className="w-3 h-3" />
                                    @{card.assignee}
                                </div>
                            )}
                        </div>

                        {/* Complexity & Team Row */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white-smoke/5">
                            {/* Complexity Badge */}
                            {(() => {
                                const complexity = calculateComplexity(card);
                                return (
                                    <div
                                        className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 font-bold ${getComplexityColor(complexity)}`}
                                        title={`Scope: ${getComplexityLabel(complexity)} (★ quick, ★★ standard, ★★★ extended)`}
                                    >
                                        {getComplexityLabel(complexity)}
                                    </div>
                                );
                            })()}

                            {/* Team Size */}
                            {card.collaborators && card.collaborators.length > 0 && (
                                <div className="text-[9px] text-white-smoke/40 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    +{card.collaborators.length}
                                </div>
                            )}

                            {/* Dependencies */}
                            {card.dependencies && card.dependencies.length > 0 && (
                                <div className="text-[9px] text-amber-400/70 flex items-center gap-1">
                                    <Link2 className="w-3 h-3" />
                                    {card.dependencies.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Action Button */}
                {statusInfo.action && !isDone && onStatusChange && (
                    <button
                        onClick={handleAction}
                        className={`w-full mt-2 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${stageStatus === 'review'
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                            : 'bg-white-smoke/5 text-white-smoke/50 hover:bg-white-smoke/10 hover:text-white-smoke/70 border border-white-smoke/10'
                            }`}
                    >
                        <ChevronRight className="w-3 h-3" />
                        {statusInfo.action}
                    </button>
                )}
            </div>
        </div>
    );
};

// Add Card Form Component
const AddCardForm = ({ onSubmit, onCancel, existingProjects = [] }) => {
    const [title, setTitle] = useState('');
    const [parentProject, setParentProject] = useState('');
    const [isNewProject, setIsNewProject] = useState(false);
    const [format, setFormat] = useState('hero-video');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            let finalParentProject = null;
            let finalProjectId = null;

            // Determine parent project and ID
            if (isNewProject && parentProject.trim()) {
                // Creating a new parent project
                finalParentProject = parentProject.trim();
                finalProjectId = `project-${parentProject.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
            } else if (!isNewProject && parentProject) {
                // Linking to existing project
                const existing = existingProjects.find(p => p.parentProject === parentProject);
                if (existing) {
                    finalParentProject = existing.parentProject;
                    finalProjectId = existing.projectId;
                }
            }
            // else: standalone card, both remain null

            const cardData = {
                title: title.trim(),
                format,
                parentProject: finalParentProject,
                projectId: finalProjectId
            };

            onSubmit(cardData);
            setTitle('');
            setParentProject('');
            setIsNewProject(false);
            setFormat('hero-video');
        }
    };

    // Get unique parent projects from existing items
    const uniqueProjects = [...new Set(existingProjects.filter(p => p.parentProject).map(p => p.parentProject))];

    return (
        <form onSubmit={handleSubmit} className="bg-onyx p-3 rounded-xl border border-orange-brand/30">
            {/* Title */}
            <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter deliverable title..."
                className="w-full bg-transparent text-white-smoke text-sm outline-none placeholder-white-smoke/30 mb-2"
                onKeyDown={(e) => e.key === 'Escape' && onCancel()}
            />

            {/* Format Selection */}
            <div className="flex gap-1 mb-2 flex-wrap">
                {VIDEO_FORMATS.slice(0, 4).map(fmt => {
                    const Icon = fmt.icon;
                    return (
                        <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setFormat(fmt.id)}
                            className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-all ${format === fmt.id
                                ? fmt.color + ' ring-1 ring-current'
                                : 'bg-white-smoke/5 text-white-smoke/40 hover:bg-white-smoke/10'
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {fmt.label}
                        </button>
                    );
                })}
            </div>

            {/* Parent Project - Dropdown for scalability */}
            <div className="mb-2">
                <div className="flex items-center gap-2 text-[10px] text-white-smoke/40 mb-1">
                    <FolderOpen className="w-3 h-3" />
                    <span>Parent Project:</span>
                </div>
                <select
                    value={isNewProject ? '__new__' : (parentProject || '__standalone__')}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__new__') {
                            setIsNewProject(true);
                            setParentProject('');
                        } else if (val === '__standalone__') {
                            setIsNewProject(false);
                            setParentProject('');
                        } else {
                            setIsNewProject(false);
                            setParentProject(val);
                        }
                    }}
                    className="w-full bg-onyx text-white-smoke text-xs p-2 rounded-lg outline-none border border-white-smoke/10 focus:border-violet-500/50 cursor-pointer"
                >
                    <option value="__standalone__" className="bg-onyx">Standalone (no parent)</option>
                    {uniqueProjects.length > 0 && (
                        <optgroup label="Existing Projects" className="bg-onyx">
                            {uniqueProjects.map(proj => (
                                <option key={proj} value={proj} className="bg-onyx">
                                    {proj}
                                </option>
                            ))}
                        </optgroup>
                    )}
                    <option value="__new__" className="bg-onyx text-violet-400">+ Create New Project...</option>
                </select>
                {isNewProject && (
                    <input
                        type="text"
                        value={parentProject}
                        onChange={(e) => setParentProject(e.target.value)}
                        placeholder="Enter new project name..."
                        className="w-full mt-1.5 bg-violet-500/10 text-violet-300 text-xs p-2 rounded-lg outline-none border border-violet-500/30 placeholder-violet-400/40"
                        autoFocus
                    />
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-3 py-1.5 bg-orange-brand text-white-smoke text-xs font-medium rounded-lg hover:bg-orange-brand/80"
                >
                    Add Card
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-white-smoke/50 text-xs hover:text-white-smoke"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

// Column color scheme
const COLUMN_COLORS = {
    scripting: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    production: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
    qa: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    done: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

// Stage progression order
const STAGE_ORDER = ['scripting', 'production', 'qa', 'done'];

const getNextStage = (currentStage) => {
    const idx = STAGE_ORDER.indexOf(currentStage);
    return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
};

// Celebration Overlay Component
const CelebrationOverlay = ({ show, onComplete }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onComplete, 2500);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce text-center">
                <div className="flex items-center justify-center gap-2 text-6xl mb-4">
                    🎉 <PartyPopper className="w-16 h-16 text-amber-400 animate-pulse" /> 🎊
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-2xl font-bold px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
                    Project Complete! 🚀
                </div>
                <div className="mt-4 text-white-smoke/60 text-sm">
                    Great work on finishing this project!
                </div>
            </div>
            {/* Sparkles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <Sparkles
                        key={i}
                        className="absolute text-amber-400 animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 1}s`,
                            width: `${16 + Math.random() * 16}px`,
                            height: `${16 + Math.random() * 16}px`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// Droppable Column Component
const DroppableColumn = ({ id, title, cards, onCardClick, onAddCard, onStatusChange, forceAddCard, onForceAddCardHandled, allItems = [] }) => {
    const [isAdding, setIsAdding] = useState(false);
    const cardIds = cards.map(c => c.id);
    const colors = COLUMN_COLORS[id] || COLUMN_COLORS.scripting;

    // Handle keyboard-triggered add card
    useEffect(() => {
        if (forceAddCard) {
            setIsAdding(true);
            onForceAddCardHandled?.();
        }
    }, [forceAddCard, onForceAddCardHandled]);

    const handleAddSubmit = (cardData) => {
        onAddCard(cardData);
        setIsAdding(false);
    };

    return (
        <div className="w-80 flex-shrink-0 flex flex-col h-full">
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border} flex-shrink-0`}>
                <h3 className={`font-heading font-bold uppercase tracking-wider text-sm ${colors.text}`}>
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    {id === 'scripting' && (
                        <span className="text-[9px] text-white-smoke/20 font-mono" title="Press 'n' to add new card">n</span>
                    )}
                    <span className={`text-xs font-bold ${colors.text} px-2 py-0.5 rounded-full bg-black/20`}>
                        {cards.length}
                    </span>
                </div>
            </div>

            {/* Scrollable Cards Area */}
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin space-y-3 min-h-[100px]">
                    {cards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white-smoke/10 rounded-xl text-white-smoke/30 text-xs">
                            <Plus className="w-5 h-5 mb-1 opacity-50" />
                            Drop cards here
                        </div>
                    ) : (
                        cards.map(card => (
                            <SortableCard
                                key={card.id}
                                card={card}
                                onClick={() => onCardClick(card)}
                                onStatusChange={onStatusChange}
                            />
                        ))
                    )}
                </div>
            </SortableContext>

            {/* Add Card Button */}
            <div className="flex-shrink-0 mt-2">
                {isAdding ? (
                    <AddCardForm
                        onSubmit={handleAddSubmit}
                        onCancel={() => setIsAdding(false)}
                        existingProjects={allItems}
                    />
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-2 flex items-center justify-center gap-2 text-white-smoke/20 hover:text-white-smoke/60 hover:bg-white-smoke/5 rounded-xl border border-transparent hover:border-white-smoke/5 border-dashed transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Card
                    </button>
                )}
            </div>
        </div>
    );
};

// Stage Timeline Component - Visual Pipeline Progress
const StageTimeline = ({ currentStage, stageStatus, stageHistory, currentVersion = 1 }) => {
    const stages = ['scripting', 'production', 'qa', 'done'];
    const stageLabels = { scripting: 'Script', production: 'Production', qa: 'QA', done: 'Done' };

    const getStageState = (stage) => {
        const currentIdx = stages.indexOf(currentStage);
        const stageIdx = stages.indexOf(stage);

        if (stageIdx < currentIdx) return 'completed';
        if (stageIdx === currentIdx) return stageStatus;
        return 'pending';
    };

    const getHistoryForStage = (stage) => {
        return stageHistory?.find(h => h.stage === stage);
    };

    // Calculate total versions across all completed stages + current
    const completedVersions = stageHistory?.reduce((sum, h) => sum + (h.finalVersion || 1), 0) || 0;
    const totalVersions = completedVersions + currentVersion;

    return (
        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold">Pipeline Progress</h3>
                {totalVersions > (stageHistory?.length || 0) + 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white-smoke/30">Total Versions:</span>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold">
                            {totalVersions}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex items-start justify-between gap-2">
                {stages.map((stage, idx) => {
                    const state = getStageState(stage);
                    const history = getHistoryForStage(stage);
                    const isLast = idx === stages.length - 1;
                    const isCurrentStage = stage === currentStage;

                    return (
                        <div key={stage} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                {/* Stage Circle */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${state === 'completed' ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400' :
                                    state === 'approved' ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400' :
                                        state === 'in_progress' ? 'bg-blue-500/30 border-blue-500 text-blue-400' :
                                            state === 'review' ? 'bg-amber-500/30 border-amber-500 text-amber-400' :
                                                state === 'not_started' && isCurrentStage ? 'bg-slate-500/30 border-slate-400 text-slate-400' :
                                                    'bg-white-smoke/5 border-white-smoke/20 text-white-smoke/30'
                                    }`}>
                                    {state === 'completed' ? '✓' :
                                        state === 'approved' ? '✓' :
                                            state === 'in_progress' ? '◐' :
                                                state === 'review' ? '◉' : '○'}
                                </div>

                                {/* Stage Label */}
                                <span className={`text-[10px] font-bold uppercase mt-2 ${state === 'completed' || state === 'approved' ? 'text-emerald-400' :
                                    state === 'in_progress' ? 'text-blue-400' :
                                        state === 'review' ? 'text-amber-400' :
                                            state === 'not_started' && isCurrentStage ? 'text-slate-400' :
                                                'text-white-smoke/30'
                                    }`}>
                                    {stageLabels[stage]}
                                </span>

                                {/* History Info - For completed stages */}
                                {history && (
                                    <div className="text-[9px] text-white-smoke/40 mt-1 text-center">
                                        {history.finalVersion > 1 && (
                                            <div className="text-amber-400/70 font-bold">V{history.finalVersion}</div>
                                        )}
                                        <div>{history.date}</div>
                                    </div>
                                )}

                                {/* Current Stage Info - Show current version */}
                                {isCurrentStage && state !== 'completed' && (
                                    <div className="text-[9px] mt-1 text-center">
                                        <div className={`font-bold ${currentVersion > 1 ? 'text-amber-400' : 'text-white-smoke/40'}`}>
                                            {currentVersion > 1 ? `V${currentVersion}` : 'V1'}
                                        </div>
                                        <div className="text-white-smoke/30 text-[8px]">
                                            {STATUS_CONFIG[stageStatus]?.label}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className={`flex-shrink-0 h-0.5 w-8 -mt-6 ${getStageState(stages[idx + 1]) !== 'pending'
                                    ? 'bg-emerald-500/50'
                                    : 'bg-white-smoke/10'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Team Activity Component - Split into Activity Log + Team Chat
const TeamActivity = ({ activity = [], onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const chatEndRef = useRef(null);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60));
        if (diff < 1) return 'Just now';
        if (diff < 24) return `${diff}h ago`;
        const days = Math.floor(diff / 24);
        return `${days}d ago`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment?.(newComment.trim());
        setNewComment('');
    };

    // Format stage names consistently
    const formatStageName = (stage) => {
        const stageMap = {
            scripting: 'Script',
            production: 'Production',
            qa: 'QA',
            done: 'Done'
        };
        return stageMap[stage?.toLowerCase()] || stage;
    };

    // Separate activity types
    const activityLogs = activity.filter(item =>
        item.type === 'status_change' || item.type === 'stage_change' || item.type === 'revision_request'
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first for logs

    const chatMessages = activity.filter(item => item.type === 'comment')
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Oldest first for chat

    // Auto-scroll chat to bottom when new message added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length]);

    return (
        <div className="flex flex-col h-full gap-3">
            {/* Activity Log - Compact (30%) */}
            <div className="h-[30%] flex flex-col bg-cyan-blue/30 rounded-xl border border-white-smoke/5 min-h-0">
                <div className="p-2 border-b border-white-smoke/5 flex-shrink-0">
                    <h3 className="text-[10px] uppercase tracking-wider text-white-smoke/40 font-bold flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Activity Log
                        {activityLogs.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-white-smoke/10 rounded text-[9px]">{activityLogs.length}</span>
                        )}
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-thin">
                    {activityLogs.length === 0 ? (
                        <div className="text-center text-white-smoke/20 text-[10px] py-4">
                            No activity yet
                        </div>
                    ) : (
                        activityLogs.map(item => (
                            <div key={item.id} className="text-[9px] text-white-smoke/40 py-1 border-b border-white-smoke/5 last:border-0">
                                {item.type === 'status_change' ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-white-smoke/50">{item.author}</span>
                                        <span className="px-1 py-0.5 rounded bg-white-smoke/10">{item.from}</span>
                                        <span>→</span>
                                        <span className="px-1 py-0.5 rounded bg-white-smoke/10">{item.to}</span>
                                        {item.version > 1 && (
                                            <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">V{item.version}</span>
                                        )}
                                        <span className="text-white-smoke/20 ml-auto">{formatTime(item.timestamp)}</span>
                                    </div>
                                ) : item.type === 'stage_change' ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-emerald-400">{item.author}</span>
                                        <span className="text-emerald-400/60">approved</span>
                                        <span className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{formatStageName(item.from)}</span>
                                        <span>→</span>
                                        <span className="px-1 py-0.5 rounded bg-blue-500/20 text-blue-400">{formatStageName(item.to)}</span>
                                        <span className="text-white-smoke/20 ml-auto">{formatTime(item.timestamp)}</span>
                                    </div>
                                ) : item.type === 'revision_request' ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-amber-400">{item.author}</span>
                                        <span className="text-amber-400/60">revision</span>
                                        <span className="px-1 py-0.5 rounded bg-white-smoke/10">{formatStageName(item.stage)}</span>
                                        <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">V{item.fromVersion} → V{item.toVersion}</span>
                                        <span className="text-white-smoke/20 ml-auto">{formatTime(item.timestamp)}</span>
                                    </div>
                                ) : null}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Team Chat - Larger (70%) */}
            <div className="flex-1 flex flex-col bg-cyan-blue/30 rounded-xl border border-white-smoke/5 min-h-0">
                <div className="p-2 border-b border-white-smoke/5 flex-shrink-0">
                    <h3 className="text-[10px] uppercase tracking-wider text-white-smoke/40 font-bold flex items-center gap-2">
                        <MessageCircle className="w-3 h-3" />
                        Team Chat
                        {chatMessages.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-white-smoke/10 rounded text-[9px]">{chatMessages.length}</span>
                        )}
                    </h3>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin">
                    {chatMessages.length === 0 ? (
                        <div className="text-center text-white-smoke/30 text-xs py-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        chatMessages.map((item, index) => (
                            <div
                                key={item.id}
                                className={`bg-onyx rounded-lg p-3 ${index === chatMessages.length - 1 ? 'animate-fadeInUp' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white-smoke font-medium text-xs">{item.author}</span>
                                    <span className="text-white-smoke/30 text-[10px]">{formatTime(item.timestamp)}</span>
                                </div>
                                <p className="text-white-smoke/70 text-xs leading-relaxed">{item.content}</p>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-white-smoke/5 flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-onyx p-2.5 rounded-lg text-white-smoke text-xs outline-none border border-white-smoke/10 focus:border-orange-brand/50"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-4 py-2.5 bg-orange-brand/20 text-orange-brand rounded-lg text-xs font-medium hover:bg-orange-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Enhanced Card Detail Modal - Professional Full-Screen
const CardModal = ({ card, onClose, onUpdate, onDelete, teamMembers, externalEditTitle, onStatusChange, allItems = [] }) => {
    const [localCard, setLocalCard] = useState(card);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const titleInputRef = useRef(null);

    useEffect(() => {
        setLocalCard(card);
    }, [card]);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    // Handle external edit trigger (keyboard shortcut 'e')
    useEffect(() => {
        if (externalEditTitle) {
            setIsEditingTitle(true);
        }
    }, [externalEditTitle]);

    if (!card) return null;

    const updateCard = (updates) => {
        const updated = { ...localCard, ...updates };
        setLocalCard(updated);
        onUpdate?.(updated);
    };

    const toggleChecklist = (itemId) => {
        const updated = {
            ...localCard,
            checklists: localCard.checklists?.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        };
        setLocalCard(updated);
        onUpdate?.(updated);
    };

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        const newItem = {
            id: `check-${Date.now()}`,
            label: newChecklistItem.trim(),
            checked: false
        };
        const updated = {
            ...localCard,
            checklists: [...(localCard.checklists || []), newItem]
        };
        setLocalCard(updated);
        onUpdate?.(updated);
        setNewChecklistItem('');
    };

    const deleteChecklistItem = (itemId) => {
        const updated = {
            ...localCard,
            checklists: localCard.checklists?.filter(item => item.id !== itemId)
        };
        setLocalCard(updated);
        onUpdate?.(updated);
    };

    const handleAssign = (member) => {
        updateCard({ assignee: localCard.assignee === member ? null : member });
    };

    // Collaborators multi-select handler
    const handleCollaboratorToggle = (member) => {
        const currentCollabs = localCard.collaborators || [];
        const isSelected = currentCollabs.includes(member);
        const newCollabs = isSelected
            ? currentCollabs.filter(c => c !== member)
            : [...currentCollabs, member];
        updateCard({ collaborators: newCollabs });
    };

    const clearAllCollaborators = () => {
        updateCard({ collaborators: [] });
    };

    // Add comment handler
    const handleAddComment = (content) => {
        const newActivity = {
            id: `act-${Date.now()}`,
            type: 'comment',
            author: 'You', // TODO: Get from auth context
            timestamp: new Date().toISOString(),
            content
        };
        updateCard({
            activity: [...(localCard.activity || []), newActivity]
        });
    };

    // Status info
    const stageStatus = localCard.stageStatus || 'not_started';
    const statusInfo = STATUS_CONFIG[stageStatus] || STATUS_CONFIG.not_started;
    const format = VIDEO_FORMATS.find(f => f.id === localCard.format) || VIDEO_FORMATS[0];

    // Days remaining
    const getDaysRemaining = () => {
        if (!localCard.dueDate) return null;
        const today = new Date();
        const due = new Date(localCard.dueDate);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    };
    const daysLeft = getDaysRemaining();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="bg-onyx w-full max-w-6xl h-[90vh] rounded-2xl border border-white-smoke/10 shadow-2xl overflow-hidden flex flex-col">

                {/* Header - Professional with Status */}
                <div className="p-4 border-b border-white-smoke/10 bg-cyan-blue/20 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button
                            onClick={onClose}
                            className="p-2 text-white-smoke/40 hover:text-white-smoke hover:bg-white-smoke/10 rounded-lg transition-all"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>

                        <div className="flex-1 min-w-0">
                            {isEditingTitle ? (
                                <input
                                    ref={titleInputRef}
                                    type="text"
                                    value={localCard.title}
                                    onChange={(e) => setLocalCard({ ...localCard, title: e.target.value })}
                                    onBlur={() => { setIsEditingTitle(false); onUpdate?.(localCard); }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { setIsEditingTitle(false); onUpdate?.(localCard); }
                                        if (e.key === 'Escape') { setIsEditingTitle(false); setLocalCard(card); }
                                    }}
                                    className="text-xl font-bold text-white-smoke font-heading bg-transparent outline-none border-b-2 border-orange-brand w-full"
                                />
                            ) : (
                                <div>
                                    {/* Parent Project Badge */}
                                    {localCard.parentProject && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium flex items-center gap-1">
                                                <FolderOpen className="w-3 h-3" />
                                                {localCard.parentProject}
                                            </span>
                                        </div>
                                    )}
                                    <h2
                                        className="text-xl font-bold text-white-smoke font-heading cursor-pointer hover:text-orange-brand truncate"
                                        onClick={() => setIsEditingTitle(true)}
                                    >
                                        {localCard.title}
                                    </h2>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {localCard.client && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                                        {localCard.client}
                                    </span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1 font-medium ${format.color}`}>
                                    {localCard.format || 'Long-Form'}
                                </span>
                                {localCard.assignee && (
                                    <span className="text-[10px] text-white-smoke/50">
                                        @{localCard.assignee}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Version Badge */}
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${(localCard.stageVersion || 1) > 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-white-smoke/10 text-white-smoke/50'}`}>
                            V{localCard.stageVersion || 1}
                        </div>

                        {/* Status Badge */}
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusInfo.color} border border-current/30`}>
                            {statusInfo.icon} {statusInfo.label}
                        </div>

                        {/* Version Control Buttons */}
                        {stageStatus === 'in_progress' && (
                            <button
                                onClick={() => onStatusChange?.(localCard.id, 'review')}
                                className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-all"
                            >
                                Submit V{localCard.stageVersion || 1} for Review
                            </button>
                        )}
                        {stageStatus === 'review' && (
                            <button
                                onClick={() => onStatusChange?.(localCard.id, 'in_progress')}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all"
                            >
                                Request Revision → V{(localCard.stageVersion || 1) + 1}
                            </button>
                        )}

                        {/* Days Remaining */}
                        {daysLeft !== null && localCard.stage !== 'done' && (
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${daysLeft < 0 ? 'bg-red-500/20 text-red-400' :
                                daysLeft <= 2 ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-white-smoke/10 text-white-smoke/60'
                                }`}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </div>
                        )}

                        <button onClick={onClose} className="p-2 text-white-smoke/40 hover:text-white-smoke hover:bg-white-smoke/10 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Two-Column Content */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Column - Project Details (60%) */}
                    <div className="w-3/5 overflow-y-auto p-6 space-y-6 border-r border-white-smoke/5">

                        {/* Thumbnail Section */}
                        <div className="bg-cyan-blue/30 rounded-xl overflow-hidden border border-white-smoke/5">
                            {localCard.thumbnail ? (
                                <div className="relative group">
                                    <img
                                        src={localCard.thumbnail}
                                        alt={localCard.title}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                const url = prompt('Enter thumbnail URL:', localCard.thumbnail);
                                                if (url !== null) updateCard({ thumbnail: url || null });
                                            }}
                                            className="px-3 py-1.5 bg-white-smoke/10 text-white-smoke rounded-lg text-xs font-medium hover:bg-white-smoke/20"
                                        >
                                            Change
                                        </button>
                                        <button
                                            onClick={() => updateCard({ thumbnail: null })}
                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white-smoke/5 transition-all"
                                    onClick={() => {
                                        const url = prompt('Enter thumbnail URL:');
                                        if (url) updateCard({ thumbnail: url });
                                    }}
                                    style={{
                                        background: localCard.format === 'hero-video'
                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)'
                                            : localCard.format === 'bts-short'
                                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)'
                                                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
                                    }}
                                >
                                    {(() => {
                                        const format = VIDEO_FORMATS.find(f => f.id === localCard.format) || VIDEO_FORMATS[0];
                                        const FormatIcon = format.icon;
                                        return <FormatIcon className="w-10 h-10 text-white-smoke/15 mb-2" />;
                                    })()}
                                    <span className="text-xs text-white-smoke/30">Click to add thumbnail</span>
                                </div>
                            )}
                        </div>

                        {/* Stage Timeline */}
                        <StageTimeline
                            currentStage={localCard.stage}
                            stageStatus={stageStatus}
                            stageHistory={localCard.stageHistory || []}
                            currentVersion={localCard.stageVersion || 1}
                        />

                        {/* Related Deliverables (for multi-deliverable projects) */}
                        {localCard.projectId && (() => {
                            const siblings = allItems.filter(item =>
                                item.projectId === localCard.projectId && item.id !== localCard.id
                            );
                            if (siblings.length === 0) return null;

                            const stageColors = {
                                scripting: 'text-amber-400',
                                production: 'text-blue-400',
                                qa: 'text-violet-400',
                                done: 'text-emerald-400'
                            };

                            return (
                                <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                                    <h3 className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-3 flex items-center gap-2">
                                        <FolderOpen className="w-3.5 h-3.5" />
                                        Related Deliverables
                                        <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded text-[10px]">
                                            {siblings.length + 1} total
                                        </span>
                                    </h3>
                                    <div className="space-y-2">
                                        {siblings.map(sibling => {
                                            const sibFormat = VIDEO_FORMATS.find(f => f.id === sibling.format) || VIDEO_FORMATS[0];
                                            const SibIcon = sibFormat.icon;
                                            return (
                                                <div
                                                    key={sibling.id}
                                                    className="flex items-center justify-between p-2 bg-onyx rounded-lg hover:bg-white-smoke/5 transition-all cursor-pointer"
                                                    onClick={() => {
                                                        // Update to show sibling card
                                                        setLocalCard(sibling);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <div className={`p-1.5 rounded ${sibFormat.color}`}>
                                                            <SibIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium text-white-smoke truncate">{sibling.title}</div>
                                                            <div className="text-[10px] text-white-smoke/40">@{sibling.assignee}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase ${stageColors[sibling.stage]}`}>
                                                            {sibling.stage}
                                                        </span>
                                                        {sibling.stageVersion > 1 && (
                                                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">
                                                                V{sibling.stageVersion}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Description */}
                        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                            <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-3 block">
                                Description
                            </label>
                            <textarea
                                className="w-full bg-onyx p-3 rounded-lg text-white-smoke/80 text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50 resize-none"
                                rows={3}
                                value={localCard.description || ''}
                                onChange={(e) => updateCard({ description: e.target.value })}
                                placeholder="Add a description..."
                            />
                        </div>

                        {/* Project Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Client & Format */}
                            <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">Client</label>
                                <div className="flex items-center gap-2">
                                    {/* Logo preview or upload button */}
                                    {(() => {
                                        const logo = getClientLogo(localCard.client);
                                        const fileInputId = `client-logo-${localCard.id}`;
                                        return (
                                            <>
                                                <input
                                                    type="file"
                                                    id={fileInputId}
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file && localCard.client) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                saveClientLogo(localCard.client, event.target.result);
                                                                // Force re-render
                                                                updateCard({ client: localCard.client });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <button
                                                    onClick={() => document.getElementById(fileInputId)?.click()}
                                                    className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${logo
                                                            ? 'p-0 overflow-hidden'
                                                            : 'bg-white-smoke/10 hover:bg-white-smoke/20 text-white-smoke/40 hover:text-white-smoke'
                                                        }`}
                                                    title={logo ? "Change logo" : "Add client logo"}
                                                >
                                                    {logo ? (
                                                        <img src={logo} alt={localCard.client} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <ImagePlus className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </>
                                        );
                                    })()}
                                    <input
                                        type="text"
                                        value={localCard.client || ''}
                                        onChange={(e) => updateCard({ client: e.target.value })}
                                        placeholder="Enter client name..."
                                        className="flex-1 bg-onyx p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50"
                                    />
                                </div>
                            </div>
                            <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">Format</label>
                                <select
                                    value={localCard.format || 'long-form'}
                                    onChange={(e) => updateCard({ format: e.target.value })}
                                    className="w-full bg-onyx p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5"
                                >
                                    {VIDEO_FORMATS.map(f => (
                                        <option key={f.id} value={f.id}>{f.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Urgency Level */}
                        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                            <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-3 block">Urgency Level</label>
                            <div className="flex gap-2">
                                {URGENCY_LEVELS.map(level => (
                                    <button
                                        key={level.id}
                                        onClick={() => updateCard({ urgency: localCard.urgency === level.id ? null : level.id })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${localCard.urgency === level.id
                                            ? `${level.bgColor} ${level.textColor} border-current`
                                            : 'border-white-smoke/10 text-white-smoke/40 hover:border-white-smoke/30'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <DatePicker
                                label="Start Date"
                                value={localCard.startDate || ''}
                                onChange={(date) => updateCard({ startDate: date })}
                                placeholder="Select start date"
                            />
                            <DatePicker
                                label="Due Date"
                                value={localCard.dueDate || ''}
                                onChange={(date) => updateCard({ dueDate: date })}
                                placeholder="Select due date"
                            />
                        </div>

                        {/* Assignee */}
                        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                            <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-3 block">Assignee (Project Lead)</label>
                            <div className="flex flex-wrap gap-2">
                                {teamMembers?.map(member => (
                                    <button
                                        key={member}
                                        onClick={() => handleAssign(member)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${localCard.assignee === member
                                            ? 'bg-orange-brand text-white-smoke border-orange-brand'
                                            : 'border-white-smoke/10 text-white-smoke/40 hover:border-white-smoke/30'
                                            }`}
                                    >
                                        {member}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Collaborators - Multi-select */}
                        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold">
                                    Collaborators
                                    {(localCard.collaborators?.length > 0) && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded text-[10px]">
                                            {localCard.collaborators.length}
                                        </span>
                                    )}
                                </label>
                                {localCard.collaborators?.length > 0 && (
                                    <button
                                        onClick={clearAllCollaborators}
                                        className="text-[10px] text-white-smoke/40 hover:text-red-400 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {teamMembers?.filter(m => m !== localCard.assignee).map(member => {
                                    const isSelected = localCard.collaborators?.includes(member);
                                    return (
                                        <button
                                            key={member}
                                            onClick={() => handleCollaboratorToggle(member)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${isSelected
                                                ? 'bg-violet-500/20 text-violet-400 border-violet-500/50'
                                                : 'border-white-smoke/10 text-white-smoke/40 hover:border-white-smoke/30'
                                                }`}
                                        >
                                            {isSelected && <span className="text-[10px]">✓</span>}
                                            {member}
                                        </button>
                                    );
                                })}
                                {teamMembers?.filter(m => m !== localCard.assignee).length === 0 && (
                                    <span className="text-xs text-white-smoke/30 italic">
                                        Select an assignee first to add collaborators
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Deliverables / Checklist */}
                        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
                            <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-3 block">Deliverables</label>
                            <div className="space-y-2">
                                {localCard.checklists?.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-onyx/50 rounded-lg group">
                                        <button onClick={() => toggleChecklist(item.id)} className={`${item.checked ? 'text-orange-brand' : 'text-white-smoke/20'}`}>
                                            {item.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        </button>
                                        <span className={`text-sm flex-1 ${item.checked ? 'text-white-smoke/40 line-through' : 'text-white-smoke/80'}`}>
                                            {item.label}
                                        </span>
                                        <button onClick={() => deleteChecklistItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={newChecklistItem}
                                        onChange={(e) => setNewChecklistItem(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                                        placeholder="Add deliverable..."
                                        className="flex-1 bg-onyx p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50"
                                    />
                                    <button onClick={addChecklistItem} className="p-2 bg-orange-brand/20 text-orange-brand rounded-lg hover:bg-orange-brand/30">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Activity & Links (40%) */}
                    <div className="w-2/5 flex flex-col overflow-hidden bg-cyan-blue/10">

                        {/* Quick Links */}
                        <div className="p-4 border-b border-white-smoke/5 flex-shrink-0">
                            <h3 className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-3">Quick Links</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {/* Drive Link */}
                                {localCard.driveLink ? (
                                    <a href={localCard.driveLink} target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center justify-center gap-2 text-xs font-medium">
                                        <FolderOpen className="w-4 h-4" /> Drive
                                    </a>
                                ) : (
                                    <button onClick={() => {
                                        const url = prompt('Enter Google Drive link:');
                                        if (url) updateCard({ driveLink: url });
                                    }} className="px-3 py-2 bg-white-smoke/5 text-white-smoke/40 rounded-lg hover:bg-white-smoke/10 flex items-center justify-center gap-2 text-xs">
                                        <FolderOpen className="w-4 h-4" /> Drive
                                    </button>
                                )}

                                {/* Script Link */}
                                {localCard.scriptLink ? (
                                    <a href={localCard.scriptLink} target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 flex items-center justify-center gap-2 text-xs font-medium">
                                        <FileText className="w-4 h-4" /> Script
                                    </a>
                                ) : (
                                    <button onClick={() => {
                                        const url = prompt('Enter Script (Google Docs) link:');
                                        if (url) updateCard({ scriptLink: url });
                                    }} className="px-3 py-2 bg-white-smoke/5 text-white-smoke/40 rounded-lg hover:bg-white-smoke/10 flex items-center justify-center gap-2 text-xs">
                                        <FileText className="w-4 h-4" /> Script
                                    </button>
                                )}

                                {/* Export/Final Delivery Link */}
                                {localCard.exportLink ? (
                                    <a href={localCard.exportLink} target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 flex items-center justify-center gap-2 text-xs font-medium">
                                        <ExternalLink className="w-4 h-4" /> Export
                                    </a>
                                ) : (
                                    <button onClick={() => {
                                        const url = prompt('Enter Export/Final Delivery link (for client):');
                                        if (url) updateCard({ exportLink: url });
                                    }} className="px-3 py-2 bg-white-smoke/5 text-white-smoke/40 rounded-lg hover:bg-white-smoke/10 flex items-center justify-center gap-2 text-xs">
                                        <ExternalLink className="w-4 h-4" /> Export
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Team Activity */}
                        <div className="flex-1 min-h-0">
                            <TeamActivity
                                activity={localCard.activity || []}
                                onAddComment={handleAddComment}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white-smoke/10 bg-cyan-blue/20 flex justify-between flex-shrink-0">
                    <button
                        onClick={() => setShowArchiveConfirm(true)}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Archive
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Move to Next Stage Button */}
                        {getNextStage(localCard.stage) && (
                            <button
                                onClick={() => {
                                    const nextStage = getNextStage(localCard.stage);
                                    updateCard({ stage: nextStage });
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${getNextStage(localCard.stage) === 'done'
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                                    : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30'
                                    }`}
                            >
                                <ChevronRight className="w-4 h-4" />
                                Move to {getNextStage(localCard.stage)?.toUpperCase()}
                                {getNextStage(localCard.stage) === 'done' && ' ✓'}
                            </button>
                        )}

                        {localCard.stage === 'done' && (
                            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" /> Completed!
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white-smoke/10 text-white-smoke rounded-lg text-sm font-medium hover:bg-white-smoke/20"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Archive Confirmation Modal */}
            {showArchiveConfirm && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-2xl">
                    <div className="bg-onyx border border-white-smoke/10 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-500/20 rounded-full">
                                <Trash2 className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-white-smoke font-bold text-lg">Archive this card?</h3>
                                <p className="text-white-smoke/50 text-sm">"{localCard.title}"</p>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                            <p className="text-amber-400 text-sm">
                                ⚠️ Archived cards will be <strong>automatically deleted after 5 days</strong>.
                                You can view archived cards from the board filter.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowArchiveConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-white-smoke/10 text-white-smoke rounded-lg text-sm font-medium hover:bg-white-smoke/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Archive with timestamp
                                    onUpdate?.({ ...localCard, archived: true, archivedAt: new Date().toISOString() });
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 border border-amber-500/30"
                            >
                                Archive
                            </button>
                            <button
                                onClick={() => {
                                    onDelete?.(localCard.id);
                                    onClose();
                                }}
                                className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 border border-red-500/30"
                            >
                                Delete Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ProductionBoard - Full-featured Kanban board for production tracking
 */
const ProductionBoard = ({ initialItems, teamMembers = [], onUpdate }) => {
    const [items, setItems] = useState(initialItems || []);
    const [columns] = useState(['scripting', 'production', 'qa', 'done']);
    const [selectedCard, setSelectedCard] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);

    // Filter and Sort State
    const [filterMyWork, setFilterMyWork] = useState(false);
    const [sortBy, setSortBy] = useState('default'); // default, priority, dueDate, complexity
    const currentUser = 'Alex'; // TODO: Get from auth context

    // Keyboard shortcuts state
    const [addCardColumn, setAddCardColumn] = useState(null); // Column to add card via keyboard
    const searchInputRef = useRef(null);
    const [isEditingModalTitle, setIsEditingModalTitle] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts when typing in inputs
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

            if (e.key === 'Escape') {
                // Always allow Escape to close modal
                if (selectedCard) {
                    setSelectedCard(null);
                    e.preventDefault();
                }
                return;
            }

            // Skip other shortcuts if typing
            if (isTyping) return;

            switch (e.key.toLowerCase()) {
                case 'n':
                    // New card in first column (scripting)
                    setAddCardColumn('scripting');
                    e.preventDefault();
                    break;
                case '/':
                    // Focus search
                    searchInputRef.current?.focus();
                    e.preventDefault();
                    break;
                case 'e':
                    // Edit selected card title
                    if (selectedCard) {
                        setIsEditingModalTitle(true);
                        e.preventDefault();
                    }
                    break;
                case 'a':
                    // Approve selected card (if in review status)
                    if (selectedCard && selectedCard.stageStatus === 'review') {
                        handleStatusChange(selectedCard.id, 'approved');
                        e.preventDefault();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCard]);

    const findColumn = (id) => {
        const card = items.find(item => item.id === id);
        return card?.stage;
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeColumn = findColumn(activeId);
        const overColumn = findColumn(overId) || overId;

        if (activeColumn !== overColumn && columns.includes(overColumn)) {
            setItems(items => items.map(item =>
                item.id === activeId ? { ...item, stage: overColumn } : item
            ));
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeIndex = items.findIndex(i => i.id === activeId);
        const overIndex = items.findIndex(i => i.id === overId);

        if (activeIndex !== overIndex && overIndex !== -1) {
            setItems(items => {
                const newItems = arrayMove(items, activeIndex, overIndex);

                const movedItem = newItems.find(i => i.id === activeId);
                const sameColumnItems = newItems.filter(i => i.stage === movedItem.stage);
                const movedIndex = sameColumnItems.findIndex(i => i.id === activeId);

                const beforeRank = sameColumnItems[movedIndex - 1]?.rank;
                const afterRank = sameColumnItems[movedIndex + 1]?.rank;
                movedItem.rank = generateRank(beforeRank, afterRank);

                onUpdate?.(newItems);

                return newItems;
            });
        }
    };

    const activeCard = activeId ? items.find(i => i.id === activeId) : null;

    // Filter cards based on search query, My Work filter, and sorting
    const getColumnCards = (columnId) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3, null: 4 };

        return items
            .filter(item => !item.archived) // Exclude archived cards from board
            .filter(item => item.stage === columnId)
            .filter(item => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.toLowerCase();
                return (
                    item.title?.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query) ||
                    item.client?.toLowerCase().includes(query) ||
                    item.assignee?.toLowerCase().includes(query)
                );
            })
            .filter(item => {
                if (!filterMyWork) return true;
                // Show cards where user is lead or collaborator
                return item.assignee === currentUser ||
                    item.collaborators?.includes(currentUser);
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'priority':
                        return (urgencyOrder[a.urgency] || 4) - (urgencyOrder[b.urgency] || 4);
                    case 'dueDate':
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    case 'complexity':
                        return calculateComplexity(b) - calculateComplexity(a);
                    default:
                        return (a.rank || '').localeCompare(b.rank || '');
                }
            });
    };

    const handleAddCard = (columnId, cardData) => {
        const columnCards = getColumnCards(columnId);
        const lastRank = columnCards[columnCards.length - 1]?.rank;

        const newCard = {
            id: `card-${Date.now()}`,
            title: cardData.title || cardData, // Support both object and string
            stage: columnId,
            format: cardData.format || 'long-form',
            parentProject: cardData.parentProject || null,
            projectId: cardData.projectId || null,
            rank: generateRank(lastRank, null),
            checklists: getDefaultChecklist(cardData.format || 'long-form'),
            description: '',
            assignee: null,
            collaborators: [],
            startDate: new Date().toISOString().split('T')[0],
            dueDate: null,
            stageStatus: 'not_started',
            stageVersion: 1,
            stageHistory: [],
            activity: []
        };

        const newItems = [...items, newCard];
        setItems(newItems);
        onUpdate?.(newItems);
    };

    const handleUpdateCard = (updatedCard) => {
        // Check if moving to done (celebration trigger)
        const oldCard = items.find(i => i.id === updatedCard.id);
        if (oldCard?.stage !== 'done' && updatedCard.stage === 'done') {
            setShowCelebration(true);
        }

        const newItems = items.map(i => i.id === updatedCard.id ? updatedCard : i);
        setItems(newItems);
        setSelectedCard(updatedCard);
        onUpdate?.(newItems);
    };

    const handleDeleteCard = (cardId) => {
        const newItems = items.filter(i => i.id !== cardId);
        setItems(newItems);
        onUpdate?.(newItems);
    };

    // Pipeline status change handler - Per-Stage Versioning Logic
    // Each stage has its own version (V1, V2, V3...)
    // Version increments when returned from Review → In Progress
    // Version resets to V1 when moving to next stage
    const handleStatusChange = (cardId, newStatus) => {
        const card = items.find(i => i.id === cardId);
        if (!card) return;

        const currentUser = 'Admin'; // TODO: Get from auth context
        const timestamp = new Date().toISOString();
        let updates = { stageStatus: newStatus };
        let newActivity = [...(card.activity || [])];

        // CASE 1: Approved → Move to next stage, reset version to V1
        if (newStatus === 'approved') {
            const nextStage = getNextStage(card.stage);
            if (nextStage) {
                const currentVersion = card.stageVersion || 1;

                // Record stage completion in history with final version
                const historyEntry = {
                    stage: card.stage,
                    approvedBy: currentUser,
                    date: new Date().toISOString().split('T')[0],
                    finalVersion: currentVersion // Store final version for this stage
                };

                // Log stage approval to activity
                newActivity.push({
                    id: `act-${Date.now()}`,
                    type: 'stage_change',
                    author: currentUser,
                    timestamp,
                    from: card.stage,
                    to: nextStage,
                    version: currentVersion
                });

                updates = {
                    stage: nextStage,
                    stageStatus: 'not_started',
                    stageVersion: 1, // Reset to V1 for new stage
                    stageHistory: [...(card.stageHistory || []), historyEntry],
                    activity: newActivity
                };

                // Trigger celebration if moving to done
                if (nextStage === 'done') {
                    setShowCelebration(true);
                }
            }
        }
        // CASE 2: Returned from Review → In Progress = Version++
        else if (newStatus === 'in_progress' && card.stageStatus === 'review') {
            const newVersion = (card.stageVersion || 1) + 1;

            // Log revision request to activity
            newActivity.push({
                id: `act-${Date.now()}`,
                type: 'revision_request',
                author: currentUser,
                timestamp,
                stage: card.stage,
                fromVersion: card.stageVersion || 1,
                toVersion: newVersion
            });

            updates = {
                stageStatus: 'in_progress',
                stageVersion: newVersion,
                activity: newActivity
            };
        }
        // CASE 3: Submit for Review (In Progress → Review)
        else if (newStatus === 'review' && card.stageStatus === 'in_progress') {
            // Log submission to activity
            newActivity.push({
                id: `act-${Date.now()}`,
                type: 'status_change',
                author: currentUser,
                timestamp,
                from: 'In Progress',
                to: 'In Review',
                version: card.stageVersion || 1
            });

            updates = {
                stageStatus: 'review',
                activity: newActivity
            };
        }
        // CASE 4: Start Work (Not Started → In Progress)
        else if (newStatus === 'in_progress' && card.stageStatus === 'not_started') {
            // Initialize version if not set
            updates = {
                stageStatus: 'in_progress',
                stageVersion: card.stageVersion || 1
            };
        }

        const updatedCard = { ...card, ...updates };
        const newItems = items.map(i => i.id === cardId ? updatedCard : i);
        setItems(newItems);

        // Update selected card if it's the one being changed
        if (selectedCard?.id === cardId) {
            setSelectedCard(updatedCard);
        }

        onUpdate?.(newItems);
    };

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            {/* Search Bar & Filters */}
            <div className="flex items-center gap-4 mb-4 flex-shrink-0 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-smoke/40" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search cards... (press / to focus)"
                        className="w-full bg-onyx border border-white-smoke/10 rounded-lg pl-10 pr-12 py-2 text-sm text-white-smoke placeholder-white-smoke/30 outline-none focus:border-orange-brand/50"
                    />
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white-smoke/40 hover:text-white-smoke"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white-smoke/20 font-mono">/</span>
                    )}
                </div>

                {/* My Work Toggle */}
                <button
                    onClick={() => setFilterMyWork(!filterMyWork)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${filterMyWork
                        ? 'bg-orange-brand text-white-smoke'
                        : 'bg-onyx border border-white-smoke/10 text-white-smoke/60 hover:text-white-smoke'
                        }`}
                >
                    <UserIcon className="w-3.5 h-3.5" />
                    My Work
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-onyx border border-white-smoke/10 rounded-lg px-3 py-2 pr-8 text-xs text-white-smoke/70 outline-none cursor-pointer hover:border-white-smoke/20"
                    >
                        <option value="default">Sort: Default</option>
                        <option value="priority">Sort: Priority</option>
                        <option value="dueDate">Sort: Due Date</option>
                        <option value="complexity">Sort: Complexity</option>
                    </select>
                    <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white-smoke/40 pointer-events-none" />
                </div>

                <div className="text-xs text-white-smoke/40">
                    <span className="font-bold text-white-smoke/60">{items.length}</span> total cards
                    {filterMyWork && <span className="ml-2 text-orange-brand">(filtered)</span>}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-8 min-w-max h-full">
                        {columns.map(col => (
                            <DroppableColumn
                                key={col}
                                id={col}
                                title={col}
                                cards={getColumnCards(col)}
                                onCardClick={setSelectedCard}
                                onAddCard={(cardData) => handleAddCard(col, cardData)}
                                onStatusChange={handleStatusChange}
                                forceAddCard={addCardColumn === col}
                                onForceAddCardHandled={() => setAddCardColumn(null)}
                                allItems={items}
                            />
                        ))}

                        <div className="w-80 flex-shrink-0">
                            <button className="w-full h-12 flex items-center justify-center gap-2 bg-white-smoke/5 text-white-smoke/40 rounded-xl hover:bg-white-smoke/10 hover:text-white-smoke transition-all">
                                <Plus className="w-5 h-5" /> Add List
                            </button>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeCard ? (
                            <div className="bg-onyx p-4 rounded-xl border-2 border-orange-brand shadow-2xl opacity-90 w-72">
                                <h4 className="text-white-smoke font-medium text-sm">{activeCard.title}</h4>
                                <div className="text-[10px] px-2 py-0.5 rounded bg-violet-brand/20 text-violet-brand font-bold mt-2 inline-block">
                                    {activeCard.format}
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => {
                        setSelectedCard(null);
                        setIsEditingModalTitle(false);
                    }}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                    teamMembers={teamMembers}
                    externalEditTitle={isEditingModalTitle}
                    onStatusChange={handleStatusChange}
                    allItems={items}
                />
            )}

            {/* Celebration when card moves to Done */}
            <CelebrationOverlay
                show={showCelebration}
                onComplete={() => setShowCelebration(false)}
            />
        </div>
    );
};

export default ProductionBoard;
