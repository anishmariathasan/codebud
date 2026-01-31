import * as vscode from 'vscode';

interface Diagnostic {
    line: number;
    endLine: number;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'hint';
    source: string;
}

interface DiagnosticsResponse {
    errors: Diagnostic[];
}

/**
 * DiagnosticsCollector - Collects and formats VS Code diagnostics
 */
export class DiagnosticsCollector {
    /**
     * Maps VS Code DiagnosticSeverity to string
     */
    private mapSeverity(severity: vscode.DiagnosticSeverity): 'error' | 'warning' | 'info' | 'hint' {
        switch (severity) {
            case vscode.DiagnosticSeverity.Error:
                return 'error';
            case vscode.DiagnosticSeverity.Warning:
                return 'warning';
            case vscode.DiagnosticSeverity.Information:
                return 'info';
            case vscode.DiagnosticSeverity.Hint:
                return 'hint';
            default:
                return 'info';
        }
    }

    /**
     * Get diagnostics for the active editor
     */
    getDiagnostics(): DiagnosticsResponse {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { errors: [] };
        }

        const uri = editor.document.uri;
        const diagnostics = vscode.languages.getDiagnostics(uri);

        const errors: Diagnostic[] = diagnostics.map((diag) => ({
            line: diag.range.start.line + 1, // 1-indexed
            endLine: diag.range.end.line + 1, // 1-indexed
            message: diag.message,
            severity: this.mapSeverity(diag.severity),
            source: diag.source || 'unknown',
        }));

        return { errors };
    }
}
