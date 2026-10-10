import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getAccountNavigation } from "@/lib/account-navigation";

export async function AccountNavigation() {
  const account = await getAccountNavigation();
  return (
    <header className="account-header border-b">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400 text-lg text-slate-950" aria-hidden="true">↗</span>Careers</Link>
        <nav aria-label="Account" className="flex flex-wrap items-center gap-4 text-sm">
          {account.kind === "signed-in" ? (
            <>
              <span className="account-role rounded-full px-3 py-1 font-medium">
                {account.role === "hr" ? "HR" : account.role === "applicant" ? "Applicant" : "Signed in"}
              </span>
              {account.role === "applicant" && <><Link href="/applications" className="underline">My applications</Link><Link href="/profile" className="underline">My profile</Link></>}
              {account.role === "hr" && <>
                <Link href="/hr/applications" className="underline">Application review</Link>
                <Link href="/hr/jobs" className="underline">Manage jobs</Link>
              </>}
              <form action={signOut}><button type="submit" className="rounded-lg border px-3 py-1.5">Sign out</button></form>
            </>
          ) : (
            <>
              {account.kind === "unavailable" && <span role="status">Account access is unavailable. Try again.</span>}
              <Link href="/auth/sign-in" className="underline">Sign in</Link>
              <Link href="/auth/sign-up" className="underline">Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
