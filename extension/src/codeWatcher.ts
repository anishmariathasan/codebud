import * as vscode from 'vscode';

/**
 * CodeWatcher - Monitors document changes and provides code context
 */
export interface ChangeContext {
    text: string;
    line: number;
    timestamp: number;
}

export interface FileStructureItem {
    name: string;
    line: number;
    type: 'function' | 'class' | 'variable';
}

export class CodeWatcher {
    private recentChanges: ChangeContext[] = [];
    private readonly maxChanges = 20;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                this.handleDocumentChange(event);
            })
        );
    }

    private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || event.document !== activeEditor.document) {
            return;
        }

        for (const change of event.contentChanges) {
            const trimmedText = change.text.trim();
            if (trimmedText.length > 0) {
                this.recentChanges.push({
                    text: trimmedText,
                    line: change.range.start.line + 1,
                    timestamp: Date.now()
                });

                if (this.recentChanges.length > this.maxChanges) {
                    this.recentChanges.shift();
                }
            }
        }
    }

    getRecentChangesWithContext(n: number = 5): ChangeContext[] {
        return this.recentChanges.slice(-n);
    }

    getFileStructure(fileContent: string): FileStructureItem[] {
        const structure: FileStructureItem[] = [];
        const lines = fileContent.split('\n');

        // Simple regex to match function/class/var definitions
        // Captures: 1=type, 2=name
        const regex = /\b(function|class|const|let|var)\s+([a-zA-Z0-9_]+)/; // Basic non-global matching per line

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(regex);
            if (match) {
                structure.push({
                    name: match[2],
                    line: i + 1,
                    type: match[1] === 'class' ? 'class' : (match[1] === 'function' ? 'function' : 'variable')
                });
            }
        }

        return structure;
    }

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

        // Truncate large files for context window (Phase 4)
        let truncatedContent = fileContent;
        const maxLines = 500;
        const totalLines = document.lineCount; // Define totalLines here
        if (totalLines > maxLines) {
            const lines = fileContent.split('\n');
            truncatedContent = lines.slice(0, maxLines).join('\n') + `\n... (truncated ${totalLines - maxLines} lines)`;
        }

        const cursorLine = position.line + 1;
        // const totalLinesResult = document.lineCount; // This line is removed as totalLines is already defined

        const selection = editor.selection;
        const selectedText = selection.isEmpty ? null : document.getText(selection);

        const startLine = Math.max(0, position.line - 10);
        const endLine = Math.min(document.lineCount - 1, position.line + 10);
        const surroundingRange = new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
        const surroundingCode = document.getText(surroundingRange);

        const workspaceFiles = vscode.window.visibleTextEditors.map(e => e.document.fileName.split(/[/\\]/).pop());

        return {
            mode: currentMode,
            fileName: fileName.split(/[/\\]/).pop() || fileName,
            language,
            fileContent: truncatedContent,
            fileStructure: this.getFileStructure(fileContent),
            surroundingCode,
            cursorLine,
            totalLines,
            selectedText,
            recentChanges: this.getRecentChangesWithContext(5),
            workspaceFiles
        };
    }

    dispose(): void {
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
        this.recentChanges = [];
    }
}
