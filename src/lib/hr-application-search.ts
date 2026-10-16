import { z } from "zod";
import { hrReviewStatusSchema, type HRReviewStatus } from "@/lib/hr-input";

export const HR_APPLICATION_SEARCH_LIMIT = 100;
export const HR_APPLICATION_SEARCH_DELAY = 300;
export const HR_APPLICATION_PAGE_SIZE = 10;

export type HRApplicationWithdrawalFilter = "active" | "withdrawn" | "all";
export type HRApplicationSort = "newest" | "oldest";

export interface HRApplicationFilterParams {
  q: string;
  invalidSearch: boolean;
  job?: string;
  status?: HRReviewStatus;
  withdrawal: HRApplicationWithdrawalFilter;
  sort: HRApplicationSort;
  page: number;
  pageSize: number;
}

export interface HRApplicationListItem {
  id: string;
  applicant_id: string;
  full_name: string | null;
  job_id: string;
  job_title: string;
  submitted_at: string;
  review_status: HRReviewStatus;
  withdrawn_at: string | null;
  withdrawn_by: string | null;
}

export function normalizeSearchQuery(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

function parseSearchInput(raw: unknown): { q: string; invalidSearch: boolean } {
  if (typeof raw !== "string") {
    return { q: "", invalidSearch: false };
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(raw)) {
    return { q: "", invalidSearch: true };
  }
  const normalized = normalizeSearchQuery(raw);
  if ([...normalized].length > HR_APPLICATION_SEARCH_LIMIT) {
    return { q: "", invalidSearch: true };
  }
  return { q: normalized, invalidSearch: false };
}

function parseJobParam(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  return z.uuid().safeParse(raw).success ? raw : undefined;
}

function parseStatusParam(raw: unknown): HRReviewStatus | undefined {
  if (typeof raw !== "string") return undefined;
  const parsed = hrReviewStatusSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

function parseWithdrawalParam(raw: unknown): HRApplicationWithdrawalFilter {
  return raw === "active" || raw === "withdrawn" ? raw : "all";
}

function parseSortParam(raw: unknown): HRApplicationSort {
  return raw === "oldest" ? "oldest" : "newest";
}

function parsePageParam(raw: unknown): number {
  if (typeof raw === "string") {
    const val = parseInt(raw, 10);
    return !Number.isNaN(val) && val > 0 ? val : 1;
  }
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) {
    return raw;
  }
  return 1;
}

export function parseHRApplicationFilterParams(
  rawParams: Record<string, unknown>,
): HRApplicationFilterParams {
  const { q, invalidSearch } = parseSearchInput(rawParams.q);
  return {
    q,
    invalidSearch,
    job: parseJobParam(rawParams.job),
    status: parseStatusParam(rawParams.status),
    withdrawal: parseWithdrawalParam(rawParams.withdrawal),
    sort: parseSortParam(rawParams.sort),
    page: parsePageParam(rawParams.page),
    pageSize: HR_APPLICATION_PAGE_SIZE,
  };
}

export function filterApplications(
  applications: HRApplicationListItem[],
  params: HRApplicationFilterParams,
): HRApplicationListItem[] {
  if (params.invalidSearch) {
    return [];
  }

  const normalizedQuery = params.q
    ? normalizeSearchQuery(params.q).toLowerCase()
    : "";

  return applications.filter((app) => {
    // 1. Withdrawal filter
    if (params.withdrawal === "active" && app.withdrawn_at !== null) {
      return false;
    }
    if (params.withdrawal === "withdrawn" && app.withdrawn_at === null) {
      return false;
    }

    // 2. Job filter
    if (params.job && app.job_id !== params.job) {
      return false;
    }

    // 3. Status filter
    if (params.status && app.review_status !== params.status) {
      return false;
    }

    // 4. Search query on applicant name
    if (normalizedQuery) {
      const applicantName = app.full_name
        ? normalizeSearchQuery(app.full_name).toLowerCase()
        : "";
      if (!applicantName.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

export function sortApplications(
  applications: HRApplicationListItem[],
  sort: HRApplicationSort,
): HRApplicationListItem[] {
  const direction = sort === "oldest" ? 1 : -1;
  return [...applications].sort((a, b) => {
    if (a.submitted_at < b.submitted_at) return -1 * direction;
    if (a.submitted_at > b.submitted_at) return 1 * direction;
    if (a.id < b.id) return -1 * direction;
    if (a.id > b.id) return 1 * direction;
    return 0;
  });
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
  startIndex: number;
  endIndex: number;
}

export function paginateApplications<T>(
  items: T[],
  page: number,
  pageSize = HR_APPLICATION_PAGE_SIZE,
): PaginatedResult<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage =
    totalCount === 0 ? 1 : Math.max(1, Math.min(page, totalPages));

  if (totalCount === 0) {
    return {
      items: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize,
      hasPrev: false,
      hasNext: false,
      startIndex: 0,
      endIndex: 0,
    };
  }

  const offset = (currentPage - 1) * pageSize;
  const slicedItems = items.slice(offset, offset + pageSize);
  const startIndex = offset + 1;
  const endIndex = Math.min(offset + pageSize, totalCount);

  return {
    items: slicedItems,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    startIndex,
    endIndex,
  };
}

export function listDistinctJobsFromApplications(
  applications: Array<{ job_id: string; job_title: string }>,
): Array<{ id: string; title: string }> {
  const map = new Map<string, string>();
  for (const app of applications) {
    if (!map.has(app.job_id)) {
      map.set(app.job_id, app.job_title);
    }
  }
  return Array.from(map.entries())
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function buildHRApplicationsUrl(
  params: HRApplicationFilterParams,
  updates: Partial<HRApplicationFilterParams> = {},
): string {
  const merged = { ...params, ...updates };
  const searchParams = new URLSearchParams();

  if (merged.q) {
    searchParams.set("q", merged.q);
  }
  if (merged.job) {
    searchParams.set("job", merged.job);
  }
  if (merged.status) {
    searchParams.set("status", merged.status);
  }
  if (merged.withdrawal && merged.withdrawal !== "all") {
    searchParams.set("withdrawal", merged.withdrawal);
  }
  if (merged.sort && merged.sort !== "newest") {
    searchParams.set("sort", merged.sort);
  }
  if (merged.page && merged.page > 1) {
    searchParams.set("page", String(merged.page));
  }

  const qs = searchParams.toString();
  return qs ? `/hr/applications?${qs}` : "/hr/applications";
}
