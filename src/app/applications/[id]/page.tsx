import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/application-form";
import { getOwnApplication } from "@/lib/applications";
import { getPublishedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function ApplicationDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { id } = await params;
  const application = await getOwnApplication(id);
  if (!application) notFound();
  const job = await getPublishedJob(application.job_id);
  const { notice } = await searchParams;
  return <main className="mx-auto max-w-3xl space-y-6 px-5 py-10">
    <Link href="/applications" className="underline">← My applications</Link>
    <h1 className="text-3xl font-semibold">{application.job_title}</h1>
    {notice === "already-submitted" && <p role="status" className="rounded-lg border p-3">This application was already submitted. Review the saved letter below; it may differ from the text you just tried to send.</p>}
    {notice === "saved" && <p role="status" className="rounded-lg border p-3">Your change was already saved. Review the current letter below.</p>}
    <p>{application.submission_state === "draft" ? "Saved draft" : "Submitted application"}</p>
    {!job && <p className="rounded-lg border p-3">This job is no longer open. Your application remains available to read, but cannot be changed.</p>}
    {application.submission_state === "submitted" && <section className="space-y-2">
      <h2 className="text-xl font-semibold">Original submission</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">{application.original_submitted_letter}</p>
    </section>}
    {job ? <ApplicationForm jobId={application.job_id} value={application.cover_letter}
      revision={application.revision} submitted={application.submission_state === "submitted"} /> :
      <section className="space-y-2"><h2 className="text-xl font-semibold">{application.submission_state === "draft" ? "Saved letter" : "Current letter"}</h2>
        <p className="whitespace-pre-wrap rounded-lg border p-4">{application.cover_letter || "(empty draft)"}</p></section>}
  </main>;
}
