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
    Trash2, Calendar, User as UserIcon, Edit2, Save, Clock,
    Film, Star, Smartphone, AlertCircle, Tag, Search, Archive,
    FolderOpen, FileText, ChevronRight, ExternalLink, Sparkles, PartyPopper
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
    const revision = card.revision || 1;

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
                    {revision > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px]">
                            REV {revision}
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
const AddCardForm = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit(title.trim());
            setTitle('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-onyx p-3 rounded-xl border border-orange-brand/30">
            <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter card title..."
                className="w-full bg-transparent text-white-smoke text-sm outline-none placeholder-white-smoke/30 mb-2"
                onKeyDown={(e) => e.key === 'Escape' && onCancel()}
            />
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
const DroppableColumn = ({ id, title, cards, onCardClick, onAddCard, onStatusChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const cardIds = cards.map(c => c.id);
    const colors = COLUMN_COLORS[id] || COLUMN_COLORS.scripting;

    const handleAddSubmit = (cardTitle) => {
        onAddCard(cardTitle);
        setIsAdding(false);
    };

    return (
        <div className="w-80 flex-shrink-0 flex flex-col h-full">
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border} flex-shrink-0`}>
                <h3 className={`font-heading font-bold uppercase tracking-wider text-sm ${colors.text}`}>
                    {title}
                </h3>
                <span className={`text-xs font-bold ${colors.text} px-2 py-0.5 rounded-full bg-black/20`}>
                    {cards.length}
                </span>
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
const StageTimeline = ({ currentStage, stageStatus, stageHistory }) => {
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

    return (
        <div className="bg-cyan-blue/30 rounded-xl p-4 border border-white-smoke/5">
            <h3 className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-4">Pipeline Progress</h3>
            <div className="flex items-start justify-between gap-2">
                {stages.map((stage, idx) => {
                    const state = getStageState(stage);
                    const history = getHistoryForStage(stage);
                    const isLast = idx === stages.length - 1;

                    return (
                        <div key={stage} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                {/* Stage Circle */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${state === 'completed' ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400' :
                                    state === 'approved' ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400' :
                                        state === 'in_progress' ? 'bg-blue-500/30 border-blue-500 text-blue-400' :
                                            state === 'review' ? 'bg-amber-500/30 border-amber-500 text-amber-400' :
                                                state === 'not_started' && stage === currentStage ? 'bg-slate-500/30 border-slate-400 text-slate-400' :
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
                                            state === 'not_started' && stage === currentStage ? 'text-slate-400' :
                                                'text-white-smoke/30'
                                    }`}>
                                    {stageLabels[stage]}
                                </span>

                                {/* History Info */}
                                {history && (
                                    <div className="text-[9px] text-white-smoke/40 mt-1 text-center">
                                        <div>REV {history.revision}</div>
                                        <div>{history.date}</div>
                                    </div>
                                )}

                                {/* Current Stage Status */}
                                {stage === currentStage && state !== 'completed' && (
                                    <div className="text-[9px] text-white-smoke/40 mt-1">
                                        {STATUS_CONFIG[stageStatus]?.label || 'Pending'}
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

// Team Activity Component - Comments and Status Changes
const TeamActivity = ({ activity = [], onAddComment }) => {
    const [newComment, setNewComment] = useState('');

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

    const sortedActivity = [...activity].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    return (
        <div className="bg-cyan-blue/30 rounded-xl border border-white-smoke/5 flex flex-col h-full">
            <div className="p-3 border-b border-white-smoke/5">
                <h3 className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold">Team Activity</h3>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {sortedActivity.length === 0 ? (
                    <div className="text-center text-white-smoke/30 text-xs py-8">
                        No activity yet. Be the first to comment!
                    </div>
                ) : (
                    sortedActivity.map(item => (
                        <div key={item.id} className="text-sm">
                            {item.type === 'comment' ? (
                                <div className="bg-onyx rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white-smoke font-medium text-xs">{item.author}</span>
                                        <span className="text-white-smoke/30 text-[10px]">{formatTime(item.timestamp)}</span>
                                    </div>
                                    <p className="text-white-smoke/70 text-xs leading-relaxed">{item.content}</p>
                                </div>
                            ) : item.type === 'status_change' ? (
                                <div className="flex items-center gap-2 text-[10px] text-white-smoke/40 py-1">
                                    <span className="font-medium text-white-smoke/60">{item.author}</span>
                                    <span>changed status</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white-smoke/10">{item.from}</span>
                                    <span>→</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white-smoke/10">{item.to}</span>
                                </div>
                            ) : item.type === 'stage_change' ? (
                                <div className="flex items-center gap-2 text-[10px] text-white-smoke/40 py-1">
                                    <span className="font-medium text-emerald-400">{item.author}</span>
                                    <span>approved</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{item.from}</span>
                                    <span>→</span>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{item.to}</span>
                                </div>
                            ) : null}
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white-smoke/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-onyx p-2 rounded-lg text-white-smoke text-xs outline-none border border-white-smoke/10 focus:border-orange-brand/50"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-3 py-2 bg-orange-brand/20 text-orange-brand rounded-lg text-xs font-medium hover:bg-orange-brand/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

// Enhanced Card Detail Modal - Professional Full-Screen
const CardModal = ({ card, onClose, onUpdate, onDelete, teamMembers }) => {
    const [localCard, setLocalCard] = useState(card);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newChecklistItem, setNewChecklistItem] = useState('');
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
                                <h2
                                    className="text-xl font-bold text-white-smoke font-heading cursor-pointer hover:text-orange-brand truncate"
                                    onClick={() => setIsEditingTitle(true)}
                                >
                                    {localCard.title}
                                </h2>
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
                        {/* Status Badge */}
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusInfo.color} border border-current/30`}>
                            {statusInfo.icon} {statusInfo.label}
                        </div>

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

                        {/* Stage Timeline */}
                        <StageTimeline
                            currentStage={localCard.stage}
                            stageStatus={stageStatus}
                            stageHistory={localCard.stageHistory || []}
                        />

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
                                <input
                                    type="text"
                                    value={localCard.client || ''}
                                    onChange={(e) => updateCard({ client: e.target.value })}
                                    placeholder="Enter client name..."
                                    className="w-full bg-onyx p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50"
                                />
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
                            <div className="flex gap-2">
                                {localCard.driveLink ? (
                                    <a href={localCard.driveLink} target="_blank" rel="noopener noreferrer"
                                        className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center justify-center gap-2 text-xs font-medium">
                                        <FolderOpen className="w-4 h-4" /> Drive
                                    </a>
                                ) : (
                                    <button onClick={() => {
                                        const url = prompt('Enter Google Drive link:');
                                        if (url) updateCard({ driveLink: url });
                                    }} className="flex-1 px-3 py-2 bg-white-smoke/5 text-white-smoke/40 rounded-lg hover:bg-white-smoke/10 flex items-center justify-center gap-2 text-xs">
                                        <FolderOpen className="w-4 h-4" /> Add Drive
                                    </button>
                                )}
                                {localCard.scriptLink ? (
                                    <a href={localCard.scriptLink} target="_blank" rel="noopener noreferrer"
                                        className="flex-1 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 flex items-center justify-center gap-2 text-xs font-medium">
                                        <FileText className="w-4 h-4" /> Script
                                    </a>
                                ) : (
                                    <button onClick={() => {
                                        const url = prompt('Enter Script (Google Docs) link:');
                                        if (url) updateCard({ scriptLink: url });
                                    }} className="flex-1 px-3 py-2 bg-white-smoke/5 text-white-smoke/40 rounded-lg hover:bg-white-smoke/10 flex items-center justify-center gap-2 text-xs">
                                        <FileText className="w-4 h-4" /> Add Script
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
                        onClick={() => { onDelete?.(localCard.id); onClose(); }}
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

    // Filter cards based on search query
    const getColumnCards = (columnId) => {
        return items
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
            .sort((a, b) => (a.rank || '').localeCompare(b.rank || ''));
    };

    const handleAddCard = (columnId, title) => {
        const columnCards = getColumnCards(columnId);
        const lastRank = columnCards[columnCards.length - 1]?.rank;

        const newCard = {
            id: `card-${Date.now()}`,
            title: title,
            stage: columnId,
            format: 'long-form',
            rank: generateRank(lastRank, null),
            checklists: [],
            description: '',
            assignee: null,
            startDate: null,
            dueDate: null
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

    // Pipeline status change handler
    const handleStatusChange = (cardId, newStatus) => {
        const card = items.find(i => i.id === cardId);
        if (!card) return;

        let updates = { stageStatus: newStatus };

        // If approved, move to next stage
        if (newStatus === 'approved') {
            const nextStage = getNextStage(card.stage);
            if (nextStage) {
                // Record approval in stage history
                const historyEntry = {
                    stage: card.stage,
                    approvedBy: 'Admin', // TODO: Get from auth context
                    date: new Date().toISOString().split('T')[0],
                    revision: card.revision || 1
                };

                updates = {
                    stage: nextStage,
                    stageStatus: 'not_started',
                    revision: 1, // Reset revision for new stage
                    stageHistory: [...(card.stageHistory || []), historyEntry]
                };

                // Trigger celebration if moving to done
                if (nextStage === 'done') {
                    setShowCelebration(true);
                }
            }
        }

        // If requesting revisions (back to in_progress), increment revision
        if (newStatus === 'in_progress' && card.stageStatus === 'review') {
            updates.revision = (card.revision || 1) + 1;
        }

        const updatedCard = { ...card, ...updates };
        const newItems = items.map(i => i.id === cardId ? updatedCard : i);
        setItems(newItems);
        onUpdate?.(newItems);
    };

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-smoke/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search cards by title, client, or assignee..."
                        className="w-full bg-onyx border border-white-smoke/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white-smoke placeholder-white-smoke/30 outline-none focus:border-orange-brand/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white-smoke/40 hover:text-white-smoke"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="text-xs text-white-smoke/40">
                    <span className="font-bold text-white-smoke/60">{items.length}</span> total cards
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
                    <div className="flex gap-6 min-w-max h-full">
                        {columns.map(col => (
                            <DroppableColumn
                                key={col}
                                id={col}
                                title={col}
                                cards={getColumnCards(col)}
                                onCardClick={setSelectedCard}
                                onAddCard={(title) => handleAddCard(col, title)}
                                onStatusChange={handleStatusChange}
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
                    onClose={() => setSelectedCard(null)}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                    teamMembers={teamMembers}
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
