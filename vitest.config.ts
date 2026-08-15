import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  // Vite only recognises lower case image extensions, and some pet photos are named .JPG.
  assetsInclude: ['**/*.JPG'],
});
