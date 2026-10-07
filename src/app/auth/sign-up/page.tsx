import Link from "next/link";

import { signUp } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usesLocalSupabase } from "@/lib/local-supabase";

export default async function SignUp({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-12">
      <Link href="/" className="text-sm underline">← Careers</Link>
      <h1 className="text-3xl font-semibold">Create an Applicant account</h1>
      {usesLocalSupabase() ? (
        <p className="rounded-lg border p-3 text-sm">Local testing: verification emails appear in the <a href="http://127.0.0.1:54324" className="underline">local mail viewer</a>. They are not sent to Gmail.</p>
      ) : <p className="text-muted-foreground">We’ll email a verification link before you can sign in.</p>}
      {error && <p role="alert" className="text-destructive">{error === "password-mismatch" ? "Passwords do not match. Please try again." : "Check your details and try again."}</p>}
      <form action={signUp} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={8} maxLength={72} autoComplete="new-password" required /></div>
        <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" required /></div>
        <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Create account</button>
      </form>
      <p>Already registered? <Link href="/auth/sign-in" className="underline">Sign in</Link></p>
    </main>
  );
}
