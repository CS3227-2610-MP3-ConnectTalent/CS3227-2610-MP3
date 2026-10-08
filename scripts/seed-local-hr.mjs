import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

export const LOCAL_HR_EMAIL = "local-hr@example.test";
const LOCAL_URLS = new Set(["http://127.0.0.1:54321", "http://localhost:54321"]);

export function validateLocalSeedConfig(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!LOCAL_URLS.has(url)) {
    throw new Error("Local HR seed requires the Supabase loopback URL on port 54321.");
  }
  const key = env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (typeof key !== "string" || key.trim() === "") {
    throw new Error("Local Supabase admin key is required.");
  }
  const password = env.LOCAL_HR_SEED_PASSWORD;
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    throw new Error("Local HR seed password must contain 8–72 characters.");
  }
  return { url, key, password };
}

export async function ensureLocalHrAccount(operations, password) {
  const users = await operations.findUsersByEmail(LOCAL_HR_EMAIL);
  if (users.length > 1) throw new Error("Multiple local HR seed accounts found; manual cleanup required.");

  const created = users.length === 0;
  // A new Applicant cannot sign in while its role is being assigned.
  const user = created
    ? await operations.createVerifiedUser(LOCAL_HR_EMAIL, randomBytes(32).toString("base64url"))
    : users[0];
  if (user.email?.toLowerCase() !== LOCAL_HR_EMAIL || user.app_metadata?.local_hr_seed !== true) {
    throw new Error("The local HR address belongs to an unrelated account; manual cleanup required.");
  }
  if (!user.email_confirmed_at) throw new Error("Local HR seed account is not email verified.");

  const profile = await operations.getProfile(user.id);
  if (!profile || !["applicant", "hr"].includes(profile.role)) {
    throw new Error("Local HR seed profile is missing or invalid.");
  }
  if (!created && profile.role !== "hr") {
    throw new Error("Existing local HR seed account has an incomplete Applicant profile; manual cleanup required.");
  }
  const applicationCount = await operations.countApplications(user.id);
  if (applicationCount !== 0) {
    throw new Error("Local HR seed account has Applicant applications; HR assignment refused.");
  }

  if (created) await operations.setRole(user.id, "hr");
  await operations.setPassword(user.id, password);
  return { created };
}

export function makeLocalAdminOperations(client) {
  return {
    async findUsersByEmail(email) {
      const matches = [];
      for (let page = 1; page <= 100; page += 1) {
        const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
        if (error || !Array.isArray(data?.users)) throw new Error("Could not inspect local Auth users.");
        matches.push(...data.users.filter((user) => user.email?.toLowerCase() === email));
        if (data.users.length < 1000) return matches;
      }
      throw new Error("Local Auth user list exceeded the supported page limit.");
    },
    async createVerifiedUser(email, password) {
      const { data, error } = await client.auth.admin.createUser({
        email, password, email_confirm: true, app_metadata: { local_hr_seed: true },
      });
      if (error || !data?.user) throw new Error("Could not create local HR Auth user.");
      return data.user;
    },
    async getProfile(id) {
      const { data, error } = await client.from("profiles").select("role").eq("user_id", id).maybeSingle();
      if (error) throw new Error("Could not inspect local HR profile.");
      return data;
    },
    async countApplications(id) {
      const { count, error } = await client.from("applications")
        .select("id", { count: "exact", head: true }).eq("applicant_id", id);
      if (error || count === null) throw new Error("Could not check local Applicant applications.");
      return count;
    },
    async setPassword(id, password) {
      const { error } = await client.auth.admin.updateUserById(id, { password });
      if (error) throw new Error("Could not reconcile local HR password.");
    },
    async setRole(id, role) {
      const { data, error } = await client.from("profiles").update({ role })
        .eq("user_id", id).eq("role", "applicant").select("user_id").maybeSingle();
      if (error || !data) throw new Error("Could not assign local HR role.");
    },
  };
}

export async function runLocalHrSeed(env = process.env, clientFactory = createClient) {
  const { url, key, password } = validateLocalSeedConfig(env);
  const client = clientFactory(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return ensureLocalHrAccount(makeLocalAdminOperations(client), password);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await runLocalHrSeed();
    console.log(`Local HR account ready: ${LOCAL_HR_EMAIL} (${result.created ? "created" : "reused"}).`);
  } catch (error) {
    console.error(`Local HR seed failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  }
}
