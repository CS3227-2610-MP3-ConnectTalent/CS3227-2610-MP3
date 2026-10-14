"use client";

import { type MouseEvent, type ReactNode } from "react";
import { Layers3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import {
  JOB_SEARCH_ERROR,
  jobSearchUrl,
  parseJobSearch,
} from "@/lib/job-search";
import {
  type JobFilterController,
  type JobFilters,
} from "@/lib/job-filter-controller";
import { useJobListingFilters } from "./use-job-listing-filters";

type Controls = { filters: JobFilters; controller: JobFilterController };

export function JobListingFilters({
  initial,
  invalidCategory,
  children,
}: {
  initial: JobFilters;
  invalidCategory: boolean;
  children: ReactNode;
}) {
  const { filters, controller, pending } = useJobListingFilters(initial);
  const invalid = parseJobSearch(filters.query).invalid;
  return (
    <div className="grid items-start gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
      <CategorySidebar
        filters={filters}
        controller={controller}
        invalidCategory={invalidCategory}
      />
      <div className="min-w-0 space-y-6">
        <SearchForm
          filters={filters}
          controller={controller}
          invalid={invalid}
        />
        <p role="status" className="text-sm text-muted-foreground">
          {pending ? "Updating roles…" : ""}
        </p>
        {invalid ? (
          <p role="alert">{JOB_SEARCH_ERROR}</p>
        ) : (
          <div aria-busy={pending}>{children}</div>
        )}
      </div>
    </div>
  );
}

function SearchForm({
  filters,
  controller,
  invalid,
}: Controls & { invalid: boolean }) {
  return (
    <form
      action="/"
      method="get"
      role="search"
      className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        controller.go();
      }}
    >
      <label htmlFor="job-search" className="text-sm font-semibold">
        Search open roles
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          filters={filters}
          controller={controller}
          invalid={invalid}
        />
        {filters.category && (
          <input type="hidden" name="category" value={filters.category} />
        )}
        <Button type="submit" className="h-10">
          <Search size={16} aria-hidden="true" />
          Search
        </Button>
        <a
          href={jobSearchUrl("", filters.category)}
          data-job-filter
          className="text-sm underline underline-offset-4"
          onClick={(event) => intercept(event, () => controller.clear())}
        >
          Clear search
        </a>
      </div>
      <p id="job-search-help" className="text-xs text-muted-foreground">
        Search titles, teams, descriptions and requirements. Up to 100
        characters.
      </p>
    </form>
  );
}

function SearchInput({
  filters,
  controller,
  invalid,
}: Controls & { invalid: boolean }) {
  return (
    <Input
      id="job-search"
      name="q"
      type="search"
      value={filters.query}
      placeholder="Job title, team or keyword"
      className="h-10 min-w-0 flex-1 basis-48"
      aria-describedby="job-search-help"
      aria-invalid={invalid}
      onChange={(event) => controller.edit(event.target.value)}
      onCompositionStart={() => controller.composition(true)}
      onCompositionEnd={() => controller.composition(false)}
    />
  );
}

function CategorySidebar({
  filters,
  controller,
  invalidCategory,
}: Controls & { invalidCategory: boolean }) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Layers3 size={18} aria-hidden="true" />
          <h2 className="text-sm font-semibold">Explore by category</h2>
        </div>
        <nav
          aria-label="Filter jobs by category"
          className="flex flex-wrap gap-2 lg:flex-col"
        >
          <CategoryLink
            label="All roles"
            active={!filters.category && !invalidCategory}
            filters={filters}
            controller={controller}
          />
          {JOB_CATEGORIES.map((item) => (
            <CategoryLink
              key={item.value}
              label={item.label}
              value={item.value}
              active={filters.category === item.value}
              filters={filters}
              controller={controller}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function CategoryLink({
  label,
  value,
  active,
  filters,
  controller,
}: Controls & {
  label: string;
  value?: string;
  active: boolean;
}) {
  return (
    <a
      href={jobSearchUrl(filters.query, value)}
      aria-current={active ? "page" : undefined}
      data-job-filter
      className={`category-link ${active ? "category-active" : ""}`}
      onClick={(event) => intercept(event, () => controller.category(value))}
    >
      <span
        className={`category-dot ${value ? `category-dot-${value}` : "bg-slate-700"}`}
        aria-hidden="true"
      />
      {label}
    </a>
  );
}

function intercept(event: MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (
    event.button ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  action();
}
