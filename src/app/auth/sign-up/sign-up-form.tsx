"use client";

import { useActionState, useState } from "react";

import { signUp } from "@/app/auth/actions";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm({ serverError }: { serverError?: string }) {
  const [error, setError] = useState("");
  const [state, formAction, pending] = useActionState(
    signUp,
    { email: "", error: "" },
    "/auth/sign-up",
  );

  function checkPasswords(event: React.SubmitEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmPassword")) {
      event.preventDefault();
      setError("Passwords do not match. Please try again.");
    } else {
      setError("");
    }
  }

  return (
    <>
      {(error || state.error || serverError) && (
        <p role="alert" className="text-destructive">
          {error || state.error || serverError}
        </p>
      )}
      <form action={formAction} onSubmit={checkPasswords} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            required
          />
        </div>
        <SignUpPasswords />
        <button
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          Create account
        </button>
      </form>
    </>
  );
}

function SignUpPasswords() {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          visibilityLabel="confirm password"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          required
        />
      </div>
    </>
  );
}
