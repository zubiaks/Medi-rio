import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: true, target: "es2022" },
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*-batch/**", "**/m3u-resilient-batch/**", "**/coverage/**"],
    clearMocks: true,
  },
});
