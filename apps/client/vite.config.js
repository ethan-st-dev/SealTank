import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

const isCIEnvironment = process.env.CI !== undefined;
const useHttps = true; // Force HTTPS

console.log('🌐 Vite serving over HTTPS with trusted certificates');

export default defineConfig(async (command) => {

    const { needlePlugins, useGzip, loadConfig } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();

    return {
        base: "./",
        assetsInclude: ['*'],
        plugins: [
            react(),
            useGzip(needleConfig) && !isCIEnvironment ? viteCompression({ deleteOriginFile: true }) : null,
            needlePlugins(command, needleConfig),
        ],
        server: {
            https: useHttps ? {
                key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
                cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
            } : false,
            host: '0.0.0.0', // Listen on all network interfaces
            strictPort: true,
            port: 3000,
        },
        build: {
            outDir: "./dist",
            emptyOutDir: true,
        }
    }
});