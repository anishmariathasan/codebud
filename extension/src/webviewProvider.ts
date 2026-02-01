import * as vscode from 'vscode';

/**
 * WebviewProvider - Manages the CodeBud Voice UI webview panel
 */
export class WebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codebud.voiceUI';

    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlContent(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'ready':
                    console.log('Webview ready');
                    break;
                case 'error':
                    vscode.window.showErrorMessage(`CodeBud: ${message.text}`);
                    break;
            }
        });
    }

    /**
     * Send a message to the webview
     */
    public postMessage(message: unknown): void {
        this._view?.webview.postMessage(message);
    }

    private _getHtmlContent(webview: vscode.Webview): string {
        // Get URIs for bundled assets
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.css')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' https://elevenlabs.io; connect-src http://localhost:3001 https://*.elevenlabs.io wss://*.elevenlabs.io; media-src blob:;">
    <link href="${styleUri}" rel="stylesheet">
    <title>CodeBud</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

/**
 * Also support opening as a panel (full editor area)
 */
export class WebviewPanelManager {
    private static currentPanel: vscode.WebviewPanel | undefined;

    public static createOrShow(extensionUri: vscode.Uri): void {
        const column = vscode.ViewColumn.Beside;

        if (WebviewPanelManager.currentPanel) {
            WebviewPanelManager.currentPanel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'codebud.voicePanel',
            'CodeBud Voice',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri],
            }
        );

        WebviewPanelManager.currentPanel = panel;

        panel.webview.html = getWebviewContent(panel.webview, extensionUri);

        panel.onDidDispose(() => {
            WebviewPanelManager.currentPanel = undefined;
        });
    }
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'webview.js')
    );
    const styleUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'webview.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' https://elevenlabs.io; connect-src http://localhost:3001 https://*.elevenlabs.io wss://*.elevenlabs.io; media-src blob:;">
    <link href="${styleUri}" rel="stylesheet">
    <title>CodeBud Voice</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
