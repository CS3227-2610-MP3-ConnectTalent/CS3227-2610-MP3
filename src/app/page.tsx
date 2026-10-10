import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Layers3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, isJobCategory, JOB_CATEGORIES } from "@/lib/job-categories";
import { listPublishedJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{ category?: string | string[]; authError?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { category: rawCategory, authError } = await searchParams;
  const validCategory = isJobCategory(rawCategory) ? rawCategory : undefined;
  const invalidCategory = rawCategory !== undefined && !validCategory;
  const jobs = invalidCategory ? [] : await listPublishedJobs(validCategory);
  return (
    <main className="careers-shell mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      {authError === "sign-out" && <p role="alert" className="mb-8 rounded-lg border p-4">Sign out could not be completed. Try again.</p>}
      <section className="careers-hero mb-10 overflow-hidden rounded-3xl px-6 py-9 sm:px-10 sm:py-12">
        <div className="relative z-10 max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"><Sparkles size={15} aria-hidden="true" /> Build what comes next</span>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">Find your next role.</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed sm:text-lg">Explore our teams. Find work that moves you forward.<br className="hidden sm:block" /> Your next chapter starts with a conversation.</p>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </section>
      <div className="grid items-start gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2"><Layers3 size={18} aria-hidden="true" /><h2 className="text-sm font-semibold">Explore by category</h2></div>
            <nav aria-label="Filter jobs by category" className="flex flex-wrap gap-2 lg:flex-col">
              <Link href="/" aria-current={!validCategory && !invalidCategory ? "page" : undefined} className={`category-link ${!validCategory && !invalidCategory ? "category-active" : ""}`}><span className="category-dot bg-slate-700" aria-hidden="true" />All roles</Link>
              {JOB_CATEGORIES.map((category) => <Link key={category.value} href={`/?category=${category.value}`} aria-current={validCategory === category.value ? "page" : undefined} className={`category-link ${validCategory === category.value ? "category-active" : ""}`}><span className={`category-dot category-dot-${category.value}`} aria-hidden="true" />{category.label}</Link>)}
            </nav>
          </div>
        </aside>
        <section aria-labelledby="open-roles" className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Opportunities</p><h2 id="open-roles" className="text-2xl font-semibold tracking-tight">Open roles</h2></div><p className="rounded-full border bg-white px-4 py-2 text-sm text-muted-foreground">{invalidCategory ? "Choose a valid category." : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} available`}</p></div>
          {invalidCategory ? <div className="empty-state"><h3 className="font-semibold">Unknown category</h3><p className="mt-2 text-sm text-muted-foreground">Choose one of the listed categories to browse jobs.</p></div> : jobs.length === 0 ? <div className="empty-state"><BriefcaseBusiness className="mb-4 text-muted-foreground" aria-hidden="true" /><h3 className="font-semibold">No open roles in this category</h3><p className="mt-2 text-sm text-muted-foreground">Try another category or check back later.</p></div> :
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{jobs.map((job) =>
              <Link key={job.id} href={`/jobs/${job.id}`} className="job-card group flex min-w-0 flex-col rounded-2xl border bg-white p-3">
                <div className={`job-card-panel job-tone-${job.category} flex flex-1 flex-col rounded-xl p-5`}>
                  <div className="mb-7 flex items-center justify-between gap-3"><Badge variant="outline" className="border-black/15 bg-white/60 text-slate-800">{categoryLabel(job.category)}</Badge><ArrowUpRight size={18} aria-hidden="true" /></div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-700">{job.team}</p><h3 className="break-words text-xl font-semibold leading-snug tracking-tight">{job.title}</h3><p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-700">{job.description}</p>
                </div>
                <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4"><span className="text-xs font-medium text-muted-foreground">Find your next chapter</span><span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">View role</span></div>
              </Link>)}</div>}
        </section>
      </div>
    </main>
  );
}
