"use client";
import { useActionState, useState } from "react";
import { withdrawApplication } from "@/app/applications/actions";
export function WithdrawalControl({
  applicationId,
}: {
  applicationId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(withdrawApplication, {
    message: null,
  });
  if (!confirming)
    return <WithdrawButton onClick={() => setConfirming(true)} />;
  return (
    <WithdrawalConfirmation
      applicationId={applicationId}
      action={action}
      pending={pending}
      message={state.message}
      onCancel={() => setConfirming(false)}
    />
  );
}

function WithdrawButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-destructive px-4 py-2 text-destructive"
    >
      Withdraw application
    </button>
  );
}

function WithdrawalConfirmation({
  applicationId,
  action,
  pending,
  message,
  onCancel,
}: {
  applicationId: string;
  action: (formData: FormData) => void;
  pending: boolean;
  message: string | null;
  onCancel: () => void;
}) {
  return (
    <section
      className="space-y-3 rounded-lg border p-4"
      aria-label="Confirm withdrawal"
    >
      <p>
        Withdraw this application? This cannot be undone. You cannot apply for
        this job again. Your submission remains available as a record.
      </p>
      <WithdrawalForm
        applicationId={applicationId}
        action={action}
        pending={pending}
        onCancel={onCancel}
      />
      {message && <p role="alert">{message}</p>}
    </section>
  );
}

function WithdrawalForm({
  applicationId,
  action,
  pending,
  onCancel,
}: {
  applicationId: string;
  action: (formData: FormData) => void;
  pending: boolean;
  onCancel: () => void;
}) {
  return (
    <form action={action} className="flex flex-wrap gap-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="confirmed" value="true" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-destructive px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Withdrawing…" : "Confirm withdrawal"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className="rounded-lg border px-4 py-2"
      >
        Keep application
      </button>
    </form>
  );
}
