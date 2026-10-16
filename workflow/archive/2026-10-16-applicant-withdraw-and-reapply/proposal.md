# Proposal: Allow Applicants to Withdraw and Reapply

- Change ID: `2026-10-16-applicant-withdraw-and-reapply`
- Issues: [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90)
- Owner: John Wong (`Johnwz123`)
- Status: approved (approved by John Wong on 2026-10-16)
- Date: 2026-10-16
- Baseline: ProductSpec v1.15, 15 October 2026 ([ProductSpec.md](../../ProductSpec.md))
- Affected capabilities: `workflow/specs/applications-and-review.md` ([`APP-001`](../../specs/applications-and-review.md#app-001-selected-job-submit-once-application), [`APP-008`](../../specs/applications-and-review.md#app-008-confirmed-applicant-withdrawal))
- Classification: Behavior change (schema constraint migration, RPC logic update, and query scoping)

## Intent, problem, and motivation

Currently, when an applicant withdraws a submitted application for a job, the whole-table unique constraint `applications_one_per_applicant_job` on `(applicant_id, job_id)` prevents them from ever submitting or drafting a new application for that same job. Applicants who withdrew (e.g. to update details, correct errors, or because their availability changed) cannot reapply while the job remains open.

The desired outcome is to allow applicants to withdraw a submitted application and subsequently draft and submit a new application for the same open published job. Historical withdrawn applications are fully retained for audit, compliance, and HR review, while at most one active (non-withdrawn) application per applicant per job is permitted at any time.

## Goals, non-goals, and scope boundaries

- **Goals:**
  - Replace whole-table unique constraint `applications_one_per_applicant_job` with a partial unique index on `(applicant_id, job_id) WHERE withdrawn_at IS NULL`.
  - Update `application_private.write_application_details_v3` to scope existing application checks to active records (`WHERE withdrawn_at IS NULL`), allowing a new draft and submission after withdrawal.
  - Update application query helpers (`getOwnApplicationForJob` in `src/lib/applications.ts`) to resolve the active application (`WHERE withdrawn_at IS NULL`).
  - Update the job details view (`/jobs/[id]`) so an applicant with a previously withdrawn application sees the action to apply again while the job is published and open.
  - Preserve all historical withdrawn applications, their immutable snapshots, timestamps, and HR notes intact in both applicant history (`/applications/[id]`) and HR review (`/hr/applications/[id]`).
- **Non-goals:**
  - Direct un-withdrawal / resurrection of a previously withdrawn application record (the applicant drafts and submits a new application).
  - Reapplying to closed jobs or scheduled jobs before their `opens_at` time.
  - Permitting multiple concurrent active applications for the same applicant and job.
  - Modifying or clearing HR notes or audit logs associated with prior withdrawn records.
- **Users/roles:**
  - Applicants: Can withdraw an active application and create a new application for the same open job.
  - HR: Can view both past withdrawn application(s) and any new active application submitted by the applicant for that job.
- **Scope boundaries:**
  - Database migration in `supabase/migrations/`.
  - Application logic in `src/lib/applications.ts`.
  - Public job and application pages in `src/app/jobs/[id]/page.tsx` and `src/app/jobs/[id]/apply/page.tsx`.
  - Tests in `supabase/tests/database/` and `tests/unit/`.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Physical deletion of withdrawn application on reapply | Deletes records, destroys audit trail and HR review history | Rejected: Violates data retention and compliance requirements. |
| Direct un-withdrawal (re-opening same record) | Confuses audit trail, mutates previously frozen submission timestamps | Rejected: Reapplying must produce a distinct submission snapshot. |
| Partial unique index `WHERE withdrawn_at IS NULL` | Allows multiple withdrawn historical rows while strictly preventing concurrent active rows; standard Postgres pattern | **Chosen**: Clean, idempotent, zero data loss, enforces constraint at database level. |

- Assumptions: Existing applications table has `withdrawn_at IS NULL` for all active records.
- Dependencies: None; builds directly on `develop` baseline.
- Risks: Concurrency race if an applicant submits multiple applications simultaneously; mitigated by advisory transaction lock and partial unique index.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| `reapply-AC-01` | Issue #90; `APP-001` | Given an applicant who withdrew their application for an open job, when they navigate to `/jobs/[id]/apply`, then they can start and save a new draft application without conflict. | Unit test in `tests/unit/apply-page.test.tsx` and pgTAP test |
| `reapply-AC-02` | Issue #90; `APP-001` | Given an applicant with a saved draft after withdrawal, when they submit the application, then the submission succeeds and a new active application is created with status `Submitted`. | Unit test in `tests/unit/application-details.test.ts` and pgTAP test |
| `reapply-AC-03` | Issue #90; `APP-001`, `APP-008` | Given an applicant with an active (non-withdrawn) application, when a second application insert is attempted, then the partial unique index rejects it. | Database pgTAP test on constraint |
| `reapply-AC-04` | Issue #90; `APP-008` | Given an applicant who withdrew and reapplied, when viewing applicant and HR detail views, then the prior withdrawn application and the new application are both accessible with their distinct timestamps, snapshots, and review states. | Unit tests in `tests/unit/application-details.test.ts` and `tests/unit/hr-application-pages.test.tsx` |
| `reapply-AC-05` | Issue #90; `APP-001`, `JMG-004` | Given a closed job or scheduled job before opening, when an applicant who previously withdrew attempts to reapply, then the request is rejected with safe feedback. | pgTAP and unit tests |

- Spec deltas: `workflow/changes/2026-10-16-applicant-withdraw-and-reapply/specs/applications-and-review.md`
- Design: `workflow/changes/2026-10-16-applicant-withdraw-and-reapply/design.md`
- Plan and tasks: `plan.md` and `tasks.md`
- Evidence: `record.md`

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, deltas, design or omission reason, and plan agreed before product implementation.
- Approver: John Wong (`Johnwz123`)
- Decision/date/source: Approved by student in chat on 2026-10-16
- Conditions: None

