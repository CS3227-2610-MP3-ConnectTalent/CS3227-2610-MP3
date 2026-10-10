import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
const terminal = z.object({ id: z.uuid(), submission_state: z.literal("submitted"), withdrawn_by: z.uuid(), withdrawn_at: z.iso.datetime({ offset: true }) });
export async function performWithdrawal(client: SupabaseClient, actor: string, id: string): Promise<boolean> {
  try {
    const { data, error } = await client.rpc("withdraw_application", { p_application_id: id });
    if (!error && data === id) return true;
  } catch { /* A transport failure can occur after the transaction commits. */ }
  try {
    const { data, error } = await client.from("applications").select("id,submission_state,withdrawn_at,withdrawn_by")
      .eq("id", id).eq("applicant_id", actor).maybeSingle();
    const result = error ? null : terminal.safeParse(data);
    return Boolean(result?.success && result.data.id === id && result.data.withdrawn_by === actor);
  } catch { return false; }
}
