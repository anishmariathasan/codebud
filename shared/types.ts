/**
 * Shared types for CodeBud API contract
 * Used by both the VS Code extension and the Voice UI
 */

// API Configuration
export const API_PORT = 3001;
export const API_BASE = `http://localhost:${API_PORT}`;

// Mode types
export type Mode = 'driver' | 'navigator';

// Code context returned by GET /api/context
export interface CodeContext {
  mode: Mode;
  fileName: string;
  language: string;
  fileContent: string;
  surroundingCode: string; // 20 lines around cursor
  cursorLine: number;
  totalLines: number;
  selectedText: string | null;
  recentChanges: string[];
}

// Diagnostic severity levels
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

// Single diagnostic item
export interface Diagnostic {
  line: number;
  endLine: number;
  message: string;
  severity: DiagnosticSeverity;
  source: string;
}

// Response from GET /api/diagnostics
export interface DiagnosticsResponse {
  errors: Diagnostic[];
}

// Request body for POST /api/insert
export interface InsertCodeRequest {
  line: number;
  code: string;
}

// Response from POST /api/insert
export interface InsertCodeResponse {
  success: boolean;
  error?: string;
}

// Request body for POST /api/mode
export interface SwitchModeRequest {
  mode: Mode;
}

// Response from POST /api/mode
export interface SwitchModeResponse {
  success: boolean;
  mode: string;
  error?: string;
}

// Response from GET /api/status
export interface ExtensionStatus {
  active: boolean;
  mode: string;
}
