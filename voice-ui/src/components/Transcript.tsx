/**
 * Transcript - Scrollable conversation history
 */

import React, { useRef, useEffect } from 'react';

export interface TranscriptEntry {
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

interface TranscriptProps {
    entries: TranscriptEntry[];
}

export const Transcript: React.FC<TranscriptProps> = ({ entries }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new entries are added
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [entries]);

    const containerStyle: React.CSSProperties = {
        backgroundColor: '#161b22',
        borderRadius: '12px',
        padding: '16px',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #30363d',
    };

    const emptyStyle: React.CSSProperties = {
        color: '#8b949e',
        textAlign: 'center',
        padding: '40px 20px',
        fontSize: '14px',
    };

    const entryStyle = (role: 'user' | 'assistant'): React.CSSProperties => ({
        marginBottom: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: role === 'user' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(88, 166, 255, 0.1)',
        borderLeft: `3px solid ${role === 'user' ? '#3fb950' : '#58a6ff'}`,
    });

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    };

    const roleStyle = (role: 'user' | 'assistant'): React.CSSProperties => ({
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: role === 'user' ? '#3fb950' : '#58a6ff',
    });

    const timeStyle: React.CSSProperties = {
        fontSize: '11px',
        color: '#8b949e',
    };

    const textStyle: React.CSSProperties = {
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#e6edf3',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (entries.length === 0) {
        return (
            <div style={containerStyle}>
                <div style={emptyStyle}>
                    No messages yet. Start a conversation!
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={containerStyle}>
            {entries.map((entry, index) => (
                <div key={index} style={entryStyle(entry.role)}>
                    <div style={headerStyle}>
                        <span style={roleStyle(entry.role)}>
                            {entry.role === 'user' ? '🎤 You' : '🤖 CodeBud'}
                        </span>
                        <span style={timeStyle}>{formatTime(entry.timestamp)}</span>
                    </div>
                    <div style={textStyle}>{entry.text}</div>
                </div>
            ))}
        </div>
    );
};
