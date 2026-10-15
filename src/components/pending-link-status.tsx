"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";

/** Render inside a Next Link so its status belongs to that navigation only. */
export function PendingLinkStatus({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <>
      <LoaderCircle
        size={14}
        aria-hidden="true"
        className={`ml-2 inline-block align-middle ${pending ? "animate-spin" : "invisible"}`}
      />
      <span role="status" aria-live="polite" className="sr-only">
        {pending ? label : ""}
      </span>
    </>
  );
}
