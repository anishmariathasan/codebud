import * as vscode from 'vscode';
import { ModeManager } from './modeManager';

/**
 * Register all VS Code commands for CodeBud
 */
export function registerCommands(
    context: vscode.ExtensionContext,
    modeManager: ModeManager
): void {
    // Command: Open Voice UI in browser
    context.subscriptions.push(
        vscode.commands.registerCommand('codebud.openUI', () => {
            vscode.env.openExternal(vscode.Uri.parse('http://localhost:3001'));
        })
    );

    // Command: Toggle driver/navigator mode
    context.subscriptions.push(
        vscode.commands.registerCommand('codebud.toggleMode', () => {
            modeManager.toggle();
        })
    );

    // Command: Set navigator mode
    context.subscriptions.push(
        vscode.commands.registerCommand('codebud.setNavigator', () => {
            modeManager.setMode('navigator');
        })
    );

    // Command: Set driver mode
    context.subscriptions.push(
        vscode.commands.registerCommand('codebud.setDriver', () => {
            modeManager.setMode('driver');
        })
    );
}
