import Link from "next/link";

import { SignUpForm } from "@/app/auth/sign-up/sign-up-form";

export default async function SignUp({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-12">
      <Link href="/" className="text-sm underline">← Careers</Link>
      <h1 className="text-3xl font-semibold">Create an Applicant account</h1>
      <p className="text-muted-foreground">We’ll email a verification link before you can sign in.</p>
      <SignUpForm serverError={error ? error === "password-mismatch" ? "Passwords do not match. Please try again." : "Check your details and try again." : undefined} />
      <p>Already registered? <Link href="/auth/sign-in" className="underline">Sign in</Link></p>
    </main>
  );
}
