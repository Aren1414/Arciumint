import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import inject from "@rollup/plugin-inject";


export default defineConfig({
  base: "/", 
  define: {
    global: "globalThis", 
  },
  plugins: [react()],
  resolve: {
    alias: {
      stream: "stream-browserify",
      util: "util",
      buffer: "buffer",
      crypto: "crypto-browserify",
      events: "events",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ["buffer", "Buffer"],
          process: "process",
        }),
      ],
    },
  },
});
