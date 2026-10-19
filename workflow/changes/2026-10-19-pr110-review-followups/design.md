# Design: PR #110 review follow-ups

- Change/issues: `2026-10-19-pr110-review-followups`; #115–#118
- Owner/status/date: Unassigned for triage; approved bounded repair / in progress / 2026-10-19
- Inputs: current `develop` at `3c9ba769f536679a3f546b5e5fbf5a254f059104`; APP-001/005/007/008/009/010; JMG-004; PR #110 threads
- Decision: separate architecture design is omitted because the repairs remain inside existing client components and pure server-side aggregation helpers; no schema, authorization, AI, storage, or external integration boundary changes.

## Existing data flow and bounded changes

- HR filters: merge each user update into a ref holding the latest intended filter parameters and build the URL from that merged state. The shared merge/equality/synchronization decisions live in a pure helper; the navigation hook owns transition and URL coordination. Resynchronize from server parameters only when no transition is pending and the parsed parameters match Next's current URL. Clearing filters resets both the query timer and intended parameter state.
- Pagination: preserve the current page when valid; when it exceeds the computed page count, use page 1, as APP-010 requires.
- Applicant draft revision: reconcile refreshed server props into attachment state through a pure helper. Adopt a new application identity and a newer same-application revision, while preserving a higher local revision. Do not alter action validation or retry semantics.
- Withdrawal: change only the confirmation wording so it distinguishes terminal withdrawal of this record from starting a separate application while a job remains open.
- Dashboard: pass schedule fields already returned by `listHRJobs` into the existing `getHROperationalJobStatus` helper. Use one `now` value per aggregate. Count operational `closed` as Closed; retain scheduled jobs in the existing Published total while labeling their per-job row Scheduled.
- Timezone review finding: already corrected on the baseline; no change planned.

## Boundaries and failure behavior

- HR route authorization and existing data access are unchanged.
- Applicant revision checks remain server-enforced; stale writes remain rejected.
- Dashboard status is a read-only derived value; it does not write job status.
- Only URLs built by the existing route helper are passed to `router.push`/`router.replace`.
- Rollback: revert the scoped implementation commit(s); no data migration is required.

## Design checks

- [x] Existing canonical behavior is restored without a new requirement or spec delta.
- [x] Applicant/HR permissions and data boundaries remain unchanged.
- [x] No database, storage, secret, prompt, deployment, or rollback migration is needed.
- [x] Focused tests cover filter merge/sync decisions and attachment revision reconciliation.
- [x] Independent reviewer checked the final test/helper follow-up and risk boundaries; the handoff records remaining test-coverage limits.
