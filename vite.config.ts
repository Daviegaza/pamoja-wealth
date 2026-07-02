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
  },
});
