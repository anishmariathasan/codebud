import * as vscode from 'vscode';

/**
 * CodeWatcher - Monitors document changes and provides code context
 * Tracks typing state for continuous code monitoring
 */
export class CodeWatcher {
    private recentChanges: string[] = [];
    private changesSinceLastPoll: string[] = [];
    private readonly maxChanges = 20;
    private disposables: vscode.Disposable[] = [];

    // Typing state tracking
    private lastChangeTime: number = 0;
    private isTyping: boolean = false;
    private typingTimeout: NodeJS.Timeout | null = null;
    private readonly TYPING_TIMEOUT_MS = 3000; // Consider stopped typing after 3s

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

        // Update typing state
        this.lastChangeTime = Date.now();
        this.isTyping = true;

        // Clear existing timeout and set new one
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
        }, this.TYPING_TIMEOUT_MS);

        // Store each content change
        for (const change of event.contentChanges) {
            const trimmedText = change.text.trim();
            if (trimmedText.length > 0) {
                // Add to both arrays
                this.recentChanges.push(trimmedText);
                this.changesSinceLastPoll.push(trimmedText);

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
     * Get changes since the last poll and clear the buffer
     */
    getAndClearChangesSinceLastPoll(): string[] {
        const changes = [...this.changesSinceLastPoll];
        this.changesSinceLastPoll = [];
        return changes;
    }

    /**
     * Get current typing state
     */
    getTypingState(): { isTyping: boolean; lastChangeTime: number; secondsSinceLastChange: number } {
        const now = Date.now();
        const secondsSinceLastChange = this.lastChangeTime > 0
            ? Math.floor((now - this.lastChangeTime) / 1000)
            : -1;

        return {
            isTyping: this.isTyping,
            lastChangeTime: this.lastChangeTime,
            secondsSinceLastChange,
        };
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

        // Get typing state
        const typingState = this.getTypingState();

        // Get and clear changes since last poll
        const changesSinceLastPoll = this.getAndClearChangesSinceLastPoll();

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
            // New typing state fields
            isTyping: typingState.isTyping,
            lastChangeTime: typingState.lastChangeTime,
            secondsSinceLastChange: typingState.secondsSinceLastChange,
            changesSinceLastPoll,
            hasNewChanges: changesSinceLastPoll.length > 0,
        };
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
        this.recentChanges = [];
        this.changesSinceLastPoll = [];
    }
}
