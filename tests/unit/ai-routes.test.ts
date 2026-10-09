import { beforeEach, describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  getApplicantContext: vi.fn(),
  getHrContext: vi.fn(),
  getPublishedJob: vi.fn(),
  getSubmittedApplication: vi.fn(),
  reserveAiInvocation: vi.fn(),
  finalizeAiInvocation: vi.fn(),
  isSoCLaaSReady: vi.fn(),
  generateApplicantDraft: vi.fn(),
  generateHrSummary: vi.fn(),
}));

vi.mock("@/lib/ai/application-data", () => ({
  getApplicantContext: spies.getApplicantContext,
  getHrContext: spies.getHrContext,
  getPublishedJob: spies.getPublishedJob,
  getSubmittedApplication: spies.getSubmittedApplication,
}));
vi.mock("@/lib/ai/quota-audit", () => ({
  reserveAiInvocation: spies.reserveAiInvocation,
  finalizeAiInvocation: spies.finalizeAiInvocation,
}));
vi.mock("@/lib/ai/soclaas-client", () => ({
  isSoCLaaSReady: spies.isSoCLaaSReady,
  generateApplicantDraft: spies.generateApplicantDraft,
  generateHrSummary: spies.generateHrSummary,
}));

import { POST as applicantDraft } from "../../src/app/api/ai/applicant-draft/route";
import { POST as hrSummary } from "../../src/app/api/ai/hr-summary/route";

const jobId = "00000000-0000-4000-8000-000000000101";
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

describe("Applicant draft route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.getApplicantContext.mockResolvedValue({ status: "authorized", client, user: { id: actorId } });
    spies.getHrContext.mockResolvedValue({ status: "forbidden" });
    spies.getPublishedJob.mockResolvedValue({ id: jobId, title: "Software Engineer", requirements: "TypeScript and testing" });
    spies.reserveAiInvocation.mockResolvedValue({ ok: true, invocationId: "00000000-0000-4000-8000-000000000b01" });
    spies.finalizeAiInvocation.mockResolvedValue(true);
    spies.isSoCLaaSReady.mockReturnValue(true);
    spies.generateApplicantDraft.mockResolvedValue({ draft: "A checked draft" });
  });

  it("denies anonymous and wrong-role callers before protected reads or model calls", async () => {
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
  });

  it("rejects oversized notes before job reads or provider calls", async () => {
    const response = await applicantDraft(post({ jobId, notes: "x".repeat(4001) }));
    expect(response.status).toBe(400);
    expect(spies.getPublishedJob).not.toHaveBeenCalled();
    expect(spies.generateApplicantDraft).not.toHaveBeenCalled();
  });

  it("sends only Applicant notes and the selected published job title and requirements", async () => {
    const response = await applicantDraft(post({ jobId, notes: "Built a course project" }));
    expect(response.status).toBe(200);
    expect(spies.getPublishedJob).toHaveBeenCalledWith(client, jobId);
    expect(spies.reserveAiInvocation).toHaveBeenCalledWith(actorId, "applicant_draft", jobId);
    expect(spies.generateApplicantDraft).toHaveBeenCalledWith({
      notes: "Built a course project",
      jobTitle: "Software Engineer",
      requirements: "TypeScript and testing",
    });
    expect(await responseBody(response)).toEqual({ draft: "A checked draft" });
  });

  it("fails closed on quota, final audit, and provider errors", async () => {
    spies.reserveAiInvocation.mockResolvedValueOnce({ ok: false, retryAfterSeconds: 37 });
    const limited = await applicantDraft(post({ jobId, notes: "Notes" }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("37");
    expect(spies.generateApplicantDraft).not.toHaveBeenCalled();

    spies.finalizeAiInvocation.mockResolvedValueOnce(false);
    const auditFailure = await applicantDraft(post({ jobId, notes: "Notes" }));
    expect(auditFailure.status).toBe(503);
    expect(await responseBody(auditFailure)).not.toHaveProperty("draft");

    spies.generateApplicantDraft.mockRejectedValueOnce(new Error("provider body contains secret details"));
    const providerFailure = await applicantDraft(post({ jobId, notes: "Notes" }));
    expect(providerFailure.status).toBe(503);
    expect(JSON.stringify(await responseBody(providerFailure))).not.toContain("secret details");
  });

  it("maps provider throttling to a safe retry-later response", async () => {
    spies.generateApplicantDraft.mockRejectedValueOnce(Object.assign(
      new Error("provider response includes secret details"),
      { status: 429, headers: new Headers({ "retry-after": "37" }) },
    ));
    const applicantResponse = await applicantDraft(post({ jobId, notes: "Notes" }));
    expect(applicantResponse.status).toBe(503);
    expect(applicantResponse.headers.get("Retry-After")).toBe("37");
    expect(JSON.stringify(await responseBody(applicantResponse))).not.toContain("secret details");
    expect(spies.finalizeAiInvocation).toHaveBeenCalledWith(actorId, "00000000-0000-4000-8000-000000000b01", "failure");

    spies.finalizeAiInvocation.mockResolvedValueOnce(false);
    spies.generateApplicantDraft.mockRejectedValueOnce(Object.assign(
      new Error("provider response includes secret details"),
      { status: 429, headers: new Headers({ "retry-after": "37" }) },
    ));
    const auditFailure = await applicantDraft(post({ jobId, notes: "Notes" }));
    expect(auditFailure.status).toBe(503);
    expect(auditFailure.headers.get("Retry-After")).toBeNull();
    expect(JSON.stringify(await responseBody(auditFailure))).not.toContain("secret details");

    spies.getHrContext.mockResolvedValue({ status: "authorized", client, user: { id: actorId } });
    spies.getSubmittedApplication.mockResolvedValue({
      id: applicationId,
      coverLetter: "Submitted letter",
      requirements: "Published requirements",
    });
    spies.reserveAiInvocation.mockResolvedValueOnce({ ok: true, invocationId: "00000000-0000-4000-8000-000000000b02" });
    spies.generateHrSummary.mockRejectedValueOnce(Object.assign(
      new Error("provider response includes secret details"),
      { status: 429, headers: new Headers({ "retry-after": "not-a-duration" }) },
    ));
    const hrResponse = await hrSummary(post({ applicationId }));
    expect(hrResponse.status).toBe(503);
    expect(hrResponse.headers.get("Retry-After")).toBeNull();
    expect(JSON.stringify(await responseBody(hrResponse))).not.toContain("secret details");
    expect(spies.finalizeAiInvocation).toHaveBeenLastCalledWith(actorId, "00000000-0000-4000-8000-000000000b02", "failure");
  });
});

describe("HR summary route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.getHrContext.mockResolvedValue({ status: "authorized", client, user: { id: actorId } });
    spies.getApplicantContext.mockResolvedValue({ status: "forbidden" });
    spies.getSubmittedApplication.mockResolvedValue({
      id: applicationId,
      coverLetter: "Submitted letter",
      requirements: "TypeScript and testing",
      hrNotes: "Never send private HR notes",
      otherApplicantLetter: "Never send another applicant's data",
    });
    spies.reserveAiInvocation.mockResolvedValue({ ok: true, invocationId: "00000000-0000-4000-8000-000000000b02" });
    spies.finalizeAiInvocation.mockResolvedValue(true);
    spies.isSoCLaaSReady.mockReturnValue(true);
    spies.generateHrSummary.mockResolvedValue({
      evidence_mentioned: ["Mentions a project"],
      requirements_not_addressed: ["Does not mention deployment"],
      follow_up_questions: ["Which deployment tools did you use?"],
    });
  });

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

  it("sends only the selected frozen letter and its published requirements", async () => {
    const response = await hrSummary(post({ applicationId }));
    expect(response.status).toBe(200);
    expect(spies.getSubmittedApplication).toHaveBeenCalledWith(client, applicationId);
    expect(spies.reserveAiInvocation).toHaveBeenCalledWith(actorId, "hr_summary", applicationId);
    expect(spies.generateHrSummary).toHaveBeenCalledWith({
      coverLetter: "Submitted letter",
      requirements: "TypeScript and testing",
    });
    expect(JSON.stringify(spies.generateHrSummary.mock.calls)).not.toContain("private HR notes");
    expect(JSON.stringify(spies.generateHrSummary.mock.calls)).not.toContain("another applicant");
  });

  it("rejects malformed model structure and never returns a recommendation", async () => {
    spies.generateHrSummary.mockResolvedValueOnce({ recommendation: "Hire" });
    const response = await hrSummary(post({ applicationId }));
    expect(response.status).toBe(502);
    expect(await responseBody(response)).not.toHaveProperty("recommendation");
  });

  it("rejects hiring advice embedded in an otherwise valid summary array", async () => {
    spies.generateHrSummary.mockResolvedValueOnce({
      evidence_mentioned: ["Recommend hiring this applicant"],
      requirements_not_addressed: [],
      follow_up_questions: [],
    });
    const response = await hrSummary(post({ applicationId }));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await responseBody(response))).not.toContain("Recommend hiring");
  });
});
