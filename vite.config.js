import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

import { checkApiUrl } from "./vite.guards";

export default defineConfig(({ mode }) => {
  const fromFiles = loadEnv(mode, process.cwd(), "VITE_");
  checkApiUrl(mode, process.env.VITE_API_URL || fromFiles.VITE_API_URL);

  return { plugins: [react()] };
});
