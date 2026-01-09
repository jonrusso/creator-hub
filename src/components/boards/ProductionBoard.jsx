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
    Film, Star, Smartphone, AlertCircle, Tag
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

// Sortable Card Component
const SortableCard = ({ card, onClick }) => {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-onyx p-4 rounded-xl border border-white-smoke/5 hover:border-orange-brand/40 cursor-pointer shadow-sm group transition-all ${isDragging ? 'ring-2 ring-orange-brand' : ''}`}
        >
            <div className="flex items-start gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-1 p-1 text-white-smoke/20 hover:text-white-smoke/60 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                <div className="flex-1" onClick={onClick}>
                    {/* Client Tag */}
                    {card.client && (
                        <div className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium mb-1.5 inline-flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {card.client}
                        </div>
                    )}

                    <h4 className="text-white-smoke font-medium text-sm mb-2 group-hover:text-orange-brand transition-colors">
                        {card.title}
                    </h4>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {/* Format Badge with Icon */}
                        {(() => {
                            const format = VIDEO_FORMATS.find(f => f.id === card.format) || VIDEO_FORMATS[0];
                            const FormatIcon = format.icon;
                            return (
                                <div className={`text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1 font-bold ${format.color}`}>
                                    <FormatIcon className="w-3 h-3" />
                                    {format.label}
                                </div>
                            );
                        })()}

                        {/* Urgency Badge */}
                        {card.urgency && (() => {
                            const urgency = URGENCY_LEVELS.find(u => u.id === card.urgency);
                            return urgency ? (
                                <div className={`text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1 font-bold ${urgency.bgColor} ${urgency.textColor}`}>
                                    <AlertCircle className="w-3 h-3" />
                                    {urgency.label}
                                </div>
                            ) : null;
                        })()}
                    </div>

                    {/* Assignee */}
                    {card.assignee && (
                        <div className="text-[10px] text-white-smoke/40 flex items-center gap-1 mb-2">
                            <UserIcon className="w-3 h-3" />
                            {card.assignee}
                        </div>
                    )}

                    {/* Due Date Badge */}
                    {card.dueDate && (
                        <div className={`text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1 mb-2 ${dateStatus === 'overdue' ? 'bg-red-500/20 text-red-400' :
                            dateStatus === 'soon' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-white-smoke/10 text-white-smoke/50'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(card.dueDate)}
                        </div>
                    )}

                    {/* Progress indicator for checklists */}
                    {card.checklists && card.checklists.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white-smoke/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-brand rounded-full transition-all"
                                    style={{
                                        width: `${(card.checklists.filter(c => c.checked).length / card.checklists.length) * 100}%`
                                    }}
                                />
                            </div>
                            <span className="text-[10px] text-white-smoke/40">
                                {card.checklists.filter(c => c.checked).length}/{card.checklists.length}
                            </span>
                        </div>
                    )}
                </div>
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

// Droppable Column Component
const DroppableColumn = ({ id, title, cards, onCardClick, onAddCard }) => {
    const [isAdding, setIsAdding] = useState(false);
    const cardIds = cards.map(c => c.id);

    const handleAddSubmit = (cardTitle) => {
        onAddCard(cardTitle);
        setIsAdding(false);
    };

    return (
        <div className="w-80 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-heading font-bold text-white-smoke uppercase tracking-wider text-sm">
                    {title}
                </h3>
                <span className="text-xs text-white-smoke/40 font-mono bg-white-smoke/5 px-2 py-0.5 rounded-full">
                    {cards.length}
                </span>
            </div>

            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 min-h-[100px]">
                    {cards.map(card => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            onClick={() => onCardClick(card)}
                        />
                    ))}
                </div>
            </SortableContext>

            {isAdding ? (
                <div className="mt-3">
                    <AddCardForm
                        onSubmit={handleAddSubmit}
                        onCancel={() => setIsAdding(false)}
                    />
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-white-smoke/20 hover:text-white-smoke/60 hover:bg-white-smoke/5 rounded-xl border border-transparent hover:border-white-smoke/5 border-dashed transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Card
                </button>
            )}
        </div>
    );
};

// Enhanced Card Detail Modal
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-onyx w-full max-w-2xl rounded-2xl border border-white-smoke/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white-smoke/5 flex justify-between items-start">
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
                            className="text-2xl font-bold text-white-smoke font-heading bg-transparent outline-none border-b-2 border-orange-brand w-full"
                        />
                    ) : (
                        <h2
                            className="text-2xl font-bold text-white-smoke font-heading cursor-pointer hover:text-orange-brand flex items-center gap-2"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {localCard.title}
                            <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                        </h2>
                    )}
                    <button onClick={onClose}>
                        <X className="w-6 h-6 text-white-smoke/40 hover:text-white-smoke" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Description */}
                    <div>
                        <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-cyan-blue/50 p-3 rounded-lg text-white-smoke/80 text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50"
                            rows={3}
                            value={localCard.description || ''}
                            onChange={(e) => updateCard({ description: e.target.value })}
                            placeholder="Add a description..."
                        />
                    </div>

                    {/* Client & Format Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                                Client
                            </label>
                            <input
                                type="text"
                                value={localCard.client || ''}
                                onChange={(e) => updateCard({ client: e.target.value })}
                                placeholder="Enter client name..."
                                className="w-full bg-cyan-blue/50 p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                                Format
                            </label>
                            <select
                                value={localCard.format || 'long-form'}
                                onChange={(e) => updateCard({ format: e.target.value })}
                                className="w-full bg-cyan-blue/50 p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5"
                            >
                                {VIDEO_FORMATS.map(f => (
                                    <option key={f.id} value={f.id}>{f.label} - {f.description}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Urgency Level */}
                    <div>
                        <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                            Urgency Level
                        </label>
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
                    <div>
                        <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                            Assignee
                        </label>
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

                    {/* Checklists */}
                    <div>
                        <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                            Checklist
                        </label>
                        <div className="space-y-2">
                            {localCard.checklists?.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-2 hover:bg-white-smoke/5 rounded-lg group"
                                >
                                    <button
                                        onClick={() => toggleChecklist(item.id)}
                                        className={`${item.checked ? 'text-orange-brand' : 'text-white-smoke/20'}`}
                                    >
                                        {item.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                    <span className={`text-sm flex-1 ${item.checked ? 'text-white-smoke/40 line-through' : 'text-white-smoke/80'}`}>
                                        {item.label}
                                    </span>
                                    <button
                                        onClick={() => deleteChecklistItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Add Checklist Item */}
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                                    placeholder="Add checklist item..."
                                    className="flex-1 bg-cyan-blue/30 p-2 rounded-lg text-white-smoke text-sm outline-none border border-white-smoke/5 focus:border-orange-brand/50"
                                />
                                <button
                                    onClick={addChecklistItem}
                                    className="p-2 bg-orange-brand/20 text-orange-brand rounded-lg hover:bg-orange-brand/30"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white-smoke/5 bg-cyan-blue/30 flex justify-between">
                    <button
                        onClick={() => { onDelete?.(localCard.id); onClose(); }}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Delete Card
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white-smoke/10 text-white-smoke rounded-lg text-sm font-medium hover:bg-white-smoke/20"
                    >
                        Close
                    </button>
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
    const [columns] = useState(['scripting', 'production', 'qa']);
    const [selectedCard, setSelectedCard] = useState(null);
    const [activeId, setActiveId] = useState(null);

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

    const getColumnCards = (columnId) => {
        return items
            .filter(item => item.stage === columnId)
            .sort((a, b) => (a.rank || '').localeCompare(b.rank || ''));
    };

    const handleAddCard = (columnId, title) => {
        const columnCards = getColumnCards(columnId);
        const lastRank = columnCards[columnCards.length - 1]?.rank;

        const newCard = {
            id: `card-${Date.now()}`,
            title: title,
            stage: columnId,
            format: 'Task',
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

    return (
        <div className="animate-fadeIn h-full overflow-x-auto pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 min-w-max">
                    {columns.map(col => (
                        <DroppableColumn
                            key={col}
                            id={col}
                            title={col}
                            cards={getColumnCards(col)}
                            onCardClick={setSelectedCard}
                            onAddCard={(title) => handleAddCard(col, title)}
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

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                    teamMembers={teamMembers}
                />
            )}
        </div>
    );
};

export default ProductionBoard;
