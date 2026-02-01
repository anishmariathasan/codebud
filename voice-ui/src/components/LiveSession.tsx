import React from 'react';
import { StatusBar } from './StatusBar';
import { ModeToggle } from './ModeToggle';
import { VoiceButton } from './VoiceButton';
import { SpeakingIndicator } from './SpeakingIndicator';
import { Transcript, TranscriptEntry } from './Transcript';

// Pale color palette
const colors = {
    background: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
    primary: '#6366f1',
    primaryLight: '#eef2ff',
    success: '#10b981',
    successLight: '#ecfdf5',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
};

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
        backgroundColor: colors.warningLight,
        border: `1px solid ${colors.warning}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#92400e',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px'
    };

    const monitorBadgeStyle: React.CSSProperties = {
        padding: '6px 14px',
        backgroundColor: monitoringStatus.includes('Typing') ? colors.primaryLight : colors.successLight,
        borderRadius: '20px',
        color: monitoringStatus.includes('Typing') ? colors.primary : colors.success,
        fontSize: '12px',
        fontWeight: 600,
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: colors.text, marginBottom: '8px' }}>
                        Live Session
                    </h2>
                    <p style={{ color: colors.textMuted, fontSize: '14px' }}>
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
                    backgroundColor: colors.card,
                    borderRadius: '20px',
                    border: `1px solid ${colors.cardBorder}`,
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    height: 'fit-content',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
                            background: isVoiceActive ? `radial-gradient(circle, ${colors.successLight} 0%, transparent 70%)` : 'transparent',
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
                        backgroundColor: colors.background,
                        borderRadius: '12px',
                        border: `1px solid ${colors.cardBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 500 }}>Status</span>
                            <span style={monitorBadgeStyle}>{monitoringStatus}</span>
                        </div>
                        {secondsSinceLastChange >= 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 500 }}>Last activity</span>
                                <span style={{ fontSize: '12px', color: colors.text, fontWeight: 500 }}>{secondsSinceLastChange}s ago</span>
                            </div>
                        )}
                        {lastToolCalled && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 500 }}>Tool</span>
                                <span style={{ fontSize: '12px', color: colors.primary, fontFamily: 'monospace', fontWeight: 500 }}>{lastToolCalled}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcript */}
                <div style={{
                    backgroundColor: colors.card,
                    borderRadius: '20px',
                    border: `1px solid ${colors.cardBorder}`,
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '600px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.cardBorder}` }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.text }}>Transcript</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                        <Transcript entries={transcript} />
                    </div>
                </div>
            </div>
        </div>
    );
};
