import Link from "next/link";

import { signIn } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-12">
      <Link href="/" className="text-sm underline">← Careers</Link>
      <h1 className="text-3xl font-semibold">Applicant sign in</h1>
      {error && <p role="alert" className="text-destructive">Sign in failed. Check your details and verify your email before trying again.</p>}
      <form action={signIn} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Sign in</button>
      </form>
      <p>New here? <Link href="/auth/sign-up" className="underline">Create an account</Link></p>
    </main>
  );
}
