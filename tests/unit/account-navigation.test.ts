import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), getUser: vi.fn(), profile: vi.fn(), from: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.createClient }));
import { getAccountNavigation } from "@/lib/account-navigation";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.eq.mockReturnValue({ maybeSingle: mocks.profile });
  mocks.from.mockReturnValue({ select: () => ({ eq: mocks.eq }) });
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
});

function user(confirmed = true) {
  return { id: "synthetic-user", email_confirmed_at: confirmed ? "2026-10-09" : null, user_metadata: { role: "hr" } };
}

describe("server-derived account navigation", () => {
  it("has guest navigation without a session and does not query profiles", async () => {
    expect(await getAccountNavigation()).toEqual({ kind: "guest" });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("treats a missing-session error as a guest", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { name: "AuthSessionMissingError" } });
    expect(await getAccountNavigation()).toEqual({ kind: "guest" });
  });
  it.each(["applicant", "hr"] as const)("uses the current database %s role", async (role) => {
    mocks.getUser.mockResolvedValue({ data: { user: user() }, error: null });
    mocks.profile.mockResolvedValue({ data: { role }, error: null });
    expect(await getAccountNavigation()).toEqual({ kind: "signed-in", role, ...(role === "applicant" ? { incomplete: true } : {}) });
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "synthetic-user");
  });
  it("gives an unverified account only generic signed-in navigation", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: user(false) }, error: null });
    expect(await getAccountNavigation()).toEqual({ kind: "signed-in", role: null });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([null, { role: "administrator" }])("does not trust metadata when the profile is absent or unsupported", async (data) => {
    mocks.getUser.mockResolvedValue({ data: { user: user() }, error: null });
    mocks.profile.mockResolvedValue({ data, error: null });
    expect(await getAccountNavigation()).toEqual({ kind: "signed-in", role: null });
  });
  it("withholds dashboards when the profile lookup fails", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: user() }, error: null });
    mocks.profile.mockResolvedValue({ data: { role: "hr" }, error: { message: "private error" } });
    expect(await getAccountNavigation()).toEqual({ kind: "signed-in", role: null });
  });
  it("retains only generic account navigation on a thrown profile failure", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: user() }, error: null });
    mocks.profile.mockRejectedValue(new Error("private details"));
    expect(await getAccountNavigation()).toEqual({ kind: "signed-in", role: null, incomplete: true });
  });
  it.each(["provider", "transport", "config"])("fails closed on %s identity failure", async (failure) => {
    if (failure === "provider") mocks.getUser.mockResolvedValue({ data: { user: user() }, error: { message: "private error" } });
    if (failure === "transport") mocks.getUser.mockRejectedValue(new Error("private details"));
    if (failure === "config") mocks.createClient.mockRejectedValue(new Error("missing config"));
    expect(await getAccountNavigation()).toEqual({ kind: "unavailable" });
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
