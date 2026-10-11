import Link from "next/link";

import { createHRJobDraft } from "@/app/hr/jobs/actions";
import { JobEditor } from "@/app/hr/jobs/job-editor";
import { requireHR } from "@/lib/hr-auth";

export const dynamic = "force-dynamic";

export default async function NewHRJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireHR();
  const { error } = await searchParams;
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-7 px-5 py-10">
      <Link href="/hr/jobs" className="underline">
        ← Manage jobs
      </Link>
      <div>
        <h1 className="text-3xl font-semibold">Create job draft</h1>
        <p className="text-muted-foreground">
          This job stays private until you publish it separately.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-lg border p-3">
          The draft was not saved. Check the fields and try again.
        </p>
      )}
      <JobEditor action={createHRJobDraft} />
    </main>
  );
}
