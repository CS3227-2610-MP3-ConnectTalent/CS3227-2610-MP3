import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isProfileComplete } from "./profile-readiness";

export type AccountNavigationState =
  | { kind: "guest" }
  | { kind: "unavailable" }
  | { kind: "signed-in"; role: "applicant" | "hr" | null; incomplete?: boolean };

// React cache shares this lookup only within the current server render/request.
// This display state does not replace protected page/action authorization.
export const getAccountNavigation = cache(async (): Promise<AccountNavigationState> => {
  try {
    const client = await createSupabaseServerClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error) return { kind: error.name === "AuthSessionMissingError" ? "guest" : "unavailable" };
    if (!user) return { kind: "guest" };
    if (!user.email_confirmed_at) return { kind: "signed-in", role: null };

    try {
      const { data: profile, error: profileError } = await client.from("profiles")
        .select("role").eq("user_id", user.id).maybeSingle();
      const role = !profileError && (profile?.role === "applicant" || profile?.role === "hr")
        ? profile.role : null;
      if (role === "applicant") {
        const { data, error } = await client.from("applicant_profiles").select("full_name,phone").eq("user_id", user.id).maybeSingle();
        return { kind: "signed-in", role, incomplete: Boolean(error) || !isProfileComplete(data, user.email) };
      }
      return { kind: "signed-in", role };
    } catch {
      return { kind: "signed-in", role: null, incomplete: true };
    }
  } catch {
    return { kind: "unavailable" };
  }
});
