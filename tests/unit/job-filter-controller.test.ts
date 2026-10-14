import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { JobFilterController } from "@/lib/job-filter-controller";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("suppresses unchanged Search after a superseded request never acknowledges", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController({ query: "" }, navigate);
  controller.edit("software");
  controller.go();
  controller.edit("recruitment");
  controller.go();
  controller.confirm({ query: "recruitment" });
  controller.go();
  controller.go();
  expect(navigate).toHaveBeenCalledTimes(2);
});

it("can return to confirmed filters while an older request is pending", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController({ query: "" }, navigate);
  controller.edit("software");
  controller.go();
  controller.clear();
  expect(navigate).toHaveBeenLastCalledWith("/", false);
  controller.confirm({ query: "" });
  controller.go();
  expect(navigate).toHaveBeenCalledTimes(2);
});

it("waits 300 ms after the last edit and replaces history only once", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController({ query: "" }, navigate);
  controller.edit("soft");
  vi.advanceTimersByTime(250);
  controller.edit("software");
  vi.advanceTimersByTime(299);
  expect(navigate).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/?q=software", true);
});

it("Search and category act immediately and cancel old timers", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController({ query: "" }, navigate);
  controller.edit("software");
  controller.category("engineering");
  expect(navigate).toHaveBeenCalledExactlyOnceWith(
    "/?category=engineering&q=software",
    false,
  );
  vi.advanceTimersByTime(500);
  expect(navigate).toHaveBeenCalledTimes(1);
  controller.edit("typescript");
  controller.go();
  expect(navigate).toHaveBeenLastCalledWith(
    "/?category=engineering&q=typescript",
    false,
  );
});

it("does not navigate during composition or when the phrase is invalid", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController({ query: "" }, navigate);
  controller.composition(true);
  controller.edit("software");
  controller.go();
  vi.advanceTimersByTime(500);
  expect(navigate).not.toHaveBeenCalled();
  controller.composition(false);
  vi.advanceTimersByTime(300);
  expect(navigate).toHaveBeenCalledTimes(1);
  controller.edit("a".repeat(101));
  controller.go();
  vi.advanceTimersByTime(500);
  expect(navigate).toHaveBeenCalledTimes(1);
});

it("does not erase newer typing when an older request completes", () => {
  const controller = new JobFilterController({ query: "" }, vi.fn());
  controller.edit("software");
  vi.advanceTimersByTime(300);
  controller.edit("people");
  controller.confirm({ query: "software" });
  expect(controller.getSnapshot().query).toBe("people");
});

it("history restoration and leaving cancel stale timers", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController({ query: "software" }, navigate);
  controller.edit("people");
  controller.restore({ query: "sales", category: "sales" });
  vi.advanceTimersByTime(500);
  expect(navigate).not.toHaveBeenCalled();
  expect(controller.getSnapshot()).toEqual({
    query: "sales",
    category: "sales",
  });
  controller.edit("new");
  controller.leave();
  vi.advanceTimersByTime(500);
  expect(navigate).not.toHaveBeenCalled();
});

it("Clear cancels typing and retains category", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController(
    { query: "software", category: "sales" },
    navigate,
  );
  controller.edit("people");
  controller.clear();
  vi.advanceTimersByTime(500);
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/?category=sales", false);
});

it("Clear repairs an invalid URL even when the visible query is blank", () => {
  const navigate = vi.fn();
  const controller = new JobFilterController(
    { query: "", invalid: true },
    navigate,
  );
  controller.clear();
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/", false);
});
