import React from 'react';

/**
 * Glassmorphism card component with optional glow effects
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {string} glowColor - 'orange' or 'violet' for border glow on hover
 * @param {boolean} noPadding - Remove default padding
 */
const GlassCard = ({
    children,
    className = '',
    glowColor = null,
    noPadding = false,
    onClick = null
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const baseStyles = {
        background: 'rgba(15, 15, 15, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        transition: 'all 0.3s ease'
    };

    const getHoverStyles = () => {
        if (!glowColor || !isHovered) return {};

        const glowColors = {
            orange: {
                border: '1px solid rgba(255, 155, 76, 0.4)',
                boxShadow: '0 0 30px rgba(255, 155, 76, 0.2)'
            },
            violet: {
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)'
            }
        };

        return glowColors[glowColor] || {};
    };

    const combinedStyles = {
        ...baseStyles,
        ...getHoverStyles(),
        padding: noPadding ? '0' : '16px'
    };

    return (
        <div
            className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={combinedStyles}
            onMouseEnter={() => glowColor && setIsHovered(true)}
            onMouseLeave={() => glowColor && setIsHovered(false)}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default GlassCard;
