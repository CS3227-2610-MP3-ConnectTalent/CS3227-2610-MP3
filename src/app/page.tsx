import { Sparkles } from "lucide-react";
import { isJobCategory } from "@/lib/job-categories";
import { parseJobSearch } from "@/lib/job-search";
import { listPublishedJobs } from "@/lib/jobs";
import { JobListingFilters } from "@/components/job-listing-filters";
import { JobResults } from "@/components/job-listing-results";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{
  category?: string | string[];
  q?: string | string[];
  authError?: string;
}>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category: rawCategory, q, authError } = await searchParams;
  const category = isJobCategory(rawCategory) ? rawCategory : undefined;
  const invalidCategory = rawCategory !== undefined && !category;
  const search = parseJobSearch(q);
  const jobs =
    invalidCategory || search.invalid
      ? []
      : await listPublishedJobs(category, search.query);
  return (
    <main className="careers-shell mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      {authError === "sign-out" && <SignOutError />}
      <CareerHero />
      <JobListingFilters
        initial={{
          query: search.query,
          invalid: search.invalid || invalidCategory,
          category: typeof rawCategory === "string" ? rawCategory : undefined,
        }}
        invalidCategory={invalidCategory}
      >
        <JobResults
          jobs={jobs}
          invalidCategory={invalidCategory}
          query={search.query}
          invalidSearch={search.invalid}
        />
      </JobListingFilters>
    </main>
  );
}

function SignOutError() {
  return (
    <p role="alert" className="mb-8 rounded-lg border p-4">
      Sign out could not be completed. Try again.
    </p>
  );
}

function CareerHero() {
  return (
    <section className="careers-hero mb-10 overflow-hidden rounded-3xl px-6 py-9 sm:px-10 sm:py-12">
      <div className="relative z-10 max-w-2xl">
        <span className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <Sparkles size={15} aria-hidden="true" /> Build what comes next
        </span>
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Find your next role.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed sm:text-lg">
          Explore our teams. Find work that moves you forward.
          <br className="hidden sm:block" /> Your next chapter starts with a
          conversation.
        </p>
      </div>
      <div className="hero-orbit" aria-hidden="true" />
    </section>
  );
}
