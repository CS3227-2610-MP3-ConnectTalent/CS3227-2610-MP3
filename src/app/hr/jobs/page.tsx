import Link from "next/link";

import { categoryLabel } from "@/lib/job-categories";
import { requireHR } from "@/lib/hr-auth";
import { listHRJobs } from "@/lib/hr-jobs";

export const dynamic = "force-dynamic";

export default async function HRJobsPage() {
  await requireHR();
  let jobs;
  try { jobs = await listHRJobs(); } catch {
    return <main className="page-shell mx-auto max-w-4xl px-5 py-10"><h1 className="text-3xl font-semibold">Manage jobs</h1>
      <p role="alert" className="mt-5">Jobs are temporarily unavailable. Try again later.</p></main>;
  }
  return <main className="page-shell mx-auto max-w-4xl space-y-8 px-5 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-semibold">Manage jobs</h1><p className="text-muted-foreground">Draft, publish and close this employer’s openings.</p></div>
      <Link href="/hr/jobs/new" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Create draft</Link>
    </div>
    {jobs.length === 0 ? <p>No jobs yet. Create a draft to begin.</p> : <ul className="space-y-3">{jobs.map((job) =>
      <li key={job.id}><Link href={`/hr/jobs/${job.id}`} className="block rounded-lg border p-5 hover:bg-muted/40">
        <span className="block font-semibold">{job.title}</span>
        <span className="block text-sm text-muted-foreground">{job.team} · {categoryLabel(job.category)} · {job.status === "draft" ? "Draft" : job.status === "published" ? "Published" : "Closed"}</span>
      </Link></li>)}</ul>}
  </main>;
}
