"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  JobFilterController,
  type JobFilters,
} from "@/lib/job-filter-controller";
import { parseJobSearch } from "@/lib/job-search";

export function useJobListingFilters(initial: JobFilters) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [controller] = useState(
    () =>
      new JobFilterController(initial, (url, replace) => {
        startTransition(() => {
          if (replace) router.replace(url, { scroll: false });
          else router.push(url, { scroll: false });
        });
      }),
  );
  const filters = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => controller.confirm(initial), [controller, initial]);
  useEffect(() => {
    const restore = () => controller.restore(filtersFromLocation());
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.("a[href]");
      if (
        link &&
        !link.hasAttribute("data-job-filter") &&
        !event.ctrlKey &&
        !event.metaKey
      )
        controller.leave();
    };
    window.addEventListener("popstate", restore);
    document.addEventListener("click", leave, true);
    return () => {
      controller.cancel();
      window.removeEventListener("popstate", restore);
      document.removeEventListener("click", leave, true);
    };
  }, [controller]);
  return { filters, controller, pending };
}

function filtersFromLocation(): JobFilters {
  const params = new URLSearchParams(window.location.search);
  const values = params.getAll("q");
  const parsed = parseJobSearch(values.length > 1 ? values : values[0]);
  return {
    query: parsed.query,
    invalid: parsed.invalid || params.getAll("category").length > 1,
    category: params.get("category") ?? undefined,
  };
}
