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
  ApplicantContactFields: ({ values }: { values: { full_name: string } }) => (
    <output id="full-name-value">{values.full_name}</output>
  ),
  ApplicationBackgroundFields: () => null,
  ApplicationFormActions: () => null,
  CoverLetterField: ({ value }: { value: string }) => (
    <output id="cover-letter-value">{value}</output>
  ),
}));
vi.mock("@/components/resume-panel", () => ({
  ResumePanel: ({
    applicationId,
    revision,
    onChange,
  }: {
    applicationId: string | null;
    revision: number | null;
    onChange?: (result: { applicationId?: string; revision?: number }) => void;
  }) => (
    <>
      <output id="resume-panel-application-id">{applicationId ?? ""}</output>
      <output id="resume-panel-revision">{revision ?? ""}</output>
      {onChange && (
        <button
          id="establish-local-application"
          type="button"
          onClick={() =>
            onChange({ applicationId: "application-1", revision: 1 })
          }
        >
          Establish local application
        </button>
      )}
    </>
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

async function renderForm(
  revision: number,
  applicationId: string | null = "application-1",
  value = "Initial letter",
  fullName = "Initial applicant",
) {
  await act(async () => {
    root.render(
      <ApplicationForm
        jobId="synthetic-job"
        value={value}
        revision={revision}
        submitted={false}
        email="synthetic@example.test"
        details={{ ...details, full_name: fullName }}
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
  it("keeps the revision aligned with stale displayed values on server refresh", async () => {
    await renderForm(2);
    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("2");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "2",
    );

    await renderForm(3, "application-1", "Changed in another tab");

    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("2");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "2",
    );
    expect(container.querySelector("#cover-letter-value")?.textContent).toBe(
      "Initial letter",
    );
  });

  it("adopts server revision when displayed values are not stale", async () => {
    await renderForm(1);
    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("1");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "1",
    );

    await renderForm(2, "application-1", "Initial letter", "Initial applicant");

    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("2");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "2",
    );
  });
});

describe("application form identity changes", () => {
  it("adopts a new application identity and resets prior form values", async () => {
    await renderForm(3);

    await renderForm(1, "application-2", "Second letter", "Second applicant");

    expect(
      container.querySelector<HTMLInputElement>('input[name="revision"]')
        ?.value,
    ).toBe("1");
    expect(
      container.querySelector("#resume-panel-application-id")?.textContent,
    ).toBe("application-2");
    expect(container.querySelector("#resume-panel-revision")?.textContent).toBe(
      "1",
    );
    expect(container.querySelector("#full-name-value")?.textContent).toBe(
      "Second applicant",
    );
    expect(container.querySelector("#cover-letter-value")?.textContent).toBe(
      "Second letter",
    );
  });

  it("resets values when another tab creates the first application ID", async () => {
    await renderForm(0, null, "Entered before first save", "Entered applicant");

    await renderForm(1, "application-1", "Server copy", "Server copy");

    expect(container.querySelector("#full-name-value")?.textContent).toBe(
      "Server copy",
    );
    expect(container.querySelector("#cover-letter-value")?.textContent).toBe(
      "Server copy",
    );
  });
});

describe("application forms retain locally created draft identity", () => {
  it("keeps entered values when a local resume response establishes the first ID", async () => {
    await renderForm(0, null, "Entered before upload", "Entered applicant");

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>("#establish-local-application")
        ?.click();
    });
    await renderForm(1, "application-1", "Server copy", "Server copy");

    expect(container.querySelector("#full-name-value")?.textContent).toBe(
      "Entered applicant",
    );
    expect(container.querySelector("#cover-letter-value")?.textContent).toBe(
      "Entered before upload",
    );
  });
});

describe("application forms reject mismatched local draft identity", () => {
  it("resets values when the server adopts a different ID than the local response", async () => {
    await renderForm(0, null, "Entered before upload", "Entered applicant");

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>("#establish-local-application")
        ?.click();
    });
    await renderForm(1, "application-2", "Other tab draft", "Other applicant");

    expect(container.querySelector("#full-name-value")?.textContent).toBe(
      "Other applicant",
    );
    expect(container.querySelector("#cover-letter-value")?.textContent).toBe(
      "Other tab draft",
    );
  });
});

describe("application form identity disappearance", () => {
  it("resets values when the existing application identity disappears", async () => {
    await renderForm(
      3,
      "application-1",
      "Withdrawn letter",
      "Withdrawn applicant",
    );

    await renderForm(0, null, "Replacement draft", "Replacement applicant");

    expect(container.querySelector("#full-name-value")?.textContent).toBe(
      "Replacement applicant",
    );
    expect(container.querySelector("#cover-letter-value")?.textContent).toBe(
      "Replacement draft",
    );
  });
});
