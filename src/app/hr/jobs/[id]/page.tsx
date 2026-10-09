import Link from "next/link";
import { notFound } from "next/navigation";

import { closeHRJob, editHRJobDraft, publishHRJob } from "@/app/hr/jobs/actions";
import { JobEditor } from "@/app/hr/jobs/job-editor";
import { categoryLabel } from "@/lib/job-categories";
import { requireHR } from "@/lib/hr-auth";
import { getHRJob } from "@/lib/hr-jobs";

export const dynamic = "force-dynamic";

export default async function HRJobDetail({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireHR();
  const { id } = await params;
  let job;
  try { job = await getHRJob(id); } catch {
    return <main className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-3xl font-semibold">Manage jobs</h1>
      <p role="alert" className="mt-5">Job is temporarily unavailable. Try again later.</p></main>;
  }
  if (!job) notFound();
  const { error, notice } = await searchParams;
  const statusLabel = job.status === "draft" ? "Draft" : job.status === "published" ? "Published" : "Closed";
  return <main className="mx-auto max-w-3xl space-y-7 px-5 py-10">
    <Link href="/hr/jobs" className="underline">← Manage jobs</Link>
    <header className="space-y-2"><p className="text-sm text-muted-foreground">{categoryLabel(job.category)} · {job.team}</p>
      <h1 className="text-3xl font-semibold">{job.title}</h1><p>{statusLabel}</p></header>
    {error && <p role="alert" className="rounded-lg border p-3">The change was not saved. Reload and try again.</p>}
    {notice && <p role="status" className="rounded-lg border p-3">The change was saved.</p>}
    {job.status === "draft" ? <>
      <section className="space-y-3"><h2 className="text-xl font-semibold">Edit draft</h2><JobEditor job={job} action={editHRJobDraft} /></section>
      <section className="space-y-3 border-t pt-5"><h2 className="text-xl font-semibold">Publish job</h2>
        <p>Publishing makes this fixed description visible and opens applications. Review the draft first.</p>
        <form action={publishHRJob}><input type="hidden" name="jobId" value={job.id} />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Publish job</button></form></section>
    </> : <>
      <section className="space-y-3 border-t pt-5"><h2 className="text-xl font-semibold">Description</h2>
        <p className="whitespace-pre-wrap">{job.description}</p></section>
      <section className="space-y-3 border-t pt-5"><h2 className="text-xl font-semibold">Requirements</h2>
        <p className="whitespace-pre-wrap">{job.requirements}</p></section>
      {job.status === "published" && <section className="space-y-3 border-t pt-5"><h2 className="text-xl font-semibold">Close job</h2>
        <p>Closing stops new applications and letter edits. Existing applications remain available for review.</p>
        <form action={closeHRJob}><input type="hidden" name="jobId" value={job.id} />
          <button type="submit" className="rounded-lg border px-4 py-2 font-medium">Close job</button></form></section>}
    </>}
  </main>;
}
