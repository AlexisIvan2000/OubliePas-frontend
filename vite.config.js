import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

import { checkApiUrl, isHostedBuild } from "./vite.guards";

export default defineConfig(({ mode }) => {
  const fromFiles = loadEnv(mode, process.cwd(), "VITE_");
  const warning = checkApiUrl(mode, process.env.VITE_API_URL || fromFiles.VITE_API_URL, {
    hosted: isHostedBuild(process.env),
  });

  if (warning) {
    console.warn(`\n  ${warning}\n`);
  }

  return { plugins: [react()] };
});
