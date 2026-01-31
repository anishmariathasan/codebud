/**
 * SpeakingIndicator - Animated waveform when AI is speaking
 */

import React from 'react';

interface SpeakingIndicatorProps {
    isSpeaking: boolean;
}

export const SpeakingIndicator: React.FC<SpeakingIndicatorProps> = ({
    isSpeaking,
}) => {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        height: '40px',
        opacity: isSpeaking ? 1 : 0,
        transition: 'opacity 0.3s ease',
    };

    const barStyle = (index: number): React.CSSProperties => ({
        width: '4px',
        borderRadius: '2px',
        backgroundColor: '#58a6ff',
        animation: isSpeaking ? `waveform 0.6s ease-in-out infinite` : 'none',
        animationDelay: `${index * 0.1}s`,
        height: '20px',
    });

    // Inject keyframes for waveform animation
    React.useEffect(() => {
        const styleId = 'speaking-indicator-keyframes';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        @keyframes waveform {
          0%, 100% {
            height: 10px;
            opacity: 0.5;
          }
          50% {
            height: 30px;
            opacity: 1;
          }
        }
      `;
            document.head.appendChild(style);
        }
    }, []);

    if (!isSpeaking) {
        return <div style={{ height: '40px' }} />;
    }

    return (
        <div style={containerStyle}>
            {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} style={barStyle(index)} />
            ))}
        </div>
    );
};
