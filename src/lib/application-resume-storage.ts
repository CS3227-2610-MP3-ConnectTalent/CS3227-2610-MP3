import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const applicationResumeBucket = "application-resumes";

// Mutations use this privileged client only after the caller verifies ownership.
export function resumeMutationClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Résumé uploads are temporarily unavailable.");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function cleanupApplicationResume(actor: string, job: string) {
  const client = resumeMutationClient();
  const { data, error } = await client.rpc("claim_resume_cleanup", {
    p_actor: actor,
    p_job: job,
  });
  if (error || !Array.isArray(data)) return;
  await removeClaimedObjects(client, data);
}

async function removeClaimedObjects(
  client: ReturnType<typeof resumeMutationClient>,
  rows: unknown[],
) {
  for (const row of rows) {
    const parsed = z
      .object({
        id: z.uuid(),
        object_path: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/),
      })
      .safeParse(row);
    if (parsed.success)
      await client.storage
        .from(applicationResumeBucket)
        .remove([parsed.data.object_path]);
  }
}
