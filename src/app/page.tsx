import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  categoryLabel,
  isJobCategory,
  JOB_CATEGORIES,
} from "@/lib/job-categories";
import { listPublishedJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{
  category?: string | string[];
  authError?: string;
}>;
type Jobs = Awaited<ReturnType<typeof listPublishedJobs>>;
type Job = Jobs[number];

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category: rawCategory, authError } = await searchParams;
  const category = isJobCategory(rawCategory) ? rawCategory : undefined;
  const invalidCategory = rawCategory !== undefined && !category;
  const jobs = invalidCategory ? [] : await listPublishedJobs(category);
  return (
    <main className="careers-shell mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      {authError === "sign-out" && <SignOutError />}
      <CareerHero />
      <div className="grid items-start gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
        <CategorySidebar
          category={category}
          invalidCategory={invalidCategory}
        />
        <JobResults jobs={jobs} invalidCategory={invalidCategory} />
      </div>
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

function CategorySidebar({
  category,
  invalidCategory,
}: {
  category?: string;
  invalidCategory: boolean;
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Layers3 size={18} aria-hidden="true" />
          <h2 className="text-sm font-semibold">Explore by category</h2>
        </div>
        <CategoryLinks category={category} invalidCategory={invalidCategory} />
      </div>
    </aside>
  );
}

function CategoryLinks({
  category,
  invalidCategory,
}: {
  category?: string;
  invalidCategory: boolean;
}) {
  return (
    <nav
      aria-label="Filter jobs by category"
      className="flex flex-wrap gap-2 lg:flex-col"
    >
      <Link
        href="/"
        aria-current={!category && !invalidCategory ? "page" : undefined}
        className={`category-link ${!category && !invalidCategory ? "category-active" : ""}`}
      >
        <span className="category-dot bg-slate-700" aria-hidden="true" />
        All roles
      </Link>
      {JOB_CATEGORIES.map((item) => (
        <Link
          key={item.value}
          href={`/?category=${item.value}`}
          aria-current={category === item.value ? "page" : undefined}
          className={`category-link ${category === item.value ? "category-active" : ""}`}
        >
          <span
            className={`category-dot category-dot-${item.value}`}
            aria-hidden="true"
          />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function JobResults({
  jobs,
  invalidCategory,
}: {
  jobs: Jobs;
  invalidCategory: boolean;
}) {
  return (
    <section aria-labelledby="open-roles" className="min-w-0 space-y-6">
      <JobResultsHeading jobs={jobs} invalidCategory={invalidCategory} />
      <JobResultsBody jobs={jobs} invalidCategory={invalidCategory} />
    </section>
  );
}

function JobResultsHeading({
  jobs,
  invalidCategory,
}: {
  jobs: Jobs;
  invalidCategory: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Opportunities
        </p>
        <h2 id="open-roles" className="text-2xl font-semibold tracking-tight">
          Open roles
        </h2>
      </div>
      <p className="rounded-full border bg-white px-4 py-2 text-sm text-muted-foreground">
        {invalidCategory
          ? "Choose a valid category."
          : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} available`}
      </p>
    </div>
  );
}

function JobResultsBody({
  jobs,
  invalidCategory,
}: {
  jobs: Jobs;
  invalidCategory: boolean;
}) {
  if (invalidCategory) return <UnknownCategory />;
  if (jobs.length === 0) return <EmptyJobResults />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function UnknownCategory() {
  return (
    <div className="empty-state">
      <h3 className="font-semibold">Unknown category</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose one of the listed categories to browse jobs.
      </p>
    </div>
  );
}

function EmptyJobResults() {
  return (
    <div className="empty-state">
      <BriefcaseBusiness
        className="mb-4 text-muted-foreground"
        aria-hidden="true"
      />
      <h3 className="font-semibold">No open roles in this category</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Try another category or check back later.
      </p>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="job-card group flex min-w-0 flex-col rounded-2xl border bg-white p-3"
    >
      <div
        className={`job-card-panel job-tone-${job.category} flex flex-1 flex-col rounded-xl p-5`}
      >
        <div className="mb-7 flex items-center justify-between gap-3">
          <Badge
            variant="outline"
            className="border-black/15 bg-white/60 text-slate-800"
          >
            {categoryLabel(job.category)}
          </Badge>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-700">
          {job.team}
        </p>
        <h3 className="break-words text-xl font-semibold leading-snug tracking-tight">
          {job.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-700">
          {job.description}
        </p>
      </div>
      <JobCardFooter />
    </Link>
  );
}

function JobCardFooter() {
  return (
    <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
      <span className="text-xs font-medium text-muted-foreground">
        Find your next chapter
      </span>
      <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
        View role
      </span>
    </div>
  );
}
