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

const file = new File(["synthetic PDF"], "synthetic.pdf", {
  type: "application/pdf",
});

function renderActions(props: Parameters<typeof useResumePanelActions>[0]) {
  mocks.cursor = 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useResumePanelActions(props);
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
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

const props = {
  applicationId: null,
  revision: null,
  editable: true,
  profileMode: true,
  resume: null,
};

it("keeps the operation id for an ambiguous profile upload retry", async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error("synthetic network interruption"))
    .mockResolvedValueOnce(response({ resume: null }));
  vi.stubGlobal("fetch", fetch);
  renderActions(props).selectFile(file);
  const operation = renderActions(props).operation;

  await renderActions(props).change("upload");
  await renderActions(props).change("upload");

  expect(fetch.mock.calls[1]?.[1]).toMatchObject({
    body: file,
    headers: expect.objectContaining({
      "x-resume-retry": "true",
      "x-resume-operation": operation,
    }),
  });
});

it("rotates only a server-confirmed retired operation and keeps the selected file", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      response(
        {
          code: "RESUME_UPLOAD_OPERATION_RETIRED",
          error:
            "This upload attempt ended. Press Upload résumé again to retry.",
        },
        409,
      ),
    )
    .mockResolvedValueOnce(response({ resume: null }));
  vi.stubGlobal("fetch", fetch);
  renderActions(props).selectFile(file);
  const originalOperation = renderActions(props).operation;

  await renderActions(props).change("upload");
  const actions = renderActions(props);
  expect(actions.file).toBe(file);
  expect(actions.operation).not.toBe(originalOperation);
  await actions.change("upload");

  expect(fetch.mock.calls[1]?.[1]).toMatchObject({
    body: file,
    headers: expect.objectContaining({
      "x-resume-retry": "true",
      "x-resume-operation": actions.operation,
    }),
  });
});
