# Feature record: Applicant accounts and applications

Status: **accepted locally by Applicant owner on 2026-10-07; canonical v0.7 synced; full packet archived. PR, merge and release pending.**

Applicant owner: Paul Cheng for the full application process, confirmed in this conversation. The teammate owns AI features.

Spec baseline: [ProductSpec v0.6](../../ProductSpec.md), commit `0200eb9` on `develop` when drafted. Date: 2026-10-07.

## Metadata and artifacts

- Change ID/classification: `2026-10-07-applicant-applications`; implementation of ACC/APP baseline plus proposed ACC-001, APP-004 and SEC-001 product deltas. ACC-001 was added after the user's password-confirmation correction.
- Issue: [#6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6); merged prerequisite [PR #4](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/4); HR follow-up [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- Branch: `feat/6-applicant-applications`; starting commit `0200eb9`; implementation commit `f7ddb94` (current HEAD). The retry/race fixes and closeout are uncommitted. This branch tracks `origin/feat/6-applicant-applications`; no push or PR was made in this closeout turn.
- [Proposal](proposal.md), [ACC-001 delta](specs/accounts-and-roles.md), [APP-004 delta](specs/applications-and-review.md), [SEC-001 delta](specs/security-and-privacy.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [implementer handoff](handoffs/implementation.md), [independent review](handoffs/independent-review.md). Archive: `workflow/archive/2026-10-07-applicant-applications/` after completed move.
- Canonical IDs: ACC-001/002/003; APP-001/002/004; JMG-002/003; SEC-001/002/008; AID-002. Accepted ACC-001/APP-004/SEC-001 deltas are in ProductSpec v0.7.

## Decisions and gates

- [x] Issue #6 exists and was read for this packet; it was created before this branch.
- [x] User chose saved drafts between visits, submitted-letter editing until job closure, and preservation of the first submitted letter for HR in the 2026-10-07 conversation.
- [x] User confirmed Applicant process ownership, the 5,000-character bound and required email verification, then explicitly requested signup password confirmation on 2026-10-07. Teammate AI/revision integration remains a handoff.
- [x] User approved the complete proposal, deltas, design and plan on 2026-10-07 before implementation.
- [x] Implementation and local verification completed for issue #6 scope. Database red-first and full network-drop/browser retry remain evidence limits; HR status/logging and staging are separate work.
- [x] Independent read-only review and three findings/dispositions recorded in [handoff](handoffs/independent-review.md).
- [x] Separate human acceptance: Applicant owner Paul said on 2026-10-07 that the workflow works and instructed acceptance, accepted-spec sync and archive. This accepts the local Applicant slice with the listed limitations; it does not authorize merge or release.
- [x] Accepted ACC-001/APP-004/SEC-001 deltas synced into ProductSpec v0.7 and canonical capability specs dated 2026-10-07; complete packet archived with guides/reflections/logs updated. Sync commit pending a separate Git instruction.
- [ ] Final issue-linked PR opened after separate Git instruction and closeout.

The user's earlier approval authorized implementation. The later 2026-10-07 statement that the workflow works and explicit instruction to record acceptance supplies the separate local acceptance decision. Planning and implementation occurred in successive Codex turns; a separate read-only reviewer checked commit `f7ddb94` and the follow-up fixes. No Git submission or release approval follows from local acceptance.

## Acceptance map

| ID | Requirement | Expected evidence; observed result |
| --- | --- | --- |
| `app6-AC-01` | [ACC-001/002](../../specs/accounts-and-roles.md), [SEC-001](../../specs/security-and-privacy.md) | **Passed locally:** signup requires matching passwords and email verification in Playwright; pgTAP checks Applicant default and no profile update grant. |
| `app6-AC-02` | [APP-001](../../specs/applications-and-review.md), proposed APP-004 | **Passed locally:** browser saves/resumes draft and explicitly submits; pgTAP confirms draft state. |
| `app6-AC-03` | APP-001/APP-004 | **Passed locally:** unique constraint and duplicate pgTAP denial; separate-session race test observes a lock wait, rejects duplicate submit and leaves one row. |
| `app6-AC-04` | APP-001, [JMG-002/003](../../specs/job-management.md) | **Passed locally:** pgTAP denies draft/closed submissions and edits after closure; separate-session test observes both close-first and submit-first lock waits and checks final row state. |
| `app6-AC-05` | APP-002/APP-004, SEC-001/002 | **Passed locally:** browser denies second Applicant's direct URL; pgTAP checks owner, other Applicant, anonymous grant and HR draft visibility. |
| `app6-AC-06` | SEC-001/008 | **Partial by scope:** pgTAP denies profile writes and HR Applicant-function use; no HR status field exists yet. Source review found only generic form errors, but no full log/audit inspection. Synthetic fixtures used. HR status/audit follow-up belongs to #9. |
| `app6-AC-07` | APP-004 | **Passed locally:** browser edit retains original; pgTAP denies edit after closure and verifies original snapshot. |
| `app6-AC-08` | ACC-003, APP-001/002 | **Passed for bounded retry path:** anonymous/verified Applicant and cross-user browser flows; server-action unit test simulates uncertain RPC result, re-reads the owner row and displays already-submitted state. A literal dropped-network browser case was not run. |

The scenario details and required check types are in [proposal.md](proposal.md). Results above refer to the local test environment only.

## Handoffs, implementation and review

- Product analysis/design/plan: Codex in this conversation, based on issue #6, canonical v0.6 specs, existing jobs migration/query and user choices. No separately spawned analyst, architect or reviewer ran.
- Implementation: local Applicant migration, Supabase SSR auth/proxy/callback, signup/sign-in pages, application actions/reads/pages/form, and tests; see [implementer handoff](handoffs/implementation.md). Commit `f7ddb94` was separately authorized in the prior turn; this follow-up is uncommitted.
- Test-first evidence: `corepack pnpm exec vitest run tests/unit/application-input.test.ts` failed 3 assertions against a placeholder implementation, then passed 3 after Zod validation. The browser confirmation test initially failed because the running Auth container had not applied the changed config; after data-preserving restart it passed. Database test-first red was not captured because the CLI was initially blocked before DB access.
- Final local checks (Windows, 2026-10-07): `corepack pnpm lint` pass; `corepack pnpm typecheck` pass; `corepack pnpm test:unit` 11/11 pass; `corepack pnpm test:db` 34/34 pass across two files; `corepack pnpm test:e2e` 5/5 pass with one worker; `corepack pnpm test:race` pass across three lock-contention cases; `corepack pnpm build` pass before the test-only follow-up. The earlier four-worker browser run timed out on all four tests; configuring one worker resolved the local resource contention. No remote CI or staging check is claimed.
- Follow-up test-first evidence: `corepack pnpm exec playwright test tests/e2e/applicant-applications.spec.ts --grep 'signup rejects'` timed out on the missing Confirm password field, then passed after the field and server-side comparison were added. The full browser suite passed 5/5. The local Supabase URL in `.env.local` was inspected without reading or recording keys; local mail goes to the mail viewer, not Gmail.
- Independent security review: separate read-only Codex subagent `/root/independent_review` checked commit `f7ddb94` plus follow-up, including RLS, grants, database function boundaries, owner queries, retry and race checks. It found no confirmed permission bypass. F1 retry wording and F2 concurrent evidence were fixed and rechecked; F3 HR status remains outside #6. Reviewer could not rerun runtime checks in its sandbox; implementer results above are identified separately. See [review handoff](handoffs/independent-review.md).
- Retry follow-up: focused helper tests first failed against a placeholder and then passed; action unit tests exercise a failed RPC followed by owner/job-scoped read and a no-row failure. An attempted browser interception produced an unrelated page error and was removed; the normal browser suite passed afterward. The first lock-wait test using `psql -c` failed to establish contested sessions; streamed `psql -f -` with `pg_stat_activity` lock assertions passed all three scenarios.
- Human decision/date/source: Applicant owner Paul approved the complete packet, limit and verification, requested password confirmation, then stated on 2026-10-07 that the workflow works and instructed acceptance, accepted-spec sync and archive. This is local feature acceptance with stated scope limits; PR/merge/release are pending.

## Session evidence and closeout

| Date/session | Summary | Verification |
| --- | --- | --- |
| 2026-10-07 planning | [Applicant application planning summary](../../../logs/2026-10-07-applicant-applications-planning.md) | Draft summary; student verification pending. |
| 2026-10-07 implementation | [Applicant application implementation summary](../../../logs/2026-10-07-applicant-applications-implementation.md) | Draft summary; student verification pending. |
| 2026-10-07 signup correction | [Signup correction summary](../../../logs/2026-10-07-signup-confirmation-followup.md) | Draft summary; student verification pending. |
| 2026-10-07 independent review and closeout | [Review and closeout summary](../../../logs/2026-10-07-applicant-review-closeout.md) | Based on this turn; student verification of the written summary pending. |

Canonical sync: ProductSpec v0.7 dated 2026-10-07, including `workflow/specs/accounts-and-roles.md` ACC-001, `applications-and-review.md` APP-004 and `security-and-privacy.md` SEC-001. The three accepted deltas were compared clause by clause; IDs are unique and relative links were checked after moving the full packet. Sync/closeout commit is **pending separate Git instruction**. Archive: `workflow/archive/2026-10-07-applicant-applications/`. PR, merge, staging and deployment remain pending; local acceptance is not release acceptance.
