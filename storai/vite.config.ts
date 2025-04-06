import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

// Define a base configuration that will be extended
const baseConfig: UserConfig = {
  plugins: [react()],
  // Prevent vite from obscuring rust errors
  clearScreen: false,
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // To make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
  // `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
  // env variables
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuildingForWeb = mode === 'web';
  
  if (isBuildingForWeb) {
    console.log('🌐 Building for Web');
    return {
      ...baseConfig,
      // Use a different build output directory for web
      build: {
        ...baseConfig.build,
        outDir: 'dist-web',
        // For web builds, we can use modern JavaScript features
        target: 'esnext',
      },
      // Use a different port for web mode to avoid conflicts
      server: {
        ...baseConfig.server,
        port: 3030, // Changed to 3030 to avoid port conflicts
        strictPort: false, // Allow Vite to use next available port if 3030 is in use
      },
      // Create mock implementations of Tauri APIs for web
      define: {
        // Create a mock __TAURI__ global for the web
        '__TAURI__': JSON.stringify({}),
        // Add any other Tauri globals that might be referenced
        '__TAURI_METADATA__': JSON.stringify({ version: 'web-mock' }),
      },
      // Provide shims for Tauri imports
      resolve: {
        alias: [
          // Create empty mocks for Tauri APIs
          { find: '@tauri-apps/api/tauri', replacement: resolve(__dirname, 'src/infrastructure/platform/tauri-shims/tauri.ts') },
          { find: '@tauri-apps/api/path', replacement: resolve(__dirname, 'src/infrastructure/platform/tauri-shims/path.ts') },
          { find: '@tauri-apps/api/core', replacement: resolve(__dirname, 'src/infrastructure/platform/tauri-shims/core.ts') },
          { find: '@tauri-apps/plugin-fs', replacement: resolve(__dirname, 'src/infrastructure/platform/tauri-shims/fs.ts') },
          // Special handling for SQL plugin to ensure it's properly aliased
          { find: '@tauri-apps/plugin-sql', replacement: resolve(__dirname, 'src/infrastructure/platform/tauri-shims/sql.ts') },
          // Catch-all for any other @tauri-apps/api imports
          { find: /^@tauri-apps\/api(?:\/(.*))?$/, replacement: resolve(__dirname, 'src/infrastructure/platform/tauri-shims/api.ts') },
        ]
      }
    };
  }
  
  console.log('🖥️ Building for Desktop');
  return baseConfig;
});
