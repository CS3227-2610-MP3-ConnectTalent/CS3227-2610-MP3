import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

import {
  getApplicantContext,
  getHrContext,
  getPublishedJob,
  getSubmittedApplication,
} from "@/lib/ai/application-data";

const user = {
  id: "40000000-0000-4000-8000-000000000b01",
  email: "applicant@example.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
};
const jobId = "40000000-0000-4000-8000-000000000b02";
const applicationId = "40000000-0000-4000-8000-000000000b03";

function contextClient(
  authUser: typeof user | null = user,
  authError: unknown = null,
) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: mocks.maybeSingle,
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authUser },
        error: authError,
      }),
    },
    from: mocks.from,
    rpc: mocks.rpc,
  };
  mocks.createSupabaseServerClient.mockResolvedValue(client);
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rpc.mockResolvedValue({
    data: "TypeScript experience and reliable testing.",
    error: null,
  });
});

it("distinguishes anonymous, unconfirmed, and wrong-role users before protected reads", async () => {
  contextClient(null);
  expect(await getApplicantContext()).toEqual({ status: "anonymous" });
  expect(mocks.from).not.toHaveBeenCalled();

  contextClient(user, { message: "session unavailable" });
  expect(await getHrContext()).toEqual({ status: "anonymous" });

  contextClient({ ...user, email_confirmed_at: "" });
  expect(await getApplicantContext()).toEqual({ status: "forbidden" });
  expect(mocks.from).not.toHaveBeenCalled();

  contextClient();
  mocks.maybeSingle.mockResolvedValueOnce({
    data: { role: "hr" },
    error: null,
  });
  expect(await getApplicantContext()).toEqual({ status: "forbidden" });
  expect(mocks.maybeSingle).toHaveBeenCalledTimes(1);
});

it("fails closed when role data is unavailable and checks Applicant profile readiness", async () => {
  contextClient();
  mocks.maybeSingle.mockResolvedValueOnce({
    data: null,
    error: { message: "unavailable" },
  });
  await expect(getHrContext()).rejects.toThrow(
    "AI authorization data is unavailable.",
  );

  contextClient();
  mocks.maybeSingle
    .mockResolvedValueOnce({ data: { role: "applicant" }, error: null })
    .mockResolvedValueOnce({ data: null, error: null });
  expect(await getApplicantContext()).toEqual({ status: "forbidden" });

  contextClient();
  mocks.maybeSingle
    .mockResolvedValueOnce({ data: { role: "applicant" }, error: null })
    .mockResolvedValueOnce({
      data: { full_name: "Synthetic Applicant", phone: "+6591234567" },
      error: null,
    });
  const authorized = await getApplicantContext();
  expect(authorized).toMatchObject({
    status: "authorized",
    user: { id: user.id },
  });

  contextClient();
  mocks.maybeSingle
    .mockResolvedValueOnce({ data: { role: "applicant" }, error: null })
    .mockResolvedValueOnce({
      data: { full_name: "Synthetic Applicant", phone: "+6591234567" },
      error: { message: "profile unavailable" },
    });
  expect(await getApplicantContext()).toEqual({ status: "forbidden" });
});

it("authorizes an HR user from confirmed role data without reading Applicant fields", async () => {
  const client = contextClient();
  mocks.maybeSingle.mockResolvedValueOnce({
    data: { role: "hr" },
    error: null,
  });
  expect(await getHrContext()).toMatchObject({
    status: "authorized",
    client,
    user: { id: user.id },
  });
  expect(mocks.from).toHaveBeenCalledTimes(1);
});

it("loads only published jobs and validates the returned database shape", async () => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  const client = { from: vi.fn(() => query) };
  query.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  expect(await getPublishedJob(client as never, jobId)).toBeNull();
  expect(query.eq).toHaveBeenNthCalledWith(1, "id", jobId);
  expect(query.eq).toHaveBeenNthCalledWith(2, "status", "published");

  query.maybeSingle.mockResolvedValueOnce({
    data: { id: jobId, title: "  Engineer  ", requirements: "Testing" },
    error: null,
  });
  expect(await getPublishedJob(client as never, jobId)).toMatchObject({
    title: "Engineer",
    requirements: "Testing",
  });

  query.maybeSingle.mockResolvedValueOnce({
    data: {
      id: jobId,
      title: "Engineer",
      requirements: "Testing",
      private: true,
    },
    error: null,
  });
  await expect(getPublishedJob(client as never, jobId)).rejects.toThrow();
  query.maybeSingle.mockResolvedValueOnce({
    data: null,
    error: { message: "db" },
  });
  await expect(getPublishedJob(client as never, jobId)).rejects.toThrow(
    "Selected job is unavailable.",
  );
});

function applicationClient() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    maybeSingle: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.is.mockReturnValue(query);
  const client = {
    from: vi.fn(() => query),
    rpc: mocks.rpc,
  };
  return { client, query };
}

it("returns null when no submitted active application exists", async () => {
  const { client, query } = applicationClient();
  query.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  expect(
    await getSubmittedApplication(client as never, applicationId),
  ).toBeNull();
});

it("returns validated fields for a submitted active application", async () => {
  const { client, query } = applicationClient();
  query.maybeSingle.mockResolvedValueOnce({
    data: {
      id: applicationId,
      job_id: jobId,
      cover_letter: "Synthetic submitted letter",
    },
    error: null,
  });
  expect(
    await getSubmittedApplication(client as never, applicationId),
  ).toMatchObject({
    coverLetter: "Synthetic submitted letter",
    requirements: "TypeScript experience and reliable testing.",
  });
  expect(query.eq).toHaveBeenCalledWith("submission_state", "submitted");
  expect(query.is).toHaveBeenCalledWith("withdrawn_at", null);
});

it("rejects application query errors and unexpected database fields", async () => {
  const { client, query } = applicationClient();
  query.maybeSingle.mockResolvedValueOnce({
    data: null,
    error: { message: "db" },
  });
  await expect(
    getSubmittedApplication(client as never, applicationId),
  ).rejects.toThrow("Selected application is unavailable.");

  query.maybeSingle.mockResolvedValueOnce({
    data: {
      id: applicationId,
      job_id: jobId,
      cover_letter: "Letter",
      extra: true,
    },
    error: null,
  });
  await expect(
    getSubmittedApplication(client as never, applicationId),
  ).rejects.toThrow();
});

it("rejects unavailable or malformed frozen job requirements", async () => {
  const { client, query } = applicationClient();
  query.maybeSingle.mockResolvedValueOnce({
    data: { id: applicationId, job_id: jobId, cover_letter: "Letter" },
    error: null,
  });
  mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "rpc" } });
  await expect(
    getSubmittedApplication(client as never, applicationId),
  ).rejects.toThrow("Selected application requirements are unavailable.");
  mocks.rpc.mockResolvedValueOnce({ data: "  ", error: null });
  await expect(
    getSubmittedApplication(client as never, applicationId),
  ).rejects.toThrow();
});
