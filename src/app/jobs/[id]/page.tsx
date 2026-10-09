import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getAccountNavigation } from "@/lib/account-navigation";
import { categoryLabel } from "@/lib/job-categories";
import { getPublishedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublishedJob(id);

  if (!job) {
    notFound();
  }
  const account = await getAccountNavigation();
  const canApply = account.kind === "guest" || (account.kind === "signed-in" && account.role === "applicant");

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex items-center justify-between gap-4 border-b pb-5">
        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">All roles</Link>
      </header>

      <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Back to open roles</Link>

      <article className="mt-10">
        <Badge variant="secondary">{categoryLabel(job.category)}</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{job.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{job.team}</p>
        {canApply && <Link href={`/jobs/${job.id}/apply`} className="mt-7 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90">Apply for this role</Link>}

        <div className="mt-12 grid gap-10 border-t pt-10 sm:grid-cols-[12rem_1fr]">
          <h2 className="text-lg font-semibold">About the role</h2>
          <p className="whitespace-pre-line leading-7 text-muted-foreground">{job.description}</p>
        </div>
        <div className="mt-10 grid gap-10 border-t pt-10 sm:grid-cols-[12rem_1fr]">
          <h2 className="text-lg font-semibold">Requirements</h2>
          <p className="whitespace-pre-line leading-7 text-muted-foreground">{job.requirements}</p>
        </div>
      </article>
    </main>
  );
}
