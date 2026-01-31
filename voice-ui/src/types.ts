/**
 * Local type definitions matching shared/types.ts
 * These are duplicated here to avoid build complexity with cross-package imports
 */

export type Mode = 'driver' | 'navigator';

export interface CodeContext {
    mode: Mode;
    fileName: string;
    language: string;
    fileContent: string;
    surroundingCode: string;
    cursorLine: number;
    totalLines: number;
    selectedText: string | null;
    recentChanges: string[];
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

export interface Diagnostic {
    line: number;
    endLine: number;
    message: string;
    severity: DiagnosticSeverity;
    source: string;
}

export interface DiagnosticsResponse {
    errors: Diagnostic[];
}

export interface InsertCodeResponse {
    success: boolean;
    error?: string;
}

export interface SwitchModeResponse {
    success: boolean;
    mode: string;
    error?: string;
}

export interface ExtensionStatus {
    active: boolean;
    mode: string;
}
