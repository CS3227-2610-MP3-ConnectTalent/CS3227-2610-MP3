"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildHRApplicationsUrl,
  parseHRApplicationFilterParams,
  type HRApplicationFilterParams,
} from "@/lib/hr-application-search";
import {
  mergeHRApplicationFilterParams,
  shouldSyncHRApplicationFilterParams,
} from "@/lib/hr-application-filter-state";

export function useHRApplicationNavigation(
  initialParams: HRApplicationFilterParams,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const latestParams = useRef(initialParams);
  const currentSearch = searchParams?.toString() ?? null;

  useEffect(() => {
    if (isPending || searchParams === null) return;

    const currentParams = parseHRApplicationFilterParams(
      Object.fromEntries(
        Array.from(new Set(searchParams.keys())).map((key) => {
          const values = searchParams.getAll(key);
          return [key, values.length > 1 ? values : values[0]];
        }),
      ),
    );
    if (
      shouldSyncHRApplicationFilterParams(
        initialParams,
        currentParams,
        isPending,
      )
    ) {
      latestParams.current = initialParams;
    }
  }, [currentSearch, initialParams, isPending, searchParams]);

  const navigate = useCallback(
    (updates: Partial<HRApplicationFilterParams>, replace = false) => {
      const nextParams = mergeHRApplicationFilterParams(
        latestParams.current,
        updates,
      );
      latestParams.current = nextParams;
      const url = buildHRApplicationsUrl(nextParams);
      startTransition(() => {
        if (replace) router.replace(url, { scroll: false });
        else router.push(url, { scroll: false });
      });
    },
    [router, startTransition],
  );

  return { isPending, navigate };
}
