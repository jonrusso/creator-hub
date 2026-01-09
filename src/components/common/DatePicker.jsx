import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

/**
 * DatePicker - Professional calendar popup for date selection
 */
const DatePicker = ({ value, onChange, label, placeholder = 'Select date' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) return new Date(value);
        return new Date();
    });
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update view when value changes
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    const selectedDate = value ? new Date(value) : null;

    const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate calendar days
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonth = new Date(year, month, 0);
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonth.getDate() - i),
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next month days
        const remaining = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (date) => {
        const formatted = date.toISOString().split('T')[0];
        onChange(formatted);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const days = getDaysInMonth(viewDate);

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label className="text-xs uppercase tracking-wider text-white-smoke/40 font-bold mb-2 block">
                    {label}
                </label>
            )}

            {/* Input Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-cyan-blue/50 p-2.5 rounded-lg text-left text-sm outline-none border border-white-smoke/5 hover:border-orange-brand/30 focus:border-orange-brand/50 transition-all flex items-center justify-between"
            >
                <span className={value ? 'text-white-smoke' : 'text-white-smoke/40'}>
                    {formatDisplayDate(value) || placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-white-smoke/10 rounded text-white-smoke/40 hover:text-white-smoke"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                    <Calendar className="w-4 h-4 text-white-smoke/40" />
                </div>
            </button>

            {/* Calendar Popup */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-onyx border border-white-smoke/10 rounded-xl shadow-2xl p-4 min-w-[280px] animate-fadeIn">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-white-smoke/10 rounded-lg text-white-smoke/60 hover:text-white-smoke"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <select
                                value={viewDate.getMonth()}
                                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                                className="bg-transparent text-white-smoke font-medium text-sm appearance-none cursor-pointer hover:text-orange-brand"
                            >
                                {MONTHS.map((month, i) => (
                                    <option key={month} value={i} className="bg-onyx">{month}</option>
                                ))}
                            </select>
                            <select
                                value={viewDate.getFullYear()}
                                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                                className="bg-transparent text-white-smoke font-medium text-sm appearance-none cursor-pointer hover:text-orange-brand"
                            >
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                    <option key={year} value={year} className="bg-onyx">{year}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-white-smoke/10 rounded-lg text-white-smoke/60 hover:text-white-smoke"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-white-smoke/40 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectDate(day.date)}
                                className={`
                                    w-8 h-8 rounded-lg text-xs font-medium transition-all
                                    ${!day.isCurrentMonth ? 'text-white-smoke/20' : 'text-white-smoke/70 hover:text-white-smoke'}
                                    ${isToday(day.date) && !isSelected(day.date) ? 'ring-1 ring-orange-brand/50' : ''}
                                    ${isSelected(day.date) ? 'bg-orange-brand text-white-smoke font-bold' : 'hover:bg-white-smoke/10'}
                                `}
                            >
                                {day.date.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-white-smoke/10">
                        <button
                            type="button"
                            onClick={() => handleSelectDate(new Date())}
                            className="flex-1 px-3 py-1.5 text-xs font-medium bg-orange-brand/20 text-orange-brand rounded-lg hover:bg-orange-brand/30"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                handleSelectDate(tomorrow);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs font-medium bg-white-smoke/5 text-white-smoke/60 rounded-lg hover:bg-white-smoke/10"
                        >
                            Tomorrow
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const nextWeek = new Date();
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                handleSelectDate(nextWeek);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs font-medium bg-white-smoke/5 text-white-smoke/60 rounded-lg hover:bg-white-smoke/10"
                        >
                            +7 Days
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
