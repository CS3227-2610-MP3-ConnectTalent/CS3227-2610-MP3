import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

import {
  finalizeAiInvocation,
  reserveAiInvocation,
} from "@/lib/ai/quota-audit";

const actorId = "50000000-0000-4000-8000-000000000b01";
const targetId = "50000000-0000-4000-8000-000000000b02";
const invocationId = "50000000-0000-4000-8000-000000000b03";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_SECRET_KEY", " synthetic-secret ");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "fallback-secret");
  mocks.createClient.mockReturnValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: invocationId, error: null });
});

it("uses the trimmed secret key and returns a validated quota reservation", async () => {
  expect(
    await reserveAiInvocation(actorId, "applicant_draft", targetId),
  ).toEqual({
    ok: true,
    invocationId,
  });
  expect(mocks.createClient).toHaveBeenCalledWith(
    "http://127.0.0.1:54321",
    "synthetic-secret",
    expect.objectContaining({
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }),
  );
  expect(mocks.rpc).toHaveBeenCalledWith("reserve_ai_invocation", {
    p_actor_id: actorId,
    p_operation: "applicant_draft",
    p_target_id: targetId,
  });
});

it("supports the fallback service key and maps quota or invalid reservation results safely", async () => {
  vi.stubEnv("SUPABASE_SECRET_KEY", "  ");
  mocks.rpc.mockResolvedValueOnce({
    data: null,
    error: { message: "AI request limit exceeded" },
  });
  expect(await reserveAiInvocation(actorId, "hr_summary", targetId)).toEqual({
    ok: false,
    retryAfterSeconds: 60,
  });
  expect(mocks.createClient).toHaveBeenCalledWith(
    "http://127.0.0.1:54321",
    "fallback-secret",
    expect.anything(),
  );

  mocks.rpc.mockResolvedValueOnce({ data: "invalid", error: null });
  expect(await reserveAiInvocation(actorId, "hr_summary", targetId)).toEqual({
    ok: false,
  });
  mocks.rpc.mockResolvedValueOnce({
    data: invocationId,
    error: { message: "db" },
  });
  expect(await reserveAiInvocation(actorId, "hr_summary", targetId)).toEqual({
    ok: false,
  });
});

it("fails closed when configuration or the reservation transport is unavailable", async () => {
  vi.stubEnv("SUPABASE_SECRET_KEY", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", " ");
  expect(
    await reserveAiInvocation(actorId, "applicant_draft", targetId),
  ).toEqual({
    ok: false,
  });
  vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-secret");
  mocks.rpc.mockRejectedValueOnce(new Error("private transport diagnostic"));
  expect(
    await reserveAiInvocation(actorId, "applicant_draft", targetId),
  ).toEqual({
    ok: false,
  });
});

it("returns only confirmed finalization and fails closed for errors or throws", async () => {
  mocks.rpc.mockResolvedValueOnce({ data: true, error: null });
  expect(await finalizeAiInvocation(actorId, invocationId, "success")).toBe(
    true,
  );
  expect(mocks.rpc).toHaveBeenCalledWith("finalize_ai_invocation", {
    p_actor_id: actorId,
    p_invocation_id: invocationId,
    p_outcome: "success",
  });
  mocks.rpc.mockResolvedValueOnce({ data: false, error: null });
  expect(await finalizeAiInvocation(actorId, invocationId, "failure")).toBe(
    false,
  );
  mocks.rpc.mockResolvedValueOnce({ data: true, error: { message: "db" } });
  expect(await finalizeAiInvocation(actorId, invocationId, "failure")).toBe(
    false,
  );
  mocks.rpc.mockRejectedValueOnce(new Error("private transport diagnostic"));
  expect(await finalizeAiInvocation(actorId, invocationId, "failure")).toBe(
    false,
  );
  vi.stubEnv("SUPABASE_SECRET_KEY", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  expect(await finalizeAiInvocation(actorId, invocationId, "success")).toBe(
    false,
  );
});
