// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/applications/actions", () => ({
  updateApplication: vi.fn(),
}));
vi.mock("@/components/applicant-ai-draft", () => ({
  ApplicantAiDraft: () => null,
}));
vi.mock("@/components/application-contact-details", () => ({
  ApplicationContactDetails: () => null,
}));
vi.mock("@/components/application-form-fields", () => ({
  ApplicantContactFields: () => null,
  ApplicationBackgroundFields: () => null,
  ApplicationFormActions: () => null,
  CoverLetterField: () => null,
}));
vi.mock("@/components/resume-panel", () => ({
  ResumePanel: ({ revision }: { revision: number | null }) => (
    <output id="resume-panel-revision">{revision ?? ""}</output>
  ),
}));

import { ApplicationForm } from "@/components/application-form";

const details = {
  full_name: null,
  phone: null,
  portfolio_url: null,
  submitted_email: null,
};

let container: HTMLDivElement;
let root: Root;

async function renderForm(revision: number, applicationId = "application-1") {
  await act(async () => {
    root.render(
      <ApplicationForm
        jobId="synthetic-job"
        value=""
        revision={revision}
        submitted={false}
        email="synthetic@example.test"
        details={details}
        applicationId={applicationId}
      />,
    );
  });
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  document.body.innerHTML = "";
});

describe("application form server-prop refresh", () => {
  it("updates the hidden and résumé revisions when refreshed props advance", async () => {
    await renderForm(2);
    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("2");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "2",
    );

    await renderForm(3);

    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("3");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "3",
    );
  });

  it("adopts a new application identity and its refreshed revision", async () => {
    await renderForm(3);

    await renderForm(1, "application-2");

    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("1");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "1",
    );
  });
});
