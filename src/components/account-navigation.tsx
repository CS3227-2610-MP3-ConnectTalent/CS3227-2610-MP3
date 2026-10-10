import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { getAccountNavigation } from "@/lib/account-navigation";

type Account = Awaited<ReturnType<typeof getAccountNavigation>>;
type SignedInAccount = Extract<Account, { kind: "signed-in" }>;

export async function AccountNavigation() {
  const account = await getAccountNavigation();
  return (
    <header className="account-header border-b">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <AccountBrand account={account} />
        <AccountMenu account={account} />
      </div>
    </header>
  );
}

function AccountBrand({ account }: { account: Account }) {
  const href =
    account.kind === "signed-in" && account.incomplete ? "/profile" : "/";
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 text-xl font-semibold tracking-tight"
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400 text-lg text-slate-950"
        aria-hidden="true"
      >
        ↗
      </span>
      Careers
    </Link>
  );
}

function AccountMenu({ account }: { account: Account }) {
  return (
    <nav
      aria-label="Account"
      className="flex flex-wrap items-center gap-4 text-sm"
    >
      {account.kind === "signed-in" ? (
        <SignedInMenu account={account} />
      ) : (
        <SignedOutMenu unavailable={account.kind === "unavailable"} />
      )}
    </nav>
  );
}

function SignedInMenu({ account }: { account: SignedInAccount }) {
  return (
    <>
      <span className="account-role rounded-full px-3 py-1 font-medium">
        {roleLabel(account.role)}
      </span>
      {account.role === "applicant" && (
        <ApplicantLinks incomplete={account.incomplete ?? false} />
      )}
      {account.role === "hr" && <HRLinks />}
      <form action={signOut}>
        <button type="submit" className="rounded-lg border px-3 py-1.5">
          Sign out
        </button>
      </form>
    </>
  );
}

function roleLabel(role: SignedInAccount["role"]) {
  if (role === "hr") return "HR";
  if (role === "applicant") return "Applicant";
  return "Signed in";
}

function ApplicantLinks({ incomplete }: { incomplete: boolean }) {
  return (
    <>
      {!incomplete && (
        <Link href="/applications" className="underline">
          My applications
        </Link>
      )}
      <Link href="/profile" className="underline">
        My profile
      </Link>
    </>
  );
}

function HRLinks() {
  return (
    <>
      <Link href="/hr/applications" className="underline">
        Application review
      </Link>
      <Link href="/hr/jobs" className="underline">
        Manage jobs
      </Link>
    </>
  );
}

function SignedOutMenu({ unavailable }: { unavailable: boolean }) {
  return (
    <>
      {unavailable && (
        <span role="status">Account access is unavailable. Try again.</span>
      )}
      <Link href="/auth/sign-in" className="underline">
        Sign in
      </Link>
      <Link href="/auth/sign-up" className="underline">
        Create account
      </Link>
    </>
  );
}
