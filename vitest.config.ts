import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Keep the server-only import guard in production while allowing Node-based unit tests to load server modules.
      "server-only": fileURLToPath(
        new URL("./node_modules/next/dist/compiled/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: process.env.CI
      ? { junit: "test-results/vitest-junit.xml" }
      : undefined,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text-summary", "json-summary", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
