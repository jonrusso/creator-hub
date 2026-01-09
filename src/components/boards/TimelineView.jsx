import React, { useState, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Users, Layers, Film, Star, Smartphone, Tag } from 'lucide-react';

// Format definitions (same as ProductionBoard)
const VIDEO_FORMATS = {
    'long-form': { label: 'Long-Form', icon: Film, color: 'bg-blue-500' },
    'hero-video': { label: 'Hero', icon: Star, color: 'bg-amber-500' },
    'bts-short': { label: 'BTS', icon: Smartphone, color: 'bg-pink-500' },
};

// Stage colors (ShotGrid-style pipeline colors)
const STAGE_COLORS = {
    'scripting': { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400' },
    'production': { bg: 'bg-violet-600', border: 'border-violet-500', text: 'text-violet-400' },
    'qa': { bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400' },
    'published': { bg: 'bg-green-600', border: 'border-green-500', text: 'text-green-400' },
};

/**
 * TimelineView - Professional Gantt-style timeline (ShotGrid-inspired)
 */
const TimelineView = ({ items, onCardClick, onUpdateCard }) => {
    const [viewOffset, setViewOffset] = useState(0);
    const [viewScale, setViewScale] = useState('week'); // 'week' | 'day'
    const [filterStage, setFilterStage] = useState(null);
    const [groupBy, setGroupBy] = useState(null); // null | 'assignee' | 'stage'
    const [dragging, setDragging] = useState(null);
    const containerRef = useRef(null);

    const VISIBLE_DAYS = viewScale === 'week' ? 21 : 7;
    const DAY_WIDTH = viewScale === 'week' ? 40 : 80; // pixels per day

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

        return items
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
                const width = Math.max((endOffset - startOffset + 1) * DAY_WIDTH, DAY_WIDTH);

                const isOverdue = endDate < today;
                const isSoon = !isOverdue && (endDate - today) / (1000 * 60 * 60 * 24) <= 3;

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
                    progress,
                    startOffset,
                    endOffset
                };
            })
            .filter(item => item.left + item.width > 0 && item.left < VISIBLE_DAYS * DAY_WIDTH);
    }, [items, viewOffset, filterStage, DAY_WIDTH, VISIBLE_DAYS]);

    // Group items
    const groupedItems = useMemo(() => {
        if (!groupBy) return { 'All Cards': timelineItems };

        return timelineItems.reduce((acc, item) => {
            const key = item[groupBy] || 'Unassigned';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [timelineItems, groupBy]);

    const formatDateHeader = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const isToday = date.getTime() === today.getTime();
        const dayNum = date.getDate();
        const dayName = viewScale === 'week'
            ? date.toLocaleDateString('en-US', { weekday: 'narrow' })
            : date.toLocaleDateString('en-US', { weekday: 'short' });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return { dayName, dayNum, isToday, isWeekend };
    };

    const handlePrev = () => setViewOffset(prev => prev - (viewScale === 'week' ? 7 : 1));
    const handleNext = () => setViewOffset(prev => prev + (viewScale === 'week' ? 7 : 1));
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
            // Move entire bar
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
            // Resize from right edge
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

    return (
        <div
            className="h-full flex flex-col bg-cyan-blue/20 rounded-xl border border-white-smoke/5"
            ref={containerRef}
            onMouseMove={dragging ? handleDrag : undefined}
            onMouseUp={dragging ? handleDragEnd : undefined}
            onMouseLeave={dragging ? handleDragEnd : undefined}
        >
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 border-b border-white-smoke/10">
                <div className="flex items-center gap-3">
                    <button onClick={handlePrev} className="p-2 hover:bg-white-smoke/10 rounded-lg text-white-smoke/60 hover:text-white-smoke">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleToday} className="px-3 py-1.5 text-xs font-medium bg-orange-brand/20 text-orange-brand rounded-lg hover:bg-orange-brand/30 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Today
                    </button>
                    <button onClick={handleNext} className="p-2 hover:bg-white-smoke/10 rounded-lg text-white-smoke/60 hover:text-white-smoke">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-white-smoke/50 ml-2">{dates[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Scale Toggle */}
                    <div className="bg-onyx p-0.5 rounded-lg flex border border-white-smoke/10">
                        <button
                            onClick={() => setViewScale('day')}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${viewScale === 'day' ? 'bg-orange-brand/20 text-orange-brand' : 'text-white-smoke/40'}`}
                        >Day</button>
                        <button
                            onClick={() => setViewScale('week')}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${viewScale === 'week' ? 'bg-orange-brand/20 text-orange-brand' : 'text-white-smoke/40'}`}
                        >Week</button>
                    </div>

                    {/* Filter by Stage */}
                    <div className="relative">
                        <select
                            value={filterStage || ''}
                            onChange={(e) => setFilterStage(e.target.value || null)}
                            className="appearance-none bg-onyx border border-white-smoke/10 rounded-lg px-3 py-1.5 text-[10px] text-white-smoke/60 font-bold pr-8"
                        >
                            <option value="">All Stages</option>
                            <option value="scripting">Scripting</option>
                            <option value="production">Production</option>
                            <option value="qa">QA</option>
                        </select>
                        <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white-smoke/40 pointer-events-none" />
                    </div>

                    {/* Group By */}
                    <div className="relative">
                        <select
                            value={groupBy || ''}
                            onChange={(e) => setGroupBy(e.target.value || null)}
                            className="appearance-none bg-onyx border border-white-smoke/10 rounded-lg px-3 py-1.5 text-[10px] text-white-smoke/60 font-bold pr-8"
                        >
                            <option value="">No Grouping</option>
                            <option value="assignee">By Assignee</option>
                            <option value="stage">By Stage</option>
                        </select>
                        <Users className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white-smoke/40 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Date Headers */}
            <div className="flex border-b border-white-smoke/10 overflow-hidden" style={{ paddingLeft: groupBy ? 120 : 0 }}>
                {dates.map((date, i) => {
                    const { dayName, dayNum, isToday, isWeekend } = formatDateHeader(date);
                    return (
                        <div
                            key={i}
                            style={{ width: DAY_WIDTH, flexShrink: 0 }}
                            className={`text-center py-2 text-xs ${isToday ? 'bg-orange-brand/20 text-orange-brand font-bold' :
                                    isWeekend ? 'text-white-smoke/20' : 'text-white-smoke/40'
                                }`}
                        >
                            <div className="text-[9px]">{dayName}</div>
                            <div className="font-medium">{dayNum}</div>
                        </div>
                    );
                })}
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto">
                {Object.entries(groupedItems).map(([group, groupItems]) => (
                    <div key={group}>
                        {/* Group Header */}
                        {groupBy && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-onyx/50 border-b border-white-smoke/5">
                                <div className="text-xs font-bold text-white-smoke/60 uppercase tracking-wider">{group}</div>
                                <span className="text-[10px] text-white-smoke/30 bg-white-smoke/5 px-2 py-0.5 rounded-full">{groupItems.length}</span>
                            </div>
                        )}

                        {/* Items */}
                        <div className="relative" style={{ paddingLeft: groupBy ? 120 : 0 }}>
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex pointer-events-none" style={{ left: groupBy ? 120 : 0 }}>
                                {dates.map((date, i) => {
                                    const { isToday, isWeekend } = formatDateHeader(date);
                                    return (
                                        <div
                                            key={i}
                                            style={{ width: DAY_WIDTH }}
                                            className={`flex-shrink-0 border-r h-full ${isToday ? 'border-orange-brand/40 bg-orange-brand/5' :
                                                    isWeekend ? 'border-white-smoke/5 bg-white-smoke/[0.02]' :
                                                        'border-white-smoke/5'
                                                }`}
                                        />
                                    );
                                })}
                            </div>

                            {groupItems.length === 0 ? (
                                <div className="flex items-center justify-center h-20 text-white-smoke/30 text-xs">
                                    No cards to display
                                </div>
                            ) : (
                                groupItems.map(item => {
                                    const stageColor = STAGE_COLORS[item.stage] || STAGE_COLORS.scripting;
                                    const format = VIDEO_FORMATS[item.format];

                                    return (
                                        <div key={item.id} className="relative h-10 my-1 flex items-center">
                                            {/* Card Label (if grouped) */}
                                            {groupBy && (
                                                <div className="absolute left-0 w-[116px] px-2 text-[10px] text-white-smoke/60 truncate flex items-center gap-1">
                                                    {format && <format.icon className="w-3 h-3" />}
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                            )}

                                            {/* Timeline Bar */}
                                            <div
                                                className={`absolute h-7 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-white/30 flex items-center overflow-hidden group ${item.isOverdue ? 'ring-1 ring-red-500' : ''
                                                    }`}
                                                style={{
                                                    left: item.left + (groupBy ? 0 : 0),
                                                    width: item.width,
                                                }}
                                                onClick={() => onCardClick?.(item)}
                                                onMouseDown={(e) => handleDragStart(e, item, 'move')}
                                            >
                                                {/* Background */}
                                                <div className={`absolute inset-0 ${stageColor.bg} opacity-80`}></div>

                                                {/* Progress Overlay */}
                                                {item.progress > 0 && (
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-white/20"
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                )}

                                                {/* Content */}
                                                <div className="relative z-10 flex items-center gap-1.5 px-2 w-full">
                                                    {item.client && (
                                                        <div className="text-[8px] bg-black/30 text-white px-1 py-0.5 rounded flex items-center gap-0.5">
                                                            <Tag className="w-2 h-2" />
                                                            {item.client}
                                                        </div>
                                                    )}
                                                    {!groupBy && (
                                                        <span className="text-[10px] font-medium text-white truncate flex-1">{item.title}</span>
                                                    )}
                                                    {item.progress > 0 && (
                                                        <span className="text-[8px] text-white/70 ml-auto">{Math.round(item.progress)}%</span>
                                                    )}
                                                </div>

                                                {/* Resize Handle (right edge) */}
                                                <div
                                                    className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30"
                                                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, item, 'resize-end'); }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend Footer */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-white-smoke/10 text-[10px] text-white-smoke/40">
                {Object.entries(STAGE_COLORS).map(([stage, colors]) => (
                    <div key={stage} className="flex items-center gap-1.5">
                        <div className={`w-3 h-2 rounded-sm ${colors.bg}`}></div>
                        <span className="capitalize">{stage}</span>
                    </div>
                ))}
                <div className="ml-auto text-white-smoke/30">Drag bars to reschedule • Drag edges to resize</div>
            </div>
        </div>
    );
};

export default TimelineView;
