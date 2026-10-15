# Tasks: complete collection reads

- Issue: [#70](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/70)
- Related review: [PR #69](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/69)
- Owner: John Wong

## Approved scope

- [x] Intake — user requested fixing the dashboard pagination finding and auditing/updating all applicable collection reads in this branch and PR on 2026-10-13.
- [x] Issue #70 — created and assigned to John Wong; no existing open pagination issue found.
- [x] Proposal/design/plan — bounded to paginating the six current collection reads; single-resource/action routes remain unchanged.

## Implementation

- [x] T01 — Add a focused HR jobs test with more than one page; baseline returned 500 rows when 501 were expected.
- [x] T02 — Add the shared range-page reader and deterministic pagination to all six collection functions.
- [x] T03 — Cover helper page boundaries and later-page errors; verify public jobs, Applicant, and HR list query integrations.
- [x] T04 — Complete the route and collection-read audit; record exact checks and limits in `api-audit.md` and the record.
- [x] T05 — Pushed implementation commit `30f2c6b` to the existing PR branch, replied to and resolved the P2 thread, and updated PR #69 to link issue #70 and record checks/limits.
- [x] T06 — Added a failing inter-page insert regression for the new offset-pagination finding, switched all six readers to stable UUID keysets, restored their prior timestamp/ID display order, and updated issue/design evidence.
- [x] T07 — Pushed keyset correction `9cfd0ab`, replied to and resolved the offset-pagination P2 thread, and updated PR #69 with both fixes and final check results.
- [x] T08 — Re-ran the full suite and static checks for the keyset source at PR head `fecf053`, corrected the revision-specific evidence, pushed `4c9cf64`, updated the PR check table, and replied to and resolved the P1 verification thread.
- [x] T09 — Verified the actual PR review-thread state, corrected the stale dashboard-P2 statement in `workflow/changes/README.md`, pushed `af41948`, replied to the new P2 comment, and confirmed its thread resolved.

## Gates and evidence

- [ ] Independent review — pending; implementation self-review is not independent.
- [ ] Student acceptance of this follow-up evidence — pending; the user authorized the work, but post-change acceptance is not inferred.
- [x] Canonical spec sync — N/A because no product requirement or interface changes.
