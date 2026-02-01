/**
 * ElevenLabs client tool handlers
 * These functions are called by the ElevenLabs agent during conversation
 */

import * as api from './api';

interface ClientToolCallbacks {
    onModeChange?: (mode: 'driver' | 'navigator') => void;
    onToolCall?: (toolName: string) => void;
}

interface InsertCodeParams {
    line: number;
    code: string;
}

interface SwitchModeParams {
    mode: string;
}

/**
 * Create client tools object for ElevenLabs useConversation hook
 */
export function createClientTools(callbacks?: ClientToolCallbacks) {
    return {
        /**
         * Get the current code context from VS Code
         * Called by the AI to understand what the user is working on
         */
        get_code_context: async (): Promise<string> => {
            callbacks?.onToolCall?.('get_code_context');
            try {
                const context = await api.getContext();
                return JSON.stringify(context);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return JSON.stringify({ error: `Failed to get code context: ${message}` });
            }
        },

        /**
         * Get diagnostics (errors, warnings) from VS Code
         * Called by the AI to see what problems exist in the code
         */
        get_diagnostics: async (): Promise<string> => {
            callbacks?.onToolCall?.('get_diagnostics');
            try {
                const diagnostics = await api.getDiagnostics();
                return JSON.stringify(diagnostics);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return JSON.stringify({ error: `Failed to get diagnostics: ${message}` });
            }
        },

        /**
         * Insert code at a specific line in the active editor
         * Only works in driver mode
         */
        insert_code_line: async (params: InsertCodeParams): Promise<string> => {
            callbacks?.onToolCall?.('insert_code_line');
            try {
                const { line, code } = params;
                const result = await api.insertCode(line, code);
                return JSON.stringify(result);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return JSON.stringify({
                    success: false,
                    error: `Failed to insert code: ${message}`,
                });
            }
        },

        /**
         * Replace code at a specific line (for corrections)
         * Replaces the existing line with new code. Only works in driver mode.
         */
        replace_code_line: async (params: { line: number; code: string }): Promise<string> => {
            callbacks?.onToolCall?.('replace_code_line');
            try {
                const { line, code } = params;
                // Replace just that single line (startLine = endLine = line)
                const result = await api.replaceCode(line, line, code);
                return JSON.stringify(result);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return JSON.stringify({
                    success: false,
                    error: `Failed to replace code: ${message}`,
                });
            }
        },

        /**
         * Switch between driver and navigator modes
         */
        switch_mode: async (params: SwitchModeParams): Promise<string> => {
            callbacks?.onToolCall?.('switch_mode');
            try {
                const mode = params.mode as 'driver' | 'navigator';
                if (mode !== 'driver' && mode !== 'navigator') {
                    return JSON.stringify({
                        success: false,
                        error: 'Invalid mode. Must be "driver" or "navigator".',
                    });
                }
                const result = await api.switchMode(mode);
                if (result.success) {
                    callbacks?.onModeChange?.(mode);
                }
                return JSON.stringify(result);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                return JSON.stringify({
                    success: false,
                    error: `Failed to switch mode: ${message}`,
                });
            }
        },
    };
}

export type ClientTools = ReturnType<typeof createClientTools>;
