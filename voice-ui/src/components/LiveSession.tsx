import React from 'react';
import { StatusBar } from './StatusBar';
import { ModeToggle } from './ModeToggle';
import { VoiceButton } from './VoiceButton';
import { SpeakingIndicator } from './SpeakingIndicator';
import { Transcript, TranscriptEntry } from './Transcript';

interface LiveSessionProps {
    mode: 'driver' | 'navigator';
    onModeToggle: () => void;
    extensionConnected: boolean;
    voiceStatus: 'disconnected' | 'connected' | 'error';
    isVoiceActive: boolean;
    agentConfigured: boolean;
    startConversation: () => void;
    stopConversation: () => void;
    isSpeaking: boolean;
    monitoringStatus: string;
    secondsSinceLastChange: number;
    lastToolCalled: string | null;
    transcript: TranscriptEntry[];
}

export const LiveSession: React.FC<LiveSessionProps> = ({
    mode,
    onModeToggle,
    extensionConnected,
    voiceStatus,
    isVoiceActive,
    agentConfigured,
    startConversation,
    stopConversation,
    isSpeaking,
    monitoringStatus,
    secondsSinceLastChange,
    lastToolCalled,
    transcript
}) => {
    const warningStyle: React.CSSProperties = {
        backgroundColor: 'rgba(210, 153, 34, 0.1)',
        border: '1px solid #d29922',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#d29922',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px'
    };

    const monitorBadgeStyle: React.CSSProperties = {
        padding: '4px 12px',
        backgroundColor: monitoringStatus.includes('Typing') ? 'rgba(88, 166, 255, 0.2)' : 'rgba(63, 185, 80, 0.2)',
        borderRadius: '12px',
        color: monitoringStatus.includes('Typing') ? '#58a6ff' : '#3fb950',
        fontSize: '11px',
        fontWeight: 600,
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#e6edf3', marginBottom: '8px' }}>
                        Live Session
                    </h2>
                    <p style={{ color: '#8b949e', fontSize: '14px' }}>
                        Real-time collaboration with your AI pair programmer.
                    </p>
                </div>
                <StatusBar
                    isExtensionConnected={extensionConnected}
                    voiceStatus={voiceStatus}
                    agentConfigured={agentConfigured}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '24px' }}>
                {/* Control Panel */}
                <div style={{
                    backgroundColor: '#161b22', // GitHub Canvas Subtler
                    borderRadius: '16px',
                    border: '1px solid #30363d',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    height: 'fit-content'
                }}>
                    {!agentConfigured && (
                        <div style={warningStyle}>
                            <span>⚠️</span>
                            <span>Agent not configured. Set VITE_ELEVENLABS_AGENT_ID in .env</span>
                        </div>
                    )}

                    {!extensionConnected && (
                        <div style={warningStyle}>
                            <span>⚠️</span>
                            <span>VS Code extension not detected.</span>
                        </div>
                    )}

                    <ModeToggle
                        mode={mode}
                        onToggle={onModeToggle}
                        disabled={!extensionConnected}
                    />

                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: isVoiceActive ? 'radial-gradient(circle, rgba(63, 185, 80, 0.15) 0%, transparent 70%)' : 'transparent',
                            transition: 'background 0.5s ease'
                        }} />
                        <VoiceButton
                            isConnected={voiceStatus === 'connected'}
                            isActive={isVoiceActive}
                            onStart={startConversation}
                            onStop={stopConversation}
                            disabled={!agentConfigured}
                        />
                    </div>

                    <SpeakingIndicator isSpeaking={isSpeaking} />

                    <div style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: '#0d1117',
                        borderRadius: '8px',
                        border: '1px solid #30363d',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#8b949e' }}>Status</span>
                            <span style={monitorBadgeStyle}>{monitoringStatus}</span>
                        </div>
                        {secondsSinceLastChange >= 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#8b949e' }}>Last activity</span>
                                <span style={{ fontSize: '12px', color: '#e6edf3' }}>{secondsSinceLastChange}s ago</span>
                            </div>
                        )}
                        {lastToolCalled && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#8b949e' }}>Tool</span>
                                <span style={{ fontSize: '12px', color: '#58a6ff', fontFamily: 'monospace' }}>{lastToolCalled}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcript */}
                <div style={{
                    backgroundColor: '#161b22',
                    borderRadius: '16px',
                    border: '1px solid #30363d',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '600px',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>Transcript</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                        <Transcript entries={transcript} />
                    </div>
                </div>
            </div>
        </div>
    );
};
