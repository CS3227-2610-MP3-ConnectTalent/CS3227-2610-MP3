# Plan: job-list loading follow-up

- Issue/change: #83, `2026-10-15-view-role-loading`
- Owner/status: Paul Cheng; approved for implementation on 15 October 2026
- Inputs: [proposal](proposal.md), [OVR-005 delta](specs/product-overview.md); design omitted because this reuses the existing link-status component and changes no data, trust boundary, route or architecture
- Branch: existing `feat/83-navigation-loading` (PR #85); no new branch

| Task | Files                                                                              | Test-first and verification evidence                                                                                                                                                          |
| ---- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01  | `tests/unit/navigation-loading.test.tsx`, `tests/e2e/navigation-loading.spec.ts`   | First observe failing checks for hidden duplicate status and delayed View role status/href; verify existing JOB-004 cases remain.                                                             |
| T02  | `src/components/job-listing-filters.tsx`, `src/components/job-listing-results.tsx` | Hide only the visual duplicate via `sr-only`; insert existing `PendingLinkStatus` as a descendant of the card `Link`; preserve layout and href.                                               |
| T03  | Focused tests and static checks                                                    | Rerun T01 plus related search/navigation regressions, typecheck, lint and format. Record exact passes/failures.                                                                               |
| T04  | Review, evidence and closeout                                                      | Separate read-only review, Paul's separate acceptance, canonical OVR-005 sync, packet archive and dated log before any authorized commit/push. Hosted checks remain pending unless performed. |

No Supabase migration, secrets, AI, private data, release or rollback operation is involved. Reverting the two component edits restores current presentation. Existing unrelated untracked files stay untouched. Expanded scope returns to approval.
