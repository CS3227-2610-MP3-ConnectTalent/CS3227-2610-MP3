import "server-only";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export type AiOperation = "applicant_draft" | "hr_summary";
type ReservationResult =
  | { ok: true; invocationId: string }
  | { ok: false; retryAfterSeconds?: number };

function createAiAuditClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("AI audit client is not configured.");
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function reserveAiInvocation(
  actorId: string,
  operation: AiOperation,
  targetId: string,
): Promise<ReservationResult> {
  try {
    const { data, error } = await createAiAuditClient().rpc(
      "reserve_ai_invocation",
      {
        p_actor_id: actorId,
        p_operation: operation,
        p_target_id: targetId,
      },
    );
    if (error) {
      if (error.message === "AI request limit exceeded")
        return { ok: false, retryAfterSeconds: 60 };
      return { ok: false };
    }
    const parsed = z.uuid().safeParse(data);
    return parsed.success
      ? { ok: true, invocationId: parsed.data }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function finalizeAiInvocation(
  actorId: string,
  invocationId: string,
  outcome: "success" | "failure",
) {
  try {
    const { data, error } = await createAiAuditClient().rpc(
      "finalize_ai_invocation",
      {
        p_actor_id: actorId,
        p_invocation_id: invocationId,
        p_outcome: outcome,
      },
    );
    return !error && data === true;
  } catch {
    return false;
  }
}
