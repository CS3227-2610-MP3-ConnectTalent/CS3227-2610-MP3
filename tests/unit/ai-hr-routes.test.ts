import { afterEach, beforeEach, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  getHrContext: vi.fn(),
  getSubmittedApplication: vi.fn(),
  reserveAiInvocation: vi.fn(),
  finalizeAiInvocation: vi.fn(),
  isSoCLaaSReady: vi.fn(),
  generateHrSummary: vi.fn(),
}));

vi.mock("@/lib/ai/application-data", () => ({
  getHrContext: spies.getHrContext,
  getSubmittedApplication: spies.getSubmittedApplication,
}));
vi.mock("@/lib/ai/quota-audit", () => ({
  reserveAiInvocation: spies.reserveAiInvocation,
  finalizeAiInvocation: spies.finalizeAiInvocation,
}));
vi.mock("@/lib/ai/soclaas-client", () => ({
  isSoCLaaSReady: spies.isSoCLaaSReady,
  generateHrSummary: spies.generateHrSummary,
}));

import { POST as hrSummary } from "../../src/app/api/ai/hr-summary/route";

const applicationId = "00000000-0000-4000-8000-000000000a11";
const actorId = "00000000-0000-4000-8000-000000000a12";
const client = {};

function post(body: unknown) {
  return new Request("http://localhost/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function invalidModelOutputs() {
  return [
    {
      evidence_sentence_ids: [
        "This applicant is the strongest candidate to move to the next interview stage",
      ],
      requirements_not_addressed_ids: [],
    },
    { evidence_sentence_ids: [0, 0], requirements_not_addressed_ids: [] },
    { evidence_sentence_ids: [2], requirements_not_addressed_ids: [] },
    { evidence_sentence_ids: [], requirements_not_addressed_ids: [2] },
    {
      evidence_sentence_ids: [],
      requirements_not_addressed_ids: [],
      follow_up_questions: [
        "I would put this candidate through to the final round",
      ],
    },
  ];
}

beforeEach(() => {
  vi.clearAllMocks();
  spies.getHrContext.mockResolvedValue({
    status: "authorized",
    client,
    user: { id: actorId },
  });
  spies.getSubmittedApplication.mockResolvedValue({
    id: applicationId,
    coverLetter: "Worked on a course project. Built a web app.",
    requirements: "TypeScript experience. Cloud deployment experience.",
    hrNotes: "Never send private HR notes",
    otherApplicantLetter: "Never send another applicant's data",
  });
  spies.reserveAiInvocation.mockResolvedValue({
    ok: true,
    invocationId: "00000000-0000-4000-8000-000000000b02",
  });
  spies.finalizeAiInvocation.mockResolvedValue(true);
  spies.isSoCLaaSReady.mockReturnValue(true);
  spies.generateHrSummary.mockResolvedValue({
    evidence_sentence_ids: [0],
    requirements_not_addressed_ids: [1],
  });
});

afterEach(() => vi.resetAllMocks());

it("denies anonymous and Applicant callers before application reads or model calls", async () => {
  spies.getHrContext.mockResolvedValueOnce({ status: "anonymous" });
  const anonymous = await hrSummary(post({ applicationId }));
  expect(anonymous.status).toBe(401);
  expect(spies.getSubmittedApplication).not.toHaveBeenCalled();

  vi.clearAllMocks();
  spies.getHrContext.mockResolvedValue({ status: "forbidden" });
  const applicant = await hrSummary(post({ applicationId }));
  expect(applicant.status).toBe(403);
  expect(spies.getSubmittedApplication).not.toHaveBeenCalled();
  expect(spies.generateHrSummary).not.toHaveBeenCalled();
});

it("sends only the selected frozen letter and published requirements", async () => {
  const response = await hrSummary(post({ applicationId }));
  expect(response.status).toBe(200);
  expect(spies.getSubmittedApplication).toHaveBeenCalledWith(
    client,
    applicationId,
  );
  expect(spies.reserveAiInvocation).toHaveBeenCalledWith(
    actorId,
    "hr_summary",
    applicationId,
  );
  expect(spies.generateHrSummary).toHaveBeenCalledWith({
    letterSentences: ["Worked on a course project.", "Built a web app."],
    requirementSentences: [
      "TypeScript experience.",
      "Cloud deployment experience.",
    ],
  });
  expect(JSON.stringify(spies.generateHrSummary.mock.calls)).not.toContain(
    "private HR notes",
  );
  expect(JSON.stringify(spies.generateHrSummary.mock.calls)).not.toContain(
    "another applicant",
  );
  expect(await responseBody(response)).toEqual({
    evidence_mentioned: ["Worked on a course project."],
    requirements_not_addressed: ["Cloud deployment experience."],
    follow_up_questions: [
      "Could you share an example related to this requirement: “Cloud deployment experience.”?",
    ],
  });
});

it("withholds a summary if withdrawal commits during provider generation", async () => {
  spies.getSubmittedApplication
    .mockResolvedValueOnce({
      id: applicationId,
      coverLetter: "Synthetic letter.",
      requirements: "Synthetic requirement. Another requirement.",
    })
    .mockResolvedValueOnce(null);
  const response = await hrSummary(post({ applicationId }));
  expect(response.status).toBe(404);
  expect(await responseBody(response)).not.toHaveProperty("evidence_mentioned");
  expect(spies.generateHrSummary).toHaveBeenCalledTimes(1);
});

it("does not reserve quota or call the provider for an unavailable application", async () => {
  spies.getSubmittedApplication.mockResolvedValue(null);
  const response = await hrSummary(post({ applicationId }));
  expect(response.status).toBe(404);
  expect(spies.reserveAiInvocation).not.toHaveBeenCalled();
  expect(spies.generateHrSummary).not.toHaveBeenCalled();
});

it("withholds generated summaries when final audit finalization fails", async () => {
  spies.finalizeAiInvocation.mockResolvedValueOnce(false);
  const response = await hrSummary(post({ applicationId }));
  const body = await responseBody(response);
  expect(response.status).toBe(503);
  expect(body).toEqual({
    error: "AI summaries are temporarily unavailable.",
  });
  expect(body).not.toHaveProperty("evidence_mentioned");
  expect(spies.generateHrSummary).toHaveBeenCalledTimes(1);
  expect(spies.finalizeAiInvocation).toHaveBeenCalledWith(
    actorId,
    "00000000-0000-4000-8000-000000000b02",
    "success",
  );
});

it("rejects malformed model structures without exposing recommendations", async () => {
  spies.generateHrSummary.mockResolvedValueOnce({
    evidence_sentence_ids: [],
    requirements_not_addressed_ids: [],
    recommendation: "Hire",
  });
  const response = await hrSummary(post({ applicationId }));
  expect(response.status).toBe(502);
  expect(await responseBody(response)).not.toHaveProperty("recommendation");
});

it("rejects recommendation paraphrases and IDs outside the selected data", async () => {
  for (const output of invalidModelOutputs()) {
    spies.generateHrSummary.mockResolvedValueOnce(output);
    const response = await hrSummary(post({ applicationId }));
    expect(response.status).toBe(502);
    const body = JSON.stringify(await responseBody(response));
    expect(body).not.toContain("strongest candidate");
    expect(body).not.toContain("final round");
  }
});

it("sanitizes provider throttling and rejects invalid retry metadata", async () => {
  spies.generateHrSummary.mockRejectedValueOnce(
    Object.assign(new Error("provider response includes secret details"), {
      status: 429,
      headers: new Headers({ "retry-after": "not-a-duration" }),
    }),
  );
  const response = await hrSummary(post({ applicationId }));
  expect(response.status).toBe(503);
  expect(response.headers.get("Retry-After")).toBeNull();
  expect(JSON.stringify(await responseBody(response))).not.toContain(
    "secret details",
  );
  expect(spies.finalizeAiInvocation).toHaveBeenLastCalledWith(
    actorId,
    "00000000-0000-4000-8000-000000000b02",
    "failure",
  );
});
