import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStatsPlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteStatsPlugin()],
});
