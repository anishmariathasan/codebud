/**
 * CodeBud Webview - Voice UI for VS Code
 * This runs inside the VS Code webview and connects to ElevenLabs
 */

(function () {
    const vscode = acquireVsCodeApi();
    const API_BASE = 'http://localhost:3001';

    // State
    let agentId = '';
    let mode = 'navigator';
    let isConnected = false;
    let isVoiceActive = false;
    let isSpeaking = false;
    let conversation = null;
    let transcript = [];

    // DOM Elements
    const root = document.getElementById('root');

    // Initialize UI
    function render() {
        root.innerHTML = `
            <div class="header">
                <h1>CodeBud</h1>
                <p>AI Voice Pair Programmer</p>
            </div>
            
            <div class="status-bar">
                <div class="status-item">
                    <span class="status-dot ${isConnected ? 'connected' : 'disconnected'}"></span>
                    <span>VS Code</span>
                </div>
                <div class="status-item">
                    <span class="status-dot ${isVoiceActive ? 'connected' : 'disconnected'}"></span>
                    <span>Voice</span>
                </div>
                <div class="status-item">
                    <span class="status-dot ${agentId ? 'connected' : 'warning'}"></span>
                    <span>Agent</span>
                </div>
            </div>
            
            ${!agentId ? `
                <div class="config-section">
                    <label>ElevenLabs Agent ID</label>
                    <input type="text" id="agentIdInput" placeholder="Enter your Agent ID" />
                </div>
            ` : ''}
            
            ${!isConnected ? `
                <div class="warning">
                    <span>⚠️</span>
                    <span>Extension API not responding. Is CodeBud running?</span>
                </div>
            ` : ''}
            
            <div class="controls">
                <div class="mode-toggle">
                    <button class="mode-btn ${mode === 'navigator' ? 'active' : ''}" data-mode="navigator">
                        Navigator
                    </button>
                    <button class="mode-btn ${mode === 'driver' ? 'active' : ''}" data-mode="driver">
                        Driver
                    </button>
                </div>
                
                <button class="voice-btn ${isVoiceActive ? 'active' : ''}" id="voiceBtn" ${!agentId ? 'disabled' : ''}>
                    ${isVoiceActive ? '⏹️' : '🎤'}
                </button>
                
                ${isSpeaking ? `
                    <div class="speaking-indicator">
                        <div class="speaking-bar"></div>
                        <div class="speaking-bar"></div>
                        <div class="speaking-bar"></div>
                        <div class="speaking-bar"></div>
                    </div>
                ` : '<div style="height: 20px;"></div>'}
            </div>
            
            ${transcript.length > 0 ? `
                <div class="transcript">
                    ${transcript.slice(-10).map(entry => `
                        <div class="transcript-entry ${entry.role}">
                            ${entry.text}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Re-attach event listeners
        attachEventListeners();
    }

    function attachEventListeners() {
        // Agent ID input
        const agentInput = document.getElementById('agentIdInput');
        if (agentInput) {
            agentInput.addEventListener('change', (e) => {
                agentId = e.target.value.trim();
                localStorage.setItem('codebud_agent_id', agentId);
                render();
            });
        }

        // Mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const newMode = btn.dataset.mode;
                try {
                    const res = await fetch(`${API_BASE}/api/mode`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: newMode })
                    });
                    if (res.ok) {
                        mode = newMode;
                        render();
                    }
                } catch (err) {
                    console.error('Failed to switch mode:', err);
                }
            });
        });

        // Voice button
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', toggleVoice);
        }
    }

    // Check extension connection
    async function checkConnection() {
        try {
            const res = await fetch(`${API_BASE}/api/status`);
            if (res.ok) {
                const data = await res.json();
                isConnected = data.active;
                mode = data.mode || mode;
            } else {
                isConnected = false;
            }
        } catch {
            isConnected = false;
        }
        render();
    }

    // Toggle voice session
    async function toggleVoice() {
        if (isVoiceActive) {
            await stopVoice();
        } else {
            await startVoice();
        }
    }

    async function startVoice() {
        if (!agentId) {
            vscode.postMessage({ type: 'error', text: 'Please enter your ElevenLabs Agent ID' });
            return;
        }

        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Load ElevenLabs SDK dynamically
            if (!window.ElevenLabsClient) {
                await loadElevenLabsSDK();
            }

            // Start conversation
            conversation = await window.ElevenLabsClient.Conversation.startSession({
                agentId: agentId,
                onConnect: () => {
                    console.log('Connected to ElevenLabs');
                    isVoiceActive = true;
                    render();
                    startContextPolling();
                },
                onDisconnect: () => {
                    console.log('Disconnected from ElevenLabs');
                    isVoiceActive = false;
                    isSpeaking = false;
                    render();
                },
                onMessage: (message) => {
                    if (message?.message && message?.source) {
                        transcript.push({
                            role: message.source === 'user' ? 'user' : 'assistant',
                            text: message.message
                        });
                        render();
                    }
                },
                onModeChange: (data) => {
                    isSpeaking = data.mode === 'speaking';
                    render();
                },
                onError: (error) => {
                    console.error('Voice error:', error);
                    vscode.postMessage({ type: 'error', text: 'Voice connection error' });
                },
                clientTools: createClientTools()
            });

        } catch (err) {
            console.error('Failed to start voice:', err);
            vscode.postMessage({ type: 'error', text: 'Failed to start voice session. Check microphone permissions.' });
        }
    }

    async function stopVoice() {
        if (conversation) {
            try {
                await conversation.endSession();
            } catch (err) {
                console.error('Error stopping voice:', err);
            }
            conversation = null;
        }
        isVoiceActive = false;
        isSpeaking = false;
        render();
    }

    // Load ElevenLabs SDK
    function loadElevenLabsSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://elevenlabs.io/convai-widget/index.js';
            script.onload = () => {
                console.log('ElevenLabs SDK loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Create client tools for ElevenLabs
    function createClientTools() {
        return {
            get_code_context: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/context`);
                    return JSON.stringify(await res.json());
                } catch (err) {
                    return JSON.stringify({ error: err.message });
                }
            },
            get_diagnostics: async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/diagnostics`);
                    return JSON.stringify(await res.json());
                } catch (err) {
                    return JSON.stringify({ error: err.message });
                }
            },
            insert_code_line: async (params) => {
                try {
                    const res = await fetch(`${API_BASE}/api/insert`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(params)
                    });
                    return JSON.stringify(await res.json());
                } catch (err) {
                    return JSON.stringify({ success: false, error: err.message });
                }
            },
            switch_mode: async (params) => {
                try {
                    const res = await fetch(`${API_BASE}/api/mode`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(params)
                    });
                    const result = await res.json();
                    if (result.success) {
                        mode = params.mode;
                        render();
                    }
                    return JSON.stringify(result);
                } catch (err) {
                    return JSON.stringify({ success: false, error: err.message });
                }
            }
        };
    }

    // Context polling for silent updates
    let pollInterval = null;
    function startContextPolling() {
        if (pollInterval) clearInterval(pollInterval);

        pollInterval = setInterval(async () => {
            if (!isVoiceActive || !conversation) {
                clearInterval(pollInterval);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/context`);
                const context = await res.json();

                // Send context update to agent (if supported)
                if (conversation.sendContextualUpdate) {
                    const summary = `[CONTEXT] File: ${context.fileName}, Line: ${context.cursorLine}/${context.totalLines}, Mode: ${context.mode}`;
                    conversation.sendContextualUpdate(summary);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 4000);
    }

    // Initialize
    function init() {
        // Try to load saved agent ID
        agentId = localStorage.getItem('codebud_agent_id') || '';

        // Initial render
        render();

        // Check connection immediately and periodically
        checkConnection();
        setInterval(checkConnection, 5000);

        // Tell extension we're ready
        vscode.postMessage({ type: 'ready' });
    }

    init();
})();
