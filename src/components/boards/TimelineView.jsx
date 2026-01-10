import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Users, Film, Star, Smartphone, Tag, Clock, ArrowLeft, ArrowRight, FileText, Video, CheckCircle } from 'lucide-react';

// Format definitions (same as ProductionBoard)
const VIDEO_FORMATS = {
    'long-form': { label: 'Long-Form', icon: Film, color: 'bg-blue-500' },
    'hero-video': { label: 'Hero', icon: Star, color: 'bg-amber-500' },
    'bts-short': { label: 'BTS', icon: Smartphone, color: 'bg-pink-500' },
};

// Stage colors with unique icons (Done excluded - completed items don't need timeline tracking)
const STAGE_COLORS = {
    'scripting': { bg: 'bg-gradient-to-r from-blue-600 to-blue-500', border: 'border-blue-500', text: 'text-blue-400', solid: 'bg-blue-500', icon: FileText },
    'production': { bg: 'bg-gradient-to-r from-violet-600 to-violet-500', border: 'border-violet-500', text: 'text-violet-400', solid: 'bg-violet-500', icon: Video },
    'qa': { bg: 'bg-gradient-to-r from-amber-600 to-amber-500', border: 'border-amber-500', text: 'text-amber-400', solid: 'bg-amber-500', icon: CheckCircle },
};

// Client Logos - stored in localStorage until Supabase is ready
const CLIENT_LOGOS_KEY = 'creator_hub_client_logos';
const BUILT_IN_LOGOS = {
    'higgsfield': '/logos/higgsfield.jpg',
};

// Get logo for a specific client (shared with ProductionBoard)
const getClientLogo = (clientName) => {
    if (!clientName) return null;
    try {
        const stored = localStorage.getItem(CLIENT_LOGOS_KEY);
        const userLogos = stored ? JSON.parse(stored) : {};
        const allLogos = { ...BUILT_IN_LOGOS, ...userLogos };
        return allLogos[clientName.toLowerCase()] || null;
    } catch {
        return BUILT_IN_LOGOS[clientName.toLowerCase()] || null;
    }
};

/**
 * TimelineView - Professional Gantt-style timeline (ShotGrid-inspired)
 * Default: grouped by assignee for team workload visibility
 */
const TimelineView = ({ items, onCardClick, onUpdateCard }) => {
    const [viewOffset, setViewOffset] = useState(0);
    const [viewScale, setViewScale] = useState('week'); // 'week' | 'day'
    const [filterStage, setFilterStage] = useState(null);
    const [groupBy, setGroupBy] = useState('assignee'); // Default to assignee view
    const [dragging, setDragging] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const scrollContainerRef = useRef(null);
    const containerRef = useRef(null);

    const VISIBLE_DAYS = viewScale === 'week' ? 28 : 14;
    const DAY_WIDTH = viewScale === 'week' ? 48 : 72; // Wider for better readability
    const ROW_HEIGHT = 44; // Consistent row height

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewScale]);

    // Generate array of dates
    const dates = useMemo(() => {
        const today = new Date();
        const result = [];
        for (let i = 0; i < VISIBLE_DAYS; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + viewOffset + i);
            result.push(date);
        }
        return result;
    }, [viewOffset, VISIBLE_DAYS]);

    // Filter and calculate positions
    const timelineItems = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (items || [])
            .filter(item => !item.archived) // Exclude archived
            .filter(item => item.stage !== 'done') // Exclude completed - no need to track
            .filter(item => (item.startDate || item.dueDate) && (!filterStage || item.stage === filterStage))
            .map(item => {
                const startDate = item.startDate ? new Date(item.startDate) : new Date(item.dueDate);
                const endDate = item.dueDate ? new Date(item.dueDate) : new Date(item.startDate);

                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                const viewStart = new Date(today);
                viewStart.setDate(viewStart.getDate() + viewOffset);
                viewStart.setHours(0, 0, 0, 0);

                const startOffset = Math.floor((startDate - viewStart) / (1000 * 60 * 60 * 24));
                const endOffset = Math.floor((endDate - viewStart) / (1000 * 60 * 60 * 24));

                const left = startOffset * DAY_WIDTH;
                const width = Math.max((endOffset - startOffset + 1) * DAY_WIDTH - 4, DAY_WIDTH - 4); // Slight gap

                const isOverdue = endDate < today && item.stage !== 'done';
                const isSoon = !isOverdue && (endDate - today) / (1000 * 60 * 60 * 24) <= 2;
                const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                // Calculate progress
                const progress = item.checklists?.length > 0
                    ? (item.checklists.filter(c => c.checked).length / item.checklists.length) * 100
                    : 0;

                return {
                    ...item,
                    left,
                    width,
                    isOverdue,
                    isSoon,
                    daysRemaining,
                    progress,
                    startOffset,
                    endOffset
                };
            })
            .filter(item => item.left + item.width > -100 && item.left < VISIBLE_DAYS * DAY_WIDTH + 100);
    }, [items, viewOffset, filterStage, DAY_WIDTH, VISIBLE_DAYS]);

    // Group items
    const groupedItems = useMemo(() => {
        if (!groupBy) return { 'All Projects': timelineItems };

        const groups = timelineItems.reduce((acc, item) => {
            const key = item[groupBy] || 'Unassigned';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        // Sort groups - put "Unassigned" last
        const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
            if (a === 'Unassigned') return 1;
            if (b === 'Unassigned') return -1;
            return a.localeCompare(b);
        });

        return Object.fromEntries(sortedEntries);
    }, [timelineItems, groupBy]);

    const formatDateHeader = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const isToday = checkDate.getTime() === today.getTime();
        const dayNum = checkDate.getDate();
        const dayName = viewScale === 'week'
            ? checkDate.toLocaleDateString('en-US', { weekday: 'narrow' })
            : checkDate.toLocaleDateString('en-US', { weekday: 'short' });
        const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
        const isFirstOfMonth = dayNum === 1;
        const monthName = checkDate.toLocaleDateString('en-US', { month: 'short' });

        return { dayName, dayNum, isToday, isWeekend, isFirstOfMonth, monthName };
    };

    const handlePrev = () => setViewOffset(prev => prev - (viewScale === 'week' ? 7 : 3));
    const handleNext = () => setViewOffset(prev => prev + (viewScale === 'week' ? 7 : 3));
    const handleToday = () => setViewOffset(0);

    // Drag handlers for resizing/moving bars
    const handleDragStart = (e, item, type) => {
        e.preventDefault();
        setDragging({ item, type, startX: e.clientX, originalLeft: item.left, originalWidth: item.width });
    };

    const handleDrag = useCallback((e) => {
        if (!dragging) return;

        const delta = e.clientX - dragging.startX;
        const daysDelta = Math.round(delta / DAY_WIDTH);

        if (dragging.type === 'move') {
            const newStartOffset = dragging.item.startOffset + daysDelta;
            const newEndOffset = dragging.item.endOffset + daysDelta;

            const today = new Date();
            const newStart = new Date(today);
            newStart.setDate(newStart.getDate() + viewOffset + newStartOffset);
            const newEnd = new Date(today);
            newEnd.setDate(newEnd.getDate() + viewOffset + newEndOffset);

            onUpdateCard?.({
                ...dragging.item,
                startDate: newStart.toISOString().split('T')[0],
                dueDate: newEnd.toISOString().split('T')[0]
            });
        } else if (dragging.type === 'resize-end') {
            const newEndOffset = dragging.item.endOffset + daysDelta;
            if (newEndOffset >= dragging.item.startOffset) {
                const today = new Date();
                const newEnd = new Date(today);
                newEnd.setDate(newEnd.getDate() + viewOffset + newEndOffset);

                onUpdateCard?.({
                    ...dragging.item,
                    dueDate: newEnd.toISOString().split('T')[0]
                });
            }
        }
    }, [dragging, DAY_WIDTH, viewOffset, onUpdateCard]);

    const handleDragEnd = () => {
        setDragging(null);
    };

    // Get current month display
    const currentMonthDisplay = useMemo(() => {
        if (dates.length === 0) return '';
        const startMonth = dates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const endMonth = dates[dates.length - 1].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return startMonth === endMonth ? startMonth : `${dates[0].toLocaleDateString('en-US', { month: 'short' })} - ${dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }, [dates]);

    const SIDEBAR_WIDTH = groupBy ? 180 : 0;

    return (
        <div
            className="h-full flex flex-col bg-gradient-to-br from-cyan-blue/30 to-onyx rounded-xl border border-white-smoke/10 overflow-hidden shadow-2xl"
            ref={containerRef}
            onMouseMove={dragging ? handleDrag : undefined}
            onMouseUp={dragging ? handleDragEnd : undefined}
            onMouseLeave={dragging ? handleDragEnd : undefined}
        >
            {/* Professional Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white-smoke/10 bg-gradient-to-r from-cyan-blue/40 to-transparent">
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-onyx rounded-lg border border-white-smoke/10 overflow-hidden">
                        <button
                            onClick={handlePrev}
                            className="p-2.5 hover:bg-white-smoke/10 text-white-smoke/60 hover:text-white-smoke transition-all border-r border-white-smoke/10"
                            title="← Previous (Arrow Left)"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-4 py-2 text-xs font-bold bg-orange-brand/20 text-orange-brand hover:bg-orange-brand/30 transition-all flex items-center gap-1.5"
                        >
                            <Clock className="w-3.5 h-3.5" /> Today
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2.5 hover:bg-white-smoke/10 text-white-smoke/60 hover:text-white-smoke transition-all border-l border-white-smoke/10"
                            title="→ Next (Arrow Right)"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-sm font-medium text-white-smoke/70 ml-3">
                        {currentMonthDisplay}
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3">
                    {/* Scale Toggle */}
                    <div className="bg-onyx p-1 rounded-lg flex border border-white-smoke/10">
                        <button
                            onClick={() => setViewScale('day')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewScale === 'day'
                                ? 'bg-orange-brand text-white shadow-lg'
                                : 'text-white-smoke/40 hover:text-white-smoke/70'}`}
                        >Day</button>
                        <button
                            onClick={() => setViewScale('week')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewScale === 'week'
                                ? 'bg-orange-brand text-white shadow-lg'
                                : 'text-white-smoke/40 hover:text-white-smoke/70'}`}
                        >Week</button>
                    </div>

                    {/* Filter by Stage */}
                    <div className="relative">
                        <select
                            value={filterStage || ''}
                            onChange={(e) => setFilterStage(e.target.value || null)}
                            className="appearance-none bg-onyx border border-white-smoke/10 rounded-lg px-3 py-2 text-xs text-white-smoke font-medium pr-8 cursor-pointer hover:border-white-smoke/20 transition-all"
                        >
                            <option value="">All Stages</option>
                            <option value="scripting">Scripting</option>
                            <option value="production">Production</option>
                            <option value="qa">QA</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white-smoke/40 pointer-events-none" />
                    </div>

                    {/* Group By */}
                    <div className="relative">
                        <select
                            value={groupBy || ''}
                            onChange={(e) => setGroupBy(e.target.value || null)}
                            className="appearance-none bg-onyx border border-white-smoke/10 rounded-lg px-3 py-2 text-xs text-white-smoke font-medium pr-8 cursor-pointer hover:border-white-smoke/20 transition-all"
                        >
                            <option value="">No Grouping</option>
                            <option value="assignee">By Assignee</option>
                            <option value="stage">By Stage</option>
                            <option value="client">By Client</option>
                        </select>
                        <Users className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white-smoke/40 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Date Headers - Fixed */}
            <div className="flex border-b border-white-smoke/10 bg-onyx/50">
                {/* Sidebar spacer */}
                {groupBy && (
                    <div className="flex-shrink-0 border-r border-white-smoke/10" style={{ width: SIDEBAR_WIDTH }}>
                        <div className="h-full flex items-center justify-center text-[10px] text-white-smoke/30 uppercase tracking-wider font-bold py-2">
                            {groupBy === 'assignee' ? 'Team Member' : groupBy === 'stage' ? 'Stage' : 'Client'}
                        </div>
                    </div>
                )}

                {/* Scrollable date headers */}
                <div className="flex-1 overflow-hidden">
                    <div className="flex" style={{ width: dates.length * DAY_WIDTH }}>
                        {dates.map((date, i) => {
                            const { dayName, dayNum, isToday, isWeekend, isFirstOfMonth, monthName } = formatDateHeader(date);
                            return (
                                <div
                                    key={i}
                                    style={{ width: DAY_WIDTH, flexShrink: 0 }}
                                    className={`text-center py-2 relative ${isToday
                                        ? 'bg-orange-brand/20'
                                        : isWeekend
                                            ? 'bg-white-smoke/[0.02]'
                                            : ''}`}
                                >
                                    {isFirstOfMonth && (
                                        <div className="absolute -top-0 left-0 text-[8px] text-orange-brand font-bold uppercase">
                                            {monthName}
                                        </div>
                                    )}
                                    <div className={`text-[9px] ${isToday ? 'text-orange-brand font-bold' : isWeekend ? 'text-white-smoke/20' : 'text-white-smoke/40'}`}>
                                        {dayName}
                                    </div>
                                    <div className={`text-sm font-semibold ${isToday ? 'text-orange-brand' : isWeekend ? 'text-white-smoke/20' : 'text-white-smoke/60'}`}>
                                        {dayNum}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline Grid - Scrollable */}
            <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
                {Object.entries(groupedItems).map(([group, groupItems], groupIndex) => (
                    <div
                        key={group}
                        className={`border-b-2 last:border-b-0 ${groupIndex % 2 === 0
                            ? 'bg-onyx/20 border-white-smoke/20'
                            : 'bg-cyan-blue/20 border-white-smoke/20'
                            }`}
                    >
                        <div className="flex">
                            {/* Sidebar - Group Label */}
                            {groupBy && (
                                <div
                                    className={`flex-shrink-0 border-r-2 sticky left-0 z-20 relative overflow-hidden ${groupIndex % 2 === 0
                                        ? 'bg-onyx border-orange-brand/50'
                                        : 'bg-cyan-blue border-violet-500/50'
                                        }`}
                                    style={{ width: SIDEBAR_WIDTH }}
                                >
                                    <div className="h-full flex items-center px-4 py-4 min-h-[60px]">
                                        <div className="flex items-center gap-3">
                                            {groupBy === 'assignee' && (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${groupIndex % 2 === 0
                                                    ? 'bg-gradient-to-br from-orange-brand to-amber-500'
                                                    : 'bg-gradient-to-br from-violet-500 to-purple-500'
                                                    }`}>
                                                    {group.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {groupBy === 'stage' && (() => {
                                                const StageIcon = STAGE_COLORS[group]?.icon || FileText;
                                                return (
                                                    <div className={`w-10 h-10 rounded-lg ${STAGE_COLORS[group]?.solid || 'bg-gray-500'} flex items-center justify-center shadow-lg`}>
                                                        <StageIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                );
                                            })()}
                                            {groupBy === 'client' && (() => {
                                                const clientLogo = getClientLogo(group);
                                                return clientLogo ? (
                                                    <img
                                                        src={clientLogo}
                                                        alt={group}
                                                        className="w-10 h-10 rounded-lg object-cover shadow-lg"
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg ${groupIndex % 2 === 0
                                                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                                                        : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                                        }`}>
                                                        <Tag className="w-5 h-5" />
                                                    </div>
                                                );
                                            })()}
                                            <div>
                                                <div className="text-sm font-bold text-white-smoke capitalize">{group}</div>
                                                <div className="text-[10px] text-white-smoke/50 font-medium">{groupItems.length} project{groupItems.length !== 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Fade/blur gradient overlay on the right edge */}
                                    <div
                                        className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
                                        style={{
                                            background: groupIndex % 2 === 0
                                                ? 'linear-gradient(to right, transparent, rgba(15, 15, 15, 0.95), rgba(15, 15, 15, 1))'
                                                : 'linear-gradient(to right, transparent, rgba(19, 27, 36, 0.95), rgba(19, 27, 36, 1))'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Timeline content */}
                            <div className="flex-1 relative" style={{ minWidth: dates.length * DAY_WIDTH }}>
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {dates.map((date, i) => {
                                        const { isToday, isWeekend } = formatDateHeader(date);
                                        return (
                                            <div
                                                key={i}
                                                style={{ width: DAY_WIDTH }}
                                                className={`flex-shrink-0 border-r h-full ${isToday
                                                    ? 'border-orange-brand/40 bg-orange-brand/5'
                                                    : isWeekend
                                                        ? 'border-white-smoke/5 bg-white-smoke/[0.02]'
                                                        : 'border-white-smoke/5'}`}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Items */}
                                <div className="relative py-2">
                                    {groupItems.length === 0 ? (
                                        <div className="flex items-center justify-center h-12 text-white-smoke/30 text-xs">
                                            No projects in this period
                                        </div>
                                    ) : (
                                        groupItems.map(item => {
                                            const stageColor = STAGE_COLORS[item.stage] || STAGE_COLORS.scripting;
                                            const format = VIDEO_FORMATS[item.format];
                                            const isHovered = hoveredItem === item.id;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="relative flex items-center"
                                                    style={{ height: ROW_HEIGHT }}
                                                >
                                                    {/* Timeline Bar */}
                                                    <div
                                                        className={`absolute rounded-lg cursor-pointer transition-all duration-200 group shadow-lg
                                                            ${item.isOverdue ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-onyx' : ''}
                                                            ${isHovered ? 'scale-105 shadow-2xl z-20' : 'hover:scale-[1.02]'}
                                                        `}
                                                        style={{
                                                            left: item.left + 2,
                                                            width: item.width,
                                                            height: ROW_HEIGHT - 8,
                                                            top: 4,
                                                        }}
                                                        onClick={() => onCardClick?.(item)}
                                                        onMouseDown={(e) => handleDragStart(e, item, 'move')}
                                                        onMouseEnter={() => setHoveredItem(item.id)}
                                                        onMouseLeave={() => setHoveredItem(null)}
                                                    >
                                                        {/* Background with gradient */}
                                                        <div className={`absolute inset-0 ${stageColor.bg} rounded-lg`}></div>

                                                        {/* Progress Overlay */}
                                                        {item.progress > 0 && (
                                                            <div
                                                                className="absolute inset-y-0 left-0 bg-white/20 rounded-l-lg"
                                                                style={{ width: `${item.progress}%` }}
                                                            />
                                                        )}

                                                        {/* Content */}
                                                        <div className="relative z-10 flex items-center gap-2 px-3 h-full">
                                                            {/* Format icon */}
                                                            {format && (
                                                                <format.icon className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                                                            )}

                                                            {/* Title & Client */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-white truncate">
                                                                    {item.title}
                                                                </div>
                                                                {item.client && (() => {
                                                                    const clientLogo = getClientLogo(item.client);
                                                                    return (
                                                                        <div className="text-[9px] text-white/60 truncate flex items-center gap-1">
                                                                            {clientLogo ? (
                                                                                <img
                                                                                    src={clientLogo}
                                                                                    alt={item.client}
                                                                                    className="w-3.5 h-3.5 rounded-sm object-cover"
                                                                                />
                                                                            ) : (
                                                                                <Tag className="w-2 h-2" />
                                                                            )}
                                                                            {item.client}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>

                                                            {/* Status indicators */}
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                {item.progress > 0 && (
                                                                    <span className="text-[9px] text-white/80 font-bold bg-black/20 px-1.5 py-0.5 rounded">
                                                                        {Math.round(item.progress)}%
                                                                    </span>
                                                                )}
                                                                {item.isOverdue && (
                                                                    <span className="text-[8px] text-white bg-red-500 px-1.5 py-0.5 rounded font-bold">
                                                                        OVERDUE
                                                                    </span>
                                                                )}
                                                                {item.isSoon && !item.isOverdue && (
                                                                    <span className="text-[8px] text-white bg-amber-500 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                                                        <Clock className="w-2 h-2" />
                                                                        {item.daysRemaining}d
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Resize Handle (right edge) */}
                                                        <div
                                                            className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/40 rounded-r-lg transition-opacity"
                                                            onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, item, 'resize-end'); }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Professional Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-white-smoke/10 bg-onyx/50">
                {/* Legend */}
                <div className="flex items-center gap-4">
                    {Object.entries(STAGE_COLORS).map(([stage, colors]) => (
                        <div key={stage} className="flex items-center gap-1.5">
                            <div className={`w-4 h-2.5 rounded ${colors.solid}`}></div>
                            <span className="text-[10px] text-white-smoke/50 capitalize font-medium">{stage}</span>
                        </div>
                    ))}
                </div>

                {/* Instructions */}
                <div className="flex items-center gap-4 text-[10px] text-white-smoke/30">
                    <span className="flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" />
                        <ArrowRight className="w-3 h-3" />
                        Navigate
                    </span>
                    <span>Drag to move • Drag edges to resize</span>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
