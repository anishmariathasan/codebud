/**
 * ModeToggle - Pill button to toggle between driver and navigator modes
 */

import React from 'react';

interface ModeToggleProps {
    mode: 'driver' | 'navigator';
    onToggle: () => void;
    disabled: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
    mode,
    onToggle,
    disabled,
}) => {
    const isNavigator = mode === 'navigator';

    const buttonStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 24px',
        borderRadius: '30px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: disabled
            ? '#30363d'
            : isNavigator
                ? '#58a6ff'
                : '#f85149',
        color: disabled ? '#8b949e' : '#ffffff',
        fontSize: '16px',
        fontWeight: 600,
        opacity: disabled ? 0.6 : 1,
        boxShadow: disabled
            ? 'none'
            : isNavigator
                ? '0 4px 20px rgba(88, 166, 255, 0.3)'
                : '0 4px 20px rgba(248, 81, 73, 0.3)',
    };

    const iconStyle: React.CSSProperties = {
        fontSize: '20px',
    };

    const textContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    };

    const modeNameStyle: React.CSSProperties = {
        textTransform: 'uppercase',
        letterSpacing: '1px',
    };

    const descriptionStyle: React.CSSProperties = {
        fontSize: '11px',
        opacity: 0.8,
        fontWeight: 400,
        marginTop: '2px',
    };

    return (
        <button
            style={buttonStyle}
            onClick={onToggle}
            disabled={disabled}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            <span style={iconStyle}>{isNavigator ? '👁️' : '✏️'}</span>
            <div style={textContainerStyle}>
                <span style={modeNameStyle}>{mode}</span>
                <span style={descriptionStyle}>
                    {isNavigator ? 'AI observes & advises' : 'AI can edit code'}
                </span>
            </div>
        </button>
    );
};
