import Link from "next/link";

import { signIn } from "@/app/auth/actions";
import { AuthFrame } from "@/components/auth-frame";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;
  return (
    <AuthFrame>
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <SignInNotices error={error} reset={reset} />
      <SignInForm />
      <SignInLinks />
    </AuthFrame>
  );
}

function SignInNotices({ error, reset }: { error?: string; reset?: string }) {
  return (
    <>
      {reset === "success" && (
        <p role="status">Password updated. Sign in with your new password.</p>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          Sign in failed. Check your details and verify your email before trying
          again.
        </p>
      )}
    </>
  );
}

function SignInForm() {
  return (
    <form action={signIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        Sign in
      </button>
    </form>
  );
}

function SignInLinks() {
  return (
    <>
      <p>
        <Link href="/auth/forgot-password" className="underline">
          Forgot password?
        </Link>
      </p>
      <p>
        New here?{" "}
        <Link href="/auth/sign-up" className="underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
