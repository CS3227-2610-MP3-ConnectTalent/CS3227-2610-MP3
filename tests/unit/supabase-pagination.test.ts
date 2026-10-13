import { expect, it, vi } from "vitest";

import { fetchAllPages, SUPABASE_PAGE_SIZE } from "@/lib/supabase/pagination";

it("fetches every page and an empty terminal page for exact multiples", async () => {
  const values = ["first", "second", "third", "fourth"];
  const ranges: Array<[number, number]> = [];
  const loadPage = vi.fn(async (from: number, to: number) => {
    ranges.push([from, to]);
    return { data: values.slice(from, to + 1), error: null };
  });

  await expect(fetchAllPages(loadPage, 2)).resolves.toEqual(values);

  expect(ranges).toEqual([
    [0, 1],
    [2, 3],
    [4, 5],
  ]);
});

it("stops after the final short page", async () => {
  const values = ["first", "second", "third"];
  const loadPage = vi.fn(async (from: number, to: number) => ({
    data: values.slice(from, to + 1),
    error: null,
  }));

  await expect(fetchAllPages(loadPage, 2)).resolves.toEqual(values);
  expect(loadPage).toHaveBeenCalledTimes(2);
});

it("rejects rather than returning a partial result when a later page fails", async () => {
  const failure = new Error("synthetic page failure");
  const loadPage = vi
    .fn()
    .mockResolvedValueOnce({ data: [1, 2], error: null })
    .mockResolvedValueOnce({ data: null, error: failure });

  await expect(fetchAllPages(loadPage, 2)).rejects.toBe(failure);
  expect(loadPage).toHaveBeenCalledTimes(2);
});

it("uses a bounded page size below the configured Data API cap", () => {
  expect(SUPABASE_PAGE_SIZE).toBe(500);
  expect(SUPABASE_PAGE_SIZE).toBeLessThan(1000);
});

it("rejects invalid page sizes before querying", async () => {
  const loadPage = vi.fn();

  await expect(fetchAllPages(loadPage, 0)).rejects.toThrow(
    "Page size must be a positive integer",
  );
  expect(loadPage).not.toHaveBeenCalled();
});
