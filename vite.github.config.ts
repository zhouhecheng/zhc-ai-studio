import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(import.meta.dirname, "github-pages"),
  base: "/zhc-ai-studio/",
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: resolve(import.meta.dirname, "dist-github"),
    emptyOutDir: true,
  },
});
