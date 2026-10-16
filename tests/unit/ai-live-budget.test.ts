import { expect, it } from "vitest";
import { LiveBudget } from "../evals/live-budget";

it("reserves at most 24 attempts and spaces their starts even if calls fail", async () => {
  let now = 0;
  const starts: number[] = [];
  const budget = new LiveBudget(
    () => now,
    async (ms) => {
      now += ms;
    },
  );
  for (let index = 0; index < 24; index++) {
    await budget.reserve();
    starts.push(now);
  }
  expect(
    starts.slice(1).every((start, index) => start - starts[index] >= 10_000),
  ).toBe(true);
  await expect(budget.reserve()).rejects.toThrow("budget");
});
