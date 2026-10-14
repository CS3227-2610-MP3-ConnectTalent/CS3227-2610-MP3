"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel: string;
  className?: string;
};

/** Reads the nearest form only; server actions remain responsible for writes. */
export function PendingSubmitButton({ label, pendingLabel, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`inline-flex items-center gap-2 ${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending && (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        )}
        {pending ? pendingLabel : label}
      </button>
      <span role="status" className="sr-only">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}
