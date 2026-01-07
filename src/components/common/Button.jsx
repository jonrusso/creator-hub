import React from 'react';

/**
 * Reusable button component with variants and loading state
 * @param {React.ReactNode} children - Button content
 * @param {string} variant - 'primary', 'secondary', or 'ghost'
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {string} type - Button type (button, submit, reset)
 */
const Button = ({
    children,
    variant = 'primary',
    onClick,
    disabled = false,
    loading = false,
    type = 'button',
    className = '',
    icon = null
}) => {
    const baseClasses = 'font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2';

    const variantClasses = {
        primary: 'bg-orange-brand hover:bg-orange-brand/90 text-white-smoke shadow-lg hover:shadow-orange-brand/20',
        secondary: 'bg-white-smoke/10 hover:bg-white-smoke/20 text-white-smoke border border-white-smoke/10',
        ghost: 'text-white-smoke/60 hover:text-white-smoke hover:bg-white-smoke/5'
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseClasses}
                ${variantClasses[variant] || variantClasses.primary}
                ${(disabled || loading) ? disabledClasses : ''}
                ${className}
            `}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && icon}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
