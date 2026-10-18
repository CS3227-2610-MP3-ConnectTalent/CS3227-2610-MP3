# Implementation plan: Allow Applicants to Withdraw and Reapply

- Change/issues: `2026-10-16-applicant-withdraw-and-reapply`; [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90)
- Owner/status/date: John Wong (`Johnwz123`); approved by John Wong on 2026-10-16; 2026-10-16
- Approved inputs: `proposal.md`; `design.md`; `specs/applications-and-review.md`
- Baseline and affected IDs: ProductSpec v1.15 (`2a56ba1`); `APP-001`, `APP-008`; acceptance IDs `reapply-AC-01..05`
- Constraints: Maintain strict data retention (no row deletion), follow Conventional Commits, follow test-first development.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | None | Student John | Process | Proposal, deltas, design, plan | Human approval recorded in chat & record.md |
| T01 | T00 | Implementer | `APP-001`, `APP-008`; `reapply-AC-01..03` | `supabase/tests/database/reapply_after_withdrawal.test.sql` | pgTAP tests for partial unique index and reapplication after withdrawal |
| T02 | T01 | Implementer | `APP-001`, `APP-008`; `reapply-AC-01..03` | `supabase/migrations/20261016000000_applicant_reapply.sql` | Migration dropping table constraint, adding partial unique index, and updating `write_application_details_v3` |
| T03 | T02 | Implementer | `APP-001`; `reapply-AC-01` | `src/lib/applications.ts` | Update `getOwnApplicationForJob` to filter `withdrawn_at IS NULL` |
| T04 | T03 | Implementer | `APP-001`, `APP-008`; `reapply-AC-01..05` | `tests/unit/applications.test.ts`, `tests/unit/apply-page.test.tsx` | Unit tests verifying reapplication flow, draft prefill, and submission |
| T05 | T04 | Implementer | Quality gates | All changed files | `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` passing with exit 0 |
| T06 | T05 | Independent Reviewer | Review gate | Commit range | Subagent review, verification report in `handoffs/independent-review.md` |
| T07 | T06 | Student John | Acceptance gate | Packet & evidence | Human acceptance decision recorded in chat & record.md |
| T08 | T07 | Integration Lead | Process closeout | Canonical specs, ProductSpec, archive, logs | Canonical spec sync, ProductSpec v1.16 bump, packet archive, session log |
| T09 | T08 | Implementer | PR submission | Branch `feat/90-applicant-withdraw-and-reapply` | Open issue-linked PR to `develop` |

## Integration and handoffs

- Tasks follow strict sequential ordering. T00 (Human approval) must be completed before any implementation.
- T06 uses Independent Reviewer subagent to assess against `reapply-AC-01..05`.
- T07 requires separate student acceptance.
- Canonical specs are synced only after acceptance (T08).

## Approval and completion evidence

- [x] Human approved the proposal, deltas, design and plan before product implementation.
- [x] tasks.md matches the ordered work and states acceptance evidence for each checkbox.
- [x] Independent review and human acceptance are separate tasks with real decision evidence.
- [x] Closeout includes session logs and truthful limitations.
- [x] Contributor flow ends with issue-linked PR after closeout.
- Approval/date/source: Approved by student John Wong (`Johnwz123`) in chat on 2026-10-16.

