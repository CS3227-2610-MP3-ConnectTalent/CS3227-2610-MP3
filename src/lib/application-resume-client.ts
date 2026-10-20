import "server-only";
import type { resumeMutationClient } from "./application-resume-storage";

type Client = ReturnType<typeof resumeMutationClient>;
const identityMutations = new Set([
  "prepare_application_resume",
  "finalize_application_resume",
  "remove_application_resume",
  "recover_pending_application_resume",
  "cancel_application_resume",
  "claim_resume_cleanup",
]);
const bindings = new WeakMap<
  Client,
  { base: Client; applicationId: string | null }
>();

export function applicationResumeIdentity(client: Client) {
  return bindings.get(client)?.applicationId ?? null;
}

/** Bind all application-file RPCs to one record, not whichever draft is active. */
export function bindApplicationResumeClient(
  client: Client,
  applicationId: string | null,
): Client {
  const base = bindings.get(client)?.base ?? client;
  const bound = new Proxy(base, {
    get(target, property) {
      if (property !== "rpc") return Reflect.get(target, property, target);
      return (name: string, args: Record<string, unknown> = {}) =>
        target.rpc(
          name,
          identityMutations.has(name)
            ? { ...args, p_application: applicationId }
            : args,
        );
    },
  });
  bindings.set(bound, { base, applicationId });
  return bound;
}
