import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const isCIEnvironment = process.env.CI !== undefined;
const useHttps = process.env.VITE_HTTPS === 'true';

if (useHttps) {
    console.log('🌐 Vite serving over HTTPS for localhost and network access');
} else {
    console.log('🌐 Vite serving over HTTP (set VITE_HTTPS=true for HTTPS)');
}

export default defineConfig(async (command) => {

    const { needlePlugins, useGzip, loadConfig } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();

    return {
        base: "./",
        assetsInclude: ['*'],
        plugins: [
            react(),
            useHttps ? basicSsl() : null,
            useGzip(needleConfig) && !isCIEnvironment ? viteCompression({ deleteOriginFile: true }) : null,
            needlePlugins(command, needleConfig),
        ],
        server: {
            https: useHttps,
            host: '0.0.0.0', // Listen on all network interfaces
            proxy: useHttps ? { // workaround: specifying a proxy skips HTTP2 which is currently problematic in Vite since it causes session memory timeouts.
                'https://localhost:3000': 'https://localhost:3000'
            } : undefined,
            strictPort: true,
            port: 3000,
        },
        build: {
            outDir: "./dist",
            emptyOutDir: true,
        }
    }
});