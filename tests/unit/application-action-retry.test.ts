import { beforeEach, expect, it, vi } from "vitest";

const jobId = "00000000-0000-4000-8000-000000000101";
const applicationId = "00000000-0000-4000-8000-000000000a11";
const initial = {
  values: { full_name: "", phone: "", portfolio_url: "", cover_letter: "" },
  errors: {},
};
const applicantId = "00000000-0000-4000-8000-000000000a12";

const { rpc, maybeSingle, eq, from, revalidatePath, redirect } = vi.hoisted(
  () => {
    const rpc = vi.fn();
    const maybeSingle = vi.fn();
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    return {
      rpc,
      maybeSingle,
      eq: query.eq,
      from: vi.fn(() => query),
      revalidatePath: vi.fn(),
      redirect: vi.fn((path: string): never => {
        throw new Error(`REDIRECT:${path}`);
      }),
    };
  },
);

vi.mock("@/lib/auth", () => ({
  requireApplicant: async () => ({
    client: { rpc, from },
    user: { id: applicantId },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { updateApplication } from "../../src/app/applications/actions";

function submission() {
  const form = new FormData();
  form.set("jobId", jobId);
  form.set("intent", "submit");
  form.set("full_name", "Synthetic Applicant");
  form.set("cover_letter", "Retried letter");
  form.set("revision", "1");
  return form;
}

function submittedEdit() {
  const form = new FormData();
  form.set("jobId", jobId);
  form.set("intent", "edit");
  form.set("cover_letter", "A post-submission correction");
  form.set("revision", "2");
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  rpc.mockResolvedValue({
    data: null,
    error: { message: "Application already submitted" },
  });
});

it("re-reads only the owner and selected job, then shows the existing submission", async () => {
  maybeSingle.mockResolvedValue({
    data: {
      id: applicationId,
      education: null,
      work_experience: null,
      submission_state: "submitted",
      cover_letter: "First letter",
      full_name: null,
      phone: null,
      portfolio_url: null,
      revision: 2,
    },
    error: null,
  });

  await expect(updateApplication(initial, submission())).rejects.toThrow(
    `REDIRECT:/applications/${applicationId}?notice=already-submitted`,
  );
  expect(from).toHaveBeenCalledWith("applications");
  expect(eq).toHaveBeenCalledWith("applicant_id", applicantId);
  expect(eq).toHaveBeenCalledWith("job_id", jobId);
  expect(revalidatePath).toHaveBeenCalledWith("/applications");
});

it("does not claim success if the owner row cannot be read", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: null });
  await expect(updateApplication(initial, submission())).resolves.toMatchObject(
    {
      values: {
        full_name: "Synthetic Applicant",
        cover_letter: "Retried letter",
      },
      message: expect.stringContaining("could not save"),
    },
  );
  expect(revalidatePath).not.toHaveBeenCalled();
});

it("directs post-submission correction attempts to HR without calling the database", async () => {
  await expect(
    updateApplication(initial, submittedEdit()),
  ).resolves.toMatchObject({
    message: expect.stringContaining("Submitted applications are locked"),
  });
  expect(rpc).not.toHaveBeenCalled();
  expect(from).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

beforeEach(() => {
  vi.clearAllMocks();
});
it("never passes browser-supplied email to the database", async () => {
  rpc.mockResolvedValue({ data: applicationId, error: null });
  const form = submission();
  form.set("submitted_email", "forged@example.test");
  form.set("email", "forged@example.test");
  await expect(updateApplication(initial, form)).rejects.toThrow(
    `REDIRECT:/applications/${applicationId}`,
  );
  expect(rpc).toHaveBeenCalledWith("submit_application_details_v3", {
    p_job_id: jobId,
    p_cover_letter: "Retried letter",
    p_full_name: "Synthetic Applicant",
    p_phone: null,
    p_portfolio_url: null,
    p_education: null,
    p_work_experience: null,
    p_expected_revision: 1,
  });
});
it("retains every entered field without a database call on validation errors", async () => {
  const form = submission();
  form.set("phone", "+65 1234");
  form.set("portfolio_url", "javascript:alert(1)");
  expect(await updateApplication(initial, form)).toMatchObject({
    values: {
      full_name: "Synthetic Applicant",
      phone: "+65 1234",
      portfolio_url: "javascript:alert(1)",
      cover_letter: "Retried letter",
    },
    errors: { portfolio_url: expect.any(String) },
  });
  expect(rpc).not.toHaveBeenCalled();
});
it("retains inputs when both RPC and reconciliation transport fail", async () => {
  rpc.mockRejectedValue(new Error("Private transport diagnostic"));
  maybeSingle.mockRejectedValue(new Error("Private read diagnostic"));
  const result = await updateApplication(initial, submission());
  expect(result.values.cover_letter).toBe("Retried letter");
  expect(result.message).toContain("could not save");
  expect(result.message).not.toContain("diagnostic");
});
