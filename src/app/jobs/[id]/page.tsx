import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { BackToOpenRoles } from "@/components/back-to-open-roles";
import { LocalScheduleTime } from "@/components/local-schedule-time";
import { PendingLinkStatus } from "@/components/pending-link-status";
import { getAccountNavigation } from "@/lib/account-navigation";
import { categoryLabel } from "@/lib/job-categories";
import { getPublishedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

type Job = NonNullable<Awaited<ReturnType<typeof getPublishedJob>>>;

export default async function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const account = await getAccountNavigation();
  const canApply =
    account.kind === "guest" ||
    (account.kind === "signed-in" && account.role === "applicant");
  return <JobDetailContent job={job} canApply={canApply} />;
}

function JobDetailContent({ job, canApply }: { job: Job; canApply: boolean }) {
  return (
    <main className="page-shell mx-auto min-h-screen w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <BackToOpenRoles />
      <article className="mt-10">
        <JobHeading job={job} canApply={canApply} />
        <JobDescription title="About the role" text={job.description} />
        <JobDescription title="Requirements" text={job.requirements} />
      </article>
    </main>
  );
}

function JobHeading({ job, canApply }: { job: Job; canApply: boolean }) {
  return (
    <>
      <Badge variant="secondary">{categoryLabel(job.category)}</Badge>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
        {job.title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">{job.team}</p>
      {job.closes_at && (
        <p className="mt-2 text-sm text-muted-foreground">
          Applications close on <LocalScheduleTime value={job.closes_at} />
        </p>
      )}
      {canApply && <JobApplyLink id={job.id} />}
    </>
  );
}

function JobApplyLink({ id }: { id: string }) {
  return (
    <Link
      href={`/jobs/${id}/apply`}
      className="mt-7 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
    >
      Apply for this role
      <PendingLinkStatus label="Opening application…" />
    </Link>
  );
}

function JobDescription({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-10 grid gap-10 border-t pt-10 sm:grid-cols-[12rem_1fr]">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="whitespace-pre-line leading-7 text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
