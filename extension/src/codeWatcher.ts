import * as vscode from 'vscode';

/**
 * CodeWatcher - Monitors document changes and provides code context
 */
export class CodeWatcher {
    private recentChanges: string[] = [];
    private readonly maxChanges = 20;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        // Listen to document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                this.handleDocumentChange(event);
            })
        );
    }

    private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        // Only track changes in the active editor
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || event.document !== activeEditor.document) {
            return;
        }

        // Store each content change
        for (const change of event.contentChanges) {
            const trimmedText = change.text.trim();
            if (trimmedText.length > 0) {
                this.recentChanges.push(trimmedText);
                // Keep only the most recent changes
                if (this.recentChanges.length > this.maxChanges) {
                    this.recentChanges.shift();
                }
            }
        }
    }

    /**
     * Get the most recent N changes
     */
    getRecentChanges(n: number = 5): string[] {
        return this.recentChanges.slice(-n);
    }

    /**
     * Get complete code context for the current editor state
     */
    getContext(currentMode: 'driver' | 'navigator'): object | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        const document = editor.document;
        const position = editor.selection.active;
        const fileName = document.fileName;
        const language = document.languageId;
        const fileContent = document.getText();
        const cursorLine = position.line + 1; // 1-indexed
        const totalLines = document.lineCount;

        // Get selected text if any
        const selection = editor.selection;
        const selectedText = selection.isEmpty ? null : document.getText(selection);

        // Get surrounding 20 lines (10 before, 10 after cursor)
        const startLine = Math.max(0, position.line - 10);
        const endLine = Math.min(document.lineCount - 1, position.line + 10);
        const surroundingRange = new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
        const surroundingCode = document.getText(surroundingRange);

        return {
            mode: currentMode,
            fileName: fileName.split(/[/\\]/).pop() || fileName,
            language,
            fileContent,
            surroundingCode,
            cursorLine,
            totalLines,
            selectedText,
            recentChanges: this.getRecentChanges(5),
        };
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
        this.recentChanges = [];
    }
}
