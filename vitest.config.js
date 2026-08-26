import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Environnement node : tout ce qui est teste ici est de la logique pure ou
    // des hooks dont les primitives sont remplacees. Aucun rendu, donc aucun
    // besoin de jsdom.
    environment: "node",
    include: ["src/tests/**/*.test.js"],
    restoreMocks: true,
  },
});
