import * as vscode from 'vscode';

type Mode = 'driver' | 'navigator';

/**
 * ModeManager - Manages driver/navigator mode state and status bar
 */
export class ModeManager {
    private currentMode: Mode = 'navigator';
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        // Create status bar item on the left side, priority 100
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'codebud.toggleMode';
        this.updateStatusBar();
        this.statusBarItem.show();
    }

    /**
     * Update the status bar appearance based on current mode
     */
    private updateStatusBar(): void {
        if (this.currentMode === 'navigator') {
            this.statusBarItem.text = '$(eye) NAVIGATOR';
            this.statusBarItem.tooltip = 'CodeBud: Navigator Mode - AI observes and advises';
            this.statusBarItem.backgroundColor = undefined;
        } else {
            this.statusBarItem.text = '$(edit) DRIVER';
            this.statusBarItem.tooltip = 'CodeBud: Driver Mode - AI can modify code';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                'statusBarItem.warningBackground'
            );
        }
    }

    /**
     * Get the current mode
     */
    getMode(): Mode {
        return this.currentMode;
    }

    /**
     * Set the mode
     */
    setMode(mode: Mode): void {
        const previousMode = this.currentMode;
        this.currentMode = mode;
        this.updateStatusBar();

        if (previousMode !== mode) {
            const modeLabel = mode === 'driver' ? 'Driver' : 'Navigator';
            const modeDesc =
                mode === 'driver'
                    ? 'AI can now modify your code'
                    : 'AI will observe and advise only';
            vscode.window.showInformationMessage(
                `CodeBud: Switched to ${modeLabel} Mode - ${modeDesc}`
            );
        }
    }

    /**
     * Toggle between driver and navigator modes
     */
    toggle(): void {
        this.setMode(this.currentMode === 'driver' ? 'navigator' : 'driver');
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.statusBarItem.dispose();
    }
}
