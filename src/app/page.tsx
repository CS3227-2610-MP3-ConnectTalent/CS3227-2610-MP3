import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      {authError === "sign-out" && <p role="alert" className="mb-8 rounded-lg border p-4">Sign out could not be completed. Try again.</p>}

      <section className="mb-12 max-w-3xl space-y-5">
        <Badge variant="secondary">Build what comes next</Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Find your next role.</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Explore current openings across our teams. Choose a category to narrow the list, then open
          a role to read the full description and requirements.
        </p>
      </section>

      <section aria-labelledby="open-roles" className="space-y-7">
        <div>
          <h2 id="open-roles" className="text-2xl font-semibold tracking-tight">Open roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {invalidCategory ? "Choose a valid category." : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} available`}
          </p>
        </div>

        <nav aria-label="Filter jobs by category" className="flex flex-wrap gap-2">
          <Link
            href="/"
            aria-current={!validCategory && !invalidCategory ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 ${!validCategory && !invalidCategory ? "bg-foreground text-background hover:bg-foreground/90" : "bg-background"}`}
          >
            All roles
          </Link>
          {JOB_CATEGORIES.map((category) => (
            <Link
              key={category.value}
              href={`/?category=${category.value}`}
              aria-current={validCategory === category.value ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 ${validCategory === category.value ? "bg-foreground text-background hover:bg-foreground/90" : "bg-background"}`}
            >
              {category.label}
            </Link>
          ))}
        </nav>

        {invalidCategory ? (
          <div className="rounded-xl border bg-muted/40 p-8">
            <h3 className="font-semibold">Unknown category</h3>
            <p className="mt-2 text-sm text-muted-foreground">Choose one of the listed categories to browse jobs.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border bg-muted/40 p-8">
            <h3 className="font-semibold">No open roles in this category</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try another category or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="group rounded-xl focus-visible:outline-2 focus-visible:outline-offset-3">
                <Card className="h-full transition-colors group-hover:bg-muted/40">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Badge variant="outline">{categoryLabel(job.category)}</Badge>
                      <span aria-hidden="true" className="text-lg text-muted-foreground transition-transform group-hover:translate-x-1">↗</span>
                    </div>
                    <h3 className="text-xl font-medium leading-snug">{job.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{job.team}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
