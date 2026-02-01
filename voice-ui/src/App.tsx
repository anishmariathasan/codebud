/**
 * App - Main application entry point
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { AGENT_ID } from './config';
import { useCodeMonitor } from './hooks/useCodeMonitor';
import { useExtensionStatus } from './hooks/useExtensionStatus';
import { createClientTools } from './clientTools';
import { switchMode } from './api';
import { DashboardLayout } from './components/DashboardLayout';
import { LiveSession } from './components/LiveSession';
import { InsightsPanel } from './components/InsightsPanel';
import { TranscriptEntry } from './components/Transcript';

const App: React.FC = () => {
    // Local state
    const [currentTab, setCurrentTab] = useState<'live' | 'insights'>('live');
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
                const reviewMessage = `[CODE_REVIEW] I just paused typing. Here's my current code around line ${context.cursorLine}:
\`\`\`${context.language}
${context.surroundingCode}
\`\`\`
Recent changes: ${context.recentChanges.join(', ') || 'none'}
File: ${context.fileName}
Mode: ${context.mode}
Please briefly review and respond.`;

                conv.sendUserMessage(reviewMessage);
                setMonitoringStatus('🔍 Reviewing...');

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

    // Code monitor hook
    const { isConnected: isExtensionConnected, isTyping, secondsSinceLastChange } = useCodeMonitor({
        pollInterval: 4000,
        pauseThreshold: 5,
        onContextUpdate: handleContextUpdate,
        onTypingPause: handleTypingPause,
        enabled: isVoiceActiveRef.current && agentConfigured,
    });

    // Extension status hook
    const extensionStatus = useExtensionStatus();
    const extensionConnectionStatus = extensionStatus.isConnected || isExtensionConnected;

    // Start voice session
    const startConversation = useCallback(async () => {
        if (!agentConfigured) {
            console.error('Agent not configured');
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
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

    return (
        <DashboardLayout currentTab={currentTab} onTabChange={setCurrentTab}>
            {currentTab === 'live' ? (
                <LiveSession
                    mode={mode}
                    onModeToggle={handleModeToggle}
                    extensionConnected={extensionConnectionStatus}
                    voiceStatus={getVoiceStatus()}
                    isVoiceActive={isVoiceActive}
                    agentConfigured={agentConfigured}
                    startConversation={startConversation}
                    stopConversation={stopConversation}
                    isSpeaking={conversation.isSpeaking}
                    monitoringStatus={monitoringStatus}
                    secondsSinceLastChange={secondsSinceLastChange}
                    lastToolCalled={lastToolCalled}
                    transcript={transcript}
                />
            ) : (
                <InsightsPanel transcript={transcript} />
            )}
        </DashboardLayout>
    );
};

export default App;
