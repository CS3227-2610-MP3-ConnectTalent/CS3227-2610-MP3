import Link from "next/link";

import { listOwnApplications } from "@/lib/applications";
import { reviewStatusLabel } from "@/lib/hr-input";

export const dynamic = "force-dynamic";

type Applications = Awaited<ReturnType<typeof listOwnApplications>>;
type Application = Applications[number];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [applications, query] = await Promise.all([
    listOwnApplications(),
    searchParams,
  ]);
  return (
    <ApplicationsPageContent applications={applications} error={query.error} />
  );
}

function ApplicationsPageContent({
  applications,
  error,
}: {
  applications: Applications;
  error?: string;
}) {
  return (
    <main className="page-shell mx-auto max-w-4xl space-y-8 px-5 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="underline">
          ← Careers
        </Link>
      </header>
      <h1 className="text-3xl font-semibold">My applications</h1>
      <ApplicationError error={error} />
      <ApplicationsList applications={applications} />
    </main>
  );
}

function ApplicationError({ error }: { error?: string }) {
  if (error === "correction")
    return (
      <p role="alert" className="text-destructive">
        Submitted applications are locked. Contact HR if you need to request a
        correction.
      </p>
    );
  if (!error) return null;
  return (
    <p role="alert" className="text-destructive">
      Your change was not saved. Open the application and try again.
    </p>
  );
}

function ApplicationsList({ applications }: { applications: Applications }) {
  if (applications.length === 0)
    return (
      <p>
        No applications yet.{" "}
        <Link href="/" className="underline">
          Browse open roles
        </Link>
        .
      </p>
    );
  return (
    <ul className="space-y-3">
      {applications.map((application) => (
        <ApplicationRow key={application.id} application={application} />
      ))}
    </ul>
  );
}

function ApplicationRow({ application }: { application: Application }) {
  const status =
    application.submission_state === "draft"
      ? "Saved draft"
      : application.review_status
        ? reviewStatusLabel(application.review_status)
        : "Submitted";
  return (
    <li>
      <Link
        href={`/applications/${application.id}`}
        className="block rounded-lg border p-5 hover:bg-muted/40"
      >
        <span className="font-semibold">{application.job_title}</span>
        <span className="ml-3 text-sm text-muted-foreground">{status}</span>
      </Link>
    </li>
  );
}
