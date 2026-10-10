"use client";

import { useState } from "react";

import type { HrSummaryResponse } from "@/lib/ai/schemas";

const sections: Array<{ key: keyof HrSummaryResponse; heading: string }> = [
  { key: "evidence_mentioned", heading: "Evidence mentioned" },
  { key: "requirements_not_addressed", heading: "Requirements not addressed" },
  { key: "follow_up_questions", heading: "Follow-up questions" },
];

function isSummary(value: unknown): value is HrSummaryResponse {
  if (typeof value !== "object" || value === null) return false;
  return (
    sections.every(({ key }) => {
      const items = (value as Record<string, unknown>)[key];
      return (
        Array.isArray(items) &&
        items.length <= 5 &&
        items.every(
          (item) =>
            typeof item === "string" &&
            item.trim().length > 0 &&
            item.length <= 240,
        )
      );
    }) && Object.keys(value).length === sections.length
  );
}

export function HrAiSummarySections({
  summary,
}: {
  summary: HrSummaryResponse;
}) {
  return (
    <div className="space-y-4">
      {sections.map(({ key, heading }) => (
        <section key={key} className="space-y-2">
          <h3 className="font-medium">{heading}</h3>
          {summary[key].length === 0 ? (
            <p className="text-sm text-muted-foreground">None identified.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {summary[key].map((item, index) => (
                <li key={`${key}-${index}`} className="whitespace-pre-wrap">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function HrAiSummary({ applicationId }: { applicationId: string }) {
  const [summary, setSummary] = useState<HrSummaryResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const state = { setSummary, setError, setBusy };
  return (
    <HrAiSummaryContent
      applicationId={applicationId}
      summary={summary}
      error={error}
      busy={busy}
      state={state}
    />
  );
}

type SummaryState = {
  setSummary: (summary: HrSummaryResponse) => void;
  setError: (error: string) => void;
  setBusy: (busy: boolean) => void;
};

function HrAiSummaryContent({
  applicationId,
  summary,
  error,
  busy,
  state,
}: {
  applicationId: string;
  summary: HrSummaryResponse | null;
  error: string;
  busy: boolean;
  state: SummaryState;
}) {
  return (
    <section
      className="space-y-4 rounded-lg border p-4"
      aria-labelledby="ai-summary-heading"
      aria-busy={busy}
    >
      <header className="space-y-1">
        <h2 id="ai-summary-heading" className="text-xl font-semibold">
          AI cover-letter summary
        </h2>
        <p className="text-sm text-muted-foreground">
          The submitted letter and published requirements are sent to SoCLaaS
          for this request. AI summaries can be inaccurate. Verify every point
          against the original letter. This summary does not recommend a hiring
          decision or change status.
        </p>
      </header>
      <button
        type="button"
        onClick={() => void summarizeApplication(applicationId, state)}
        disabled={busy}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Summarizing…" : summary ? "Refresh summary" : "Summarize"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {summary && <HrAiSummarySections summary={summary} />}
    </section>
  );
}

async function summarizeApplication(
  applicationId: string,
  state: SummaryState,
) {
  state.setBusy(true);
  state.setError("");
  try {
    state.setSummary(await requestSummary(applicationId));
  } catch (caught) {
    state.setError(summaryError(caught));
  } finally {
    state.setBusy(false);
  }
}

async function requestSummary(applicationId: string) {
  const response = await fetch("/api/ai/hr-summary", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ applicationId }),
  });
  const value = await readSummaryResponse(response);
  if (!response.ok || !isSummary(value))
    throw new Error(response.status === 429 ? "limited" : "unavailable");
  return value;
}

async function readSummaryResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new Error("unavailable");
  }
}

function summaryError(error: unknown) {
  return error instanceof Error && error.message === "limited"
    ? "AI usage limit reached. Try again shortly."
    : "The summary is temporarily unavailable. The original letter and review status are unchanged.";
}
