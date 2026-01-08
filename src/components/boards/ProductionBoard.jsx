import React, { useState, useCallback } from 'react';
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
    MoreVertical, Calendar, User as UserIcon
} from 'lucide-react';

// LexoRank-style fractional ordering helper
const generateRank = (before, after) => {
    const MIN = 'a';
    const MAX = 'z';

    if (!before && !after) return 'm'; // Middle of alphabet
    if (!before) return String.fromCharCode(after.charCodeAt(0) - 1) || 'a';
    if (!after) return before + 'm';

    // Generate rank between before and after
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-onyx p-4 rounded-xl border border-white-smoke/5 hover:border-orange-brand/40 cursor-pointer shadow-sm group transition-all ${isDragging ? 'ring-2 ring-orange-brand' : ''}`}
        >
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-1 p-1 text-white-smoke/20 hover:text-white-smoke/60 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Card Content */}
                <div className="flex-1" onClick={onClick}>
                    <h4 className="text-white-smoke font-medium text-sm mb-3 group-hover:text-orange-brand transition-colors">
                        {card.title}
                    </h4>
                    <div className="flex justify-between items-center">
                        <div className="text-[10px] px-2 py-0.5 rounded bg-violet-brand/20 text-violet-brand font-bold">
                            {card.format}
                        </div>
                        {card.assignee && (
                            <div className="text-[10px] text-white-smoke/40 flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {card.assignee}
                            </div>
                        )}
                    </div>
                    {/* Progress indicator for checklists */}
                    {card.checklists && card.checklists.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
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

// Droppable Column Component
const DroppableColumn = ({ id, title, cards, onCardClick, onAddCard }) => {
    const cardIds = cards.map(c => c.id);

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

            <button
                onClick={onAddCard}
                className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-white-smoke/20 hover:text-white-smoke/60 hover:bg-white-smoke/5 rounded-xl border border-transparent hover:border-white-smoke/5 border-dashed transition-all"
            >
                <Plus className="w-4 h-4" /> Add Card
            </button>
        </div>
    );
};

// Card Detail Modal
const CardModal = ({ card, onClose, onUpdate, teamMembers }) => {
    const [localCard, setLocalCard] = useState(card);

    if (!card) return null;

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-onyx w-full max-w-2xl rounded-2xl border border-white-smoke/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white-smoke/5 flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-white-smoke font-heading">{localCard.title}</h2>
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
                            defaultValue={localCard.description}
                            placeholder="Add a description..."
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
                                    className="flex items-center gap-3 p-2 hover:bg-white-smoke/5 rounded-lg cursor-pointer"
                                    onClick={() => toggleChecklist(item.id)}
                                >
                                    <button className={`${item.checked ? 'text-orange-brand' : 'text-white-smoke/20'}`}>
                                        {item.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                    <span className={`text-sm ${item.checked ? 'text-white-smoke/40 line-through' : 'text-white-smoke/80'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                            <button className="flex items-center gap-2 text-xs text-orange-brand mt-2 hover:underline">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white-smoke/5 bg-cyan-blue/30 flex justify-end gap-3">
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
 * ProductionBoard - Drag-and-drop Kanban board for production tracking
 */
const ProductionBoard = ({ initialItems, teamMembers = [], onUpdate }) => {
    const [items, setItems] = useState(initialItems || []);
    const [columns] = useState(['scripting', 'production', 'qa']);
    const [selectedCard, setSelectedCard] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
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
        const overColumn = findColumn(overId) || overId; // overId could be a column id

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

                // Generate new rank for the moved item
                const movedItem = newItems.find(i => i.id === activeId);
                const sameColumnItems = newItems.filter(i => i.stage === movedItem.stage);
                const movedIndex = sameColumnItems.findIndex(i => i.id === activeId);

                const beforeRank = sameColumnItems[movedIndex - 1]?.rank;
                const afterRank = sameColumnItems[movedIndex + 1]?.rank;
                movedItem.rank = generateRank(beforeRank, afterRank);

                // Callback for persistence
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

    const handleAddCard = (columnId) => {
        const columnCards = getColumnCards(columnId);
        const lastRank = columnCards[columnCards.length - 1]?.rank;

        const newCard = {
            id: `card-${Date.now()}`,
            title: 'New Card',
            stage: columnId,
            format: 'Task',
            rank: generateRank(lastRank, null),
            checklists: []
        };

        setItems([...items, newCard]);
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
                            onAddCard={() => handleAddCard(col)}
                        />
                    ))}

                    {/* Add Column Button */}
                    <div className="w-80 flex-shrink-0">
                        <button className="w-full h-12 flex items-center justify-center gap-2 bg-white-smoke/5 text-white-smoke/40 rounded-xl hover:bg-white-smoke/10 hover:text-white-smoke transition-all">
                            <Plus className="w-5 h-5" /> Add List
                        </button>
                    </div>
                </div>

                {/* Drag Overlay */}
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

            {/* Card Modal */}
            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={(updated) => {
                        setItems(items.map(i => i.id === updated.id ? updated : i));
                    }}
                    teamMembers={teamMembers}
                />
            )}
        </div>
    );
};

export default ProductionBoard;
