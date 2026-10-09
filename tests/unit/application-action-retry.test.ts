import { beforeEach, describe, expect, it, vi } from "vitest";

const jobId = "00000000-0000-4000-8000-000000000101";
const applicationId = "00000000-0000-4000-8000-000000000a11";
const applicantId = "00000000-0000-4000-8000-000000000a12";

const { rpc, maybeSingle, eq, from, revalidatePath, redirect } = vi.hoisted(() => {
  const rpc = vi.fn();
  const maybeSingle = vi.fn();
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return {
    rpc, maybeSingle, eq: query.eq, from: vi.fn(() => query),
    revalidatePath: vi.fn(),
    redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }),
  };
});

vi.mock("@/lib/auth", () => ({
  requireApplicant: async () => ({ client: { rpc, from }, user: { id: applicantId } }),
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { updateApplication } from "../../src/app/applications/actions";

function submission() {
  const form = new FormData();
  form.set("intent", "submit");
  form.set("cover_letter", "Retried letter");
  form.set("revision", "1");
  return form;
}

function submittedEdit() {
  const form = new FormData();
  form.set("intent", "edit");
  form.set("cover_letter", "A post-submission correction");
  form.set("revision", "2");
  return form;
}

describe("application action retry after an uncertain response", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ data: null, error: { message: "Application already submitted" } });
  });

  it("re-reads only the owner and selected job, then shows the existing submission", async () => {
    maybeSingle.mockResolvedValue({ data: {
      id: applicationId, submission_state: "submitted", cover_letter: "First letter",
    }, error: null });

    await expect(updateApplication(jobId, submission()))
      .rejects.toThrow(`REDIRECT:/applications/${applicationId}?notice=already-submitted`);
    expect(from).toHaveBeenCalledWith("applications");
    expect(eq).toHaveBeenCalledWith("applicant_id", applicantId);
    expect(eq).toHaveBeenCalledWith("job_id", jobId);
    expect(revalidatePath).toHaveBeenCalledWith("/applications");
  });

  it("does not claim success if the owner row cannot be read", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(updateApplication(jobId, submission()))
      .rejects.toThrow(`REDIRECT:/jobs/${jobId}/apply?error=update`);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("directs post-submission correction attempts to HR without calling the database", async () => {
    await expect(updateApplication(jobId, submittedEdit()))
      .rejects.toThrow("REDIRECT:/applications?error=correction");
    expect(rpc).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
