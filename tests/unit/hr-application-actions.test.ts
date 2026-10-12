import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireHR: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { addHRNote, changeHRStatus } from "@/app/hr/applications/actions";

const applicationId = "20000000-0000-4000-8000-000000000b01";
const actorId = "20000000-0000-4000-8000-000000000b02";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  const query = {
    select: vi.fn(),
    eq: mocks.eq,
    is: mocks.is,
    maybeSingle: mocks.maybeSingle,
  };
  query.select.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
  mocks.is.mockReturnValue(query);
  mocks.maybeSingle.mockResolvedValue({
    data: { id: applicationId },
    error: null,
  });
  mocks.rpc.mockResolvedValue({ error: null });
  mocks.requireHR.mockResolvedValue({
    client: { from: vi.fn(() => query), rpc: mocks.rpc },
    user: { id: actorId },
  });
  vi.spyOn(console, "info").mockImplementation(() => {});
});

it("rejects an invalid application id or empty note before database writes", async () => {
  await expect(
    addHRNote(form({ applicationId: "bad", body: "Note" })),
  ).rejects.toThrow("REDIRECT:/hr/applications?error=invalid");
  await expect(addHRNote(form({ applicationId, body: "  " }))).rejects.toThrow(
    `REDIRECT:/hr/applications/${applicationId}?error=note`,
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it("denies notes for withdrawn or unavailable applications and audits the denial", async () => {
  mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  await expect(
    addHRNote(form({ applicationId, body: "Synthetic note" })),
  ).rejects.toThrow(
    `REDIRECT:/hr/applications/${applicationId}?error=withdrawn`,
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
  expect(
    JSON.parse(String(vi.mocked(console.info).mock.calls[0]?.[0])),
  ).toMatchObject({
    actor: actorId,
    operation: "note",
    target: applicationId,
    outcome: "denied",
  });
});

it("writes a validated note, refreshes the review page, and redirects", async () => {
  await expect(
    addHRNote(form({ applicationId, body: "Synthetic note" })),
  ).rejects.toThrow(
    `REDIRECT:/hr/applications/${applicationId}?notice=note-added`,
  );
  expect(mocks.rpc).toHaveBeenCalledWith("append_hr_application_note", {
    p_application_id: applicationId,
    p_body: "Synthetic note",
  });
  expect(mocks.revalidatePath).toHaveBeenCalledWith(
    `/hr/applications/${applicationId}`,
  );
});

it("reports a note RPC failure without exposing its diagnostic", async () => {
  mocks.rpc.mockResolvedValueOnce({
    error: { message: "private transport detail" },
  });
  await expect(
    addHRNote(form({ applicationId, body: "Synthetic note" })),
  ).rejects.toThrow(`REDIRECT:/hr/applications/${applicationId}?error=note`);
  expect(mocks.revalidatePath).not.toHaveBeenCalled();
  expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain(
    "private transport detail",
  );
});

it("validates status and revision, then rejects inactive applications", async () => {
  await expect(
    changeHRStatus(
      form({ applicationId, status: "submitted", expectedRevision: "1" }),
    ),
  ).rejects.toThrow(`REDIRECT:/hr/applications/${applicationId}?error=status`);
  await expect(
    changeHRStatus(
      form({ applicationId, status: "in_review", expectedRevision: "0" }),
    ),
  ).rejects.toThrow(`REDIRECT:/hr/applications/${applicationId}?error=status`);
  mocks.maybeSingle.mockResolvedValueOnce({
    data: null,
    error: { message: "unavailable" },
  });
  await expect(
    changeHRStatus(
      form({ applicationId, status: "in_review", expectedRevision: "2" }),
    ),
  ).rejects.toThrow(
    `REDIRECT:/hr/applications/${applicationId}?error=withdrawn`,
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it("changes status with an expected revision and refreshes both review views", async () => {
  await expect(
    changeHRStatus(
      form({ applicationId, status: "shortlisted", expectedRevision: "3" }),
    ),
  ).rejects.toThrow(
    `REDIRECT:/hr/applications/${applicationId}?notice=status-changed`,
  );
  expect(mocks.rpc).toHaveBeenCalledWith("change_hr_application_status", {
    p_application_id: applicationId,
    p_status: "shortlisted",
    p_expected_revision: 3,
  });
  expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
    1,
    `/hr/applications/${applicationId}`,
  );
  expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/hr/applications");
});

it("redirects after a status RPC failure and records only a denied audit result", async () => {
  mocks.rpc.mockResolvedValueOnce({ error: { message: "private diagnostic" } });
  await expect(
    changeHRStatus(
      form({ applicationId, status: "rejected", expectedRevision: "1" }),
    ),
  ).rejects.toThrow(`REDIRECT:/hr/applications/${applicationId}?error=status`);
  expect(mocks.revalidatePath).not.toHaveBeenCalled();
  expect(
    JSON.parse(String(vi.mocked(console.info).mock.calls[0]?.[0])),
  ).toMatchObject({
    operation: "status",
    outcome: "denied",
  });
});
