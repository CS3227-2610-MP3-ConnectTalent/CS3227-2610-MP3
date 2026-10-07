import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { listOwnApplications } from "@/lib/applications";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const applications = await listOwnApplications();
  const { error } = await searchParams;
  return <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="underline">← Careers</Link>
      <form action={signOut}><button className="underline">Sign out</button></form>
    </header>
    <h1 className="text-3xl font-semibold">My applications</h1>
    {error && <p role="alert" className="text-destructive">Your change was not saved. Open the application and try again.</p>}
    {applications.length === 0 ? <p>No applications yet. <Link href="/" className="underline">Browse open roles</Link>.</p> :
      <ul className="space-y-3">{applications.map((application) => <li key={application.id}>
        <Link href={`/applications/${application.id}`} className="block rounded-lg border p-5 hover:bg-muted/40">
          <span className="font-semibold">{application.job_title}</span>
          <span className="ml-3 text-sm text-muted-foreground">{application.submission_state === "draft" ? "Saved draft" : "Submitted"}</span>
        </Link>
      </li>)}</ul>}
  </main>;
}
