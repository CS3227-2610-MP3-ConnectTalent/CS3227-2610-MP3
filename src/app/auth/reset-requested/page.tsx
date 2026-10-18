import Link from "next/link";

export default function ResetRequested() {
  return (
    <main className="page-shell auth-shell mx-auto w-[calc(100%-2.5rem)] max-w-md space-y-6 px-5 py-12">
      <h1 className="text-3xl font-semibold">Reset request received</h1>
      <p>
        If an account exists for that address and email is available, a reset
        link may arrive. If nothing arrives, check your spam folder or try again
        later.
      </p>
      <p>
        Local development email appears in Supabase Mailpit, not your personal
        inbox.
      </p>
      <Link href="/auth/forgot-password" className="underline">
        Request another link
      </Link>
    </main>
  );
}
