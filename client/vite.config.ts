import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      crypto: 'crypto-browserify', 
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        process: 'process.browser',
      },
      inject: [
        'node_modules/@esbuild-plugins/node-globals-polyfill/process.js',
        'node_modules/@esbuild-plugins/node-globals-polyfill/buffer.js',
      ],
    },
    include: [
      'buffer',
      'stream-browserify',
      'util',
      'crypto-browserify', 
      '@solana/web3.js',
      'ipfs-http-client',
      '@metaplex-foundation/js',
    ],
  },
  define: {
    'process.env': {},
  },
});
