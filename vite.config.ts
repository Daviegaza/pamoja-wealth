import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react-dom/client"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react-router-dom",
      "zustand",
      "zustand/middleware",
      "@tanstack/react-query",
      "axios",
      "zod",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "framer-motion",
      "lucide-react",
      "sonner",
      "socket.io-client",
      "recharts",
      "clsx",
      "tailwind-merge",
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: "localhost",
    // Explicit HMR config — without this, browsers behind proxies /
    // Docker Desktop / WSL can fail to reach the HMR socket and you get
    // "[vite] failed to connect to websocket" spam plus stale bundles.
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws",
      clientPort: 5173,
    },
    // Kill any stale service worker registration from prior prod builds.
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          // Keep the entire React ecosystem (react + react-dom + react-router
          // + scheduler + react-is + use-sync-external-store) in ONE chunk to
          // avoid the "Invalid hook call — two copies of React" error caused
          // by chunk boundaries. This check runs FIRST for that reason.
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|react-is|use-sync-external-store)[\\/]/.test(id)) return "react-core";
          if (/[\\/]recharts[\\/]/.test(id) || /[\\/]d3-/.test(id) || /[\\/]victory-vendor[\\/]/.test(id)) return "charts";
          if (/[\\/]framer-motion[\\/]/.test(id) || /[\\/]motion-dom[\\/]/.test(id) || /[\\/]motion-utils[\\/]/.test(id)) return "motion";
          if (/[\\/]lucide-react[\\/]/.test(id)) return "icons";
          if (/[\\/]@tanstack[\\/]/.test(id) || /[\\/]zustand[\\/]/.test(id) || /[\\/]axios[\\/]/.test(id)) return "data";
          if (/[\\/]react-hook-form[\\/]/.test(id) || /[\\/]@hookform[\\/]/.test(id) || /[\\/]zod[\\/]/.test(id)) return "forms";
          if (/[\\/]socket\.io-client[\\/]/.test(id) || /[\\/]engine\.io-client[\\/]/.test(id)) return "realtime";
          return "vendor";
        },
      },
    },
  },
});
