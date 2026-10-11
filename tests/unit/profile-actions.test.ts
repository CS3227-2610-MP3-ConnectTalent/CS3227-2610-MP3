import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApplicant: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/auth", () => ({ requireApplicant: mocks.requireApplicant }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { saveProfile } from "@/app/profile/actions";

const userId = "30000000-0000-4000-8000-000000000b01";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    full_name: "Synthetic Applicant",
    phone: "+6591234567",
    portfolio_url: "",
    education: "",
    work_experience: "",
    ...overrides,
  }))
    data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: mocks.maybeSingle,
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  mocks.maybeSingle.mockResolvedValue({
    data: { full_name: "Synthetic Applicant", phone: "+6591234567" },
    error: null,
  });
  mocks.rpc.mockResolvedValue({ error: null });
  mocks.requireApplicant.mockResolvedValue({
    client: { from: vi.fn(() => query), rpc: mocks.rpc },
    user: { id: userId, email: "applicant@example.test" },
  });
});

it("returns field errors and retains submitted values without writing invalid data", async () => {
  const result = await saveProfile(
    { values: {}, errors: {} },
    form({ full_name: "", phone: "invalid" }),
  );
  expect(result.values.full_name).toBe("");
  expect(result.errors).toHaveProperty("full_name");
  expect(result.errors).toHaveProperty("phone");
  expect(result.message).toContain("has not been saved");
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it("returns a generic error for an RPC rejection result or thrown transport error", async () => {
  mocks.rpc.mockResolvedValueOnce({ error: { message: "private diagnostic" } });
  const rejected = await saveProfile({ values: {}, errors: {} }, form());
  expect(rejected.message).toContain("could not save");
  expect(rejected.message).not.toContain("private diagnostic");

  mocks.rpc.mockRejectedValueOnce(new Error("private network detail"));
  const thrown = await saveProfile({ values: {}, errors: {} }, form());
  expect(thrown.message).toContain("could not save");
  expect(thrown.message).not.toContain("private network detail");
  expect(mocks.revalidatePath).not.toHaveBeenCalled();
});

it("revalidates profile surfaces and redirects incomplete profiles to finish setup", async () => {
  mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  await expect(saveProfile({ values: {}, errors: {} }, form())).rejects.toThrow(
    "REDIRECT:/",
  );
  expect(mocks.rpc).toHaveBeenCalledWith(
    "save_applicant_profile",
    expect.objectContaining({
      p_full_name: "Synthetic Applicant",
      p_phone: "+6591234567",
      p_portfolio_url: null,
    }),
  );
  expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/profile");
  expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/", "layout");
});

it("returns success for a complete profile without trusting phone text when country fields are present", async () => {
  const values = form();
  values.delete("phone");
  values.set("phone_country", "SG");
  values.set("phone_national", "91234567");
  const result = await saveProfile({ values: {}, errors: {} }, values);
  expect(result.message).toBe("Profile saved.");
  expect(mocks.rpc).toHaveBeenCalledWith(
    "save_applicant_profile",
    expect.objectContaining({ p_phone: "+6591234567" }),
  );
  expect(mocks.redirect).not.toHaveBeenCalled();
});
