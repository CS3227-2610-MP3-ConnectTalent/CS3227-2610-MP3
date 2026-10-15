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
vi.mock("next/navigation", () => ({ useRouter: mocks.useRouter }));

import { useResumePanelActions } from "@/components/resume-panel-actions";

const source = {
  id: "60000000-0000-4000-8000-000000000b02",
  filename: "selected.pdf",
  byte_size: 2048,
  object_path: "private/selected.pdf",
};

function renderActions(props: Parameters<typeof useResumePanelActions>[0]) {
  mocks.cursor = 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useResumePanelActions(props);
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

const initialProps = {
  applicationId: null,
  jobId: "job-1",
  revision: 3,
  editable: true,
  resume: null,
  profileResume: source,
};

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

it("retries the same selected source, operation, and revision after refresh", async () => {
  const replaced = { ...source, id: "60000000-0000-4000-8000-000000000b03" };
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      response(
        {
          code: "RESUME_UPLOAD_PENDING",
          error: "A previous résumé change is still pending.",
        },
        409,
      ),
    )
    .mockResolvedValueOnce(response({}));
  vi.stubGlobal("fetch", fetch);

  await renderActions(initialProps).change("profile");
  const firstHeaders = fetch.mock.calls[0]?.[1]?.headers;
  expect(renderActions(initialProps).profileCopyRetryAvailable).toBe(true);

  const refreshedActions = renderActions({
    ...initialProps,
    revision: 4,
    profileResume: replaced,
  });
  await refreshedActions.change("profile", true);

  expect(fetch.mock.calls[1]?.[1]?.headers).toMatchObject({
    "x-resume-retry": "true",
    "x-resume-operation": firstHeaders?.["x-resume-operation"],
    "x-application-revision": "3",
    "x-profile-resume": source.id,
  });
});

it("keeps retry available with the original source after an ambiguous response", async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error("synthetic network interruption"))
    .mockResolvedValueOnce(response({}));
  vi.stubGlobal("fetch", fetch);

  await renderActions(initialProps).change("profile");
  const firstHeaders = fetch.mock.calls[0]?.[1]?.headers;
  const refreshedProps = { ...initialProps, revision: 4, profileResume: null };
  expect(renderActions(refreshedProps).profileCopyRetryAvailable).toBe(true);
  await renderActions(refreshedProps).change("profile", true);

  expect(fetch.mock.calls[1]?.[1]?.headers).toMatchObject({
    "x-resume-retry": "true",
    "x-resume-operation": firstHeaders?.["x-resume-operation"],
    "x-application-revision": "3",
    "x-profile-resume": source.id,
  });
});
