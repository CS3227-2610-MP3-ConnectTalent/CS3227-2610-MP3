export class LiveBudget {
  private calls = 0;
  private lastStart = -Infinity;
  constructor(
    private now: () => number = () => performance.now(),
    private sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}
  async reserve() {
    if (this.calls >= 24)
      throw new Error("Live evaluation call budget exhausted.");
    // Reserve before awaiting; a failed call still consumes an attempt.
    this.calls++;
    const wait = Math.max(0, this.lastStart + 10_000 - this.now());
    if (wait) await this.sleep(wait);
    this.lastStart = this.now();
  }
}
