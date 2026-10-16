import { spawnSync } from "node:child_process";

if (process.argv.slice(2).join(" ") !== "--live" || process.env.CI) {
  console.error(
    "Live evaluations require an explicit local --live invocation.",
  );
  process.exit(1);
}
// Approval and separate safety review must be recorded before the operator runs this.
const result = spawnSync(
  process.execPath,
  [
    "node_modules/vitest/vitest.mjs",
    "run",
    "--config",
    "vitest.ai-live.config.ts",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_USE_SYSTEM_CA: "1",
      AI_EVAL_LIVE_AUTHORIZATION: "ai-security-v1-live12",
    },
  },
);
process.exit(result.status ?? 1);
