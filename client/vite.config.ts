import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
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
});
