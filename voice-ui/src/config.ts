/**
 * Configuration constants for CodeBud Voice UI
 */

// ElevenLabs Agent ID (loaded from environment variable)
export const AGENT_ID: string = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

// VS Code Extension API base URL
export const API_BASE: string = 'http://localhost:3001';

// Set to true to develop without VS Code extension running
// The UI will use mock responses for all API calls
export const USE_MOCK: boolean = false;

