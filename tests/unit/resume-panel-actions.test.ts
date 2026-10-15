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

const attachment = {
  id: "60000000-0000-4000-8000-000000000b01",
  filename: "synthetic.pdf",
  byte_size: 2048,
  object_path: "private/synthetic.pdf",
};

function renderActions(props: Parameters<typeof useResumePanelActions>[0]) {
  // The hook test harness resets its synthetic hook cursor before each render.
  mocks.cursor = 0;
  // Invoke the hook through a small isolated state harness for this test file.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useResumePanelActions(props);
}

function pdfFile(name: string) {
  return new File(["synthetic PDF bytes"], name, { type: "application/pdf" });
}

function profileProps(
  onChange: (result: { applicationId?: string; revision?: number }) => void,
  onPending: (pending: boolean) => void,
) {
  return {
    applicationId: null,
    revision: null,
    editable: true,
    profileMode: true,
    resume: null,
    onChange,
    onPending,
  };
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

it("requires an application context and a file before starting an upload", async () => {
  const orphan = renderActions({
    applicationId: null,
    revision: null,
    editable: true,
    resume: null,
  });
  await orphan.change("remove");
  expect(
    renderActions({
      applicationId: null,
      revision: null,
      editable: true,
      resume: null,
    }).message,
  ).toBe("Choose a PDF résumé.");
  expect(mocks.refresh).not.toHaveBeenCalled();

  const noFile = renderActions({
    applicationId: "app-1",
    revision: 1,
    editable: true,
    resume: null,
  });
  await noFile.change("upload");
  expect(
    renderActions({
      applicationId: "app-1",
      revision: 1,
      editable: true,
      resume: null,
    }).message,
  ).toBe("Choose a PDF résumé.");
  expect(mocks.refresh).not.toHaveBeenCalled();
});

it("uploads a selected file to the profile endpoint and applies returned metadata", async () => {
  const file = pdfFile("my résumé.pdf");
  const onChange =
    vi.fn<(result: { applicationId?: string; revision?: number }) => void>();
  const onPending = vi.fn<(pending: boolean) => void>();
  const fetch = vi
    .fn()
    .mockResolvedValue(
      response({ resume: attachment, applicationId: "app-2", revision: 4 }),
    );
  vi.stubGlobal("fetch", fetch);
  const props = profileProps(onChange, onPending);
  const actions = renderActions(props);
  actions.selectFile(file);
  const operation = renderActions(props).operation;
  await renderActions(props).change("upload");

  expect(fetch).toHaveBeenCalledWith(
    "/api/profile/resume",
    expect.objectContaining({
      method: "POST",
      body: file,
      headers: expect.objectContaining({
        "x-resume-intent": "upload",
        "x-resume-filename": "my%20r%C3%A9sum%C3%A9.pdf",
        "x-resume-operation": operation,
        "content-type": "application/pdf",
      }),
    }),
  );
  expect(onPending.mock.calls).toEqual([[true], [false]]);
  expect(onChange).toHaveBeenCalledWith({
    applicationId: "app-2",
    revision: 4,
  });
  expect(mocks.refresh).toHaveBeenCalledOnce();
  expect(renderActions(props)).toMatchObject({
    attachment,
    pending: false,
    uploadFailed: false,
    message: "Résumé change saved. Review the attachment below.",
  });
});

it("retries through the upload action with the same file and operation", async () => {
  const file = pdfFile("synthetic.pdf");
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response({ error: "Upload was rejected." }, 409))
    .mockResolvedValueOnce(response({ resume: attachment }));
  vi.stubGlobal("fetch", fetch);
  const props = {
    applicationId: "app-1",
    revision: 7,
    editable: true,
    resume: null,
  };
  renderActions(props).selectFile(file);
  await renderActions(props).change("upload");
  expect(renderActions(props)).toMatchObject({
    uploadFailed: true,
    message: "Upload was rejected.",
    pending: false,
  });
  const firstOperation =
    fetch.mock.calls[0]?.[1]?.headers?.["x-resume-operation"];
  await renderActions(props).change("upload");
  const retryHeaders = fetch.mock.calls[1]?.[1]?.headers;
  expect(retryHeaders?.["x-resume-retry"]).toBe("true");
  expect(retryHeaders?.["x-resume-operation"]).toBe(firstOperation);
  expect(fetch.mock.calls[1]?.[1]?.body).toBe(file);
  expect(renderActions(props)).toMatchObject({
    uploadFailed: false,
    attachment,
  });
});

it("routes job and application changes with their current revision and profile résumé", async () => {
  const fetch = vi.fn().mockResolvedValue(response({}));
  vi.stubGlobal("fetch", fetch);
  const profileResume = {
    ...attachment,
    id: "60000000-0000-4000-8000-000000000b02",
  };
  const jobProps = {
    applicationId: null,
    jobId: "job-1",
    revision: 3,
    editable: true,
    resume: null,
    profileResume,
  };
  await renderActions(jobProps).change("profile");
  expect(fetch).toHaveBeenLastCalledWith(
    "/api/jobs/job-1/resume",
    expect.objectContaining({
      headers: expect.objectContaining({
        "x-resume-intent": "profile",
        "x-application-revision": "3",
        "x-profile-resume": profileResume.id,
      }),
      body: undefined,
    }),
  );

  const applicationProps = {
    applicationId: "application-1",
    revision: 5,
    editable: true,
    resume: attachment,
  };
  await renderActions(applicationProps).change("remove");
  expect(fetch).toHaveBeenLastCalledWith(
    "/api/applications/application-1/resume",
    expect.objectContaining({
      headers: expect.objectContaining({
        "x-resume-intent": "remove",
        "x-application-revision": "5",
      }),
      body: undefined,
    }),
  );
});

it("uses generic safe feedback for invalid JSON, non-object data, and network failures", async () => {
  const file = pdfFile("synthetic.pdf");
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("not-json", { status: 500 }))
    .mockResolvedValueOnce(response(null))
    .mockRejectedValueOnce(new Error("private network diagnostic"));
  vi.stubGlobal("fetch", fetch);
  const props = {
    applicationId: "app-1",
    revision: 1,
    editable: true,
    resume: null,
  };
  renderActions(props).selectFile(file);
  await renderActions(props).change("upload");
  expect(renderActions(props)).toMatchObject({
    uploadFailed: true,
    message:
      "We could not confirm the change. Reload to check your saved résumé.",
  });
  await renderActions(props).change("remove");
  expect(renderActions(props).message).toBe(
    "We could not confirm the change. Reload to check your saved résumé.",
  );
  await renderActions(props).change("upload");
  expect(renderActions(props).message).toBe(
    "We could not confirm the change. Reload to check your saved résumé.",
  );
  expect(mocks.refresh).toHaveBeenCalledTimes(3);
});

it("displays safe server reference codes", async () => {
  const reference = "84000000-0000-4000-8000-000000000101";
  const fetch = vi.fn().mockResolvedValue(
    response(
      {
        code: "RESUME_UPLOAD_PREPARATION_FAILED",
        error: "We could not prepare this résumé upload.",
        reference,
      },
      503,
    ),
  );
  vi.stubGlobal("fetch", fetch);
  const props = {
    applicationId: "app-1",
    revision: null,
    editable: true,
    resume: null,
  };
  renderActions(props).selectFile(pdfFile("synthetic.pdf"));
  await renderActions(props).change("upload");
  expect(renderActions(props).message).toBe(
    `We could not prepare this résumé upload. Reference code: ${reference}`,
  );
  expect(renderActions(props).pending).toBe(false);
});
