import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const singlefileEnabled = process.env.VITE_SINGLEFILE === "1";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(singlefileEnabled ? [viteSingleFile()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: singlefileEnabled
      ? undefined
      : {
          output: {
            manualChunks(id) {
              if (id.includes("/src/pricing/seed/price-items.json")) {
                return "price-catalog";
              }
              if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/scheduler")) {
                return "react-vendor";
              }
              if (id.includes("node_modules/three/")) {
                return "three-core";
              }
              if (id.includes("node_modules/@react-three") || id.includes("node_modules/@pmndrs") || id.includes("node_modules/three-stdlib") || id.includes("node_modules/@react-spring")) {
                return "three-viewer";
              }
              if (id.includes("node_modules/@supabase")) {
                return "supabase-vendor";
              }
              if (id.includes("node_modules")) {
                return "vendor";
              }
            },
          },
        },
  },
});
