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
     * optional minSeverity: filter by severity level
     */
    getDiagnostics(minSeverity?: 'error' | 'warning'): DiagnosticsResponse {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return { errors: [] };
        }

        const uri = editor.document.uri;
        const diagnostics = vscode.languages.getDiagnostics(uri);

        let errors: Diagnostic[] = diagnostics.map((diag) => ({
            line: diag.range.start.line + 1, // 1-indexed
            endLine: diag.range.end.line + 1, // 1-indexed
            message: diag.message,
            severity: this.mapSeverity(diag.severity),
            source: diag.source || 'unknown',
        }));

        if (minSeverity) {
            errors = errors.filter(e => {
                if (minSeverity === 'error') return e.severity === 'error';
                if (minSeverity === 'warning') return e.severity === 'error' || e.severity === 'warning';
                return true;
            });
        }

        return { errors };
    }

    getSummary(): string {
        const { errors } = this.getDiagnostics();
        const errorCount = errors.filter(e => e.severity === 'error').length;
        const warningCount = errors.filter(e => e.severity === 'warning').length;

        if (errorCount === 0 && warningCount === 0) return 'No problems found.';

        const parts = [];
        if (errorCount > 0) parts.push(`${errorCount} error${errorCount === 1 ? '' : 's'}`);
        if (warningCount > 0) parts.push(`${warningCount} warning${warningCount === 1 ? '' : 's'}`);

        return parts.join(', ');
    }
}
