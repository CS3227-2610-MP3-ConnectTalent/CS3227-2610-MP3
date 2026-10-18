# Proposal: HR job management

- Change ID: `2026-10-09-hr-job-management`
- Issue: [#8 — HR job management](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/8)
- Owner: Paul Cheng, application workflow; HR posting workflow ownership is to be confirmed with the team.
- Status/date: approved for implementation and locally accepted with recorded limits, 2026-10-09.
- Baseline: [ProductSpec v1.0](../../ProductSpec.md), `develop` commit `0a0f5c4`; branch `feat/8-hr-job-management` was created from updated `develop`.
- Classification: implementation of existing [JMG-001–003](../../specs/job-management.md), [JOB-001–003](../../specs/public-job-listings.md), [APP-001/004](../../specs/applications-and-review.md), and [SEC-001/002](../../specs/security-and-privacy.md). High risk: job publication controls application eligibility and private draft visibility.

## Intent and scope

HR currently cannot create, edit, publish or close jobs in the application. Build the HR-only job lifecycle already specified for this single-employer portal. HR creates a draft with title, team, category, description and requirements; may edit it while draft; explicitly publishes it; and later explicitly closes it. Published and closed content is immutable. Public pages display only published jobs. Existing applications remain available under their existing access rules when a job closes.

This change owns job-management database permissions/RPCs, server-side data access and actions, HR pages, relevant navigation, tests and guides. It excludes AI features, job deletion/reopening, multi-company tenancy, Applicant application lifecycle redesign, and hosted database migration or release. The teammate's AI work may link to the HR page later without authority to publish or close a job.

The student confirmed on 2026-10-09 that submitted cover letters **remain editable while the job is published and stop being editable when the job closes**. [APP-004](../../specs/applications-and-review.md) and [SEC-001](../../specs/security-and-privacy.md) remain unchanged. Job closure must serialize with Applicant save/submit/edit operations.

## Alternatives, dependencies and risks

| Choice | Alternative | Reason |
| --- | --- | --- |
| Narrow HR RPCs for create/edit/publish/close, with no direct client write grants | Broad authenticated table writes with RLS | RPCs enforce state transitions and job-row locking as one transaction. Server and database both check HR authority. |
| Reuse the existing jobs table and fields | A new posting table | Existing listings and applications already reference `public.jobs`; additive functions and policy avoid data migration. |
| Explicit Publish and Close actions | Status field in the edit form | Distinct human actions make the transition visible and protect published content. |
| Keep published-only public queries | Let public read all states and hide rows in the UI | Database visibility must deny draft and closed jobs. |

- Dependencies: existing jobs schema, Applicant RPCs and HR authentication/role policy on `develop`; Development Supabase migration needs team coordination before preview validation because previews share that project.
- Risks: Applicant invoking HR mutations, published-content edits, draft leakage, concurrent closure/submission, stale HR forms, orphaned application history, and incompatible hosted schema. The [design](design.md) and [plan](plan.md) define checks and rollback.
- Open product decisions: none for this scope. Existing canonical requirements govern. HR ownership/coordination is a team handoff, not a product-policy decision.
- Spec delta: none. This implements accepted JMG/JOB/APP/SEC requirements without changing their wording or behavior.

## Acceptance evidence

| ID | Issue / canonical IDs | Expected outcome | Evidence target |
| --- | --- | --- | --- |
| `jmg8-AC-01` | #8; JMG-001, JOB-002/003, SEC-001/002 | Verified HR creates and edits a valid draft; it is absent from public listings and detail. Invalid fields/category and Applicant/anonymous mutations are denied. | Database permission/RPC tests, validation tests and browser HR/public checks. |
| `jmg8-AC-02` | #8; JMG-002, JOB-001/003, APP-001 | A separate HR Publish action exposes the fixed job publicly and permits Applicant submission; editing published content or publishing again is denied. | Database transition tests and browser flow. |
| `jmg8-AC-03` | #8; JMG-003, APP-001/002/004, SEC-001 | A separate HR Close action removes the job from public browse/detail and blocks new applications/current-letter edits, while existing applications remain readable to their permitted actors. | Database race/denial tests and browser checks. |
| `jmg8-AC-04` | #8; SEC-001/002/007 | Unverified/non-HR users cannot list draft/closed jobs through the HR interface or invoke mutation RPCs; audit output omits job text and private application data. | Role/grant/RLS tests, direct-route checks and log review. |
| `jmg8-AC-05` | #8; OPS-001/003 | Additive migration works with the current app; local checks pass. Shared Development Supabase and preview smoke are explicitly recorded as performed or pending, with no claim of production deployment. | Migration, test, build and environment evidence in `record.md`. |

Artifacts: [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md). No capability delta is proposed.

## Approval record

- [x] Student approves this proposal, existing requirement interpretation, design and plan before implementation.
- Approver/decision/date/source: Paul Cheng, 2026-10-09, explicit conversation reply “Approve as written (Recommended)” to the question naming the #8 proposal, design, plan, cover-letter boundary, HR actions and required tests.
- Conditions: no hosted migration, commit, push or PR is implied by implementation approval.
- Separate acceptance: Paul Cheng replied “Accept with recorded limits (Recommended)” on 2026-10-09 to the question naming the final local checks, independent review, hosted migration/preview limits, and no commit/push/PR/deployment authorization.
