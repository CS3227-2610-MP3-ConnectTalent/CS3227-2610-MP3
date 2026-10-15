import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ actions: vi.fn() }));
vi.mock("@/components/resume-panel-actions", () => ({
  useResumePanelActions: mocks.actions,
}));

import { ResumePanel } from "@/components/resume-panel";

const resume = {
  id: "60000000-0000-4000-8000-000000000b01",
  filename: "synthetic.pdf",
  byte_size: 2048,
  object_path: "private/synthetic.pdf",
};

beforeEach(() => {
  mocks.actions.mockReturnValue({
    file: new File(["synthetic"], "synthetic.pdf", { type: "application/pdf" }),
    pending: false,
    activeIntent: null,
    attachment: resume,
    uploadFailed: true,
    message: "",
    selectFile: vi.fn(),
    change: vi.fn(),
  });
});

function html() {
  return renderToStaticMarkup(
    <ResumePanel
      applicationId="application-1"
      revision={1}
      editable
      resume={resume}
      profileResume={resume}
    />,
  );
}

it.each([
  ["upload", "Replacing résumé…"],
  ["remove", "Removing résumé…"],
  ["profile", "Using profile résumé…"],
] as const)(
  "marks %s as active and disables conflicting actions",
  (intent, label) => {
    mocks.actions.mockReturnValue({
      ...mocks.actions(),
      pending: true,
      activeIntent: intent,
    });
    const markup = html();
    expect(markup).toContain(label);
    expect(markup.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(5);
    expect(markup).toContain('role="status"');
  },
);

it("restores idle labels after settlement", () => {
  expect(html()).toContain("Replace résumé");
  expect(html()).toContain("Remove résumé");
  expect(html()).toContain("Use profile résumé");
  expect(html()).toContain("Retry upload");
});
