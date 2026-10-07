# Implementation plan: Applicant accounts and applications

- Change/issues: `2026-10-07-applicant-applications`; [#6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6); dependencies #4 merged, #9 HR review later.
- Owner/status/date: Paul Cheng for Applicant behavior; **approved for implementation** in the 2026-10-07 chat.
- Inputs: [proposal](proposal.md), [ACC-001 delta](specs/accounts-and-roles.md), [APP-004 delta](specs/applications-and-review.md), [SEC-001 delta](specs/security-and-privacy.md), [design](design.md), and ProductSpec v0.6 at commit `0200eb9`. The ACC-001 delta records the user's later password-confirmation correction.
- Requirement IDs: ACC-001/002/003, APP-001/002 and proposed APP-004, JMG-002/003, SEC-001/002/008, AID-002; acceptance `app6-AC-01` through `app6-AC-08`.
- Constraints: use the authenticated user's Supabase session, synthetic test users, and server/database authorization. Do not implement SoCLaaS, HR notes/status UI, HR job management, production deployment, or unapproved behavior. Do not commit/push/create a PR without the user's separate Git instruction.

## Dependency-ordered work

| Task | Depends on | Proposed owner | IDs | Expected files / output | Verification and evidence |
| --- | --- | --- | --- | --- | --- |
| T00: approval | Packet complete | Student owner | All | `proposal.md`, delta, `design.md`, `plan.md`, `record.md` | Record actual decision/date/source and teammate interface agreement. No code before this gate. |
| T01: database boundary | T00 | Applicant implementer; security reviewer later | ACC-001/002, APP-001/004, SEC-001/002; AC-01/02/03/04/05/06/07 | `supabase/migrations/20261007000000_applicant_accounts_and_applications.sql`, `supabase/tests/database/applicant_applications.test.sql` | Write focused pgTAP denials first and observe missing-behavior failure, then migration and `corepack pnpm test:db` pass. Verify RLS, function grants, unique pair, original snapshot, closed-job writes, draft privacy, and direct RPC abuse. |
| T02: authenticated sessions | T01 | Applicant implementer | ACC-001/002/003, SEC-001/002; AC-01/05/06/08 | `src/lib/supabase/server.ts`, `src/lib/auth.ts`, `src/app/auth/sign-in/page.tsx`, `src/app/auth/sign-up/page.tsx`, `src/app/auth/actions.ts`, session-refresh file required by installed Next/Supabase docs, `tests/e2e/applicant-applications.spec.ts` | Write failing browser flow for signup/sign-in/protected route, then implement. Confirm matching password confirmation is checked server-side, public signup cannot claim HR, unverified accounts and anonymous requests are denied. Check local Next docs before writing Next code. |
| T03: Applicant application UI | T01/T02 | Applicant implementer | APP-001/002/004, AID-002; AC-02/03/05/07/08 | `src/lib/applications.ts`, `src/app/jobs/[id]/page.tsx`, `src/app/jobs/[id]/apply/page.tsx`, `src/app/jobs/[id]/apply/actions.ts`, `src/app/applications/page.tsx`, `src/app/applications/[id]/page.tsx`, `src/app/applications/[id]/actions.ts`, `tests/unit/applications.test.ts`, browser test above | Write failing save/resume/submit/edit/own-read tests, implement one field contract, then pass unit and browser checks. AI text insertion is an interface contract only; no model call. |
| T04: adversarial and failure verification | T01–T03 | Test engineer and security reviewer in separate executions if available | SEC-001/002/008; AC-01/03/04/05/06/07/08 | Database/browser test files, `record.md`, review handoff | Test two synthetic Applicants, anonymous/HR denials, duplicate and concurrent submit, job closure, stale revision, malformed/oversized text, and no letter text in logs. Run lint, typecheck, unit, db, browser, and build; record exact outcomes and limits. |
| T05: documentation and teammate handoff | T03/T04 | Applicant owner | APP-004/AID-002; AC-02/07 | `docs/UserGuide.md`, `docs/DeveloperGuide.md`, `docs/Reflections.md`, `README.md`, `record.md`, optional `handoffs/ai-interface.md` | Describe only shipped behavior; give teammate field, length, revision, original/current, and no-auto-submit contract. Verify local links/content. |
| T06: independent review | T04/T05 | Separate reviewer, not implementer | All | `handoffs/independent-review.md`, `record.md` | Review final diff, acceptance and security cases with file/line findings; fix and recheck issues. Mark independence honestly. |
| T07: human acceptance | T06 | Student owner | All | `record.md` | Record accept/reject/conditions and source/date; tests alone do not approve. |
| T08: spec sync and archive | T07 | Student owner | ACC-001, APP-004, SEC-001 | `workflow/specs/accounts-and-roles.md`, `workflow/specs/applications-and-review.md`, `workflow/specs/security-and-privacy.md`, `workflow/ProductSpec.md`, `workflow/archive/2026-10-07-applicant-applications/` | Sync only accepted deltas, update baseline/version and trace, verify IDs/links, archive entire packet. If a delta is rejected, record disposition and do not sync it. |
| T09: closeout and PR | T08 | Authorized contributor | #6, all ACs | `logs/YYYY-MM-DD-applicant-applications*.md`, final record, PR template | Complete dated summaries, exact checks and limitations; inspect diff. Commit/push/PR only on explicit user instruction. PR targets `develop` and links #6; merge/release are later decisions. |

File names are the planned ownership boundary, not evidence that implementation exists. Resolve current Next.js API details from `node_modules/next/dist/docs/` before T02/T03; adjust paths with a recorded plan revision if the installed version requires it. HR-owned files and AI endpoint files are excluded.

## Handoffs and release boundary

Pass the teammate only the agreed field contract and synthetic examples, not private application data. The Applicant AI feature #7 may populate `cover_letter` but must not call Save Draft or Submit automatically. The HR AI feature #10 should read current letter plus revision and published requirements; a later edit makes any earlier summary stale. HR notes/review/status implementation in #9 must not read drafts and must preserve original/current letter visibility.

Database migration precedes app use in each environment. Staging/production configuration and rollout evidence belong to #11. A failure after real data exists requires a reviewed forward repair or restoration plan, not deletion of applications.

## Approval and completion

- [x] Human approved proposal, APP-004 and SEC-001 deltas, design and this plan before T01 in the 2026-10-07 chat.
- [ ] Teammate accepted the shared textarea/length/revision contract.
- [ ] Independent review, human acceptance, spec sync/archive and logs recorded separately.
- [ ] Final PR opened only after closeout and separate Git instruction.
- Approval/date/source: user in 2026-10-07 chat; required email verification and 5,000-character limit explicitly approved.
