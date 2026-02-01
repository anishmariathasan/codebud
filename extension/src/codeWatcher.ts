import * as vscode from 'vscode';

/**
 * CodeWatcher - Monitors document changes and provides code context
 * Tracks typing state for continuous code monitoring
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

    getRecentChangesWithContext(n: number = 5): string[] {
        return this.recentChanges.slice(-n);
    }

    /**
     * Get recent changes as simple strings
     */
    getRecentChanges(n: number = 5): string[] {
        return this.recentChanges.slice(-n);
    }

    /**
     * Extract basic file structure (functions, classes, variables)
     */
    getFileStructure(content: string): FileStructureItem[] {
        const items: FileStructureItem[] = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            // Match function declarations
            const funcMatch = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
            if (funcMatch) {
                items.push({ name: funcMatch[1], line: lineNum, type: 'function' });
                continue;
            }

            // Match arrow functions assigned to const/let
            const arrowMatch = line.match(/^\s*(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(/);
            if (arrowMatch) {
                items.push({ name: arrowMatch[1], line: lineNum, type: 'function' });
                continue;
            }

            // Match class declarations
            const classMatch = line.match(/^\s*(?:export\s+)?class\s+(\w+)/);
            if (classMatch) {
                items.push({ name: classMatch[1], line: lineNum, type: 'class' });
                continue;
            }

            // Match top-level const/let (not in functions)
            const varMatch = line.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/);
            if (varMatch && !line.includes('=>')) {
                items.push({ name: varMatch[1], line: lineNum, type: 'variable' });
            }
        }

        return items;
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

        // Get typing state
        const typingState = this.getTypingState();

        // Get and clear changes since last poll
        const changesSinceLastPoll = this.getAndClearChangesSinceLastPoll();

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
            recentChanges: this.getRecentChanges(5),
            // New typing state fields
            isTyping: typingState.isTyping,
            lastChangeTime: typingState.lastChangeTime,
            secondsSinceLastChange: typingState.secondsSinceLastChange,
            changesSinceLastPoll,
            hasNewChanges: changesSinceLastPoll.length > 0,
        };
    }

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
