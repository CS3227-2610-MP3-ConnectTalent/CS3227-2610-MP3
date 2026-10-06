"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold">Jobs are unavailable right now</h1>
      <p className="mt-3 text-muted-foreground">Please try again shortly.</p>
      <div className="mt-6 flex gap-5">
        <button type="button" onClick={reset} className="font-medium underline underline-offset-4">Try again</button>
        <Link href="/" className="font-medium underline underline-offset-4">Open roles</Link>
      </div>
    </main>
  );
}
