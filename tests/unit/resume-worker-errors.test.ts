import { EventEmitter } from "node:events";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock("node:worker_threads", () => ({
  Worker: class {
    constructor(...args: unknown[]) {
      return mocks.start(...args);
    }
  },
}));
import { validateResume } from "@/lib/resume-input";

let worker: EventEmitter & { terminate: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  worker = Object.assign(new EventEmitter(), {
    terminate: vi.fn().mockResolvedValue(0),
  });
  mocks.start.mockReset().mockReturnValue(worker);
});
afterEach(() => vi.useRealTimers());
const file = () =>
  new File(["%PDF-1.7\nsynthetic\n%%EOF"], "synthetic.pdf", {
    type: "application/pdf",
  });

it("reports a worker startup error as a server failure", async () => {
  mocks.start.mockImplementation(() => {
    throw new Error("private runtime path");
  });
  await expect(validateResume(file())).rejects.toMatchObject({
    code: "RESUME_VALIDATOR_UNAVAILABLE",
  });
});

it.each(["error", "exit"])(
  "reports worker %s without blaming the file",
  async (event) => {
    const pending = validateResume(file()).catch((error) => error);
    await vi.waitFor(() => expect(mocks.start).toHaveBeenCalled());
    worker.emit(
      event,
      event === "error" ? new Error("private runtime detail") : 0,
    );
    await expect(pending).resolves.toMatchObject({
      code: "RESUME_VALIDATOR_UNAVAILABLE",
    });
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  },
);

it("times out once and ignores late worker completion", async () => {
  const pending = validateResume(file()).catch((error) => error);
  await vi.waitFor(() => expect(mocks.start).toHaveBeenCalled());
  await vi.advanceTimersByTimeAsync(3000);
  await expect(pending).resolves.toMatchObject({
    code: "RESUME_VALIDATION_TIMEOUT",
  });
  worker.emit("message", "valid");
  worker.emit("exit", 1);
  expect(worker.terminate).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it.each(["unavailable", { unexpected: "private parser detail" }])(
  "rejects non-success worker messages safely",
  async (result) => {
    const pending = validateResume(file()).catch((error) => error);
    await vi.waitFor(() => expect(mocks.start).toHaveBeenCalled());
    worker.emit("message", result);
    await expect(pending).resolves.toMatchObject({
      code: "RESUME_VALIDATOR_UNAVAILABLE",
    });
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  },
);

it("terminates a successful worker and ignores subsequent exit", async () => {
  const pending = validateResume(file());
  await vi.waitFor(() => expect(mocks.start).toHaveBeenCalled());
  worker.emit("message", "valid");
  worker.emit("exit", 1);
  await expect(pending).resolves.toMatchObject({ filename: "synthetic.pdf" });
  expect(worker.terminate).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});
