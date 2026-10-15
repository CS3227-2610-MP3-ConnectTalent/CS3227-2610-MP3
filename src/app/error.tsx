"use client";

import Link from "next/link";
import { useTransition } from "react";

import { PendingLinkStatus } from "@/components/pending-link-status";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold">Jobs are unavailable right now</h1>
      <p className="mt-3 text-muted-foreground">Please try again shortly.</p>
      <div className="mt-6 flex gap-5">
        <button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() => startTransition(() => reset())}
          className="font-medium underline underline-offset-4"
        >
          {pending ? "Retrying…" : "Try again"}
        </button>
        <Link href="/" className="font-medium underline underline-offset-4">
          Open roles
          <PendingLinkStatus label="Opening roles…" />
        </Link>
      </div>
    </main>
  );
}
