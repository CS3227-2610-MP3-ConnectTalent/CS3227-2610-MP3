import type {
  HRApplicationFilterParams,
  HRApplicationSort,
  HRApplicationWithdrawalFilter,
} from "@/lib/hr-application-search";
import type { HRReviewStatus } from "@/lib/hr-input";

export function FilterDropdowns({
  initialParams,
  jobs,
  navigate,
}: {
  initialParams: HRApplicationFilterParams;
  jobs: Array<{ id: string; title: string }>;
  navigate: (updates: Partial<HRApplicationFilterParams>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <JobSelect job={initialParams.job} jobs={jobs} navigate={navigate} />
      <StatusSelect status={initialParams.status} navigate={navigate} />
      <WithdrawalSelect
        withdrawal={initialParams.withdrawal}
        navigate={navigate}
      />
      <SortSelect sort={initialParams.sort} navigate={navigate} />
    </div>
  );
}

function JobSelect({
  job,
  jobs,
  navigate,
}: {
  job?: string;
  jobs: Array<{ id: string; title: string }>;
  navigate: (updates: Partial<HRApplicationFilterParams>) => void;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor="filter-job"
        className="text-xs font-semibold text-muted-foreground"
      >
        Role
      </label>
      <select
        id="filter-job"
        value={job ?? ""}
        onChange={(e) => navigate({ job: e.target.value || undefined })}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter applications by role"
      >
        <option value="">All roles</option>
        {jobs.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusSelect({
  status,
  navigate,
}: {
  status?: HRReviewStatus;
  navigate: (updates: Partial<HRApplicationFilterParams>) => void;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor="filter-status"
        className="text-xs font-semibold text-muted-foreground"
      >
        Review status
      </label>
      <select
        id="filter-status"
        value={status ?? ""}
        onChange={(e) =>
          navigate({ status: (e.target.value as HRReviewStatus) || undefined })
        }
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter applications by review status"
      >
        <option value="">All statuses</option>
        <option value="submitted">Submitted</option>
        <option value="in_review">In review</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
  );
}

function WithdrawalSelect({
  withdrawal,
  navigate,
}: {
  withdrawal: HRApplicationWithdrawalFilter;
  navigate: (updates: Partial<HRApplicationFilterParams>) => void;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor="filter-withdrawal"
        className="text-xs font-semibold text-muted-foreground"
      >
        Withdrawal
      </label>
      <select
        id="filter-withdrawal"
        value={withdrawal}
        onChange={(e) =>
          navigate({
            withdrawal: e.target.value as HRApplicationWithdrawalFilter,
          })
        }
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter applications by withdrawal state"
      >
        <option value="all">All applications</option>
        <option value="active">Active only</option>
        <option value="withdrawn">Withdrawn only</option>
      </select>
    </div>
  );
}

function SortSelect({
  sort,
  navigate,
}: {
  sort: HRApplicationSort;
  navigate: (updates: Partial<HRApplicationFilterParams>) => void;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor="filter-sort"
        className="text-xs font-semibold text-muted-foreground"
      >
        Sort by
      </label>
      <select
        id="filter-sort"
        value={sort}
        onChange={(e) =>
          navigate({ sort: e.target.value as HRApplicationSort })
        }
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Sort applications"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
