"use client";

import { useActionState } from "react";

import { updatePassword } from "@/app/auth/actions";
import { PasswordInput } from "@/components/password-input";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    updatePassword,
    { error: "" },
    "/auth/reset-password",
  );
  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p role="alert" className="text-destructive">
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          visibilityLabel="confirm password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>
      <PendingSubmitButton
        label="Update password"
        pendingLabel="Updating password…"
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      />
    </form>
  );
}
