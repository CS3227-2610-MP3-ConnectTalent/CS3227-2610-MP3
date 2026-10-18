import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cursor: 0,
  states: [] as unknown[],
  refresh: vi.fn(),
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) => {
      const index = mocks.cursor++;
      if (mocks.states[index] === undefined) mocks.states[index] = initial;
      return [
        mocks.states[index],
        (value: unknown) => {
          mocks.states[index] = value;
        },
      ];
    },
  };
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import { useResumePanelActions } from "@/components/resume-panel-actions";

const attachment = {
  id: "60000000-0000-4000-8000-000000000b01",
  filename: "synthetic.pdf",
  byte_size: 2048,
  object_path: "private/synthetic.pdf",
};
const props = {
  applicationId: "app-1",
  revision: 1,
  editable: true,
  resume: attachment,
};
function actions() {
  mocks.cursor = 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useResumePanelActions(props);
}

beforeEach(() => {
  mocks.cursor = 0;
  mocks.states = [];
  mocks.refresh.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

it("identifies the active upload until its request settles", async () => {
  let resolve!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    ),
  );
  actions().selectFile(
    new File(["synthetic"], "synthetic.pdf", { type: "application/pdf" }),
  );
  const request = actions().change("upload");
  expect(actions()).toMatchObject({ pending: true, activeIntent: "upload" });
  resolve(new Response(JSON.stringify({ resume: attachment })));
  await request;
  expect(actions()).toMatchObject({ pending: false, activeIntent: null });
});

it("clears the active remove intent after a network failure", async () => {
  let reject!: (reason: Error) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((_, fail) => {
          reject = fail;
        }),
    ),
  );
  const request = actions().change("remove");
  expect(actions()).toMatchObject({ pending: true, activeIntent: "remove" });
  reject(new Error("synthetic failure"));
  await request;
  expect(actions()).toMatchObject({ pending: false, activeIntent: null });
});
