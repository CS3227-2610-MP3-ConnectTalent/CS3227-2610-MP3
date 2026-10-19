import { expect, it, vi } from "vitest";
import { applyResumeResponse } from "@/components/resume-panel-response";

it("does not apply a server revision returned with a rejected résumé change", async () => {
  const onChange = vi.fn();
  const setAttachment = vi.fn();
  const props = {
    applicationId: "app-1",
    revision: 7,
    editable: true,
    resume: null,
    onChange,
  };
  const state = {
    setAttachment,
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
});
