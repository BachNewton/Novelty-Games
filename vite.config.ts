import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      buildBase: '/Novelty-Games/',
    }),
  ],
  base: '/Novelty-Games/',
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  assetsInclude: ['**/*.fbx', '**/*.gltf', '**/*.glb', '**/*.controller', '**/*.mat'],
}));
