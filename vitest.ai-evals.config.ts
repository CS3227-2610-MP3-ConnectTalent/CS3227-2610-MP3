import { defineConfig } from "vitest/config";
import base from "./vitest.config";

export default defineConfig({
  resolve: base.resolve,
  test: {
    include: ["tests/evals/offline.eval.ts"],
    coverage: { enabled: false },
  },
});
