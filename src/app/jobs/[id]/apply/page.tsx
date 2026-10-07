import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/application-form";
import { getOwnApplicationForJob } from "@/lib/applications";
import { requireApplicant } from "@/lib/auth";
import { getPublishedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  await requireApplicant();
  const application = await getOwnApplicationForJob(id);
  const { error } = await searchParams;

  return <main className="mx-auto max-w-3xl space-y-6 px-5 py-10">
    <Link href={`/jobs/${id}`} className="text-sm underline">← {job.title}</Link>
    <h1 className="text-3xl font-semibold">{application?.submission_state === "submitted" ? "Edit your cover letter" : `Apply for ${job.title}`}</h1>
    <p className="text-muted-foreground">{job.team}</p>
    {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-destructive">We could not save your change. Check the letter and job status, reload for the latest version, then try again.</p>}
    <ApplicationForm jobId={id} value={application?.cover_letter ?? ""}
      revision={application?.revision ?? null} submitted={application?.submission_state === "submitted"} />
    <Link href="/applications" className="inline-block underline">My applications</Link>
  </main>;
}
