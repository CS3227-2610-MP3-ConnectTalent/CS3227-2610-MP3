# Plan: #49/#50 form and withdrawal

Owner Paul Cheng; 2026-10-10; approved as written, then separately accepted locally with recorded limits. [Proposal](proposal.md), [design](design.md), [deltas](specs/applications-and-review.md). Implementation baseline24b1da8, v1.4; accepted requirements synced to v1.5. Primary owns implementation; separate reviewer executed after implementation. Actual outcomes and remaining submission/hosted gates are in [record](record.md).

| Task | Depends | Bounded files/output | Acceptance/check |
| --- | --- | --- | --- |
| T00 | None | Issue/branch/packet and student approval | Static links; actual decision source |
| T01 | T00 approval | tests for form structure, duplicate links, file control/retry and mocked AI; src/components/application-form.tsx, applicant-ai-draft.tsx, resume-panel.tsx; apply/detail pages | AC01–03/08: focused observed red→green; read installed Next guides before code |
| T02 | T00 approval | New supabase/migrations and database tests; withdrawal field/RPC/event guards; existing freeze/access/HR/AI eligibility contracts | AC04–07: DB owner/draft/role denial, retained fields, idempotency; Supabase/Postgres skills before SQL |
| T03 | T02 | src/lib/applications.ts, hr-applications.ts, withdrawal helper, application actions and list/detail/status components | AC04–07: validator/service/action tests then UI confirmation, status and view |
| T04 | T02 | src/lib/ai/application-data.ts and relevant server quota/summary checks/routes only | AC06/07: mocked provider no-call for withdrawn and in-flight eligibility recheck; no prompts/input expansion |
| T05 | T01–04 | tests/e2e and bounded integration races; local synthetic Supabase/Storage | Unit, DB, browser 390/1440, race cases, pnpm typecheck/lint/build; record failures/fixes and missing gates |
| T06 | T05 | Separate readonly review handoff of final revision including RLS/upload recovery/withdrawal/AI guards | Actual independent execution; findings fixed and rechecked |
| T07 | T06 | Student separate acceptance, docs/UserGuide.md and DeveloperGuide.md, dated logs | No inferred acceptance; hosted/full audit limits explicit |
| T08 | T07 | Accepted deltas canonical sync then complete archive | Verify IDs/links; archive not release |
| T09 | T08 + explicit authorization | Focused commits/push and template PR into develop | PR last; not currently authorized |

No writing to teammate AI prompt/model code, SMTP, unrelated roles/jobs/account deletion, production secrets or hosted configuration. All runtime data synthetic. The record names actual separate review and checks; the table defines planned obligations rather than proving execution by itself. Requirement/plan changes return to approval. Current scope is one branch with both issue links, rather than a global soft-delete refactor.
