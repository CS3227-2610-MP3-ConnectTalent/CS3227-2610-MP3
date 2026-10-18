import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("@/app/hr/applications/actions", () => ({
  addHRNote: vi.fn(),
  changeHRStatus: vi.fn(),
}));
vi.mock("@/lib/hr-applications", () => ({
  listHRNotes: vi.fn(),
  listHRStatusEvents: vi.fn(),
  getSubmittedApplication: vi.fn(),
}));

import { HRApplicationActions } from "@/components/hr-application-actions";

const application = {
  id: "70000000-0000-4000-8000-000000000b01",
  applicant_id: "70000000-0000-4000-8000-000000000b02",
  job_id: "70000000-0000-4000-8000-000000000b03",
  job_title: "Synthetic engineer",
  submitted_at: "2026-10-10T00:00:00Z",
  review_status: "in_review" as const,
  withdrawn_at: null,
  withdrawn_by: null,
  education: null,
  work_experience: null,
  full_name: "Synthetic Applicant",
  submitted_email: "applicant@example.test",
  phone: null,
  portfolio_url: null,
  original_submitted_letter: "Synthetic original letter",
  cover_letter: "Synthetic current letter",
  review_revision: 2,
  revision: 3,
};

beforeEach(() => vi.clearAllMocks());

it("renders empty notes and no editable controls for a read-only review", () => {
  const html = renderToStaticMarkup(
    <HRApplicationActions
      application={application}
      notes={[]}
      events={[]}
      editable={false}
    />,
  );
  expect(html).toContain("No notes yet.");
  expect(html).toContain("Change review status");
  expect(html).not.toContain("Add a note");
  expect(html).not.toContain("Update status");
  expect(html).not.toContain("Status history");
});

it("renders private note and status history separately from editable review actions", () => {
  const html = renderToStaticMarkup(
    <HRApplicationActions
      application={application}
      notes={[
        {
          id: "70000000-0000-4000-8000-000000000b04",
          author_id: "70000000-0000-4000-8000-000000000b05",
          body: "Synthetic follow-up",
          created_at: "2026-10-10T00:00:00Z",
        },
      ]}
      events={[
        {
          id: "70000000-0000-4000-8000-000000000b06",
          actor_id: "70000000-0000-4000-8000-000000000b05",
          from_status: "submitted",
          to_status: "in_review",
          created_at: "2026-10-10T00:00:00Z",
        },
      ]}
      editable
    />,
  );
  expect(html).toContain("Private HR notes");
  expect(html).toContain("Synthetic follow-up");
  expect(html).toContain("Add a note");
  expect(html).toContain('name="expectedRevision" value="2"');
  expect(html).toContain('name="status"');
  expect(html).toContain("Status history");
  expect(html).toContain("Submitted");
  expect(html).toContain("In review");
});
