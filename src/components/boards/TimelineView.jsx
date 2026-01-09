import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * TimelineView - Gantt-style timeline visualization for production cards
 */
const TimelineView = ({ items, onCardClick }) => {
    const [viewOffset, setViewOffset] = useState(0); // Days offset from today
    const VISIBLE_DAYS = 21; // 3 weeks visible at once

    // Generate array of dates for the timeline header
    const dates = useMemo(() => {
        const today = new Date();
        const result = [];
        for (let i = 0; i < VISIBLE_DAYS; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + viewOffset + i);
            result.push(date);
        }
        return result;
    }, [viewOffset]);

    // Filter items that have dates and calculate positions
    const timelineItems = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return items
            .filter(item => item.startDate || item.dueDate)
            .map(item => {
                const startDate = item.startDate ? new Date(item.startDate) : (item.dueDate ? new Date(item.dueDate) : null);
                const endDate = item.dueDate ? new Date(item.dueDate) : (item.startDate ? new Date(item.startDate) : null);

                if (!startDate || !endDate) return null;

                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                const viewStart = new Date(today);
                viewStart.setDate(viewStart.getDate() + viewOffset);
                viewStart.setHours(0, 0, 0, 0);

                const viewEnd = new Date(viewStart);
                viewEnd.setDate(viewEnd.getDate() + VISIBLE_DAYS);

                // Calculate position as percentage of view
                const dayWidth = 100 / VISIBLE_DAYS;
                const startOffset = Math.floor((startDate - viewStart) / (1000 * 60 * 60 * 24));
                const endOffset = Math.floor((endDate - viewStart) / (1000 * 60 * 60 * 24));

                const left = Math.max(0, startOffset * dayWidth);
                const right = Math.min(100, (endOffset + 1) * dayWidth);
                const width = right - left;

                // Don't show if completely outside view
                if (right <= 0 || left >= 100) return null;

                // Check if overdue
                const isOverdue = endDate < today;
                const isSoon = !isOverdue && (endDate - today) / (1000 * 60 * 60 * 24) <= 3;

                return {
                    ...item,
                    left: `${left}%`,
                    width: `${width}%`,
                    isOverdue,
                    isSoon
                };
            })
            .filter(Boolean);
    }, [items, viewOffset]);

    // Get color based on stage
    const getStageColor = (stage) => {
        switch (stage) {
            case 'scripting': return 'bg-blue-500/80';
            case 'production': return 'bg-violet-brand/80';
            case 'qa': return 'bg-emerald-500/80';
            case 'published': return 'bg-green-500/80';
            default: return 'bg-white-smoke/30';
        }
    };

    const formatDateHeader = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const isToday = date.getTime() === today.getTime();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();

        return { dayName, dayNum, isToday, isWeekend: date.getDay() === 0 || date.getDay() === 6 };
    };

    const handlePrev = () => setViewOffset(prev => prev - 7);
    const handleNext = () => setViewOffset(prev => prev + 7);
    const handleToday = () => setViewOffset(0);

    // Group items by row to prevent overlap
    const rows = useMemo(() => {
        const result = [];
        timelineItems.forEach(item => {
            let placed = false;
            for (let row of result) {
                // Check if item overlaps with any item in this row
                const overlaps = row.some(existing => {
                    const itemLeft = parseFloat(item.left);
                    const itemRight = itemLeft + parseFloat(item.width);
                    const existingLeft = parseFloat(existing.left);
                    const existingRight = existingLeft + parseFloat(existing.width);
                    return !(itemRight <= existingLeft || itemLeft >= existingRight);
                });
                if (!overlaps) {
                    row.push(item);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                result.push([item]);
            }
        });
        return result;
    }, [timelineItems]);

    return (
        <div className="h-full flex flex-col">
            {/* Timeline Header Controls */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        className="p-2 hover:bg-white-smoke/10 rounded-lg text-white-smoke/60 hover:text-white-smoke"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-3 py-1.5 text-xs font-medium bg-orange-brand/20 text-orange-brand rounded-lg hover:bg-orange-brand/30 flex items-center gap-1"
                    >
                        <Calendar className="w-3 h-3" /> Today
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-2 hover:bg-white-smoke/10 rounded-lg text-white-smoke/60 hover:text-white-smoke"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-sm text-white-smoke/50">
                    {dates[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Date Headers */}
            <div className="flex border-b border-white-smoke/10 mb-2">
                {dates.map((date, i) => {
                    const { dayName, dayNum, isToday, isWeekend } = formatDateHeader(date);
                    return (
                        <div
                            key={i}
                            className={`flex-1 text-center py-2 text-xs ${isToday
                                    ? 'bg-orange-brand/20 text-orange-brand font-bold'
                                    : isWeekend
                                        ? 'text-white-smoke/30'
                                        : 'text-white-smoke/50'
                                }`}
                        >
                            <div className="text-[10px]">{dayName}</div>
                            <div className="font-medium">{dayNum}</div>
                        </div>
                    );
                })}
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-y-auto">
                {/* Grid Lines */}
                <div className="relative">
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        {dates.map((date, i) => {
                            const { isToday, isWeekend } = formatDateHeader(date);
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 border-r ${isToday
                                            ? 'border-orange-brand/50'
                                            : isWeekend
                                                ? 'border-white-smoke/5'
                                                : 'border-white-smoke/10'
                                        }`}
                                />
                            );
                        })}
                    </div>

                    {/* Timeline Rows */}
                    <div className="relative min-h-[200px]">
                        {rows.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-white-smoke/40 text-sm">
                                No cards with dates. Add start/due dates to cards to see them here.
                            </div>
                        ) : (
                            rows.map((row, rowIndex) => (
                                <div key={rowIndex} className="relative h-12 mb-2">
                                    {row.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => onCardClick?.(item)}
                                            className={`absolute top-1 h-10 rounded-lg cursor-pointer transition-all hover:ring-2 hover:ring-orange-brand/50 flex items-center px-3 overflow-hidden ${item.isOverdue
                                                    ? 'bg-red-500/80 ring-1 ring-red-400'
                                                    : item.isSoon
                                                        ? 'bg-yellow-500/80'
                                                        : getStageColor(item.stage)
                                                }`}
                                            style={{ left: item.left, width: item.width }}
                                        >
                                            <span className="text-xs font-medium text-white truncate">
                                                {item.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 px-2 text-xs text-white-smoke/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500/80"></div> Scripting
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-violet-brand/80"></div> Production
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500/80"></div> QA
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/80"></div> Overdue
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500/80"></div> Due Soon
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
