import { expect, it, vi } from "vitest";

import {
  ensureLocalHrAccount,
  LOCAL_HR_EMAIL,
  runLocalHrSeed,
  validateLocalSeedConfig,
} from "../../scripts/seed-local-hr.mjs";

const localEnv = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  TEST_SUPABASE_SERVICE_ROLE_KEY: "local-test-key",
  LOCAL_HR_SEED_PASSWORD: "Local-only-password-123!",
};

function fakeOperations(
  existingUsers: Array<{
    id: string;
    email: string;
    email_confirmed_at: string | null;
    app_metadata?: { local_hr_seed: boolean };
  }> = [],
) {
  const operations = {
    findUsersByEmail: vi.fn(async () => existingUsers),
    createVerifiedUser: vi.fn(async (email: string, password: string) => {
      if (!password) throw new Error("Missing temporary password");
      return {
        id: "new-id",
        email,
        email_confirmed_at: "2026-10-08T00:00:00Z",
        app_metadata: { local_hr_seed: true },
      };
    }),
    getProfile: vi.fn(async () => ({ role: "applicant" })),
    countApplications: vi.fn(async () => 0),
    setRole: vi.fn(async () => undefined),
    setPassword: vi.fn(async () => undefined),
  };
  return operations;
}

it("accepts only the configured loopback Supabase endpoint and required local credentials", () => {
  expect(validateLocalSeedConfig(localEnv).url).toBe("http://127.0.0.1:54321");
  for (const url of [
    "https://example.supabase.co",
    "http://localhost:54322",
    "http://127.0.0.1:54321.evil.example",
  ]) {
    expect(() =>
      validateLocalSeedConfig({ ...localEnv, NEXT_PUBLIC_SUPABASE_URL: url }),
    ).toThrow();
  }
  expect(() =>
    validateLocalSeedConfig({
      ...localEnv,
      TEST_SUPABASE_SERVICE_ROLE_KEY: "",
    }),
  ).toThrow();
  expect(() =>
    validateLocalSeedConfig({ ...localEnv, LOCAL_HR_SEED_PASSWORD: "" }),
  ).toThrow();
});

it("rejects a hosted URL before constructing an admin client", async () => {
  const clientFactory = vi.fn();
  await expect(
    runLocalHrSeed(
      { ...localEnv, NEXT_PUBLIC_SUPABASE_URL: "https://hosted.supabase.co" },
      clientFactory,
    ),
  ).rejects.toThrow(/loopback/i);
  expect(clientFactory).not.toHaveBeenCalled();
});

it("creates one verified local Auth user and promotes its empty Applicant profile", async () => {
  const operations = fakeOperations();
  await expect(
    ensureLocalHrAccount(operations, localEnv.LOCAL_HR_SEED_PASSWORD),
  ).resolves.toEqual({ created: true });
  expect(operations.createVerifiedUser).toHaveBeenCalledWith(
    LOCAL_HR_EMAIL,
    expect.any(String),
  );
  expect(operations.createVerifiedUser.mock.calls[0][1]).not.toBe(
    localEnv.LOCAL_HR_SEED_PASSWORD,
  );
  expect(operations.countApplications).toHaveBeenCalledWith("new-id");
  expect(operations.setRole).toHaveBeenCalledWith("new-id", "hr");
  expect(operations.setPassword).toHaveBeenCalledWith(
    "new-id",
    localEnv.LOCAL_HR_SEED_PASSWORD,
  );
});

it("reruns against the same verified HR account without creating a duplicate", async () => {
  const operations = fakeOperations([
    {
      id: "existing-id",
      email: LOCAL_HR_EMAIL,
      email_confirmed_at: "2026-10-08T00:00:00Z",
      app_metadata: { local_hr_seed: true },
    },
  ]);
  operations.getProfile.mockResolvedValue({ role: "hr" });
  await expect(
    ensureLocalHrAccount(operations, localEnv.LOCAL_HR_SEED_PASSWORD),
  ).resolves.toEqual({ created: false });
  expect(operations.createVerifiedUser).not.toHaveBeenCalled();
  expect(operations.setRole).not.toHaveBeenCalled();
  expect(operations.setPassword).toHaveBeenCalledWith(
    "existing-id",
    localEnv.LOCAL_HR_SEED_PASSWORD,
  );
});

it("refuses to promote an account with an Applicant application", async () => {
  const operations = fakeOperations();
  operations.countApplications.mockResolvedValue(1);
  await expect(
    ensureLocalHrAccount(operations, localEnv.LOCAL_HR_SEED_PASSWORD),
  ).rejects.toThrow(/applications/i);
  expect(operations.setRole).not.toHaveBeenCalled();
  expect(operations.setPassword).not.toHaveBeenCalled();
});

it("refuses to reset or promote an existing account without the local seed marker", async () => {
  const operations = fakeOperations([
    {
      id: "manual-id",
      email: LOCAL_HR_EMAIL,
      email_confirmed_at: "2026-10-08T00:00:00Z",
    },
  ]);
  await expect(
    ensureLocalHrAccount(operations, localEnv.LOCAL_HR_SEED_PASSWORD),
  ).rejects.toThrow(/unrelated account/i);
  expect(operations.setRole).not.toHaveBeenCalled();
  expect(operations.setPassword).not.toHaveBeenCalled();
});

it("refuses to re-promote a previously created account that is now an Applicant", async () => {
  const operations = fakeOperations([
    {
      id: "existing-id",
      email: LOCAL_HR_EMAIL,
      email_confirmed_at: "2026-10-08T00:00:00Z",
      app_metadata: { local_hr_seed: true },
    },
  ]);
  await expect(
    ensureLocalHrAccount(operations, localEnv.LOCAL_HR_SEED_PASSWORD),
  ).rejects.toThrow(/incomplete|Applicant/i);
  expect(operations.setRole).not.toHaveBeenCalled();
  expect(operations.setPassword).not.toHaveBeenCalled();
});
