# CodeBud
Voice powered AI pair programmer so you actually understand the codebase, with personalised feedback to improve your coding.

## Features

- **Voice-Powered Conversations** — Talk naturally with your AI pair programmer using ElevenLabs voice technology. Ask questions, request explanations, and get real-time feedback without leaving your editor.

- **Real-Time Code Monitoring** — CodeBud silently watches your coding activity, tracking file changes, cursor position, and typing patterns to provide contextually relevant assistance.

- **Driver/Navigator Modes** — Switch between modes to control how the AI interacts with your code:
  - **Driver Mode**: AI can insert and modify code directly in your editor
  - **Navigator Mode**: AI provides guidance and suggestions without making changes

- **Auto-Review on Typing Pause** — When you pause typing, CodeBud automatically reviews your recent code changes and offers constructive feedback, catching potential issues early.

- **Insights Panel** — AI-powered analytics dashboard that summarizes your coding sessions using Gemini, highlighting common errors, improvement areas, and personalized learning suggestions.

- **Live Transcript** — Full conversation history displayed in real-time, so you never lose track of the AI's suggestions and explanations.

- **VS Code Integration** — Seamlessly embedded as a VS Code extension with keyboard shortcuts for quick access. 

## Installation

### Development Setup
```bash
# Install dependencies
npm run setup

# Start extension: Open extension/ folder in VS Code, press F5

# Start voice UI (optional - now bundled in extension)
npm run ui
```

### Build VSIX Package
```bash
cd extension
npm install
npm run package
# Creates: extension/codebud-0.1.0.vsix
```

### Install VSIX Package

**Option 1: Command Line**
```bash
code --install-extension extension/codebud-0.1.0.vsix
```

**Option 2: VS Code GUI**
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Click the `...` menu (top-right of Extensions panel)
4. Select **Install from VSIX...**
5. Navigate to `extension/codebud-0.1.0.vsix` and select it

After installation, reload VS Code when prompted.

## File Structure

```
codebud/
├── extension/           # VS Code extension
│   ├── src/
│   │   ├── extension.ts     # Express server + API routes
│   │   ├── codeWatcher.ts   # Tracks code context
│   │   ├── diagnostics.ts   # Gets errors/warnings
│   │   ├── modeManager.ts   # Driver/navigator modes
│   │   ├── commands.ts      # VS Code commands
│   │   └── editorActions.ts # Code insertion
│   └── package.json
│
├── voice-ui/            # React browser UI
│   ├── src/
│   │   ├── App.tsx          # Main app with ElevenLabs
│   │   ├── config.ts        # Agent ID goes here
│   │   ├── api.ts           # HTTP client
│   │   ├── clientTools.ts   # AI tool handlers
│   │   └── components/      # UI components
│   └── package.json
│
├── shared/types.ts      # API type definitions
└── scripts/test-api.sh  # API test script
```

## Keyboard Shortcuts

| Shortcut       | Action                  |
| -------------- | ----------------------- |
| `Ctrl+Shift+B` | Open Voice UI           |
| `Ctrl+Shift+M` | Toggle Driver/Navigator |

## API Endpoints (localhost:3001)

| Endpoint           | Method | Description               |
| ------------------ | ------ | ------------------------- |
| `/api/context`     | GET    | Current code context      |
| `/api/diagnostics` | GET    | File errors/warnings      |
| `/api/insert`      | POST   | Insert code (driver mode) |
| `/api/mode`        | POST   | Switch mode               |
| `/api/status`      | GET    | Extension status          |
