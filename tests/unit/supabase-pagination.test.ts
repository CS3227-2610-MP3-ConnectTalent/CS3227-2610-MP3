import { expect, it, vi } from "vitest";

import {
  fetchAllPages,
  sortByTimestampAndId,
  SUPABASE_PAGE_SIZE,
} from "@/lib/supabase/pagination";

it("fetches every page and an empty terminal page for exact multiples", async () => {
  const values = ["01", "02", "03", "04"].map((id) => ({ id }));
  const cursors: Array<string | null> = [];
  const loadPage = vi.fn(async (afterId: string | null, pageSize: number) => {
    cursors.push(afterId);
    const page = values
      .filter((row) => afterId === null || row.id > afterId)
      .slice(0, pageSize);
    return { data: page, error: null };
  });

  await expect(fetchAllPages(loadPage, 2)).resolves.toEqual(values);

  expect(cursors).toEqual([null, "02", "04"]);
});

it("stops after the final short page", async () => {
  const values = ["01", "02", "03"].map((id) => ({ id }));
  const loadPage = vi.fn(async (afterId: string | null, pageSize: number) => ({
    data: values
      .filter((row) => afterId === null || row.id > afterId)
      .slice(0, pageSize),
    error: null,
  }));

  await expect(fetchAllPages(loadPage, 2)).resolves.toEqual(values);
  expect(loadPage).toHaveBeenCalledTimes(2);
});

it("does not repeat rows when an earlier ID is inserted between pages", async () => {
  const rows = ["01", "02", "03", "04"].map((id) => ({ id }));
  const expected = [...rows];
  const cursors: Array<string | null> = [];
  let inserted = false;
  const loadPage = vi.fn(async (afterId: string | null, pageSize: number) => {
    cursors.push(afterId);
    const page = rows
      .filter((row) => afterId === null || row.id > afterId)
      .slice(0, pageSize);
    if (!inserted) {
      rows.unshift({ id: "00" });
      inserted = true;
    }
    return { data: page, error: null };
  });

  await expect(fetchAllPages(loadPage, 2)).resolves.toEqual(expected);
  expect(cursors).toEqual([null, "02", "04"]);
});

it("restores timestamp and ID ordering after reading by ID cursor", () => {
  const rows = [
    { id: "03", created_at: "2026-10-02T00:00:00Z" },
    { id: "01", created_at: "2026-10-01T00:00:00Z" },
    { id: "02", created_at: "2026-10-02T00:00:00Z" },
  ];

  expect(
    sortByTimestampAndId(rows, (row) => row.created_at, false).map(
      ({ id }) => id,
    ),
  ).toEqual(["03", "02", "01"]);
  expect(
    sortByTimestampAndId(rows, (row) => row.created_at, true).map(
      ({ id }) => id,
    ),
  ).toEqual(["01", "02", "03"]);
});

it("rejects a page whose IDs do not advance the keyset cursor", async () => {
  const loadPage = vi.fn(async () => ({
    data: [{ id: "02" }, { id: "01" }],
    error: null,
  }));

  await expect(fetchAllPages(loadPage, 2)).rejects.toThrow(
    "Pagination query must return strictly increasing IDs",
  );
});

it("rejects rather than returning a partial result when a later page fails", async () => {
  const failure = new Error("synthetic page failure");
  const loadPage = vi
    .fn()
    .mockResolvedValueOnce({ data: [{ id: "01" }, { id: "02" }], error: null })
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
