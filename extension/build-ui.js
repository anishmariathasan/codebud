const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const voiceUiDir = path.join(__dirname, '../voice-ui');
const extensionMediaDir = path.join(__dirname, 'media');

console.log('Building Voice UI...');

try {
    // Install dependencies if needed
    if (!fs.existsSync(path.join(voiceUiDir, 'node_modules'))) {
        console.log('Installing dependencies in voice-ui...');
        execSync('npm install', { cwd: voiceUiDir, stdio: 'inherit' });
    }

    // Build the React app
    console.log('Running npm run build in voice-ui...');
    execSync('npm run build', { cwd: voiceUiDir, stdio: 'inherit' });

    // Ensure extension media directory exists
    if (!fs.existsSync(extensionMediaDir)) {
        fs.mkdirSync(extensionMediaDir);
    }

    // Find and copy assets
    const distAssetsDir = path.join(voiceUiDir, 'dist/assets');
    const files = fs.readdirSync(distAssetsDir);

    // Look for the webview.js file (fixed name from vite config) or fallback to any .js
    let jsFile = files.find(f => f === 'webview.js');
    if (!jsFile) {
        jsFile = files.find(f => f.endsWith('.js') && !f.endsWith('.map'));
    }
    const cssFile = files.find(f => f.endsWith('.css'));

    if (jsFile) {
        fs.copyFileSync(
            path.join(distAssetsDir, jsFile),
            path.join(extensionMediaDir, 'webview.js')
        );
        console.log(`Copied ${jsFile} to media/webview.js`);
    } else {
        console.error('No JS file found in voice-ui/dist/assets');
        process.exit(1);
    }

    if (cssFile) {
        fs.copyFileSync(
            path.join(distAssetsDir, cssFile),
            path.join(extensionMediaDir, 'webview.css')
        );
        console.log(`Copied ${cssFile} to media/webview.css`);
    } else {
        console.log('No CSS file found in voice-ui/dist/assets. Creating empty webview.css.');
        fs.writeFileSync(path.join(extensionMediaDir, 'webview.css'), '/* No styles */');
    }

    console.log('Voice UI build completed successfully.');

} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
