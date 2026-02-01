import * as vscode from 'vscode';

interface InsertCodeResponse {
    success: boolean;
    error?: string;
}

/**
 * EditorActions - Handles code insertion and visual decorations
 */
export class EditorActions {
    private highlightDecorationType: vscode.TextEditorDecorationType | null = null;

    /**
     * Insert code at a specific line
     * @param line Line number (1-indexed)
     * @param code Code to insert
     */
    async insertCode(line: number, code: string): Promise<InsertCodeResponse> {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return { success: false, error: 'No active editor' };
            }

            // Convert to 0-indexed
            const zeroIndexedLine = line - 1;

            // Validate line number
            if (zeroIndexedLine < 0 || zeroIndexedLine > editor.document.lineCount) {
                return {
                    success: false,
                    error: `Invalid line number: ${line}. Document has ${editor.document.lineCount} lines.`,
                };
            }

            // Auto-indentation logic
            const currentLineText = editor.document.lineAt(zeroIndexedLine).text;
            const indentationMatch = currentLineText.match(/^\s*/);
            const indentation = indentationMatch ? indentationMatch[0] : '';

            // Apply indentation to all lines of the inserted code
            const indentedCode = code.split('\n').map((l, i) => i === 0 ? l : indentation + l).join('\n');

            // Create position at the start of the specified line
            // We usually insert AFTER the specified line to avoid messing up the current line context? 
            // The request implies "insert at line", usually meaning pushing that line down or inserting content there.
            // Let's assume inserting new content that pushes everything down.
            const position = new vscode.Position(zeroIndexedLine, 0);

            // Insert the code with a newline
            const success = await editor.edit((editBuilder) => {
                editBuilder.insert(position, indentation + indentedCode + '\n');
            });

            if (success) {
                // Highlight the inserted line briefly
                await this.highlightLine(line, 2000);
                return { success: true };
            } else {
                return { success: false, error: 'Edit operation failed' };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Replace a range of lines with new code
     * @param startLine Start line (1-indexed)
     * @param endLine End line (1-indexed, inclusive)
     * @param code New code
     */
    async replaceCode(startLine: number, endLine: number, code: string): Promise<InsertCodeResponse> {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return { success: false, error: 'No active editor' };
            }

            const zeroStartLine = startLine - 1;
            const zeroEndLine = endLine - 1;

            if (zeroStartLine < 0 || zeroEndLine >= editor.document.lineCount || zeroStartLine > zeroEndLine) {
                return {
                    success: false,
                    error: `Invalid range: ${startLine}-${endLine}.`
                };
            }

            const range = new vscode.Range(
                new vscode.Position(zeroStartLine, 0),
                new vscode.Position(zeroEndLine, editor.document.lineAt(zeroEndLine).text.length)
            );

            // Auto-indentation (match start line)
            const firstLineText = editor.document.lineAt(zeroStartLine).text;
            const indentationMatch = firstLineText.match(/^\s*/);
            const indentation = indentationMatch ? indentationMatch[0] : '';
            const indentedCode = code.split('\n').map((l, i) => i === 0 ? l : indentation + l).join('\n');

            const success = await editor.edit(editBuilder => {
                editBuilder.replace(range, indentation + indentedCode);
            });

            if (success) {
                await this.highlightLine(startLine, 2000);
                return { success: true };
            } else {
                return { success: false, error: 'Replace operation failed' };
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Highlight a line temporarily
     * @param line Line number (1-indexed)
     * @param durationMs How long to show the highlight
     */
    async highlightLine(line: number, durationMs: number = 2000): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Clean up previous decoration if any
        if (this.highlightDecorationType) {
            this.highlightDecorationType.dispose();
        }

        // Create a subtle highlight decoration
        this.highlightDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(88, 166, 255, 0.2)', // Subtle blue highlight
            isWholeLine: true,
            borderColor: 'rgba(88, 166, 255, 0.5)',
            borderWidth: '1px',
            borderStyle: 'solid',
        });

        // Convert to 0-indexed
        const zeroIndexedLine = line - 1;

        // Ensure line is in valid range
        if (zeroIndexedLine >= 0 && zeroIndexedLine < editor.document.lineCount) {
            const range = new vscode.Range(
                new vscode.Position(zeroIndexedLine, 0),
                new vscode.Position(zeroIndexedLine, editor.document.lineAt(zeroIndexedLine).text.length)
            );

            editor.setDecorations(this.highlightDecorationType, [range]);

            // Remove highlight after duration
            setTimeout(() => {
                if (this.highlightDecorationType) {
                    this.highlightDecorationType.dispose();
                    this.highlightDecorationType = null;
                }
            }, durationMs);
        }
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        if (this.highlightDecorationType) {
            this.highlightDecorationType.dispose();
            this.highlightDecorationType = null;
        }
    }
}
