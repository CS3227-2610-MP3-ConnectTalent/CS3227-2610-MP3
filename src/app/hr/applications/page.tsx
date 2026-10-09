import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { requireHR } from "@/lib/hr-auth";
import { listSubmittedApplications } from "@/lib/hr-applications";
import { reviewStatusLabel } from "@/lib/hr-input";

export const dynamic = "force-dynamic";

export default async function HRApplicationsPage() {
  await requireHR();
  let applications;
  try {
    applications = await listSubmittedApplications();
  } catch {
    return <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Application review</h1>
      <p role="alert" className="mt-5">Review data is temporarily unavailable. Try again later.</p>
    </main>;
  }

  return <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
    <header className="flex items-center justify-between gap-4">
      <nav className="flex gap-4"><Link href="/" className="underline">← Careers</Link><Link href="/hr/jobs" className="underline">Manage jobs</Link></nav>
      <form action={signOut}><button className="underline">Sign out</button></form>
    </header>
    <h1 className="text-3xl font-semibold">Application review</h1>
    <p className="text-muted-foreground">Submitted applications for this careers site.</p>
    {applications.length === 0 ? <p>No submitted applications yet.</p> : <ul className="space-y-3">
      {applications.map((application) => <li key={application.id}>
        <Link href={`/hr/applications/${application.id}`} className="block rounded-lg border p-5 hover:bg-muted/40">
          <span className="block font-semibold">{application.job_title}</span>
          <span className="block text-sm">Applicant {application.applicant_id}</span>
          <span className="block text-sm text-muted-foreground">{reviewStatusLabel(application.review_status)} · Submitted {new Date(application.submitted_at).toLocaleString()}</span>
        </Link>
      </li>)}
    </ul>}
  </main>;
}
