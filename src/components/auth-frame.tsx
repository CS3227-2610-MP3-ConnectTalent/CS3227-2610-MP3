import type { ReactNode } from "react";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="page-shell mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <Link href="/" className="mb-6 inline-block text-sm underline">
        ← Careers
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1fr]">
        <aside className="rounded-3xl bg-violet-100 p-7 text-violet-950 sm:p-10">
          <BriefcaseBusiness
            className="mb-5 text-violet-800"
            size={32}
            aria-hidden="true"
          />
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            A place for your next chapter.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-violet-900">
            Read about our openings, choose a team and make your application
            your own.
          </p>
        </aside>
        <section className="auth-panel min-w-0 space-y-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
