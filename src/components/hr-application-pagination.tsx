import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildHRApplicationsUrl,
  type HRApplicationFilterParams,
  type PaginatedResult,
} from "@/lib/hr-application-search";

export function HRApplicationPagination({
  pagination,
  params,
}: {
  pagination: PaginatedResult<unknown>;
  params: HRApplicationFilterParams;
}) {
  if (pagination.totalCount === 0) return null;

  const prevUrl = pagination.hasPrev
    ? buildHRApplicationsUrl(params, { page: pagination.currentPage - 1 })
    : "#";

  const nextUrl = pagination.hasNext
    ? buildHRApplicationsUrl(params, { page: pagination.currentPage + 1 })
    : "#";

  return (
    <nav
      aria-label="Application review pagination"
      className="flex flex-col items-center justify-between gap-4 border-t pt-5 sm:flex-row"
    >
      <PaginationSummary
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        totalCount={pagination.totalCount}
      />
      <div className="flex items-center gap-2">
        <PrevButton hasPrev={pagination.hasPrev} url={prevUrl} />
        <span className="px-2 text-sm font-medium">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <NextButton hasNext={pagination.hasNext} url={nextUrl} />
      </div>
    </nav>
  );
}

function PaginationSummary({
  startIndex,
  endIndex,
  totalCount,
}: {
  startIndex: number;
  endIndex: number;
  totalCount: number;
}) {
  return (
    <p className="text-sm text-muted-foreground">
      Showing <span className="font-medium text-foreground">{startIndex}</span>{" "}
      to <span className="font-medium text-foreground">{endIndex}</span> of{" "}
      <span className="font-medium text-foreground">{totalCount}</span>{" "}
      applications
    </p>
  );
}

function PrevButton({ hasPrev, url }: { hasPrev: boolean; url: string }) {
  if (hasPrev) {
    return (
      <Link
        href={url}
        className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium hover:bg-muted"
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Previous
      </Link>
    );
  }
  return (
    <span
      className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
      aria-disabled="true"
    >
      <ChevronLeft size={16} aria-hidden="true" />
      Previous
    </span>
  );
}

function NextButton({ hasNext, url }: { hasNext: boolean; url: string }) {
  if (hasNext) {
    return (
      <Link
        href={url}
        className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium hover:bg-muted"
        aria-label="Go to next page"
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    );
  }
  return (
    <span
      className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
      aria-disabled="true"
    >
      Next
      <ChevronRight size={16} aria-hidden="true" />
    </span>
  );
}
