/**
 * App - Main application component for CodeBud Voice UI
 * Implements 3-channel code monitoring with ElevenLabs agent
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { AGENT_ID } from './config';
import { useCodeMonitor } from './hooks/useCodeMonitor';
import { createClientTools } from './clientTools';
import { switchMode } from './api';
import { StatusBar } from './components/StatusBar';
import { ModeToggle } from './components/ModeToggle';
import { VoiceButton } from './components/VoiceButton';
import { SpeakingIndicator } from './components/SpeakingIndicator';
import { Transcript, TranscriptEntry } from './components/Transcript';

const App: React.FC = () => {
    // Local state
    const [mode, setMode] = useState<'driver' | 'navigator'>('navigator');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [lastToolCalled, setLastToolCalled] = useState<string | null>(null);
    const [monitoringStatus, setMonitoringStatus] = useState<string>('Idle');

    // Track if voice session is active
    const isVoiceActiveRef = useRef(false);

    // Check if agent is configured
    const agentConfigured = AGENT_ID !== 'YOUR_AGENT_ID_HERE' && AGENT_ID.length > 0;

    // Create client tools with callbacks
    const clientTools = useMemo(
        () =>
            createClientTools({
                onModeChange: (newMode) => setMode(newMode),
                onToolCall: (toolName) => setLastToolCalled(toolName),
            }),
        []
    );

    // ElevenLabs conversation hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversation = useConversation({
        onConnect: () => {
            console.log('Connected to ElevenLabs');
            isVoiceActiveRef.current = true;
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs');
            isVoiceActiveRef.current = false;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onMessage: (message: any) => {
            if (message?.message && message?.source) {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.source === 'user' ? 'user' : 'assistant',
                        text: message.message as string,
                        timestamp: new Date(),
                    },
                ]);
            }
        },
        onError: (error: unknown) => {
            console.error('Conversation error:', error);
        },
    });

    // Channel 1: Silent context updates (every 4 seconds)
    const handleContextUpdate = useCallback((context: any) => {
        if (!isVoiceActiveRef.current) return;

        try {
            // Send contextual update to agent (agent absorbs but doesn't respond)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conv = conversation as any;
            if (conv.sendContextualUpdate) {
                const contextSummary = `[CONTEXT] File: ${context.fileName} (${context.language}), Line: ${context.cursorLine}/${context.totalLines}, Mode: ${context.mode}, Typing: ${context.isTyping}`;
                conv.sendContextualUpdate(contextSummary);
                setMonitoringStatus(context.isTyping ? '✍️ Typing...' : '👀 Watching');
            }
        } catch (err) {
            console.error('Failed to send context update:', err);
        }
    }, [conversation]);

    // Channel 2: Typing pause triggers code review
    const handleTypingPause = useCallback((context: any) => {
        if (!isVoiceActiveRef.current) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conv = conversation as any;
            if (conv.sendUserMessage) {
                // Build a code review request
                const reviewMessage = `[CODE_REVIEW] I just paused typing. Here's my current code around line ${context.cursorLine}:

\`\`\`${context.language}
${context.surroundingCode}
\`\`\`

Recent changes: ${context.recentChanges.join(', ') || 'none'}
File: ${context.fileName}
Mode: ${context.mode}

Please briefly review and respond. If it looks fine, just say "looks good" or similar. If there's an issue, explain it concisely.`;

                conv.sendUserMessage(reviewMessage);
                setMonitoringStatus('🔍 Reviewing...');

                // Add to transcript
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: 'user',
                        text: `[Auto-review triggered at line ${context.cursorLine}]`,
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (err) {
            console.error('Failed to send typing pause message:', err);
        }
    }, [conversation]);

    // Code monitor hook - Channel 1 & 2
    const { isConnected: isExtensionConnected, isTyping, secondsSinceLastChange } = useCodeMonitor({
        pollInterval: 4000,
        pauseThreshold: 5,
        onContextUpdate: handleContextUpdate,
        onTypingPause: handleTypingPause,
        enabled: isVoiceActiveRef.current && agentConfigured,
    });

    // Start voice session
    const startConversation = useCallback(async () => {
        if (!agentConfigured) {
            console.error('Agent not configured');
            return;
        }

        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Start the conversation session
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (conversation as any).startSession({
                agentId: AGENT_ID,
                clientTools,
            });

            setMonitoringStatus('🎤 Session started');
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    }, [agentConfigured, conversation, clientTools]);

    // Stop voice session
    const stopConversation = useCallback(async () => {
        try {
            await conversation.endSession();
            setMonitoringStatus('Idle');
        } catch (error) {
            console.error('Failed to stop conversation:', error);
        }
    }, [conversation]);

    // Toggle mode
    const handleModeToggle = useCallback(async () => {
        const newMode = mode === 'driver' ? 'navigator' : 'driver';
        try {
            await switchMode(newMode);
            setMode(newMode);
        } catch (error) {
            console.error('Failed to switch mode:', error);
        }
    }, [mode]);

    // Determine voice status
    const getVoiceStatus = (): 'disconnected' | 'connected' | 'error' => {
        const status = String(conversation.status);
        if (status === 'connected') return 'connected';
        if (status === 'error') return 'error';
        return 'disconnected';
    };

    const isVoiceActive = String(conversation.status) === 'connected';

    // Styles
    const containerStyle: React.CSSProperties = {
        minHeight: '100vh',
        backgroundColor: '#0d1117',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: '30px',
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '32px',
        fontWeight: 700,
        color: '#e6edf3',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #58a6ff, #3fb950)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    };

    const subtitleStyle: React.CSSProperties = {
        fontSize: '16px',
        color: '#8b949e',
    };

    const mainContentStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    };

    const controlsStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '30px',
        backgroundColor: '#161b22',
        borderRadius: '16px',
        border: '1px solid #30363d',
    };

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
    };

    const statusRowStyle: React.CSSProperties = {
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: '#8b949e',
        justifyContent: 'center',
    };

    const monitorBadgeStyle: React.CSSProperties = {
        padding: '4px 12px',
        backgroundColor: isTyping ? 'rgba(88, 166, 255, 0.2)' : 'rgba(63, 185, 80, 0.2)',
        borderRadius: '12px',
        color: isTyping ? '#58a6ff' : '#3fb950',
        fontSize: '11px',
        fontWeight: 600,
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={titleStyle}>CodeBud</h1>
                <p style={subtitleStyle}>AI Voice Pair Programmer</p>
            </header>

            <main style={mainContentStyle}>
                <StatusBar
                    isExtensionConnected={isExtensionConnected}
                    voiceStatus={getVoiceStatus()}
                    agentConfigured={agentConfigured}
                />

                {!agentConfigured && (
                    <div style={warningStyle}>
                        <span>⚠️</span>
                        <span>
                            Agent not configured. Set VITE_ELEVENLABS_AGENT_ID in .env
                        </span>
                    </div>
                )}

                {!isExtensionConnected && (
                    <div style={warningStyle}>
                        <span>⚠️</span>
                        <span>
                            VS Code extension not detected. Press F5 in the extension folder.
                        </span>
                    </div>
                )}

                <div style={controlsStyle}>
                    <ModeToggle
                        mode={mode}
                        onToggle={handleModeToggle}
                        disabled={!isExtensionConnected}
                    />

                    <VoiceButton
                        isConnected={getVoiceStatus() === 'connected'}
                        isActive={isVoiceActive}
                        onStart={startConversation}
                        onStop={stopConversation}
                        disabled={!agentConfigured}
                    />

                    <SpeakingIndicator isSpeaking={conversation.isSpeaking} />

                    {/* Monitoring status */}
                    <div style={statusRowStyle}>
                        <span style={monitorBadgeStyle}>{monitoringStatus}</span>
                        {secondsSinceLastChange >= 0 && (
                            <span>Last change: {secondsSinceLastChange}s ago</span>
                        )}
                    </div>

                    {lastToolCalled && (
                        <div style={{ fontSize: '12px', color: '#8b949e' }}>
                            Last tool: <strong>{lastToolCalled}</strong>
                        </div>
                    )}
                </div>

                <Transcript entries={transcript} />
            </main>
        </div>
    );
};

export default App;
