import { expect, it, vi } from "vitest";
import { applyResumeResponse } from "@/components/resume-panel-response";

it("does not apply a server revision returned with a rejected résumé change", async () => {
  const onChange = vi.fn();
  const setAttachment = vi.fn();
  const setRevision = vi.fn();
  const props = {
    applicationId: "app-1",
    revision: 7,
    editable: true,
    resume: null,
    onChange,
  };
  const state = {
    setAttachment,
    setRevision,
    setOperation: vi.fn(),
    setUploadFailed: vi.fn(),
    setProfileCopyRetryAvailable: vi.fn(),
    setProfileCopyAttempt: vi.fn(),
    setMessage: vi.fn(),
  };
  const response = new Response(
    JSON.stringify({
      error: "The draft changed. Reload before editing.",
      applicationId: "app-1",
      revision: 8,
    }),
    { status: 409 },
  );

  await applyResumeResponse(response, props, state, "remove");

  expect(onChange).not.toHaveBeenCalled();
  expect(setAttachment).not.toHaveBeenCalled();
  expect(setRevision).not.toHaveBeenCalled();
});

it("rejects a successful file response for a different application before adopting its data", async () => {
  const onChange = vi.fn();
  const state = {
    setAttachment: vi.fn(),
    setRevision: vi.fn(),
    setOperation: vi.fn(),
    setUploadFailed: vi.fn(),
    setProfileCopyRetryAvailable: vi.fn(),
    setProfileCopyAttempt: vi.fn(),
    setMessage: vi.fn(),
  };
  const response = Response.json({
    ok: true,
    applicationId: "new-B",
    revision: 2,
    resume: { filename: "B.pdf" },
  });
  await expect(
    applyResumeResponse(
      response,
      {
        applicationId: "old-A",
        revision: 1,
        editable: true,
        resume: null,
        onChange,
      },
      state,
      "upload",
    ),
  ).rejects.toThrow("application changed");
  expect(state.setAttachment).not.toHaveBeenCalled();
  expect(state.setRevision).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
});
