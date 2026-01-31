/**
 * StatusBar - Shows connection status indicators
 */

import React from 'react';

interface StatusBarProps {
    isExtensionConnected: boolean;
    voiceStatus: 'disconnected' | 'connected' | 'error';
    agentConfigured: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
    isExtensionConnected,
    voiceStatus,
    agentConfigured,
}) => {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '20px',
        padding: '12px 16px',
        backgroundColor: '#161b22',
        borderRadius: '8px',
        marginBottom: '20px',
    };

    const indicatorStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#8b949e',
    };

    const dotStyle = (status: 'connected' | 'disconnected' | 'pending'): React.CSSProperties => ({
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor:
            status === 'connected'
                ? '#3fb950'
                : status === 'disconnected'
                    ? '#f85149'
                    : '#8b949e',
        boxShadow:
            status === 'connected'
                ? '0 0 8px rgba(63, 185, 80, 0.5)'
                : status === 'disconnected'
                    ? '0 0 8px rgba(248, 81, 73, 0.5)'
                    : 'none',
    });

    const getVoiceDotStatus = (): 'connected' | 'disconnected' | 'pending' => {
        if (voiceStatus === 'connected') return 'connected';
        if (voiceStatus === 'error') return 'disconnected';
        return 'pending';
    };

    return (
        <div style={containerStyle}>
            <div style={indicatorStyle}>
                <div style={dotStyle(isExtensionConnected ? 'connected' : 'disconnected')} />
                <span>VS Code</span>
            </div>
            <div style={indicatorStyle}>
                <div style={dotStyle(getVoiceDotStatus())} />
                <span>Voice</span>
            </div>
            <div style={indicatorStyle}>
                <div style={dotStyle(agentConfigured ? 'connected' : 'pending')} />
                <span>Agent</span>
            </div>
        </div>
    );
};
