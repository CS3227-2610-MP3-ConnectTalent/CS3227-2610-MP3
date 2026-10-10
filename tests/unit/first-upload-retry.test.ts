import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  lookup: vi.fn(),
  eq: vi.fn(),
  validate: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    from: () => {
      const query = {
        select: () => query,
        eq: mocks.eq,
        maybeSingle: mocks.lookup,
      };
      mocks.eq.mockReturnValue(query);
      return query;
    },
  }),
}));
vi.mock("../../src/lib/resume-input", () => ({
  validateResume: mocks.validate,
}));
import { uploadResumeForJob } from "../../src/lib/application-resumes";
const actor = "53000000-0000-4000-8000-000000000001";
const job = "53000000-0000-4000-8000-000000000101";
const operation = "53000000-0000-4000-8000-000000000201";
const file = new File(["synthetic"], "synthetic.pdf", {
  type: "application/pdf",
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-unit-key");
  mocks.validate.mockResolvedValue({
    bytes: new Uint8Array([1]),
    filename: "synthetic.pdf",
    sha256: "a".repeat(64),
  });
  mocks.lookup.mockResolvedValue({ data: { revision: 3 }, error: null });
  mocks.rpc.mockImplementation(async (name: string) =>
    name === "prepare_application_resume"
      ? { data: { id: actor, revision: 3, state: "ready" }, error: null }
      : name === "claim_resume_cleanup"
        ? { data: [], error: null }
        : { data: null, error: null },
  );
});
it("resolves only the owned job revision and recovers before preparing a retry", async () => {
  await uploadResumeForJob(actor, job, null, file, operation, true);
  expect(mocks.eq).toHaveBeenCalledWith("applicant_id", actor);
  expect(mocks.eq).toHaveBeenCalledWith("job_id", job);
  expect(mocks.rpc).toHaveBeenCalledWith("recover_pending_application_resume", {
    p_actor: actor,
    p_job: job,
    p_revision: 3,
  });
  expect(mocks.rpc).toHaveBeenCalledWith(
    "prepare_application_resume",
    expect.objectContaining({ p_revision: 3, p_operation: operation }),
  );
  const calls = mocks.rpc.mock.calls.map((call) => call[0]);
  expect(calls.indexOf("recover_pending_application_resume")).toBeLessThan(
    calls.indexOf("prepare_application_resume"),
  );
});
it("allows fresh allocation if the failed request never created an application", async () => {
  mocks.lookup.mockResolvedValue({ data: null, error: null });
  await uploadResumeForJob(actor, job, null, file, operation, true);
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "recover_pending_application_resume",
    expect.anything(),
  );
  expect(mocks.rpc).toHaveBeenCalledWith(
    "prepare_application_resume",
    expect.objectContaining({ p_revision: null }),
  );
});
it("fails closed on lookup error or invalid stored revision", async () => {
  for (const result of [
    { data: null, error: { message: "unavailable" } },
    { data: { revision: 0 }, error: null },
  ]) {
    mocks.lookup.mockResolvedValue(result);
    await expect(
      uploadResumeForJob(actor, job, null, file, operation, true),
    ).rejects.toThrow();
  }
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("never upgrades an explicitly supplied stale revision", async () => {
  await uploadResumeForJob(actor, job, 1, file, operation, true);
  expect(mocks.lookup).not.toHaveBeenCalled();
  expect(mocks.rpc).toHaveBeenCalledWith("recover_pending_application_resume", {
    p_actor: actor,
    p_job: job,
    p_revision: 1,
  });
});
it("does not prepare after the database rejects recovery for a changed or frozen draft", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "Application changed" } });
  await expect(
    uploadResumeForJob(actor, job, null, file, operation, true),
  ).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "prepare_application_resume",
    expect.anything(),
  );
});
it("rejects invalid PDFs before lookup or allocation", async () => {
  mocks.validate.mockRejectedValue(new Error("Choose a valid PDF"));
  await expect(
    uploadResumeForJob(actor, job, null, file, operation, true),
  ).rejects.toThrow("valid PDF");
  expect(mocks.lookup).not.toHaveBeenCalled();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
