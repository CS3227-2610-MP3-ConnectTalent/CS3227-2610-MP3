import { defineConfig } from "vitest/config";
import base from "./vitest.config";

export default defineConfig({
  resolve: base.resolve,
  test: {
    include: ["tests/evals/live.eval.ts"],
    testTimeout: 800_000,
    retry: 0,
    coverage: { enabled: false },
  },
});
