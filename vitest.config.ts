import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/features/**"],
      exclude: ["src/lib/supabase/**", "src/lib/auth.ts", "**/actions.ts"],
      reporter: ["text", "json-summary", "html"],
      thresholds: { lines: 70, functions: 70, branches: 60 },
    },
  },
});
