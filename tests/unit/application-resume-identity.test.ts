import { expect, it, vi } from "vitest";
import {
  applicationResumeIdentity,
  bindApplicationResumeClient,
} from "@/lib/application-resume-client";
import type { resumeMutationClient } from "@/lib/application-resume-storage";

it("pins file mutations to the original application and cannot be overridden by arguments", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
  const base = { rpc } as unknown as ReturnType<typeof resumeMutationClient>;
  const bound = bindApplicationResumeClient(base, "old-application");
  for (const name of [
    "prepare_application_resume",
    "finalize_application_resume",
    "remove_application_resume",
    "recover_pending_application_resume",
    "cancel_application_resume",
    "claim_resume_cleanup",
  ]) {
    await bound.rpc(name, {
      p_application: "different-application",
      p_job: "job",
    });
    expect(rpc).toHaveBeenLastCalledWith(name, {
      p_application: "old-application",
      p_job: "job",
    });
  }
});

it("rebinds first-upload finalization to the newly allocated record rather than retaining null", async () => {
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const base = { rpc } as unknown as ReturnType<typeof resumeMutationClient>;
  const first = bindApplicationResumeClient(base, null);
  const finalized = bindApplicationResumeClient(first, "created-application");
  await finalized.rpc("finalize_application_resume", {
    p_operation: "same-operation",
  });
  expect(rpc).toHaveBeenCalledWith("finalize_application_resume", {
    p_operation: "same-operation",
    p_application: "created-application",
  });
  expect(applicationResumeIdentity(finalized)).toBe("created-application");
  expect(applicationResumeIdentity(first)).toBeNull();
});
