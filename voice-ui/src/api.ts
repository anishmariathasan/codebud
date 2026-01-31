/**
 * API client for communicating with the VS Code extension
 * Falls back to mock responses when USE_MOCK is true
 */

import { API_BASE, USE_MOCK } from './config';
import {
    getMockContext,
    getMockDiagnostics,
    mockInsertCode,
    mockSwitchMode,
    getMockStatus,
} from './mockApi';
import type {
    CodeContext,
    DiagnosticsResponse,
    InsertCodeResponse,
    SwitchModeResponse,
    ExtensionStatus,
} from './types';

/**
 * Get current code context from VS Code
 */
export async function getContext(): Promise<CodeContext> {
    if (USE_MOCK) {
        return getMockContext();
    }

    try {
        const response = await fetch(`${API_BASE}/api/context`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to get context:', error);
        throw error;
    }
}

/**
 * Get diagnostics from VS Code
 */
export async function getDiagnostics(): Promise<DiagnosticsResponse> {
    if (USE_MOCK) {
        return getMockDiagnostics();
    }

    try {
        const response = await fetch(`${API_BASE}/api/diagnostics`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to get diagnostics:', error);
        throw error;
    }
}

/**
 * Insert code at a specific line
 */
export async function insertCode(
    line: number,
    code: string
): Promise<InsertCodeResponse> {
    if (USE_MOCK) {
        return mockInsertCode(line, code);
    }

    try {
        const response = await fetch(`${API_BASE}/api/insert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line, code }),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to insert code:', error);
        throw error;
    }
}

/**
 * Switch driver/navigator mode
 */
export async function switchMode(
    mode: 'driver' | 'navigator'
): Promise<SwitchModeResponse> {
    if (USE_MOCK) {
        return mockSwitchMode(mode);
    }

    try {
        const response = await fetch(`${API_BASE}/api/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode }),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to switch mode:', error);
        throw error;
    }
}

/**
 * Get extension status
 */
export async function getStatus(): Promise<ExtensionStatus> {
    if (USE_MOCK) {
        return getMockStatus();
    }

    try {
        const response = await fetch(`${API_BASE}/api/status`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to get status:', error);
        throw error;
    }
}
