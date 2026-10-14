# #78 PR review follow-up: history result alignment

Issue: [#78](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/78). PR: [#79](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/79). Owner: Paul. Date: 14 October 2026. Branch: `feat/78-job-listing-search`; baseline `852af49`.

## Proposal and approval scope

The PR reviewer identified a delayed Back/Forward response that leaves the search controls reflecting the history destination while cards/count still reflect the previous server props. The reviewed #78 [approved design](../../archive/2026-10-14-job-listing-search/design.md) explicitly requires committed controls/results agreement during history and delayed responses. The [accepted JOB-004](../../specs/public-job-listings.md) requires safe invalid-query presentation and restoration. This is a repair of the already approved, accepted behavior; no new requirement, role, data access, schema or dependency is proposed. Paul supplied the exact reviewer finding for repair in this conversation. The earlier #78 approval and acceptance apply to this bounded correction; the follow-up review will independently verify its implementation.

## Design and plan

1. Reproduce the mismatch with a focused delayed Back/Forward browser scenario after reload, including a malformed search destination. Preserve actual red output.
2. Represent history restoration as pending until new server `initial` props arrive. While pending, announce loading and withhold old cards/count. On matching props, publish the destination controls and results together. Keep existing immediate/debounce/search/category behavior.
3. Add controller cases for restore/acknowledge and stale confirmation. Rerun focused browser, unit, typecheck, lint and build as needed for the changed code.
4. Obtain a separate independent review of the final repair, record findings and outcomes here. Update dated session evidence. Ask for separate student acceptance only if the correction changes approved behavior; otherwise keep the original #78 acceptance and identify the reviewed follow-up as a fix under that scope.
5. Commit/push the correction on the authorized #78 branch only when separately requested; an open PR does not authorize unrequested follow-up publication.

## Evidence and limits

- Reviewer trigger: PR #79 comment `discussion_r4265878022`, P2, supplied by Paul on 14 October 2026.
- Initial browser attempt was blocked by Docker/Supabase not running; after Paul started Docker, the containers were confirmed. A direct Back-after-reload test was unstable in local Next.js: it sometimes reverted the URL to `/` and never issued the intercepted RSC request. That run is **Failed as a test setup for the reported delayed response**, not evidence that the repair passed. Temporary request/state diagnostics were removed.
- A focused controller test reproduced the missing history-pending state before implementation: three assertions failed. The independent reviewer then found that different invalid destinations shared one key; a new unit regression failed before that repair. The server and client now derive distinct keys from the raw category and query, including repeated parameters. After both repairs, 47 focused unit tests passed across five files. `restore` marks history pending; nonmatching old props cannot clear it; matching `initial` acknowledges it; a newer Search supersedes the waiting target.
- The new Chromium scenario first waits for hydration, then simulates a same-document history event to an invalid query. It verifies pending announcement and no stale cards, then reloads to verify the invalid-query outcome. It is a browser UI regression, **not** a proof of delayed uncached Next RSC navigation. The existing actual Back/Forward browser scenario remains in the eight-case search suite. All eight search scenarios passed locally.
- Typecheck, scoped lint, Prettier, production build and `git diff --check` passed after the final repair. No hosted, cross-browser, full accessibility or actual uncached-RSC browser check was run. This limitation must remain visible for PR review.
- Other untracked packet `workflow/changes/2026-10-09-profile-resume/` is outside scope and must remain untouched.

## Review and publication

Independent read-only review by `/root/job_search_history_review` found a P2 invalid-destination key collision. The reviewer rechecked the regression and fix and found no remaining blocking source issue; they ran no checks. They also confirmed the browser evidence does not prove delayed uncached Next.js Back/Forward response handling. The original #78 student approval/acceptance covers the unchanged JOB-004 behavior. Paul separately requested commit and push of this follow-up on 14 October 2026.
