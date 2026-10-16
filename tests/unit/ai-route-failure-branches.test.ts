import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  context: vi.fn(),
  job: vi.fn(),
  application: vi.fn(),
  ready: vi.fn(),
  reserve: vi.fn(),
  finalize: vi.fn(),
  draft: vi.fn(),
  summary: vi.fn(),
}));
vi.mock("@/lib/ai/application-data", () => ({
  getApplicantContext: mocks.context,
  getHrContext: mocks.context,
  getPublishedJob: mocks.job,
  getSubmittedApplication: mocks.application,
}));
vi.mock("@/lib/ai/quota-audit", () => ({
  reserveAiInvocation: mocks.reserve,
  finalizeAiInvocation: mocks.finalize,
}));
vi.mock("@/lib/ai/soclaas-client", () => ({
  isSoCLaaSReady: mocks.ready,
  generateApplicantDraft: mocks.draft,
  generateHrSummary: mocks.summary,
}));
import { POST as draft } from "@/app/api/ai/applicant-draft/route";
import { POST as summary } from "@/app/api/ai/hr-summary/route";

const id = "00000000-0000-4000-8000-000000000101";
const roles = [
  {
    name: "Applicant",
    post: draft,
    data: { jobId: id, notes: "Synthetic notes" },
    read: mocks.job,
    generate: mocks.draft,
  },
  {
    name: "HR",
    post: summary,
    data: { applicationId: id },
    read: mocks.application,
    generate: mocks.summary,
  },
];
function request(data: unknown, raw = false) {
  return new Request("https://careers.example/api/ai", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://careers.example",
    },
    body: raw ? String(data) : JSON.stringify(data),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.context.mockResolvedValue({
    status: "authorized",
    user: { id },
    client: {},
  });
  mocks.job.mockResolvedValue({
    id,
    title: "Synthetic role",
    requirements: "Testing.",
  });
  mocks.application.mockResolvedValue({
    id,
    coverLetter: "I tested a project.",
    requirements: "Testing.",
  });
  mocks.ready.mockReturnValue(true);
  mocks.reserve.mockResolvedValue({ ok: true, invocationId: id });
  mocks.finalize.mockResolvedValue(true);
  mocks.draft.mockResolvedValue({ draft: "Synthetic draft" });
  mocks.summary.mockResolvedValue({
    evidence_sentence_ids: [0],
    requirements_not_addressed_ids: [],
  });
});
afterEach(() => vi.resetAllMocks());

it.each(roles)(
  "$name rejects malformed JSON before protected reads",
  async (role) => {
    const response = await role.post(request("{broken", true));
    expect(response.status).toBe(400);
    expect(role.read).not.toHaveBeenCalled();
    expect(mocks.reserve).not.toHaveBeenCalled();
  },
);
it.each(roles)(
  "$name rejects invalid identifiers before protected reads",
  async (role) => {
    const response = await role.post(
      request({ jobId: "invalid", applicationId: "invalid", notes: "Notes" }),
    );
    expect(response.status).toBe(400);
    expect(role.read).not.toHaveBeenCalled();
  },
);
it.each(roles)(
  "$name returns an uncached safe failure for unavailable provider configuration",
  async (role) => {
    mocks.ready.mockReturnValue(false);
    const response = await role.post(request(role.data));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(role.read).not.toHaveBeenCalled();
    expect(role.generate).not.toHaveBeenCalled();
  },
);
it.each(roles)(
  "$name refuses unavailable targets before quota/provider work",
  async (role) => {
    role.read.mockResolvedValue(null);
    expect((await role.post(request(role.data))).status).toBe(404);
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(role.generate).not.toHaveBeenCalled();
  },
);
it.each(roles)(
  "$name fails closed when reservation storage fails without a retry interval",
  async (role) => {
    mocks.reserve.mockResolvedValue({ ok: false });
    const response = await role.post(request(role.data));
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBeNull();
    expect(role.generate).not.toHaveBeenCalled();
  },
);
it("HR quota denial returns a bounded retry state without a completion", async () => {
  mocks.reserve.mockResolvedValue({ ok: false, retryAfterSeconds: 42 });
  const response = await summary(request({ applicationId: id }));
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("42");
  expect(mocks.summary).not.toHaveBeenCalled();
});
it.each(roles)(
  "$name withholds invalid output when failure-audit finalization fails",
  async (role) => {
    role.generate.mockResolvedValue({ unexpected: "SYNTHETIC_PRIVATE_OUTPUT" });
    mocks.finalize.mockResolvedValue(false);
    const response = await role.post(request(role.data));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain(
      "SYNTHETIC_PRIVATE_OUTPUT",
    );
    expect(mocks.finalize).toHaveBeenCalledWith(id, id, "failure");
  },
);
it("Applicant rejects invalid model data after recording its failure", async () => {
  mocks.draft.mockResolvedValue({ draft: "", approved: true });
  const response = await draft(request(roles[0].data));
  expect(response.status).toBe(502);
  expect(await response.json()).not.toHaveProperty("draft");
  expect(mocks.finalize).toHaveBeenCalledWith(id, id, "failure");
});
it.each(roles)("$name hides context-service exceptions", async (role) => {
  mocks.context.mockRejectedValue(new Error("SYNTHETIC_PRIVATE_DETAILS"));
  const response = await role.post(request(role.data));
  expect(response.status).toBe(503);
  expect(JSON.stringify(await response.json())).not.toContain(
    "SYNTHETIC_PRIVATE_DETAILS",
  );
  expect(role.generate).not.toHaveBeenCalled();
});
it.each(roles)(
  "$name withholds provider errors when terminal auditing fails",
  async (role) => {
    role.generate.mockRejectedValue(new Error("SYNTHETIC_PRIVATE_ERROR"));
    mocks.finalize.mockResolvedValue(false);
    const response = await role.post(request(role.data));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain(
      "SYNTHETIC_PRIVATE_ERROR",
    );
  },
);
it("HR returns safe ordinary provider failure and sanitized positive throttling", async () => {
  mocks.summary
    .mockRejectedValueOnce(new Error("SYNTHETIC_PRIVATE_ERROR"))
    .mockRejectedValueOnce({
      status: 429,
      headers: new Headers({ "retry-after": "15" }),
    });
  const failed = await summary(request({ applicationId: id }));
  expect(failed.status).toBe(503);
  expect(JSON.stringify(await failed.json())).not.toContain(
    "SYNTHETIC_PRIVATE_ERROR",
  );
  const busy = await summary(request({ applicationId: id }));
  expect(busy.status).toBe(503);
  expect(busy.headers.get("retry-after")).toBe("15");
});
it.each(["coverLetter", "requirements"])(
  "HR refuses an empty %s before reservation",
  async (field) => {
    mocks.application.mockResolvedValue({
      id,
      coverLetter: "Synthetic letter.",
      requirements: "Testing.",
      [field]: "  ",
    });
    const response = await summary(request({ applicationId: id }));
    expect(response.status).toBe(503);
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(mocks.summary).not.toHaveBeenCalled();
  },
);
