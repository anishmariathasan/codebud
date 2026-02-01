import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        // Output as IIFE for VS Code webview compatibility
        rollupOptions: {
            output: {
                format: 'iife',
                entryFileNames: 'assets/webview.js',
                assetFileNames: 'assets/[name][extname]',
                // Ensure styles are extracted
                inlineDynamicImports: true,
            },
        },
        // CSS will be inlined into the JS bundle
        cssCodeSplit: false,
    },
});
