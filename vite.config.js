import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // <-- TAMBAHKAN BAGIAN INI
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
