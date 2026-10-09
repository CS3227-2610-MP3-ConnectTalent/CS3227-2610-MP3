import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.createClient }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
import { signOut } from "@/app/auth/actions";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createClient.mockResolvedValue({ auth: { signOut: mocks.signOut } });
});

describe("sign out", () => {
  it("returns to careers after successful provider logout", async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    await expect(signOut()).rejects.toThrow("REDIRECT:/");
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
  it("reports generic retry feedback on a returned provider error", async () => {
    mocks.signOut.mockResolvedValue({ error: { message: "private error" } });
    await expect(signOut()).rejects.toThrow("REDIRECT:/?authError=sign-out");
  });
  it("reports generic retry feedback on a transport error", async () => {
    mocks.signOut.mockRejectedValue(new Error("private details"));
    await expect(signOut()).rejects.toThrow("REDIRECT:/?authError=sign-out");
  });
  it("reports generic retry feedback when client setup fails", async () => {
    mocks.createClient.mockRejectedValue(new Error("private details"));
    await expect(signOut()).rejects.toThrow("REDIRECT:/?authError=sign-out");
  });
});
