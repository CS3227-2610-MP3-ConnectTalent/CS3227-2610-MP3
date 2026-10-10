import Link from "next/link";

import { requestPasswordReset } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="page-shell auth-shell mx-auto w-[calc(100%-2.5rem)] max-w-md space-y-6 px-5 py-12">
      <Link href="/auth/sign-in" className="text-sm underline">← Sign in</Link>
      <h1 className="text-3xl font-semibold">Reset your password</h1>
      <p>Enter your account email and we’ll send a reset link if the account exists.</p>
      {error === "invalid" && <p role="alert" className="text-destructive">Enter a valid email address.</p>}
      {error === "link" && <p role="alert" className="text-destructive">That reset link is invalid or expired. Request another one.</p>}
      <form action={requestPasswordReset} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
        <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Send reset link</button>
      </form>
    </main>
  );
}
