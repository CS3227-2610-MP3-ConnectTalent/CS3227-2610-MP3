export const SUPABASE_PAGE_SIZE = 500;

type PageResult<T> = {
  data: T[] | null;
  error: unknown;
};

/** Fetch complete pages ordered by ID ASC with an exclusive ID cursor. */
export async function fetchAllPages<T extends { id: string }>(
  loadPage: (
    afterId: string | null,
    pageSize: number,
  ) => PromiseLike<PageResult<T>>,
  pageSize = SUPABASE_PAGE_SIZE,
): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("Page size must be a positive integer.");
  }

  const rows: T[] = [];
  let afterId: string | null = null;
  for (;;) {
    const { data, error } = await loadPage(afterId, pageSize);
    if (error) throw error;

    const page = data ?? [];
    if (page.length > pageSize) {
      throw new Error("Pagination query returned more rows than requested.");
    }

    let previousId = afterId;
    for (const row of page) {
      if (!row.id || (previousId !== null && row.id <= previousId)) {
        throw new Error(
          "Pagination query must return strictly increasing IDs.",
        );
      }
      previousId = row.id;
    }

    rows.push(...page);
    if (page.length < pageSize) return rows;
    afterId = page[page.length - 1].id;
  }
}

/** Restore a collection's timestamp and ID ordering after keyset retrieval. */
export function sortByTimestampAndId<T extends { id: string }>(
  rows: T[],
  getTimestamp: (row: T) => string,
  ascending: boolean,
): T[] {
  const direction = ascending ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftTimestamp = getTimestamp(left);
    const rightTimestamp = getTimestamp(right);
    const timestampOrder =
      leftTimestamp < rightTimestamp
        ? -1
        : leftTimestamp > rightTimestamp
          ? 1
          : 0;
    if (timestampOrder !== 0) return timestampOrder * direction;
    const idOrder = left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
    return idOrder * direction;
  });
}
