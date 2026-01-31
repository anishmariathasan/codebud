/**
 * App - Main application component for CodeBud Voice UI
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useConversation } from '@11labs/react';
import { AGENT_ID } from './config';
import { useExtensionStatus } from './hooks/useExtensionStatus';
import { createClientTools } from './clientTools';
import { switchMode } from './api';
import { StatusBar } from './components/StatusBar';
import { ModeToggle } from './components/ModeToggle';
import { VoiceButton } from './components/VoiceButton';
import { SpeakingIndicator } from './components/SpeakingIndicator';
import { Transcript, TranscriptEntry } from './components/Transcript';

const App: React.FC = () => {
    // Extension status polling
    const { isConnected: isExtensionConnected, mode: extensionMode } = useExtensionStatus();

    // Local state
    const [mode, setMode] = useState<'driver' | 'navigator'>('navigator');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [lastToolCalled, setLastToolCalled] = useState<string | null>(null);

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
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs');
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
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    }, [agentConfigured, conversation, clientTools]);

    // Stop voice session
    const stopConversation = useCallback(async () => {
        try {
            await conversation.endSession();
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

    // Sync mode from extension
    React.useEffect(() => {
        if (extensionMode === 'driver' || extensionMode === 'navigator') {
            setMode(extensionMode);
        }
    }, [extensionMode]);

    // Determine voice status - use string comparison for SDK compatibility
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

    const toolCallStyle: React.CSSProperties = {
        fontSize: '12px',
        color: '#8b949e',
        textAlign: 'center',
        marginTop: '8px',
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
                            Agent not configured. Edit <code>src/config.ts</code> and add your ElevenLabs Agent ID.
                        </span>
                    </div>
                )}

                {!isExtensionConnected && (
                    <div style={warningStyle}>
                        <span>⚠️</span>
                        <span>
                            VS Code extension not detected. Make sure the extension is running (press F5 in the extension folder).
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

                    {lastToolCalled && (
                        <div style={toolCallStyle}>
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
