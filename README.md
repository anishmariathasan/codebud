# CodeBud
Voice powered AI pair programmer so you actually understand the codebase, with personalised feedback to improve your coding. 

## Installation

### From GitHub Releases (Recommended)
1. Download the latest `.vsix` file from [Releases](https://github.com/your-username/codebud/releases)
2. In VS Code: `Cmd+Shift+P` → **"Extensions: Install from VSIX..."**
3. Select the downloaded file and reload VS Code
4. Open the **CodeBud** panel from the sidebar (🎤 icon)
5. Enter your ElevenLabs Agent ID and start coding!

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

Then follow [docs/AGENT_SETUP.md](docs/AGENT_SETUP.md) to configure your ElevenLabs agent.

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
├── docs/AGENT_SETUP.md  # ElevenLabs setup guide
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
