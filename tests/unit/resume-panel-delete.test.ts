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

const attachment = {
  id: "60000000-0000-4000-8000-000000000b01",
  filename: "synthetic.pdf",
  byte_size: 2048,
  object_path: "private/synthetic.pdf",
};

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function renderActions(props: Parameters<typeof useResumePanelActions>[0]) {
  mocks.cursor = 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useResumePanelActions(props);
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

it("asks before deleting an attached résumé", async () => {
  const confirm = vi.fn<() => boolean>(() => false);
  const fetch = vi.fn().mockResolvedValue(response({ resume: null }));
  vi.stubGlobal("confirm", confirm);
  vi.stubGlobal("fetch", fetch);
  const props = {
    applicationId: "app-1",
    revision: 3,
    editable: true,
    resume: attachment,
  };

  await renderActions(props).deleteResume();
  expect(confirm).toHaveBeenCalledWith(
    "Delete your résumé? You can upload it again later.",
  );
  expect(fetch).not.toHaveBeenCalled();

  confirm.mockReturnValue(true);
  await renderActions(props).deleteResume();
  expect(fetch).toHaveBeenCalledWith(
    "/api/applications/app-1/resume",
    expect.objectContaining({
      headers: expect.objectContaining({ "x-resume-intent": "remove" }),
    }),
  );
});

it("rotates the operation after delete and keeps the selected file uploadable", async () => {
  const file = new File(["synthetic PDF"], "synthetic.pdf", {
    type: "application/pdf",
  });
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response({ resume: null }))
    .mockResolvedValueOnce(response({ resume: null }));
  vi.stubGlobal("fetch", fetch);
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true),
  );
  const props = {
    applicationId: "app-1",
    revision: 3,
    editable: true,
    resume: attachment,
  };

  renderActions(props).selectFile(file);
  const originalOperation = renderActions(props).operation;
  await renderActions(props).deleteResume();
  const retryActions = renderActions(props);

  expect(retryActions.file).toBe(file);
  expect(retryActions.operation).not.toBe(originalOperation);
  await retryActions.change("upload");

  expect(fetch.mock.calls[0]?.[1]?.headers?.["x-resume-intent"]).toBe("remove");
  expect(fetch.mock.calls[1]?.[1]?.headers).toMatchObject({
    "x-resume-intent": "upload",
    "x-resume-retry": "false",
  });
  expect(fetch.mock.calls[1]?.[1]?.headers?.["x-resume-operation"]).toBe(
    retryActions.operation,
  );
  expect(fetch.mock.calls[1]?.[1]?.body).toBe(file);
});
