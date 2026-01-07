import React from 'react';

/**
 * Styled input component with glassmorphism design
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Required field
 */
const Input = ({
    type = 'text',
    label = '',
    value,
    onChange,
    placeholder = '',
    required = false,
    className = ''
}) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-white-smoke/60 text-xs mb-1">
                    {label} {required && <span className="text-orange-brand">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-cyan-blue border border-white-smoke/10 rounded-lg p-3 text-white-smoke focus:border-orange-brand outline-none transition-colors"
            />
        </div>
    );
};

export default Input;
