import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['stream-browserify', 'util', 'buffer'],
  },
});
