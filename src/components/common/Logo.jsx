import React from 'react';

/**
 * Logo component with two variants: primary (large with branding) and icon (small)
 * @param {string} variant - 'primary' or 'icon' (default: 'icon')
 * @param {string} className - Additional CSS classes
 */
const Logo = ({ variant = 'icon', className = '' }) => {
    if (variant === 'primary') {
        return (
            <div className={`flex flex-col items-center ${className} relative`}>
                {/* Exclusivity Badge - Top Right Corner */}
                <div className="absolute -top-4 right-0 md:right-8">
                    <div className="bg-gradient-to-r from-orange-brand to-violet-brand px-4 py-1 rounded-full shadow-lg">
                        <span className="text-[9px] font-bold tracking-widest text-white-smoke uppercase">Crew Only</span>
                    </div>
                </div>

                <div className="w-32 h-32 mb-4 flex items-center justify-center relative overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-brand/20 to-violet-brand/20 blur-3xl rounded-full scale-150"></div>
                    <img src="/logo.png" alt="Creators Hub" className="w-full h-full object-contain relative z-10" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-white-smoke font-heading text-2xl font-bold tracking-[0.2em] uppercase">
                        Creators <span className="text-orange-brand">Hub</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-white-smoke/20"></div>
                        <p className="text-white-smoke/50 font-body text-xs tracking-wider uppercase font-semibold">
                            Craft • Collaborate • Command
                        </p>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-white-smoke/20"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-10 h-10 flex items-center justify-center ${className}`}>
            <img src="/logo.png" alt="Creators Hub" className="w-full h-full object-contain" />
        </div>
    );
};

export default Logo;
