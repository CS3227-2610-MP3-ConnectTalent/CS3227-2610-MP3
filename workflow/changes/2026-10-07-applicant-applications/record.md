# Feature record: Applicant accounts and applications

Status: **implemented locally; further verification, independent review and student acceptance pending**

Applicant owner: Paul Cheng for the full application process, confirmed in this conversation. The teammate owns AI features.

Spec baseline: [ProductSpec v0.6](../../ProductSpec.md), commit `0200eb9` on `develop` when drafted. Date: 2026-10-07.

## Metadata and artifacts

- Change ID/classification: `2026-10-07-applicant-applications`; implementation of ACC/APP baseline plus proposed ACC-001, APP-004 and SEC-001 product deltas. ACC-001 was added after the user's password-confirmation correction.
- Issue: [#6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6); merged prerequisite [PR #4](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/4); HR follow-up [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- Branch: `feat/6-applicant-applications`; starting commit `0200eb9`. New commits, push and PR: **none**.
- [Proposal](proposal.md), [ACC-001 delta](specs/accounts-and-roles.md), [APP-004 delta](specs/applications-and-review.md), [SEC-001 delta](specs/security-and-privacy.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [implementer handoff](handoffs/implementation.md). Archive: pending.
- Canonical IDs: ACC-001/002/003; APP-001/002 and proposed APP-004; JMG-002/003; SEC-001/002/008; AID-002. APP-004 is not canonical until acceptance and sync.

## Decisions and gates

- [x] Issue #6 exists and was read for this packet; it was created before this branch.
- [x] User chose saved drafts between visits, submitted-letter editing until job closure, and preservation of the first submitted letter for HR in the 2026-10-07 conversation.
- [x] User confirmed Applicant process ownership, the 5,000-character bound and required email verification, then explicitly requested signup password confirmation on 2026-10-07. Teammate AI/revision integration remains a handoff.
- [x] User approved the complete proposal, deltas, design and plan on 2026-10-07 before implementation.
- [ ] Implementation and all planned verification complete. Focused input test red/green and local checks recorded; no database red result or concurrent-session test.
- [ ] Independent review and findings recorded.
- [ ] Separate human acceptance recorded.
- [ ] Accepted deltas synced, complete packet archived, guides/reflections/logs completed.
- [ ] Final issue-linked PR opened after separate Git instruction and closeout.

The user's later explicit approval in the 2026-10-07 chat authorizes implementation of this packet, including required email verification and the 5,000-character limit. It does not grant acceptance, merge or release. Planning and implementation occurred in successive Codex turns without a separately delegated reviewer; this is not independent multi-agent review.

## Acceptance map

| ID | Requirement | Expected evidence; observed result |
| --- | --- | --- |
| `app6-AC-01` | [ACC-001/002](../../specs/accounts-and-roles.md), [SEC-001](../../specs/security-and-privacy.md) | **Passed locally:** signup requires matching passwords and email verification in Playwright; pgTAP checks Applicant default and no profile update grant. |
| `app6-AC-02` | [APP-001](../../specs/applications-and-review.md), proposed APP-004 | **Passed locally:** browser saves/resumes draft and explicitly submits; pgTAP confirms draft state. |
| `app6-AC-03` | APP-001/APP-004 | **Partial:** unique database constraint and duplicate-submit pgTAP denial pass; simultaneous separate-session submission not exercised. |
| `app6-AC-04` | APP-001, [JMG-002/003](../../specs/job-management.md) | **Partial:** pgTAP denies direct draft/closed submissions and close-time edits; concurrent close-versus-submit race not exercised. |
| `app6-AC-05` | APP-002/APP-004, SEC-001/002 | **Passed locally:** browser denies second Applicant's direct URL; pgTAP checks owner, other Applicant, anonymous grant and HR draft visibility. |
| `app6-AC-06` | SEC-001/008 | **Partial:** pgTAP denies profile writes and HR Applicant-function use; no HR status field exists yet. Source review found only generic form errors, but no full log/audit inspection. Synthetic fixtures used. |
| `app6-AC-07` | APP-004 | **Passed locally:** browser edit retains original; pgTAP denies edit after closure and verifies original snapshot. |
| `app6-AC-08` | ACC-003, APP-001/002 | **Partial:** anonymous/verified Applicant and cross-user flows observed; network failure/retry browser case not yet run. |

The scenario details and required check types are in [proposal.md](proposal.md). This table is a plan, not a pass claim.

## Handoffs, implementation and review

- Product analysis/design/plan: Codex in this conversation, based on issue #6, canonical v0.6 specs, existing jobs migration/query and user choices. No separately spawned analyst, architect or reviewer ran.
- Implementation: local Applicant migration, Supabase SSR auth/proxy/callback, signup/sign-in pages, application actions/reads/pages/form, and tests; see [implementer handoff](handoffs/implementation.md). No commit or push was authorized.
- Test-first evidence: `corepack pnpm exec vitest run tests/unit/application-input.test.ts` failed 3 assertions against a placeholder implementation, then passed 3 after Zod validation. The browser confirmation test initially failed because the running Auth container had not applied the changed config; after data-preserving restart it passed. Database test-first red was not captured because the CLI was initially blocked before DB access.
- Final local checks (Windows, 2026-10-07): `corepack pnpm lint` pass; `corepack pnpm typecheck` pass; `corepack pnpm test:unit` 6/6 pass; `corepack pnpm test:db` 34/34 pass across two files (before the signup follow-up; no database files changed afterward); `corepack pnpm test:e2e` 5/5 pass with the configured one worker after the follow-up; `corepack pnpm build` pass after the follow-up. The earlier four-worker browser run timed out on all four tests; configuring one worker resolved the local resource contention. No remote CI or staging check is claimed.
- Follow-up test-first evidence: `corepack pnpm exec playwright test tests/e2e/applicant-applications.spec.ts --grep 'signup rejects'` timed out on the missing Confirm password field, then passed after the field and server-side comparison were added. The full browser suite passed 5/5. The local Supabase URL in `.env.local` was inspected without reading or recording keys; local mail goes to the mail viewer, not Gmail.
- Security review: implementer self-inspected RLS, function grants, draft privacy, edit cutoff and original snapshot; **independent security review pending**. No service-role key was added to app code.
- Human decision/date/source: user approved complete packet, 5,000-character limit and required email verification, then requested password confirmation in the 2026-10-07 chat. Feature acceptance remains pending.

## Session evidence and closeout

| Date/session | Summary | Verification |
| --- | --- | --- |
| 2026-10-07 planning | [Applicant application planning summary](../../../logs/2026-10-07-applicant-applications-planning.md) | Draft summary; student verification pending. |
| 2026-10-07 implementation | [Applicant application implementation summary](../../../logs/2026-10-07-applicant-applications-implementation.md) | Draft summary; student verification pending. |
| 2026-10-07 signup correction | [Signup correction summary](../../../logs/2026-10-07-signup-confirmation-followup.md) | Draft summary; student verification pending. |

Canonical sync commit/version, independent review artifact, acceptance, archive path, PR and deployment: **pending**. Local implementation evidence does not establish a release acceptance decision.
