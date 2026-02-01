import * as vscode from 'vscode';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { Server } from 'http';

import { CodeWatcher } from './codeWatcher';
import { DiagnosticsCollector } from './diagnostics';
import { ModeManager } from './modeManager';
import { EditorActions } from './editorActions';
import { registerCommands } from './commands';
import { WebviewProvider, WebviewPanelManager } from './webviewProvider';

const API_PORT = 3001;

let server: Server | null = null;
let codeWatcher: CodeWatcher | null = null;
let diagnosticsCollector: DiagnosticsCollector | null = null;
let modeManager: ModeManager | null = null;
let editorActions: EditorActions | null = null;

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('CodeBud extension is now active');

    // Initialize modules
    codeWatcher = new CodeWatcher();
    diagnosticsCollector = new DiagnosticsCollector();
    modeManager = new ModeManager();
    editorActions = new EditorActions();

    // Register commands
    registerCommands(context, modeManager);

    // Register webview provider for sidebar
    const webviewProvider = new WebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            WebviewProvider.viewType,
            webviewProvider
        )
    );

    // Register command to open Voice UI as panel
    context.subscriptions.push(
        vscode.commands.registerCommand('codebud.openVoicePanel', () => {
            WebviewPanelManager.createOrShow(context.extensionUri);
        })
    );

    // Add modules to subscriptions for cleanup
    context.subscriptions.push({
        dispose: () => {
            codeWatcher?.dispose();
            modeManager?.dispose();
            editorActions?.dispose();
        },
    });


    // Create Express app
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Middleware: Request Logging
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });

    // Serve bundled Voice UI static files
    const voiceUIPath = path.join(context.extensionPath, 'voice-ui-dist');
    app.use(express.static(voiceUIPath));

    // Fallback to index.html for SPA routing
    app.get('/', (_req, res) => {
        res.sendFile(path.join(voiceUIPath, 'index.html'));
    });

    // Route: GET /api/context - Get current code context
    app.get('/api/context', (_req, res) => {
        if (!codeWatcher || !modeManager) {
            res.status(500).json({ error: 'Extension not initialized' });
            return;
        }

        const context = codeWatcher.getContext(modeManager.getMode());
        if (!context) {
            res.status(404).json({ error: 'No active editor' });
            return;
        }

        // Mix in diagnostics summary
        const diagSummary = diagnosticsCollector?.getSummary();
        const fullContext = {
            ...context,
            diagnosticsSummary: diagSummary
        };

        res.json(fullContext);
    });

    // Route: GET /api/diagnostics - Get current file diagnostics
    app.get('/api/diagnostics', (_req, res) => {
        if (!diagnosticsCollector) {
            res.status(500).json({ error: 'Extension not initialized' });
            return;
        }

        const diagnostics = diagnosticsCollector.getDiagnostics();
        res.json(diagnostics);
    });

    // Route: POST /api/insert - Insert code at line
    app.post('/api/insert', async (req, res) => {
        if (!editorActions || !modeManager) {
            res.status(500).json({ error: 'Extension not initialized' });
            return;
        }

        // Check mode - only allow in driver mode
        if (modeManager.getMode() !== 'driver') {
            res.status(403).json({
                success: false,
                error: 'Code insertion only allowed in driver mode',
            });
            return;
        }

        const { line, code } = req.body;
        // ... (validation skipped for brevity in update, but exists locally) 
        if (typeof line !== 'number' || typeof code !== 'string') {
            res.status(400).json({ success: false, error: 'Invalid params' });
            return;
        }

        const result = await editorActions.insertCode(line, code);
        res.json(result);
    });

    // Route: POST /api/replace - Replace range
    app.post('/api/replace', async (req, res) => {
        if (!editorActions || !modeManager) {
            res.status(500).json({ error: 'Extension not initialized' });
            return;
        }

        if (modeManager.getMode() !== 'driver') {
            res.status(403).json({ success: false, error: 'Only allowed in driver mode' });
            return;
        }

        const { startLine, endLine, code } = req.body;

        if (typeof startLine !== 'number' || typeof endLine !== 'number' || typeof code !== 'string') {
            res.status(400).json({ success: false, error: 'Invalid params: startLine, endLine, code required' });
            return;
        }

        const result = await editorActions.replaceCode(startLine, endLine, code);
        res.json(result);
    });

    // Route: POST /api/highlight - Highlight line
    app.post('/api/highlight', async (req, res) => {
        if (!editorActions) {
            res.status(500).json({ error: 'Extension not initialized' });
            return;
        }

        const { line } = req.body;
        if (typeof line !== 'number') {
            res.status(400).json({ success: false, error: 'Invalid params: line required' });
            return;
        }

        // Fire and forget
        editorActions.highlightLine(line, 2000);
        res.json({ success: true });
    });

    // Route: POST /api/mode - Switch mode
    app.post('/api/mode', (req, res) => {
        if (!modeManager) {
            res.status(500).json({ error: 'Extension not initialized' });
            return;
        }

        const { mode } = req.body;

        if (mode !== 'driver' && mode !== 'navigator') {
            res.status(400).json({
                success: false,
                error: 'Invalid mode: must be "driver" or "navigator"',
            });
            return;
        }

        modeManager.setMode(mode);
        res.json({ success: true, mode: modeManager.getMode() });
    });

    // Route: GET /api/status - Get extension status
    app.get('/api/status', (_req, res) => {
        if (!modeManager) {
            res.status(500).json({ active: false, mode: 'unknown' });
            return;
        }

        res.json({
            active: true,
            mode: modeManager.getMode(),
        });
    });

    // Start the server
    server = app.listen(API_PORT, () => {
        console.log(`CodeBud API server running on port ${API_PORT}`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
            vscode.window.showErrorMessage(
                `CodeBud: Port ${API_PORT} is already in use. Please close other instances.`
            );
        } else {
            vscode.window.showErrorMessage(`CodeBud server error: ${error.message}`);
        }
    });

    // Show welcome notification
    vscode.window
        .showInformationMessage(
            'CodeBud is ready! Click to open the Voice UI.',
            'Open Voice UI'
        )
        .then((selection) => {
            if (selection === 'Open Voice UI') {
                vscode.commands.executeCommand('codebud.openUI');
            }
        });
}

/**
 * Extension deactivation cleanup
 */
export function deactivate(): void {
    console.log('CodeBud extension is deactivating');

    // Close the server
    if (server) {
        server.close(() => {
            console.log('CodeBud API server closed');
        });
        server = null;
    }

    // Clean up modules
    codeWatcher?.dispose();
    codeWatcher = null;

    modeManager?.dispose();
    modeManager = null;

    editorActions?.dispose();
    editorActions = null;

    diagnosticsCollector = null;
}
