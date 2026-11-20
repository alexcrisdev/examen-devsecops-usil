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
      // Capa de E/S con Supabase (datos.ts, auditoria) y acciones: se validan con smoke/pipeline, no con unitarias.
      exclude: ["src/lib/supabase/**", "src/lib/auth.ts", "src/lib/auditoria.ts", "**/actions.ts", "**/datos.ts"],
      reporter: ["text", "json-summary", "html"],
      thresholds: { lines: 70, functions: 70, branches: 60 },
    },
  },
});
