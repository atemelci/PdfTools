import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A classic (non-module) <script> is required so the built app loads from the
// file:// protocol that Electron uses. ES-module scripts are blocked by CORS
// under file://, so we emit a single IIFE bundle and strip type="module".
function classicScript() {
  return {
    name: "classic-script",
    transformIndexHtml(html) {
      return html
        .replace(/\s+type="module"/g, "")
        .replace(/\s+crossorigin/g, "")
        // Classic scripts are not deferred by default; add defer so the bundle
        // runs after #root exists in the DOM.
        .replace(/<script(\s+src=)/g, "<script defer$1");
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), classicScript()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2020",
    modulePreload: false,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "assets/app.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
