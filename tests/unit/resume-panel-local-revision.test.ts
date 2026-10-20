import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useState: vi.fn(),
  states: [] as unknown[],
  cursor: 0,
  refresh: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useState: mocks.useState };
});
vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouter,
}));

import { useResumePanelActions } from "@/components/resume-panel-actions";

function renderActions(props: Parameters<typeof useResumePanelActions>[0]) {
  mocks.cursor = 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useResumePanelActions(props);
}

function response(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

function uploadThenProfileFetch(applicationResume: object) {
  return vi
    .fn()
    .mockResolvedValueOnce(
      response({
        resume: applicationResume,
        applicationId: "application-1",
        revision: 2,
      }),
    )
    .mockResolvedValueOnce(response({}));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.states = [];
  mocks.cursor = 0;
  mocks.useRouter.mockReturnValue({ refresh: mocks.refresh });
  mocks.useState.mockImplementation((initial: unknown) => {
    const index = mocks.cursor++;
    if (mocks.states[index] === undefined) mocks.states[index] = initial;
    return [
      mocks.states[index],
      (value: unknown) => {
        mocks.states[index] =
          typeof value === "function"
            ? (value as (current: unknown) => unknown)(mocks.states[index])
            : value;
      },
    ];
  });
});

afterEach(() => vi.unstubAllGlobals());

it("uses the revision returned by a local upload before server props refresh", async () => {
  const profileResume = {
    id: "60000000-0000-4000-8000-000000000b02",
    filename: "profile.pdf",
    byte_size: 2048,
    object_path: "private/profile.pdf",
  };
  const applicationResume = {
    ...profileResume,
    id: "60000000-0000-4000-8000-000000000b01",
    filename: "direct.pdf",
  };
  const props: Parameters<typeof useResumePanelActions>[0] = {
    applicationId: null,
    jobId: "job-1",
    revision: null,
    editable: true,
    resume: null,
    profileResume,
    onChange: vi.fn(),
  };
  const fetch = uploadThenProfileFetch(applicationResume);
  vi.stubGlobal("fetch", fetch);

  renderActions(props).selectFile(
    new File(["synthetic PDF bytes"], "direct.pdf", {
      type: "application/pdf",
    }),
  );
  await renderActions(props).change("upload");
  props.applicationId = "application-1";
  props.revision = 1;
  renderActions(props);
  await renderActions(props).change("profile");

  expect(fetch).toHaveBeenLastCalledWith(
    "/api/jobs/job-1/resume",
    expect.objectContaining({
      headers: expect.objectContaining({
        "x-resume-intent": "profile",
        "x-application-revision": "2",
        "x-profile-resume": profileResume.id,
      }),
    }),
  );
});

it("does not carry a local revision to a different newly adopted application", async () => {
  const profileResume = {
    id: "60000000-0000-4000-8000-000000000b02",
    filename: "profile.pdf",
    byte_size: 2048,
    object_path: "private/profile.pdf",
  };
  const applicationResume = {
    ...profileResume,
    id: "60000000-0000-4000-8000-000000000b01",
    filename: "direct.pdf",
  };
  const props: Parameters<typeof useResumePanelActions>[0] = {
    applicationId: null,
    jobId: "job-1",
    revision: null,
    editable: true,
    resume: null,
    profileResume,
    onChange: vi.fn(),
  };
  const fetch = uploadThenProfileFetch(applicationResume);
  vi.stubGlobal("fetch", fetch);

  renderActions(props).selectFile(
    new File(["synthetic PDF bytes"], "direct.pdf", {
      type: "application/pdf",
    }),
  );
  await renderActions(props).change("upload");
  props.applicationId = "application-2";
  props.revision = 1;
  renderActions(props);
  await renderActions(props).change("profile");

  expect(fetch).toHaveBeenLastCalledWith(
    "/api/jobs/job-1/resume",
    expect.objectContaining({
      headers: expect.objectContaining({
        "x-resume-intent": "profile",
        "x-application-revision": "1",
      }),
    }),
  );
});
