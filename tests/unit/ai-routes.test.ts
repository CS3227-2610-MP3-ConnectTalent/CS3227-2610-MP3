import { beforeEach, describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  getApplicantContext: vi.fn(),
  getPublishedJob: vi.fn(),
  reserveAiInvocation: vi.fn(),
  finalizeAiInvocation: vi.fn(),
  isSoCLaaSReady: vi.fn(),
  generateApplicantDraft: vi.fn(),
}));

vi.mock("@/lib/ai/application-data", () => ({
  getApplicantContext: spies.getApplicantContext,
  getPublishedJob: spies.getPublishedJob,
}));
vi.mock("@/lib/ai/quota-audit", () => ({
  reserveAiInvocation: spies.reserveAiInvocation,
  finalizeAiInvocation: spies.finalizeAiInvocation,
}));
vi.mock("@/lib/ai/soclaas-client", () => ({
  isSoCLaaSReady: spies.isSoCLaaSReady,
  generateApplicantDraft: spies.generateApplicantDraft,
}));

import { POST as applicantDraft } from "../../src/app/api/ai/applicant-draft/route";

const jobId = "00000000-0000-4000-8000-000000000101";
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

function setupApplicantDefaults() {
  vi.clearAllMocks();
  spies.getApplicantContext.mockResolvedValue({
    status: "authorized",
    client,
    user: { id: actorId },
  });
  spies.getPublishedJob.mockResolvedValue({
    id: jobId,
    title: "Software Engineer",
    requirements: "TypeScript and testing",
  });
  spies.reserveAiInvocation.mockResolvedValue({
    ok: true,
    invocationId: "00000000-0000-4000-8000-000000000b01",
  });
  spies.finalizeAiInvocation.mockResolvedValue(true);
  spies.isSoCLaaSReady.mockReturnValue(true);
  spies.generateApplicantDraft.mockResolvedValue({ draft: "A checked draft" });
}

describe("Applicant draft route", () => {
  beforeEach(setupApplicantDefaults);
  it(
    "denies anonymous and wrong-role callers before protected reads or model calls",
    denyApplicantAccess,
  );
  it(
    "rejects oversized notes before job reads or provider calls",
    rejectOversizedNotes,
  );
  it(
    "sends only Applicant notes and the selected published job fields",
    sendScopedApplicantData,
  );
  it("fails closed when quota is exhausted", rejectQuotaExhaustion);
  it(
    "withholds drafts when final audit finalization fails",
    rejectAuditFailure,
  );
  it("hides provider error details", hidesProviderFailure);
  it(
    "maps provider throttling to a safe retry-later response",
    mapsProviderThrottle,
  );
});

async function denyApplicantAccess() {
  spies.getApplicantContext.mockResolvedValueOnce({ status: "anonymous" });
  const anonymous = await applicantDraft(post({ jobId, notes: "Notes" }));
  expect(anonymous.status).toBe(401);
  expect(spies.getPublishedJob).not.toHaveBeenCalled();
  expect(spies.generateApplicantDraft).not.toHaveBeenCalled();

  vi.clearAllMocks();
  spies.getApplicantContext.mockResolvedValue({ status: "forbidden" });
  const wrongRole = await applicantDraft(post({ jobId, notes: "Notes" }));
  expect(wrongRole.status).toBe(403);
  expect(spies.getPublishedJob).not.toHaveBeenCalled();
  expect(spies.generateApplicantDraft).not.toHaveBeenCalled();
}

async function rejectOversizedNotes() {
  const response = await applicantDraft(
    post({ jobId, notes: "x".repeat(4001) }),
  );
  expect(response.status).toBe(400);
  expect(spies.getPublishedJob).not.toHaveBeenCalled();
  expect(spies.generateApplicantDraft).not.toHaveBeenCalled();
}

async function sendScopedApplicantData() {
  const response = await applicantDraft(
    post({ jobId, notes: "Built a course project" }),
  );
  expect(response.status).toBe(200);
  expect(spies.getPublishedJob).toHaveBeenCalledWith(client, jobId);
  expect(spies.reserveAiInvocation).toHaveBeenCalledWith(
    actorId,
    "applicant_draft",
    jobId,
  );
  expect(spies.generateApplicantDraft).toHaveBeenCalledWith({
    notes: "Built a course project",
    jobTitle: "Software Engineer",
    requirements: "TypeScript and testing",
  });
  expect(await responseBody(response)).toEqual({ draft: "A checked draft" });
}

async function rejectQuotaExhaustion() {
  spies.reserveAiInvocation.mockResolvedValueOnce({
    ok: false,
    retryAfterSeconds: 37,
  });
  const response = await applicantDraft(post({ jobId, notes: "Notes" }));
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("37");
  expect(spies.generateApplicantDraft).not.toHaveBeenCalled();
}

async function rejectAuditFailure() {
  spies.finalizeAiInvocation.mockResolvedValueOnce(false);
  const response = await applicantDraft(post({ jobId, notes: "Notes" }));
  expect(response.status).toBe(503);
  expect(await responseBody(response)).not.toHaveProperty("draft");
}

async function hidesProviderFailure() {
  spies.generateApplicantDraft.mockRejectedValueOnce(
    new Error("provider body contains secret details"),
  );
  const response = await applicantDraft(post({ jobId, notes: "Notes" }));
  expect(response.status).toBe(503);
  expect(JSON.stringify(await responseBody(response))).not.toContain(
    "secret details",
  );
}

async function mapsProviderThrottle() {
  spies.generateApplicantDraft.mockRejectedValueOnce(
    Object.assign(new Error("provider response includes secret details"), {
      status: 429,
      headers: new Headers({ "retry-after": "37" }),
    }),
  );
  const response = await applicantDraft(post({ jobId, notes: "Notes" }));
  expect(response.status).toBe(503);
  expect(response.headers.get("Retry-After")).toBe("37");
  expect(JSON.stringify(await responseBody(response))).not.toContain(
    "secret details",
  );
  expect(spies.finalizeAiInvocation).toHaveBeenCalledWith(
    actorId,
    "00000000-0000-4000-8000-000000000b01",
    "failure",
  );
}
