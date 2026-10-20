import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  getUser: vi.fn(),
  download: vi.fn(),
  storageFrom: vi.fn(),
  resumeMutationClient: vi.fn(),
  cleanupApplicationResume: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("@/lib/application-resume-storage", () => ({
  applicationResumeBucket: "application-resumes",
  cleanupApplicationResume: mocks.cleanupApplicationResume,
  resumeMutationClient: mocks.resumeMutationClient,
}));

import {
  cancelResumeUpload,
  downloadApplicationResume,
  getApplicationResume,
  removeApplicationResume,
} from "@/lib/application-resumes";

const applicationId = "a0000000-0000-4000-8000-000000000b01";
const metadata = {
  id: "a0000000-0000-4000-8000-000000000b02",
  filename: "synthetic.pdf",
  byte_size: 1024,
  object_path: "private/synthetic.pdf",
};
const confirmedUser = {
  id: "a0000000-0000-4000-8000-000000000b03",
  email_confirmed_at: "2026-01-01T00:00:00Z",
};

function configureClient() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: mocks.maybeSingle,
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
  mocks.storageFrom.mockReturnValue({ download: mocks.download });
  mocks.getUser.mockResolvedValue({
    data: { user: confirmedUser },
    error: null,
  });
  const client = {
    from: mocks.from,
    auth: { getUser: mocks.getUser },
    storage: { from: mocks.storageFrom },
  };
  mocks.createSupabaseServerClient.mockResolvedValue(client);
  mocks.resumeMutationClient.mockReturnValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ error: null });
  mocks.cleanupApplicationResume.mockResolvedValue(undefined);
  return query;
}

beforeEach(() => {
  vi.clearAllMocks();
  configureClient();
});

it("returns no metadata for an absent résumé and validates stored metadata", async () => {
  mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  expect(await getApplicationResume(applicationId)).toBeNull();
  expect(mocks.from).toHaveBeenCalledWith("application_resume_objects");

  mocks.maybeSingle.mockResolvedValueOnce({ data: metadata, error: null });
  expect(await getApplicationResume(applicationId)).toEqual(metadata);
  mocks.maybeSingle.mockResolvedValueOnce({
    data: { ...metadata, byte_size: 0 },
    error: null,
  });
  await expect(getApplicationResume(applicationId)).rejects.toThrow();
  mocks.maybeSingle.mockResolvedValueOnce({
    data: null,
    error: { message: "db" },
  });
  await expect(getApplicationResume(applicationId)).rejects.toThrow(
    "Résumé information is temporarily unavailable.",
  );
});

it("downloads only for a confirmed user with available résumé metadata and bytes", async () => {
  mocks.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
  expect(await downloadApplicationResume(applicationId)).toBeNull();
  expect(mocks.from).not.toHaveBeenCalled();

  mocks.getUser.mockResolvedValueOnce({
    data: { user: confirmedUser },
    error: { message: "auth" },
  });
  expect(await downloadApplicationResume(applicationId)).toBeNull();
  expect(mocks.from).not.toHaveBeenCalled();

  mocks.getUser.mockResolvedValueOnce({
    data: { user: { id: confirmedUser.id, email_confirmed_at: null } },
    error: null,
  });
  expect(await downloadApplicationResume(applicationId)).toBeNull();
  expect(mocks.from).not.toHaveBeenCalled();

  mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  expect(await downloadApplicationResume(applicationId)).toBeNull();
  expect(mocks.storageFrom).not.toHaveBeenCalled();

  mocks.maybeSingle.mockResolvedValueOnce({ data: metadata, error: null });
  mocks.download.mockResolvedValueOnce({ data: null, error: null });
  expect(await downloadApplicationResume(applicationId)).toBeNull();

  mocks.maybeSingle.mockResolvedValueOnce({ data: metadata, error: null });
  const bytes = new Blob(["synthetic private PDF"]);
  mocks.download.mockResolvedValueOnce({ data: bytes, error: null });
  expect(await downloadApplicationResume(applicationId)).toEqual({
    info: metadata,
    bytes,
  });
  expect(mocks.storageFrom).toHaveBeenCalledWith("application-resumes");
  expect(mocks.download).toHaveBeenLastCalledWith(metadata.object_path);
});

it("sanitizes failed removal and cancellation while cleaning up successful operations", async () => {
  mocks.rpc.mockResolvedValueOnce({
    error: { message: "private database detail" },
  });
  await expect(
    removeApplicationResume(confirmedUser.id, "job-1", 2),
  ).rejects.toThrow("We could not remove the résumé.");
  expect(mocks.cleanupApplicationResume).not.toHaveBeenCalled();

  await removeApplicationResume(confirmedUser.id, "job-1", 3);
  expect(mocks.rpc).toHaveBeenLastCalledWith("remove_application_resume", {
    p_application: null,
    p_actor: confirmedUser.id,
    p_job: "job-1",
    p_revision: 3,
  });
  expect(mocks.cleanupApplicationResume).toHaveBeenCalledWith(
    confirmedUser.id,
    "job-1",
    null,
  );

  mocks.rpc.mockResolvedValueOnce({
    error: { message: "private cancellation detail" },
  });
  await expect(cancelResumeUpload(confirmedUser.id, "job-2")).rejects.toThrow(
    "We could not cancel the upload.",
  );
  await cancelResumeUpload(confirmedUser.id, "job-2");
  expect(mocks.rpc).toHaveBeenLastCalledWith("cancel_application_resume", {
    p_application: null,
    p_actor: confirmedUser.id,
    p_job: "job-2",
  });
  expect(mocks.cleanupApplicationResume).toHaveBeenLastCalledWith(
    confirmedUser.id,
    "job-2",
    null,
  );
});
