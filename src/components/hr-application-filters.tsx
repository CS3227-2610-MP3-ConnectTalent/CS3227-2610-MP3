"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  buildHRApplicationsUrl,
  HR_APPLICATION_SEARCH_DELAY,
  type HRApplicationFilterParams,
} from "@/lib/hr-application-search";
import { FilterDropdowns } from "@/components/hr-application-filter-dropdowns";

interface HRApplicationFiltersProps {
  initialParams: HRApplicationFilterParams;
  jobs: Array<{ id: string; title: string }>;
}

export function HRApplicationFilters({
  initialParams,
  jobs,
}: HRApplicationFiltersProps) {
  const { router, isPending, startTransition, navigate } =
    useHRFiltersNavigation(initialParams);

  const [query, setQuery] = useState(initialParams.q);
  const [prevQ, setPrevQ] = useState(initialParams.q);
  if (initialParams.q !== prevQ) {
    setPrevQ(initialParams.q);
    setQuery(initialParams.q);
  }

  const isComposingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timerRef = debounceTimerRef;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <SearchForm
        query={query}
        setQuery={setQuery}
        isPending={isPending}
        navigate={navigate}
        debounceTimerRef={debounceTimerRef}
        isComposingRef={isComposingRef}
        initialParams={initialParams}
        startTransition={startTransition}
        router={router}
      />
      <FilterDropdowns
        initialParams={initialParams}
        jobs={jobs}
        navigate={navigate}
      />
      <p role="status" className="sr-only">
        {isPending ? "Updating applications…" : ""}
      </p>
    </div>
  );
}

function useHRFiltersNavigation(initialParams: HRApplicationFilterParams) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (updates: Partial<HRApplicationFilterParams>, replace = false) => {
      const url = buildHRApplicationsUrl(initialParams, {
        ...updates,
        page: updates.page ?? 1,
      });
      startTransition(() => {
        if (replace) router.replace(url, { scroll: false });
        else router.push(url, { scroll: false });
      });
    },
    [initialParams, router],
  );

  return { router, isPending, startTransition, navigate };
}

interface SearchFormProps {
  query: string;
  setQuery: (val: string) => void;
  isPending: boolean;
  navigate: (
    updates: Partial<HRApplicationFilterParams>,
    replace?: boolean,
  ) => void;
  debounceTimerRef: MutableRefObject<NodeJS.Timeout | null>;
  isComposingRef: MutableRefObject<boolean>;
  initialParams: HRApplicationFilterParams;
  startTransition: (fn: () => void) => void;
  router: ReturnType<typeof useRouter>;
}

function SearchForm({
  query,
  setQuery,
  isPending,
  navigate,
  debounceTimerRef,
  isComposingRef,
  initialParams,
  startTransition,
  router,
}: SearchFormProps) {
  const onTextChange = (val: string) => {
    setQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (isComposingRef.current) return;
    debounceTimerRef.current = setTimeout(() => {
      navigate({ q: val }, true);
    }, HR_APPLICATION_SEARCH_DELAY);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    navigate({ q: query }, false);
  };

  const onClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setQuery("");
    startTransition(() => router.push("/hr/applications", { scroll: false }));
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <SearchInputField
        query={query}
        isPending={isPending}
        onTextChange={onTextChange}
        isComposingRef={isComposingRef}
      />
      <Button type="submit" className="h-10 shrink-0" disabled={isPending}>
        <Search size={16} aria-hidden="true" />
        <span>Search</span>
      </Button>
      <ClearButton
        initialParams={initialParams}
        isPending={isPending}
        onClear={onClear}
      />
    </form>
  );
}

function ClearButton({
  initialParams,
  isPending,
  onClear,
}: {
  initialParams: HRApplicationFilterParams;
  isPending: boolean;
  onClear: () => void;
}) {
  const hasFilters =
    Boolean(initialParams.q) ||
    Boolean(initialParams.job) ||
    Boolean(initialParams.status) ||
    initialParams.withdrawal !== "all" ||
    initialParams.sort !== "newest";

  if (!hasFilters) return null;

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 shrink-0"
      onClick={onClear}
      disabled={isPending}
    >
      <RotateCcw size={14} aria-hidden="true" />
      <span>Clear filters</span>
    </Button>
  );
}

function SearchInputField({
  query,
  isPending,
  onTextChange,
  isComposingRef,
}: {
  query: string;
  isPending: boolean;
  onTextChange: (val: string) => void;
  isComposingRef: MutableRefObject<boolean>;
}) {
  return (
    <div className="relative flex-1">
      <Input
        id="hr-app-search"
        type="search"
        value={query}
        placeholder="Search by applicant name…"
        onChange={(e) => onTextChange(e.target.value)}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;
          onTextChange((e.target as HTMLInputElement).value);
        }}
        aria-label="Search applications by applicant name"
        className="h-10 pr-9"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
