import { mkdirSync, writeFileSync } from "node:fs";
import { afterAll, afterEach, beforeEach, expect, it, vi } from "vitest";
import { applicantDraftMessages, hrSummaryMessages } from "@/lib/ai/prompts";
import {
  generateApplicantDraft,
  generateHrSummary,
} from "@/lib/ai/soclaas-client";
import { applicantDraftResponseSchema } from "@/lib/ai/schemas";
import { buildHrSummaryResponse } from "@/lib/ai/hr-summary";
import {
  inputFor,
  invalidDrafts,
  invalidSelections,
  promptCases,
} from "./corpus";
import { safeReport, type EvalResult } from "./report";

const rows: EvalResult[] = [];
let network: ReturnType<typeof vi.fn>;
beforeEach(() => {
  // No ambient key is used; real OpenAI SDK exercises the bounded fetch adapter.
  vi.stubEnv("SOCLAAS_AI_ENABLED", "true");
  vi.stubEnv("SOCLAAS_API_KEY", "synthetic-offline-no-network");
  vi.stubEnv("SOCLAAS_BASE_URL", "https://soclaas-api.comp.nus.edu.sg/v1");
  vi.stubEnv("SOCLAAS_MODEL", "offline-mock");
  network = vi.fn();
  vi.stubGlobal("fetch", network);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function result(
  caseId: string,
  category: EvalResult["category"],
  check: EvalResult["check"],
  passed: boolean,
) {
  rows.push({
    caseId,
    category,
    check,
    variant: "offline",
    outcome: passed ? "passed" : "failed",
    elapsedMs: 0,
    humanReview: "pending",
  });
  expect(passed).toBe(true);
}

it.each(promptCases)(
  "$id: source stays in the data message ($category)",
  async (item) => {
    const input = inputFor(item);
    const messages =
      item.role === "applicant"
        ? applicantDraftMessages(input.applicant)
        : hrSummaryMessages(input.hr);
    const output =
      item.role === "applicant"
        ? { draft: "Synthetic course project evidence." }
        : { evidence_sentence_ids: [0], requirements_not_addressed_ids: [] };
    network.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: "stop",
              message: { role: "assistant", content: JSON.stringify(output) },
            },
          ],
        }),
        { headers: { "content-type": "application/json" } },
      ),
    );
    const actual =
      item.role === "applicant"
        ? await generateApplicantDraft(input.applicant)
        : await generateHrSummary(input.hr);
    const sent = JSON.parse(network.mock.calls[0][1].body);
    const isolated =
      messages.length === 2 &&
      !messages[0].content.includes(item.text) &&
      JSON.stringify(JSON.parse(messages[1].content)).includes(
        JSON.stringify(item.text).slice(1, -1),
      );
    const valid =
      item.role === "applicant"
        ? applicantDraftResponseSchema.safeParse(actual).success
        : !!buildHrSummaryResponse(
            actual,
            input.hr.letterSentences,
            input.hr.requirementSentences,
          );
    result(
      item.id,
      "prompt-contract",
      "boundary-contract",
      isolated && valid && !sent.tools && network.mock.calls.length === 1,
    );
  },
);

it.each(
  invalidDrafts.map((value, index) => ({
    value,
    id: `D${String(index + 1).padStart(2, "0")}`,
  })),
)("$id: rejects unsafe draft shape", ({ value, id }) => {
  result(
    id,
    "output-contract",
    "strict-output",
    !applicantDraftResponseSchema.safeParse(value).success,
  );
});
it.each(
  invalidSelections.map((value, index) => ({
    value,
    id: `S${String(index + 1).padStart(2, "0")}`,
  })),
)("$id: rejects unsafe summary selection", ({ value, id }) => {
  result(
    id,
    "output-contract",
    "strict-output",
    buildHrSummaryResponse(
      value,
      ["Synthetic evidence."],
      ["Synthetic requirement."],
    ) === null,
  );
});

afterAll(() => {
  mkdirSync("test-results/ai-evals", { recursive: true });
  writeFileSync(
    "test-results/ai-evals/offline-report.json",
    JSON.stringify(safeReport("offline", rows), null, 2),
  );
});
