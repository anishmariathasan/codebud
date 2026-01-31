/**
 * VoiceButton - Large circular button to start/stop voice session
 */

import React from 'react';

interface VoiceButtonProps {
    isConnected: boolean;
    isActive: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
    // isConnected is available for future use but currently unused
    isActive,
    onStart,
    onStop,
    disabled,
}) => {
    const handleClick = () => {
        if (disabled) return;
        if (isActive) {
            onStop();
        } else {
            onStart();
        }
    };

    const getBackgroundColor = () => {
        if (disabled) return '#30363d';
        if (isActive) return '#f85149';
        return '#3fb950';
    };

    const getBoxShadow = () => {
        if (disabled) return 'none';
        if (isActive) {
            return `
        0 0 30px rgba(248, 81, 73, 0.4),
        0 0 60px rgba(248, 81, 73, 0.2),
        inset 0 0 20px rgba(255, 255, 255, 0.1)
      `;
        }
        return '0 8px 30px rgba(63, 185, 80, 0.3)';
    };

    const buttonStyle: React.CSSProperties = {
        width: '130px',
        height: '130px',
        borderRadius: '50%',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: getBackgroundColor(),
        color: disabled ? '#8b949e' : '#ffffff',
        fontSize: '18px',
        fontWeight: 700,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: getBoxShadow(),
        opacity: disabled ? 0.6 : 1,
        animation: isActive ? 'pulse 2s infinite' : 'none',
    };

    const iconStyle: React.CSSProperties = {
        fontSize: '36px',
    };

    const labelStyle: React.CSSProperties = {
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontSize: '12px',
    };

    // Inject keyframes for pulse animation
    React.useEffect(() => {
        const styleId = 'voice-button-keyframes';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        @keyframes pulse {
          0%, 100% {
            box-shadow: 
              0 0 30px rgba(248, 81, 73, 0.4),
              0 0 60px rgba(248, 81, 73, 0.2);
          }
          50% {
            box-shadow: 
              0 0 50px rgba(248, 81, 73, 0.6),
              0 0 100px rgba(248, 81, 73, 0.3);
          }
        }
      `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <button
            style={buttonStyle}
            onClick={handleClick}
            disabled={disabled}
            title={
                disabled
                    ? 'Voice unavailable'
                    : isActive
                        ? 'Click to stop'
                        : 'Click to start'
            }
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            <span style={iconStyle}>{isActive ? '⏹️' : '🎤'}</span>
            <span style={labelStyle}>{isActive ? 'Stop' : 'Start'}</span>
        </button>
    );
};
