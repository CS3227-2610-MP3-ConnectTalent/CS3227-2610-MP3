import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, useFormStatus: mocks.status };
});

import { ApplicationFormActions } from "@/components/application-form-fields";

beforeEach(() => mocks.status.mockReturnValue({ pending: false, data: null }));

it.each([
  ["save", "Saving draft…", "Submit application"],
  ["submit", "Save draft", "Submitting…"],
])(
  "shows the %s action as pending and blocks both submits",
  (intent, active, idle) => {
    const data = new FormData();
    data.set("intent", intent);
    mocks.status.mockReturnValue({ pending: true, data });
    const html = renderToStaticMarkup(<ApplicationFormActions />);
    expect(html).toContain(active);
    expect(html).toContain(idle);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  },
);

it("keeps both actions idle when no request is pending", () => {
  const html = renderToStaticMarkup(<ApplicationFormActions />);
  expect(html).toContain("Save draft");
  expect(html).toContain("Submit application");
  expect(html).not.toContain('disabled=""');
});
