import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), upload: vi.fn(), remove: vi.fn(), update: vi.fn(), existing: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc: mocks.rpc, storage: { from: () => ({ upload: mocks.upload, remove: mocks.remove }) },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.existing }) }), update: mocks.update }) }) }));
vi.mock("../../src/lib/resume-input", () => ({ validateResume: async () => ({ bytes: new Uint8Array([1]), filename: "synthetic.pdf", sha256: "a".repeat(64) }) }));
import { cancelResumeUpload, uploadApplicationResume } from "../../src/lib/application-resumes";
describe("durable resume lifecycle failures and retries", () => {
  beforeEach(() => {
    vi.clearAllMocks(); vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"); vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-unit-key");
    mocks.existing.mockResolvedValue({ data: null, error: null }); mocks.remove.mockResolvedValue({ error: null }); mocks.upload.mockResolvedValue({ error: null });
    mocks.update.mockReturnValue({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) });
  });
  it("keeps cleanup tombstones retryable when cancel/delete happens before upload completes", async () => {
    let resolveUpload!: (value: { error: null }) => void;
    mocks.upload.mockImplementation(() => new Promise(resolve => { resolveUpload = resolve; }));
    const key = "44000000-0000-4000-8000-000000000101/44000000-0000-4000-8000-000000000201.pdf";
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "reserve_application_resume") return { data: key, error: null };
      if (name === "finalize_application_resume") return { error: { message: "canceled" } };
      if (name === "claim_resume_cleanup") return { data: [{ id: "44000000-0000-4000-8000-000000000201", object_path: key }], error: null };
      return { error: null };
    });
    const uploading = uploadApplicationResume("actor", "job", 1, new File(["synthetic"], "synthetic.pdf"));
    await vi.waitFor(() => expect(mocks.upload).toHaveBeenCalled());
    await cancelResumeUpload("actor", "job");
    resolveUpload({ error: null }); await expect(uploading).rejects.toThrow("could not confirm");
    expect(mocks.remove).toHaveBeenCalledTimes(2);
    expect(mocks.update).not.toHaveBeenCalledWith({ state: "deleted" });
  });
  it("reconciles a repeated HTTP operation without another Storage upload", async () => {
    const operation = "44000000-0000-4000-8000-000000000201";
    mocks.existing.mockResolvedValue({ data: { id: operation, applicant_id: "actor", filename: "synthetic.pdf", sha256: "a".repeat(64), byte_size: 1, state: "ready" }, error: null });
    mocks.rpc.mockResolvedValue({ data: operation, error: null });
    await uploadApplicationResume("actor", "job", 1, new File(["synthetic"], "synthetic.pdf"), operation);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledWith("finalize_application_resume", expect.objectContaining({ p_operation: operation, p_actor: "actor", p_job: "job" }));
  });
});
