import Link from "next/link";
import { usesLocalSupabase } from "@/lib/local-supabase";

export default function CheckEmail() {
  return (
    <main className="page-shell auth-shell mx-auto w-[calc(100%-2.5rem)] max-w-md space-y-5 px-5 py-12">
      <h1 className="text-3xl font-semibold">Check your email</h1>
      {usesLocalSupabase() ? (
        <p>
          For local testing, open the verification message in the{" "}
          <a href="http://127.0.0.1:54324" className="underline">
            local mail viewer
          </a>
          . It will not arrive in Gmail. Click its link, then sign in.
        </p>
      ) : (
        <p>
          Open the verification link sent to your email address, then sign in.
        </p>
      )}
      <Link href="/auth/sign-in" className="underline">
        Go to sign in
      </Link>
    </main>
  );
}
